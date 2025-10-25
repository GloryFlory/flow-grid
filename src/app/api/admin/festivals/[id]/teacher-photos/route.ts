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

    // Get teachers that are used in this festival's sessions
    const sessions = await prisma.festivalSession.findMany({
      where: {
        festivalId: festivalId
      },
      select: {
        teachers: true
      }
    })

    // Get all unique teacher names for this festival
    const festivalTeachers = new Set<string>()
    sessions.forEach(session => {
      session.teachers.forEach(teacher => {
        if (teacher) {
          festivalTeachers.add(teacher)
        }
      })
    })

    // Get photos for teachers who are in this festival (using old teacherName field)
    const photos = await prisma.teacherPhoto.findMany({
      where: {
        teacherName: {
          in: Array.from(festivalTeachers)
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(
      { photos },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching teacher photos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const formData = await request.formData()
    const files = formData.getAll('photos') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const uploadedPhotos = []

    for (const file of files) {
      if (file.size === 0) continue

      // Extract teacher name from filename (remove extension and clean up)
      const teacherName = file.name
        .replace(/\.(jpg|jpeg|png|webp)$/i, '')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')

      // Save file (in production, this would go to Supabase Storage)
      const timestamp = Date.now()
      const extension = file.name.split('.').pop()
      const filename = `${teacherName.toLowerCase().replace(/\s+/g, '-')}-${timestamp}.${extension}`
      const filePath = `/teachers/${filename}`

      // For now, we'll just store the metadata
      // In production, you'd upload to Supabase Storage here
      
      try {
        const photo = await prisma.teacherPhoto.create({
          data: {
            filename,
            teacherName,
            filePath,
            fileSize: file.size,
            mimeType: file.type,
          }
        })

        uploadedPhotos.push(photo)
      } catch (error) {
        console.error(`Error saving photo for ${teacherName}:`, error)
        // Continue with other files
      }
    }

    return NextResponse.json(
      { 
        photos: uploadedPhotos,
        message: `Successfully uploaded ${uploadedPhotos.length} photos`
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error uploading teacher photos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}