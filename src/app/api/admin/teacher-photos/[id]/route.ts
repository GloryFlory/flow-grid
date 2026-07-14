import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { requireFestivalAccess } from '@/lib/festival-access'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Find the photo record, including its teacher so we can authorize
    // against the owning festival.
    const photo = await prisma.teacherPhoto.findUnique({
      where: { id },
      include: { teacher: { select: { festivalId: true } } }
    })

    if (!photo) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      )
    }

    if (photo.teacher) {
      const { error: accessError } = await requireFestivalAccess(photo.teacher.festivalId, { requireEdit: true })
      if (accessError) return accessError
    } else {
      // Orphaned photo with no linked teacher/festival — restrict to system admins.
      // Re-query the DB for role rather than trusting the JWT session, since the
      // session's role claim can be stale until the token refreshes.
      const session = await getServerSession(authOptions)
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true }
      })
      if (currentUser?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
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