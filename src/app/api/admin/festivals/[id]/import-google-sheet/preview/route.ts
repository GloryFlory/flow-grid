import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { validateGoogleSheetUrl, fetchGoogleSheetData } from '@/lib/googleSheets'

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching session titles
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()

  if (s1 === s2) return 100

  const track = Array(s2.length + 1).fill(null).map(() =>
    Array(s1.length + 1).fill(null))

  for (let i = 0; i <= s1.length; i += 1) {
    track[0][i] = i
  }
  for (let j = 0; j <= s2.length; j += 1) {
    track[j][0] = j
  }

  for (let j = 1; j <= s2.length; j += 1) {
    for (let i = 1; i <= s1.length; i += 1) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  const distance = track[s2.length][s1.length]
  const maxLength = Math.max(s1.length, s2.length)
  const similarity = ((maxLength - distance) / maxLength) * 100

  return Math.round(similarity)
}

/**
 * POST /api/admin/festivals/[id]/import-google-sheet/preview
 * Preview changes from Google Sheets import before applying
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

    // Validate and fetch Google Sheets data
    const validation = await validateGoogleSheetUrl(googleSheetUrl)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const sheetId = validation.sheetId!
    const result = await fetchGoogleSheetData(sheetId)
    if (!result.isValid || !result.sessions) {
      return NextResponse.json(
        { error: result.error || 'Failed to parse sheet data' },
        { status: 400 }
      )
    }

    const parsedSessions = result.sessions

    // REPLACE MODE: Simple count of what will happen
    if (mode === 'replace') {
      const sessionsWithBookings = festival.sessions.filter((s: any) => s.bookings.length > 0)
      
      return NextResponse.json({
        mode: 'replace',
        willDelete: festival.sessions.length,
        willCreate: parsedSessions.length,
        sessionsWithBookings: sessionsWithBookings.length,
        warning: sessionsWithBookings.length > 0 
          ? `${sessionsWithBookings.length} sessions have participant bookings that will be deleted`
          : null
      })
    }

    // SMART MERGE MODE: Analyze matches and changes
    // Create composite key map (normalized)
    const currentSessionsMap = new Map(
      festival.sessions.map((s: any) => [
        `${s.day?.toLowerCase().trim()}|${s.startTime?.trim()}|${s.title?.toLowerCase().trim()}`,
        s
      ])
    )

    let exactMatches = 0
    const exactMatchesData: any[] = []
    const toCreate: any[] = []
    const processedDbSessions = new Set<string>()

    // First pass: Find exact matches and detect changes
    for (const sheetSession of parsedSessions) {
      const compositeKey = `${sheetSession.day?.toLowerCase().trim()}|${sheetSession.start?.trim()}|${sheetSession.title?.toLowerCase().trim()}`
      const existingSession = currentSessionsMap.get(compositeKey)

      if (existingSession) {
        // Exact match found - check for field changes
        const changes: string[] = []

        // Compare all fields
        if (sheetSession.end !== existingSession.endTime) {
          changes.push(`End time: ${existingSession.endTime} → ${sheetSession.end}`)
        }
        if (sheetSession.level !== (existingSession.level || '')) {
          changes.push(`Level: "${existingSession.level || 'none'}" → "${sheetSession.level || 'none'}"`)
        }

        // Teachers comparison
        const existingTeachers = existingSession.teachers || []
        const newTeachers = sheetSession.teachers ? sheetSession.teachers.split(',').map((t: string) => t.trim()) : []
        if (JSON.stringify(existingTeachers.sort()) !== JSON.stringify(newTeachers.sort())) {
          changes.push(`Teachers: [${existingTeachers.join(', ')}] → [${newTeachers.join(', ')}]`)
        }

        // Styles comparison
        const existingStyles = existingSession.styles || []
        const newStyles = sheetSession.types ? sheetSession.types.split(',').map((s: string) => s.trim()) : []
        if (JSON.stringify(existingStyles.sort()) !== JSON.stringify(newStyles.sort())) {
          changes.push(`Styles: [${existingStyles.join(', ')}] → [${newStyles.join(', ')}]`)
        }

        // Location comparison
        if ((sheetSession.location || '') !== (existingSession.location || '')) {
          changes.push(`Location: "${existingSession.location || 'none'}" → "${sheetSession.location || 'none'}"`)
        }

        // Capacity comparison
        const existingCapacity = existingSession.capacity || 0
        const newCapacity = sheetSession.capacity || 0
        if (existingCapacity !== newCapacity) {
          changes.push(`Capacity: ${existingCapacity} → ${newCapacity}`)
        }

        // Description comparison
        if ((sheetSession.description || '') !== (existingSession.description || '')) {
          changes.push(`Description changed`)
        }

        // Prerequisites comparison
        if ((sheetSession.prerequisites || '') !== (existingSession.prerequisites || '')) {
          changes.push(`Prerequisites changed`)
        }

        exactMatches++
        processedDbSessions.add(existingSession.id)

        if (changes.length > 0) {
          exactMatchesData.push({
            dbSession: {
              id: existingSession.id,
              title: existingSession.title,
              day: existingSession.day,
              startTime: existingSession.startTime,
              endTime: existingSession.endTime,
              level: existingSession.level,
              teachers: existingSession.teachers,
              capacity: existingSession.capacity
            },
            sheetSession: {
              title: sheetSession.title,
              day: sheetSession.day,
              start: sheetSession.start,
              end: sheetSession.end,
              level: sheetSession.level,
              teachers: sheetSession.teachers,
              capacity: sheetSession.capacity
            },
            changes,
            hasChanges: true
          })
        }
      } else {
        // Will be created
        toCreate.push(sheetSession)
      }
    }

    // Second pass: Find fuzzy matches for sessions that will be created
    const suggestedMatches: any[] = []
    const unmatchedDbSessions = festival.sessions.filter((s: any) => !processedDbSessions.has(s.id))

    for (const sheetSession of toCreate) {
      const suggestions: any[] = []

      for (const dbSession of unmatchedDbSessions) {
        // Same title, different schedule
        if (sheetSession.title.toLowerCase().trim() === dbSession.title.toLowerCase().trim()) {
          const changes: string[] = []
          changes.push(`Day: ${dbSession.day} → ${sheetSession.day}`)
          changes.push(`Time: ${dbSession.startTime} → ${sheetSession.start}`)

          suggestions.push({
            dbSessionId: dbSession.id,
            dbSession: {
              title: dbSession.title,
              day: dbSession.day,
              startTime: dbSession.startTime,
              endTime: dbSession.endTime,
              level: dbSession.level,
              teachers: dbSession.teachers,
              location: dbSession.location,
              capacity: dbSession.capacity
            },
            sheetSession: {
              title: sheetSession.title,
              day: sheetSession.day,
              start: sheetSession.start,
              end: sheetSession.end,
              level: sheetSession.level,
              teachers: sheetSession.teachers,
              location: sheetSession.location,
              capacity: sheetSession.capacity
            },
            reason: 'Same title, different schedule',
            similarity: 100,
            changes
          })
          continue
        }

        // Similar title (fuzzy match)
        const similarity = calculateSimilarity(sheetSession.title, dbSession.title)
        if (similarity >= 70) {
          const changes: string[] = []
          changes.push(`Title: "${dbSession.title}" → "${sheetSession.title}"`)
          if (dbSession.day !== sheetSession.day) {
            changes.push(`Day: ${dbSession.day} → ${sheetSession.day}`)
          }
          if (dbSession.startTime !== sheetSession.start) {
            changes.push(`Time: ${dbSession.startTime} → ${sheetSession.start}`)
          }

          suggestions.push({
            dbSessionId: dbSession.id,
            dbSession: {
              title: dbSession.title,
              day: dbSession.day,
              startTime: dbSession.startTime,
              endTime: dbSession.endTime,
              level: dbSession.level,
              teachers: dbSession.teachers,
              location: dbSession.location,
              capacity: dbSession.capacity
            },
            sheetSession: {
              title: sheetSession.title,
              day: sheetSession.day,
              start: sheetSession.start,
              end: sheetSession.end,
              level: sheetSession.level,
              teachers: sheetSession.teachers,
              location: sheetSession.location,
              capacity: sheetSession.capacity
            },
            reason: `Similar title (${similarity}% match)`,
            similarity,
            changes
          })
        }
      }

      // Add best suggestions (limit to top 3 per sheet session, sorted by similarity)
      if (suggestions.length > 0) {
        suggestions.sort((a, b) => b.similarity - a.similarity)
        suggestedMatches.push(...suggestions.slice(0, 3))
      }
    }

    // Remove duplicate suggestions (same dbSessionId)
    const uniqueSuggestions = new Map()
    for (const match of suggestedMatches) {
      const existing = uniqueSuggestions.get(match.dbSessionId)
      if (!existing || match.similarity > existing.similarity) {
        uniqueSuggestions.set(match.dbSessionId, match)
      }
    }

    // Count sessions that will be kept (not deleted)
    const toKeep = unmatchedDbSessions.filter(
      (s: any) => !uniqueSuggestions.has(s.id)
    ).length

    return NextResponse.json({
      mode: 'merge',
      totalInSheet: parsedSessions.length,
      totalInDatabase: festival.sessions.length,
      mergePreview: {
        exactMatches,
        exactMatchesWithChanges: exactMatchesData.map(m => ({
          csvSession: {
            title: m.sheetSession.title,
            day: m.sheetSession.day,
            startTime: m.sheetSession.start,
            endTime: m.sheetSession.end,
            level: m.sheetSession.level,
            teachers: m.sheetSession.teachers,
            capacity: m.sheetSession.capacity
          },
          dbSession: {
            id: m.dbSession.id,
            title: m.dbSession.title,
            day: m.dbSession.day,
            startTime: m.dbSession.startTime,
            endTime: m.dbSession.endTime,
            level: m.dbSession.level,
            teachers: m.dbSession.teachers,
            capacity: m.dbSession.capacity
          },
          changes: m.changes
        })),
        suggestedMatches: Array.from(uniqueSuggestions.values()),
        toCreate: toCreate.length - uniqueSuggestions.size,
        toKeep
      }
    })
  } catch (error) {
    console.error('Google Sheets preview error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to preview Google Sheets import',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
