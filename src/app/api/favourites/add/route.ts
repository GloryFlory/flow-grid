/**
 * POST /api/favourites/add
 * 
 * Add a session to user's favourites
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackEvent } from '@/lib/trackEvent'
import { z } from 'zod'

const addFavouriteSchema = z.object({
  anonUserId: z.string().uuid('Invalid user ID'),
  sessionId: z.string().min(1, 'Session ID is required'),
  festivalId: z.string().min(1, 'Festival ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { anonUserId, sessionId, festivalId } = addFavouriteSchema.parse(body)

    // Check if session exists
    const session = await prisma.festivalSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if already favourited (upsert to be idempotent)
    const favourite = await prisma.sessionFavourite.upsert({
      where: {
        anonUserId_sessionId: {
          anonUserId,
          sessionId
        }
      },
      update: {}, // No update needed if exists
      create: {
        anonUserId,
        sessionId,
        festivalId
      }
    })

    // Track the favourite event in analytics
    await trackEvent({
      event: 'session_favourited',
      deviceId: anonUserId,
      festivalId,
      properties: {
        sessionId,
        sessionTitle: session.title,
        action: 'add'
      }
    })

    return NextResponse.json({
      success: true,
      favourite: {
        id: favourite.id,
        sessionId: favourite.sessionId,
        festivalId: favourite.festivalId,
        createdAt: favourite.createdAt.toISOString()
      }
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error adding favourite:', error)
    return NextResponse.json(
      { error: 'Failed to add favourite' },
      { status: 500 }
    )
  }
}
