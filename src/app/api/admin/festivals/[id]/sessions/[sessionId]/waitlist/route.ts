import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId, sessionId } = await params

    // Verify user owns this festival
    const festival = await prisma.festival.findFirst({
      where: {
        id: festivalId,
        user: {
          email: session.user.email,
        },
      },
    })

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found or access denied' },
        { status: 404 }
      )
    }

    // Get waitlist for this session
    const waitlist = await prisma.sessionWaitlist.findMany({
      where: {
        sessionId,
        festivalId,
      },
      orderBy: [
        { status: 'asc' }, // WAITING first, then OFFERED, etc.
        { position: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        status: true,
        createdAt: true,
        offeredAt: true,
        offerExpiresAt: true,
        claimedAt: true,
      },
    })

    // Get session info
    const sessionInfo = await prisma.festivalSession.findUnique({
      where: { id: sessionId },
      select: {
        title: true,
        bookingCapacity: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    })

    return NextResponse.json({
      waitlist,
      session: sessionInfo,
      summary: {
        waiting: waitlist.filter(w => w.status === 'WAITING').length,
        offered: waitlist.filter(w => w.status === 'OFFERED').length,
        claimed: waitlist.filter(w => w.status === 'CLAIMED').length,
        expired: waitlist.filter(w => w.status === 'EXPIRED').length,
      },
    })
  } catch (error) {
    console.error('Error fetching waitlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    )
  }
}
