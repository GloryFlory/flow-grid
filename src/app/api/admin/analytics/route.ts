/**
 * Admin Analytics API Route
 * Returns platform analytics data for admin dashboard
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { 
  getPlatformOverview, 
  getWeeklyStats, 
  getFestivalHealthList 
} from '@/lib/adminAnalytics'

export async function GET() {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }

    // Fetch all analytics data
    const [overview, weeklyStats, festivalHealth] = await Promise.all([
      getPlatformOverview(),
      getWeeklyStats(),
      getFestivalHealthList()
    ])

    return NextResponse.json({
      overview,
      weeklyStats,
      festivalHealth
    })
  } catch (error) {
    console.error('Admin analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
