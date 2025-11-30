/**
 * API Route for tracking view mode changes
 * Called when users switch between Cards, Grid, or My Schedule views
 */

import { NextRequest, NextResponse } from 'next/server'
import { trackViewModeChanged } from '@/lib/trackEvent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { festivalId, viewMode } = body

    if (!festivalId || !viewMode) {
      return NextResponse.json(
        { error: 'Missing festivalId or viewMode' },
        { status: 400 }
      )
    }

    // Get device ID from cookie
    const deviceId = request.cookies.get('device_id')?.value || 
                    request.cookies.get('deviceId')?.value ||
                    `device_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Track the view mode change
    await trackViewModeChanged(festivalId, viewMode, deviceId)

    // Set device ID cookie if not already set
    const response = NextResponse.json({ success: true })
    if (!request.cookies.get('device_id') && !request.cookies.get('deviceId')) {
      response.cookies.set('device_id', deviceId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: 'lax'
      })
    }

    return response
  } catch (error) {
    console.error('View mode tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track view mode' },
      { status: 500 }
    )
  }
}
