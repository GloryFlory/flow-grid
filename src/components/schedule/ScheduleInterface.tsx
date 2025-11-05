'use client'
import React, { useState, useMemo, useEffect } from 'react'
import { Share2, Link as LinkIcon, Facebook, Twitter, Check } from 'lucide-react'
import { SessionCard } from './SessionCard'
import { FilterBar } from './FilterBar'
import { ScheduleTabs } from './ScheduleTabs'
import { SessionModal } from './SessionModal'

interface Session {
  id: string
  title: string
  description: string
  day: string
  start: string
  end: string
  location: string
  level: string
  styles: string[]
  teachers: string[]
  prereqs: string
  capacity: number
  currentBookings: number
  cardType: string
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

interface ScheduleInterfaceProps {
  festival: Festival
  sessions: Session[]
}

// Helper function to group sessions by day
const groupByDay = (sessions: Session[]) => {
  return sessions.reduce((groups, session) => {
    const day = session.day
    if (!groups[day]) {
      groups[day] = []
    }
    groups[day].push(session)
    return groups
  }, {} as Record<string, Session[]>)
}

// Helper function to format date range in European format (DD/MM/YYYY)
const formatDateRange = (startDate: Date, endDate: Date) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  const start = formatDate(startDate)
  const end = formatDate(endDate)
  
  if (start === end) {
    return start
  }
  
  return `${start} - ${end}`
}

export default function ScheduleInterface({ festival, sessions }: ScheduleInterfaceProps) {
  // State for filters and UI
  const [levelFilter, setLevelFilter] = useState('')
  const [styleFilter, setStyleFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [teacherFilter, setTeacherFilter] = useState('')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [activeDay, setActiveDay] = useState('All Days')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // Track schedule view on mount
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch('/api/track/view', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            festivalId: festival.id
          })
        })
      } catch (error) {
        console.error('Failed to track view:', error)
      }
    }

    trackView()
  }, [festival.id])

  // Handle session click with tracking
  const handleSessionClick = async (session: Session) => {
    setSelectedSession(session)
    
    // Track the session click
    try {
      await fetch('/api/track/session-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          festivalId: festival.id,
          sessionId: session.id,
          sessionTitle: session.title
        })
      })
    } catch (error) {
      console.error('Failed to track session click:', error)
    }
  }

  // Share functionality
  const scheduleUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : `https://tryflowgrid.com/${festival.slug}/schedule`

  const handleShare = async (method: string) => {
    // Track the share event
    try {
      await fetch('/api/track/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          festivalId: festival.id,
          method
        })
      })
    } catch (error) {
      console.error('Failed to track share:', error)
    }

    // Perform the share action
    if (method === 'copy') {
      try {
        await navigator.clipboard.writeText(scheduleUrl)
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      } catch (error) {
        console.error('Failed to copy link:', error)
      }
    } else if (method === 'native') {
      if (navigator.share) {
        try {
          await navigator.share({
            title: festival.name,
            text: festival.description || `Check out the schedule for ${festival.name}!`,
            url: scheduleUrl
          })
        } catch (error) {
          // User cancelled or error occurred
          console.log('Share cancelled or failed:', error)
        }
      }
    } else if (method === 'facebook') {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(scheduleUrl)}`,
        '_blank',
        'width=600,height=400'
      )
    } else if (method === 'twitter') {
      const text = `Check out the schedule for ${festival.name}!`
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(scheduleUrl)}`,
        '_blank',
        'width=600,height=400'
      )
    }

    setShowShareMenu(false)
  }

  // Generate day order based on festival dates
  const festivalDayOrder = useMemo(() => {
    const days: string[] = []
    
    // Handle both string and Date inputs, parse as UTC to avoid timezone shifts
    const startDateStr = typeof festival.startDate === 'string' 
      ? festival.startDate 
      : festival.startDate.toISOString().split('T')[0]
    const endDateStr = typeof festival.endDate === 'string' 
      ? festival.endDate 
      : festival.endDate.toISOString().split('T')[0]
    
    const startDate = new Date(startDateStr + 'T00:00:00Z')
    const endDate = new Date(endDateStr + 'T00:00:00Z')
    
    console.log('Festival dates for day order:', {
      startDateInput: festival.startDate,
      endDateInput: festival.endDate,
      startDateStr,
      endDateStr,
      startDateParsed: startDate.toISOString(),
      endDateParsed: endDate.toISOString()
    })
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
      days.push(dayName)
      console.log('Adding day to order:', dayName, 'from date:', currentDate.toISOString())
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    
    console.log('Final festival day order:', days)
    return days
  }, [festival.startDate, festival.endDate])

  // Group sessions by day
  const sessionsByDay = useMemo(() => groupByDay(sessions), [sessions])
  
  // Get available filter options
  const availableDays = useMemo(() => {
    const foundDays = Object.keys(sessionsByDay).filter(day => day && day !== 'TBD')
    console.log('Found days in sessions:', foundDays)
    console.log('Festival day order for sorting:', festivalDayOrder)
    
    const sortedDays = foundDays.sort((a, b) => {
      const indexA = festivalDayOrder.indexOf(a)
      const indexB = festivalDayOrder.indexOf(b)
      console.log(`Comparing ${a} (index ${indexA}) vs ${b} (index ${indexB})`)
      return indexA - indexB
    })
    
    console.log('Sorted days:', sortedDays)
    return ['All Days', ...sortedDays]
  }, [sessionsByDay, festivalDayOrder])

  const availableLevels = useMemo(() => 
    [...new Set(sessions.map(session => session.level))]
      .filter(level => level && level !== "All Levels" && level.trim() !== "")
      .sort(), [sessions]
  )
  
  const availableStyles = useMemo(() => 
    [...new Set(sessions.flatMap(session => session.styles))].sort(), [sessions]
  )
  
  const availableTeachers = useMemo(() => 
    [...new Set(sessions.flatMap(session => session.teachers))].filter(teacher => teacher).sort(), [sessions]
  )

  // Filter sessions based on current filters
  const filteredSessions = useMemo(() => {
    let sessionsToFilter = activeDay === 'All Days' ? sessions : (sessionsByDay[activeDay] || [])
    
    if (levelFilter) {
      sessionsToFilter = sessionsToFilter.filter(session => session.level === levelFilter)
    }
    
    if (styleFilter) {
      sessionsToFilter = sessionsToFilter.filter(session => session.styles.includes(styleFilter))
    }
    
    if (teacherFilter) {
      sessionsToFilter = sessionsToFilter.filter(session => session.teachers.includes(teacherFilter))
    }
    
    if (searchFilter) {
      const searchLower = searchFilter.toLowerCase()
      sessionsToFilter = sessionsToFilter.filter(session =>
        session.title.toLowerCase().includes(searchLower) ||
        session.description.toLowerCase().includes(searchLower) ||
        session.teachers.some(teacher => teacher.toLowerCase().includes(searchLower)) ||
        session.styles.some(style => style.toLowerCase().includes(searchLower))
      )
    }

    return sessionsToFilter.sort((a, b) => {
      // Always sort by festival day order first (even for single day view to be consistent)
      const dayComparison = festivalDayOrder.indexOf(a.day) - festivalDayOrder.indexOf(b.day)
      console.log(`Comparing ${a.day} vs ${b.day}: ${festivalDayOrder.indexOf(a.day)} vs ${festivalDayOrder.indexOf(b.day)} = ${dayComparison}`)
      
      if (dayComparison !== 0) {
        return dayComparison
      }
      
      // Same day, sort by start time
      return a.start.localeCompare(b.start)
    })
  }, [sessions, sessionsByDay, activeDay, levelFilter, styleFilter, teacherFilter, searchFilter, festivalDayOrder])

  // Apply custom branding colors via CSS variables
  const brandingStyles = {
    '--primary-color': festival.primaryColor || '#4a90e2',
    '--secondary-color': festival.secondaryColor || '#7b68ee',
    '--accent-color': festival.accentColor || '#ff6b6b',
  } as React.CSSProperties

  console.log('Passing availableDays to ScheduleTabs:', availableDays)

  return (
    <div className="mac-schedule" style={brandingStyles}>
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            {festival.logo && (
              <img src={festival.logo} alt={`${festival.name} logo`} className="festival-logo" />
            )}
            <div className="title-section">
              <h1>{festival.name}</h1>
              {festival.location && <p className="location-subtitle">{festival.location}</p>}
              {festival.description && !festival.location && <p>{festival.description}</p>}
            </div>
          </div>
          <div className="header-info">
            <p>{formatDateRange(festival.startDate, festival.endDate)}</p>
            
            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="share-button"
                aria-label="Share schedule"
              >
                <Share2 className="w-5 h-5" />
                <span className="ml-2 hidden sm:inline">Share</span>
              </button>

              {/* Share Menu Dropdown */}
              {showShareMenu && (
                <div className="share-menu">
                  <div className="share-menu-content">
                    {/* Native Share (mobile) */}
                    {typeof window !== 'undefined' && 'share' in navigator && (
                      <button
                        onClick={() => handleShare('native')}
                        className="share-option"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Share...</span>
                      </button>
                    )}

                    {/* Copy Link */}
                    <button
                      onClick={() => handleShare('copy')}
                      className="share-option"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Copied!</span>
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={() => handleShare('facebook')}
                      className="share-option"
                    >
                      <Facebook className="w-4 h-4" />
                      <span>Facebook</span>
                    </button>

                    {/* Twitter */}
                    <button
                      onClick={() => handleShare('twitter')}
                      className="share-option"
                    >
                      <Twitter className="w-4 h-4" />
                      <span>Twitter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="main-content-frame">
        {/* Day Tabs */}
        <ScheduleTabs 
          days={availableDays} 
          activeDay={activeDay} 
          setActiveDay={setActiveDay} 
        />

        {/* Filters */}
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
        />

        {/* Session Grid */}
        {activeDay === 'All Days' ? (
          // Show grouped by day when viewing all
          (() => {
            // Use festival-based day order instead of hardcoded week order
            return festivalDayOrder.filter(day => sessionsByDay[day] && sessionsByDay[day].length > 0).map(day => {
              const daySessions = sessionsByDay[day]
              const filteredDaySessions = daySessions.filter(session => {
                if (levelFilter && session.level !== levelFilter) return false
                if (styleFilter && !session.styles.includes(styleFilter)) return false
                if (teacherFilter && !session.teachers.includes(teacherFilter)) return false
                if (searchFilter) {
                  const searchLower = searchFilter.toLowerCase()
                  return session.title.toLowerCase().includes(searchLower) ||
                         session.description.toLowerCase().includes(searchLower) ||
                         session.teachers.some(teacher => teacher.toLowerCase().includes(searchLower)) ||
                         session.styles.some(style => style.toLowerCase().includes(searchLower))
                }
                return true
              }).sort((a, b) => a.start.localeCompare(b.start))

              if (filteredDaySessions.length === 0) return null

              return (
                <div key={day} className="day-section">
                  <h2 className="day-header">{day}</h2>
                  <div className="sessions-grid">
                    {filteredDaySessions.map(session => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        onClick={handleSessionClick}
                        onStyleClick={setStyleFilter}
                        onLevelClick={setLevelFilter}
                        onTeacherClick={setTeacherFilter}
                      />
                    ))}
                  </div>
                </div>
              )
            })
          })()
        ) : (
          // Show individual day sessions  
          <div className="day-content">
            <div className="sessions-grid">
              {filteredSessions
                .sort((a, b) => a.start.localeCompare(b.start))
                .map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onClick={handleSessionClick}
                    onStyleClick={setStyleFilter}
                    onLevelClick={setLevelFilter}
                    onTeacherClick={setTeacherFilter}
                  />
                ))}
            </div>
            
            {filteredSessions.length === 0 && (
              <div className="no-sessions">
                <p>No sessions found for the selected filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Session Modal */}
      <SessionModal 
        session={selectedSession} 
        onClose={() => setSelectedSession(null)}
      />
    </div>
  )
}