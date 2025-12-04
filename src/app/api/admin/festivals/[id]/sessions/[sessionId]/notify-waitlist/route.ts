import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notifyNextInWaitlist } from '@/lib/waitlist'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId, sessionId } = await params

    // Verify the user owns this festival
    const festival = await prisma.festival.findFirst({
      where: {
        id: festivalId,
        userId: session.user.id
      }
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    // Verify the session belongs to this festival
    const festivalSession = await prisma.festivalSession.findFirst({
      where: {
        id: sessionId,
        festivalId: festivalId
      }
    })

    if (!festivalSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Notify the next person in the waitlist
    const notified = await notifyNextInWaitlist(sessionId)

    if (!notified) {
      return NextResponse.json({ 
        success: false, 
        message: 'No one is waiting on the waitlist for this session' 
      })
    }

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${notified.name} (${notified.email})`,
      notifiedEntry: {
        id: notified.id,
        name: notified.name,
        email: notified.email,
        position: notified.position
      }
    })
  } catch (error) {
    console.error('Error notifying waitlist:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
