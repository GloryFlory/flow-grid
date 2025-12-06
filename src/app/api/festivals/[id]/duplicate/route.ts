import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PLAN_FEATURES } from '@/types'

/**
 * Duplicate a festival with all its sessions and teachers
 * POST /api/festivals/[id]/duplicate
 * 
 * Body options:
 * - name: string (optional) - New festival name, defaults to "Copy of {original name}"
 * - shiftDays: number (optional) - Number of days to shift all session dates forward
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has cloneEvents feature (Pro+ only)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    })

    const currentPlan = user?.subscription?.plan || 'FREE'
    const isAdmin = user?.role === 'ADMIN'
    const planFeatures = PLAN_FEATURES[currentPlan]
    
    if (!isAdmin && !planFeatures.cloneEvents) {
      return NextResponse.json(
        { error: 'Duplicate events is a Pro feature. Please upgrade to continue.' },
        { status: 403 }
      )
    }

    const { id } = await params
    
    // Parse optional body
    let body: { name?: string; shiftDays?: number } = {}
    try {
      body = await request.json()
    } catch {
      // Body is optional, use defaults
    }

    // Fetch the original festival with all related data
    const originalFestival = await prisma.festival.findUnique({
      where: { 
        id,
        userId: session.user.id // Ensure user owns this festival
      },
      include: {
        sessions: true,
        teachers: {
          include: {
            photos: true
          }
        }
      }
    })

    if (!originalFestival) {
      return NextResponse.json(
        { error: 'Festival not found or you do not have permission to duplicate it' },
        { status: 404 }
      )
    }

    // Cast to include all fields (presenterLabel exists in schema but may not be in generated types yet)
    const festival = originalFestival as typeof originalFestival & { presenterLabel?: string; headerFont?: string | null }

    // Generate a unique slug
    const baseSlug = originalFestival.slug + '-copy'
    let newSlug = baseSlug
    let counter = 1
    
    // Keep trying until we find a unique slug
    while (await prisma.festival.findUnique({ where: { slug: newSlug } })) {
      newSlug = `${baseSlug}-${counter}`
      counter++
    }

    // Calculate date shift
    const shiftDays = body.shiftDays ?? 0
    const shiftMs = shiftDays * 24 * 60 * 60 * 1000

    // Determine new festival name
    const newName = body.name || `Copy of ${originalFestival.name}`

    // Calculate new dates
    const newStartDate = new Date(originalFestival.startDate.getTime() + shiftMs)
    const newEndDate = new Date(originalFestival.endDate.getTime() + shiftMs)

    // Create the duplicated festival - use longer timeout for large festivals
    const duplicatedFestival = await prisma.$transaction(async (tx) => {
      // 1. Create the new festival (always as draft)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const festivalData: any = {
        name: newName,
        slug: newSlug,
        description: festival.description,
        location: festival.location,
        startDate: newStartDate,
        endDate: newEndDate,
        timezone: festival.timezone,
        logo: festival.logo,
        primaryColor: festival.primaryColor,
        secondaryColor: festival.secondaryColor,
        accentColor: festival.accentColor,
        headerFont: festival.headerFont, // Copy custom header font
        isPublished: false, // Always start as draft
        userId: session.user.id,
        facebookLink: festival.facebookLink,
        instagramLink: festival.instagramLink,
        telegramLink: festival.telegramLink,
        whatsappLink: festival.whatsappLink,
        presenterLabel: festival.presenterLabel || 'Facilitator',
        // Note: We don't copy googleSheetUrl as that would create conflicts
        // Note: We don't copy customDomain as that must be unique
      }
      
      const newFestival = await tx.festival.create({
        data: festivalData
      })

      // 2. Batch create all teachers
      if (festival.teachers.length > 0) {
        await tx.teacher.createMany({
          data: festival.teachers.map(teacher => ({
            festivalId: newFestival.id,
            name: teacher.name,
            url: teacher.url,
            isGroup: teacher.isGroup
          }))
        })
        
        // Get the newly created teachers to map photos
        const newTeachers = await tx.teacher.findMany({
          where: { festivalId: newFestival.id }
        })
        
        // Create a name-to-id mapping for the new teachers
        const teacherNameToId = new Map(newTeachers.map(t => [t.name, t.id]))
        
        // Collect all photos to create
        const photosToCreate = festival.teachers.flatMap(teacher => 
          teacher.photos.map(photo => ({
            filename: `${newFestival.id}-${Date.now()}-${photo.filename.split('-').slice(-1)[0]}`,
            teacherName: photo.teacherName,
            teacherId: teacherNameToId.get(teacher.name) || null,
            filePath: photo.filePath, // Reuse the same file
            fileSize: photo.fileSize,
            mimeType: photo.mimeType
          }))
        )
        
        if (photosToCreate.length > 0) {
          await tx.teacherPhoto.createMany({
            data: photosToCreate
          })
        }
      }

      // 3. Batch create all sessions
      if (festival.sessions.length > 0) {
        const sessionsToCreate = festival.sessions.map(originalSession => {
          // Shift the day if shiftDays is provided
          let newDay = originalSession.day
          if (shiftDays !== 0) {
            try {
              const originalDayDate = new Date(originalSession.day)
              if (!isNaN(originalDayDate.getTime())) {
                const shiftedDate = new Date(originalDayDate.getTime() + shiftMs)
                newDay = shiftedDate.toISOString().split('T')[0]
              }
            } catch {
              // If day is not a parseable date, keep it as-is
            }
          }

          return {
            title: originalSession.title,
            description: originalSession.description,
            day: newDay,
            startTime: originalSession.startTime,
            endTime: originalSession.endTime,
            location: originalSession.location,
            level: originalSession.level,
            styles: originalSession.styles,
            prerequisites: originalSession.prerequisites,
            capacity: originalSession.capacity,
            teachers: originalSession.teachers,
            teacherBios: originalSession.teacherBios,
            cardType: originalSession.cardType,
            festivalId: newFestival.id,
            displayOrder: originalSession.displayOrder,
            bookingCapacity: originalSession.bookingCapacity,
            bookingEnabled: originalSession.bookingEnabled,
            price: originalSession.price,
            requirePayment: originalSession.requirePayment
          }
        })
        
        await tx.festivalSession.createMany({
          data: sessionsToCreate
        })
      }

      return newFestival
    }, {
      timeout: 30000 // 30 second timeout for large festivals
    })

    // Fetch the complete duplicated festival with counts
    const completeFestival = await prisma.festival.findUnique({
      where: { id: duplicatedFestival.id },
      include: {
        _count: {
          select: {
            sessions: true,
            teachers: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      festival: completeFestival,
      message: `Successfully duplicated "${festival.name}" with ${completeFestival?._count.sessions || 0} sessions and ${completeFestival?._count.teachers || 0} teachers`
    })

  } catch (error) {
    console.error('Error duplicating festival:', error)
    return NextResponse.json(
      { error: 'Failed to duplicate festival' },
      { status: 500 }
    )
  }
}
