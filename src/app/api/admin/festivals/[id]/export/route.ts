import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: festivalId } = await params

    // Verify festival ownership
    const festival = await prisma.festival.findFirst({
      where: {
        id: festivalId,
        user: {
          email: session.user.email
        }
      },
      include: {
        sessions: {
          orderBy: {
            createdAt: 'asc'
          }
        },
        teachers: true
      }
    }) as any

    if (!festival) {
      return NextResponse.json(
        { error: 'Festival not found or access denied' },
        { status: 404 }
      )
    }

    // Fetch teacher photos separately (for this festival)
    const allTeacherIds = festival.teachers.map((t: any) => t.id)
    const teacherPhotos = (allTeacherIds.length > 0
      ? await prisma.teacherPhoto.findMany({
          where: {
            teacherName: {
              in: festival.teachers.map((t: any) => t.name)
            }
          }
        })
      : []) as any

    // Map photos to teachers
    const teachersWithPhotos = festival.teachers.map((teacher: any) => ({
      ...teacher,
      photos: teacherPhotos.filter((photo: any) => photo.teacherId === teacher.id)
    }))

    // Create comprehensive backup object
    const backup = {
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0',
      festival: {
        id: festival.id,
        name: festival.name,
        slug: festival.slug,
        description: festival.description,
        location: festival.location,
        startDate: festival.startDate,
        endDate: festival.endDate,
        timezone: festival.timezone,
        logo: festival.logo,
        primaryColor: festival.primaryColor,
        secondaryColor: festival.secondaryColor,
        accentColor: festival.accentColor,
        isPublished: festival.isPublished,
        customDomain: festival.customDomain,
        whatsappLink: festival.whatsappLink,
        telegramLink: festival.telegramLink,
        facebookLink: festival.facebookLink,
        instagramLink: festival.instagramLink,
        createdAt: festival.createdAt,
        updatedAt: festival.updatedAt
      },
      sessions: festival.sessions.map((session: any) => ({
        id: session.id,
        title: session.title,
        description: session.description,
        day: session.day,
        startTime: session.startTime,
        endTime: session.endTime,
        location: session.location,
        level: session.level,
        styles: session.styles,
        prerequisites: session.prerequisites,
        capacity: session.capacity,
        teachers: session.teachers,
        teacherBios: session.teacherBios,
        cardType: session.cardType,
        displayOrder: session.displayOrder.toString(),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      })),
      teachers: teachersWithPhotos.map((teacher: any) => ({
        id: teacher.id,
        name: teacher.name,
        url: teacher.url,
        isGroup: teacher.isGroup,
        photos: teacher.photos.map((photo: any) => ({
          id: photo.id,
          filename: photo.filename,
          filePath: photo.filePath,
          fileSize: photo.fileSize,
          mimeType: photo.mimeType,
          createdAt: photo.createdAt
        })),
        createdAt: teacher.createdAt,
        updatedAt: teacher.updatedAt
      })),
      metadata: {
        totalSessions: festival.sessions.length,
        totalTeachers: teachersWithPhotos.length,
        totalPhotos: teachersWithPhotos.reduce((sum: number, t: any) => sum + t.photos.length, 0)
      }
    }

    // Return as JSON download
    const filename = `${festival.slug}-backup-${new Date().toISOString().split('T')[0]}.json`
    
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: 'Failed to export festival data' },
      { status: 500 }
    )
  }
}
