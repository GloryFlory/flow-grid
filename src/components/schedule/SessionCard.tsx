'use client'
import React from 'react'

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
  teacherPhotos?: (string | null)[]
  prereqs: string
  capacity: number
  currentBookings: number
  cardType: string
  CardType?: string // Handle casing variations from CSV imports
  bookingEnabled?: boolean
  bookingCapacity?: number | null
}

interface SessionCardProps {
  session: Session
  onClick: (session: Session) => void
  onStyleClick: (style: string) => void
  onLevelClick: (level: string) => void
  onTeacherClick: (teacher: string) => void
}

// Helper functions
const timeRange = (start: string, end: string) => {
  // Format as HH:MM (no seconds)
  const format = (t: string) => t.slice(0, 5)
  return `${format(start)} - ${format(end)}`
}

const getDuration = (start: string, end: string) => {
  const startTime = new Date(`2000-01-01 ${start}`)
  const endTime = new Date(`2000-01-01 ${end}`)
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes
}

const getSessionSize = (session: Session) => {
  const duration = getDuration(session.start, session.end)
  if (duration <= 60) return 'small'
  if (duration <= 120) return 'medium'
  return 'large'
}

const getLevelColor = (level: string) => {
  switch (level) {
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

const getTeacherImageSrc = (session: any) => {
  // Use the teacherPhoto from the API if available
  if (session.teacherPhoto) {
    return session.teacherPhoto
  }
  
  // Fallback to placeholder if no photo is available
  return '/teachers/placeholder.jpg'
}

// Enhanced teacher link function (could link to teacher profiles in the future)
const getTeacherLink = (teachers: string[]) => {
  if (!teachers || teachers.length === 0) return '#'
  // Future: could link to `/teachers/${teacher-slug}` pages
  return '#'
}

export function SessionCard({ session, onClick, onStyleClick, onLevelClick, onTeacherClick }: SessionCardProps) {
  const size = getSessionSize(session)
  
  // Normalize and default safely - handle both cardType and CardType
  const rawType = session.cardType ?? session.CardType ?? 'minimal'
  const cardType = String(rawType).toLowerCase()
  
  // Only detailed/full cards get the full colored border (workshop-highlight)
  // Photo and minimal cards keep the elegant top gradient strip
  const isWorkshop = cardType === 'detailed' || cardType === 'full'
  const workshopClass = isWorkshop ? 'workshop-highlight' : 'non-workshop'
  
  // Handle different card types
  const isSimplified = cardType === 'minimal' || cardType === 'simplified'
  const isPhotoOnly = cardType === 'photo' || cardType === 'photo-only'
  
  // Simplified card for meals, demos, and special sessions
  if (isSimplified) {
    return (
      <div className={`session-card session-card-${size} simple-card ${workshopClass}`} onClick={() => onClick(session)}>
        <div className="session-header">
          <h3 className="session-title session-title-fixed-height">{session.title}</h3>
          {session.bookingEnabled && session.bookingCapacity && session.bookingCapacity > 0 ? (
            <button 
              className="book-pill-button"
              onClick={(e) => { e.stopPropagation(); onClick(session); }}
              title="Book this session"
            >
              Book
            </button>
          ) : (
            <button className="info-button" onClick={(e) => { e.stopPropagation(); onClick(session); }}>
              <span>ℹ</span>
            </button>
          )}
        </div>
        <div className="session-content">
          <div className="session-time-location">
            <span className="time">{timeRange(session.start, session.end)}</span>
            <span className="location">{session.location}</span>
          </div>
        </div>
      </div>
    )
  }
  
  // Photo-only card for special sessions (name, time, location, photo only)
  if (isPhotoOnly) {
    return (
      <div className={`session-card session-card-${size} photo-only-card ${workshopClass}`} onClick={() => onClick(session)}>
        <div className="session-header">
          <h3 className="session-title session-title-fixed-height">{session.title}</h3>
          {session.bookingEnabled && session.bookingCapacity && session.bookingCapacity > 0 ? (
            <button 
              className="book-pill-button"
              onClick={(e) => { e.stopPropagation(); onClick(session); }}
              title="Book this session"
            >
              Book
            </button>
          ) : (
            <button className="info-button" onClick={(e) => { e.stopPropagation(); onClick(session); }}>
              <span>ℹ</span>
            </button>
          )}
        </div>
        <div className="session-content">
          <div className="session-time-location">
            <span className="time">{timeRange(session.start, session.end)}</span>
            <span className="location">{session.location}</span>
          </div>
          
          {/* Photo and Teachers inline */}
          <div className="photo-only-section">
            {session.teachers && session.teachers.length > 0 && (
              <div className="teachers-names">
                {session.teachers.map((teacher, index) => (
                  <React.Fragment key={index}>
                    <button
                      className="teacher-link clickable"
                      onClick={(e) => {
                        e.stopPropagation()
                        onTeacherClick(teacher)
                      }}
                      title={`Filter by ${teacher}`}
                    >
                      {teacher}
                    </button>
                    {index < session.teachers.length - 1 && <span>&nbsp;&&nbsp;</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {/* Teacher Photos - match detailed card style */}
            {session.teachers && session.teachers.length > 0 && (
              <div className="teacher-photos-bottom-right">
                {session.teachers.length === 1 ? (
                  /* Single teacher - show one large photo */
                  <div className="teacher-photo-single">
                    <img 
                      src={session.teacherPhotos?.[0] || '/teachers/placeholder.jpg'}
                      alt={session.teachers[0]}
                      className="teacher-photo-large"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const nextElement = target.nextElementSibling as HTMLElement
                        if (nextElement) nextElement.style.display = 'flex'
                      }}
                    />
                    <div className="teacher-placeholder-large" style={{ display: 'none' }}>
                      {session.teachers[0].split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  </div>
                ) : (
                  /* Multiple teachers - show compact avatars */
                  <div className="teacher-photos-multiple">
                    {session.teachers.slice(0, 3).map((teacher, index) => (
                      <div key={index} className="teacher-avatar-small" style={{ zIndex: 10 - index }}>
                        <img 
                          src={session.teacherPhotos?.[index] || '/teachers/placeholder.jpg'}
                          alt={teacher}
                          className="teacher-photo-small"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const nextElement = target.nextElementSibling as HTMLElement
                            if (nextElement) nextElement.style.display = 'flex'
                          }}
                        />
                        <div className="teacher-placeholder-small" style={{ display: 'none' }}>
                          {teacher.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                      </div>
                    ))}
                    {session.teachers.length > 3 && (
                      <div className="teacher-avatar-small teacher-avatar-more">
                        <div className="teacher-placeholder-small">
                          +{session.teachers.length - 3}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
  
  // Full card for workshops with compact layout
  return (
    <div className={`session-card session-card-${size} ${workshopClass}`} onClick={() => onClick(session)}>
      <div className="session-card__inner">
        {/* Line 1: Name and Info button */}
        <div className="session-header">
          <h3 className="session-title session-title-fixed-height">{session.title}</h3>
          {session.bookingEnabled && session.bookingCapacity && session.bookingCapacity > 0 ? (
            <button 
              className="book-pill-button"
              onClick={(e) => { e.stopPropagation(); onClick(session); }}
              title="Book this session"
            >
              Book
            </button>
          ) : (
            <button className="info-button" onClick={(e) => { e.stopPropagation(); onClick(session); }}>
              <span>ℹ</span>
            </button>
          )}
        </div>
        
        <div className="session-content">
          {/* Line 2: Time and Location */}
          <div className="session-time-location">
            <span className="time">{timeRange(session.start, session.end)}</span>
            <span className="location">{session.location}</span>
          </div>
          
          {/* Line 3: Teachers only - single row */}
          <div className="teachers-inline">
            {session.teachers.map((teacher, index) => (
              <span key={index} className="teacher-name">
                <button
                  className="teacher-link clickable"
                  onClick={(e) => {
                    e.stopPropagation()
                    onTeacherClick(teacher)
                  }}
                  title={`Filter by ${teacher}`}
                >
                  {teacher}
                </button>
                {index < session.teachers.length - 1 && <span className="teacher-separator">&nbsp;&amp;&nbsp;</span>}
              </span>
            ))}
          </div>
        
        {/* Line 4: Level and Styles as clickable tags */}
        <div className="styles-and-photo">
          <div className="tags-container">
            {/* Level Tag - same size as style tags but colored */}
            {session.level && (
              <button
                className="style-tag clickable level-colored"
                style={{ backgroundColor: getLevelColor(session.level), color: 'white' }}
                onClick={(e) => {
                  e.stopPropagation()
                  onLevelClick(session.level)
                }}
                title={`Filter by ${session.level}`}
              >
                {session.level}
              </button>
            )}
            
            {/* Style Tags */}
            {session.styles.map((style, index) => (
              <button
                key={index}
                className="style-tag clickable"
                onClick={(e) => {
                  e.stopPropagation()
                  onStyleClick(style)
                }}
                title={`Filter by ${style}`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
        
        {/* Line 5: Prerequisites - only show if they exist */}
        {session.prereqs && session.prereqs !== "" && session.prereqs !== "TBD" && (
          <div className="prereqs-compact">
            <strong>Pre-Reqs:</strong> {session.prereqs}
          </div>
        )}
        
        {/* Teacher Photos - positioned at bottom right */}
        {session.teachers && session.teachers.length > 0 && (
          <div className="teacher-photos-bottom-right">
            {session.teachers.length === 1 ? (
              /* Single teacher - show one large photo */
              <div className="teacher-photo-single">
                <img 
                  src={session.teacherPhotos?.[0] || '/teachers/placeholder.jpg'}
                  alt={session.teachers[0]}
                  className="teacher-photo-large"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const nextElement = target.nextElementSibling as HTMLElement
                    if (nextElement) nextElement.style.display = 'flex'
                  }}
                />
                <div className="teacher-placeholder-large" style={{ display: 'none' }}>
                  {session.teachers[0].split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
              </div>
            ) : (
              /* Multiple teachers - show compact avatars */
              <div className="teacher-photos-multiple">
                {session.teachers.slice(0, 3).map((teacher, index) => (
                  <div key={index} className="teacher-avatar-small" style={{ zIndex: 10 - index }}>
                    <img 
                      src={session.teacherPhotos?.[index] || '/teachers/placeholder.jpg'}
                      alt={teacher}
                      className="teacher-photo-small"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const nextElement = target.nextElementSibling as HTMLElement
                        if (nextElement) nextElement.style.display = 'flex'
                      }}
                    />
                    <div className="teacher-placeholder-small" style={{ display: 'none' }}>
                      {teacher.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  </div>
                ))}
                {session.teachers.length > 3 && (
                  <div className="teacher-avatar-small teacher-avatar-more">
                    <div className="teacher-placeholder-small">
                      +{session.teachers.length - 3}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </div>
  )
}