import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the photo record
    const photo = await prisma.teacherPhoto.findUnique({
      where: { id }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    // Delete the file from filesystem
    try {
      const filePath = join(process.cwd(), 'public', photo.filePath)
      await unlink(filePath)
    } catch (fileError) {
      console.warn('Could not delete file:', photo.filePath, fileError)
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await prisma.teacherPhoto.delete({
      where: { id }
    })

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