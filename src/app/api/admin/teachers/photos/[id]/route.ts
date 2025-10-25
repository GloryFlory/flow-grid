import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Try to find photo in database first
    let photoRecord = null
    let filename = ''
    
    try {
      if (id.startsWith('file-')) {
        // This is a filesystem-only file
        filename = id.replace('file-', '')
      } else {
        // This is a database record
        photoRecord = await prisma.teacherPhoto.findUnique({
          where: { id }
        })
        
        if (!photoRecord) {
          return NextResponse.json(
            { error: 'Photo not found' },
            { status: 404 }
          )
        }
        
        filename = photoRecord.filename
      }
    } catch (dbError) {
      console.warn('Database query failed, treating as filesystem file:', dbError)
      if (id.startsWith('file-')) {
        filename = id.replace('file-', '')
      } else {
        return NextResponse.json(
          { error: 'Photo not found' },
          { status: 404 }
        )
      }
    }

    // Delete physical file
    const filePath = join(process.cwd(), 'public', 'teachers', filename)
    if (existsSync(filePath)) {
      try {
        await unlink(filePath)
      } catch (fileError) {
        console.error('Error deleting file:', fileError)
        return NextResponse.json(
          { error: 'Failed to delete photo file' },
          { status: 500 }
        )
      }
    }

    // Delete database record if it exists
    if (photoRecord) {
      try {
        await prisma.teacherPhoto.delete({
          where: { id }
        })
      } catch (dbError) {
        console.warn('Could not delete from database, but file was deleted:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Photo deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting teacher photo:', error)
    return NextResponse.json(
      { error: 'Failed to delete photo' },
      { status: 500 }
    )
  }
}