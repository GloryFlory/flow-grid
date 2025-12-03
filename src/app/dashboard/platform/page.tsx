/**
 * Admin Platform Dashboard for FlowGrid
 * 
 * Accessible only to users with role === "ADMIN"
 * Tabs: Overview (users/subscriptions) | Analytics (events/health)
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  type PlatformOverview as AnalyticsOverview,
  type WeeklyStats,
  type FestivalHealth
} from '@/lib/adminAnalytics'
import { 
  TrendingUp, Users, Calendar, Eye, CheckCircle, ChevronDown, ChevronRight, 
  X, ExternalLink, Crown, BarChart3, UserCheck, Mail, Search
} from 'lucide-react'
import Link from 'next/link'

type TabType = 'overview' | 'analytics' | 'users' | 'events' | 'inquiries'

interface PlatformStats {
  users: {
    total: number
    last30Days: number
    last7Days: number
    foundingMembers: number
  }
  subscriptions: {
    FREE: number
    PRO: number
    ENTERPRISE: number
  }
  festivals: {
    total: number
    published: number
  }
  recentUsers: Array<{
    id: string
    email: string
    name: string | null
    createdAt: string
    plan: string
    isFoundingMember: boolean
    festivalCount: number
  }>
}

export default function AdminPlatformDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  
  // Overview state
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [overviewLoading, setOverviewLoading] = useState(true)
  const [overviewError, setOverviewError] = useState<string | null>(null)
  
  // Analytics state
  const [analyticsOverview, setAnalyticsOverview] = useState<AnalyticsOverview | null>(null)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [festivalHealth, setFestivalHealth] = useState<FestivalHealth[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [analyticsError, setAnalyticsError] = useState<string | null>(null)

  // Auth check
  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'ADMIN') {
      return
    }
  }, [session, status, router])

  // Fetch overview data
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') return

    fetch('/api/admin/platform')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch platform stats')
        return res.json()
      })
      .then(data => {
        setPlatformStats(data)
        setOverviewLoading(false)
      })
      .catch(err => {
        console.error('Platform stats fetch error:', err)
        setOverviewError(err.message)
        setOverviewLoading(false)
      })
  }, [session])

  // Fetch analytics data
  useEffect(() => {
    if (session?.user?.role !== 'ADMIN') return

    fetch('/api/admin/analytics')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch analytics')
        return res.json()
      })
      .then(data => {
        setAnalyticsOverview(data.overview)
        setWeeklyStats(data.weeklyStats)
        setFestivalHealth(data.festivalHealth)
        setAnalyticsLoading(false)
      })
      .catch(err => {
        console.error('Analytics fetch error:', err)
        setAnalyticsError(err.message)
        setAnalyticsLoading(false)
      })
  }, [session])

  const toggleRow = (festivalId: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(festivalId)) {
        newSet.delete(festivalId)
      } else {
        newSet.add(festivalId)
      }
      return newSet
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Dashboard</h1>
          <p className="text-gray-600 mt-1">Admin overview and platform metrics</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'analytics'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'users'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-400 hover:text-gray-500'
              }`}
            >
              <Search className="w-4 h-4" />
              Users
              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'events'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-400 hover:text-gray-500'
              }`}
            >
              <Calendar className="w-4 h-4" />
              All Events
              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
            </button>
            <button
              onClick={() => setActiveTab('inquiries')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'inquiries'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-400 hover:text-gray-500'
              }`}
            >
              <Mail className="w-4 h-4" />
              Inquiries
              <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Soon</span>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={platformStats} 
            loading={overviewLoading} 
            error={overviewError} 
          />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsTab 
            overview={analyticsOverview}
            weeklyStats={weeklyStats}
            festivalHealth={festivalHealth}
            expandedRows={expandedRows}
            toggleRow={toggleRow}
            loading={analyticsLoading}
            error={analyticsError}
          />
        )}
        {activeTab === 'users' && <ComingSoonTab title="User Management" description="Search users, view profiles, manage subscriptions" />}
        {activeTab === 'events' && <ComingSoonTab title="All Events" description="Browse all events on the platform, view public schedules" />}
        {activeTab === 'inquiries' && <ComingSoonTab title="Sales Inquiries" description="View and respond to Enterprise and contact form submissions" />}
      </div>
    </div>
  )
}

// ============================================================================
// Coming Soon Tab (placeholder for future features)
// ============================================================================

function ComingSoonTab({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 mb-4">{description}</p>
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-700">
          Coming Soon
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// Overview Tab
// ============================================================================

function OverviewTab({ 
  stats, 
  loading, 
  error 
}: { 
  stats: PlatformStats | null
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return <div className="text-gray-600">Loading overview...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="space-y-8">
      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={stats.users.total}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="New This Week"
          value={stats.users.last7Days}
          icon={<UserCheck className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="New This Month"
          value={stats.users.last30Days}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Subscription Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription Breakdown</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-600">{stats.subscriptions.FREE}</div>
            <div className="text-sm text-gray-500 mt-1">Free</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">{stats.subscriptions.PRO}</div>
            <div className="text-sm text-purple-600 mt-1">Pro</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">{stats.subscriptions.ENTERPRISE}</div>
            <div className="text-sm text-blue-600 mt-1">Enterprise</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg border-2 border-amber-200">
            <div className="flex items-center justify-center gap-1">
              <Crown className="w-5 h-5 text-amber-500" />
              <span className="text-3xl font-bold text-amber-600">{stats.users.foundingMembers}</span>
            </div>
            <div className="text-sm text-amber-600 mt-1">Founding Members</div>
          </div>
        </div>
      </div>

      {/* Event Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Events</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{stats.festivals.total}</div>
            <div className="text-sm text-gray-500 mt-1">Total</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{stats.festivals.published}</div>
            <div className="text-sm text-gray-500 mt-1">Published</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-400">{stats.festivals.total - stats.festivals.published}</div>
            <div className="text-sm text-gray-500 mt-1">Drafts</div>
          </div>
        </div>
      </div>

      {/* Recent Users */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Events
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.recentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        {user.name || 'Anonymous'}
                        {user.isFoundingMember && (
                          <span title="Founding Member">
                            <Crown className="w-4 h-4 text-amber-500" />
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.plan === 'PRO' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.plan === 'ENTERPRISE'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {user.festivalCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Analytics Tab
// ============================================================================

function AnalyticsTab({
  overview,
  weeklyStats,
  festivalHealth,
  expandedRows,
  toggleRow,
  loading,
  error
}: {
  overview: AnalyticsOverview | null
  weeklyStats: WeeklyStats | null
  festivalHealth: FestivalHealth[]
  expandedRows: Set<string>
  toggleRow: (id: string) => void
  loading: boolean
  error: string | null
}) {
  if (loading) {
    return <div className="text-gray-600">Loading analytics...</div>
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!overview || !weeklyStats) return null

  return (
    <div className="space-y-8">
      {/* Platform Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          title="Total Users"
          value={overview.totalUsers}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <MetricCard
          title="Total Events"
          value={overview.totalFestivals}
          icon={<Calendar className="w-6 h-6" />}
          color="purple"
        />
        <MetricCard
          title="Last 30 Days"
          value={overview.festivalsLast30Days}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
        <MetricCard
          title="Published"
          value={overview.publishedFestivals}
          icon={<CheckCircle className="w-6 h-6" />}
          color="emerald"
        />
        <MetricCard
          title="Schedule Views"
          value={overview.totalScheduleViews}
          icon={<Eye className="w-6 h-6" />}
          color="orange"
        />
      </div>

      {/* Weekly Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Activity (Last 8 Weeks)</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Users
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Events
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weeklyStats.weeks.map((week, index) => (
                <tr key={week} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {week}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {weeklyStats.newUsers[index]}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    {weeklyStats.newFestivals[index]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Health Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Health Scores</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                  
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sessions
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Views
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health Score
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {festivalHealth.map((festival) => {
                const isExpanded = expandedRows.has(festival.id)
                return (
                  <React.Fragment key={festival.id}>
                    <tr 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleRow(festival.id)}
                    >
                      <td className="px-4 py-3">
                        <div className="text-gray-400 hover:text-gray-600 transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2 group">
                          <Link 
                            href={`/dashboard/festivals/${festival.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors"
                            title="View event dashboard"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {festival.name}
                          </Link>
                          {festival.isPublished && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <Link
                            href={`/dashboard/festivals/${festival.id}`}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Open dashboard"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4 text-purple-600 hover:text-purple-700" />
                          </Link>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {festival.ownerEmail}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          festival.plan === 'PRO' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {festival.plan}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {festival.sessionsCount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {festival.scheduleViews}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {festival.lastActivity 
                          ? new Date(festival.lastActivity).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'Never'
                        }
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                            <div 
                              className={`h-2 rounded-full ${getHealthColor(festival.healthScore)}`}
                              style={{ width: `${festival.healthScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 min-w-[3ch]">
                            {festival.healthScore}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${festival.id}-details`}>
                        <td colSpan={8} className="px-4 py-4 bg-gray-50">
                          <div className="ml-8 space-y-2">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Health Score Breakdown:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <BreakdownItem
                                label="Published"
                                achieved={festival.breakdown.published.achieved}
                                points={festival.breakdown.published.points}
                                maxPoints={25}
                                description={festival.breakdown.published.achieved ? "Event is live" : "Event not published"}
                              />
                              <BreakdownItem
                                label="Sessions"
                                achieved={festival.breakdown.sessions.achieved}
                                points={festival.breakdown.sessions.points}
                                maxPoints={20}
                                description={`${festival.breakdown.sessions.value} sessions (needs >10)`}
                              />
                              <BreakdownItem
                                label="Schedule Views"
                                achieved={festival.breakdown.views.achieved}
                                points={festival.breakdown.views.points}
                                maxPoints={20}
                                description={`${festival.breakdown.views.value} views (needs >100)`}
                              />
                              <BreakdownItem
                                label="Branding"
                                achieved={festival.breakdown.branding.achieved}
                                points={festival.breakdown.branding.points}
                                maxPoints={15}
                                description={festival.breakdown.branding.achieved ? "Has custom logo/colors" : "No custom branding"}
                              />
                              <BreakdownItem
                                label="Social Shares"
                                achieved={festival.breakdown.shares.achieved}
                                points={festival.breakdown.shares.points}
                                maxPoints={10}
                                description={festival.breakdown.shares.achieved ? "Has share activity" : "No shares yet"}
                              />
                              <BreakdownItem
                                label="Recent Activity"
                                achieved={festival.breakdown.recentActivity.achieved}
                                points={festival.breakdown.recentActivity.points}
                                maxPoints={10}
                                description={
                                  festival.breakdown.recentActivity.achieved 
                                    ? `Active within 7 days` 
                                    : festival.breakdown.recentActivity.lastActivity
                                    ? `Last active ${new Date(festival.breakdown.recentActivity.lastActivity).toLocaleDateString()}`
                                    : "No recent activity"
                                }
                              />
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-200">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">Total Score:</span>
                                <span className="text-lg font-bold text-gray-900">{festival.healthScore}/100</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// Shared Components
// ============================================================================

function MetricCard({ 
  title, 
  value, 
  icon, 
  color 
}: { 
  title: string
  value: number
  icon: React.ReactNode
  color: 'blue' | 'purple' | 'green' | 'emerald' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    emerald: 'bg-emerald-100 text-emerald-600',
    orange: 'bg-orange-100 text-orange-600'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function getHealthColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

function BreakdownItem({
  label,
  achieved,
  points,
  maxPoints,
  description
}: {
  label: string
  achieved: boolean
  points: number
  maxPoints: number
  description: string
}) {
  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-gray-200">
      <div className="flex-shrink-0 mt-0.5">
        {achieved ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : (
          <X className="w-5 h-5 text-gray-300" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className={`text-sm font-semibold ${achieved ? 'text-green-600' : 'text-gray-400'}`}>
            +{points}/{maxPoints}
          </p>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  )
}
