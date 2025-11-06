import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: festivalId } = await params

    // Verify festival ownership
    const festival = await prisma.festival.findFirst({
      where: {
        id: festivalId,
        user: {
          email: session.user.email
        }
      }
    })

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { sessions } = body

    if (!Array.isArray(sessions)) {
      return NextResponse.json(
        { error: 'Invalid sessions data' },
        { status: 400 }
      )
    }

    // Update display order for each session
    await Promise.all(
      sessions.map((s: { id: string; displayOrder: number }) =>
        prisma.festivalSession.update({
          where: { id: s.id },
          data: { displayOrder: new Decimal(s.displayOrder) } as any
        })
      )
    )

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Reorder error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder sessions' },
      { status: 500 }
    )
  }
}
