import { prisma } from '@/lib/prisma'
import { sendWaitlistSpotEmail } from '@/lib/email'
import { nanoid } from 'nanoid'

/**
 * Calculate dynamic offer expiry based on how soon the session starts
 */
export function calculateOfferExpiry(sessionStartTime: Date): Date {
  const now = new Date()
  const timeUntilSession = sessionStartTime.getTime() - now.getTime()
  const hoursUntilSession = timeUntilSession / (1000 * 60 * 60)

  let expiryHours: number
  if (hoursUntilSession <= 1) {
    expiryHours = 0.5 // 30 minutes
  } else if (hoursUntilSession <= 6) {
    expiryHours = 1 // 1 hour
  } else if (hoursUntilSession <= 24) {
    expiryHours = 2 // 2 hours
  } else if (hoursUntilSession <= 168) { // 7 days
    expiryHours = 6 // 6 hours
  } else {
    expiryHours = 24 // 24 hours
  }

  return new Date(now.getTime() + expiryHours * 60 * 60 * 1000)
}

/**
 * Format expiry time for email
 */
export function formatExpiryTime(expiresAt: Date): string {
  const now = new Date()
  const diffMs = expiresAt.getTime() - now.getTime()
  const diffMins = Math.round(diffMs / (1000 * 60))
  
  if (diffMins < 60) {
    return `${diffMins} minutes`
  } else {
    const hours = Math.round(diffMins / 60)
    return hours === 1 ? '1 hour' : `${hours} hours`
  }
}

/**
 * Notify the next person on the waitlist when a spot opens
 */
export async function notifyNextInWaitlist(sessionId: string) {
  // Get session info for email, including owner's subscription status and branding
  const session = await prisma.festivalSession.findUnique({
    where: { id: sessionId },
    include: {
      festival: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          primaryColor: true,
          accentColor: true,
          user: {
            select: {
              subscription: {
                select: {
                  plan: true,
                  status: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!session) {
    console.error('Session not found:', sessionId)
    return null
  }

  // Check if festival owner has Pro subscription
  const isPro = session.festival.user?.subscription?.plan === 'PRO' && 
                session.festival.user?.subscription?.status === 'ACTIVE'

  // Check if there's still space
  const bookingCount = await prisma.booking.count({
    where: { sessionId },
  })

  if (session.bookingCapacity && bookingCount >= session.bookingCapacity) {
    console.log('Session is still full, not notifying waitlist')
    return null
  }

  // Get the next person on the waitlist
  const nextInLine = await prisma.sessionWaitlist.findFirst({
    where: {
      sessionId,
      status: 'WAITING',
    },
    orderBy: {
      position: 'asc',
    },
  })

  if (!nextInLine) {
    console.log('No one on waitlist for session:', sessionId)
    return null
  }

  // Parse session date/time for expiry calculation
  const sessionDate = new Date(`${session.day} ${session.startTime}`)
  const expiresAt = calculateOfferExpiry(sessionDate)
  const offerToken = nanoid(32)

  // Update waitlist entry with offer
  await prisma.sessionWaitlist.update({
    where: { id: nextInLine.id },
    data: {
      status: 'OFFERED',
      offerToken,
      offerExpiresAt: expiresAt,
      offeredAt: new Date(),
    },
  })

  // Build claim URL
  const baseUrl = process.env.NEXTAUTH_URL || 'https://tryflowgrid.com'
  const claimUrl = `${baseUrl}/${session.festival.slug}/claim-spot?token=${offerToken}`

  // Send email notification
  try {
    await sendWaitlistSpotEmail({
      to: nextInLine.email,
      userName: nextInLine.name,
      sessionTitle: session.title,
      sessionDate: session.day,
      sessionTime: `${session.startTime} - ${session.endTime}`,
      festivalName: session.festival.name,
      festivalLogo: session.festival.logo || undefined,
      primaryColor: session.festival.primaryColor,
      accentColor: session.festival.accentColor,
      claimUrl,
      expiresIn: formatExpiryTime(expiresAt),
      isPro, // White-label for Pro users
    })

    console.log(`✅ Waitlist notification sent to ${nextInLine.email} for "${session.title}"`)
    return nextInLine
  } catch (error) {
    console.error('Failed to send waitlist notification email:', error)
    // Revert the status if email fails
    await prisma.sessionWaitlist.update({
      where: { id: nextInLine.id },
      data: {
        status: 'WAITING',
        offerToken: null,
        offerExpiresAt: null,
        offeredAt: null,
      },
    })
    throw error
  }
}

/**
 * Process expired waitlist offers and notify next person
 * This should be called by a cron job periodically
 */
export async function processExpiredOffers() {
  const expiredOffers = await prisma.sessionWaitlist.findMany({
    where: {
      status: 'OFFERED',
      offerExpiresAt: {
        lt: new Date(),
      },
    },
  })

  console.log(`Processing ${expiredOffers.length} expired waitlist offers`)

  for (const offer of expiredOffers) {
    // Mark as expired
    await prisma.sessionWaitlist.update({
      where: { id: offer.id },
      data: { status: 'EXPIRED' },
    })

    // Notify next person
    await notifyNextInWaitlist(offer.sessionId)
  }

  return expiredOffers.length
}
