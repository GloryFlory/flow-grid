import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET() {
  try {
    // Get photos from database
    const dbPhotos = await prisma.teacherPhoto.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Also scan the teachers directory for files
    const teachersDir = join(process.cwd(), 'public', 'teachers')
    let filesInDirectory: string[] = []
    
    if (existsSync(teachersDir)) {
      try {
        filesInDirectory = await readdir(teachersDir)
        filesInDirectory = filesInDirectory.filter(file => 
          file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        )
      } catch (error) {
        console.warn('Could not read teachers directory:', error)
      }
    }

    // Merge database records with files on disk
    const photoMap = new Map()
    
    // Add database records
    dbPhotos.forEach(photo => {
      photoMap.set(photo.filename, {
        id: photo.id,
        filename: photo.filename,
        teacherName: photo.teacherName,
        url: photo.filePath,
        uploadedAt: photo.createdAt.toISOString(),
        source: 'database'
      })
    })

    // Add files from disk that aren't in database
    filesInDirectory.forEach(filename => {
      if (!photoMap.has(filename)) {
        photoMap.set(filename, {
          id: `file-${filename}`,
          filename,
          teacherName: extractTeacherNameFromFilename(filename),
          url: `/teachers/${filename}`,
          uploadedAt: new Date().toISOString(),
          source: 'filesystem'
        })
      }
    })

    const photos = Array.from(photoMap.values())

    return NextResponse.json({
      success: true,
      photos,
      count: photos.length
    })

  } catch (error) {
    console.error('Error fetching teacher photos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teacher photos' },
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