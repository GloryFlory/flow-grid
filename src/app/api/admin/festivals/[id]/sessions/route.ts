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

    // Get all sessions for this festival
    const sessions = await prisma.festivalSession.findMany({
      where: {
        festivalId: festivalId
      },
      // Don't order by day alphabetically - sessions page will handle proper ordering
      orderBy: [
        { startTime: 'asc' }
      ]
    })

    return NextResponse.json({ sessions })
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

    // Validate required fields
    if (!data.title || !data.day || !data.startTime || !data.endTime || !data.teachers || !data.levels || !data.styles) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Convert comma-separated strings to arrays
    const teachersArray = data.teachers.split(',').map((t: string) => t.trim()).filter(Boolean)
    const stylesArray = data.styles.split(',').map((s: string) => s.trim()).filter(Boolean)

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
        cardType: data.cardType || 'full'
      }
    })

    return NextResponse.json({ session: newSession }, { status: 201 })
  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}