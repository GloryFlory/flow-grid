/**
 * GET /api/favourites/my
 * 
 * Get all favourites for an anonymous user
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const anonUserId = searchParams.get('anonUserId')
    const festivalId = searchParams.get('festivalId')

    if (!anonUserId) {
      return NextResponse.json(
        { error: 'anonUserId is required' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = { anonUserId }
    if (festivalId) {
      where.festivalId = festivalId
    }

    const favourites = await prisma.sessionFavourite.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            title: true,
            description: true,
            day: true,
            startTime: true,
            endTime: true,
            location: true,
            level: true,
            styles: true,
            teachers: true,
            cardType: true,
            festivalId: true
          }
        },
        festival: {
          select: {
            id: true,
            name: true,
            slug: true,
            timezone: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      favourites: favourites.map((f: any) => ({
        id: f.id,
        sessionId: f.sessionId,
        festivalId: f.festivalId,
        createdAt: f.createdAt.toISOString(),
        session: f.session,
        festival: f.festival
      }))
    })
  } catch (error) {
    console.error('Error fetching favourites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch favourites' },
      { status: 500 }
    )
  }
}
