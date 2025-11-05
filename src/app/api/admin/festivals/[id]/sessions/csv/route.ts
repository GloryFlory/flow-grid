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
    console.log(`CSV import: detected delimiter = "${delimiter}"`)

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
    
    for (const line of dataLines) {
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
        festivalId
      })
    }

    if (sessionsToCreate.length === 0) {
      return NextResponse.json({ error: 'No valid sessions found in CSV' }, { status: 400 })
    }

    // Delete existing sessions for this festival
    await prisma.festivalSession.deleteMany({
      where: { festivalId }
    })

    // Create new sessions
    const createdSessions = await prisma.festivalSession.createMany({
      data: sessionsToCreate
    })

    return NextResponse.json({ 
      message: `Successfully imported ${createdSessions.count} sessions`,
      count: createdSessions.count
    })
  } catch (error) {
    console.error('Error importing sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}