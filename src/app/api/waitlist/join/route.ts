import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, festivalId, deviceId, name, email } = await request.json()

    if (!sessionId || !festivalId || !deviceId || !name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if user is already on waitlist (by deviceId or email)
    const existingEntry = await prisma.sessionWaitlist.findFirst({
      where: {
        sessionId,
        OR: [
          { deviceId },
          { email: email.toLowerCase() },
        ],
        status: { in: ['WAITING', 'OFFERED'] },
      },
    })

    if (existingEntry) {
      return NextResponse.json(
        { error: 'You are already on the waitlist for this session', position: existingEntry.position },
        { status: 409 }
      )
    }

    // Check if user already has a booking for this session
    const existingBooking = await prisma.booking.findFirst({
      where: {
        sessionId,
        OR: [
          { deviceId },
          { email: email.toLowerCase() },
        ],
      },
    })

    if (existingBooking) {
      return NextResponse.json(
        { error: 'You already have a booking for this session' },
        { status: 409 }
      )
    }

    // Get current max position
    const maxPosition = await prisma.sessionWaitlist.aggregate({
      where: {
        sessionId,
        status: 'WAITING',
      },
      _max: {
        position: true,
      },
    })

    const position = (maxPosition._max.position || 0) + 1

    // Create waitlist entry
    const waitlistEntry = await prisma.sessionWaitlist.create({
      data: {
        sessionId,
        festivalId,
        deviceId,
        name,
        email: email.toLowerCase(),
        position,
        status: 'WAITING',
      },
      include: {
        session: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      position,
      message: `You're #${position} on the waitlist for "${waitlistEntry.session.title}"`,
    })
  } catch (error) {
    console.error('Waitlist join error:', error)
    return NextResponse.json(
      { error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
}
