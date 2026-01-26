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
  socialLinks: { achieved: boolean; points: number }
  teacherPhotos: { achieved: boolean; points: number; value: number }
  shares: { achieved: boolean; points: number }
}

export type FestivalHealth = {
  id: string
  name: string
  ownerId: string
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
  hasSocialLinks: boolean
  teacherPhotosCount: number
  hasShares: boolean
}): { score: number; breakdown: HealthBreakdown } {
  let score = 0
  const breakdown: HealthBreakdown = {
    published: { achieved: false, points: 0 },
    sessions: { achieved: false, points: 0, value: data.sessionsCount },
    views: { achieved: false, points: 0, value: data.scheduleViews },
    branding: { achieved: false, points: 0 },
    socialLinks: { achieved: false, points: 0 },
    teacherPhotos: { achieved: false, points: 0, value: data.teacherPhotosCount },
    shares: { achieved: false, points: 0 }
  }

  // Published (25 points) - MOST IMPORTANT
  if (data.isPublished) {
    score += 25
    breakdown.published = { achieved: true, points: 25 }
  }

  // Has branding - logo and colors (20 points)
  if (data.hasBranding) {
    score += 20
    breakdown.branding = { achieved: true, points: 20 }
  }

  // Has teacher photos (20 points)
  if (data.teacherPhotosCount > 0) {
    score += 20
    breakdown.teacherPhotos = { achieved: true, points: 20, value: data.teacherPhotosCount }
  }

  // Getting traffic - 100+ views (15 points)
  if (data.scheduleViews >= 100) {
    score += 15
    breakdown.views = { achieved: true, points: 15, value: data.scheduleViews }
  }

  // Has social links - at least one platform (10 points)
  if (data.hasSocialLinks) {
    score += 10
    breakdown.socialLinks = { achieved: true, points: 10 }
  }

  // Has sessions - at least 10 (5 points)
  if (data.sessionsCount >= 10) {
    score += 5
    breakdown.sessions = { achieved: true, points: 5, value: data.sessionsCount }
  }

  // Being shared - at least 1 share (5 points)
  if (data.hasShares) {
    score += 5
    breakdown.shares = { achieved: true, points: 5 }
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
      teachers: {
        include: {
          photos: true // Include photos to count them
        }
      },
      _count: {
        select: {
          sessions: true
        }
      }
    }
  })

  // Batch fetch all analytics data at once instead of per-festival queries
  const festivalIds = festivals.map(f => f.id)
  
  // Get all analytics events for these festivals in one query
  const allAnalytics = await prisma.analytics.findMany({
    where: {
      festivalId: { in: festivalIds }
    },
    select: {
      festivalId: true,
      event: true,
      timestamp: true
    }
  })

  // Build lookup maps for fast access
  const analyticsMap = new Map<string, { views: number; shares: number; lastActivity: Date | null }>()
  
  festivalIds.forEach(id => {
    analyticsMap.set(id, { views: 0, shares: 0, lastActivity: null })
  })

  // Process all analytics in one pass
  allAnalytics.forEach(record => {
    if (!record.festivalId) return // Skip null festivalIds
    
    const data = analyticsMap.get(record.festivalId)!
    
    if (record.event === 'schedule_viewed') {
      data.views++
    } else if (record.event === 'schedule_shared') {
      data.shares++
    }
    
    // Track most recent activity
    if (!data.lastActivity || record.timestamp > data.lastActivity) {
      data.lastActivity = record.timestamp
    }
  })

  // Process each festival with pre-fetched data
  const healthList: FestivalHealth[] = festivals.map((festival) => {
    const analytics = analyticsMap.get(festival.id)!
    const scheduleViews = analytics.views
    const shareCount = analytics.shares
    const lastAnalyticsEvent = analytics.lastActivity

    const lastActivity = lastAnalyticsEvent || festival.updatedAt

    // Check if has branding (logo or custom colors)
    const hasBranding = !!(
      festival.logo || 
      (festival.primaryColor && festival.primaryColor !== '#4a90e2') ||
      (festival.secondaryColor && festival.secondaryColor !== '#7b68ee')
    )

    // Check if has social links
    const hasSocialLinks = !!(
      festival.whatsappLink ||
      festival.telegramLink ||
      festival.facebookLink ||
      festival.instagramLink
    )

    // Count teacher photos (sum all photos from all teachers)
    const teacherPhotosCount = festival.teachers?.reduce((sum, teacher) => {
      return sum + (teacher.photos?.length || 0)
    }, 0) || 0

    const healthData = {
      isPublished: festival.isPublished,
      sessionsCount: festival._count.sessions,
      scheduleViews,
      hasBranding,
      hasSocialLinks,
      teacherPhotosCount,
      hasShares: shareCount > 0
    }

    const { score: healthScore, breakdown } = calculateHealthScore(healthData)

    return {
      id: festival.id,
      name: festival.name,
      ownerId: festival.userId,
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

  // Sort by health score descending
  return healthList.sort((a, b) => b.healthScore - a.healthScore)
}
