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
    
    // All users now have unlimited access
    const festivalsLimit = -1 // unlimited for everyone
    const canCreateMore = true // everyone can create more

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