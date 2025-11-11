import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = await params

    // Get all sessions for this festival
    const sessions = await prisma.festivalSession.findMany({
      where: {
        festivalId: festivalId
      },
      orderBy: [
        { day: 'asc' },
        { startTime: 'asc' }
      ]
    })

    // Convert to CSV format matching import template order
    // Using semicolon (;) delimiter for Windows Excel compatibility
    const csvHeader = 'id;day;start;end;title;level;capacity;styles;CardType;teachers;location;Description;Prerequisites\n'
    
    const csvRows = sessions.map((session, index) => {
      const startOut = (() => {
        const s = session.startTime || ''
        if (/^\d{2}:\d{2}$/.test(s)) return s
        const m = s.match(/T(\d{2}:\d{2})/)
        return m ? m[1] : s
      })()
      const endOut = (() => {
        const s = session.endTime || ''
        if (/^\d{2}:\d{2}$/.test(s)) return s
        const m = s.match(/T(\d{2}:\d{2})/)
        return m ? m[1] : s
      })()
      const fields = [
        index + 1, // id
        session.day, // day
        startOut, // start (HH:mm)
        endOut, // end (HH:mm)
        session.title, // title
        session.level || '', // level
        session.capacity || '', // capacity
        session.styles.join(', '), // styles
        session.cardType, // CardType
        session.teachers.join(', '), // teachers (comma-separated for multiple teachers)
        session.location || '', // location
        session.description || '', // Description
        session.prerequisites || '' // Prerequisites
      ]
      
      // Escape fields that contain semicolons, quotes, or newlines
      return fields.map(field => {
        const fieldStr = String(field)
        if (fieldStr.includes(';') || fieldStr.includes('"') || fieldStr.includes('\n') || fieldStr.includes('\r')) {
          // Wrap in quotes and escape any existing quotes
          return `"${fieldStr.replace(/"/g, '""')}"`
        }
        return fieldStr
      }).join(';') // Use semicolon as delimiter
    }).join('\n')

    // Add UTF-8 BOM for Excel compatibility (helps Excel recognize UTF-8 encoding)
    const BOM = '\uFEFF'
    const csvContent = BOM + csvHeader + csvRows

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv;charset=utf-8;',
        'Content-Disposition': 'attachment; filename="festival-sessions.csv"'
      }
    })
  } catch (error) {
    console.error('Error exporting sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File
    const mode = formData.get('mode') as string || 'replace' // 'replace' or 'merge'
    const suggestedMatchesStr = formData.get('suggestedMatches') as string
    const suggestedMatches = suggestedMatchesStr ? JSON.parse(suggestedMatchesStr) : {}
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

  const csvContent = await file.text()
    const lines = csvContent.split('\n')
    
    if (lines.length < 2) {
      return NextResponse.json({ error: 'CSV file must contain headers and at least one row' }, { status: 400 })
    }

    // Auto-detect delimiter (semicolon or comma)
    // Remove BOM if present
    const firstLine = lines[0].replace(/^\uFEFF/, '')
    const delimiter = firstLine.includes(';') ? ';' : ','
    console.log(`CSV import: detected delimiter = "${delimiter}", mode = "${mode}"`)

    // Skip header row
    const dataLines = lines.slice(1).filter(line => line.trim())
    
    const sessionsToCreate: any[] = []

    // Fetch festival date range to normalize day names to actual dates
    const festival = await prisma.festival.findUnique({
      where: { id: festivalId },
      select: { startDate: true, endDate: true }
    })

    // Helpers for date normalization
    const isIsoDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)
    const tryExtractIsoFromDateTime = (s?: string | null): string | null => {
      if (!s) return null
      const m = s.match(/(\d{4}-\d{2}-\d{2})[T\s]?/)
      return m ? m[1] : null
    }
    const normalizeTimeHHMM = (s?: string | null): string => {
      if (!s) return ''
      const trimmed = s.replace(/^"|"$/g, '').trim()
      // If it's already HH:mm
      if (/^\d{2}:\d{2}$/.test(trimmed)) return trimmed
      // If it includes datetime, extract HH:mm
      const m = trimmed.match(/T(\d{2}:\d{2})|\s(\d{2}:\d{2})/)
      if (m) return (m[1] || m[2]) as string
      // If it's like H:MM, pad
      const m2 = trimmed.match(/^(\d{1,2}):(\d{2})/)
      if (m2) return `${m2[1].padStart(2,'0')}:${m2[2]}`
      return trimmed
    }
    const findDateForDayName = (dayName?: string | null): string | null => {
      if (!festival || !dayName) return null
      const day = dayName.trim()
      const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
      const idx = dayNames.findIndex(d => d.toLowerCase() === day.toLowerCase())
      if (idx === -1) return null
      
      // Parse festival dates - handle both Date objects and ISO strings
      const startValue: any = festival.startDate
      const endValue: any = festival.endDate
      
      let startDate: Date
      let endDate: Date
      
      if (startValue instanceof Date) {
        startDate = startValue
        endDate = endValue instanceof Date ? endValue : new Date(endValue)
      } else {
        const startStr = String(startValue)
        const endStr = String(endValue)
        startDate = new Date(startStr.includes('T') ? startStr : startStr + 'T00:00:00Z')
        endDate = new Date(endStr.includes('T') ? endStr : endStr + 'T00:00:00Z')
      }
      
      // Validate dates
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error('Invalid festival dates:', { startDate: festival.startDate, endDate: festival.endDate })
        return null
      }
      
      const cur = new Date(startDate)
      while (cur <= endDate) {
        if (cur.getUTCDay() === idx) {
          return cur.toISOString().split('T')[0]
        }
        cur.setUTCDate(cur.getUTCDate() + 1)
      }
      
      // If not found in range, use the first occurrence after festival start
      console.warn(`Day ${dayName} not found in festival range, using first ${dayName} from start date`)
      const fallback = new Date(startDate)
      let safety = 0
      while (fallback.getUTCDay() !== idx && safety < 8) {
        fallback.setUTCDate(fallback.getUTCDate() + 1)
        safety++
      }
      
      if (isNaN(fallback.getTime())) {
        console.error('Invalid fallback date for day:', dayName)
        return null
      }
      
      return fallback.toISOString().split('T')[0]
    }
    
    // Proper CSV parsing function that handles quoted fields and delimiter within fields
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // Handle escaped quotes
            current += '"'
            i++ // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes
          }
        } else if (char === delimiter && !inQuotes) {
          // End of field
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      
      // Add the last field
      result.push(current.trim())
      return result
    }
    
    for (let rowIndex = 0; rowIndex < dataLines.length; rowIndex++) {
      const line = dataLines[rowIndex]
      const fields = parseCSVLine(line)
      
      if (fields.length < 10) continue // Skip invalid rows
      
      // Match the CSV template column order: id,date,start,end,title,level,capacity,styles,CardType,teachers,location,Description,Prerequisites
  const [id, date, start, end, title, level, capacity, styles, cardType, teachers, location, description, prerequisites] = fields
      
      if (!title || !date || !start || !end) continue // Skip rows missing required fields
      
      // Parse comma-separated values properly
      const parseCommaSeparated = (value: string): string[] => {
        if (!value || value.trim() === '') return []
        // Only split on commas - ampersands (&) and "and" are kept as part of teaching couple names
        return value.split(',').map(item => item.trim()).filter(Boolean)
      }
      
      // Clean basic fields
      const cleanTitle = title.replace(/^"|"$/g, '').trim()
      const cleanDesc = description ? description.replace(/^"|"$/g, '').trim() : null
      const cleanDateRaw = date.replace(/^"|"$/g, '').trim()
      const cleanStartRaw = start.replace(/^"|"$/g, '').trim()
      const cleanEndRaw = end.replace(/^"|"$/g, '').trim()

      // Determine normalized ISO date for the session's day
      let normalizedISODate: string | null = null
      if (isIsoDate(cleanDateRaw)) {
        normalizedISODate = cleanDateRaw
      } else {
        const isoFromStart = tryExtractIsoFromDateTime(cleanStartRaw)
        const isoFromEnd = tryExtractIsoFromDateTime(cleanEndRaw)
        if (isoFromStart) normalizedISODate = isoFromStart
        else if (isoFromEnd) normalizedISODate = isoFromEnd
        else {
          // Try parsing cleanDateRaw as a date string (e.g., 6/14/2025)
          const parsed = Date.parse(cleanDateRaw)
          if (!isNaN(parsed)) {
            normalizedISODate = new Date(parsed).toISOString().split('T')[0]
          } else {
            // Fallback: Try mapping day name within festival range (for backwards compatibility)
            normalizedISODate = findDateForDayName(cleanDateRaw)
          }
        }
      }

      const startHHMM = normalizeTimeHHMM(cleanStartRaw)
      const endHHMM = normalizeTimeHHMM(cleanEndRaw)
      const startTimeFinal = normalizedISODate ? `${normalizedISODate}T${startHHMM}` : startHHMM
      const endTimeFinal = normalizedISODate ? `${normalizedISODate}T${endHHMM}` : endHHMM

      sessionsToCreate.push({
        title: cleanTitle,
        description: cleanDesc,
        day: (() => {
          const d = cleanDateRaw === 'Invalid Date' ? 'TBD' : cleanDateRaw
          // Prefer normalized ISO date when available
          return normalizedISODate || d
        })(),
        startTime: startTimeFinal,
        endTime: endTimeFinal,
        location: location ? location.replace(/^"|"$/g, '').trim() : null,
        level: level ? level.replace(/^"|"$/g, '').trim() : null,
        styles: parseCommaSeparated(styles?.replace(/^"|"$/g, '') || ''),
        prerequisites: prerequisites ? prerequisites.replace(/^"|"$/g, '').trim() : null,
        capacity: capacity ? parseInt(capacity.replace(/^"|"$/g, '').trim()) || null : null,
        teachers: parseCommaSeparated(teachers?.replace(/^"|"$/g, '') || ''),
        teacherBios: [],
        cardType: (() => {
          const cleanCardType = cardType?.replace(/^"|"$/g, '').trim().toLowerCase()
          if (['minimal', 'simplified'].includes(cleanCardType)) return 'simplified'
          if (['photo', 'photo-only'].includes(cleanCardType)) return 'photo-only'
          if (['detailed', 'full'].includes(cleanCardType)) return 'full'
          return 'full'
        })(),
        displayOrder: rowIndex + 1,
        festivalId
      })
    }

    if (sessionsToCreate.length === 0) {
      return NextResponse.json({ error: 'No valid sessions found in CSV' }, { status: 400 })
    }

    // ========== MODE: REPLACE ALL ==========
    if (mode === 'replace') {
      // Check for sessions with bookings before deleting
      const sessionsWithBookings = await prisma.festivalSession.findMany({
        where: {
          festivalId,
          bookings: {
            some: {}
          }
        },
        include: {
          _count: {
            select: { bookings: true }
          }
        }
      })

      // In replace mode, we still allow deletion but user was warned
      console.log(`Replace mode: Deleting ${sessionsWithBookings.length} sessions with bookings`)

      // Delete existing sessions for this festival
      await prisma.festivalSession.deleteMany({
        where: { festivalId }
      })

      // Create new sessions
      const createdSessions = await prisma.festivalSession.createMany({
        data: sessionsToCreate
      })

      return NextResponse.json({ 
        message: `Successfully replaced all sessions with ${createdSessions.count} new sessions`,
        count: createdSessions.count,
        mode: 'replace'
      })
    }

    // ========== MODE: SMART MERGE ==========
    // Get current sessions
    const currentSessions = await prisma.festivalSession.findMany({
      where: { festivalId },
      include: {
        _count: {
          select: { bookings: true }
        },
        bookings: true // Include bookings for preserving them
      }
    })

    // Create a map for matching by composite key: day|startTime|title (normalized)
    const currentSessionsMap = new Map(
      currentSessions.map(s => [
        `${s.day?.toLowerCase().trim()}|${s.startTime?.trim()}|${s.title?.toLowerCase().trim()}`,
        s
      ])
    )

    // Create a map by session ID for suggested matches
    const currentSessionsById = new Map(
      currentSessions.map(s => [s.id, s])
    )

    const csvSessionKeys = new Set(
      sessionsToCreate.map(s => `${s.day?.toLowerCase().trim()}|${s.startTime?.trim()}|${s.title?.toLowerCase().trim()}`)
    )

    let updatedCount = 0
    let createdCount = 0
    let suggestedMatchCount = 0
    const processedSessionIds = new Set<string>()

    // 1. UPDATE or CREATE sessions from CSV
    for (const csvSession of sessionsToCreate) {
      const key = `${csvSession.day?.toLowerCase().trim()}|${csvSession.startTime?.trim()}|${csvSession.title?.toLowerCase().trim()}`
      let existing = currentSessionsMap.get(key)

      // Check if this CSV session should match a suggested session
      const matchedDbSessionId = Object.entries(suggestedMatches).find(([dbId, decision]) => {
        if (decision === 'update') {
          const dbSession = currentSessionsById.get(dbId)
          // Match by title (since suggested matches are based on title similarity)
          return dbSession && dbSession.title.toLowerCase().trim() === csvSession.title.toLowerCase().trim()
        }
        return false
      })?.[0]

      if (matchedDbSessionId && suggestedMatches[matchedDbSessionId] === 'update') {
        // This is a user-confirmed suggested match
        existing = currentSessionsById.get(matchedDbSessionId)
        if (existing) {
          await prisma.festivalSession.update({
            where: { id: existing.id },
            data: {
              day: csvSession.day,
              startTime: csvSession.startTime,
              endTime: csvSession.endTime,
              title: csvSession.title,
              level: csvSession.level,
              capacity: csvSession.capacity,
              styles: csvSession.styles,
              cardType: csvSession.cardType,
              teachers: csvSession.teachers,
              location: csvSession.location,
              description: csvSession.description,
              prerequisites: csvSession.prerequisites
              // Preserve festivalId and bookings
            }
          })
          suggestedMatchCount++
          processedSessionIds.add(existing.id)
        }
      } else if (existing && !processedSessionIds.has(existing.id)) {
        // Exact composite key match
        await prisma.festivalSession.update({
          where: { id: existing.id },
          data: {
            level: csvSession.level,
            capacity: csvSession.capacity,
            styles: csvSession.styles,
            cardType: csvSession.cardType,
            teachers: csvSession.teachers,
            location: csvSession.location,
            description: csvSession.description,
            prerequisites: csvSession.prerequisites
            // Preserve day, startTime, endTime, title, festivalId, bookings
          }
        })
        updatedCount++
        processedSessionIds.add(existing.id)
      } else if (!existing) {
        // Check if user chose "create new" for a suggested match
        const shouldCreateNew = Object.entries(suggestedMatches).some(([dbId, decision]) => {
          if (decision === 'create') {
            const dbSession = currentSessionsById.get(dbId)
            return dbSession && dbSession.title.toLowerCase().trim() === csvSession.title.toLowerCase().trim()
          }
          return false
        })

        // CREATE new session
        await prisma.festivalSession.create({
          data: csvSession
        })
        createdCount++
      }
    }

    // 2. KEEP all sessions not in CSV (Smart Merge doesn't delete anything)
    let keptCount = 0
    for (const current of currentSessions) {
      const key = `${current.day?.toLowerCase().trim()}|${current.startTime?.trim()}|${current.title?.toLowerCase().trim()}`
      
      if (!csvSessionKeys.has(key) && !processedSessionIds.has(current.id)) {
        // In Smart Merge mode, we keep ALL existing sessions
        // They're not "outdated", they're just not being updated right now
        keptCount++
      }
    }

    return NextResponse.json({ 
      message: `Smart merge completed: ${createdCount} created, ${updatedCount} updated, ${suggestedMatchCount} suggested matches applied, ${keptCount} kept`,
      created: createdCount,
      updated: updatedCount,
      suggested: suggestedMatchCount,
      kept: keptCount,
      deleted: 0,
      mode: 'merge'
    })
  } catch (error) {
    console.error('Error importing sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}