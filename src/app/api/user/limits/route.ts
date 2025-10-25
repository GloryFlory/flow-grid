import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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
    const festivalsUsed = user.festivals.length
    
    let festivalsLimit = 1 // FREE default
    if (currentPlan === 'PRO') festivalsLimit = 10
    if (currentPlan === 'ENTERPRISE') festivalsLimit = -1 // unlimited
    if (isAdmin) festivalsLimit = -1 // unlimited for admins

    const canCreateMore = isAdmin || festivalsLimit === -1 || festivalsUsed < festivalsLimit

    return NextResponse.json({
      currentPlan,
      festivalsUsed,
      festivalsLimit,
      isAdmin,
      canCreateMore,
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