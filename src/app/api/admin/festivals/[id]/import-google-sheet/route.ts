import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateGoogleSheetUrl, extractSheetId, fetchGoogleSheetData } from '@/lib/googleSheets'

/**
 * POST /api/admin/festivals/[id]/import-google-sheet
 * Import sessions from a Google Sheets URL
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = await params
    const body = await req.json()
    const { googleSheetUrl, mode = 'merge' } = body

    if (!googleSheetUrl) {
      return NextResponse.json(
        { error: 'Google Sheets URL is required' },
        { status: 400 }
      )
    }

    // Verify festival ownership
    const festival = await prisma.festival.findUnique({
      where: { id: festivalId },
      include: {
        user: true,
        sessions: {
          include: {
            bookings: true
          }
        }
      }
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    if (festival.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate Google Sheets URL
    const validation = await validateGoogleSheetUrl(googleSheetUrl)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const sheetId = validation.sheetId!

    // Fetch and parse sheet data
    const result = await fetchGoogleSheetData(sheetId)
    if (!result.isValid || !result.sessions) {
      return NextResponse.json(
        { error: result.error || 'Failed to parse sheet data' },
        { status: 400 }
      )
    }

    const parsedSessions = result.sessions

    // REPLACE MODE: Delete all sessions, create new ones
    if (mode === 'replace') {
      // Count sessions with bookings before deleting
      const sessionsWithBookings = festival.sessions.filter((s: any) => s.bookings.length > 0)
      
      if (sessionsWithBookings.length > 0) {
        console.log(`[Google Sheets Replace] Deleting ${sessionsWithBookings.length} sessions with bookings`)
        sessionsWithBookings.forEach((s: any) => {
          const totalBookings = s.bookings.reduce((sum: number, b: any) => sum + (b.names?.length || 0), 0)
          console.log(`  - ${s.title} has ${totalBookings} participants booked`)
        })
      }

      // Delete all existing sessions
      await prisma.festivalSession.deleteMany({
        where: { festivalId }
      })

      // Create all new sessions
      const createdSessions = await Promise.all(
        parsedSessions.map(async (session, index) => {
          return prisma.festivalSession.create({
            data: {
              festivalId,
              title: session.title,
              description: session.description || null,
              day: session.day,
              startTime: session.start,
              endTime: session.end,
              location: session.location || null,
              level: session.level || null,
              styles: session.types ? session.types.split(',').map(s => s.trim()) : [],
              prerequisites: session.prerequisites || null,
              capacity: session.capacity || null,
              teachers: session.teachers ? session.teachers.split(',').map(t => t.trim()) : [],
              teacherBios: [],
              cardType: session.cardType || 'detailed'
            }
          })
        })
      )

      return NextResponse.json({
        success: true,
        mode: 'replace',
        imported: createdSessions.length,
        message: `Replaced all sessions. Created ${createdSessions.length} new sessions from Google Sheets.`
      })
    }

    // SMART MERGE MODE: Update existing, create new, preserve bookings
    // Create a map of current sessions by composite key (day|startTime|title)
    const currentSessionsMap = new Map(
      festival.sessions.map((s: any) => [`${s.day}|${s.startTime}|${s.title}`, s])
    )

    let updatedCount = 0
    let createdCount = 0

    // Process each session from Google Sheets
    for (let index = 0; index < parsedSessions.length; index++) {
      const sheetSession = parsedSessions[index]
      const compositeKey = `${sheetSession.day}|${sheetSession.start}|${sheetSession.title}`
      const existingSession = currentSessionsMap.get(compositeKey)

      if (existingSession) {
        // UPDATE existing session (preserves ID and bookings)
        await prisma.festivalSession.update({
          where: { id: existingSession.id },
          data: {
            description: sheetSession.description || null,
            endTime: sheetSession.end,
            location: sheetSession.location || null,
            level: sheetSession.level || null,
            styles: sheetSession.types ? sheetSession.types.split(',').map(s => s.trim()) : [],
            prerequisites: sheetSession.prerequisites || null,
            capacity: sheetSession.capacity || null,
            teachers: sheetSession.teachers ? sheetSession.teachers.split(',').map(t => t.trim()) : [],
            cardType: sheetSession.cardType || 'detailed'
          }
        })
        updatedCount++
        currentSessionsMap.delete(compositeKey) // Mark as processed
      } else {
        // CREATE new session
        await prisma.festivalSession.create({
          data: {
            festivalId,
            title: sheetSession.title,
            description: sheetSession.description || null,
            day: sheetSession.day,
            startTime: sheetSession.start,
            endTime: sheetSession.end,
            location: sheetSession.location || null,
            level: sheetSession.level || null,
            styles: sheetSession.types ? sheetSession.types.split(',').map(s => s.trim()) : [],
            prerequisites: sheetSession.prerequisites || null,
            capacity: sheetSession.capacity || null,
            teachers: sheetSession.teachers ? sheetSession.teachers.split(',').map(t => t.trim()) : [],
            teacherBios: [],
            cardType: sheetSession.cardType || 'detailed'
          }
        })
        createdCount++
      }
    }

    // Handle sessions not in Google Sheets
    let keptCount = 0
    let deletedCount = 0

    for (const [key, session] of currentSessionsMap) {
      const hasBookings = session.bookings && session.bookings.length > 0
      
      if (hasBookings) {
        // KEEP sessions with bookings (even if not in sheet)
        console.log(`[Google Sheets Merge] Keeping session with bookings: ${session.title}`)
        keptCount++
      } else {
        // DELETE empty sessions not in sheet
        await prisma.festivalSession.delete({
          where: { id: session.id }
        })
        deletedCount++
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'merge',
      updated: updatedCount,
      created: createdCount,
      kept: keptCount,
      deleted: deletedCount,
      message: `Smart Merge complete: Updated ${updatedCount}, created ${createdCount}, kept ${keptCount} with bookings, deleted ${deletedCount} empty sessions.`
    })
  } catch (error) {
    console.error('Google Sheets import error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to import from Google Sheets',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/festivals/[id]/import-google-sheet
 * Validate a Google Sheets URL without importing
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = await params
    const { searchParams } = new URL(req.url)
    const googleSheetUrl = searchParams.get('url')

    if (!googleSheetUrl) {
      return NextResponse.json(
        { error: 'Google Sheets URL is required' },
        { status: 400 }
      )
    }

    // Verify festival ownership
    const festival = await prisma.festival.findUnique({
      where: { id: festivalId },
      include: { user: true }
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    if (festival.user.email !== session.user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Validate URL and fetch preview
    const validation = await validateGoogleSheetUrl(googleSheetUrl)
    if (!validation.isValid) {
      return NextResponse.json({
        isValid: false,
        error: validation.error
      })
    }

    const sheetId = validation.sheetId!
    const result = await fetchGoogleSheetData(sheetId)

    if (!result.isValid) {
      return NextResponse.json({
        isValid: false,
        error: result.error
      })
    }

    return NextResponse.json({
      isValid: true,
      sessionCount: result.sessions?.length || 0,
      sessions: result.sessions,
      warnings: result.error
    })
  } catch (error) {
    console.error('Google Sheets validation error:', error)
    return NextResponse.json(
      { 
        isValid: false,
        error: 'Failed to validate Google Sheets URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
