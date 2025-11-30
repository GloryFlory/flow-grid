'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Eye, Users, Heart, Calendar, MousePointerClick, User, Loader2, ChevronDown } from 'lucide-react'

const TIME_RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
]

interface AnalyticsData {
  overview: {
    totalViews: number
    uniqueVisitors: number
    totalClicks: number
    totalFavourites: number
    totalBookings: number
    averageSessionsPerUser: number
  }
  trends: {
    hourly: Array<{ hour: number; views: number }>
    daily: Array<{ date: string; views: number; clicks: number; favourites: number }>
  }
  popular: {
    sessions: Array<{ id: string; title: string; clicks: number; favourites: number; bookings: number }>
    teachers: Array<{ name: string; clicks: number }>
  }
  engagement: {
    viewModes: { cards: number; grid: number; mySchedule: number }
    calendarExports: { total: number; byMethod: { icsDownload: number; googleCalendar: number } }
    filterUsage: { totalUses: number; byFilter: Record<string, number> }
    conversionRate: number
    bookingRate: number
  }
  period: {
    start: string
    end: string
    days: number
  }
}

export default function AnalyticsPage() {
  const params = useParams()
  const festivalId = params.id as string
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('7d')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true)
        const res = await fetch(`/api/dashboard/${festivalId}/analytics?range=${timeRange}`)
        if (!res.ok) throw new Error('Failed to fetch analytics')
        const json = await res.json()
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [festivalId, timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  const metrics = [
    { label: 'Page Views', value: data.overview.totalViews, icon: Eye, color: 'text-blue-600' },
    { label: 'Unique Visitors', value: data.overview.uniqueVisitors, icon: Users, color: 'text-green-600' },
    { label: 'Session Clicks', value: data.overview.totalClicks, icon: MousePointerClick, color: 'text-purple-600' },
    { label: 'Favourites', value: data.overview.totalFavourites, icon: Heart, color: 'text-red-600' },
    { label: 'Bookings', value: data.overview.totalBookings, icon: BarChart3, color: 'text-orange-600' },
    { label: 'Calendar Exports', value: data.engagement.calendarExports.total, icon: Calendar, color: 'text-indigo-600' },
  ]

  const viewModes = data.engagement.viewModes
  const viewModeEntries = Object.entries(viewModes).filter(([, v]) => v > 0)
  const viewModeTotal = Object.values(viewModes).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track engagement and visitor activity</p>
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full sm:w-auto flex items-center justify-between gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer min-w-[160px]"
          >
            <span>{TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label}</span>
            <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
              {TIME_RANGE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTimeRange(option.value)
                    setDropdownOpen(false)
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    timeRange === option.value ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <metric.icon className={`h-5 w-5 ${metric.color}`} />
                <div>
                  <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversion Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-green-600">{data.engagement.conversionRate}%</p>
            <p className="text-sm text-muted-foreground">Favourite Conversion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-3xl font-bold text-blue-600">{data.engagement.bookingRate}%</p>
            <p className="text-sm text-muted-foreground">Booking Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hourly Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity by Hour</CardTitle>
            <CardDescription>Peak viewing times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-1">
              {data.trends.hourly.map((h) => {
                const maxViews = Math.max(...data.trends.hourly.map(x => x.views), 1)
                const height = (h.views / maxViews) * 100
                return (
                  <div
                    key={h.hour}
                    className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                    style={{ height: `${Math.max(height, 2)}%` }}
                    title={`${h.hour}:00 - ${h.views} views`}
                  />
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>12am</span>
              <span>6am</span>
              <span>12pm</span>
              <span>6pm</span>
              <span>11pm</span>
            </div>
          </CardContent>
        </Card>

        {/* View Mode Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">View Mode Usage</CardTitle>
            <CardDescription>How visitors view the schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {viewModeEntries.length > 0 ? viewModeEntries.map(([mode, count]) => {
                const percentage = Math.round((count / viewModeTotal) * 100)
                const modeLabels: Record<string, string> = {
                  cards: 'Cards View',
                  grid: 'Grid View',
                  mySchedule: 'My Schedule'
                }
                return (
                  <div key={mode}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{modeLabels[mode] || mode}</span>
                      <span className="text-muted-foreground">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              }) : (
                <p className="text-sm text-muted-foreground">No view mode data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Teachers */}
      {data.popular.teachers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Teachers</CardTitle>
            <CardDescription>Most clicked teacher profiles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.popular.teachers.map((teacher) => (
                <span
                  key={teacher.name}
                  className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm flex items-center gap-1"
                >
                  <User className="h-3 w-3" />
                  {teacher.name}: {teacher.clicks}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Sessions</CardTitle>
          <CardDescription className="flex items-center gap-4">
            <span>Most engaged sessions</span>
            <span className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> Clicks</span>
              <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> Favourites</span>
              <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> Bookings</span>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.popular.sessions.length > 0 ? (
              data.popular.sessions.slice(0, 10).map((session, idx) => (
                <div key={session.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{session.title}</p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1 cursor-help" title="Clicks">
                        <MousePointerClick className="h-3 w-3" /> {session.clicks}
                      </span>
                      <span className="flex items-center gap-1 cursor-help" title="Favourites">
                        <Heart className="h-3 w-3" /> {session.favourites}
                      </span>
                      <span className="flex items-center gap-1 cursor-help" title="Bookings">
                        <BarChart3 className="h-3 w-3" /> {session.bookings}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No session data yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Filter Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Usage</CardTitle>
          <CardDescription>Most used filters ({data.engagement.filterUsage.totalUses} total uses)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(data.engagement.filterUsage.byFilter)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 20)
              .map(([filter, count]) => (
                <span
                  key={filter}
                  className="px-3 py-1 bg-muted rounded-full text-sm"
                >
                  {filter}: {count}
                </span>
              ))}
            {Object.keys(data.engagement.filterUsage.byFilter).length === 0 && (
              <p className="text-sm text-muted-foreground">No filter data yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
