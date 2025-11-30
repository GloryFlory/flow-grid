/**
 * ICS (iCalendar) Generation Utilities
 * 
 * Generates .ics files for calendar export functionality.
 * Follows RFC 5545 specification.
 */

export interface ICSSession {
  id: string
  title: string
  description?: string
  location?: string
  startTime: string  // ISO datetime or "YYYY-MM-DD HH:mm"
  endTime: string    // ISO datetime or "YYYY-MM-DD HH:mm"
  teachers?: string[]
  day?: string
}

export interface ICSOptions {
  timezone?: string
  organizerName?: string
  organizerEmail?: string
  reminderMinutes?: number
}

const DEFAULT_OPTIONS: ICSOptions = {
  timezone: 'UTC',
  organizerName: 'Flow Grid',
  organizerEmail: 'noreply@flowgrid.com',
  reminderMinutes: 15
}

/**
 * Escape special characters for ICS format
 */
function escapeICS(text: string): string {
  if (!text) return ''
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

/**
 * Fold long lines according to RFC 5545 (max 75 chars)
 */
function foldLine(line: string): string {
  const MAX_LENGTH = 75
  if (line.length <= MAX_LENGTH) return line
  
  const parts: string[] = []
  let remaining = line
  let isFirst = true
  
  while (remaining.length > 0) {
    const length = isFirst ? MAX_LENGTH : MAX_LENGTH - 1
    parts.push((isFirst ? '' : ' ') + remaining.substring(0, length))
    remaining = remaining.substring(length)
    isFirst = false
  }
  
  return parts.join('\r\n')
}

/**
 * Format date to ICS format (YYYYMMDDTHHMMSS)
 * Handles various input formats:
 * - Full ISO datetime: "2025-12-01T11:30:00"
 * - Space-separated: "2025-12-01 11:30"
 * - Just time with separate day: "11:30" + day="2025-12-01"
 */
function formatICSDate(dateStr: string, timezone: string = 'UTC', day?: string): string {
  let date: Date
  
  // If dateStr is just a time (HH:mm or HH:mm:ss) and we have a day, combine them
  if (day && /^\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
    const fullDateTime = `${day}T${dateStr}`
    date = new Date(fullDateTime)
  } else if (dateStr.includes('T')) {
    // ISO format
    date = new Date(dateStr)
  } else if (dateStr.includes(' ')) {
    // "YYYY-MM-DD HH:mm" format
    date = new Date(dateStr.replace(' ', 'T'))
  } else {
    date = new Date(dateStr)
  }
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}${day ? ` (day: ${day})` : ''}`)
  }
  
  // Format as YYYYMMDDTHHMMSS
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const dayNum = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}${month}${dayNum}T${hours}${minutes}${seconds}`
}

/**
 * Generate a unique UID for an event
 */
function generateUID(sessionId: string): string {
  return `session-${sessionId}@flowgrid.com`
}

/**
 * Get current timestamp for DTSTAMP
 */
function getTimestamp(): string {
  const now = new Date()
  return formatICSDate(now.toISOString(), 'UTC') + 'Z'
}

/**
 * Build the description text including teachers
 */
function buildDescription(session: ICSSession): string {
  const parts: string[] = []
  
  if (session.teachers && session.teachers.length > 0) {
    parts.push(`Teachers: ${session.teachers.join(', ')}`)
  }
  
  if (session.description) {
    parts.push(session.description)
  }
  
  return parts.join('\\n\\n')
}

/**
 * Generate ICS content for a single session
 */
export function generateSessionICS(session: ICSSession, options: ICSOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Flow Grid//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-TIMEZONE:${opts.timezone}`,
    '',
    'BEGIN:VEVENT',
    `UID:${generateUID(session.id)}`,
    `DTSTAMP:${getTimestamp()}`,
    `DTSTART;TZID=${opts.timezone}:${formatICSDate(session.startTime, opts.timezone, session.day)}`,
    `DTEND;TZID=${opts.timezone}:${formatICSDate(session.endTime, opts.timezone, session.day)}`,
    `SUMMARY:${escapeICS(session.title)}`
  ]
  
  // Add location if present
  if (session.location) {
    lines.push(`LOCATION:${escapeICS(session.location)}`)
  }
  
  // Add description
  const description = buildDescription(session)
  if (description) {
    lines.push(`DESCRIPTION:${escapeICS(description)}`)
  }
  
  // Add reminder/alarm
  if (opts.reminderMinutes && opts.reminderMinutes > 0) {
    lines.push(
      'BEGIN:VALARM',
      'TRIGGER:-PT' + opts.reminderMinutes + 'M',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeICS(session.title)} starts in ${opts.reminderMinutes} minutes`,
      'END:VALARM'
    )
  }
  
  lines.push('END:VEVENT', '', 'END:VCALENDAR')
  
  // Fold lines and join with CRLF
  return lines.map(line => foldLine(line)).join('\r\n')
}

/**
 * Generate ICS content for multiple sessions (bulk export)
 */
export function generateBulkICS(
  sessions: ICSSession[], 
  calendarName: string = 'My Flow Grid Schedule',
  options: ICSOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Flow Grid//Calendar Export//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeICS(calendarName)}`,
    `X-WR-TIMEZONE:${opts.timezone}`
  ]
  
  // Add each session as an event
  for (const session of sessions) {
    lines.push(
      '',
      'BEGIN:VEVENT',
      `UID:${generateUID(session.id)}`,
      `DTSTAMP:${getTimestamp()}`,
      `DTSTART;TZID=${opts.timezone}:${formatICSDate(session.startTime, opts.timezone, session.day)}`,
      `DTEND;TZID=${opts.timezone}:${formatICSDate(session.endTime, opts.timezone, session.day)}`,
      `SUMMARY:${escapeICS(session.title)}`
    )
    
    if (session.location) {
      lines.push(`LOCATION:${escapeICS(session.location)}`)
    }
    
    const description = buildDescription(session)
    if (description) {
      lines.push(`DESCRIPTION:${escapeICS(description)}`)
    }
    
    // Add reminder for each event
    if (opts.reminderMinutes && opts.reminderMinutes > 0) {
      lines.push(
        'BEGIN:VALARM',
        'TRIGGER:-PT' + opts.reminderMinutes + 'M',
        'ACTION:DISPLAY',
        `DESCRIPTION:${escapeICS(session.title)} starts in ${opts.reminderMinutes} minutes`,
        'END:VALARM'
      )
    }
    
    lines.push('END:VEVENT')
  }
  
  lines.push('', 'END:VCALENDAR')
  
  return lines.map(line => foldLine(line)).join('\r\n')
}

/**
 * Generate filename for ICS download
 */
export function generateICSFilename(title: string, type: 'session' | 'schedule' = 'session'): string {
  const sanitized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50)
  
  if (type === 'schedule') {
    return `my-schedule-${sanitized}.ics`
  }
  
  return `${sanitized}.ics`
}
