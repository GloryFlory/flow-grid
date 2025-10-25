import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { id: festivalId } = await params

    if (!festivalId) {
      return NextResponse.json(
        { error: 'Festival ID is required' },
        { status: 400 }
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