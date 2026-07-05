import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    // Platform-wide festival list is admin-only.
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const festivals = await prisma.festival.findMany({
      include: {
        _count: {
          select: {
            sessions: true
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Format the response to match what the admin dashboard expects
    const formattedFestivals = festivals.map(festival => ({
      id: festival.id,
      name: festival.name,
      slug: festival.slug,
      startDate: festival.startDate.toISOString(),
      endDate: festival.endDate.toISOString(),
      isPublished: festival.isPublished,
      _count: {
        sessions: festival._count.sessions
      }
    }))

    return NextResponse.json({ festivals: formattedFestivals })
  } catch (error) {
    console.error('Error fetching festivals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch festivals' },
      { status: 500 }
    )
  }
}