/**
 * API Route for tracking calendar export events
 * Called when users export sessions to calendar (Google or ICS)
 */

import { NextRequest, NextResponse } from 'next/server'
import { trackCalendarExport } from '@/lib/trackEvent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { festivalId, exportType, method, sessionCount, anonUserId } = body

    if (!festivalId || !exportType || !method) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get device ID from cookie
    const deviceId = request.cookies.get('device_id')?.value || 
                    request.cookies.get('deviceId')?.value ||
                    `device_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Track the calendar export
    await trackCalendarExport(
      festivalId,
      exportType,
      method,
      sessionCount || 1,
      deviceId,
      anonUserId
    )

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
    console.error('Calendar export tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track calendar export' },
      { status: 500 }
    )
  }
}
