import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = await context.params

    // Verify festival ownership or admin access
    const festival = await prisma.festival.findUnique({
      where: { id: festivalId },
      include: {
        user: {
          select: {
            id: true,
            role: true
          }
        }
      }
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    // Authorization check - user must own the festival or be an admin
    const isOwner = festival.user.id === session.user.id
    const isAdmin = (session.user as any).role === 'ADMIN'
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to view insights for this festival' },
        { status: 403 }
      )
    }

    // Fetch all sessions for this festival
    const sessions = await prisma.festivalSession.findMany({
      where: { festivalId },
      select: {
        id: true,
        title: true,
        teachers: true,
        styles: true,
        level: true,
        day: true,
        startTime: true,
        endTime: true,
        location: true,
        bookingEnabled: true,
        _count: {
          select: {
            bookings: true
          }
        }
      }
    })

    // Calculate stats by teacher
    const teacherMap = new Map<string, { count: number; totalMinutes: number; sessions: string[] }>()
    sessions.forEach(s => {
      const duration = calculateDuration(s.startTime, s.endTime)
      s.teachers.forEach(teacher => {
        const existing = teacherMap.get(teacher) || { count: 0, totalMinutes: 0, sessions: [] }
        existing.count++
        existing.totalMinutes += duration
        existing.sessions.push(s.title)
        teacherMap.set(teacher, existing)
      })
    })
    
    const byTeacher = Array.from(teacherMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        hours: Math.round(data.totalMinutes / 60 * 10) / 10,
        sessions: data.sessions
      }))
      .sort((a, b) => b.count - a.count)

    // Calculate stats by style
    const styleMap = new Map<string, number>()
    sessions.forEach(s => {
      s.styles.forEach(style => {
        styleMap.set(style, (styleMap.get(style) || 0) + 1)
      })
    })
    
    const byStyle = Array.from(styleMap.entries())
      .map(([style, count]) => ({ style, count }))
      .sort((a, b) => b.count - a.count)

    // Calculate stats by level
    const levelMap = new Map<string, number>()
    sessions.forEach(s => {
      const level = s.level || 'Not specified'
      levelMap.set(level, (levelMap.get(level) || 0) + 1)
    })
    
    const byLevel = Array.from(levelMap.entries())
      .map(([level, count]) => ({ level, count }))
      .sort((a, b) => b.count - a.count)

    // Calculate stats by day
    const dayMap = new Map<string, number>()
    sessions.forEach(s => {
      dayMap.set(s.day, (dayMap.get(s.day) || 0) + 1)
    })
    
    const byDay = Array.from(dayMap.entries())
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => new Date(a.day).getTime() - new Date(b.day).getTime())

    // Calculate stats by location
    const locationMap = new Map<string, number>()
    sessions.forEach(s => {
      const location = s.location || 'Not specified'
      locationMap.set(location, (locationMap.get(location) || 0) + 1)
    })
    
    const byLocation = Array.from(locationMap.entries())
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)

    // Calculate total teaching hours
    const totalMinutes = sessions.reduce((acc, s) => acc + calculateDuration(s.startTime, s.endTime), 0)
    const totalHours = Math.round(totalMinutes / 60 * 10) / 10

    // Calculate average session duration
    const avgDuration = sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0

    // Get booking stats
    const totalBookings = sessions.reduce((acc, s) => acc + s._count.bookings, 0)
    const sessionsWithBookings = sessions.filter(s => s.bookingEnabled).length

    // Summary stats
    const summary = {
      totalSessions: sessions.length,
      uniqueTeachers: teacherMap.size,
      uniqueStyles: styleMap.size,
      uniqueDays: dayMap.size,
      uniqueLocations: locationMap.size,
      totalHours,
      avgDuration,
      totalBookings,
      sessionsWithBookings
    }

    return NextResponse.json({
      summary,
      byTeacher,
      byStyle,
      byLevel,
      byDay,
      byLocation
    })
  } catch (error) {
    console.error('Error fetching festival insights:', error)
    return NextResponse.json(
      { error: 'Failed to fetch festival insights' },
      { status: 500 }
    )
  }
}

/**
 * Calculate duration in minutes from start and end time strings
 * Handles formats like "09:00", "9:00 AM", "14:30"
 */
function calculateDuration(startTime: string, endTime: string): number {
  try {
    const parseTime = (timeStr: string): number => {
      // Handle formats: "09:00", "9:00", "9:00 AM", "14:30"
      const cleaned = timeStr.trim().toLowerCase()
      let hours = 0
      let minutes = 0

      if (cleaned.includes('am') || cleaned.includes('pm')) {
        const match = cleaned.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/)
        if (match) {
          hours = parseInt(match[1])
          minutes = parseInt(match[2] || '0')
          if (match[3] === 'pm' && hours !== 12) hours += 12
          if (match[3] === 'am' && hours === 12) hours = 0
        }
      } else {
        const parts = cleaned.split(':')
        hours = parseInt(parts[0])
        minutes = parseInt(parts[1] || '0')
      }

      return hours * 60 + minutes
    }

    const startMinutes = parseTime(startTime)
    const endMinutes = parseTime(endTime)
    
    // Handle overnight sessions
    if (endMinutes < startMinutes) {
      return (24 * 60 - startMinutes) + endMinutes
    }
    
    return endMinutes - startMinutes
  } catch {
    return 60 // Default to 1 hour if parsing fails
  }
}
