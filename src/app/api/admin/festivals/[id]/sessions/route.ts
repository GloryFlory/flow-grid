import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = await params

    // Get all sessions for this festival with bookings to count participants
    const sessions = await prisma.festivalSession.findMany({
      where: {
        festivalId: festivalId
      },
      include: {
        bookings: {
          select: {
            names: true
          }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Transform sessions to include participant count instead of raw bookings
    const sessionsWithCounts = sessions.map(session => {
      // Count total participants across all bookings
      const totalParticipants = session.bookings.reduce((sum, booking) => {
        return sum + (booking.names?.length || 0)
      }, 0)

      const { bookings, ...sessionData } = session
      
      return {
        ...sessionData,
        _count: {
          bookings: totalParticipants // Total number of participants, not booking rows
        }
      }
    })

    // Debug: Log booking fields for first session
    if (sessionsWithCounts.length > 0) {
      console.log('📤 GET sessions - First session booking fields:', {
        id: sessionsWithCounts[0].id,
        title: sessionsWithCounts[0].title,
        bookingEnabled: sessionsWithCounts[0].bookingEnabled,
        bookingCapacity: sessionsWithCounts[0].bookingCapacity,
        participantCount: sessionsWithCounts[0]._count.bookings,
        requirePayment: sessionsWithCounts[0].requirePayment,
        price: sessionsWithCounts[0].price
      })
    }

    return NextResponse.json({ sessions: sessionsWithCounts })
  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = await params
    const data = await request.json()

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

    // Parse displayOrder as decimal (optional, defaults to 0)
    const displayOrder = data.displayOrder ? parseFloat(data.displayOrder) : 0

    // Create new session
    const newSession = await prisma.festivalSession.create({
      data: {
        festivalId: festivalId,
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
        teacherBios: [], // Initialize empty
        cardType: data.cardType || 'full',
        displayOrder: displayOrder,
        bookingEnabled: data.bookingEnabled === true,
        bookingCapacity: data.bookingCapacity ? parseInt(data.bookingCapacity) : null,
        requirePayment: data.requirePayment === true,
        price: data.price ? parseFloat(data.price) : null
      }
    })

    return NextResponse.json({ session: newSession }, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}