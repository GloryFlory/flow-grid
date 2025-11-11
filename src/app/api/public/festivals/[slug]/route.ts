import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Optimized query - get published festival with all sessions and teachers
    const festival = await prisma.festival.findUnique({
      where: { 
        slug,
        isPublished: true // Only show published festivals
      },
      include: {
        sessions: true,
        teachers: true
      }
    })

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found or not published' },
        { status: 404 }
      )
    }

    // Create maps for ONLY this festival's teachers (privacy fix!)
    const f: any = festival as any
    
    // Fetch teacher photos for this festival's teachers
    const teacherNames = (f.teachers as any[]).map((t: any) => t.name)
    const teacherPhotos = await prisma.teacherPhoto.findMany({
      where: {
        OR: [
          { teacherName: { in: teacherNames } },
          { 
            teacher: {
              festivalId: festival.id
            }
          } as any
        ]
      }
    })
    
    // Create teacher photo map by name (use first photo found)
    const teacherPhotoMap = teacherPhotos.reduce((acc: Record<string, string>, photo: any) => {
      const teacherKey = photo.teacherName.toLowerCase().trim()
      if (!acc[teacherKey]) {
        acc[teacherKey] = photo.filePath
      }
      return acc
    }, {})

    const teacherUrlMap = (f.teachers as any[]).reduce((acc: Record<string, string | null>, teacher: any) => {
      acc[teacher.name.toLowerCase().trim()] = teacher.url
      return acc
    }, {})

    // Helper function to get teacher photo for a session
    const getTeacherPhoto = (teachers: string[]) => {
      if (!teachers || teachers.length === 0) return null
      
      // Try to find a photo for any of the teachers
      for (const teacher of teachers) {
        const teacherKey = teacher.toLowerCase().trim()
        if (teacherPhotoMap[teacherKey]) {
          return teacherPhotoMap[teacherKey]
        }
      }
      
      return null
    }

    // Helper function to get all teacher photos for a session
    const getTeacherPhotos = (teachers: string[]) => {
      if (!teachers || teachers.length === 0) return []
      
      return teachers.map(teacher => {
        const teacherKey = teacher.toLowerCase().trim()
        return teacherPhotoMap[teacherKey] || null
      })
    }

    // Helper function to get teacher URLs for a session
    const getTeacherUrls = (teachers: string[]) => {
      if (!teachers || teachers.length === 0) return []
      
      return teachers.map(teacher => {
        const teacherKey = teacher.toLowerCase().trim()
        return teacherUrlMap[teacherKey] || null
      })
    }

    // Helper: compute canonical full datetime for sorting and display
    const computeFullDateTime = (session: any): { dayISO: string, start: string, end: string, fullStart: string, fullEnd: string } => {
      const hasFullDatetime = session.startTime && session.startTime.includes('T')
      if (hasFullDatetime) {
        const dayISO = session.startTime.split('T')[0]
        const start = session.startTime.split('T')[1]?.substring(0,5) || '00:00'
        const end = session.endTime?.split('T')[1]?.substring(0,5) || '01:00'
        return { dayISO, start, end, fullStart: session.startTime, fullEnd: session.endTime || session.startTime }
      }
      // OLD FORMAT: try to derive date from session.day or festival range
      const tryParseDayToISO = (): string | null => {
        if (!session.day) return null
        // Try parse as date string
        const parsed = Date.parse(session.day)
        if (!isNaN(parsed)) return new Date(parsed).toISOString().split('T')[0]
        // Try map day name within festival range
        const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
        const idx = dayNames.indexOf(String(session.day))
        if (idx !== -1) {
          // Parse festival dates - handle both Date objects and ISO strings
          const startValue: any = festival.startDate
          const endValue: any = festival.endDate
          
          let festivalStart: Date
          let festivalEnd: Date
          
          if (startValue instanceof Date) {
            festivalStart = startValue
            festivalEnd = endValue instanceof Date ? endValue : new Date(endValue)
          } else {
            const startStr = String(startValue)
            const endStr = String(endValue)
            festivalStart = new Date(startStr.includes('T') ? startStr : startStr + 'T00:00:00Z')
            festivalEnd = new Date(endStr.includes('T') ? endStr : endStr + 'T00:00:00Z')
          }
          
          // Validate dates
          if (isNaN(festivalStart.getTime()) || isNaN(festivalEnd.getTime())) {
            console.error('Invalid festival dates in public API:', { startDate: festival.startDate, endDate: festival.endDate })
            return null
          }
          
          const cur = new Date(festivalStart)
          while (cur <= festivalEnd && cur.getUTCDay() !== idx) cur.setUTCDate(cur.getUTCDate()+1)
          if (cur <= festivalEnd) return cur.toISOString().split('T')[0]
          // Not found in range, use first occurrence after start
          const fallback = new Date(festivalStart)
          let safety = 0
          while (fallback.getUTCDay() !== idx && safety < 8) {
            fallback.setUTCDate(fallback.getUTCDate()+1)
            safety++
          }
          
          if (isNaN(fallback.getTime())) {
            console.error('Invalid fallback date in public API for day:', session.day)
            return null
          }
          
          return fallback.toISOString().split('T')[0]
        }
        return null
      }
      
      // Get the festival start date safely
      let festivalStartISO: string
      const startValue: any = festival.startDate
      if (startValue instanceof Date) {
        festivalStartISO = startValue.toISOString().split('T')[0]
      } else {
        const startStr = String(startValue)
        const parsed = new Date(startStr.includes('T') ? startStr : startStr + 'T00:00:00Z')
        festivalStartISO = isNaN(parsed.getTime()) ? '2025-01-01' : parsed.toISOString().split('T')[0]
      }
      
      const dayISO = tryParseDayToISO() || festivalStartISO
      const start = (session.startTime || '00:00').substring(0,5)
      const end = (session.endTime || '01:00').substring(0,5)
      const fullStart = `${dayISO}T${start}:00`
      const fullEnd = `${dayISO}T${end}:00`
      return { dayISO, start, end, fullStart, fullEnd }
    }

    // Streamlined transformation with sorting by datetime primarily
    const transformedSessions = (f.sessions as any[])
      .map((session: any) => {
        const computed = computeFullDateTime(session)
        // Determine if this is new format (datetime string) or old format (just time + day name)
        const hasFullDatetime = session.startTime && session.startTime.includes('T')
        const dayValue = computed.dayISO
        const startTimeValue = computed.start
        const endTimeValue = computed.end
        const fullStartTime = computed.fullStart
        const fullEndTime = computed.fullEnd

        return {
          id: session.id,
          title: session.title,
          description: session.description || '',
          day: dayValue, // Always YYYY-MM-DD format
          start: startTimeValue, // Just time (HH:mm)
          end: endTimeValue, // Just time (HH:mm)
          startTime: fullStartTime, // Full datetime string
          endTime: fullEndTime, // Full datetime string
          location: session.location || '',
          level: session.level || 'All Levels',
          styles: session.styles || [],
          teachers: session.teachers || [],
          teacherPhoto: getTeacherPhoto(session.teachers || []), // Single photo for backward compatibility
          teacherPhotos: getTeacherPhotos(session.teachers || []), // Array of photos for each teacher
          teacherUrls: getTeacherUrls(session.teachers || []),
          prereqs: session.prerequisites || '',
          capacity: session.capacity || 20,
          currentBookings: 0, // TODO: Implement booking system
          cardType: session.cardType || 'detailed',
          bookingEnabled: session.bookingEnabled || false,
          bookingCapacity: session.bookingCapacity || null,
          displayOrder: session.displayOrder || 0
        }
      })
      .sort((a: any, b: any) => {
        // Sort by full datetime first
        const dtA = (a.startTime || '').localeCompare(b.startTime || '')
        if (dtA !== 0) return dtA
        // Fallback to displayOrder
        const orderA = a.displayOrder || 0
        const orderB = b.displayOrder || 0
        if (orderA !== orderB) return orderA - orderB
        // Finally by title
        return (a.title || '').localeCompare(b.title || '')
      })

    const response = {
      festival: {
        id: festival.id,
        name: festival.name,
        description: festival.description,
        slug: festival.slug,
        location: festival.location,
        logo: festival.logo,
        primaryColor: festival.primaryColor,
        secondaryColor: festival.secondaryColor,
        accentColor: festival.accentColor,
        startDate: festival.startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        endDate: festival.endDate.toISOString().split('T')[0],
        timezone: festival.timezone,
        whatsappLink: (festival as any).whatsappLink,
        telegramLink: (festival as any).telegramLink,
        facebookLink: (festival as any).facebookLink,
        instagramLink: (festival as any).instagramLink
      },
      sessions: transformedSessions
    }

    // Add cache headers for better performance
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    })
  } catch (error) {
    console.error('Error fetching public festival:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}