import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = await context.params

    // Verify festival ownership
    const festival = await prisma.festival.findFirst({
      where: {
        id: festivalId,
        userId: session.user.id,
      },
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    // Fetch analytics data
    const [
      totalViews,
      allEvents,
      sessionClickEvents
    ] = await Promise.all([
      // Count total schedule views
      prisma.analytics.count({
        where: {
          festivalId: festivalId,
          event: 'schedule_viewed',
        },
      }),
      // Get all events for unique visitor calculation
      prisma.analytics.findMany({
        where: {
          festivalId: festivalId,
        },
        select: {
          deviceId: true,
          event: true,
        },
      }),
      // Get session clicks
      prisma.analytics.findMany({
        where: {
          festivalId: festivalId,
          event: 'session_clicked',
        },
        select: {
          properties: true,
        },
      }),
    ])

    // Calculate unique visitors (based on all events, not just recent 20)
    const uniqueDeviceIds = new Set(
      allEvents.map((e) => e.deviceId).filter(Boolean)
    )

    // Calculate top sessions by click count
    const sessionClickCounts = new Map<string, number>()
    sessionClickEvents.forEach((event) => {
      const props = event.properties as any
      const sessionTitle = props?.sessionTitle || props?.title
      if (sessionTitle && typeof sessionTitle === 'string') {
        sessionClickCounts.set(
          sessionTitle, 
          (sessionClickCounts.get(sessionTitle) || 0) + 1
        )
      }
    })

    // Get top 3 sessions
    const topSessions = Array.from(sessionClickCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([title, clicks]) => ({ title, clicks }))

    // Calculate average session time (placeholder for now - would need start/end tracking)
    const avgSessionTime = '2:34'

    return NextResponse.json({
      totalViews,
      uniqueVisitors: uniqueDeviceIds.size,
      avgSessionTime,
      topSessions,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
