import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Helper function to parse CSV line properly
const parseCSVLine = (line: string, delimiter: string): string[] => {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current.trim())
  return result
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

    // Auto-detect delimiter
    const firstLine = lines[0].replace(/^\uFEFF/, '')
    const delimiter = firstLine.includes(';') ? ';' : ','

    // Skip header row
    const dataLines = lines.slice(1).filter(line => line.trim())
    
    // Parse CSV sessions
    const csvSessions: Array<{
      title: string
      day: string
      startTime: string
      endTime: string
      key: string // composite key for matching
    }> = []
    
    for (let rowIndex = 0; rowIndex < dataLines.length; rowIndex++) {
      const line = dataLines[rowIndex]
      const fields = parseCSVLine(line, delimiter)
      
      if (fields.length < 10) continue
      
      const [id, day, start, end, title] = fields
      
      if (!title || !day || !start || !end) continue
      
      const cleanTitle = title.replace(/^"|"$/g, '').trim()
      const cleanDay = day.replace(/^"|"$/g, '').trim()
      const cleanStart = start.replace(/^"|"$/g, '').trim()
      const cleanEnd = end.replace(/^"|"$/g, '').trim()
      
      csvSessions.push({
        title: cleanTitle,
        day: cleanDay,
        startTime: cleanStart,
        endTime: cleanEnd,
        key: `${cleanDay}|${cleanStart}|${cleanTitle}`
      })
    }

    if (csvSessions.length === 0) {
      return NextResponse.json({ error: 'No valid sessions found in CSV' }, { status: 400 })
    }

    // Get current sessions with booking counts
    const currentSessions = await prisma.festivalSession.findMany({
      where: { festivalId },
      include: {
        _count: {
          select: { bookings: true }
        },
        bookings: {
          select: {
            names: true
          }
        }
      }
    })

    // Calculate statistics
    const sessionsWithBookings = currentSessions.filter(s => s._count.bookings > 0)
    const totalBookings = sessionsWithBookings.reduce((sum, s) => {
      // Count total participants across all bookings
      return sum + s.bookings.reduce((bookingSum, booking) => {
        return bookingSum + (booking.names?.length || 0)
      }, 0)
    }, 0)

    // For merge mode: calculate what will happen
    const currentSessionsMap = new Map(
      currentSessions.map(s => [
        `${s.day}|${s.startTime}|${s.title}`,
        s
      ])
    )
    
    const csvSessionKeys = new Set(csvSessions.map(s => s.key))
    
    const toUpdate = csvSessions.filter(csvS => currentSessionsMap.has(csvS.key))
    const toCreate = csvSessions.filter(csvS => !currentSessionsMap.has(csvS.key))
    const toKeep = currentSessions.filter(s => {
      const key = `${s.day}|${s.startTime}|${s.title}`
      return !csvSessionKeys.has(key) && s._count.bookings > 0
    })
    const toDelete = currentSessions.filter(s => {
      const key = `${s.day}|${s.startTime}|${s.title}`
      return !csvSessionKeys.has(key) && s._count.bookings === 0
    })

    return NextResponse.json({
      csvSessionCount: csvSessions.length,
      currentSessionCount: currentSessions.length,
      sessionsWithBookingsCount: sessionsWithBookings.length,
      totalBookings,
      sessionsWithBookings: sessionsWithBookings.slice(0, 5).map(s => ({
        title: s.title,
        day: s.day,
        time: s.startTime,
        bookings: s._count.bookings,
        participants: s.bookings.reduce((sum, b) => sum + (b.names?.length || 0), 0)
      })),
      mergePreview: {
        toUpdate: toUpdate.length,
        toCreate: toCreate.length,
        toKeep: toKeep.length,
        toDelete: toDelete.length
      }
    })
  } catch (error) {
    console.error('Error previewing CSV:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
