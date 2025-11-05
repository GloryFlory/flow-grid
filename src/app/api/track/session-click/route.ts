import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Track session click events
 * Called when users click on a session to view details
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { festivalId, sessionId, sessionTitle } = body

    if (!festivalId) {
      return NextResponse.json(
        { error: 'Festival ID is required' },
        { status: 400 }
      )
    }

    // Get device ID from cookies or generate new one
    const cookies = request.cookies
    let deviceId = cookies.get('deviceId')?.value

    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(7)}`
    }

    // Track the session click
    await prisma.analytics.create({
      data: {
        festivalId,
        event: 'session_clicked',
        deviceId,
        properties: {
          sessionId,
          sessionTitle,
        },
        timestamp: new Date(),
      },
    })

    // Return response with device ID cookie
    const response = NextResponse.json({ success: true })
    
    // Set cookie with 1 year expiry
    response.cookies.set('deviceId', deviceId, {
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: true,
      sameSite: 'lax',
    })

    return response
  } catch (error) {
    console.error('Session click tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track session click' },
      { status: 500 }
    )
  }
}
