/**
 * Google Calendar URL Generator
 * 
 * Generates deep links to add events directly to Google Calendar.
 */

import { formatForGoogleCalendar } from '@/lib/timezones'

export interface GoogleCalendarEvent {
  title: string
  description?: string
  location?: string
  startTime: string  // ISO datetime string or "HH:mm"
  endTime: string    // ISO datetime string or "HH:mm"
  day?: string       // "YYYY-MM-DD" if startTime/endTime are just times
  timezone?: string  // IANA timezone string
}

/**
 * Format date for Google Calendar URL (YYYYMMDDTHHmmssZ format)
 * If timezone is provided, converts from local time to UTC
 */
function formatGoogleDate(dateStr: string, day?: string, timezone?: string): string {
  // If we have separate day and time, and a timezone, use proper conversion
  if (day && timezone && /^\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
    return formatForGoogleCalendar(day, dateStr, timezone)
  }
  
  // Handle full datetime strings like "2026-06-30T08:00" with timezone
  if (timezone && dateStr.includes('T')) {
    // Extract date and time parts from the ISO-like string
    const [datePart, timePart] = dateStr.split('T')
    if (datePart && timePart) {
      // Ensure time has seconds
      const timeWithSeconds = timePart.length === 5 ? timePart + ':00' : timePart
      return formatForGoogleCalendar(datePart, timeWithSeconds, timezone)
    }
  }
  
  // Fallback: parse and convert to UTC (assumes browser timezone)
  let date: Date
  
  if (day && /^\d{2}:\d{2}(:\d{2})?$/.test(dateStr)) {
    // Time-only with day, assume UTC
    date = new Date(`${day}T${dateStr}${dateStr.length === 5 ? ':00' : ''}Z`)
  } else {
    date = new Date(dateStr)
  }
  
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`)
  }
  
  // Convert to UTC and format
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const dayNum = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  
  return `${year}${month}${dayNum}T${hours}${minutes}${seconds}Z`
}

/**
 * Generate a Google Calendar event URL
 * 
 * @example
 * ```ts
 * const url = generateGoogleCalendarURL({
 *   title: 'Yoga Workshop',
 *   description: 'Morning yoga session with John',
 *   location: 'Main Hall',
 *   startTime: '2025-12-01T09:00:00',
 *   endTime: '2025-12-01T10:30:00'
 * })
 * // => "https://calendar.google.com/calendar/render?action=TEMPLATE&..."
 * ```
 */
export function generateGoogleCalendarURL(event: GoogleCalendarEvent): string {
  const baseURL = 'https://calendar.google.com/calendar/render'
  
  const startDate = formatGoogleDate(event.startTime, event.day, event.timezone)
  const endDate = formatGoogleDate(event.endTime, event.day, event.timezone)
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startDate}/${endDate}`
  })
  
  if (event.description) {
    params.set('details', event.description)
  }
  
  if (event.location) {
    params.set('location', event.location)
  }
  
  // Add timezone hint in the description if provided
  if (event.timezone && event.timezone !== 'UTC') {
    const currentDetails = params.get('details') || ''
    params.set('details', `${currentDetails}\n\nTimezone: ${event.timezone}`)
  }
  
  return `${baseURL}?${params.toString()}`
}

/**
 * Generate Google Calendar URL with additional options
 */
export function generateGoogleCalendarURLWithOptions(
  event: GoogleCalendarEvent,
  options: {
    reminderMinutes?: number
    guests?: string[]
    recurrence?: string
  } = {}
): string {
  const url = new URL(generateGoogleCalendarURL(event))
  
  // Note: Google Calendar deep links have limited customization
  // Most advanced features require the Calendar API
  
  if (options.guests && options.guests.length > 0) {
    url.searchParams.set('add', options.guests.join(','))
  }
  
  return url.toString()
}

/**
 * Build description with teachers info
 */
export function buildEventDescription(
  description?: string,
  teachers?: string[]
): string {
  const parts: string[] = []
  
  if (teachers && teachers.length > 0) {
    parts.push(`Teachers: ${teachers.join(', ')}`)
  }
  
  if (description) {
    parts.push(description)
  }
  
  parts.push('', 'Added from Flow Grid')
  
  return parts.join('\n')
}
