'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useFavourites } from '@/hooks/useFavourites'
import { getAnonUserId } from '@/lib/utils/anonUser'
import { generateGoogleCalendarURL, buildEventDescription } from '@/lib/utils/googleCalendar'

interface Session {
  id: string
  title: string
  description?: string
  day: string
  startTime: string
  endTime: string
  location?: string
  level?: string
  styles: string[]
  teachers: string[]
  cardType: string
  festivalId: string
}

interface Festival {
  id: string
  name: string
  slug: string
  timezone: string
  startDate: string
  endDate: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

interface FavouriteWithSession {
  id: string
  sessionId: string
  festivalId: string
  createdAt: string
  session: Session
  festival: Festival
}

export default function FestivalMySchedulePage() {
  const params = useParams()
  const slug = params.slug as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [isLoadingFestival, setIsLoadingFestival] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set())

  // Load festival data first
  useEffect(() => {
    const loadFestival = async () => {
      try {
        const response = await fetch(`/api/public/festivals/${slug}`)
        if (response.ok) {
          const data = await response.json()
          setFestival(data.festival)
        }
      } catch (err) {
        console.error('Error loading festival:', err)
      } finally {
        setIsLoadingFestival(false)
      }
    }
    
    if (slug) {
      loadFestival()
    }
  }, [slug])

  // Load favourites for this specific festival
  const { favouritesList, isLoading: isLoadingFavourites, removeFavourite } = useFavourites({ 
    festivalId: festival?.id 
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Group sessions by day
  const sessionsByDay = useMemo(() => {
    const grouped: Record<string, FavouriteWithSession[]> = {}
    
    for (const fav of favouritesList as FavouriteWithSession[]) {
      const day = fav.session.day
      if (!grouped[day]) {
        grouped[day] = []
      }
      grouped[day].push(fav)
    }
    
    // Sort sessions within each day by start time
    for (const day in grouped) {
      grouped[day].sort((a, b) => {
        return a.session.startTime.localeCompare(b.session.startTime)
      })
    }
    
    return grouped
  }, [favouritesList])

  // Get sorted days
  const sortedDays = useMemo(() => {
    return Object.keys(sessionsByDay).sort()
  }, [sessionsByDay])

  // Toggle day expansion
  const toggleDay = (day: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev)
      if (next.has(day)) {
        next.delete(day)
      } else {
        next.add(day)
      }
      return next
    })
  }

  // Expand all days by default
  useEffect(() => {
    if (sortedDays.length > 0 && expandedDays.size === 0) {
      setExpandedDays(new Set(sortedDays))
    }
  }, [sortedDays])

  // Format time for display - handle the session time format correctly
  const formatTime = (timeStr: string) => {
    if (!timeStr || timeStr === 'Invalid Date') return '--:--'
    
    try {
      // If it's already in HH:mm format, just return it
      if (/^\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr
      }
      
      // If it's HH:mm:ss format
      if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) {
        return timeStr.slice(0, 5)
      }
      
      // If it's an ISO date string (e.g., "2025-11-14T09:00:00")
      if (timeStr.includes('T')) {
        const date = new Date(timeStr)
        if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        }
      }
      
      // Try parsing as a generic date
      const date = new Date(timeStr)
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      }
      
      return '--:--'
    } catch {
      return '--:--'
    }
  }

  // Format day header
  const formatDayHeader = (dateStr: string): string => {
    // Handle invalid or special values
    if (!dateStr || dateStr === 'Invalid Date' || dateStr === 'TBD') {
      return dateStr || 'TBD'
    }
    
    try {
      // Check if it's already a human-readable format (e.g., "Friday" or "Day 1")
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr
      }
      
      const date = new Date(dateStr + 'T12:00:00Z')
      if (isNaN(date.getTime())) {
        return dateStr
      }
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
      const day = date.getUTCDate()
      const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
      return `${dayName}, ${month} ${day}`
    } catch {
      return dateStr
    }
  }

  // Handle export full schedule
  const handleExportAll = () => {
    const anonUserId = getAnonUserId()
    if (!anonUserId || !festival) return
    
    const url = `/api/calendar/my-schedule?anonUserId=${encodeURIComponent(anonUserId)}&festivalId=${encodeURIComponent(festival.id)}`
    window.location.href = url
  }

  // Handle export single day
  const handleExportDay = (day: string) => {
    const anonUserId = getAnonUserId()
    if (!anonUserId || !festival) return
    
    const url = `/api/calendar/my-schedule?anonUserId=${encodeURIComponent(anonUserId)}&festivalId=${encodeURIComponent(festival.id)}&day=${encodeURIComponent(day)}`
    window.location.href = url
  }

  // Handle export single session
  const handleExportSession = (sessionId: string) => {
    window.location.href = `/api/calendar/session/${sessionId}`
  }

  // Handle Google Calendar
  const handleGoogleCalendar = (session: Session) => {
    const url = generateGoogleCalendarURL({
      title: session.title,
      description: buildEventDescription(session.description, session.teachers),
      location: session.location,
      startTime: session.startTime,
      endTime: session.endTime,
      day: session.day,
      timezone: festival?.timezone || 'UTC'
    })
    
    // Track the Google Calendar export
    if (festival) {
      fetch('/api/track/calendar-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          festivalId: festival.id,
          exportType: 'single_session',
          method: 'google_calendar',
          sessionCount: 1,
          anonUserId: getAnonUserId()
        })
      }).catch(() => {}) // Fire and forget
    }
    
    window.open(url, '_blank')
  }

  // Handle remove favourite
  const handleRemove = async (sessionId: string) => {
    await removeFavourite(sessionId)
  }

  if (!mounted) {
    return null
  }

  const isLoading = isLoadingFestival || isLoadingFavourites

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-blue-600 font-medium">Loading your schedule...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!festival) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Festival not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">Go to homepage</Link>
        </div>
      </div>
    )
  }

  const totalSessions = favouritesList.length

  // Apply festival branding
  const brandingStyles = {
    '--primary-color': festival.primaryColor || '#4a90e2',
    '--secondary-color': festival.secondaryColor || '#7b68ee',
    '--accent-color': festival.accentColor || '#ff6b6b',
  } as React.CSSProperties

  const primaryColor = festival.primaryColor || '#3b82f6'
  const secondaryColor = festival.secondaryColor || '#6366f1'
  
  // Format timezone for display
  const formatTimezone = (tz: string) => {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'short'
      })
      const parts = formatter.formatToParts(new Date())
      const tzName = parts.find(p => p.type === 'timeZoneName')?.value || tz
      return tzName
    } catch {
      return tz
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100" style={brandingStyles}>
      {/* Header with festival branding */}
      <header className="shadow-sm border-b" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {festival.logo && (
                <img src={festival.logo} alt={festival.name} className="h-12 w-auto rounded-lg" />
              )}
              <div className="text-white">
                <h1 className="text-2xl font-bold">My Schedule</h1>
                <p className="text-white/80 mt-1">
                  {festival.name} • {totalSessions === 0
                    ? 'No sessions saved'
                    : `${totalSessions} session${totalSessions !== 1 ? 's' : ''} saved`}
                </p>
                {festival.timezone && festival.timezone !== 'UTC' && (
                  <p className="text-white/60 text-sm mt-0.5">
                    All times in {formatTimezone(festival.timezone)}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {totalSessions > 0 && (
                <button
                  onClick={handleExportAll}
                  className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors font-medium backdrop-blur-sm"
                  title="Download all sessions as a calendar file (.ics)"
                >
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="hidden sm:inline">Export All</span>
                  <span className="sm:hidden">Export</span>
                </button>
              )}
              <Link
                href={`/${slug}/schedule`}
                className="inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Back to Schedule</span>
                <span className="sm:hidden">Back</span>
              </Link>
            </div>
          </div>
          
          {/* Helpful explainer text */}
          {totalSessions > 0 && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-white/70 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.5 3h-3V1.5h-1.5V3h-6V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8.25h15v11.25z" />
                  </svg>
                  Add to Google Calendar
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download for any calendar app
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove from schedule
                </span>
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {totalSessions === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${primaryColor}20` }}>
              <svg className="w-10 h-10" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No saved sessions yet</h2>
            <p className="text-gray-600 mb-6">
              Browse the {festival.name} schedule and tap the star icon on sessions you want to attend.
              They'll appear here for easy access and calendar export.
            </p>
            <Link
              href={`/${slug}/schedule`}
              className="inline-flex items-center gap-2 px-6 py-3 text-white rounded-lg transition-colors font-medium"
              style={{ backgroundColor: primaryColor }}
            >
              Browse Schedule
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedDays.map(day => (
              <div key={day} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Day Header */}
                <div
                  className="w-full flex items-center justify-between p-4 text-white"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
                >
                  <button 
                    onClick={() => toggleDay(day)}
                    className="flex items-center gap-3 hover:opacity-90 transition-opacity text-left"
                  >
                    <svg className="w-7 h-7 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <h2 className="text-lg font-semibold">{formatDayHeader(day)}</h2>
                      <p className="text-white/80 text-sm">
                        {sessionsByDay[day].length} session{sessionsByDay[day].length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <svg
                      className={`w-5 h-5 transition-transform ml-2 ${expandedDays.has(day) ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => handleExportDay(day)}
                    className="px-3 py-1.5 bg-white/20 rounded-lg text-sm font-medium hover:bg-white/30 transition-colors"
                  >
                    Export Day
                  </button>
                </div>
                
                {/* Sessions List */}
                {expandedDays.has(day) && (
                  <div className="divide-y divide-gray-100">
                    {sessionsByDay[day].map(fav => (
                      <div key={fav.id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Time */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTime(fav.session.startTime)} - {formatTime(fav.session.endTime)}
                            </div>
                            
                            {/* Title */}
                            <h3 className="font-semibold text-gray-900 mb-1">{fav.session.title}</h3>
                            
                            {/* Location & Teachers */}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                              {fav.session.location && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  {fav.session.location}
                                </span>
                              )}
                              {fav.session.teachers && fav.session.teachers.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  {fav.session.teachers.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {/* Google Calendar */}
                            <button
                              onClick={() => handleGoogleCalendar(fav.session)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Add to Google Calendar"
                            >
                              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.5 3h-3V1.5h-1.5V3h-6V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8.25h15v11.25z" />
                              </svg>
                            </button>
                            
                            {/* Download ICS */}
                            <button
                              onClick={() => handleExportSession(fav.session.id)}
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Download for any calendar app"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                            </button>
                            
                            {/* Remove */}
                            <button
                              onClick={() => handleRemove(fav.session.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Remove from My Schedule"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            Your schedule is saved locally on this device.
          </p>
        </div>
      </footer>
    </div>
  )
}
