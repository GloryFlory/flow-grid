/**
 * POST /api/favourites/remove
 * 
 * Remove a session from user's favourites
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { trackEvent } from '@/lib/trackEvent'
import { z } from 'zod'

const removeFavouriteSchema = z.object({
  anonUserId: z.string().uuid('Invalid user ID'),
  sessionId: z.string().min(1, 'Session ID is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { anonUserId, sessionId } = removeFavouriteSchema.parse(body)

    // Try to delete the favourite
    const deleted = await prisma.sessionFavourite.deleteMany({
      where: {
        anonUserId,
        sessionId
      }
    })

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: 'Favourite not found' },
        { status: 404 }
      )
    }

    // Track the unfavourite event in analytics
    await trackEvent({
      event: 'session_unfavourited',
      deviceId: anonUserId,
      properties: {
        sessionId,
        action: 'remove'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Favourite removed'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error removing favourite:', error)
    return NextResponse.json(
      { error: 'Failed to remove favourite' },
      { status: 500 }
    )
  }
}
