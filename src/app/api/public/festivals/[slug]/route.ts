import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    
    // Optimized query - select only needed fields
    const festival = await prisma.festival.findUnique({
      where: { 
        slug,
        isPublished: true // Only show published festivals
      },
      select: {
        id: true,
        name: true,
        description: true,
        slug: true,
        location: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        startDate: true,
        endDate: true,
        timezone: true,
        sessions: {
          select: {
            id: true,
            title: true,
            description: true,
            day: true,
            startTime: true,
            endTime: true,
            location: true,
            level: true,
            styles: true,
            teachers: true,
            prerequisites: true,
            capacity: true,
            cardType: true,
          },
          // Don't order by day here - let the client sort by festival date order
          orderBy: [
            { startTime: 'asc' }
          ]
        }
      }
    })

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found or not published' },
        { status: 404 }
      )
    }

    // Get all teacher photos and URLs for efficient lookup
    const teacherPhotos = await prisma.teacherPhoto.findMany()
    const teacherPhotoMap = teacherPhotos.reduce((acc: Record<string, string>, photo) => {
      acc[photo.teacherName.toLowerCase().trim()] = photo.filePath
      return acc
    }, {})

    // Get all teachers for this festival with their URLs
    const teachers = await prisma.teacher.findMany({
      where: { festivalId: festival.id }
    })
    const teacherUrlMap = teachers.reduce((acc: Record<string, string | null>, teacher) => {
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

    // Helper function to convert date string to day name
    function convertDateToDay(dateString: string) {
      try {
        console.log('convertDateToDay input:', dateString, 'type:', typeof dateString)
        
        // If it's already a day name, return as is
        if (['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].includes(dateString)) {
          return dateString
        }
        
        // If it's a date string (YYYY-MM-DD), convert to day name
        if (dateString && dateString.includes && dateString.includes('-') && dateString.length === 10) {
          const date = new Date(dateString + 'T12:00:00.000Z') // Use noon UTC to avoid timezone issues
          console.log('Created date object:', date, 'isValid:', !isNaN(date.getTime()))
          
          if (isNaN(date.getTime())) {
            console.error('Invalid date created from:', dateString)
            return 'TBD'
          }
          
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
          const dayName = dayNames[date.getUTCDay()]
          console.log('Converted to day name:', dayName)
          return dayName
        }
        
        console.log('No conversion applied, returning:', dateString || 'TBD')
        return dateString || 'TBD'
      } catch (error) {
        console.error('Error converting date to day name:', error, 'input was:', dateString)
        return 'TBD'
      }
    }

    // Streamlined transformation
    const transformedSessions = festival.sessions.map(session => ({
      id: session.id,
      title: session.title,
      description: session.description || '',
      day: session.day === 'Invalid Date' ? 'TBD' : convertDateToDay(session.day || 'TBD'),
      start: session.startTime || '00:00',
      end: session.endTime || '01:00',
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
      cardType: session.cardType || 'detailed'
    }))

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
        timezone: festival.timezone
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