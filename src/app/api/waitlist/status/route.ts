import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const deviceId = searchParams.get('deviceId')
    const email = searchParams.get('email')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    if (!deviceId && !email) {
      return NextResponse.json(
        { error: 'Device ID or email is required' },
        { status: 400 }
      )
    }

    // Find waitlist entry
    const entry = await prisma.sessionWaitlist.findFirst({
      where: {
        sessionId,
        OR: [
          ...(deviceId ? [{ deviceId }] : []),
          ...(email ? [{ email: email.toLowerCase() }] : []),
        ],
        status: { in: ['WAITING', 'OFFERED'] },
      },
      include: {
        session: {
          select: {
            title: true,
          },
        },
      },
    })

    if (!entry) {
      return NextResponse.json({
        onWaitlist: false,
      })
    }

    // Count how many people are ahead
    const aheadCount = await prisma.sessionWaitlist.count({
      where: {
        sessionId,
        status: 'WAITING',
        position: { lt: entry.position },
      },
    })

    return NextResponse.json({
      onWaitlist: true,
      position: entry.position,
      aheadCount,
      status: entry.status,
      sessionTitle: entry.session.title,
      offerExpiresAt: entry.offerExpiresAt,
    })
  } catch (error) {
    console.error('Waitlist status error:', error)
    return NextResponse.json(
      { error: 'Failed to get waitlist status' },
      { status: 500 }
    )
  }
}

// Leave the waitlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const deviceId = searchParams.get('deviceId')

    if (!sessionId || !deviceId) {
      return NextResponse.json(
        { error: 'Session ID and device ID are required' },
        { status: 400 }
      )
    }

    const entry = await prisma.sessionWaitlist.findFirst({
      where: {
        sessionId,
        deviceId,
        status: { in: ['WAITING', 'OFFERED'] },
      },
    })

    if (!entry) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      )
    }

    await prisma.sessionWaitlist.update({
      where: { id: entry.id },
      data: { status: 'CANCELLED' },
    })

    return NextResponse.json({
      success: true,
      message: 'You have been removed from the waitlist',
    })
  } catch (error) {
    console.error('Waitlist leave error:', error)
    return NextResponse.json(
      { error: 'Failed to leave waitlist' },
      { status: 500 }
    )
  }
}
