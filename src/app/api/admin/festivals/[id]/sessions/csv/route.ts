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
        day: day.replace(/^"|"$/g, '').trim(),
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
        }
      }
    })

    // Create a map for matching by composite key: day|startTime|title
    const currentSessionsMap = new Map(
      currentSessions.map(s => [
        `${s.day}|${s.startTime}|${s.title}`,
        s
      ])
    )

    const csvSessionKeys = new Set(
      sessionsToCreate.map(s => `${s.day}|${s.startTime}|${s.title}`)
    )

    let updatedCount = 0
    let createdCount = 0
    let deletedCount = 0

    // 1. UPDATE or CREATE sessions from CSV
    for (const csvSession of sessionsToCreate) {
      const key = `${csvSession.day}|${csvSession.startTime}|${csvSession.title}`
      const existing = currentSessionsMap.get(key)

      if (existing) {
        // UPDATE existing session
        await prisma.festivalSession.update({
          where: { id: existing.id },
          data: {
            ...csvSession,
            festivalId: undefined // Remove festivalId from update
          }
        })
        updatedCount++
      } else {
        // CREATE new session
        await prisma.festivalSession.create({
          data: csvSession
        })
        createdCount++
      }
    }

    // 2. DELETE sessions not in CSV (only if they have no bookings)
    // KEEP sessions with bookings even if not in CSV
    for (const current of currentSessions) {
      const key = `${current.day}|${current.startTime}|${current.title}`
      
      if (!csvSessionKeys.has(key)) {
        if (current._count.bookings === 0) {
          // Safe to delete - no bookings
          await prisma.festivalSession.delete({
            where: { id: current.id }
          })
          deletedCount++
        }
        // else: Keep the session (has bookings)
      }
    }

    return NextResponse.json({ 
      message: `Smart merge completed: ${createdCount} created, ${updatedCount} updated, ${deletedCount} deleted`,
      created: createdCount,
      updated: updatedCount,
      deleted: deletedCount,
      mode: 'merge'
    })
  } catch (error) {
    console.error('Error importing sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}