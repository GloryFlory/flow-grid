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

    // Get all unique facilitators from sessions for this festival
    const sessions = await prisma.festivalSession.findMany({
      where: {
        festivalId: festivalId
      },
      select: {
        teachers: true
      }
    })

    // Extract all unique facilitator names and count sessions per facilitator
    const facilitatorMap = new Map<string, number>()
    
    sessions.forEach(session => {
      session.teachers.forEach(teacher => {
        if (teacher && teacher.trim()) {
          const normalizedName = teacher.trim()
          const current = facilitatorMap.get(normalizedName) || 0
          facilitatorMap.set(normalizedName, current + 1)
        }
      })
    })

    // Get ALL facilitator records for this festival WITH their photos
    const allFacilitatorRecords = await prisma.teacher.findMany({
      where: {
        festivalId: festivalId
      },
      include: {
        photos: true // Get photos linked to this teacher
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Create photo map from teacher records (festival-scoped only!)
    const photoMap = new Map<string, typeof allFacilitatorRecords[0]['photos']>()
    allFacilitatorRecords.forEach(record => {
      const key = record.name.toLowerCase().trim()
      photoMap.set(key, record.photos)
    })

    // Create a map of existing facilitator records by name (case-insensitive)
    const recordMap = new Map<string, typeof allFacilitatorRecords[0]>()
    allFacilitatorRecords.forEach(record => {
      recordMap.set(record.name.toLowerCase().trim(), record)
    })

    // Build the complete list: facilitators from sessions + existing records
    const allFacilitators = new Set<string>()
    
    // Add all facilitators from sessions
    facilitatorMap.forEach((count, name) => {
      allFacilitators.add(name)
    })
    
    // Add any facilitators from records that might not be in sessions anymore
    allFacilitatorRecords.forEach(record => {
      allFacilitators.add(record.name)
    })

    // Convert to the expected format
    const teachers = Array.from(allFacilitators).map(name => {
      const nameKey = name.toLowerCase().trim()
      const photos = photoMap.get(nameKey) || []
      const sessionCount = facilitatorMap.get(name) || 0
      const record = recordMap.get(nameKey)
      
      return {
        name: name,
        sessionCount,
        hasPhoto: photos.length > 0,
        teacherRecord: record ? {
          id: record.id,
          name: record.name,
          url: record.url || undefined,
          isGroup: record.isGroup,
          photos: photos.map(p => ({ id: p.id, filePath: p.filePath }))
        } : undefined
      }
    }).sort((a, b) => {
      // Sort by session count (desc), then by name (asc)
      if (a.sessionCount !== b.sessionCount) {
        return b.sessionCount - a.sessionCount
      }
      return a.name.localeCompare(b.name)
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
    console.error('Error fetching facilitators:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}