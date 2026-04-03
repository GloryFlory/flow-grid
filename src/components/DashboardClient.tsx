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
  AlertTriangle
} from 'lucide-react'

interface Festival {
  id: string
  name: string
  slug: string
  description?: string
  logo?: string
  isPublished: boolean
  createdAt: string
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
  const { limits, isLoading: limitsLoading } = usePlanLimits()

  useEffect(() => {
    // Only fetch if we haven't already fetched data
    if (!hasFetched) {
      fetchFestivals()
    }
  }, [hasFetched])

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
          
          {/* Subscription Badge */}
          {limits && (
            <div className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2 self-start sm:self-auto ${
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

      {/* Events Grid */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Events</h2>
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
        // Events Grid - Show max 3
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {festivals.slice(0, 3).map((festival) => (
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
          ))}
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
    </div>
  )
}