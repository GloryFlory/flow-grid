import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check festival access - any team member can view waitlist
    const { access, error } = await requireFestivalAccess(id)
    if (error) return error

    // Get festival name
    const festival = await prisma.festival.findUnique({
      where: { id },
      select: { name: true }
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    // Get all waitlist entries for sessions in this festival
    const waitlist = await prisma.sessionWaitlist.findMany({
      where: {
        session: {
          festivalId: id
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
