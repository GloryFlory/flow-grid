import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Missing claim token' },
        { status: 400 }
      )
    }

    // Find the waitlist entry by token
    const waitlistEntry = await prisma.sessionWaitlist.findUnique({
      where: { offerToken: token },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            bookingCapacity: true,
            _count: {
              select: {
                bookings: true,
              },
            },
          },
        },
        festival: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    if (!waitlistEntry) {
      return NextResponse.json(
        { error: 'Invalid or expired claim link' },
        { status: 404 }
      )
    }

    // Check if offer has expired
    if (waitlistEntry.offerExpiresAt && new Date() > waitlistEntry.offerExpiresAt) {
      // Mark as expired and notify next person
      await prisma.sessionWaitlist.update({
        where: { id: waitlistEntry.id },
        data: { status: 'EXPIRED' },
      })

      return NextResponse.json(
        { error: 'This offer has expired. The spot has been offered to the next person on the waitlist.' },
        { status: 410 }
      )
    }

    // Check if already claimed
    if (waitlistEntry.status === 'CLAIMED') {
      return NextResponse.json(
        { error: 'You have already claimed this spot' },
        { status: 409 }
      )
    }

    // Check if status is not OFFERED
    if (waitlistEntry.status !== 'OFFERED') {
      return NextResponse.json(
        { error: 'This waitlist entry is not in an offered state' },
        { status: 400 }
      )
    }

    // Double-check there's still capacity
    const currentBookings = waitlistEntry.session._count.bookings
    const capacity = waitlistEntry.session.bookingCapacity || 0

    if (currentBookings >= capacity) {
      return NextResponse.json(
        { error: 'Sorry, the session is now full. This can happen if a spot was filled by another method.' },
        { status: 409 }
      )
    }

    // Create the booking and update waitlist status in a transaction
    const [booking] = await prisma.$transaction([
      prisma.booking.create({
        data: {
          sessionId: waitlistEntry.session.id,
          festivalId: waitlistEntry.festival.id,
          deviceId: waitlistEntry.deviceId,
          names: [waitlistEntry.name],
          email: waitlistEntry.email,
        },
      }),
      prisma.sessionWaitlist.update({
        where: { id: waitlistEntry.id },
        data: {
          status: 'CLAIMED',
          claimedAt: new Date(),
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: `You've successfully booked your spot in "${waitlistEntry.session.title}"!`,
      booking: {
        id: booking.id,
        sessionTitle: waitlistEntry.session.title,
        festivalName: waitlistEntry.festival.name,
      },
    })
  } catch (error) {
    console.error('Waitlist claim error:', error)
    return NextResponse.json(
      { error: 'Failed to claim spot' },
      { status: 500 }
    )
  }
}
