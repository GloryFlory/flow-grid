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
    const { googleSheetUrl, mode = 'merge', suggestedMatches = {} } = body

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

    // Build festival date mappings for date calculation
    const festivalStartDate = new Date(festival.startDate)
    const festivalEndDate = new Date(festival.endDate)
    const festivalDates: Date[] = []
    const currentDate = new Date(festivalStartDate)

    while (currentDate <= festivalEndDate) {
      festivalDates.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Map day names to their dates within the festival range
    const dayNameToDates: Record<string, Date[]> = {}
    festivalDates.forEach(date => {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
      if (!dayNameToDates[dayName]) {
        dayNameToDates[dayName] = []
      }
      dayNameToDates[dayName].push(date)
    })

    // Pre-calculate session dates using occurrence counter
    const sessionDateMap: Record<number, Date> = {}
    const dayNameCounters: Record<string, number> = {}
    let lastSeenDay: string | null = null

    parsedSessions.forEach((session, index) => {
      const sessionDayName = session.day

      // Increment counter only when transitioning to DIFFERENT day
      if (lastSeenDay !== null && lastSeenDay !== sessionDayName) {
        dayNameCounters[lastSeenDay] = (dayNameCounters[lastSeenDay] || 0) + 1
      }

      const currentCounter = dayNameCounters[sessionDayName] || 0
      const datesForThisDay = dayNameToDates[sessionDayName] || []
      
      if (!datesForThisDay || datesForThisDay.length === 0) {
        console.warn(`⚠️ Session ${index + 1}: Day "${sessionDayName}" not found in festival date range`)
      }

      if (currentCounter >= datesForThisDay.length) {
        console.warn(`⚠️ Session ${index + 1}: Too many ${sessionDayName} sessions (occurrence #${currentCounter}) for festival date range`)
      }

      // Use the date at the current counter, or fall back to first occurrence or festival start
      sessionDateMap[index] = datesForThisDay[currentCounter] || datesForThisDay[0] || festivalStartDate
      lastSeenDay = sessionDayName
    })

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

      // Create all new sessions with calculated dates
      const createdSessions = await Promise.all(
        parsedSessions.map(async (session, index) => {
          const sessionDate = sessionDateMap[index]
          const dateStr = sessionDate.toISOString().split('T')[0] // YYYY-MM-DD

          return prisma.festivalSession.create({
            data: {
              festivalId,
              title: session.title,
              description: session.description || null,
              day: session.day,
              startTime: `${dateStr}T${session.start}:00`,
              endTime: `${dateStr}T${session.end}:00`,
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
    // Create a map of current sessions by composite key (day|startTime|title) - NORMALIZED
    const currentSessionsMap = new Map(
      festival.sessions.map((s: any) => [
        `${s.day?.toLowerCase().trim()}|${s.startTime?.trim()}|${s.title?.toLowerCase().trim()}`,
        s
      ])
    )

    // Create a map by session ID for suggested matches
    const currentSessionsById = new Map(
      festival.sessions.map((s: any) => [s.id, s])
    )

    let updatedCount = 0
    let createdCount = 0
    let suggestedMatchCount = 0
    const processedSessionIds = new Set<string>()

    // Process each session from Google Sheets
    for (let index = 0; index < parsedSessions.length; index++) {
      const sheetSession = parsedSessions[index]
      const sessionDate = sessionDateMap[index]
      const dateStr = sessionDate.toISOString().split('T')[0] // YYYY-MM-DD
      
      // NORMALIZED composite key to match frontend
      const compositeKey = `${sheetSession.day?.toLowerCase().trim()}|${sheetSession.start?.trim()}|${sheetSession.title?.toLowerCase().trim()}`
      let existingSession = currentSessionsMap.get(compositeKey)

      // Check if this sheet session should match a suggested session
      const matchedDbSessionId = Object.entries(suggestedMatches).find(([dbId, decision]) => {
        if (decision === 'update') {
          const dbSession = currentSessionsById.get(dbId)
          return dbSession && dbSession.title.toLowerCase().trim() === sheetSession.title.toLowerCase().trim()
        }
        return false
      })?.[0]

      if (matchedDbSessionId && suggestedMatches[matchedDbSessionId] === 'update') {
        // This is a user-confirmed suggested match
        existingSession = currentSessionsById.get(matchedDbSessionId)
        if (existingSession) {
          await prisma.festivalSession.update({
            where: { id: existingSession.id },
            data: {
              title: sheetSession.title,
              day: sheetSession.day,
              startTime: `${dateStr}T${sheetSession.start}:00`,
              endTime: `${dateStr}T${sheetSession.end}:00`,
              description: sheetSession.description || null,
              location: sheetSession.location || null,
              level: sheetSession.level || null,
              styles: sheetSession.types ? sheetSession.types.split(',').map(s => s.trim()) : [],
              prerequisites: sheetSession.prerequisites || null,
              capacity: sheetSession.capacity || null,
              teachers: sheetSession.teachers ? sheetSession.teachers.split(',').map(t => t.trim()) : [],
              cardType: sheetSession.cardType || 'detailed'
            }
          })
          suggestedMatchCount++
          processedSessionIds.add(existingSession.id)
        }
      } else if (existingSession && !processedSessionIds.has(existingSession.id)) {
        // Exact composite key match - UPDATE existing session (preserves ID and bookings)
        await prisma.festivalSession.update({
          where: { id: existingSession.id },
          data: {
            description: sheetSession.description || null,
            startTime: `${dateStr}T${sheetSession.start}:00`,
            endTime: `${dateStr}T${sheetSession.end}:00`,
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
        processedSessionIds.add(existingSession.id)
        currentSessionsMap.delete(compositeKey) // Mark as processed
      } else if (!existingSession) {
        // CREATE new session
        await prisma.festivalSession.create({
          data: {
            festivalId,
            title: sheetSession.title,
            description: sheetSession.description || null,
            day: sheetSession.day,
            startTime: `${dateStr}T${sheetSession.start}:00`,
            endTime: `${dateStr}T${sheetSession.end}:00`,
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
    // In Smart Merge mode: KEEP everything not in sheet (it's just not being updated)
    let keptCount = 0

    for (const [key, session] of currentSessionsMap) {
      if (!processedSessionIds.has(session.id)) {
        // In Smart Merge, we keep ALL existing sessions
        // They're not "outdated", they're just not being modified right now
        console.log(`[Google Sheets Merge] Keeping existing session: ${session.title}`)
        keptCount++
      }
    }

    return NextResponse.json({
      success: true,
      mode: 'merge',
      updated: updatedCount,
      created: createdCount,
      suggested: suggestedMatchCount,
      kept: keptCount,
      deleted: 0,
      message: `Smart Merge complete: Updated ${updatedCount}, created ${createdCount}${suggestedMatchCount > 0 ? `, applied ${suggestedMatchCount} suggested matches` : ''}, kept ${keptCount} existing sessions.`
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
