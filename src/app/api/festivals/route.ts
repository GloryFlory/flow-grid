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

    // Monetisation is disabled — no publishing limits. We only verify the
    // user still exists (e.g. wasn't deleted while holding a valid session).
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

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
      console.error('Zod validation error:', JSON.stringify(error.errors, null, 2))
      // Build a human-readable error message
      const fieldErrors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
      return NextResponse.json(
        { error: `Invalid input: ${fieldErrors}`, details: error.errors },
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

    // Get user's email to check team memberships
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Fetch festivals where user is owner OR a team member
    const festivals = await prisma.festival.findMany({
      where: {
        OR: [
          { userId: session.user.id }, // Owned by user
          {
            teamMembers: {
              some: {
                email: user.email,
                acceptedAt: { not: null } // Only accepted invitations
              }
            }
          }
        ]
      },
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
        teamMembers: {
          where: {
            email: user.email,
            acceptedAt: { not: null }
          },
          select: {
            role: true
          }
        },
        _count: {
          select: {
            sessions: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Add isShared flag and user's role to each festival
    const festivalsWithRole = festivals.map(festival => ({
      ...festival,
      isShared: festival.userId !== session.user.id,
      userRole: festival.userId === session.user.id 
        ? 'OWNER' 
        : festival.teamMembers[0]?.role || null
    }))

    return NextResponse.json(festivalsWithRole)
  } catch (error) {
    console.error('Error fetching festivals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}