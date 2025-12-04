import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyNextInWaitlist } from '@/lib/waitlist'

/**
 * Cron job to process expired waitlist offers
 * 
 * When someone's offer expires without being claimed:
 * 1. Mark their entry as EXPIRED
 * 2. Notify the next person in line
 * 
 * This should run every 5 minutes via Vercel Cron
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // In production, require the secret. In dev, allow without it
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Find all expired offers
    const expiredOffers = await prisma.sessionWaitlist.findMany({
      where: {
        status: 'OFFERED',
        offerExpiresAt: {
          lt: new Date() // Expired
        }
      },
      include: {
        session: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    if (expiredOffers.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No expired offers to process',
        processed: 0
      })
    }

    console.log(`🕐 Processing ${expiredOffers.length} expired waitlist offers...`)

    const results = {
      expired: 0,
      notified: 0,
      errors: 0
    }

    for (const offer of expiredOffers) {
      try {
        // Mark as expired
        await prisma.sessionWaitlist.update({
          where: { id: offer.id },
          data: {
            status: 'EXPIRED',
            offerToken: null,
            offerExpiresAt: null
          }
        })
        
        results.expired++
        console.log(`⏰ Expired offer for ${offer.email} on "${offer.session.title}"`)

        // Notify the next person in line for this session
        const nextPerson = await notifyNextInWaitlist(offer.sessionId)
        
        if (nextPerson) {
          results.notified++
          console.log(`📧 Notified next in line: ${nextPerson.email}`)
        }
      } catch (error) {
        results.errors++
        console.error(`Failed to process expired offer ${offer.id}:`, error)
      }
    }

    console.log(`✅ Cron complete: ${results.expired} expired, ${results.notified} notified, ${results.errors} errors`)

    return NextResponse.json({
      success: true,
      message: `Processed ${expiredOffers.length} expired offers`,
      results
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to process expired offers' },
      { status: 500 }
    )
  }
}
