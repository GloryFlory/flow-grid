/**
 * Comprehensive list of IANA timezones grouped by region
 * Used for festival timezone selection and calendar exports
 */

export interface TimezoneOption {
  value: string
  label: string
  offset?: string
}

export interface TimezoneGroup {
  label: string
  options: TimezoneOption[]
}

// Flat list of common timezones for simple dropdowns
export const COMMON_TIMEZONES: TimezoneOption[] = [
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  
  // Americas
  { value: 'America/New_York', label: 'New York (Eastern Time)' },
  { value: 'America/Chicago', label: 'Chicago (Central Time)' },
  { value: 'America/Denver', label: 'Denver (Mountain Time)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific Time)' },
  { value: 'America/Anchorage', label: 'Anchorage (Alaska Time)' },
  { value: 'America/Honolulu', label: 'Honolulu (Hawaii Time)' },
  { value: 'America/Toronto', label: 'Toronto (Eastern Time)' },
  { value: 'America/Vancouver', label: 'Vancouver (Pacific Time)' },
  { value: 'America/Montreal', label: 'Montreal (Eastern Time)' },
  { value: 'America/Mexico_City', label: 'Mexico City' },
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires' },
  { value: 'America/Lima', label: 'Lima' },
  { value: 'America/Bogota', label: 'Bogotá' },
  { value: 'America/Santiago', label: 'Santiago' },
  
  // Caribbean
  { value: 'America/Jamaica', label: 'Jamaica' },
  { value: 'America/Puerto_Rico', label: 'Puerto Rico' },
  { value: 'America/Havana', label: 'Havana' },
  { value: 'America/Nassau', label: 'Bahamas' },
  { value: 'America/Barbados', label: 'Barbados' },
  { value: 'America/Santo_Domingo', label: 'Dominican Republic' },
  
  // Central America
  { value: 'America/Costa_Rica', label: 'Costa Rica' },
  { value: 'America/Panama', label: 'Panama' },
  { value: 'America/Guatemala', label: 'Guatemala' },
  { value: 'America/Belize', label: 'Belize' },
  
  // Europe
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Dublin', label: 'Dublin' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET)' },
  { value: 'Europe/Amsterdam', label: 'Amsterdam' },
  { value: 'Europe/Brussels', label: 'Brussels' },
  { value: 'Europe/Madrid', label: 'Madrid' },
  { value: 'Europe/Rome', label: 'Rome' },
  { value: 'Europe/Zurich', label: 'Zurich' },
  { value: 'Europe/Vienna', label: 'Vienna' },
  { value: 'Europe/Stockholm', label: 'Stockholm' },
  { value: 'Europe/Oslo', label: 'Oslo' },
  { value: 'Europe/Copenhagen', label: 'Copenhagen' },
  { value: 'Europe/Helsinki', label: 'Helsinki' },
  { value: 'Europe/Warsaw', label: 'Warsaw' },
  { value: 'Europe/Prague', label: 'Prague' },
  { value: 'Europe/Budapest', label: 'Budapest' },
  { value: 'Europe/Athens', label: 'Athens' },
  { value: 'Europe/Istanbul', label: 'Istanbul' },
  { value: 'Europe/Moscow', label: 'Moscow' },
  { value: 'Europe/Lisbon', label: 'Lisbon' },
  { value: 'Europe/Zagreb', label: 'Zagreb (Croatia)' },
  { value: 'Europe/Ljubljana', label: 'Ljubljana (Slovenia)' },
  { value: 'Europe/Belgrade', label: 'Belgrade (Serbia)' },
  { value: 'Europe/Bucharest', label: 'Bucharest' },
  { value: 'Atlantic/Reykjavik', label: 'Reykjavik (Iceland)' },
  { value: 'Atlantic/Canary', label: 'Canary Islands' },
  
  // Middle East
  { value: 'Asia/Dubai', label: 'Dubai (GST)' },
  { value: 'Asia/Abu_Dhabi', label: 'Abu Dhabi' },
  { value: 'Asia/Riyadh', label: 'Riyadh' },
  { value: 'Asia/Qatar', label: 'Qatar' },
  { value: 'Asia/Kuwait', label: 'Kuwait' },
  { value: 'Asia/Bahrain', label: 'Bahrain' },
  { value: 'Asia/Jerusalem', label: 'Jerusalem' },
  { value: 'Asia/Tehran', label: 'Tehran' },
  
  // Asia
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
  { value: 'Asia/Taipei', label: 'Taipei' },
  { value: 'Asia/Singapore', label: 'Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur' },
  { value: 'Asia/Bangkok', label: 'Bangkok' },
  { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City' },
  { value: 'Asia/Jakarta', label: 'Jakarta' },
  { value: 'Asia/Manila', label: 'Manila' },
  { value: 'Asia/Kolkata', label: 'India (IST)' },
  { value: 'Asia/Mumbai', label: 'Mumbai' },
  { value: 'Asia/Karachi', label: 'Karachi' },
  { value: 'Asia/Dhaka', label: 'Dhaka' },
  { value: 'Asia/Colombo', label: 'Sri Lanka (Colombo)' },
  { value: 'Asia/Kathmandu', label: 'Kathmandu' },
  { value: 'Asia/Yangon', label: 'Yangon (Myanmar)' },
  
  // Indian Ocean
  { value: 'Indian/Maldives', label: 'Maldives' },
  { value: 'Indian/Mauritius', label: 'Mauritius' },
  { value: 'Indian/Reunion', label: 'Réunion' },
  
  // Oceania
  { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
  { value: 'Australia/Melbourne', label: 'Melbourne' },
  { value: 'Australia/Brisbane', label: 'Brisbane' },
  { value: 'Australia/Perth', label: 'Perth' },
  { value: 'Australia/Adelaide', label: 'Adelaide' },
  { value: 'Pacific/Auckland', label: 'Auckland (NZST)' },
  { value: 'Pacific/Fiji', label: 'Fiji' },
  { value: 'Pacific/Honolulu', label: 'Hawaii (Honolulu)' },
  
  // Africa
  { value: 'Africa/Cairo', label: 'Cairo' },
  { value: 'Africa/Johannesburg', label: 'Johannesburg' },
  { value: 'Africa/Lagos', label: 'Lagos' },
  { value: 'Africa/Nairobi', label: 'Nairobi' },
  { value: 'Africa/Casablanca', label: 'Casablanca' },
  { value: 'Africa/Accra', label: 'Accra (Ghana)' },
  { value: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam (Tanzania)' },
  { value: 'Africa/Tunis', label: 'Tunis' },
]

// Grouped timezones for a better UX in larger dropdowns
export const TIMEZONE_GROUPS: TimezoneGroup[] = [
  {
    label: 'Universal',
    options: [
      { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    ]
  },
  {
    label: 'North America',
    options: [
      { value: 'America/New_York', label: 'New York (Eastern)' },
      { value: 'America/Chicago', label: 'Chicago (Central)' },
      { value: 'America/Denver', label: 'Denver (Mountain)' },
      { value: 'America/Los_Angeles', label: 'Los Angeles (Pacific)' },
      { value: 'America/Anchorage', label: 'Anchorage (Alaska)' },
      { value: 'America/Honolulu', label: 'Honolulu (Hawaii)' },
      { value: 'America/Toronto', label: 'Toronto' },
      { value: 'America/Vancouver', label: 'Vancouver' },
      { value: 'America/Montreal', label: 'Montreal' },
      { value: 'America/Mexico_City', label: 'Mexico City' },
    ]
  },
  {
    label: 'South America',
    options: [
      { value: 'America/Sao_Paulo', label: 'São Paulo' },
      { value: 'America/Buenos_Aires', label: 'Buenos Aires' },
      { value: 'America/Lima', label: 'Lima' },
      { value: 'America/Bogota', label: 'Bogotá' },
      { value: 'America/Santiago', label: 'Santiago' },
    ]
  },
  {
    label: 'Caribbean',
    options: [
      { value: 'America/Jamaica', label: 'Jamaica' },
      { value: 'America/Puerto_Rico', label: 'Puerto Rico' },
      { value: 'America/Havana', label: 'Havana (Cuba)' },
      { value: 'America/Nassau', label: 'Bahamas' },
      { value: 'America/Barbados', label: 'Barbados' },
      { value: 'America/Santo_Domingo', label: 'Dominican Republic' },
    ]
  },
  {
    label: 'Central America',
    options: [
      { value: 'America/Costa_Rica', label: 'Costa Rica' },
      { value: 'America/Panama', label: 'Panama' },
      { value: 'America/Guatemala', label: 'Guatemala' },
      { value: 'America/Belize', label: 'Belize' },
    ]
  },
  {
    label: 'Europe',
    options: [
      { value: 'Europe/London', label: 'London (GMT/BST)' },
      { value: 'Europe/Dublin', label: 'Dublin' },
      { value: 'Europe/Paris', label: 'Paris' },
      { value: 'Europe/Berlin', label: 'Berlin' },
      { value: 'Europe/Amsterdam', label: 'Amsterdam' },
      { value: 'Europe/Brussels', label: 'Brussels' },
      { value: 'Europe/Madrid', label: 'Madrid' },
      { value: 'Europe/Rome', label: 'Rome' },
      { value: 'Europe/Zurich', label: 'Zurich' },
      { value: 'Europe/Vienna', label: 'Vienna' },
      { value: 'Europe/Stockholm', label: 'Stockholm' },
      { value: 'Europe/Oslo', label: 'Oslo' },
      { value: 'Europe/Copenhagen', label: 'Copenhagen' },
      { value: 'Europe/Helsinki', label: 'Helsinki' },
      { value: 'Europe/Warsaw', label: 'Warsaw' },
      { value: 'Europe/Prague', label: 'Prague' },
      { value: 'Europe/Budapest', label: 'Budapest' },
      { value: 'Europe/Athens', label: 'Athens' },
      { value: 'Europe/Istanbul', label: 'Istanbul' },
      { value: 'Europe/Moscow', label: 'Moscow' },
      { value: 'Europe/Lisbon', label: 'Lisbon' },
      { value: 'Europe/Zagreb', label: 'Zagreb (Croatia)' },
      { value: 'Europe/Ljubljana', label: 'Ljubljana (Slovenia)' },
      { value: 'Europe/Belgrade', label: 'Belgrade (Serbia)' },
      { value: 'Europe/Bucharest', label: 'Bucharest' },
      { value: 'Atlantic/Reykjavik', label: 'Reykjavik (Iceland)' },
      { value: 'Atlantic/Canary', label: 'Canary Islands' },
    ]
  },
  {
    label: 'Middle East',
    options: [
      { value: 'Asia/Dubai', label: 'Dubai' },
      { value: 'Asia/Riyadh', label: 'Riyadh' },
      { value: 'Asia/Qatar', label: 'Doha (Qatar)' },
      { value: 'Asia/Kuwait', label: 'Kuwait' },
      { value: 'Asia/Jerusalem', label: 'Jerusalem' },
      { value: 'Asia/Tehran', label: 'Tehran' },
    ]
  },
  {
    label: 'Asia',
    options: [
      { value: 'Asia/Tokyo', label: 'Tokyo' },
      { value: 'Asia/Seoul', label: 'Seoul' },
      { value: 'Asia/Shanghai', label: 'Shanghai' },
      { value: 'Asia/Hong_Kong', label: 'Hong Kong' },
      { value: 'Asia/Taipei', label: 'Taipei' },
      { value: 'Asia/Singapore', label: 'Singapore' },
      { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur' },
      { value: 'Asia/Bangkok', label: 'Bangkok' },
      { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh City' },
      { value: 'Asia/Jakarta', label: 'Jakarta' },
      { value: 'Asia/Manila', label: 'Manila' },
      { value: 'Asia/Kolkata', label: 'India (Kolkata)' },
      { value: 'Asia/Colombo', label: 'Sri Lanka (Colombo)' },
      { value: 'Asia/Karachi', label: 'Karachi' },
      { value: 'Asia/Dhaka', label: 'Dhaka' },
      { value: 'Asia/Kathmandu', label: 'Kathmandu' },
      { value: 'Asia/Yangon', label: 'Yangon (Myanmar)' },
    ]
  },
  {
    label: 'Indian Ocean',
    options: [
      { value: 'Indian/Maldives', label: 'Maldives (Male)' },
      { value: 'Indian/Mauritius', label: 'Mauritius' },
      { value: 'Indian/Reunion', label: 'Réunion' },
      { value: 'Asia/Muscat', label: 'Muscat (Oman)' },
    ]
  },
  {
    label: 'Oceania',
    options: [
      { value: 'Australia/Sydney', label: 'Sydney' },
      { value: 'Australia/Melbourne', label: 'Melbourne' },
      { value: 'Australia/Brisbane', label: 'Brisbane' },
      { value: 'Australia/Perth', label: 'Perth' },
      { value: 'Australia/Adelaide', label: 'Adelaide' },
      { value: 'Pacific/Auckland', label: 'Auckland' },
      { value: 'Pacific/Fiji', label: 'Fiji' },
      { value: 'Pacific/Honolulu', label: 'Hawaii (Honolulu)' },
    ]
  },
  {
    label: 'Africa',
    options: [
      { value: 'Africa/Cairo', label: 'Cairo' },
      { value: 'Africa/Johannesburg', label: 'Johannesburg' },
      { value: 'Africa/Lagos', label: 'Lagos' },
      { value: 'Africa/Nairobi', label: 'Nairobi' },
      { value: 'Africa/Casablanca', label: 'Casablanca' },
      { value: 'Africa/Accra', label: 'Accra (Ghana)' },
      { value: 'Africa/Dar_es_Salaam', label: 'Dar es Salaam (Tanzania)' },
      { value: 'Africa/Tunis', label: 'Tunis' },
    ]
  },
]

/**
 * Get timezone offset string (e.g., "+05:30", "-08:00")
 */
export function getTimezoneOffset(timezone: string): string {
  try {
    const now = new Date()
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset'
    })
    const parts = formatter.formatToParts(now)
    const offsetPart = parts.find(p => p.type === 'timeZoneName')
    return offsetPart?.value || ''
  } catch {
    return ''
  }
}

/**
 * Get a formatted timezone label with current offset
 */
export function getTimezoneLabel(timezone: string): string {
  const option = COMMON_TIMEZONES.find(tz => tz.value === timezone)
  const offset = getTimezoneOffset(timezone)
  if (option) {
    return `${option.label} (${offset})`
  }
  return `${timezone} (${offset})`
}

/**
 * Convert a local time in a specific timezone to UTC
 * @param localDateTime - Date string in format "YYYY-MM-DDTHH:mm:ss" (local to the timezone)
 * @param timezone - IANA timezone string (e.g., "Asia/Dubai")
 * @returns ISO string in UTC
 */
export function localToUTC(localDateTime: string, timezone: string): string {
  // Parse the local datetime parts
  const [datePart, timePart] = localDateTime.split('T')
  const [year, month, day] = datePart.split('-').map(Number)
  const [hours, minutes, seconds = 0] = (timePart || '00:00:00').split(':').map(Number)
  
  // Create a formatter that will tell us the offset for this timezone at this time
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  // We need to find what UTC time corresponds to the local time in the given timezone
  // This is tricky because of DST. We use an iterative approach.
  
  // Start with a guess: interpret as UTC and adjust
  let guess = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds))
  
  // Get the formatted time in the target timezone
  const targetLocal = formatter.format(guess)
  
  // Parse the formatted result to see what local time we got
  const match = targetLocal.match(/(\d+)\/(\d+)\/(\d+),?\s*(\d+):(\d+):(\d+)/)
  if (match) {
    const [, m, d, y, h, min, sec] = match.map(Number)
    
    // Calculate the difference between what we wanted and what we got
    const wantedMinutes = hours * 60 + minutes
    const gotMinutes = h * 60 + min
    const diffMinutes = wantedMinutes - gotMinutes
    
    // Also check date difference (for edge cases around midnight)
    const wantedDate = new Date(year, month - 1, day)
    const gotDate = new Date(y, m - 1, d)
    const dateDiff = Math.round((wantedDate.getTime() - gotDate.getTime()) / (24 * 60 * 60 * 1000))
    
    // Adjust the guess
    guess = new Date(guess.getTime() + (diffMinutes + dateDiff * 24 * 60) * 60 * 1000)
  }
  
  return guess.toISOString()
}

/**
 * Format a local time for Google Calendar (converts to UTC)
 * @param localDate - Date in format "YYYY-MM-DD"
 * @param localTime - Time in format "HH:mm" or "HH:mm:ss"
 * @param timezone - IANA timezone string
 * @returns Google Calendar format "YYYYMMDDTHHmmssZ"
 */
export function formatForGoogleCalendar(localDate: string, localTime: string, timezone: string): string {
  const localDateTime = `${localDate}T${localTime}${localTime.length === 5 ? ':00' : ''}`
  const utcDate = new Date(localToUTC(localDateTime, timezone))
  
  const year = utcDate.getUTCFullYear()
  const month = String(utcDate.getUTCMonth() + 1).padStart(2, '0')
  const day = String(utcDate.getUTCDate()).padStart(2, '0')
  const hours = String(utcDate.getUTCHours()).padStart(2, '0')
  const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0')
  const seconds = String(utcDate.getUTCSeconds()).padStart(2, '0')
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`
}
