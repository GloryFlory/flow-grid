import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { requireFestivalAccess } from '@/lib/festival-access'

// Dynamically import supabase client at runtime to avoid build-time failures when package or keys are missing
async function getSupabaseClient() {
  try {
    const mod = await import('@supabase/supabase-js')
    const { createClient } = mod
    const url = process.env.SUPABASE_URL || ''
    const key = process.env.SUPABASE_SERVICE_KEY || ''
    if (!url || !key) return null
    return createClient(url, key)
  } catch (err) {
    console.warn('Supabase client not available:', err)
    return null
  }
}

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

    // Delete the underlying file. Photos uploaded via the teachers routes store
    // a full Supabase Storage URL in filePath; legacy uploads store a local
    // '/teachers/...' path. Detect which and delete from the right place.
    if (/^https?:\/\//i.test(photo.filePath)) {
      const supabase = await getSupabaseClient()
      if (supabase) {
        const { error: storageError } = await supabase.storage.from('teachers').remove([photo.filename])
        if (storageError) {
          console.warn('Could not delete photo from Supabase storage:', photo.filename, storageError)
          // Continue with database deletion even if storage deletion fails
        }
      } else {
        console.warn('Supabase client not configured; skipping storage deletion for', photo.filename)
      }
    } else {
      try {
        const filePath = join(process.cwd(), 'public', photo.filePath)
        await unlink(filePath)
      } catch (fileError) {
        console.warn('Could not delete file:', photo.filePath, fileError)
        // Continue with database deletion even if file deletion fails
      }
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