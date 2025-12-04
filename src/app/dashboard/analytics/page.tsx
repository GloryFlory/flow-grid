import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BarChart3, Calendar, Users, Eye, TrendingUp, Clock, Heart, Download, MousePointerClick, Layers, Grid3X3, CalendarDays, Star } from 'lucide-react'
import Link from 'next/link'

import { ExportAnalyticsButton } from '@/components/dashboard/ExportAnalyticsButton'

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Date ranges for analytics
  const last7Days = new Date()
  last7Days.setDate(last7Days.getDate() - 7)
  
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  // Fetch analytics data
  const [
    festivals, 
    totalSessions, 
    totalBookings, 
    recentEvents,
    totalFavourites,
    totalPageViews,
    last7DaysViews,
    totalClicks,
    calendarExports,
    viewModeEvents,
    calendarExportEvents,
    sessionClickEvents
  ] = await Promise.all([
    prisma.festival.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        slug: true,
        isPublished: true,
        _count: {
          select: {
            sessions: true,
            bookings: true,
          },
        },
      },
    }),
    prisma.festivalSession.count({
      where: {
        festival: {
          userId: session.user.id,
        },
      },
    }),
    prisma.booking.count({
      where: {
        festival: {
          userId: session.user.id,
        },
      },
    }),
    prisma.analytics.findMany({
      where: {
        festival: {
          userId: session.user.id,
        },
      },
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: {
        festival: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    }),
    prisma.sessionFavourite.count({
      where: {
        festival: {
          userId: session.user.id,
        },
      },
    }),
    prisma.analytics.count({
      where: {
        festival: { userId: session.user.id },
        event: 'schedule_viewed',
      },
    }),
    prisma.analytics.count({
      where: {
        festival: { userId: session.user.id },
        event: 'schedule_viewed',
        timestamp: { gte: last7Days },
      },
    }),
    prisma.analytics.count({
      where: {
        festival: { userId: session.user.id },
        event: 'session_clicked',
      },
    }),
    prisma.analytics.count({
      where: {
        festival: { userId: session.user.id },
        event: 'calendar_exported',
      },
    }),
    // Get all view mode events to parse
    prisma.analytics.findMany({
      where: {
        festival: { userId: session.user.id },
        event: 'view_mode_changed',
      },
      select: { properties: true },
    }),
    // Get all calendar export events to parse
    prisma.analytics.findMany({
      where: {
        festival: { userId: session.user.id },
        event: 'calendar_exported',
      },
      select: { properties: true },
    }),
    // Get session click events for top sessions
    prisma.analytics.findMany({
      where: {
        festival: { userId: session.user.id },
        event: 'session_clicked',
      },
      select: { properties: true },
    }),
  ])

  // Parse view mode counts from properties JSON
  const viewModeCounts = { cards: 0, grid: 0, mySchedule: 0 }
  viewModeEvents.forEach(e => {
    const props = e.properties as { mode?: string } | null
    if (props?.mode === 'cards') viewModeCounts.cards++
    else if (props?.mode === 'grid') viewModeCounts.grid++
    else if (props?.mode === 'mySchedule') viewModeCounts.mySchedule++
  })

  // Parse calendar export breakdown
  const calendarBreakdown = { ics: 0, google: 0 }
  calendarExportEvents.forEach(e => {
    const props = e.properties as { method?: string } | null
    if (props?.method === 'ics') calendarBreakdown.ics++
    else if (props?.method === 'google') calendarBreakdown.google++
  })

  // Parse top sessions by clicks
  const sessionClickCounts: Record<string, { id: string; title: string; clicks: number }> = {}
  sessionClickEvents.forEach(e => {
    const props = e.properties as { sessionId?: string; sessionTitle?: string } | null
    if (props?.sessionId) {
      if (!sessionClickCounts[props.sessionId]) {
        sessionClickCounts[props.sessionId] = {
          id: props.sessionId,
          title: props.sessionTitle || 'Unknown',
          clicks: 0,
        }
      }
      sessionClickCounts[props.sessionId].clicks++
    }
  })
  const topSessions = Object.values(sessionClickCounts)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)

  // Estimate unique visitors from schedule views with deviceId
  const scheduleViewEvents = await prisma.analytics.findMany({
    where: {
      festival: { userId: session.user.id },
      event: 'schedule_viewed',
      deviceId: { not: null },
    },
    select: { deviceId: true },
    distinct: ['deviceId'],
  })
  const uniqueVisitors = scheduleViewEvents.length

  const publishedCount = festivals.filter((f: { isPublished: boolean }) => f.isPublished).length
  const draftCount = festivals.length - publishedCount

  // Calculate some basic stats
  const totalEvents = recentEvents.length
  const eventTypes = [...new Set(recentEvents.map((e: { event: string }) => e.event))]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your events' performance and engagement</p>
          </div>
          <ExportAnalyticsButton />
        </div>

        {/* Key Metrics Grid - Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Page Views */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Page Views</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalPageViews.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {last7DaysViews.toLocaleString()} in last 7 days
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Unique Visitors */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{uniqueVisitors.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Distinct devices</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Session Clicks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Session Clicks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Total interactions</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <MousePointerClick className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Total Favourites */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favourites</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalFavourites.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Sessions saved by visitors</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Calendar Exports */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Calendar Exports</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{calendarExports.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">ICS & Google Calendar</p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>

          {/* Total Events */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{festivals.length}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {publishedCount} published, {draftCount} draft
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          {/* Total Sessions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalSessions}</p>
                <p className="text-xs text-gray-500 mt-1">Across all events</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          {/* Total Bookings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalBookings}</p>
                <p className="text-xs text-gray-500 mt-1">RSVP reservations</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement Rate</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {totalPageViews > 0 ? ((totalFavourites / totalPageViews) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-gray-500 mt-1">Favourites / Views</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Event Performance Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Event Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Overview of all your events</p>
          </div>
          <div className="overflow-x-auto">
            {festivals.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No events created yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bookings
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {festivals.map((festival) => (
                    <tr key={festival.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{festival.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          festival.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {festival.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{festival._count.sessions}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-900">{festival._count.bookings}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Link 
                          href={`/dashboard/festivals/${festival.id}/analytics`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          View Details →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Engagement Insights Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* View Mode Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              View Mode Usage
            </h3>
            {(viewModeCounts.cards + viewModeCounts.grid + viewModeCounts.mySchedule) === 0 ? (
              <p className="text-gray-500 text-sm">No view mode data yet</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Cards View</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{viewModeCounts.cards}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">Grid View</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{viewModeCounts.grid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">My Schedule</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{viewModeCounts.mySchedule}</span>
                </div>
              </div>
            )}
          </div>

          {/* Top Sessions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Top Sessions
            </h3>
            {topSessions.length === 0 ? (
              <p className="text-gray-500 text-sm">No session clicks yet</p>
            ) : (
              <div className="space-y-3">
                {topSessions.map((session, idx) => (
                  <div key={session.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="text-xs font-medium text-gray-400 w-4">{idx + 1}.</span>
                      <span className="text-sm text-gray-700 truncate">{session.title}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 ml-2">{session.clicks} clicks</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar Export Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              Calendar Exports
            </h3>
            {(calendarBreakdown.ics + calendarBreakdown.google) === 0 ? (
              <p className="text-gray-500 text-sm">No calendar exports yet</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">ICS Download</span>
                    <span className="text-sm font-medium text-gray-900">{calendarBreakdown.ics}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full" 
                      style={{ width: `${calendarExports > 0 ? (calendarBreakdown.ics / calendarExports) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">Google Calendar</span>
                    <span className="text-sm font-medium text-gray-900">{calendarBreakdown.google}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${calendarExports > 0 ? (calendarBreakdown.google / calendarExports) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <p className="text-sm text-gray-600 mt-1">Latest events tracked across your festivals</p>
          </div>
          <div className="p-6">
            {recentEvents.length === 0 ? (
              <div className="text-center py-8">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No activity events yet</p>
                <p className="text-sm text-gray-500 mt-2">Events will appear here as users interact with your festivals</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEvents.map((event: { id: string; event: string; timestamp: Date; festival: { name: string; slug: string } | null }) => (
                  <div key={event.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{event.event.replace(/_/g, ' ')}</span>
                        {event.festival && (
                          <span className="text-sm text-gray-500">
                            • {event.festival.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(event.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Analytics Features */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Implemented Features */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Available Analytics</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Click "View Details" on any festival for in-depth analytics:
                </p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Session popularity & clicks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Hourly activity & peak times</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>View mode usage (Cards/Grid/Schedule)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Calendar export tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Teacher profile clicks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>Filter usage patterns</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-blue-300 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
                <p className="text-gray-600 text-sm mb-3">
                  More powerful features in development:
                </p>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Revenue tracking & reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Attendee demographics</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Custom date range reports</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
