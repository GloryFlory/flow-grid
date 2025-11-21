/**
 * Admin Analytics Dashboard for FlowGrid
 * 
 * Accessible only to users with role === "ADMIN"
 * Shows platform overview, weekly trends, and festival health scores
 */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { 
  type PlatformOverview,
  type WeeklyStats,
  type FestivalHealth
} from '@/lib/adminAnalytics'
import { TrendingUp, Users, Calendar, Eye, CheckCircle, ChevronDown, ChevronRight, X, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function AdminAnalyticsDashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [overview, setOverview] = useState<PlatformOverview | null>(null)
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats | null>(null)
  const [festivalHealth, setFestivalHealth] = useState<FestivalHealth[]>([])
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'ADMIN') {
      setLoading(false)
      return
    }

    // Fetch analytics data from API
    fetch('/api/admin/analytics')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch analytics')
        }
        return res.json()
      })
      .then(data => {
        setOverview(data.overview)
        setWeeklyStats(data.weeklyStats)
        setFestivalHealth(data.festivalHealth)
        setLoading(false)
      })
      .catch(err => {
        console.error('Analytics fetch error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [session, status, router])

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

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Analytics</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
          <a href="/dashboard" className="text-blue-600 hover:underline">
            Return to Dashboard
          </a>
        </div>
      </div>
    )
  }

  if (!overview || !weeklyStats) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-1">Platform overview and festival health metrics</p>
        </div>

        {/* Platform Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={overview.totalUsers}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <MetricCard
            title="Total Festivals"
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
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
                    New Festivals
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

        {/* Festival Health Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Festival Health Scores</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                    
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Festival
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
                              title="View festival dashboard"
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
                                  description={festival.breakdown.published.achieved ? "Festival is live" : "Festival not published"}
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
    </div>
  )
}

// Metric Card Component
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

// Get color based on health score
function getHealthColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

// Breakdown Item Component
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
