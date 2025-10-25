import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await params

    if (!festivalId) {
      return NextResponse.json(
        { error: 'Festival ID is required' },
        { status: 400 }
      )
    }

    // Get all unique teachers from sessions for this festival
    const sessions = await prisma.festivalSession.findMany({
      where: {
        festivalId: festivalId
      },
      select: {
        teachers: true
      }
    })

    // Count sessions per teacher
    const sessionCountMap = new Map<string, number>()
    
    sessions.forEach(session => {
      session.teachers.forEach(teacher => {
        if (teacher) {
          const current = sessionCountMap.get(teacher.toLowerCase().trim()) || 0
          sessionCountMap.set(teacher.toLowerCase().trim(), current + 1)
        }
      })
    })

    // Get ALL teacher records for this festival
    const allTeacherRecords = await prisma.teacher.findMany({
      where: {
        festivalId: festivalId
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get all photos
    const allPhotos = await prisma.teacherPhoto.findMany()

    // Create photo map (case-insensitive)
    const photoMap = new Map<string, typeof allPhotos[0][]>()
    allPhotos.forEach(photo => {
      const key = photo.teacherName.toLowerCase().trim()
      if (!photoMap.has(key)) {
        photoMap.set(key, [])
      }
      photoMap.get(key)!.push(photo)
    })

    // Convert teacher records to the expected format
    const teachers = allTeacherRecords.map(record => {
      const nameKey = record.name.toLowerCase().trim()
      const photos = photoMap.get(nameKey) || []
      const sessionCount = sessionCountMap.get(nameKey) || 0
      
      return {
        name: record.name,
        sessionCount,
        hasPhoto: photos.length > 0,
        teacherRecord: {
          id: record.id,
          name: record.name,
          url: record.url || undefined,
          isGroup: record.isGroup,
          photos: photos.map(p => ({ id: p.id, filePath: p.filePath }))
        }
      }
    })

    return NextResponse.json(
      { teachers },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}