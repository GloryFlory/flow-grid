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
      const fields = [
        index + 1, // id
        session.day, // day
        session.startTime, // start
        session.endTime, // end
        session.title, // title
        session.level || '', // level
        session.capacity || '', // capacity
        session.styles.join(', '), // styles
        session.cardType, // CardType
        session.teachers.join(' & '), // teachers (using & separator as in template)
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
    
    const sessionsToCreate = []
    
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
      
      // Match the CSV template column order: id,day,start,end,title,level,capacity,styles,CardType,teachers,location,Description,Prerequisites
      const [id, day, start, end, title, level, capacity, styles, cardType, teachers, location, description, prerequisites] = fields
      
      if (!title || !day || !start || !end) continue // Skip rows missing required fields
      
      // Parse comma-separated values properly
      const parseCommaSeparated = (value: string): string[] => {
        if (!value || value.trim() === '') return []
        return value.split(/[,&]/).map(item => item.trim()).filter(Boolean)
      }
      
      sessionsToCreate.push({
        title: title.replace(/^"|"$/g, '').trim(),
        description: description ? description.replace(/^"|"$/g, '').trim() : null,
        day: (() => {
          const cleanDay = day.replace(/^"|"$/g, '').trim();
          return cleanDay === 'Invalid Date' ? 'TBD' : cleanDay;
        })(),
        startTime: start.replace(/^"|"$/g, '').trim(),
        endTime: end.replace(/^"|"$/g, '').trim(),
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
          return 'full' // default
        })(),
        displayOrder: rowIndex + 1, // Auto-assign row number as display order (1, 2, 3...)
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