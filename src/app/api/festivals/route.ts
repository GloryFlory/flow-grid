import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createFestivalSchema = z.object({
  name: z.string().min(1, 'Festival name is required'),
  description: z.string().optional(),
  slug: z.string().min(1, 'URL slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  startDate: z.string(),
  endDate: z.string(),
  timezone: z.string().default('America/Montreal'),
  isPublished: z.boolean().optional().default(false),
  sessions: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    teachers: z.string(),
    teacherBio: z.string().optional(),
    teacherPhoto: z.string().optional(),
    startTime: z.string(),
    endTime: z.string(),
    duration: z.number(),
    level: z.string(),
    maxParticipants: z.number(),
    currentBookings: z.number(),
    location: z.string().optional(),
    requirements: z.string().optional(),
    price: z.number(),
    order: z.number(),
    cardType: z.enum(['minimal', 'photo', 'detailed']).optional().default('detailed'),
    sessionTypes: z.string().optional()
  })).optional().default([])
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const data = createFestivalSchema.parse(body)

    // Check if slug is already taken
    const existingFestival = await prisma.festival.findUnique({
      where: { slug: data.slug }
    })

    if (existingFestival) {
      return NextResponse.json(
        { error: 'This URL slug is already taken. Please choose a different one.' },
        { status: 400 }
      )
    }

    // Check plan limits (skip for admins)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        subscription: true,
        festivals: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // All users now have unlimited access

    // Create festival
    const festival = await prisma.festival.create({
      data: {
        name: data.name,
        description: data.description,
        slug: data.slug,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        timezone: data.timezone,
        isPublished: data.isPublished || false,
        userId: session.user.id,
        sessions: {
          create: data.sessions.map((session, index) => ({
            title: session.title,
            description: session.description || '',
            day: (() => {
              const date = new Date(session.startTime)
              if (isNaN(date.getTime())) {
                console.error('Invalid startTime:', session.startTime)
                return 'TBD'
              }
              return date.toLocaleDateString('en-US', { weekday: 'long' })
            })(),
            startTime: new Date(session.startTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            endTime: new Date(session.endTime).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
            location: session.location || '',
            level: session.level || '',
            styles: session.sessionTypes ? [session.sessionTypes] : [],
            prerequisites: session.requirements || '',
            capacity: session.maxParticipants,
            teachers: session.teachers ? [session.teachers] : [],
            teacherBios: [],
            cardType: session.cardType || 'detailed'
          }))
        }
      },
      include: {
        sessions: true
      }
    })

    return NextResponse.json(festival)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating festival:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const festivals = await prisma.festival.findMany({
      where: { userId: session.user.id },
      include: {
        sessions: {
          select: {
            id: true,
            title: true,
            teachers: true,
            startTime: true,
            capacity: true
          }
        },
        _count: {
          select: {
            sessions: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(festivals)
  } catch (error) {
    console.error('Error fetching festivals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}