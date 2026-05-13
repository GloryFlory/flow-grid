'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanLimitsBanner } from '@/components/PlanLimitsBanner'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { WhatsNewBanner } from '@/components/WhatsNewBanner'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { 
  Calendar, 
  Plus, 
  Users, 
  Settings, 
  BarChart3, 
  ExternalLink,
  Crown,
  Zap,
  TrendingUp,
  TrendingDown,
  Minus,
  SlidersHorizontal,
  X,
  BookOpen,
  Heart,
  Clock,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'

const WIDGET_STORAGE_KEY = 'flowgrid-dashboard-widgets'

const DEFAULT_WIDGETS = {
  quickStats: true,
  recentSignups: true,
  guestFunnel: true,
  upcomingEvents: true,
  capacityAlerts: true,
}

interface WidgetPrefs {
  quickStats: boolean
  recentSignups: boolean
  guestFunnel: boolean
  upcomingEvents: boolean
  capacityAlerts: boolean
}

interface NearCapacitySession {
  id: string
  title: string
  festivalId: string
  festivalName: string
  booked: number
  capacity: number
  pct: number
}

interface UpcomingFestival {
  id: string
  name: string
  slug: string
  startDate: string
  endDate: string
}

interface DashboardStats {
  totalSubscribers: number
  recentSignups: number
  previousPeriodSignups: number
  activePagesWithSubscribers: number
  totalBookings: number
  totalFavourites: number
  totalWaitlisted: number
  upcomingFestivals: UpcomingFestival[]
  nearCapacitySessions: NearCapacitySession[]
}

interface Festival {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  isShared?: boolean
  userRole?: string | null
  _count: {
    sessions: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface PendingInvite {
  id: string
  inviteToken: string | null
  role: string
  festival: {
    id: string
    name: string
  }
}

export function DashboardClient({ 
  user,
  pendingInvites = []
}: { 
  user: User
  pendingInvites?: PendingInvite[]
}) {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasFetched, setHasFetched] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [widgets, setWidgets] = useState<WidgetPrefs>(DEFAULT_WIDGETS)
  const [showWidgetPanel, setShowWidgetPanel] = useState(false)
  const { limits, isLoading: limitsLoading } = usePlanLimits()

  // Load widget preferences from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(WIDGET_STORAGE_KEY)
      if (saved) setWidgets({ ...DEFAULT_WIDGETS, ...JSON.parse(saved) })
    } catch {}
  }, [])

  const toggleWidget = (key: keyof WidgetPrefs) => {
    setWidgets(prev => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(next)) } catch {}
      return next
    })
  }

  useEffect(() => {
    if (!hasFetched) {
      fetchFestivals()
    }
  }, [hasFetched])

  useEffect(() => {
    fetch('/api/admin/dashboard-stats')
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d) })
      .catch(() => {})
  }, [])

  const fetchFestivals = async () => {
    try {
      const response = await fetch('/api/festivals')
      if (response.ok) {
        const data = await response.json()
        setFestivals(data)
        setHasFetched(true)
      }
    } catch (error) {
      console.error('Failed to fetch festivals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateFestival = () => {
    window.location.href = '/dashboard/create-festival'
  }

  if (isLoading || limitsLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const publishedFestivals = festivals.filter(f => f.isPublished).length

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome back, {user.name}!
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage your events and create amazing experiences
            </p>
          </div>
          
          {/* Subscription Badge + Customise */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {limits && (
              <div className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 ${
                limits.isAdmin ? 'bg-purple-100 text-purple-700' :
                limits.isFoundingMember ? 'bg-amber-100 text-amber-700' :
                limits.currentPlan === 'FREE' ? 'bg-gray-100 text-gray-700' :
                limits.currentPlan === 'PRO' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>
                {limits.isAdmin && <Crown className="w-3 h-3 sm:w-4 sm:h-4" />}
                {!limits.isAdmin && limits.isFoundingMember && <span className="text-sm leading-none">⭐</span>}
                {!limits.isAdmin && !limits.isFoundingMember && limits.currentPlan === 'FREE' && <Zap className="w-3 h-3 sm:w-4 sm:h-4" />}
                {!limits.isAdmin && !limits.isFoundingMember && limits.currentPlan === 'PRO' && <Crown className="w-3 h-3 sm:w-4 sm:h-4" />}
                {!limits.isAdmin && !limits.isFoundingMember && limits.currentPlan === 'ENTERPRISE' && <Crown className="w-3 h-3 sm:w-4 sm:h-4" />}
                {limits.isAdmin ? 'Admin' : limits.isFoundingMember ? 'Founding Member' : `${limits.currentPlan} Plan`}
              </div>
            )}
            <button
              onClick={() => setShowWidgetPanel(true)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              title="Customise dashboard"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pending Invitations Banner */}
      {pendingInvites.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    You've Been Invited to Collaborate!
                  </h3>
                  <p className="text-sm text-gray-700 mb-4">
                    You have {pendingInvites.length} pending team invitation{pendingInvites.length !== 1 ? 's' : ''}
                  </p>
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => (
                      <div 
                        key={invite.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">{invite.festival.name}</div>
                          <div className="text-sm text-gray-600">
                            Role: <span className="font-medium">{invite.role}</span>
                          </div>
                        </div>
                        <Link href={`/team/accept/${invite.inviteToken}`}>
                          <Button size="sm" className="ml-4">
                            Accept Invite
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Plan Limits Banner */}
      {limits && (
        <div className="mb-6 sm:mb-8">
          <PlanLimitsBanner
            currentPlan={limits.currentPlan}
            festivalsUsed={limits.festivalsUsed}
            festivalsLimit={limits.festivalsLimit}
            isAdmin={limits.isAdmin}
            canCreateMore={limits.canCreateMore}
          />
        </div>
      )}

      {/* Quick Stats */}
      {widgets.quickStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Published Events
              </CardTitle>
              <Calendar className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {publishedFestivals}
                {limits && !limits.isAdmin && (
                  <span className="text-base font-normal text-gray-400">
                    /{limits.festivalsLimit === -1 ? '∞' : limits.festivalsLimit}
                  </span>
                )}
              </div>
              {limits && !limits.isAdmin && limits.currentPlan === 'FREE' && (
                <p className="text-xs text-gray-500 mt-1">Free plan limit</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Sessions
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {festivals.reduce((sum, f) => sum + (f._count?.sessions || 0), 0)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Across all events</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Signups */}
      {widgets.recentSignups && (
        <div className="mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Signups — last 30 days
              </CardTitle>
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="flex items-end gap-4">
                  <div className="text-2xl font-bold">{stats.recentSignups}</div>
                  <div className="flex items-center gap-1 text-xs mb-1">
                    {stats.recentSignups > stats.previousPeriodSignups ? (
                      <><TrendingUp className="w-3 h-3 text-green-500" /><span className="text-green-600">+{stats.recentSignups - stats.previousPeriodSignups} vs prev. 30d</span></>
                    ) : stats.recentSignups < stats.previousPeriodSignups ? (
                      <><TrendingDown className="w-3 h-3 text-red-400" /><span className="text-red-500">{stats.recentSignups - stats.previousPeriodSignups} vs prev. 30d</span></>
                    ) : (
                      <><Minus className="w-3 h-3 text-gray-400" /><span className="text-gray-500">same as prev. 30d</span></>
                    )}
                  </div>
                  <div className="ml-auto text-xs text-gray-400">{stats.totalSubscribers} total across {stats.activePagesWithSubscribers} page{stats.activePagesWithSubscribers !== 1 ? 's' : ''}</div>
                </div>
              ) : (
                <div className="h-8 bg-gray-100 rounded animate-pulse w-24" />
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Guest Activity Funnel */}
      {widgets.guestFunnel && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Guest Activity</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Bookings', value: stats?.totalBookings, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Saved sessions', value: stats?.totalFavourites, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-50' },
              { label: 'On waitlists', value: stats?.totalWaitlisted, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label}>
                <CardContent className="pt-4 pb-3">
                  <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="text-xl font-bold">
                    {value !== undefined ? value : <span className="inline-block h-6 w-10 bg-gray-100 rounded animate-pulse" />}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      {widgets.upcomingEvents && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Upcoming Published Events</h2>
          {!stats ? (
            <div className="space-y-2">
              {[1,2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : stats.upcomingFestivals.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming published events.</p>
          ) : (
            <div className="space-y-2">
              {stats.upcomingFestivals.map(f => {
                const start = new Date(f.startDate)
                const end = new Date(f.endDate)
                const daysUntil = Math.ceil((start.getTime() - Date.now()) / 86400000)
                const dateStr = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
                  (end.toDateString() !== start.toDateString()
                    ? ' – ' + end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : '')
                return (
                  <Link key={f.id} href={`/dashboard/festivals/${f.id}`}>
                    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-lg hover:border-blue-200 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{f.name}</div>
                          <div className="text-xs text-gray-500">{dateStr}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${daysUntil <= 7 ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                          {daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Capacity Alerts */}
      {widgets.capacityAlerts && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Sessions Near Capacity</h2>
          {!stats ? (
            <div className="space-y-2">
              {[1,2].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
            </div>
          ) : stats.nearCapacitySessions.length === 0 ? (
            <p className="text-sm text-gray-400">No sessions above 75% capacity.</p>
          ) : (
            <div className="space-y-2">
              {stats.nearCapacitySessions.map(s => (
                <Link key={s.id} href={`/dashboard/festivals/${s.festivalId}`}>
                  <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-lg hover:border-amber-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.pct >= 100 ? 'bg-red-50' : 'bg-amber-50'}`}>
                        <AlertTriangle className={`w-4 h-4 ${s.pct >= 100 ? 'text-red-500' : 'text-amber-500'}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{s.title}</div>
                        <div className="text-xs text-gray-500">{s.festivalName}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-semibold text-gray-700">{s.booked}/{s.capacity}</div>
                        <div className={`text-xs font-medium ${s.pct >= 100 ? 'text-red-600' : 'text-amber-600'}`}>{s.pct}%</div>
                      </div>
                      <div className="w-16 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${s.pct >= 100 ? 'bg-red-500' : 'bg-amber-400'}`}
                          style={{ width: `${Math.min(s.pct, 100)}%` }}
                        />
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recently Edited Events */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recently Edited</h2>
          <div className="flex gap-2">
            {festivals.length > 3 && (
              <Link href="/dashboard/festivals">
                <Button variant="outline" size="sm">
                  View All ({festivals.length})
                </Button>
              </Link>
            )}
            <Button onClick={handleCreateFestival} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">Create</span>
            </Button>
          </div>
        </div>
      </div>

      {festivals.length === 0 ? (
        // Empty State
        <Card className="text-center py-8 sm:py-12">
          <CardContent>
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Create your first event
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6 max-w-md mx-auto px-4">
              Get started by creating your first event. Customize your schedule, add teachers, and share with participants.
            </p>
            <Button 
              size="lg" 
              onClick={handleCreateFestival}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Event
            </Button>
          </CardContent>
        </Card>
      ) : (
        // Events Grid - Show max 3, sorted by updatedAt (API already orders this)
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {festivals.slice(0, 3).map((festival) => {
            const editedAgo = (() => {
              const diff = Date.now() - new Date(festival.updatedAt).getTime()
              const mins = Math.floor(diff / 60000)
              if (mins < 2) return 'just now'
              if (mins < 60) return `${mins}m ago`
              const hrs = Math.floor(mins / 60)
              if (hrs < 24) return `${hrs}h ago`
              const days = Math.floor(hrs / 24)
              if (days < 7) return `${days}d ago`
              return new Date(festival.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
            })()

            return (
              <Card key={festival.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    {festival.logo ? (
                      <img 
                        src={festival.logo} 
                        alt={`${festival.name} logo`}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base sm:text-lg truncate">{festival.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          {festival.isShared && (
                            <div className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full flex-shrink-0">
                              Shared
                            </div>
                          )}
                          <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                            festival.isPublished ? 'bg-green-500' : 'bg-yellow-500'
                          }`} />
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {festival.isPublished ? 'Published' : 'Draft'} • {festival._count?.sessions || 0} sessions
                        {festival.isShared && festival.userRole && (
                          <span className="ml-1">• {festival.userRole}</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Edited {editedAgo}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    <Link 
                      href={`/dashboard/festivals/${festival.id}`}
                      className="block"
                    >
                      <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Event
                      </Button>
                    </Link>
                    
                    {festival.isPublished && (
                      <Link 
                        href={`/${festival.slug}/schedule`}
                        target="_blank"
                        className="block"
                      >
                        <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Public Site
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
      
      {/* Upgrade Prompt for Free Users */}
      {limits && limits.currentPlan === 'FREE' && !limits.isAdmin && festivals.length > 0 && (
        <div className="mt-8">
          <UpgradePrompt dismissible storageKey="dashboard-upgrade-dismissed" />
        </div>
      )}

      {/* What's New Toast */}
      <WhatsNewBanner variant="toast" />

      {/* Customise Dashboard Panel */}
      {showWidgetPanel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/30" onClick={() => setShowWidgetPanel(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Customise dashboard</h3>
              <button onClick={() => setShowWidgetPanel(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">Toggle optional widgets. Your events list is always shown.</p>
            <div className="space-y-3">
              {([
                { key: 'quickStats' as const, label: 'Quick Stats', description: 'Published events & total sessions' },
                { key: 'recentSignups' as const, label: 'Recent Signups', description: 'Landing page signup activity' },
                { key: 'guestFunnel' as const, label: 'Guest Activity', description: 'Bookings, saved sessions, waitlists' },
                { key: 'upcomingEvents' as const, label: 'Upcoming Events', description: 'Published events with future dates' },
                { key: 'capacityAlerts' as const, label: 'Capacity Alerts', description: 'Sessions at ≥75% booked' },
              ] as const).map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{label}</div>
                    <div className="text-xs text-gray-500">{description}</div>
                  </div>
                  <button
                    onClick={() => toggleWidget(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${widgets[key] ? 'bg-blue-600' : 'bg-gray-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${widgets[key] ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}