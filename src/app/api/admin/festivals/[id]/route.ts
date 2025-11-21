import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.error('[Festival GET] Authentication failed:', { 
        hasSession: !!session, 
        hasUser: !!session?.user,
        userId: session?.user?.id 
      })
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const { id: festivalId } = await params

    if (!festivalId) {
      return NextResponse.json(
        { error: 'Festival ID is required' },
        { status: 400 }
      )
    }

    const festival = await prisma.festival.findUnique({
      where: {
        id: festivalId
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            sessions: true
          }
        }
      }
    })

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found' },
        { status: 404 }
      )
    }

    // Authorization check - user must own the festival or be an admin
    const isOwner = festival.user.id === session.user.id
    const isAdmin = (session.user as any).role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to access this festival' },
        { status: 403 }
      )
    }

    // Convert dates to ISO strings for proper serialization
    const festivalWithDates = {
      ...festival,
      startDate: festival.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      endDate: festival.endDate.toISOString().split('T')[0],
      createdAt: festival.createdAt.toISOString(),
      updatedAt: festival.updatedAt.toISOString()
    }

    return NextResponse.json(
      { festival: festivalWithDates },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching festival:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const { id: festivalId } = await params

    if (!festivalId) {
      return NextResponse.json(
        { error: 'Festival ID is required' },
        { status: 400 }
      )
    }

    // Check festival ownership before updating
    const existingFestival = await prisma.festival.findUnique({
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

    if (!existingFestival) {
      return NextResponse.json(
        { error: 'Festival not found' },
        { status: 404 }
      )
    }

    // Authorization check - user must own the festival or be an admin
    const isOwner = existingFestival.user.id === session.user.id
    const isAdmin = (session.user as any).role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to update this festival' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validate the update data
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.location !== undefined) updateData.location = body.location
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)
    if (body.timezone !== undefined) updateData.timezone = body.timezone
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished
    if (body.whatsappLink !== undefined) updateData.whatsappLink = body.whatsappLink
    if (body.telegramLink !== undefined) updateData.telegramLink = body.telegramLink
    if (body.facebookLink !== undefined) updateData.facebookLink = body.facebookLink
    if (body.instagramLink !== undefined) updateData.instagramLink = body.instagramLink

    const festival = await prisma.festival.update({
      where: {
        id: festivalId
      },
      data: updateData,
      include: {
        _count: {
          select: {
            sessions: true
          }
        }
      }
    })

    return NextResponse.json({ festival })
  } catch (error) {
    console.error('Error updating festival:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}