import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Extract teacher name from filename (remove extension and format)
    const originalName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
    const teacherName = originalName
      .split(/[-_\s]+/) // Split on hyphens, underscores, or spaces
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${originalName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-${timestamp}.${extension}`

    // Ensure teachers directory exists
    const teachersDir = join(process.cwd(), 'public', 'teachers')
    if (!existsSync(teachersDir)) {
      await mkdir(teachersDir, { recursive: true })
    }

    // Save file
    const filePath = join(teachersDir, filename)
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Save to database
    const photo = await prisma.teacherPhoto.create({
      data: {
        filename,
        teacherName,
        filePath: `/teachers/${filename}`,
        fileSize: file.size,
        mimeType: file.type,
      }
    })

    return NextResponse.json({
      success: true,
      photo
    })
  } catch (error) {
    console.error('Error uploading teacher photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}