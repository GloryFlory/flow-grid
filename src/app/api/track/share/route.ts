/**
 * API Route for tracking schedule shares
 * Called when users share a festival schedule
 */

import { NextRequest, NextResponse } from 'next/server'
import { trackScheduleShare } from '@/lib/trackEvent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { festivalId, method } = body

    if (!festivalId || !method) {
      return NextResponse.json(
        { error: 'Missing festivalId or method' },
        { status: 400 }
      )
    }

    // Get device ID from cookie or generate one
    const deviceId = request.cookies.get('device_id')?.value || 
                    `device_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Track the share event
    await trackScheduleShare(festivalId, method, deviceId)

    // Set device ID cookie if not already set
    const response = NextResponse.json({ success: true })
    if (!request.cookies.get('device_id')) {
      response.cookies.set('device_id', deviceId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        sameSite: 'lax'
      })
    }

    return response
  } catch (error) {
    console.error('Share tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track share' },
      { status: 500 }
    )
  }
}
