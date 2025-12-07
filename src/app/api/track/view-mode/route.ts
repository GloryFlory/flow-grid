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

    // Check for cookie consent
    const cookieConsent = request.cookies.get('flow-grid-cookie-consent')?.value
    const hasConsent = cookieConsent === 'accepted'

    // Get device ID from cookie or generate one
    const deviceId = request.cookies.get('device_id')?.value || 
                    request.cookies.get('deviceId')?.value ||
                    `device_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Only track if user has consented to analytics
    if (hasConsent) {
      await trackViewModeChanged(festivalId, viewMode, deviceId)
    }

    // Set device ID cookie if not already set AND user has consented
    const response = NextResponse.json({ success: true })
    if (hasConsent && !request.cookies.get('device_id') && !request.cookies.get('deviceId')) {
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
