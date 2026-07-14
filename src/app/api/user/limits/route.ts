import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLAN_FEATURES } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
        festivals: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const isAdmin = user.role === 'ADMIN'
    const currentPlan = user.subscription?.plan || 'FREE'
    // Only count published festivals against the limit
    const festivalsUsed = user.festivals.filter(f => f.isPublished).length
    
    // Monetisation is disabled: every account gets unlimited events and all
    // features. Stored subscription limits are ignored (kept only for
    // grandfathered white-label detection elsewhere).
    const planFeatures = PLAN_FEATURES[currentPlan]
    const festivalsLimit = -1
    const sessionsLimit = -1
    const canCreateMore = true

    return NextResponse.json({
      currentPlan,
      festivalsUsed,
      festivalsLimit,
      sessionsLimit,
      isAdmin,
      canCreateMore,
      features: planFeatures,
      isFoundingMember: user.subscription?.isFoundingMember ?? false,
      subscription: user.subscription ? {
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.stripeCurrentPeriodEnd,
      } : null,
      user: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Error fetching user limits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}