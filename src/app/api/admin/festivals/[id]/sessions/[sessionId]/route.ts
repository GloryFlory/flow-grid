import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId, sessionId } = await params
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.day || !data.startTime || !data.endTime || !data.teachers || !data.levels || !data.styles) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Convert comma-separated strings to arrays
    const teachersArray = data.teachers.split(',').map((t: string) => t.trim()).filter(Boolean)
    const stylesArray = data.styles.split(',').map((s: string) => s.trim()).filter(Boolean)

    // Update the session
    const updatedSession = await prisma.festivalSession.update({
      where: {
        id: sessionId,
        festivalId: festivalId // Ensure session belongs to this festival
      },
      data: {
        title: data.title,
        description: data.description || null,
        day: data.day,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location || null,
        level: data.levels,
        styles: stylesArray,
        prerequisites: data.prerequisites || null,
        capacity: data.capacity ? parseInt(data.capacity) : null,
        teachers: teachersArray,
        cardType: data.cardType || 'full'
      }
    })

    return NextResponse.json({ session: updatedSession })
  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sessionId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId, sessionId } = await params

    // Delete the session
    await prisma.festivalSession.delete({
      where: {
        id: sessionId,
        festivalId: festivalId // Ensure session belongs to this festival
      }
    })

    return NextResponse.json({ message: 'Session deleted successfully' })
  } catch (error) {
    console.error('Error deleting session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}