/**
 * GET /api/dashboard/[slug]/analytics
 * 
 * Returns comprehensive analytics data for a festival
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface HourlyData {
  hour: number
  views: number
}

interface DailyData {
  date: string
  views: number
  clicks: number
  favourites: number
}

interface PopularSession {
  id: string
  title: string
  clicks: number
  favourites: number
  bookings: number
}

interface PopularTeacher {
  name: string
  clicks: number
}

interface ViewModeStats {
  cards: number
  grid: number
  mySchedule: number
}

interface CalendarExportStats {
  total: number
  byMethod: {
    icsDownload: number
    googleCalendar: number
  }
  byType: {
    singleSession: number
    singleDay: number
    fullSchedule: number
  }
}

interface FilterUsageStats {
  totalUses: number
  byFilter: Record<string, number>
  topValues: Record<string, { value: string; count: number }[]>
}

export interface FestivalAnalytics {
  overview: {
    totalViews: number
    uniqueVisitors: number
    totalClicks: number
    totalFavourites: number
    totalBookings: number
    averageSessionsPerUser: number
  }
  trends: {
    hourly: HourlyData[]
    daily: DailyData[]
  }
  popular: {
    sessions: PopularSession[]
    teachers: PopularTeacher[]
  }
  engagement: {
    viewModes: ViewModeStats
    calendarExports: CalendarExportStats
    filterUsage: FilterUsageStats
    conversionRate: number // favourites/views percentage
    bookingRate: number // bookings/views percentage
  }
  period: {
    start: string
    end: string
    days: number
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const range = searchParams.get('range')
    
    // Convert range param to days
    let effectiveDays = days
    if (range) {
      switch (range) {
        case '24h': effectiveDays = 1; break
        case '7d': effectiveDays = 7; break
        case '30d': effectiveDays = 30; break
        case 'all': effectiveDays = 365 * 10; break // 10 years
      }
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    const isAdmin = user?.role === 'ADMIN'

    // Get festival and verify ownership (or admin access) - support both ID and slug lookup
    const festival = await prisma.festival.findFirst({
      where: {
        OR: [
          { id: slug },
          { slug: slug }
        ],
        // Admins can access any festival, others only their own
        ...(isAdmin ? {} : { userId: session.user.id })
      }
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - effectiveDays)
    startDate.setHours(0, 0, 0, 0)

    // Fetch all analytics events for this festival
    const events = await prisma.analytics.findMany({
      where: {
        festivalId: festival.id,
        timestamp: { gte: startDate }
      },
      orderBy: { timestamp: 'asc' }
    })

    // Calculate overview metrics
    const viewEvents = events.filter(e => e.event === 'schedule_viewed')
    const clickEvents = events.filter(e => e.event === 'session_clicked')
    const favouriteEvents = events.filter(e => e.event === 'session_favourited')
    const unfavouriteEvents = events.filter(e => e.event === 'session_unfavourited')
    const viewModeEvents = events.filter(e => e.event === 'view_mode_changed')
    const calendarEvents = events.filter(e => e.event === 'calendar_exported')
    const teacherEvents = events.filter(e => e.event === 'teacher_clicked')
    const filterEvents = events.filter(e => e.event === 'filter_used')

    // Get unique visitors by deviceId
    const uniqueDevices = new Set(viewEvents.map(e => e.deviceId).filter(Boolean))

    // Get favourites count (current state)
    const currentFavourites = await prisma.sessionFavourite.count({
      where: { festivalId: festival.id }
    })

    // Get bookings count
    const bookingsCount = await prisma.booking.count({
      where: {
        festivalId: festival.id
      }
    })

    // Calculate hourly breakdown
    const hourlyViews: number[] = new Array(24).fill(0)
    viewEvents.forEach(e => {
      const hour = e.timestamp.getHours()
      hourlyViews[hour]++
    })

    // Calculate daily breakdown
    const dailyData: Record<string, { views: number; clicks: number; favourites: number }> = {}
    
    for (let i = 0; i < effectiveDays; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      dailyData[dateStr] = { views: 0, clicks: 0, favourites: 0 }
    }

    viewEvents.forEach(e => {
      const dateStr = e.timestamp.toISOString().split('T')[0]
      if (dailyData[dateStr]) dailyData[dateStr].views++
    })

    clickEvents.forEach(e => {
      const dateStr = e.timestamp.toISOString().split('T')[0]
      if (dailyData[dateStr]) dailyData[dateStr].clicks++
    })

    favouriteEvents.forEach(e => {
      const dateStr = e.timestamp.toISOString().split('T')[0]
      if (dailyData[dateStr]) dailyData[dateStr].favourites++
    })

    // Get popular sessions
    const sessionClicks: Record<string, { title: string; clicks: number }> = {}
    clickEvents.forEach(e => {
      const props = e.properties as any
      if (props?.sessionId) {
        if (!sessionClicks[props.sessionId]) {
          sessionClicks[props.sessionId] = { title: props.sessionTitle || 'Unknown', clicks: 0 }
        }
        sessionClicks[props.sessionId].clicks++
      }
    })

    // Get session favourites
    const sessionFavourites = await prisma.sessionFavourite.groupBy({
      by: ['sessionId'],
      where: { festivalId: festival.id },
      _count: { sessionId: true }
    })

    // Get session bookings
    const sessionBookings = await prisma.booking.groupBy({
      by: ['sessionId'],
      where: {
        festivalId: festival.id
      },
      _count: true
    })

    // Combine popular sessions data
    const allSessionIds = new Set([
      ...Object.keys(sessionClicks),
      ...sessionFavourites.map((f: { sessionId: string }) => f.sessionId),
      ...sessionBookings.map((b: { sessionId: string }) => b.sessionId)
    ])

    const popularSessions: PopularSession[] = []
    for (const sessionId of allSessionIds) {
      const sessionData = await prisma.festivalSession.findUnique({
        where: { id: sessionId },
        select: { id: true, title: true }
      })
      if (sessionData) {
        const favCount = sessionFavourites.find((f: { sessionId: string; _count: { sessionId: number } }) => f.sessionId === sessionId)?._count.sessionId || 0
        const bookCount = sessionBookings.find((b: { sessionId: string; _count: number }) => b.sessionId === sessionId)?._count || 0
        
        popularSessions.push({
          id: sessionId,
          title: sessionData.title,
          clicks: sessionClicks[sessionId]?.clicks || 0,
          favourites: favCount,
          bookings: bookCount
        })
      }
    }

    // Sort by total engagement
    popularSessions.sort((a, b) => 
      (b.clicks + b.favourites * 2 + b.bookings * 3) - 
      (a.clicks + a.favourites * 2 + a.bookings * 3)
    )

    // Get popular teachers
    const teacherClicks: Record<string, number> = {}
    teacherEvents.forEach(e => {
      const props = e.properties as any
      if (props?.teacherName) {
        teacherClicks[props.teacherName] = (teacherClicks[props.teacherName] || 0) + 1
      }
    })

    const popularTeachers: PopularTeacher[] = Object.entries(teacherClicks)
      .map(([name, clicks]) => ({ name, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // View mode stats
    const viewModeStats: ViewModeStats = { cards: 0, grid: 0, mySchedule: 0 }
    viewModeEvents.forEach(e => {
      const props = e.properties as any
      if (props?.viewMode === 'cards') viewModeStats.cards++
      if (props?.viewMode === 'grid') viewModeStats.grid++
      if (props?.viewMode === 'my-schedule') viewModeStats.mySchedule++
    })

    // Calendar export stats
    const calendarStats: CalendarExportStats = {
      total: calendarEvents.length,
      byMethod: { icsDownload: 0, googleCalendar: 0 },
      byType: { singleSession: 0, singleDay: 0, fullSchedule: 0 }
    }
    calendarEvents.forEach(e => {
      const props = e.properties as any
      if (props?.method === 'ics_download') calendarStats.byMethod.icsDownload++
      if (props?.method === 'google_calendar') calendarStats.byMethod.googleCalendar++
      if (props?.exportType === 'single_session') calendarStats.byType.singleSession++
      if (props?.exportType === 'single_day') calendarStats.byType.singleDay++
      if (props?.exportType === 'full_schedule') calendarStats.byType.fullSchedule++
    })

    // Filter usage stats
    const filterUsage: FilterUsageStats = {
      totalUses: filterEvents.length,
      byFilter: {},
      topValues: {}
    }
    filterEvents.forEach(e => {
      const props = e.properties as any
      if (props?.filterType) {
        filterUsage.byFilter[props.filterType] = (filterUsage.byFilter[props.filterType] || 0) + 1
        
        if (!filterUsage.topValues[props.filterType]) {
          filterUsage.topValues[props.filterType] = []
        }
        const existing = filterUsage.topValues[props.filterType].find(v => v.value === props.filterValue)
        if (existing) {
          existing.count++
        } else {
          filterUsage.topValues[props.filterType].push({ value: props.filterValue, count: 1 })
        }
      }
    })
    // Sort top values
    Object.keys(filterUsage.topValues).forEach(key => {
      filterUsage.topValues[key].sort((a, b) => b.count - a.count)
      filterUsage.topValues[key] = filterUsage.topValues[key].slice(0, 5)
    })

    // Calculate conversion rates
    const conversionRate = viewEvents.length > 0 
      ? Math.round((favouriteEvents.length / viewEvents.length) * 100 * 10) / 10
      : 0

    const bookingRate = viewEvents.length > 0
      ? Math.round((bookingsCount / viewEvents.length) * 100 * 10) / 10
      : 0

    // Average sessions per user (for users who have favourites)
    const uniqueFavouriteUsers = await prisma.sessionFavourite.groupBy({
      by: ['anonUserId'],
      where: { festivalId: festival.id },
      _count: { sessionId: true }
    })
    const avgSessionsPerUser = uniqueFavouriteUsers.length > 0
      ? Math.round((currentFavourites / uniqueFavouriteUsers.length) * 10) / 10
      : 0

    const analytics: FestivalAnalytics = {
      overview: {
        totalViews: viewEvents.length,
        uniqueVisitors: uniqueDevices.size,
        totalClicks: clickEvents.length,
        totalFavourites: currentFavourites,
        totalBookings: bookingsCount,
        averageSessionsPerUser: avgSessionsPerUser
      },
      trends: {
        hourly: hourlyViews.map((views, hour) => ({ hour, views })),
        daily: Object.entries(dailyData).map(([date, data]) => ({
          date,
          ...data
        }))
      },
      popular: {
        sessions: popularSessions.slice(0, 10),
        teachers: popularTeachers
      },
      engagement: {
        viewModes: viewModeStats,
        calendarExports: calendarStats,
        filterUsage,
        conversionRate,
        bookingRate
      },
      period: {
        start: startDate.toISOString(),
        end: new Date().toISOString(),
        days: effectiveDays
      }
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
