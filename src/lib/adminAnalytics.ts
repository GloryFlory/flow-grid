/**
 * Admin Analytics Dashboard Helpers for FlowGrid
 * 
 * Provides aggregated platform metrics and festival health scoring
 * for the admin dashboard at /admin
 */

import { prisma } from './prisma'

export type PlatformOverview = {
  totalUsers: number
  totalFestivals: number
  festivalsLast30Days: number
  publishedFestivals: number
  totalScheduleViews: number
}

export type WeeklyStats = {
  weeks: string[]
  newUsers: number[]
  newFestivals: number[]
}

export type HealthBreakdown = {
  published: { achieved: boolean; points: number }
  sessions: { achieved: boolean; points: number; value: number }
  views: { achieved: boolean; points: number; value: number }
  branding: { achieved: boolean; points: number }
  shares: { achieved: boolean; points: number }
  recentActivity: { achieved: boolean; points: number; lastActivity: Date | null }
}

export type FestivalHealth = {
  id: string
  name: string
  ownerEmail: string | null
  plan: string
  sessionsCount: number
  scheduleViews: number
  lastActivity: Date | null
  isPublished: boolean
  hasBranding: boolean
  hasShares: boolean
  healthScore: number
  breakdown: HealthBreakdown
}

/**
 * Get high-level platform overview metrics
 */
export async function getPlatformOverview(): Promise<PlatformOverview> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalUsers, totalFestivals, festivalsLast30Days, publishedFestivals, scheduleViews] = 
    await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Total festivals
      prisma.festival.count(),
      
      // Festivals created in last 30 days
      prisma.festival.count({
        where: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }),
      
      // Published festivals
      prisma.festival.count({
        where: {
          isPublished: true
        }
      }),
      
      // Total schedule views from analytics
      prisma.analytics.count({
        where: {
          event: 'schedule_viewed'
        }
      })
    ])

  return {
    totalUsers,
    totalFestivals,
    festivalsLast30Days,
    publishedFestivals,
    totalScheduleViews: scheduleViews
  }
}

/**
 * Get weekly activity stats for the last 8 weeks
 */
export async function getWeeklyStats(): Promise<WeeklyStats> {
  const weeks: string[] = []
  const weekStarts: Date[] = []
  
  // Generate last 8 weeks
  for (let i = 7; i >= 0; i--) {
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - (i * 7))
    weekStart.setHours(0, 0, 0, 0)
    weekStarts.push(weekStart)
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    
    weeks.push(`${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`)
  }

  // Get counts for each week
  const newUsers: number[] = []
  const newFestivals: number[] = []

  for (let i = 0; i < weekStarts.length; i++) {
    const weekStart = weekStarts[i]
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 7)

    const [userCount, festivalCount] = await Promise.all([
      prisma.user.count({
        where: {
          createdAt: {
            gte: weekStart,
            lt: weekEnd
          }
        }
      }),
      prisma.festival.count({
        where: {
          createdAt: {
            gte: weekStart,
            lt: weekEnd
          }
        }
      })
    ])

    newUsers.push(userCount)
    newFestivals.push(festivalCount)
  }

  return {
    weeks,
    newUsers,
    newFestivals
  }
}

/**
 * Calculate health score for a festival based on multiple factors
 * 
 * Scoring:
 * - +25 if published
 * - +20 if more than 10 sessions
 * - +20 if more than 100 schedule views
 * - +15 if has branding (logo or custom colors)
 * - +10 if has at least 1 share event
 * - +10 if last activity within 7 days
 */
function calculateHealthScore(data: {
  isPublished: boolean
  sessionsCount: number
  scheduleViews: number
  hasBranding: boolean
  hasShares: boolean
  lastActivity: Date | null
}): { score: number; breakdown: HealthBreakdown } {
  let score = 0
  const breakdown: HealthBreakdown = {
    published: { achieved: false, points: 0 },
    sessions: { achieved: false, points: 0, value: data.sessionsCount },
    views: { achieved: false, points: 0, value: data.scheduleViews },
    branding: { achieved: false, points: 0 },
    shares: { achieved: false, points: 0 },
    recentActivity: { achieved: false, points: 0, lastActivity: data.lastActivity }
  }

  // Published
  if (data.isPublished) {
    score += 25
    breakdown.published = { achieved: true, points: 25 }
  }

  // Has content
  if (data.sessionsCount > 10) {
    score += 20
    breakdown.sessions = { achieved: true, points: 20, value: data.sessionsCount }
  }

  // Getting traffic
  if (data.scheduleViews > 100) {
    score += 20
    breakdown.views = { achieved: true, points: 20, value: data.scheduleViews }
  }

  // Has branding
  if (data.hasBranding) {
    score += 15
    breakdown.branding = { achieved: true, points: 15 }
  }

  // Being shared
  if (data.hasShares) {
    score += 10
    breakdown.shares = { achieved: true, points: 10 }
  }

  // Recent activity (last 7 days)
  if (data.lastActivity) {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    if (data.lastActivity >= sevenDaysAgo) {
      score += 10
      breakdown.recentActivity = { achieved: true, points: 10, lastActivity: data.lastActivity }
    }
  }

  return { score, breakdown }
}

/**
 * Get list of all festivals with health metrics
 */
export async function getFestivalHealthList(): Promise<FestivalHealth[]> {
  // Get all festivals with related data
  const festivals = await prisma.festival.findMany({
    include: {
      user: {
        include: {
          subscription: true
        }
      },
      sessions: true,
      _count: {
        select: {
          sessions: true
        }
      }
    }
  })

  // Process each festival
  const healthList = await Promise.all(
    festivals.map(async (festival) => {
      // Count schedule views for this festival
      const scheduleViews = await prisma.analytics.count({
        where: {
          festivalId: festival.id,
          event: 'schedule_viewed'
        }
      })

      // Check if has share events
      const shareCount = await prisma.analytics.count({
        where: {
          festivalId: festival.id,
          event: 'schedule_shared'
        }
      })

      // Get last activity (most recent analytics event or festival update)
      const lastAnalyticsEvent = await prisma.analytics.findFirst({
        where: {
          festivalId: festival.id
        },
        orderBy: {
          timestamp: 'desc'
        },
        select: {
          timestamp: true
        }
      })

      const lastActivity = lastAnalyticsEvent?.timestamp || festival.updatedAt

      // Check if has branding (logo or custom colors)
      const hasBranding = !!(
        festival.logo || 
        (festival.primaryColor && festival.primaryColor !== '#4a90e2') ||
        (festival.secondaryColor && festival.secondaryColor !== '#7b68ee')
      )

      const healthData = {
        isPublished: festival.isPublished,
        sessionsCount: festival._count.sessions,
        scheduleViews,
        hasBranding,
        hasShares: shareCount > 0,
        lastActivity
      }

      const { score: healthScore, breakdown } = calculateHealthScore(healthData)

      return {
        id: festival.id,
        name: festival.name,
        ownerEmail: festival.user.email,
        plan: festival.user.subscription?.plan || 'FREE',
        sessionsCount: festival._count.sessions,
        scheduleViews,
        lastActivity,
        isPublished: festival.isPublished,
        hasBranding,
        hasShares: shareCount > 0,
        healthScore,
        breakdown
      }
    })
  )

  // Sort by health score descending
  return healthList.sort((a, b) => b.healthScore - a.healthScore)
}
