import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = params

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
    const [totalViews, recentEvents] = await Promise.all([
      prisma.analytics.count({
        where: {
          festivalId: festivalId,
        },
      }),
      prisma.analytics.findMany({
        where: {
          festivalId: festivalId,
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: 20,
      }),
    ])

    // Calculate session clicks
    const sessionClicks = recentEvents.filter(
      (e) => e.event === 'session_click' || e.event === 'session_view'
    ).length

    // Calculate unique visitors (simplified - based on unique deviceIds)
    const uniqueDeviceIds = new Set(
      recentEvents.map((e) => e.deviceId).filter(Boolean)
    )

    // Calculate average session time (placeholder)
    const avgSessionTime = '2:34'

    return NextResponse.json({
      totalViews,
      sessionClicks,
      uniqueVisitors: uniqueDeviceIds.size,
      avgSessionTime,
      recentEvents: recentEvents.map((e) => ({
        id: e.id,
        event: e.event,
        timestamp: e.timestamp,
        properties: e.properties,
      })),
    })
  } catch (error) {
    console.error('Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
