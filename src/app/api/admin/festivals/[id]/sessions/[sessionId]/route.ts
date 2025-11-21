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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId, sessionId } = await params

    // Verify festival ownership or admin access
    const festival = await prisma.festival.findUnique({
      where: { id: festivalId },
      include: {
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    // Authorization check
    const isOwner = festival.user.id === session.user.id
    const isAdmin = (session.user as any).role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to update sessions for this festival' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Debug: Log what we received
    console.log('📥 API received booking fields:', {
      bookingEnabled: data.bookingEnabled,
      bookingCapacity: data.bookingCapacity,
      requirePayment: data.requirePayment,
      price: data.price
    })

    // Validate required fields (only title, day, and times are mandatory)
    const missingFields = []
    if (!data.title) missingFields.push('title')
    if (!data.day) missingFields.push('day')
    if (!data.startTime) missingFields.push('startTime')
    if (!data.endTime) missingFields.push('endTime')
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Missing required fields: ${missingFields.join(', ')}` 
      }, { status: 400 })
    }

    // Convert comma-separated strings to arrays (handle empty strings)
    const teachersArray = data.teachers 
      ? data.teachers.split(',').map((t: string) => t.trim()).filter(Boolean)
      : []
    const stylesArray = data.styles
      ? data.styles.split(',').map((s: string) => s.trim()).filter(Boolean)
      : []

    // Parse displayOrder as decimal (optional, keep existing if not provided)
    const displayOrder = data.displayOrder !== undefined ? parseFloat(data.displayOrder) : undefined

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
        cardType: data.cardType || 'full',
        ...(displayOrder !== undefined && { displayOrder }),
        bookingEnabled: data.bookingEnabled === true,
        bookingCapacity: data.bookingCapacity ? parseInt(data.bookingCapacity) : null,
        requirePayment: data.requirePayment === true,
        price: data.price ? parseFloat(data.price) : null
      }
    })

    console.log('✅ Session updated in DB with booking fields:', {
      id: updatedSession.id,
      bookingEnabled: updatedSession.bookingEnabled,
      bookingCapacity: updatedSession.bookingCapacity,
      requirePayment: updatedSession.requirePayment,
      price: updatedSession.price
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
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId, sessionId } = await params

    // Verify festival ownership or admin access
    const festival = await prisma.festival.findUnique({
      where: { id: festivalId },
      include: {
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    // Authorization check
    const isOwner = festival.user.id === session.user.id
    const isAdmin = (session.user as any).role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to delete sessions for this festival' },
        { status: 403 }
      )
    }

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