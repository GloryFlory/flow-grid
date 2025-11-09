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

// Helper function to calculate string similarity (Levenshtein distance)
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().trim()
  const s2 = str2.toLowerCase().trim()
  
  if (s1 === s2) return 1
  
  const len1 = s1.length
  const len2 = s2.length
  const maxLen = Math.max(len1, len2)
  
  if (maxLen === 0) return 1
  
  // Create matrix
  const matrix: number[][] = []
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }
  
  // Calculate Levenshtein distance
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }
  
  const distance = matrix[len1][len2]
  return 1 - (distance / maxLen)
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
      level: string
      capacity: string
      styles: string
      cardType: string
      teachers: string
      location: string
      description: string
      prerequisites: string
      key: string // composite key for matching
    }> = []
    
    for (let rowIndex = 0; rowIndex < dataLines.length; rowIndex++) {
      const line = dataLines[rowIndex]
      const fields = parseCSVLine(line, delimiter)
      
      if (fields.length < 10) continue
      
      // id;day;start;end;title;level;capacity;styles;CardType;teachers;location;Description;Prerequisites
      const [id, day, start, end, title, level, capacity, styles, cardType, teachers, location, description, prerequisites] = fields
      
      if (!title || !day || !start || !end) continue
      
      const cleanTitle = title.replace(/^"|"$/g, '').trim()
      const cleanDay = day.replace(/^"|"$/g, '').trim()
      const cleanStart = start.replace(/^"|"$/g, '').trim()
      const cleanEnd = end.replace(/^"|"$/g, '').trim()
      const cleanLevel = (level || '').replace(/^"|"$/g, '').trim()
      const cleanCapacity = (capacity || '').replace(/^"|"$/g, '').trim()
      const cleanStyles = (styles || '').replace(/^"|"$/g, '').trim()
      const cleanCardType = (cardType || '').replace(/^"|"$/g, '').trim()
      const cleanTeachers = (teachers || '').replace(/^"|"$/g, '').trim()
      const cleanLocation = (location || '').replace(/^"|"$/g, '').trim()
      const cleanDescription = (description || '').replace(/^"|"$/g, '').trim()
      const cleanPrerequisites = (prerequisites || '').replace(/^"|"$/g, '').trim()
      
      csvSessions.push({
        title: cleanTitle,
        day: cleanDay,
        startTime: cleanStart,
        endTime: cleanEnd,
        level: cleanLevel,
        capacity: cleanCapacity,
        styles: cleanStyles,
        cardType: cleanCardType,
        teachers: cleanTeachers,
        location: cleanLocation,
        description: cleanDescription,
        prerequisites: cleanPrerequisites,
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
        `${s.day?.toLowerCase().trim()}|${s.startTime?.trim()}|${s.title?.toLowerCase().trim()}`,
        s
      ])
    )
    
    const csvSessionKeys = new Set(csvSessions.map(s => 
      `${s.day.toLowerCase().trim()}|${s.startTime.trim()}|${s.title.toLowerCase().trim()}`
    ))
    
    // Exact matches (day|time|title all match)
    const exactMatchesData = csvSessions.map(csvS => {
      const key = `${csvS.day.toLowerCase().trim()}|${csvS.startTime.trim()}|${csvS.title.toLowerCase().trim()}`
      const dbSession = currentSessionsMap.get(key)
      
      if (!dbSession) return null
      
      // Detect what fields are changing
      const changes: string[] = []
      
      if (csvS.endTime !== dbSession.endTime) {
        changes.push(`End time: ${dbSession.endTime} → ${csvS.endTime}`)
      }
      
      if (csvS.level !== (dbSession.level || '')) {
        changes.push(`Level: "${dbSession.level || 'none'}" → "${csvS.level || 'none'}"`)
      }
      
      const dbTeachers = dbSession.teachers.join(', ')
      if (csvS.teachers !== dbTeachers) {
        changes.push(`Teachers: "${dbTeachers}" → "${csvS.teachers}"`)
      }
      
      const dbStyles = dbSession.styles.join(', ')
      if (csvS.styles !== dbStyles) {
        changes.push(`Styles: "${dbStyles}" → "${csvS.styles}"`)
      }
      
      if (csvS.location !== (dbSession.location || '')) {
        changes.push(`Location: "${dbSession.location || 'none'}" → "${csvS.location || 'none'}"`)
      }
      
      if (csvS.capacity !== String(dbSession.capacity || '')) {
        changes.push(`Capacity: ${dbSession.capacity || 'none'} → ${csvS.capacity || 'none'}`)
      }
      
      return {
        csvSession: csvS,
        dbSession,
        changes,
        hasChanges: changes.length > 0
      }
    }).filter(Boolean) as Array<{
      csvSession: typeof csvSessions[0]
      dbSession: typeof currentSessions[0]
      changes: string[]
      hasChanges: boolean
    }>
    
    const exactMatches = exactMatchesData.filter(m => m.hasChanges).length + exactMatchesData.filter(m => !m.hasChanges).length
    
    // Find fuzzy matches for remaining CSV sessions
    const unmatchedCsvSessions = csvSessions.filter(csvS => 
      !currentSessionsMap.has(`${csvS.day.toLowerCase().trim()}|${csvS.startTime.trim()}|${csvS.title.toLowerCase().trim()}`)
    )
    
    const suggestedMatches: Array<{
      csvSession: typeof csvSessions[0]
      dbSession: typeof currentSessions[0]
      matchReason: string
      similarity: number
      changes: string[]
    }> = []
    
    unmatchedCsvSessions.forEach(csvSession => {
      // Look for same title on different day/time
      const sameTitle = currentSessions.filter(dbSession => 
        dbSession.title.toLowerCase().trim() === csvSession.title.toLowerCase().trim()
      )
      
      if (sameTitle.length === 1) {
        const dbSession = sameTitle[0]
        const changes: string[] = []
        
        if (dbSession.day !== csvSession.day) changes.push(`${dbSession.day} → ${csvSession.day}`)
        if (dbSession.startTime !== csvSession.startTime) changes.push(`${dbSession.startTime} → ${csvSession.startTime}`)
        if (dbSession.endTime !== csvSession.endTime) changes.push(`ends ${dbSession.endTime} → ${csvSession.endTime}`)
        
        suggestedMatches.push({
          csvSession,
          dbSession,
          matchReason: 'Same title, different schedule',
          similarity: 1.0,
          changes
        })
      } else if (sameTitle.length === 0) {
        // Look for similar titles (typo fixes, etc.)
        currentSessions.forEach(dbSession => {
          const similarity = calculateSimilarity(csvSession.title, dbSession.title)
          
          if (similarity >= 0.7 && similarity < 1.0) {
            const changes: string[] = [`"${dbSession.title}" → "${csvSession.title}"`]
            
            if (dbSession.day !== csvSession.day) changes.push(`${dbSession.day} → ${csvSession.day}`)
            if (dbSession.startTime !== csvSession.startTime) changes.push(`${dbSession.startTime} → ${csvSession.startTime}`)
            if (dbSession.endTime !== csvSession.endTime) changes.push(`ends ${dbSession.endTime} → ${csvSession.endTime}`)
            
            suggestedMatches.push({
              csvSession,
              dbSession,
              matchReason: `Similar title (${Math.round(similarity * 100)}% match)`,
              similarity,
              changes
            })
          }
        })
      }
    })
    
    // Remove duplicates (same dbSession matched multiple times) - keep highest similarity
    const uniqueMatches = new Map<string, typeof suggestedMatches[0]>()
    suggestedMatches.forEach(match => {
      const existing = uniqueMatches.get(match.dbSession.id)
      if (!existing || match.similarity > existing.similarity) {
        uniqueMatches.set(match.dbSession.id, match)
      }
    })
    
    const finalSuggestedMatches = Array.from(uniqueMatches.values())
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20) // Limit to 20 suggestions
    
    const matchedDbSessionIds = new Set(finalSuggestedMatches.map(m => m.dbSession.id))
    
    // Sessions that will be created (no match found)
    const toCreate = unmatchedCsvSessions.filter(csvS => {
      const hasSuggestedMatch = finalSuggestedMatches.some(m => 
        m.csvSession.key === csvS.key
      )
      return !hasSuggestedMatch
    })
    
    // Sessions to keep (not in CSV but have bookings)
    const toKeep = currentSessions.filter(s => {
      const key = `${s.day?.toLowerCase().trim()}|${s.startTime?.trim()}|${s.title?.toLowerCase().trim()}`
      const isExactMatch = csvSessionKeys.has(key)
      const isSuggestedMatch = matchedDbSessionIds.has(s.id)
      return !isExactMatch && !isSuggestedMatch && s._count.bookings > 0
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
        exactMatches: exactMatches,
        exactMatchesWithChanges: exactMatchesData.filter(m => m.hasChanges).map(m => ({
          csvSession: {
            title: m.csvSession.title,
            day: m.csvSession.day,
            startTime: m.csvSession.startTime,
            endTime: m.csvSession.endTime,
            level: m.csvSession.level,
            teachers: m.csvSession.teachers,
            capacity: m.csvSession.capacity
          },
          dbSession: {
            id: m.dbSession.id,
            title: m.dbSession.title,
            day: m.dbSession.day,
            startTime: m.dbSession.startTime,
            endTime: m.dbSession.endTime,
            level: m.dbSession.level,
            teachers: m.dbSession.teachers.join(', '),
            capacity: m.dbSession.capacity
          },
          changes: m.changes
        })),
        suggestedMatches: finalSuggestedMatches.map(m => ({
          csvSession: {
            title: m.csvSession.title,
            day: m.csvSession.day,
            startTime: m.csvSession.startTime,
            endTime: m.csvSession.endTime
          },
          dbSession: {
            id: m.dbSession.id,
            title: m.dbSession.title,
            day: m.dbSession.day,
            startTime: m.dbSession.startTime,
            endTime: m.dbSession.endTime,
            bookings: m.dbSession._count.bookings,
            participants: m.dbSession.bookings.reduce((sum, b) => sum + (b.names?.length || 0), 0)
          },
          matchReason: m.matchReason,
          similarity: m.similarity,
          changes: m.changes
        })),
        toCreate: toCreate.length,
        toKeep: toKeep.length
      }
    })
  } catch (error) {
    console.error('Error previewing CSV:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
