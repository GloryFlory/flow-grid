'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight, LayoutGrid, Grid3x3, Star } from 'lucide-react'
import Link from 'next/link'
import { SessionModal } from './SessionModal'
import { FilterBar } from './FilterBar'
import { useFavourites } from '@/hooks/useFavourites'

interface Session {
  id: string
  title: string
  description: string
  day: string
  start: string  // HH:mm format
  end: string    // HH:mm format
  startTime: string  // Full datetime string
  endTime: string    // Full datetime string
  location: string
  level: string
  styles: string[]
  teachers: string[]
  prereqs: string
  capacity: number
  currentBookings: number
  cardType: string
  displayOrder?: number
}

interface Festival {
  id: string
  name: string
  description?: string
  slug: string
  location?: string
  logo?: string
  startDate: Date
  endDate: Date
  timezone: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  headerFont?: string | null
}

interface ScheduleGridViewProps {
  festival: Festival
  sessions: Session[]
}

// Helper to parse time string "HH:mm" to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

// Helper to format minutes back to time
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

// Helper to format day header
const formatDayHeader = (dateStr: string): string => {
  try {
    const date = new Date(dateStr + 'T12:00:00Z')
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' })
    const day = date.getUTCDate()
    const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
    return `${dayName}\n${month} ${day}`
  } catch (e) {
    return dateStr
  }
}

// Get level-based color - match SessionCard colors exactly
const getSessionColor = (session: Session, festival?: { primaryColor?: string }): string => {
  // If level is set, use level-based colors
  if (session.level) {
    switch (session.level) {
      case 'Beginner':
        return '#22C55E' // green
      case 'Beginner+':
        return '#84CC16' // lime
      case 'Intermediate':
        return '#EAB308' // yellow
      case 'Intermediate+':
        return '#F97316' // orange
      case 'Advanced':
        return '#8B5CF6' // purple
      case 'All Levels':
      case 'Open Level':
        return '#3B82F6' // blue
    }
  }
  
  // Fallback: use festival's primary color or Flow Grid default
  return festival?.primaryColor || '#6366F1' // Flow Grid indigo
}

// Helper to create a subtle background color from the festival's primary color
const getSubtleBackground = (primaryColor?: string): string => {
  if (!primaryColor) return '#ffffff'
  
  // Extract RGB values from hex color
  const hex = primaryColor.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  
  // Return with very low opacity (5%)
  return `rgba(${r}, ${g}, ${b}, 0.05)`
}

export default function ScheduleGridView({ festival, sessions }: ScheduleGridViewProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'day' | '3day' | 'week'>('week')
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)

  // Filter state
  const [levelFilter, setLevelFilter] = useState('')
  const [styleFilter, setStyleFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')

  // Favourites hook for "My Schedule" feature
  const { favourites, isFavourite, toggleFavourite } = useFavourites({ festivalId: festival.id })
  
  // Show favourites only filter
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false)

  // Load custom header font (Google Fonts or custom uploaded)
  useEffect(() => {
    if (!festival.headerFont) return
    
    // Handle custom uploaded fonts (format: "custom:FontName|url")
    if (festival.headerFont.startsWith('custom:')) {
      const rest = festival.headerFont.replace('custom:', '')
      
      // New format with URL: "FontName|https://..."
      if (rest.includes('|')) {
        const [fontName, fontUrl] = rest.split('|')
        if (fontUrl) {
          const font = new FontFace(fontName, `url(${fontUrl})`)
          font.load().then(() => {
            document.fonts.add(font)
          }).catch(err => {
            console.error('Failed to load custom font:', err)
          })
        }
      }
      return
    }
    
    // Handle Google Fonts
    const linkId = `google-font-${festival.headerFont.replace(/\s+/g, '-').toLowerCase()}`
    if (document.getElementById(linkId)) return
    
    // Load the Google Font
    const link = document.createElement('link')
    link.id = linkId
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(festival.headerFont)}:wght@400;500;600;700&display=swap`
    document.head.appendChild(link)
    
    return () => {
      // Cleanup on unmount (optional - fonts usually stay loaded)
    }
  }, [festival.headerFont])

  // Handle favourite toggle
  const handleFavouriteToggle = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()  // Prevent session modal from opening
    toggleFavourite(sessionId, festival.id)
  }

  // Calculate available filter options from all sessions
  const { availableLevels, availableStyles, availableTeachers } = useMemo(() => {
    const levelsMap = new Map<string, string>() // lowercase -> original case
    const styles = new Set<string>()
    const teachers = new Set<string>()

    sessions.forEach(session => {
      if (session.level) {
        const lowerLevel = session.level.toLowerCase()
        // Keep the first casing we see (or prefer title case)
        if (!levelsMap.has(lowerLevel)) {
          levelsMap.set(lowerLevel, session.level)
        }
      }
      session.styles?.forEach(s => styles.add(s))
      session.teachers?.forEach(t => teachers.add(t))
    })

    return {
      availableLevels: Array.from(levelsMap.values()).sort(),
      availableStyles: Array.from(styles).sort(),
      availableTeachers: Array.from(teachers).sort()
    }
  }, [sessions])

  // Filter sessions based on current filter state
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      // Apply favourites filter first
      if (showFavouritesOnly && !favourites.has(session.id)) return false
      
      if (levelFilter) {
        const sessionLevel = session.level?.toLowerCase() || ''
        const filterLevel = levelFilter.toLowerCase()
        const isSessionAllLevels = sessionLevel === 'all levels' || sessionLevel === 'open level'
        
        // "All Levels" / "Open Level" sessions appear for any level filter
        // (since they accept all skill levels)
        if (!isSessionAllLevels && sessionLevel !== filterLevel) return false
      }
      if (styleFilter && !session.styles?.includes(styleFilter)) return false
      if (teacherFilter && !session.teachers?.includes(teacherFilter)) return false
      if (searchFilter) {
        const searchLower = searchFilter.toLowerCase()
        const matchesTitle = session.title.toLowerCase().includes(searchLower)
        const matchesDescription = session.description?.toLowerCase().includes(searchLower)
        const matchesTeacher = session.teachers?.some(t => t.toLowerCase().includes(searchLower))
        const matchesStyle = session.styles?.some(s => s.toLowerCase().includes(searchLower))
        if (!matchesTitle && !matchesDescription && !matchesTeacher && !matchesStyle) return false
      }
      return true
    })
  }, [sessions, levelFilter, styleFilter, teacherFilter, searchFilter, showFavouritesOnly, favourites])

  // Get current time in minutes for the time indicator
  const getCurrentTimeInMinutes = (): number => {
    const now = new Date()
    return now.getHours() * 60 + now.getMinutes()
  }

  // Get today's date
  const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0]
  }

  // Generate list of ALL festival days
  const allFestivalDays = useMemo(() => {
    const days: string[] = []
    const startDateStr = typeof festival.startDate === 'string' 
      ? festival.startDate 
      : festival.startDate.toISOString().split('T')[0]
    const endDateStr = typeof festival.endDate === 'string' 
      ? festival.endDate 
      : festival.endDate.toISOString().split('T')[0]
    
    const startDate = new Date(startDateStr + 'T00:00:00Z')
    const endDate = new Date(endDateStr + 'T00:00:00Z')
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      days.push(currentDate.toISOString().split('T')[0])
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    
    return days
  }, [festival.startDate, festival.endDate])

  // Split into weeks (max 7 days per week)
  const weeks = useMemo(() => {
    const weekChunks: string[][] = []
    for (let i = 0; i < allFestivalDays.length; i += 7) {
      weekChunks.push(allFestivalDays.slice(i, i + 7))
    }
    return weekChunks
  }, [allFestivalDays])

  // Current week's days
  const currentWeekDays = weeks[currentWeekIndex] || []
  
  // Festival days to display based on view mode
  const festivalDays = viewMode === 'day' 
    ? [currentWeekDays[selectedDayIndex]]
    : viewMode === '3day'
    ? currentWeekDays.slice(selectedDayIndex, Math.min(selectedDayIndex + 3, currentWeekDays.length))
    : currentWeekDays

  // Calculate time range and slots
  const { earliestTime, latestTime, timeSlots } = useMemo(() => {
    if (sessions.length === 0) {
      return { earliestTime: 540, latestTime: 1260, timeSlots: [] } // 9am to 9pm default
    }

    // Find earliest and latest times across all sessions
    let earliest = Infinity
    let latest = -Infinity

    sessions.forEach(session => {
      const startMinutes = timeToMinutes(session.start)
      const endMinutes = timeToMinutes(session.end)
      earliest = Math.min(earliest, startMinutes)
      latest = Math.max(latest, endMinutes)
    })

    // Round to 30-minute boundaries
    earliest = Math.floor(earliest / 30) * 30
    latest = Math.ceil(latest / 30) * 30

    // Generate 30-minute time slots
    const slots: number[] = []
    for (let time = earliest; time <= latest; time += 30) {
      slots.push(time)
    }

    return { earliestTime: earliest, latestTime: latest, timeSlots: slots }
  }, [sessions])

  // Group filtered sessions by day (for layout calculation)
  const sessionsByDay = useMemo(() => {
    const grouped: Record<string, Session[]> = {}
    filteredSessions.forEach(session => {
      if (!grouped[session.day]) {
        grouped[session.day] = []
      }
      grouped[session.day].push(session)
    })
    return grouped
  }, [filteredSessions])

  // Pre-calculate overlapping sessions for each time slot (performance optimization)
  const overlappingSessionsCache = useMemo(() => {
    const cache: Record<string, Session[]> = {}
    
    festivalDays.forEach(day => {
      const daySessions = sessionsByDay[day] || []
      timeSlots.forEach(timeSlotMinutes => {
        const key = `${day}-${timeSlotMinutes}`
        cache[key] = daySessions.filter(session => {
          const startMinutes = timeToMinutes(session.start)
          const endMinutes = timeToMinutes(session.end)
          return startMinutes < timeSlotMinutes + 30 && endMinutes > timeSlotMinutes
        }).sort((a, b) => {
          const timeCompare = timeToMinutes(a.start) - timeToMinutes(b.start)
          if (timeCompare !== 0) return timeCompare
          return (a.displayOrder || 0) - (b.displayOrder || 0)
        })
      })
    })
    
    return cache
  }, [sessionsByDay, festivalDays, timeSlots])

  // Calculate session positioning
  const getSessionPosition = (session: Session) => {
    const startMinutes = timeToMinutes(session.start)
    const endMinutes = timeToMinutes(session.end)
    const duration = endMinutes - startMinutes
    
    // Calculate row span (each row is 30 minutes)
    const rowSpan = Math.max(1, Math.ceil(duration / 30))
    
    // Calculate starting row
    const startRow = Math.floor((startMinutes - earliestTime) / 30)
    
    return { startRow, rowSpan, startMinutes, endMinutes }
  }

  // Find concurrent sessions at a given time slot and day (using cache for performance)
  const getSessionsAtTimeSlot = (day: string, timeSlotMinutes: number) => {
    const key = `${day}-${timeSlotMinutes}`
    return overlappingSessionsCache[key] || []
  }

  // Generate font-family CSS for custom header font
  const getHeaderFontFamily = (font: string | null | undefined): string | undefined => {
    if (!font) return undefined
    
    // Handle custom uploaded fonts (format: "custom:FontName|url")
    if (font.startsWith('custom:')) {
      const rest = font.replace('custom:', '')
      const fontName = rest.includes('|') ? rest.split('|')[0] : rest
      return `"${fontName}", serif`
    }
    
    // Handle Google Fonts - use the font name directly
    return `"${font}", serif`
  }

  const headerFontFamily = getHeaderFontFamily(festival.headerFont)

  // Apply custom branding
  const brandingStyles = {
    '--primary-color': festival.primaryColor || '#4a90e2',
    '--secondary-color': festival.secondaryColor || '#7b68ee',
    '--accent-color': festival.accentColor || '#ff6b6b',
  } as React.CSSProperties

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 mac-schedule" style={brandingStyles}>
      {/* Header */}
      <header className="header shadow-sm sticky top-0 z-50">
        <div className="header-content">
          <div className="logo-section">
            {festival.logo && (
              <img src={festival.logo} alt={festival.name} className="festival-logo" />
            )}
            <div className="title-section">
              <h1 style={headerFontFamily ? { fontFamily: headerFontFamily } : undefined}>{festival.name}</h1>
            </div>
          </div>
          <div className="header-info">
            {/* Row 1: Date */}
            <p className="header-date">
              {new Date(festival.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              {' - '}
              {new Date(festival.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
            
            {/* Row 2: View toggles */}
            <div className="header-view-row">
              <Link
                href={`/${festival.slug}/schedule`}
                className="view-toggle-btn"
                aria-label="Card view"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Cards</span>
              </Link>
              <Link
                href={`/${festival.slug}/schedule/grid`}
                className="view-toggle-btn active"
                aria-label="Grid view"
              >
                <Grid3x3 className="w-4 h-4" />
                <span>Grid</span>
              </Link>
              <Link
                href={`/${festival.slug}/my-schedule`}
                className="view-toggle-btn"
                aria-label="My schedule"
              >
                <Star className="w-4 h-4" />
                <span>My Schedule</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* View Mode Toggle & Navigation */}
      <div className="bg-white border-b border-gray-200 px-2 md:px-4 py-2 md:py-3">
        <div className="max-w-7xl mx-auto">
          {/* View Mode Toggle */}
          <div className="flex items-center justify-center gap-2 mb-2 md:mb-3">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setViewMode('3day')}
              className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                viewMode === '3day'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              3 Day
            </button>
            <button
              onClick={() => {
                setViewMode('week')
                setSelectedDayIndex(0)
              }}
              className={`px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'week'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Week
            </button>
          </div>

          {/* Day/3-Day Navigation (shown in day and 3-day views) */}
          {(viewMode === 'day' || viewMode === '3day') && (
            <div className="flex items-center justify-center gap-2 md:gap-4">
              <button
                onClick={() => {
                  const step = viewMode === '3day' ? 3 : 1
                  if (selectedDayIndex >= step) {
                    setSelectedDayIndex(selectedDayIndex - step)
                  } else if (currentWeekIndex > 0) {
                    setCurrentWeekIndex(currentWeekIndex - 1)
                    const prevWeekLength = weeks[currentWeekIndex - 1].length
                    setSelectedDayIndex(Math.max(0, prevWeekLength - step))
                  }
                }}
                disabled={currentWeekIndex === 0 && selectedDayIndex === 0}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <button
                onClick={() => {
                  const today = new Date().toISOString().split('T')[0]
                  const todayIndex = allFestivalDays.indexOf(today)
                  
                  if (todayIndex >= 0) {
                    // Find which week contains today
                    const weekIndex = Math.floor(todayIndex / 7)
                    const dayIndexInWeek = todayIndex % 7
                    
                    setCurrentWeekIndex(weekIndex)
                    setSelectedDayIndex(dayIndexInWeek)
                  }
                }}
                className="px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              >
                Today
              </button>

              <button
                onClick={() => {
                  const step = viewMode === '3day' ? 3 : 1
                  
                  if (viewMode === '3day') {
                    // In 3-day view, advance by 3 or to the last possible position
                    const nextIndex = selectedDayIndex + step
                    if (nextIndex < currentWeekDays.length) {
                      setSelectedDayIndex(nextIndex)
                    } else if (currentWeekIndex < weeks.length - 1) {
                      setCurrentWeekIndex(currentWeekIndex + 1)
                      setSelectedDayIndex(0)
                    }
                  } else {
                    // Day view logic
                    if (selectedDayIndex < currentWeekDays.length - 1) {
                      setSelectedDayIndex(selectedDayIndex + 1)
                    } else if (currentWeekIndex < weeks.length - 1) {
                      setCurrentWeekIndex(currentWeekIndex + 1)
                      setSelectedDayIndex(0)
                    }
                  }
                }}
                disabled={
                  currentWeekIndex === weeks.length - 1 && 
                  selectedDayIndex >= currentWeekDays.length - 1
                }
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          )}

          {/* Week Navigation (shown in week view and multi-week festivals) */}
          {viewMode === 'week' && weeks.length > 1 && (
            <div className="flex items-center justify-between gap-2">
              <button
                onClick={() => setCurrentWeekIndex(Math.max(0, currentWeekIndex - 1))}
                disabled={currentWeekIndex === 0}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="text-center flex-1">
                <p className="text-xs md:text-sm font-semibold text-gray-900">
                  Week {currentWeekIndex + 1} of {weeks.length}
                </p>
                <p className="text-[10px] md:text-xs text-gray-600 mt-0.5">
                  {new Date(currentWeekDays[0] + 'T12:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  {' - '}
                  {new Date(currentWeekDays[currentWeekDays.length - 1] + 'T12:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <button
                onClick={() => setCurrentWeekIndex(Math.min(weeks.length - 1, currentWeekIndex + 1))}
                disabled={currentWeekIndex === weeks.length - 1}
                className="flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <FilterBar
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            styleFilter={styleFilter}
            setStyleFilter={setStyleFilter}
            searchFilter={searchFilter}
            setSearchFilter={setSearchFilter}
            teacherFilter={teacherFilter}
            setTeacherFilter={setTeacherFilter}
            availableLevels={availableLevels}
            availableStyles={availableStyles}
            availableTeachers={availableTeachers}
            showFavouritesOnly={showFavouritesOnly}
            setShowFavouritesOnly={setShowFavouritesOnly}
            favouritesCount={favourites.size}
          />
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto px-2 md:px-4 py-3 md:py-6" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="inline-block min-w-full">
          <div className="relative overflow-hidden">
            <table className="border-collapse bg-white shadow-lg rounded-lg overflow-hidden w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 border border-gray-300 px-1 py-2 md:px-3 md:py-3 text-[10px] md:text-xs font-semibold bg-gray-50 text-gray-700"
                    style={{ 
                      width: '50px'
                    }}>
                    Time
                  </th>
                  {festivalDays.map(day => {
                    const today = getTodayDate()
                    const isToday = day === today
                    const date = new Date(day + 'T12:00:00Z')
                    const dayName = date.toLocaleDateString('en-GB', { weekday: 'short' }).toUpperCase()
                    const dayNumber = date.getDate()
                    
                    return (
                      <th 
                        key={day} 
                        className="border border-gray-300 px-1 py-2 md:px-3 md:py-3 bg-gray-50"
                        style={{ 
                          width: `calc((100% - 50px) / ${festivalDays.length})`,
                          minWidth: festivalDays.length <= 4 ? '80px' : '60px'
                        }}
                      >
                        <div className="flex flex-col items-center gap-0.5 md:gap-1">
                          <div 
                            className="text-[10px] md:text-xs font-medium text-gray-600"
                            style={{ 
                              fontWeight: isToday ? 'bold' : 'normal',
                              ...(headerFontFamily ? { fontFamily: headerFontFamily } : {})
                            }}
                          >
                            {dayName}
                          </div>
                          <div 
                            className="flex items-center justify-center text-lg md:text-2xl font-semibold"
                            style={{
                              width: isToday ? (window.innerWidth < 768 ? '32px' : '40px') : 'auto',
                              height: isToday ? (window.innerWidth < 768 ? '32px' : '40px') : 'auto',
                              borderRadius: isToday ? '50%' : '0',
                              background: isToday 
                                ? `linear-gradient(135deg, ${festival.primaryColor || '#4a90e2'} 0%, ${festival.secondaryColor || '#7b68ee'} 100%)` 
                                : 'transparent',
                              color: isToday ? 'white' : '#1f2937'
                            }}
                          >
                            {dayNumber}
                          </div>
                        </div>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Helper function to find transitive overlap groups
                  const findOverlapGroups = (sessions: Session[]): Session[][] => {
                    if (sessions.length === 0) return []
                    
                    const sorted = [...sessions].sort((a, b) => {
                      const timeCompare = timeToMinutes(a.start) - timeToMinutes(b.start)
                      if (timeCompare !== 0) return timeCompare
                      // Use displayOrder for parallel sessions, then title as final tie-breaker
                      const orderA = a.displayOrder || 0
                      const orderB = b.displayOrder || 0
                      if (orderA !== orderB) return orderA - orderB
                      return a.title.localeCompare(b.title)
                    })
                    
                    const groups: Session[][] = []
                    let currentGroup: Session[] = [sorted[0]]
                    let groupEnd = timeToMinutes(sorted[0].end)
                    
                    for (let i = 1; i < sorted.length; i++) {
                      const session = sorted[i]
                      const sessionStart = timeToMinutes(session.start)
                      
                      if (sessionStart < groupEnd) {
                        // Overlaps with current group
                        currentGroup.push(session)
                        groupEnd = Math.max(groupEnd, timeToMinutes(session.end))
                      } else {
                        // No overlap - start new group
                        groups.push(currentGroup)
                        currentGroup = [session]
                        groupEnd = timeToMinutes(session.end)
                      }
                    }
                    
                    if (currentGroup.length > 0) {
                      groups.push(currentGroup)
                    }
                    
                    return groups
                  }
                  
                  // Pre-calculate layout for each session
                  const sessionLayouts = new Map<string, { 
                    columnIndex: number
                    totalColumns: number 
                    columnSpan: number
                  }>()
                  
                  festivalDays.forEach(day => {
                    const daySessions = sessionsByDay[day] || []
                    const groups = findOverlapGroups(daySessions)
                    
                    groups.forEach(group => {
                      if (group.length === 1) {
                        sessionLayouts.set(group[0].id, {
                          columnIndex: 0,
                          totalColumns: 1,
                          columnSpan: 1
                        })
                      } else {
                        // Assign columns within this group using greedy packing
                        const columns: Session[][] = []
                        
                        const sortedGroup = [...group].sort((a, b) => {
                          const timeCompare = timeToMinutes(a.start) - timeToMinutes(b.start)
                          if (timeCompare !== 0) return timeCompare
                          // Use displayOrder for parallel sessions, then title as final tie-breaker
                          const orderA = a.displayOrder || 0
                          const orderB = b.displayOrder || 0
                          if (orderA !== orderB) return orderA - orderB
                          return a.title.localeCompare(b.title)
                        })
                        
                        sortedGroup.forEach(session => {
                          const sStart = timeToMinutes(session.start)
                          const sEnd = timeToMinutes(session.end)
                          
                          let placed = false
                          for (let colIndex = 0; colIndex < columns.length; colIndex++) {
                            const hasConflict = columns[colIndex].some(existing => {
                              const eStart = timeToMinutes(existing.start)
                              const eEnd = timeToMinutes(existing.end)
                              return sStart < eEnd && sEnd > eStart
                            })
                            
                            if (!hasConflict) {
                              columns[colIndex].push(session)
                              placed = true
                              break
                            }
                          }
                          
                          if (!placed) {
                            columns.push([session])
                          }
                        })
                        
                        const totalCols = columns.length
                        
                        columns.forEach((column, colIndex) => {
                          column.forEach(session => {
                            const sessionEnd = timeToMinutes(session.end)
                            const sessionStart = timeToMinutes(session.start)
                            
                            // Calculate span (greedy expansion to the right)
                            let span = 1
                            for (let nextCol = colIndex + 1; nextCol < totalCols; nextCol++) {
                              const hasConflict = columns[nextCol].some(s => {
                                const sStart = timeToMinutes(s.start)
                                const sEnd = timeToMinutes(s.end)
                                return sStart < sessionEnd && sEnd > sessionStart
                              })
                              
                              if (hasConflict) break
                              span++
                            }
                            
                            sessionLayouts.set(session.id, {
                              columnIndex: colIndex,
                              totalColumns: totalCols,
                              columnSpan: span
                            })
                          })
                        })
                      }
                    })
                  })
                  
                  // Now render the time slots
                  return timeSlots.map((timeSlotMinutes) => (
                  <tr key={timeSlotMinutes} style={{ height: '40px' }}>
                    <td className="sticky left-0 z-10 bg-gray-50 border border-gray-300 px-1 md:px-3 py-1 text-[10px] md:text-xs font-medium text-gray-600 align-top">
                      {minutesToTime(timeSlotMinutes)}
                    </td>
                    {festivalDays.map((day, dayIndex) => (
                      <td 
                        key={`${day}-${timeSlotMinutes}`}
                        className="border border-gray-300 relative"
                        style={{ height: '40px', padding: 0 }}
                      >
                        {/* Render sessions that start in this time slot */}
                        <div className="absolute left-0 right-0 top-0" style={{ padding: '2px' }}>
                          {(() => {
                            // Get sessions that start in this time slot (or within this 30-minute window)
                            const sessionsStartingHere = getSessionsAtTimeSlot(day, timeSlotMinutes)
                              .filter(s => {
                                const sessionStartMinutes = timeToMinutes(s.start)
                                // Include sessions that start within this 30-minute slot
                                return sessionStartMinutes >= timeSlotMinutes && sessionStartMinutes < timeSlotMinutes + 30
                              })
                            
                            if (sessionsStartingHere.length === 0) return null
                            
                            return sessionsStartingHere.map((session) => {
                              const sessionStart = timeToMinutes(session.start)
                              const sessionEnd = timeToMinutes(session.end)
                              
                              const durationMinutes = sessionEnd - sessionStart
                              const calculatedHeight = (durationMinutes / 30) * 40 - 4
                              const heightInPixels = Math.max(28, calculatedHeight)
                              const levelColor = getSessionColor(session, festival)
                              
                              // Get pre-calculated layout from overlap group analysis
                              const layout = sessionLayouts.get(session.id) || { 
                                columnIndex: 0, 
                                totalColumns: 1, 
                                columnSpan: 1 
                              }
                              
                              const { columnIndex, totalColumns, columnSpan } = layout
                              
                              // Calculate positioning
                              let width = '100%'
                              let leftOffset = '0'
                              let topOffset = '1px'
                              let zIndex = 10 + columnIndex
                              
                              if (totalColumns === 1) {
                                width = 'calc(100% - 2px)'
                                leftOffset = '1px'
                              } else {
                                const columnWidthPercent = 100 / totalColumns
                                const totalWidthPercent = columnWidthPercent * columnSpan
                                const leftOffsetPercent = columnWidthPercent * columnIndex
                                
                                width = `calc(${totalWidthPercent}% - 2px)`
                                leftOffset = `${leftOffsetPercent}%`
                              }
                              
                              return (
                                <div
                                  key={session.id}
                                  onClick={() => setSelectedSession(session)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => e.key === 'Enter' && setSelectedSession(session)}
                                  className="absolute text-left rounded-lg px-1.5 md:px-2 text-xs transition-all duration-200 hover:shadow-2xl hover:z-50 hover:scale-[1.03] cursor-pointer flex flex-col group"
                                  style={{
                                    backgroundColor: '#ffffff',
                                    borderLeft: `5px solid ${levelColor}`,
                                    color: '#1f2937',
                                    height: `${heightInPixels}px`,
                                    width: width,
                                    left: leftOffset,
                                    top: topOffset,
                                    zIndex: zIndex,
                                    boxShadow: `
                                      0 1px 3px rgba(0,0,0,0.08),
                                      0 2px 8px rgba(0,0,0,0.06),
                                      inset 0 0 0 1px rgba(255,255,255,0.5)
                                    `,
                                    border: `1px solid rgba(0,0,0,0.08)`,
                                    borderLeftWidth: '5px',
                                    borderLeftColor: levelColor,
                                    borderLeftStyle: 'solid',
                                    overflow: 'hidden',
                                    paddingTop: '6px',
                                    paddingBottom: '6px',
                                  }}
                                >
                                  {/* Always show: Title, Time, Location, Facilitator at top */}
                                  <div className="space-y-0.5 flex-shrink-0">
                                    <div className="flex items-start justify-between gap-1">
                                      <div className="font-bold line-clamp-1 text-[11px] text-gray-900 group-hover:text-gray-950 flex-1">
                                        {session.title}
                                      </div>
                                      {/* Favourite star */}
                                      <button
                                        onClick={(e) => handleFavouriteToggle(session.id, e)}
                                        className={`flex-shrink-0 w-4 h-4 flex items-center justify-center rounded-full hover:bg-amber-100 transition-colors ${isFavourite(session.id) ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}
                                        title={isFavourite(session.id) ? 'Remove from My Schedule' : 'Add to My Schedule'}
                                      >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill={isFavourite(session.id) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                      </button>
                                    </div>
                                    <div className="text-[9px] text-gray-500 font-semibold flex items-center gap-1">
                                      <span className="inline-block w-1 h-1 rounded-full bg-gray-400"></span>
                                      {session.start} - {session.end}
                                    </div>
                                    {session.location && (
                                      <div className="text-[9px] text-gray-500 line-clamp-1 flex items-center gap-1">
                                        <span className="inline-block w-1 h-1 rounded-full" style={{ backgroundColor: levelColor }}></span>
                                        {session.location}
                                      </div>
                                    )}
                                    {session.teachers.length > 0 && (
                                      <div className="text-[9px] text-gray-600 line-clamp-1 italic">
                                        {session.teachers.join(', ')}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )
                            }).filter(Boolean)
                          })()}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
                })()}
              </tbody>
            </table>

            {/* Current Time Indicator - Google Calendar style red line */}
            {(() => {
              const today = getTodayDate()
              const currentTimeMinutes = getCurrentTimeInMinutes()
              
              // Only show if current time is within the displayed time range
              if (currentTimeMinutes < earliestTime || currentTimeMinutes > latestTime) {
                return null
              }
              
              // Check if today is in the currently displayed days
              const todayColumnIndex = festivalDays.indexOf(today)
              if (todayColumnIndex === -1) {
                return null
              }
              
              // Calculate vertical position based on current time
              // Each 30-minute slot is 40px tall
              const minutesSinceEarliest = currentTimeMinutes - earliestTime
              const topPosition = (minutesSinceEarliest / 30) * 40
              
              // Calculate horizontal position for today's column
              // Time column is 50px wide, then each day column gets equal space
              const columnWidth = `calc((100% - 50px) / ${festivalDays.length})`
              const leftOffset = `calc(50px + (${columnWidth} * ${todayColumnIndex}))`
              
              return (
                <div
                  className="absolute pointer-events-none z-30"
                  style={{
                    top: `${topPosition}px`,
                    left: leftOffset,
                    width: columnWidth,
                    height: '2px',
                  }}
                >
                  {/* Red line */}
                  <div className="w-full h-full bg-red-500" style={{ boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)' }}></div>
                  
                  {/* Red dot centered on the left column border */}
                  <div
                    className="absolute bg-red-500 rounded-full"
                    style={{
                      width: '8px',
                      height: '8px',
                      top: '-3px',
                      left: '-4px', // Center the 8px dot on the border (half of 8px)
                      boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)',
                    }}
                  ></div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Level Colors:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-l-4" style={{ borderColor: '#22C55E', backgroundColor: '#f0fdf4' }}></div>
              <span>Beginner</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-l-4" style={{ borderColor: '#84CC16', backgroundColor: '#f7fee7' }}></div>
              <span>Beginner+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-l-4" style={{ borderColor: '#EAB308', backgroundColor: '#fefce8' }}></div>
              <span>Intermediate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-l-4" style={{ borderColor: '#F97316', backgroundColor: '#fff7ed' }}></div>
              <span>Intermediate+</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-l-4" style={{ borderColor: '#8B5CF6', backgroundColor: '#faf5ff' }}></div>
              <span>Advanced</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-l-4" style={{ borderColor: '#3B82F6', backgroundColor: '#eff6ff' }}></div>
              <span>All Levels</span>
            </div>
          </div>
        </div>
      </div>

      {/* Session Modal */}
      <SessionModal 
        session={selectedSession} 
        onClose={() => setSelectedSession(null)}
        festivalSlug={festival.slug}
        isFavourite={selectedSession ? isFavourite(selectedSession.id) : false}
        onFavouriteToggle={(sessionId) => toggleFavourite(sessionId, festival.id)}
        primaryColor={festival.primaryColor}
        accentColor={festival.accentColor}
      />
    </div>
  )
}