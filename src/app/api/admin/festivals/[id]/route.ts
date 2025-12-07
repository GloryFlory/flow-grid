import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

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

    // Check festival access - any team member can view
    const { error } = await requireFestivalAccess(festivalId)
    if (error) return error

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
        teamMembers: {
          select: {
            id: true,
            email: true,
            role: true,
            acceptedAt: true
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

    // Check festival access - require manage settings permission
    const { error } = await requireFestivalAccess(festivalId, { requireManageSettings: true })
    if (error) return error

    // Get session for subscription check
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check festival exists
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

    const isAdmin = (session.user as any).role === 'ADMIN'

    const body = await request.json()
    
    // Check plan limits when trying to publish
    if (body.isPublished === true && !existingFestival.isPublished) {
      // User is trying to publish a draft - check limits
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
          subscription: true,
          festivals: {
            where: { isPublished: true }
          }
        }
      })

      if (user && !isAdmin) {
        const currentPlan = user.subscription?.plan || 'FREE'
        const festivalsLimit = currentPlan === 'PRO' ? 5 : currentPlan === 'ENTERPRISE' ? -1 : 1
        const publishedCount = user.festivals.length

        if (festivalsLimit !== -1 && publishedCount >= festivalsLimit) {
          return NextResponse.json(
            { 
              error: `Publishing limit reached. You've published ${publishedCount} of ${festivalsLimit} festival${festivalsLimit > 1 ? 's' : ''} on your ${currentPlan} plan. Upgrade to Pro to publish more.`,
              code: 'LIMIT_REACHED'
            },
            { status: 403 }
          )
        }
      }
    }
    
    // Validate the update data
    const updateData: any = {}
    
    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.location !== undefined) updateData.location = body.location
    if (body.startDate !== undefined) updateData.startDate = new Date(body.startDate)
    if (body.endDate !== undefined) updateData.endDate = new Date(body.endDate)
    if (body.timezone !== undefined) updateData.timezone = body.timezone
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished
    if (body.presenterLabel !== undefined) updateData.presenterLabel = body.presenterLabel
    if (body.whatsappLink !== undefined) updateData.whatsappLink = body.whatsappLink
    if (body.telegramLink !== undefined) updateData.telegramLink = body.telegramLink
    if (body.facebookLink !== undefined) updateData.facebookLink = body.facebookLink
    if (body.instagramLink !== undefined) updateData.instagramLink = body.instagramLink
    if (body.headerFont !== undefined) updateData.headerFont = body.headerFont
    if (body.hideWatermark !== undefined) updateData.hideWatermark = body.hideWatermark

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