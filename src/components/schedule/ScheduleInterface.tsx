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
  start: string  // Just the time portion (HH:mm)
  end: string    // Just the time portion (HH:mm)
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
  whatsappLink?: string
  telegramLink?: string
  facebookLink?: string
  instagramLink?: string
}

interface ScheduleInterfaceProps {
  festival: Festival
  sessions: Session[]
}

// Helper function to group sessions by day
const groupByDay = (sessions: Session[]) => {
  return sessions.reduce((groups, session) => {
    // Extract date from startTime (format: "YYYY-MM-DDTHH:mm:ss")
    const dateKey = session.startTime.split('T')[0] // Get "YYYY-MM-DD"
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(session)
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

// Helper to format day header - shows day name, conditionally includes date
const formatDayHeader = (dateStr: string, showDates: boolean): string => {
  try {
    const date = new Date(dateStr + 'T12:00:00Z')
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
    
    if (showDates) {
      const day = date.getUTCDate()
      const month = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })
      return `${dayName}, ${month} ${day}`  // e.g., "Friday, Nov 14"
    }
    
    return dayName  // e.g., "Friday"
  } catch (e) {
    return dateStr
  }
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

  // Smart day detection: Set active day to today if festival is currently running
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const festivalStart = new Date(festival.startDate).toISOString().split('T')[0]
    const festivalEnd = new Date(festival.endDate).toISOString().split('T')[0]
    
    // Check if today is within festival dates
    if (today >= festivalStart && today <= festivalEnd) {
      // Find the matching day in sessions
      const todayDay = sessions.find(s => s.day === today)
      if (todayDay) {
        setActiveDay(today)
      }
    }
  }, [festival.startDate, festival.endDate, sessions])

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
      // Use ISO date string (YYYY-MM-DD) as the key
      const dateKey = currentDate.toISOString().split('T')[0]
      days.push(dateKey)
      console.log('Adding date to order:', dateKey, 'from date:', currentDate.toISOString())
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    
    console.log('Final festival day order (dates):', days)
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
      
      // If both are in festival range, use festival order
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB
      }
      // If one or both are outside range, sort chronologically
      return a.localeCompare(b)
    })
    
    console.log('Sorted days:', sortedDays)
    return ['All Days', ...sortedDays]
  }, [sessionsByDay, festivalDayOrder])



  const availableLevels = useMemo(() => {
    const levels = [...new Set(sessions.map(session => session.level))]
      .filter(level => level && level !== "All Levels" && level.trim() !== "")
    
    // Custom sort: Beginner, Intermediate, Advanced, then any others alphabetically
    const levelOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 }
    return levels.sort((a, b) => {
      const orderA = levelOrder[a as keyof typeof levelOrder] || 999
      const orderB = levelOrder[b as keyof typeof levelOrder] || 999
      if (orderA !== orderB) return orderA - orderB
      return a.localeCompare(b) // Alphabetical for any custom levels
    })
  }, [sessions])
  
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
      // Sort by date chronologically (handles dates outside festival range)
      const dayA = festivalDayOrder.indexOf(a.day)
      const dayB = festivalDayOrder.indexOf(b.day)
      
      // If both dates are in festival range, use festival order
      if (dayA !== -1 && dayB !== -1) {
        const dayComparison = dayA - dayB
        console.log(`Comparing ${a.day} vs ${b.day}: ${dayA} vs ${dayB} = ${dayComparison}`)
        if (dayComparison !== 0) return dayComparison
      } else {
        // If either date is outside range, sort chronologically by ISO date string
        const dateComparison = a.day.localeCompare(b.day)
        console.log(`Comparing dates outside range: ${a.day} vs ${b.day} = ${dateComparison}`)
        if (dateComparison !== 0) return dateComparison
      }
      
      // Same day, sort by start time
      const timeComparison = a.start.localeCompare(b.start)
      if (timeComparison !== 0) return timeComparison
      
      // Same time, sort by display order
      const displayOrderA = a.displayOrder || 0
      const displayOrderB = b.displayOrder || 0
      const orderComparison = displayOrderA - displayOrderB
      if (orderComparison !== 0) return orderComparison
      
      // Final tie-breaker: title
      return a.title.localeCompare(b.title)
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
            
            <div className="flex items-center gap-3">
              {/* Social Media Icons */}
              {festival.whatsappLink && (
                <a
                  href={festival.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-button"
                  aria-label="WhatsApp Group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </a>
              )}

              {festival.telegramLink && (
                <a
                  href={festival.telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-button"
                  aria-label="Telegram Group"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.122.098.156.231.171.325.016.093.036.306.02.472z"/>
                  </svg>
                </a>
              )}

              {festival.facebookLink && (
                <a
                  href={festival.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-button"
                  aria-label="Facebook Page"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              )}

              {festival.instagramLink && (
                <a
                  href={festival.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon-button"
                  aria-label="Instagram Profile"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              )}

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
        </div>
      </header>

      {/* Main Content Container */}
      <div className="main-content-frame">
        {/* Day Tabs */}
        <ScheduleTabs 
          days={availableDays} 
          activeDay={activeDay} 
          setActiveDay={setActiveDay}
          showDates={true}
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
            return festivalDayOrder.filter(day => sessionsByDay[day] && sessionsByDay[day].length > 0).map((day, dayIndex) => {
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
              }).sort((a, b) => {
                const timeComparison = a.start.localeCompare(b.start)
                if (timeComparison !== 0) return timeComparison
                
                const displayOrderA = a.displayOrder || 0
                const displayOrderB = b.displayOrder || 0
                const orderComparison = displayOrderA - displayOrderB
                if (orderComparison !== 0) return orderComparison
                
                return a.title.localeCompare(b.title)
              })

              if (filteredDaySessions.length === 0) return null

              return (
                <div key={`day-${dayIndex}-${day}`} className="day-section">
                  <h2 className="day-header">{formatDayHeader(day, true)}</h2>
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
                .sort((a, b) => {
                  const timeComparison = a.start.localeCompare(b.start)
                  if (timeComparison !== 0) return timeComparison
                  
                  const displayOrderA = a.displayOrder || 0
                  const displayOrderB = b.displayOrder || 0
                  const orderComparison = displayOrderA - displayOrderB
                  if (orderComparison !== 0) return orderComparison
                  
                  return a.title.localeCompare(b.title)
                })
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
        festivalSlug={festival.slug}
      />
    </div>
  )
}