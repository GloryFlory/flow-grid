import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    const userFilter = { festival: { userId: session.user.id } }

    const [
      subscribersByPage,
      recentSignups,
      previousSignups,
      totalBookings,
      totalFavourites,
      totalWaitlisted,
      upcomingFestivals,
      sessionsWithBookings,
    ] = await Promise.race([
      Promise.all([
        // Landing page signups grouped by page (for total + active pages count)
        prisma.webinarSubscriber.groupBy({
          by: ['landingPageId'],
          where: { unsubscribedAt: null, ...userFilter },
          _count: { id: true },
        }),
        // Signups last 30 days
        prisma.webinarSubscriber.count({
          where: { createdAt: { gte: thirtyDaysAgo }, unsubscribedAt: null, ...userFilter },
        }),
        // Signups 30–60 days ago (for trend comparison)
        prisma.webinarSubscriber.count({
          where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }, unsubscribedAt: null, ...userFilter },
        }),
        // Total confirmed bookings
        prisma.booking.count({
          where: { festival: { userId: session.user.id } },
        }),
        // Total session saves/favourites
        prisma.sessionFavourite.count({
          where: { festival: { userId: session.user.id } },
        }),
        // Total people currently on session waitlists
        prisma.sessionWaitlist.count({
          where: { status: 'WAITING', festival: { userId: session.user.id } },
        }),
        // Upcoming festivals (startDate in the future)
        prisma.festival.findMany({
          where: { userId: session.user.id, isPublished: true, startDate: { gte: now } },
          select: { id: true, name: true, startDate: true, endDate: true, slug: true },
          orderBy: { startDate: 'asc' },
          take: 5,
        }),
        // Sessions with booking data to detect near-capacity ones
        prisma.festivalSession.findMany({
          where: {
            festival: { userId: session.user.id },
            bookingEnabled: true,
            bookingCapacity: { gt: 0 },
          },
          select: {
            id: true,
            title: true,
            bookingCapacity: true,
            festivalId: true,
            festival: { select: { name: true } },
            _count: { select: { bookings: true } },
          },
        }),
      ]),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Query timeout')), 5000)
      ),
    ])

    const totalSubscribers = subscribersByPage.reduce((sum, row) => sum + row._count.id, 0)

    // Sessions at ≥75% capacity
    const nearCapacitySessions = sessionsWithBookings
      .filter(s => s.bookingCapacity && s._count.bookings / s.bookingCapacity >= 0.75)
      .map(s => ({
        id: s.id,
        title: s.title,
        festivalId: s.festivalId,
        festivalName: s.festival.name,
        booked: s._count.bookings,
        capacity: s.bookingCapacity as number,
        pct: Math.round((s._count.bookings / (s.bookingCapacity as number)) * 100),
      }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 5)

    return NextResponse.json({
      // Signups
      totalSubscribers,
      recentSignups,
      previousPeriodSignups: previousSignups,
      activePagesWithSubscribers: subscribersByPage.length,
      // Guest activity funnel
      totalBookings,
      totalFavourites,
      totalWaitlisted,
      // Upcoming
      upcomingFestivals,
      // Capacity alerts
      nearCapacitySessions,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({
      totalSubscribers: 0,
      recentSignups: 0,
      previousPeriodSignups: 0,
      activePagesWithSubscribers: 0,
      totalBookings: 0,
      totalFavourites: 0,
      totalWaitlisted: 0,
      upcomingFestivals: [],
      nearCapacitySessions: [],
    })
  }
}
