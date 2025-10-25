import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const teacherName = formData.get('teacherName') as string

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

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate filename
    let filename: string
    if (teacherName) {
      // Use provided teacher name to generate filename
      const normalizedName = teacherName
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      filename = `${normalizedName}.${extension}`
    } else {
      // Use original filename, normalized
      const name = file.name.split('.')[0]
      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const normalizedName = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '')
      filename = `${normalizedName}.${extension}`
    }

    // Ensure teachers directory exists
    const teachersDir = join(process.cwd(), 'public', 'teachers')
    if (!existsSync(teachersDir)) {
      await mkdir(teachersDir, { recursive: true })
    }

    // Write file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(teachersDir, filename)
    await writeFile(filePath, buffer)

    // Save to database (optional - for tracking uploads)
    try {
      await prisma.teacherPhoto.create({
        data: {
          filename,
          teacherName: teacherName || extractTeacherNameFromFilename(filename),
          filePath: `/teachers/${filename}`,
          fileSize: file.size,
          mimeType: file.type,
        }
      })
    } catch (dbError) {
      console.warn('Could not save to database, but file uploaded successfully:', dbError)
      // Continue - file upload succeeded even if DB save failed
    }

    return NextResponse.json({
      success: true,
      filename,
      url: `/teachers/${filename}`,
      message: 'Photo uploaded successfully'
    })

  } catch (error) {
    console.error('Error uploading teacher photo:', error)
    return NextResponse.json(
      { error: 'Failed to upload photo' },
      { status: 500 }
    )
  }
}

// Helper function to extract teacher name from filename
function extractTeacherNameFromFilename(filename: string): string {
  const nameWithoutExt = filename.split('.')[0]
  return nameWithoutExt
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}