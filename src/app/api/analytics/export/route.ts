import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { PLAN_FEATURES } from '@/types'

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user has analytics export feature (Pro+ only)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { subscription: true }
  })

  const currentPlan = user?.subscription?.plan || 'FREE'
  const isAdmin = user?.role === 'ADMIN'
  const planFeatures = PLAN_FEATURES[currentPlan]
  
  if (!isAdmin && !planFeatures.analyticsExport) {
    return NextResponse.json(
      { error: 'Analytics export is a Pro feature. Please upgrade to continue.' },
      { status: 403 }
    )
  }

  const { searchParams } = new URL(request.url)
  const festivalId = searchParams.get('festivalId')

  // Build the where clause based on whether a specific festival is requested
  const festivalWhere = festivalId 
    ? { id: festivalId, userId: session.user.id }
    : { userId: session.user.id }

  try {
    // Fetch all analytics data for the user's festivals
    const [
      festivals,
      analyticsEvents,
      favourites,
      sessionClicks,
    ] = await Promise.all([
      // Get user's festivals
      prisma.festival.findMany({
        where: festivalWhere,
        select: {
          id: true,
          name: true,
          slug: true,
          isPublished: true,
          createdAt: true,
          _count: {
            select: {
              sessions: true,
            },
          },
        },
      }),
      // Get all analytics events
      prisma.analytics.findMany({
        where: {
          festival: festivalWhere,
        },
        select: {
          event: true,
          timestamp: true,
          properties: true,
          deviceId: true,
          festival: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      }),
      // Get favourites with session info
      prisma.sessionFavourite.findMany({
        where: {
          festival: festivalWhere,
        },
        include: {
          session: {
            select: {
              title: true,
              teachers: true,
            },
          },
          festival: {
            select: {
              name: true,
            },
          },
        },
      }),
      // Get session click counts
      prisma.analytics.groupBy({
        by: ['properties'],
        where: {
          festival: festivalWhere,
          event: 'session_clicked',
        },
        _count: true,
      }),
    ])

    // Calculate summary stats
    const pageViews = analyticsEvents.filter(e => e.event === 'schedule_viewed').length
    const uniqueDevices = new Set(analyticsEvents.filter(e => e.deviceId).map(e => e.deviceId)).size
    const totalClicks = analyticsEvents.filter(e => e.event === 'session_clicked').length
    const calendarExports = analyticsEvents.filter(e => e.event === 'calendar_exported').length

    // Build CSV content
    const lines: string[] = []
    
    // Summary Section
    lines.push('ANALYTICS EXPORT')
    lines.push(`Generated: ${new Date().toISOString()}`)
    lines.push('')
    lines.push('SUMMARY')
    lines.push(`Total Events,${festivals.length}`)
    lines.push(`Published Events,${festivals.filter(f => f.isPublished).length}`)
    lines.push(`Total Sessions,${festivals.reduce((acc, f) => acc + f._count.sessions, 0)}`)
    lines.push(`Total Page Views,${pageViews}`)
    lines.push(`Unique Visitors,${uniqueDevices}`)
    lines.push(`Session Clicks,${totalClicks}`)
    lines.push(`Favourites Saved,${favourites.length}`)
    lines.push(`Calendar Exports,${calendarExports}`)
    lines.push('')

    // Events breakdown
    lines.push('EVENTS')
    lines.push('Event Name,Slug,Published,Sessions,Created')
    festivals.forEach(f => {
      lines.push(`"${f.name}","${f.slug}",${f.isPublished ? 'Yes' : 'No'},${f._count.sessions},"${f.createdAt.toISOString()}"`)
    })
    lines.push('')

    // Page views by event
    lines.push('PAGE VIEWS BY EVENT')
    lines.push('Event Name,Views')
    const viewsByFestival: Record<string, number> = {}
    analyticsEvents
      .filter(e => e.event === 'schedule_viewed')
      .forEach(e => {
        const name = e.festival?.name || 'Unknown'
        viewsByFestival[name] = (viewsByFestival[name] || 0) + 1
      })
    Object.entries(viewsByFestival)
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        lines.push(`"${name}",${count}`)
      })
    lines.push('')

    // Top sessions by clicks
    lines.push('TOP SESSIONS BY CLICKS')
    lines.push('Session Title,Clicks')
    const sessionClickCounts: Record<string, { title: string; clicks: number }> = {}
    analyticsEvents
      .filter(e => e.event === 'session_clicked')
      .forEach(e => {
        const props = e.properties as { sessionId?: string; sessionTitle?: string } | null
        if (props?.sessionId) {
          const id = props.sessionId
          if (!sessionClickCounts[id]) {
            sessionClickCounts[id] = { title: props.sessionTitle || 'Unknown', clicks: 0 }
          }
          sessionClickCounts[id].clicks++
        }
      })
    Object.values(sessionClickCounts)
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 20)
      .forEach(s => {
        lines.push(`"${s.title}",${s.clicks}`)
      })
    lines.push('')

    // Favourites
    lines.push('FAVOURITES')
    lines.push('Event,Session,Teachers,Saved At')
    favourites.forEach(f => {
      const teachers = f.session?.teachers?.join(', ') || ''
      lines.push(`"${f.festival?.name || 'Unknown'}","${f.session?.title || 'Unknown'}","${teachers}","${f.createdAt.toISOString()}"`)
    })
    lines.push('')

    // View mode breakdown
    lines.push('VIEW MODE USAGE')
    lines.push('Mode,Count')
    const viewModes: Record<string, number> = { cards: 0, grid: 0, mySchedule: 0 }
    analyticsEvents
      .filter(e => e.event === 'view_mode_changed')
      .forEach(e => {
        const props = e.properties as { mode?: string } | null
        if (props?.mode && viewModes[props.mode] !== undefined) {
          viewModes[props.mode]++
        }
      })
    Object.entries(viewModes).forEach(([mode, count]) => {
      lines.push(`${mode},${count}`)
    })
    lines.push('')

    // Calendar export breakdown
    lines.push('CALENDAR EXPORTS')
    lines.push('Method,Count')
    const calendarMethods: Record<string, number> = { ics: 0, google: 0 }
    analyticsEvents
      .filter(e => e.event === 'calendar_exported')
      .forEach(e => {
        const props = e.properties as { method?: string } | null
        if (props?.method && calendarMethods[props.method] !== undefined) {
          calendarMethods[props.method]++
        }
      })
    Object.entries(calendarMethods).forEach(([method, count]) => {
      lines.push(`${method},${count}`)
    })
    lines.push('')

    // Raw events log (last 100)
    lines.push('RECENT EVENTS (Last 100)')
    lines.push('Timestamp,Event Type,Event Name,Details')
    analyticsEvents.slice(0, 100).forEach(e => {
      const details = e.properties ? JSON.stringify(e.properties).replace(/"/g, '""') : ''
      lines.push(`"${e.timestamp.toISOString()}","${e.event}","${e.festival?.name || 'Unknown'}","${details}"`)
    })

    const csv = lines.join('\n')

    // Build filename based on whether it's a single festival or all
    const festivalSlug = festivals.length === 1 ? festivals[0].slug : null
    const filename = festivalSlug 
      ? `flowgrid-${festivalSlug}-analytics-${new Date().toISOString().split('T')[0]}.csv`
      : `flowgrid-analytics-${new Date().toISOString().split('T')[0]}.csv`

    // Return as downloadable CSV
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Analytics export error:', error)
    return NextResponse.json({ error: 'Failed to export analytics' }, { status: 500 })
  }
}
