import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify the user owns this festival
    const festival = await prisma.festival.findFirst({
      where: {
        id,
        userId: session.user.id
      },
      select: {
        id: true,
        name: true
      }
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    // Get all waitlist entries for sessions in this festival
    const waitlist = await prisma.sessionWaitlist.findMany({
      where: {
        session: {
          festivalId: festival.id
        }
      },
      include: {
        session: {
          select: {
            id: true,
            title: true,
            day: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: [
        { session: { startTime: 'asc' } },
        { position: 'asc' }
      ]
    })

    return NextResponse.json({
      waitlist: waitlist.map(entry => ({
        id: entry.id,
        name: entry.name,
        email: entry.email,
        position: entry.position,
        status: entry.status,
        createdAt: entry.createdAt.toISOString(),
        offeredAt: entry.offeredAt?.toISOString() || null,
        session: entry.session
      })),
      festivalName: festival.name
    })
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
