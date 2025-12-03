import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
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
        festivals: true // Get all festivals
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const totalFestivals = user.festivals.length
    const publishedFestivals = user.festivals.filter(f => f.isPublished).length
    const draftFestivals = totalFestivals - publishedFestivals
    
    const subscription = user.subscription || {
      plan: 'FREE',
      festivalsLimit: 1,
      status: 'ACTIVE'
    }
    
    const festivalsLimit = subscription.festivalsLimit ?? 1

    return NextResponse.json({
      subscription: {
        plan: subscription.plan,
        festivalsLimit,
        status: subscription.status
      },
      totalFestivals,
      publishedFestivals,
      draftFestivals,
      canPublish: publishedFestivals < festivalsLimit
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
