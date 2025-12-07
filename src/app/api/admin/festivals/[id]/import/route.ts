import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'
import { requireFestivalAccess } from '@/lib/festival-access'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await params

    // Check festival access - require edit permission to import
    const { error } = await requireFestivalAccess(festivalId, { requireEdit: true })
    if (error) return error

    // Verify festival exists
    const existingFestival = await prisma.festival.findUnique({
      where: { id: festivalId }
    })

    if (!existingFestival) {
      return NextResponse.json(
        { error: 'Festival not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const backup = body.backup

    // Validate backup structure
    if (!backup || !backup.exportVersion || !backup.festival) {
      return NextResponse.json(
        { error: 'Invalid backup file format' },
        { status: 400 }
      )
    }

    // Delete existing sessions and teachers (photos will cascade)
    await prisma.festivalSession.deleteMany({
      where: { festivalId }
    })

    await prisma.teacher.deleteMany({
      where: { festivalId }
    })

    // Restore sessions
    if (backup.sessions && Array.isArray(backup.sessions)) {
      for (const session of backup.sessions) {
        await prisma.festivalSession.create({
          data: {
            id: session.id,
            title: session.title,
            description: session.description,
            day: session.day,
            startTime: session.startTime,
            endTime: session.endTime,
            location: session.location,
            level: session.level,
            styles: session.styles || [],
            prerequisites: session.prerequisites,
            capacity: session.capacity,
            teachers: session.teachers || [],
            teacherBios: session.teacherBios || [],
            cardType: session.cardType || 'full',
            festivalId: festivalId,
            createdAt: new Date(session.createdAt),
            updatedAt: new Date(session.updatedAt)
          } as any
        })
      }
    }

    // Restore teachers (but not photos - those need to be re-uploaded)
    if (backup.teachers && Array.isArray(backup.teachers)) {
      for (const teacher of backup.teachers) {
        await prisma.teacher.create({
          data: {
            id: teacher.id,
            festivalId: festivalId,
            name: teacher.name,
            url: teacher.url,
            isGroup: teacher.isGroup || false,
            createdAt: new Date(teacher.createdAt),
            updatedAt: new Date(teacher.updatedAt)
          }
        })
        // Note: Photos are NOT restored automatically as they're stored in Supabase Storage
        // Users will need to re-upload photos after restore
      }
    }

    // Update festival metadata (but keep current ID, slug, userId)
    const festivalData = backup.festival
    await prisma.festival.update({
      where: { id: festivalId },
      data: {
        name: festivalData.name,
        description: festivalData.description,
        location: festivalData.location,
        startDate: new Date(festivalData.startDate),
        endDate: new Date(festivalData.endDate),
        timezone: festivalData.timezone,
        logo: festivalData.logo,
        primaryColor: festivalData.primaryColor,
        secondaryColor: festivalData.secondaryColor,
        accentColor: festivalData.accentColor,
        // Note: We intentionally don't restore isPublished, customDomain, or slug
        // to prevent accidental overwrites
      } as any
    })

    return NextResponse.json({ 
      success: true,
      message: 'Festival data restored successfully',
      restored: {
        sessions: backup.sessions?.length || 0,
        teachers: backup.teachers?.length || 0,
        photosNote: 'Teacher photos must be re-uploaded manually'
      }
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Failed to import festival data', details: String(error) },
      { status: 500 }
    )
  }
}
