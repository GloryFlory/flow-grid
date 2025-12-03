/**
 * Platform Overview API
 * 
 * Returns platform-wide stats for admin dashboard:
 * - User counts and signups
 * - Subscription breakdown
 * - Founding member stats
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

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get date ranges
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch all stats in parallel
    const [
      totalUsers,
      usersLast30Days,
      usersLast7Days,
      subscriptionStats,
      foundingMembers,
      totalFestivals,
      publishedFestivals,
      recentUsers
    ] = await Promise.all([
      // Total users
      prisma.user.count(),
      
      // Users signed up in last 30 days
      prisma.user.count({
        where: { createdAt: { gte: thirtyDaysAgo } }
      }),
      
      // Users signed up in last 7 days
      prisma.user.count({
        where: { createdAt: { gte: sevenDaysAgo } }
      }),
      
      // Subscription breakdown by plan
      prisma.subscription.groupBy({
        by: ['plan'],
        _count: { plan: true }
      }),
      
      // Founding members count
      prisma.subscription.count({
        where: { isFoundingMember: true }
      }),
      
      // Total festivals
      prisma.festival.count(),
      
      // Published festivals
      prisma.festival.count({
        where: { isPublished: true }
      }),
      
      // Recent users (last 10)
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: {
            select: {
              plan: true,
              isFoundingMember: true,
              stripeCurrentPeriodEnd: true
            }
          },
          _count: {
            select: { festivals: true }
          }
        }
      })
    ])

    // Transform subscription stats into a more usable format
    const planBreakdown = {
      FREE: 0,
      PRO: 0,
      ENTERPRISE: 0
    }
    subscriptionStats.forEach(stat => {
      planBreakdown[stat.plan as keyof typeof planBreakdown] = stat._count.plan
    })

    return NextResponse.json({
      users: {
        total: totalUsers,
        last30Days: usersLast30Days,
        last7Days: usersLast7Days,
        foundingMembers
      },
      subscriptions: planBreakdown,
      festivals: {
        total: totalFestivals,
        published: publishedFestivals
      },
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
    return NextResponse.json(
      { error: 'Failed to fetch platform overview' },
      { status: 500 }
    )
  }
}
