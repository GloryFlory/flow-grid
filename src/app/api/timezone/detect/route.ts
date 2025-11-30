import { NextRequest, NextResponse } from 'next/server'

interface NominatimResult {
  lat: string
  lon: string
  display_name: string
  address?: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    country_code?: string
  }
}

// Major city to timezone mapping for common festival locations
const CITY_TIMEZONE_MAP: Record<string, string> = {
  // Middle East
  'dubai': 'Asia/Dubai',
  'abu dhabi': 'Asia/Dubai',
  'doha': 'Asia/Qatar',
  'riyadh': 'Asia/Riyadh',
  'jeddah': 'Asia/Riyadh',
  'tel aviv': 'Asia/Jerusalem',
  'jerusalem': 'Asia/Jerusalem',
  'amman': 'Asia/Amman',
  'beirut': 'Asia/Beirut',
  'kuwait': 'Asia/Kuwait',
  'muscat': 'Asia/Muscat',
  'bahrain': 'Asia/Bahrain',
  
  // Europe
  'london': 'Europe/London',
  'paris': 'Europe/Paris',
  'berlin': 'Europe/Berlin',
  'munich': 'Europe/Berlin',
  'amsterdam': 'Europe/Amsterdam',
  'brussels': 'Europe/Brussels',
  'madrid': 'Europe/Madrid',
  'barcelona': 'Europe/Madrid',
  'rome': 'Europe/Rome',
  'milan': 'Europe/Rome',
  'vienna': 'Europe/Vienna',
  'zurich': 'Europe/Zurich',
  'geneva': 'Europe/Zurich',
  'lisbon': 'Europe/Lisbon',
  'dublin': 'Europe/Dublin',
  'athens': 'Europe/Athens',
  'prague': 'Europe/Prague',
  'warsaw': 'Europe/Warsaw',
  'budapest': 'Europe/Budapest',
  'stockholm': 'Europe/Stockholm',
  'oslo': 'Europe/Oslo',
  'copenhagen': 'Europe/Copenhagen',
  'helsinki': 'Europe/Helsinki',
  'moscow': 'Europe/Moscow',
  'istanbul': 'Europe/Istanbul',
  
  // Americas
  'new york': 'America/New_York',
  'los angeles': 'America/Los_Angeles',
  'chicago': 'America/Chicago',
  'houston': 'America/Chicago',
  'miami': 'America/New_York',
  'san francisco': 'America/Los_Angeles',
  'seattle': 'America/Los_Angeles',
  'boston': 'America/New_York',
  'denver': 'America/Denver',
  'phoenix': 'America/Phoenix',
  'toronto': 'America/Toronto',
  'montreal': 'America/Montreal',
  'vancouver': 'America/Vancouver',
  'mexico city': 'America/Mexico_City',
  'sao paulo': 'America/Sao_Paulo',
  'rio de janeiro': 'America/Sao_Paulo',
  'buenos aires': 'America/Argentina/Buenos_Aires',
  'bogota': 'America/Bogota',
  'lima': 'America/Lima',
  'santiago': 'America/Santiago',
  
  // Asia Pacific
  'tokyo': 'Asia/Tokyo',
  'osaka': 'Asia/Tokyo',
  'seoul': 'Asia/Seoul',
  'beijing': 'Asia/Shanghai',
  'shanghai': 'Asia/Shanghai',
  'hong kong': 'Asia/Hong_Kong',
  'singapore': 'Asia/Singapore',
  'bangkok': 'Asia/Bangkok',
  'kuala lumpur': 'Asia/Kuala_Lumpur',
  'jakarta': 'Asia/Jakarta',
  'manila': 'Asia/Manila',
  'taipei': 'Asia/Taipei',
  'delhi': 'Asia/Kolkata',
  'mumbai': 'Asia/Kolkata',
  'bangalore': 'Asia/Kolkata',
  'chennai': 'Asia/Kolkata',
  'kolkata': 'Asia/Kolkata',
  'colombo': 'Asia/Colombo',
  'sri lanka': 'Asia/Colombo',
  'kathmandu': 'Asia/Kathmandu',
  'dhaka': 'Asia/Dhaka',
  'yangon': 'Asia/Yangon',
  'hanoi': 'Asia/Ho_Chi_Minh',
  'ho chi minh': 'Asia/Ho_Chi_Minh',
  'sydney': 'Australia/Sydney',
  'melbourne': 'Australia/Melbourne',
  'brisbane': 'Australia/Brisbane',
  'perth': 'Australia/Perth',
  'auckland': 'Pacific/Auckland',
  'wellington': 'Pacific/Auckland',
  'fiji': 'Pacific/Fiji',
  'honolulu': 'Pacific/Honolulu',
  'hawaii': 'Pacific/Honolulu',
  
  // Africa
  'cairo': 'Africa/Cairo',
  'johannesburg': 'Africa/Johannesburg',
  'cape town': 'Africa/Johannesburg',
  'nairobi': 'Africa/Nairobi',
  'lagos': 'Africa/Lagos',
  'casablanca': 'Africa/Casablanca',
  'marrakech': 'Africa/Casablanca',
  'accra': 'Africa/Accra',
  'addis ababa': 'Africa/Addis_Ababa',
  'dar es salaam': 'Africa/Dar_es_Salaam',
  'tunis': 'Africa/Tunis',
  
  // Caribbean
  'kingston': 'America/Jamaica',
  'jamaica': 'America/Jamaica',
  'san juan': 'America/Puerto_Rico',
  'puerto rico': 'America/Puerto_Rico',
  'havana': 'America/Havana',
  'cuba': 'America/Havana',
  'nassau': 'America/Nassau',
  'bahamas': 'America/Nassau',
  'bridgetown': 'America/Barbados',
  'barbados': 'America/Barbados',
  'santo domingo': 'America/Santo_Domingo',
  'punta cana': 'America/Santo_Domingo',
  
  // Central America
  'san jose': 'America/Costa_Rica',
  'costa rica': 'America/Costa_Rica',
  'panama city': 'America/Panama',
  'panama': 'America/Panama',
  'guatemala city': 'America/Guatemala',
  'belize city': 'America/Belize',
  'belize': 'America/Belize',
  
  // Atlantic
  'reykjavik': 'Atlantic/Reykjavik',
  'iceland': 'Atlantic/Reykjavik',
  'tenerife': 'Atlantic/Canary',
  'canary islands': 'Atlantic/Canary',
  'las palmas': 'Atlantic/Canary',
  
  // Balkans
  'zagreb': 'Europe/Zagreb',
  'croatia': 'Europe/Zagreb',
  'ljubljana': 'Europe/Ljubljana',
  'slovenia': 'Europe/Ljubljana',
  'belgrade': 'Europe/Belgrade',
  'serbia': 'Europe/Belgrade',
  'bucharest': 'Europe/Bucharest',
}

// Country code to primary timezone mapping
const COUNTRY_TIMEZONE_MAP: Record<string, string> = {
  'ae': 'Asia/Dubai',
  'ar': 'America/Argentina/Buenos_Aires',
  'at': 'Europe/Vienna',
  'au': 'Australia/Sydney',
  'ba': 'Europe/Sarajevo',
  'be': 'Europe/Brussels',
  'bg': 'Europe/Sofia',
  'br': 'America/Sao_Paulo',
  'ca': 'America/Toronto',
  'ch': 'Europe/Zurich',
  'cl': 'America/Santiago',
  'cn': 'Asia/Shanghai',
  'co': 'America/Bogota',
  'cr': 'America/Costa_Rica',
  'cy': 'Asia/Nicosia',
  'cz': 'Europe/Prague',
  'de': 'Europe/Berlin',
  'dk': 'Europe/Copenhagen',
  'ee': 'Europe/Tallinn',
  'eg': 'Africa/Cairo',
  'es': 'Europe/Madrid',
  'fi': 'Europe/Helsinki',
  'fr': 'Europe/Paris',
  'gb': 'Europe/London',
  'gr': 'Europe/Athens',
  'hk': 'Asia/Hong_Kong',
  'hr': 'Europe/Zagreb',
  'hu': 'Europe/Budapest',
  'id': 'Asia/Jakarta',
  'ie': 'Europe/Dublin',
  'il': 'Asia/Jerusalem',
  'in': 'Asia/Kolkata',
  'is': 'Atlantic/Reykjavik',
  'it': 'Europe/Rome',
  'jp': 'Asia/Tokyo',
  'ke': 'Africa/Nairobi',
  'kr': 'Asia/Seoul',
  'lt': 'Europe/Vilnius',
  'lu': 'Europe/Luxembourg',
  'lv': 'Europe/Riga',
  'ma': 'Africa/Casablanca',
  'me': 'Europe/Podgorica',
  'mk': 'Europe/Skopje',
  'mt': 'Europe/Malta',
  'mx': 'America/Mexico_City',
  'my': 'Asia/Kuala_Lumpur',
  'mm': 'Asia/Yangon',
  'mv': 'Indian/Maldives',
  'ng': 'Africa/Lagos',
  'nl': 'Europe/Amsterdam',
  'no': 'Europe/Oslo',
  'np': 'Asia/Kathmandu',
  'nz': 'Pacific/Auckland',
  'om': 'Asia/Muscat',
  'pe': 'America/Lima',
  'ph': 'Asia/Manila',
  'pk': 'Asia/Karachi',
  'pl': 'Europe/Warsaw',
  'pt': 'Europe/Lisbon',
  'qa': 'Asia/Qatar',
  'ro': 'Europe/Bucharest',
  'rs': 'Europe/Belgrade',
  'ru': 'Europe/Moscow',
  'sa': 'Asia/Riyadh',
  'se': 'Europe/Stockholm',
  'sg': 'Asia/Singapore',
  'si': 'Europe/Ljubljana',
  'sk': 'Europe/Bratislava',
  'lk': 'Asia/Colombo',
  'th': 'Asia/Bangkok',
  'tn': 'Africa/Tunis',
  'tr': 'Europe/Istanbul',
  'tw': 'Asia/Taipei',
  'ua': 'Europe/Kiev',
  'uk': 'Europe/London',
  'us': 'America/New_York',
  'uy': 'America/Montevideo',
  'vn': 'Asia/Ho_Chi_Minh',
  'za': 'Africa/Johannesburg',
  // Caribbean
  'jm': 'America/Jamaica',
  'pr': 'America/Puerto_Rico',
  'cu': 'America/Havana',
  'bs': 'America/Nassau',
  'bb': 'America/Barbados',
  'do': 'America/Santo_Domingo',
  'ht': 'America/Port-au-Prince',
  'tt': 'America/Port_of_Spain',
  // Central America
  'gt': 'America/Guatemala',
  'bz': 'America/Belize',
  'sv': 'America/El_Salvador',
  'hn': 'America/Tegucigalpa',
  'ni': 'America/Managua',
  'pa': 'America/Panama',
  // Balkans
  'al': 'Europe/Tirane',
  'xk': 'Europe/Belgrade',
  // Africa additions
  'gh': 'Africa/Accra',
  'tz': 'Africa/Dar_es_Salaam',
}

function findTimezone(location: string, countryCode?: string): string | null {
  const locationLower = location.toLowerCase()
  
  // First, check for city matches
  for (const [city, tz] of Object.entries(CITY_TIMEZONE_MAP)) {
    if (locationLower.includes(city)) {
      return tz
    }
  }
  
  // Then, check country code
  if (countryCode) {
    const tz = COUNTRY_TIMEZONE_MAP[countryCode.toLowerCase()]
    if (tz) return tz
  }
  
  return null
}

function getTimezoneInfo(timezone: string): { abbreviation: string; offset: string; displayLabel: string } {
  const now = new Date()
  
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    })
    const parts = formatter.formatToParts(now)
    const tzAbbr = parts.find(p => p.type === 'timeZoneName')?.value || ''

    const offsetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    })
    const offsetParts = offsetFormatter.formatToParts(now)
    const offset = offsetParts.find(p => p.type === 'timeZoneName')?.value || ''

    return {
      abbreviation: tzAbbr,
      offset: offset,
      displayLabel: `${timezone.split('/').pop()?.replace(/_/g, ' ')} (${tzAbbr})`
    }
  } catch {
    return {
      abbreviation: '',
      offset: '',
      displayLabel: timezone
    }
  }
}

/**
 * Detect timezone from a location string using:
 * 1. OpenStreetMap Nominatim for geocoding
 * 2. City/country lookup tables for timezone detection
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get('location')

  if (!location || location.trim().length < 2) {
    return NextResponse.json(
      { error: 'Location parameter is required (min 2 characters)' },
      { status: 400 }
    )
  }

  try {
    // First, try direct city match without geocoding
    const directMatch = findTimezone(location, undefined)
    if (directMatch) {
      const tzInfo = getTimezoneInfo(directMatch)
      return NextResponse.json({
        found: true,
        displayName: location,
        timezone: {
          id: directMatch,
          ...tzInfo
        }
      })
    }

    // Otherwise, geocode to get country code
    const geocodeUrl = new URL('https://nominatim.openstreetmap.org/search')
    geocodeUrl.searchParams.set('q', location)
    geocodeUrl.searchParams.set('format', 'json')
    geocodeUrl.searchParams.set('limit', '1')
    geocodeUrl.searchParams.set('addressdetails', '1')

    const geocodeResponse = await fetch(geocodeUrl.toString(), {
      headers: {
        'User-Agent': 'FlowGrid/1.0 (contact@tryflowgrid.com)',
        'Accept-Language': 'en'
      }
    })

    if (!geocodeResponse.ok) {
      throw new Error('Geocoding service unavailable')
    }

    const results: NominatimResult[] = await geocodeResponse.json()

    if (!results || results.length === 0) {
      return NextResponse.json(
        { 
          found: false, 
          message: 'Location not found',
          suggestion: null 
        },
        { status: 200 }
      )
    }

    const result = results[0]
    const countryCode = result.address?.country_code

    // Try to find timezone from geocoded result
    const timezone = findTimezone(result.display_name, countryCode)

    if (!timezone) {
      return NextResponse.json(
        { 
          found: true,
          displayName: result.display_name,
          timezone: null,
          message: 'Could not determine timezone for this location'
        },
        { status: 200 }
      )
    }

    const tzInfo = getTimezoneInfo(timezone)

    return NextResponse.json({
      found: true,
      displayName: result.display_name,
      address: result.address,
      timezone: {
        id: timezone,
        ...tzInfo
      }
    })

  } catch (error) {
    console.error('Timezone detection error:', error)
    return NextResponse.json(
      { error: 'Failed to detect timezone', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
