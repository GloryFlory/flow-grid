'use client'
import React, { useEffect, useRef, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { MapPin, Search, X } from 'lucide-react'

// City to timezone mapping - comprehensive list for festival locations
const CITY_TIMEZONES: { city: string; country: string; timezone: string }[] = [
  // North America - USA
  { city: 'New York', country: 'USA', timezone: 'America/New_York' },
  { city: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles' },
  { city: 'Chicago', country: 'USA', timezone: 'America/Chicago' },
  { city: 'Houston', country: 'USA', timezone: 'America/Chicago' },
  { city: 'Phoenix', country: 'USA', timezone: 'America/Phoenix' },
  { city: 'San Francisco', country: 'USA', timezone: 'America/Los_Angeles' },
  { city: 'Seattle', country: 'USA', timezone: 'America/Los_Angeles' },
  { city: 'Miami', country: 'USA', timezone: 'America/New_York' },
  { city: 'Denver', country: 'USA', timezone: 'America/Denver' },
  { city: 'Boston', country: 'USA', timezone: 'America/New_York' },
  { city: 'Austin', country: 'USA', timezone: 'America/Chicago' },
  { city: 'Portland', country: 'USA', timezone: 'America/Los_Angeles' },
  { city: 'Las Vegas', country: 'USA', timezone: 'America/Los_Angeles' },
  { city: 'San Diego', country: 'USA', timezone: 'America/Los_Angeles' },
  { city: 'Atlanta', country: 'USA', timezone: 'America/New_York' },
  { city: 'Nashville', country: 'USA', timezone: 'America/Chicago' },
  { city: 'New Orleans', country: 'USA', timezone: 'America/Chicago' },
  { city: 'Honolulu', country: 'USA', timezone: 'Pacific/Honolulu' },
  { city: 'Anchorage', country: 'USA', timezone: 'America/Anchorage' },
  
  // North America - Canada
  { city: 'Toronto', country: 'Canada', timezone: 'America/Toronto' },
  { city: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver' },
  { city: 'Montreal', country: 'Canada', timezone: 'America/Montreal' },
  { city: 'Calgary', country: 'Canada', timezone: 'America/Edmonton' },
  { city: 'Ottawa', country: 'Canada', timezone: 'America/Toronto' },
  
  // Mexico & Central America
  { city: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City' },
  { city: 'Cancun', country: 'Mexico', timezone: 'America/Cancun' },
  { city: 'Guadalajara', country: 'Mexico', timezone: 'America/Mexico_City' },
  { city: 'Tulum', country: 'Mexico', timezone: 'America/Cancun' },
  { city: 'San Jose', country: 'Costa Rica', timezone: 'America/Costa_Rica' },
  { city: 'Panama City', country: 'Panama', timezone: 'America/Panama' },
  { city: 'Guatemala City', country: 'Guatemala', timezone: 'America/Guatemala' },
  
  // South America
  { city: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo' },
  { city: 'Rio de Janeiro', country: 'Brazil', timezone: 'America/Sao_Paulo' },
  { city: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires' },
  { city: 'Lima', country: 'Peru', timezone: 'America/Lima' },
  { city: 'Bogotá', country: 'Colombia', timezone: 'America/Bogota' },
  { city: 'Santiago', country: 'Chile', timezone: 'America/Santiago' },
  { city: 'Medellín', country: 'Colombia', timezone: 'America/Bogota' },
  
  // Caribbean
  { city: 'Havana', country: 'Cuba', timezone: 'America/Havana' },
  { city: 'San Juan', country: 'Puerto Rico', timezone: 'America/Puerto_Rico' },
  { city: 'Kingston', country: 'Jamaica', timezone: 'America/Jamaica' },
  { city: 'Nassau', country: 'Bahamas', timezone: 'America/Nassau' },
  
  // UK & Ireland
  { city: 'London', country: 'UK', timezone: 'Europe/London' },
  { city: 'Manchester', country: 'UK', timezone: 'Europe/London' },
  { city: 'Edinburgh', country: 'UK', timezone: 'Europe/London' },
  { city: 'Birmingham', country: 'UK', timezone: 'Europe/London' },
  { city: 'Bristol', country: 'UK', timezone: 'Europe/London' },
  { city: 'Glasgow', country: 'UK', timezone: 'Europe/London' },
  { city: 'Dublin', country: 'Ireland', timezone: 'Europe/Dublin' },
  
  // Western Europe
  { city: 'Paris', country: 'France', timezone: 'Europe/Paris' },
  { city: 'Lyon', country: 'France', timezone: 'Europe/Paris' },
  { city: 'Marseille', country: 'France', timezone: 'Europe/Paris' },
  { city: 'Nice', country: 'France', timezone: 'Europe/Paris' },
  { city: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin' },
  { city: 'Munich', country: 'Germany', timezone: 'Europe/Berlin' },
  { city: 'Hamburg', country: 'Germany', timezone: 'Europe/Berlin' },
  { city: 'Frankfurt', country: 'Germany', timezone: 'Europe/Berlin' },
  { city: 'Cologne', country: 'Germany', timezone: 'Europe/Berlin' },
  { city: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam' },
  { city: 'Rotterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam' },
  { city: 'Brussels', country: 'Belgium', timezone: 'Europe/Brussels' },
  { city: 'Antwerp', country: 'Belgium', timezone: 'Europe/Brussels' },
  { city: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich' },
  { city: 'Geneva', country: 'Switzerland', timezone: 'Europe/Zurich' },
  { city: 'Vienna', country: 'Austria', timezone: 'Europe/Vienna' },
  { city: 'Salzburg', country: 'Austria', timezone: 'Europe/Vienna' },
  
  // Southern Europe
  { city: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid' },
  { city: 'Barcelona', country: 'Spain', timezone: 'Europe/Madrid' },
  { city: 'Valencia', country: 'Spain', timezone: 'Europe/Madrid' },
  { city: 'Seville', country: 'Spain', timezone: 'Europe/Madrid' },
  { city: 'Ibiza', country: 'Spain', timezone: 'Europe/Madrid' },
  { city: 'Mallorca', country: 'Spain', timezone: 'Europe/Madrid' },
  { city: 'Rome', country: 'Italy', timezone: 'Europe/Rome' },
  { city: 'Milan', country: 'Italy', timezone: 'Europe/Rome' },
  { city: 'Florence', country: 'Italy', timezone: 'Europe/Rome' },
  { city: 'Venice', country: 'Italy', timezone: 'Europe/Rome' },
  { city: 'Naples', country: 'Italy', timezone: 'Europe/Rome' },
  { city: 'Lisbon', country: 'Portugal', timezone: 'Europe/Lisbon' },
  { city: 'Porto', country: 'Portugal', timezone: 'Europe/Lisbon' },
  { city: 'Athens', country: 'Greece', timezone: 'Europe/Athens' },
  { city: 'Thessaloniki', country: 'Greece', timezone: 'Europe/Athens' },
  { city: 'Mykonos', country: 'Greece', timezone: 'Europe/Athens' },
  { city: 'Santorini', country: 'Greece', timezone: 'Europe/Athens' },
  
  // Northern Europe
  { city: 'Stockholm', country: 'Sweden', timezone: 'Europe/Stockholm' },
  { city: 'Gothenburg', country: 'Sweden', timezone: 'Europe/Stockholm' },
  { city: 'Copenhagen', country: 'Denmark', timezone: 'Europe/Copenhagen' },
  { city: 'Oslo', country: 'Norway', timezone: 'Europe/Oslo' },
  { city: 'Bergen', country: 'Norway', timezone: 'Europe/Oslo' },
  { city: 'Helsinki', country: 'Finland', timezone: 'Europe/Helsinki' },
  { city: 'Reykjavik', country: 'Iceland', timezone: 'Atlantic/Reykjavik' },
  
  // Eastern Europe
  { city: 'Prague', country: 'Czech Republic', timezone: 'Europe/Prague' },
  { city: 'Budapest', country: 'Hungary', timezone: 'Europe/Budapest' },
  { city: 'Warsaw', country: 'Poland', timezone: 'Europe/Warsaw' },
  { city: 'Krakow', country: 'Poland', timezone: 'Europe/Warsaw' },
  { city: 'Bucharest', country: 'Romania', timezone: 'Europe/Bucharest' },
  { city: 'Sofia', country: 'Bulgaria', timezone: 'Europe/Sofia' },
  { city: 'Zagreb', country: 'Croatia', timezone: 'Europe/Zagreb' },
  { city: 'Split', country: 'Croatia', timezone: 'Europe/Zagreb' },
  { city: 'Ljubljana', country: 'Slovenia', timezone: 'Europe/Ljubljana' },
  { city: 'Belgrade', country: 'Serbia', timezone: 'Europe/Belgrade' },
  { city: 'Tallinn', country: 'Estonia', timezone: 'Europe/Tallinn' },
  { city: 'Riga', country: 'Latvia', timezone: 'Europe/Riga' },
  { city: 'Vilnius', country: 'Lithuania', timezone: 'Europe/Vilnius' },
  
  // Russia & CIS
  { city: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow' },
  { city: 'St Petersburg', country: 'Russia', timezone: 'Europe/Moscow' },
  { city: 'Kyiv', country: 'Ukraine', timezone: 'Europe/Kyiv' },
  
  // Middle East
  { city: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai' },
  { city: 'Abu Dhabi', country: 'UAE', timezone: 'Asia/Dubai' },
  { city: 'Tel Aviv', country: 'Israel', timezone: 'Asia/Jerusalem' },
  { city: 'Jerusalem', country: 'Israel', timezone: 'Asia/Jerusalem' },
  { city: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { city: 'Ankara', country: 'Turkey', timezone: 'Europe/Istanbul' },
  { city: 'Doha', country: 'Qatar', timezone: 'Asia/Qatar' },
  { city: 'Riyadh', country: 'Saudi Arabia', timezone: 'Asia/Riyadh' },
  { city: 'Amman', country: 'Jordan', timezone: 'Asia/Amman' },
  { city: 'Beirut', country: 'Lebanon', timezone: 'Asia/Beirut' },
  
  // South Asia
  { city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata' },
  { city: 'Delhi', country: 'India', timezone: 'Asia/Kolkata' },
  { city: 'Bangalore', country: 'India', timezone: 'Asia/Kolkata' },
  { city: 'Goa', country: 'India', timezone: 'Asia/Kolkata' },
  { city: 'Colombo', country: 'Sri Lanka', timezone: 'Asia/Colombo' },
  { city: 'Kathmandu', country: 'Nepal', timezone: 'Asia/Kathmandu' },
  
  // Southeast Asia
  { city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore' },
  { city: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok' },
  { city: 'Phuket', country: 'Thailand', timezone: 'Asia/Bangkok' },
  { city: 'Chiang Mai', country: 'Thailand', timezone: 'Asia/Bangkok' },
  { city: 'Kuala Lumpur', country: 'Malaysia', timezone: 'Asia/Kuala_Lumpur' },
  { city: 'Ho Chi Minh City', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { city: 'Hanoi', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh' },
  { city: 'Bali', country: 'Indonesia', timezone: 'Asia/Makassar' },
  { city: 'Jakarta', country: 'Indonesia', timezone: 'Asia/Jakarta' },
  { city: 'Manila', country: 'Philippines', timezone: 'Asia/Manila' },
  
  // East Asia
  { city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { city: 'Osaka', country: 'Japan', timezone: 'Asia/Tokyo' },
  { city: 'Kyoto', country: 'Japan', timezone: 'Asia/Tokyo' },
  { city: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul' },
  { city: 'Hong Kong', country: 'Hong Kong', timezone: 'Asia/Hong_Kong' },
  { city: 'Taipei', country: 'Taiwan', timezone: 'Asia/Taipei' },
  { city: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai' },
  { city: 'Beijing', country: 'China', timezone: 'Asia/Shanghai' },
  
  // Australia & New Zealand
  { city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
  { city: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne' },
  { city: 'Brisbane', country: 'Australia', timezone: 'Australia/Brisbane' },
  { city: 'Perth', country: 'Australia', timezone: 'Australia/Perth' },
  { city: 'Adelaide', country: 'Australia', timezone: 'Australia/Adelaide' },
  { city: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland' },
  { city: 'Wellington', country: 'New Zealand', timezone: 'Pacific/Auckland' },
  
  // Africa
  { city: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo' },
  { city: 'Cape Town', country: 'South Africa', timezone: 'Africa/Johannesburg' },
  { city: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg' },
  { city: 'Marrakech', country: 'Morocco', timezone: 'Africa/Casablanca' },
  { city: 'Casablanca', country: 'Morocco', timezone: 'Africa/Casablanca' },
  { city: 'Lagos', country: 'Nigeria', timezone: 'Africa/Lagos' },
  { city: 'Nairobi', country: 'Kenya', timezone: 'Africa/Nairobi' },
  { city: 'Accra', country: 'Ghana', timezone: 'Africa/Accra' },
  
  // Islands & Others
  { city: 'Canary Islands', country: 'Spain', timezone: 'Atlantic/Canary' },
  { city: 'Azores', country: 'Portugal', timezone: 'Atlantic/Azores' },
  { city: 'Mauritius', country: 'Mauritius', timezone: 'Indian/Mauritius' },
  { city: 'Maldives', country: 'Maldives', timezone: 'Indian/Maldives' },
  { city: 'Fiji', country: 'Fiji', timezone: 'Pacific/Fiji' },
]

// Try to get city name from timezone
function getCityFromTimezone(timezone: string): { city: string; country: string } | null {
  const match = CITY_TIMEZONES.find(c => c.timezone === timezone)
  if (match) return { city: match.city, country: match.country }
  
  // Fallback: extract city from timezone string (e.g., "Europe/Berlin" -> "Berlin")
  const parts = timezone.split('/')
  if (parts.length >= 2) {
    const cityPart = parts[parts.length - 1].replace(/_/g, ' ')
    return { city: cityPart, country: parts[0].replace(/_/g, ' ') }
  }
  
  return null
}

interface LocationSelectProps {
  timezone: string
  onTimezoneChange: (timezone: string) => void
  location?: string
  onLocationChange?: (location: string) => void
}

export default function LocationSelect({ 
  timezone, 
  onTimezoneChange,
  location,
  onLocationChange 
}: LocationSelectProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [search, setSearch] = useState('')
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  // Close on outside click
  useEffect(() => {
    if (!isEditing) return
    
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsEditing(false)
        setSearch('')
      }
    }
    
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsEditing(false)
        setSearch('')
      }
    }
    
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [isEditing])

  // Get display location
  const displayLocation = useMemo(() => {
    if (location) return location
    const cityInfo = getCityFromTimezone(timezone)
    if (cityInfo) return `${cityInfo.city}, ${cityInfo.country}`
    return timezone
  }, [location, timezone])

  // Filter cities based on search
  const filteredCities = useMemo(() => {
    if (!search.trim()) return CITY_TIMEZONES.slice(0, 10) // Show first 10 by default
    
    const searchLower = search.toLowerCase()
    return CITY_TIMEZONES.filter(c => 
      c.city.toLowerCase().includes(searchLower) ||
      c.country.toLowerCase().includes(searchLower)
    ).slice(0, 15) // Limit results
  }, [search])

  const handleSelect = (city: typeof CITY_TIMEZONES[0]) => {
    onTimezoneChange(city.timezone)
    onLocationChange?.(`${city.city}, ${city.country}`)
    setIsEditing(false)
    setSearch('')
  }

  const dropdownContent = isEditing && mounted ? createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[9998]" />
      
      {/* Modal */}
      <div 
        ref={menuRef}
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[9999] bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[70vh] flex flex-col sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-md"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Select Location</h3>
            <button 
              type="button"
              onClick={() => { setIsEditing(false); setSearch('') }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search city..."
              className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          {filteredCities.length > 0 ? (
            filteredCities.map((city, idx) => (
              <button
                key={`${city.city}-${city.country}-${idx}`}
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 border-b border-gray-50 last:border-0"
              >
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div>
                  <div className="font-medium text-gray-900">{city.city}</div>
                  <div className="text-sm text-gray-500">{city.country}</div>
                </div>
              </button>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-gray-500">
              No cities found for "{search}"
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  ) : null

  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>Location: <span className="font-medium text-gray-900">{displayLocation}</span></span>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          Change
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Auto-detected • Timezone: {timezone}
      </p>
      
      {dropdownContent}
    </div>
  )
}
