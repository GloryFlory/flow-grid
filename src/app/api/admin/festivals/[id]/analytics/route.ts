import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await context.params

    // Check festival access - any team member can view analytics
    const { error } = await requireFestivalAccess(festivalId)
    if (error) return error

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

    // Total session clicks
    const totalSessionClicks = sessionClickEvents.length

    return NextResponse.json({
      totalViews,
      uniqueVisitors: uniqueDeviceIds.size,
      totalSessionClicks,
      topSessions,
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
