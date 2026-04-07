/**
 * Platform Overview API
 * 
 * Returns platform-wide stats for admin dashboard:
 * - User counts and signups
 * - Subscription breakdown
 * - Founding member stats
 * - Revenue from payment requests
 * - Schedule views over time
 * - Activation & conversion rates
 * - Expiring subscriptions
 * - Recent activity feed
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)

    const [
      totalUsers,
      usersLast30Days,
      usersLast7Days,
      subscriptionStats,
      foundingMembers,
      totalFestivals,
      publishedFestivals,
      recentUsers,
      // Revenue: all confirmed/pending payment requests
      revenueData,
      // Views over time: last 8 weeks of schedule_viewed events
      viewsData,
      // Activation: users with at least one published festival
      activatedUsers,
      // Expiring subs: founding members expiring within 90 days
      expiringSubs,
      // Recent activity: signups + publishes
      recentSignups,
      recentPublishes,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.subscription.groupBy({ by: ['plan'], _count: { plan: true } }),
      prisma.subscription.count({ where: { isFoundingMember: true } }),
      prisma.festival.count(),
      prisma.festival.count({ where: { isPublished: true } }),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: { select: { plan: true, isFoundingMember: true, stripeCurrentPeriodEnd: true } },
          _count: { select: { festivals: true } }
        }
      }),

      // Revenue: sum all non-flagged payment requests
      prisma.paymentRequest.findMany({
        where: { verificationStatus: { not: 'FLAGGED' } },
        select: { amount: true, plan: true, billingCycle: true, createdAt: true, verificationStatus: true }
      }),

      // Views: schedule_viewed events grouped by week (last 8 weeks)
      prisma.analytics.findMany({
        where: {
          event: 'schedule_viewed',
          timestamp: { gte: new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000) } // 8 weeks
        },
        select: { timestamp: true }
      }),

      // Activated users: have at least 1 published festival
      prisma.user.count({
        where: { festivals: { some: { isPublished: true } } }
      }),

      // Expiring: subscriptions expiring in next 90 days
      prisma.subscription.findMany({
        where: {
          stripeCurrentPeriodEnd: { gte: now, lte: ninetyDaysFromNow }
        },
        select: {
          stripeCurrentPeriodEnd: true,
          plan: true,
          isFoundingMember: true,
          user: { select: { email: true, name: true } }
        },
        orderBy: { stripeCurrentPeriodEnd: 'asc' }
      }),

      // Recent signups (last 7 days)
      prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { email: true, name: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 20
      }),

      // Recently published festivals (last 14 days)
      prisma.festival.findMany({
        where: { isPublished: true, updatedAt: { gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000) } },
        select: { name: true, slug: true, updatedAt: true, user: { select: { email: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 20
      }),
    ])

    // --- Revenue calculations ---
    const totalRevenue = revenueData.reduce((sum, r) => sum + Number(r.amount), 0)
    const verifiedRevenue = revenueData
      .filter(r => r.verificationStatus === 'VERIFIED')
      .reduce((sum, r) => sum + Number(r.amount), 0)
    const pendingRevenue = revenueData
      .filter(r => r.verificationStatus === 'PENDING')
      .reduce((sum, r) => sum + Number(r.amount), 0)
    const revenueThisMonth = revenueData
      .filter(r => r.createdAt >= thirtyDaysAgo)
      .reduce((sum, r) => sum + Number(r.amount), 0)

    // --- Views per week ---
    const weeklyViews: number[] = Array(8).fill(0)
    const weekLabels: string[] = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      weekStart.setHours(0, 0, 0, 0)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      weekLabels.push(weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }))
      const idx = 7 - i
      weeklyViews[idx] = viewsData.filter(v => v.timestamp >= weekStart && v.timestamp < weekEnd).length
    }

    // --- Activation rate ---
    const activationRate = totalUsers > 0 ? Math.round((activatedUsers / totalUsers) * 100) : 0
    
    // Pro/paid users (rough conversion from free)
    const planBreakdown: Record<string, number> = { FREE: 0, PRO: 0, ENTERPRISE: 0, EVENT_PASS: 0 }
    subscriptionStats.forEach(stat => {
      planBreakdown[stat.plan] = stat._count.plan
    })
    const paidUsers = (planBreakdown.PRO || 0) + (planBreakdown.ENTERPRISE || 0)
    const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0

    // --- Activity feed: merge signups + publishes, sort by date ---
    const activityFeed = [
      ...recentSignups.map(u => ({
        type: 'signup' as const,
        label: `${u.email} signed up`,
        time: u.createdAt,
      })),
      ...recentPublishes.map(f => ({
        type: 'publish' as const,
        label: `${f.user?.email || 'Unknown'} published "${f.name}"`,
        time: f.updatedAt,
        url: `/${f.slug}/schedule`,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20)

    return NextResponse.json({
      users: {
        total: totalUsers,
        last30Days: usersLast30Days,
        last7Days: usersLast7Days,
        foundingMembers,
        activatedUsers,
        activationRate,
        conversionRate,
        paidUsers,
      },
      subscriptions: planBreakdown,
      festivals: {
        total: totalFestivals,
        published: publishedFestivals
      },
      revenue: {
        total: totalRevenue,
        verified: verifiedRevenue,
        pending: pendingRevenue,
        thisMonth: revenueThisMonth,
        transactionCount: revenueData.length,
      },
      views: {
        weekly: weeklyViews,
        labels: weekLabels,
        total: viewsData.length,
      },
      expiringSubs: expiringSubs.map(s => ({
        email: s.user?.email,
        name: s.user?.name,
        expiresAt: s.stripeCurrentPeriodEnd,
        plan: s.plan,
        isFoundingMember: s.isFoundingMember,
        daysLeft: Math.ceil(((s.stripeCurrentPeriodEnd?.getTime() || 0) - now.getTime()) / (1000 * 60 * 60 * 24))
      })),
      activityFeed,
      recentUsers: recentUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
        plan: u.subscription?.plan || 'FREE',
        isFoundingMember: u.subscription?.isFoundingMember || false,
        expiresAt: u.subscription?.stripeCurrentPeriodEnd,
        festivalCount: u._count.festivals
      }))
    })
  } catch (error) {
    console.error('Platform overview error:', error)
    return NextResponse.json({ error: 'Failed to fetch platform overview' }, { status: 500 })
  }
}
