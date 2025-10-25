import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { readdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET() {
  try {
    // Get all sessions to extract teacher names
    const sessions = await prisma.festivalSession.findMany({
      select: {
        teachers: true
      }
    })

    // Extract unique teacher names
    const teacherNames = new Set<string>()
    sessions.forEach(session => {
      session.teachers.forEach(teacher => {
        if (teacher && teacher.trim()) {
          teacherNames.add(teacher.trim())
        }
      })
    })

    // Get existing photo files
    const teachersDir = join(process.cwd(), 'public', 'teachers')
    let existingFiles: string[] = []
    
    if (existsSync(teachersDir)) {
      try {
        existingFiles = await readdir(teachersDir)
        existingFiles = existingFiles.filter(file => 
          file.match(/\.(jpg|jpeg|png|gif|webp)$/i)
        )
      } catch (error) {
        console.warn('Could not read teachers directory:', error)
      }
    }

    // Create teacher objects with photo status
    const teachers = Array.from(teacherNames).map(name => {
      const suggestedFilename = generateSuggestedFilename(name)
      const hasPhoto = checkIfPhotoExists(name, existingFiles)
      
      return {
        name,
        hasPhoto,
        suggestedFilename: hasPhoto ? findExistingFilename(name, existingFiles) : suggestedFilename
      }
    })

    // Sort teachers: missing photos first
    teachers.sort((a, b) => {
      if (a.hasPhoto && !b.hasPhoto) return 1
      if (!a.hasPhoto && b.hasPhoto) return -1
      return a.name.localeCompare(b.name)
    })

    return NextResponse.json({
      success: true,
      teachers,
      totalTeachers: teachers.length,
      teachersWithPhotos: teachers.filter(t => t.hasPhoto).length,
      teachersWithoutPhotos: teachers.filter(t => !t.hasPhoto).length
    })

  } catch (error) {
    console.error('Error fetching teachers from sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teachers from sessions' },
      { status: 500 }
    )
  }
}

function generateSuggestedFilename(teacherName: string): string {
  return teacherName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') + '.jpg'
}

function checkIfPhotoExists(teacherName: string, existingFiles: string[]): boolean {
  const baseName = teacherName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  
  return existingFiles.some(file => {
    const fileName = file.split('.')[0]
    return fileName === baseName
  })
}

function findExistingFilename(teacherName: string, existingFiles: string[]): string {
  const baseName = teacherName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
  
  const matchingFile = existingFiles.find(file => {
    const fileName = file.split('.')[0]
    return fileName === baseName
  })
  
  return matchingFile || generateSuggestedFilename(teacherName)
}