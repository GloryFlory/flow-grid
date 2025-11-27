'use client'
import React, { useState, useMemo } from 'react'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { SessionModal } from './SessionModal'

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
const getSessionColor = (session: Session): string => {
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
    default:
      return '#3B82F6' // blue
  }
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

  // Group sessions by day
  const sessionsByDay = useMemo(() => {
    const grouped: Record<string, Session[]> = {}
    sessions.forEach(session => {
      if (!grouped[session.day]) {
        grouped[session.day] = []
      }
      grouped[session.day].push(session)
    })
    return grouped
  }, [sessions])

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
          <div className="flex items-center gap-4">
            <Link 
              href={`/${festival.slug}/schedule`}
              className="flex items-center gap-2 transition-colors hover:opacity-80"
              style={{ color: 'white' }}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Back to Cards</span>
            </Link>
            {festival.logo && (
              <img src={festival.logo} alt={festival.name} className="festival-logo" />
            )}
            <div className="title-section">
              <h1>{festival.name}</h1>
              <p style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.1rem' }}>Full View</p>
            </div>
          </div>
          <div className="header-info">
            <div className="flex items-center gap-2 text-sm" style={{ color: 'white', fontSize: '1.1rem' }}>
              <Calendar className="w-4 h-4" />
              <span className="sm:hidden text-xs">
                {new Date(festival.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                {' - '}
                {new Date(festival.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
              </span>
              <span className="hidden sm:inline">
                {new Date(festival.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })}
                {' - '}
                {new Date(festival.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
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
                    const today = new Date().toISOString().split('T')[0]
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
                            style={{ fontWeight: isToday ? 'bold' : 'normal' }}
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
                {timeSlots.map((timeSlotMinutes) => (
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
                        {/* Render ALL sessions that overlap with this time slot */}
                        <div className="absolute inset-0 p-0.5">
                          {(() => {
                            // Get all sessions that are active during this time slot (started at or before, ending after)
                            const allActiveSessions = getSessionsAtTimeSlot(day, timeSlotMinutes)
                              .sort((a, b) => {
                                // Sort by start time - earliest sessions render first (appear behind)
                                return timeToMinutes(a.start) - timeToMinutes(b.start)
                              })
                            
                            return allActiveSessions.map((session, absoluteIndex) => {
                              const sessionStart = timeToMinutes(session.start)
                              const sessionEnd = timeToMinutes(session.end)
                              
                              // Only render the session card at its actual START time slot
                              if (sessionStart !== timeSlotMinutes) {
                                return null
                              }
                              
                              const durationMinutes = sessionEnd - sessionStart
                              // Calculate height with minimum for readability (at least 28px to show title)
                              const calculatedHeight = (durationMinutes / 30) * 40 - 4
                              const heightInPixels = Math.max(28, calculatedHeight)
                              const levelColor = getSessionColor(session)
                              
                              // Find all sessions ON THIS DAY that overlap with this one at ANY point
                              const allDaySessions = sessionsByDay[day] || []
                              
                              // To find the correct width, we need to find the MAXIMUM number of
                              // concurrent sessions at any single point during this session's duration
                              let maxConcurrent = 1
                              let concurrentAtStart: Session[] = []
                              
                              // Check every 30-minute interval during this session
                              for (let checkTime = sessionStart; checkTime < sessionEnd; checkTime += 30) {
                                const concurrentAtThisTime = allDaySessions.filter(s => {
                                  const sStart = timeToMinutes(s.start)
                                  const sEnd = timeToMinutes(s.end)
                                  // Session is concurrent if it's active at checkTime
                                  return sStart <= checkTime && sEnd > checkTime
                                })
                                
                                if (concurrentAtThisTime.length > maxConcurrent) {
                                  maxConcurrent = concurrentAtThisTime.length
                                  concurrentAtStart = concurrentAtThisTime
                                }
                              }
                              
                              // Use the concurrent sessions at the point of maximum overlap
                              const sortedConcurrent = [...concurrentAtStart].sort((a, b) => {
                                const timeCompare = timeToMinutes(a.start) - timeToMinutes(b.start)
                                if (timeCompare !== 0) return timeCompare
                                return a.id.localeCompare(b.id)
                              })
                              
                              const positionInOverlap = sortedConcurrent.findIndex(s => s.id === session.id)
                              const totalOverlapping = maxConcurrent
                              
                              // Google Calendar-style layout: all overlapping sessions get equal width
                              // and are distributed evenly across the available space
                              let width = '100%'
                              let leftOffset = '0'
                              let topOffset = '2px'
                              let zIndex = 10 + positionInOverlap // Sessions sorted by start time get appropriate z-index
                              
                              if (totalOverlapping === 1) {
                                // Only session at this time - full width
                                width = 'calc(100% - 2px)'
                                leftOffset = '1px'
                              } else {
                                // Multiple overlapping sessions - equal width for all with slight overlap
                                // Calculate so that sessions overlap but last one doesn't exceed 100%
                                const baseWidthPercent = 100 / totalOverlapping
                                const overlap = 2 // 2% overlap between sessions
                                const widthPercent = baseWidthPercent + overlap
                                const offsetPercent = positionInOverlap * (baseWidthPercent - overlap)
                                
                                width = `calc(${widthPercent}% - 2px)`
                                leftOffset = `calc(${offsetPercent}% + 1px)`
                                topOffset = `${2 + (positionInOverlap * 1)}px` // Slight vertical offset for depth
                              }
                              
                              return (
                                <button
                                  key={session.id}
                                  onClick={() => setSelectedSession(session)}
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
                                    <div className="font-bold line-clamp-1 text-[11px] text-gray-900 group-hover:text-gray-950">
                                      {session.title}
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
                                </button>
                              )
                            }).filter(Boolean)
                          })()}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
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
      />
    </div>
  )
}
