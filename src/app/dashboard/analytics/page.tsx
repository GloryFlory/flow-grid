import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { BarChart3, Calendar, Users, Eye, TrendingUp, Clock, Heart, Download, MousePointerClick } from 'lucide-react'
import Link from 'next/link'

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
    calendarExports
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
  ])

  const publishedCount = festivals.filter((f: { isPublished: boolean }) => f.isPublished).length
  const draftCount = festivals.length - publishedCount

  // Calculate some basic stats
  const totalEvents = recentEvents.length
  const eventTypes = [...new Set(recentEvents.map((e: { event: string }) => e.event))]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your festivals' performance and engagement</p>
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
        </div>

        {/* Key Metrics Grid - Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Festivals */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Festivals</p>
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
                <p className="text-xs text-gray-500 mt-1">Across all festivals</p>
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
                <p className="text-xs text-gray-500 mt-1">All-time reservations</p>
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

        {/* Festival Performance Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Festival Performance</h2>
            <p className="text-sm text-gray-600 mt-1">Overview of all your festivals</p>
          </div>
          <div className="overflow-x-auto">
            {festivals.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No festivals created yet</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Festival Name
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
                  {festivals.map((festival: { id: string; name: string; slug: string; isPublished: boolean; _count: { sessions: number; bookings: number } }) => (
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
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>Data exports (CSV/Excel)</span>
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
