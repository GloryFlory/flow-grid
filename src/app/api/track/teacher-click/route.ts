/**
 * API Route for tracking teacher profile clicks
 * Called when users click on a teacher's name/photo to view their bio
 */

import { NextRequest, NextResponse } from 'next/server'
import { trackTeacherClick } from '@/lib/trackEvent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { festivalId, teacherName, teacherId } = body

    if (!festivalId || !teacherName) {
      return NextResponse.json(
        { error: 'Missing festivalId or teacherName' },
        { status: 400 }
      )
    }

    // Get device ID from cookie
    const deviceId = request.cookies.get('device_id')?.value || 
                    request.cookies.get('deviceId')?.value ||
                    `device_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Track the teacher click
    await trackTeacherClick(festivalId, teacherName, teacherId, deviceId)

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
    console.error('Teacher click tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track teacher click' },
      { status: 500 }
    )
  }
}
