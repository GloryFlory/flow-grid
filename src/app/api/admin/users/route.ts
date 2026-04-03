import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          select: {
            plan: true,
            isFoundingMember: true,
            festivalsLimit: true,
            festivalsUsed: true,
            stripeCurrentPeriodEnd: true,
            status: true,
          }
        },
        _count: {
          select: { festivals: true }
        }
      }
    })

    return NextResponse.json({
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
        plan: u.subscription?.plan || 'FREE',
        status: u.subscription?.status || 'ACTIVE',
        isFoundingMember: u.subscription?.isFoundingMember || false,
        festivalsLimit: u.subscription?.festivalsLimit ?? 1,
        festivalsUsed: u.subscription?.festivalsUsed ?? 0,
        expiresAt: u.subscription?.stripeCurrentPeriodEnd || null,
        festivalCount: u._count.festivals,
      }))
    })
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
