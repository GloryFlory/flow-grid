'use client'
import React from 'react'
import { Puzzle } from 'lucide-react'

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
  festivalId?: string
}

interface SessionCardProps {
  session: Session
  onClick: (session: Session) => void
  onStyleClick: (style: string) => void
  onLevelClick: (level: string) => void
  onTeacherClick: (teacher: string) => void
  isFavourite?: boolean
  onFavouriteToggle?: (sessionId: string) => void
  customLevelColors?: Record<string, string> | null
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

const getLevelColor = (level: string, customColors?: Record<string, string> | null) => {
  // Use custom color if available
  if (customColors && customColors[level]) {
    return customColors[level]
  }
  
  // Fallback to defaults
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
  
  // Return null if no photo - component should handle hiding the image
  return null
}

// Enhanced teacher link function (could link to teacher profiles in the future)
const getTeacherLink = (teachers: string[]) => {
  if (!teachers || teachers.length === 0) return '#'
  // Future: could link to `/teachers/${teacher-slug}` pages
  return '#'
}

// Favourite star button component
const FavouriteButton = ({ 
  isFavourite, 
  onToggle, 
  sessionId 
}: { 
  isFavourite: boolean
  onToggle?: (sessionId: string) => void
  sessionId: string 
}) => {
  if (!onToggle) return null
  
  return (
    <button
      className={`favourite-button ${isFavourite ? 'is-favourite' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onToggle(sessionId)
      }}
      title={isFavourite ? 'Remove from My Schedule' : 'Add to My Schedule'}
      aria-label={isFavourite ? 'Remove from My Schedule' : 'Add to My Schedule'}
    >
      <svg 
        width="18" 
        height="18" 
        viewBox="0 0 24 24" 
        fill={isFavourite ? 'currentColor' : 'none'}
        stroke="currentColor" 
        strokeWidth="2"
        className="star-icon"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    </button>
  )
}

export function SessionCard({ session, onClick, onStyleClick, onLevelClick, onTeacherClick, isFavourite = false, onFavouriteToggle, customLevelColors }: SessionCardProps) {
  const size = getSessionSize(session)
  
  // Normalize and default safely - handle both cardType and CardType
  // Accepts new names (featured/standard/compact) and old names for backward compat
  const rawType = session.cardType ?? session.CardType ?? 'featured'
  const cardType = String(rawType).toLowerCase()

  const isCompact   = ['compact', 'minimal', 'simplified'].includes(cardType)
  const isStandard  = ['standard', 'photo', 'photo-only'].includes(cardType)
  const isFeatured  = !isCompact && !isStandard  // featured, detailed, full, or unknown

  // Featured cards get the gradient-frame border; others get the subtle top strip
  const workshopClass = isFeatured ? 'workshop-highlight' : 'non-workshop'
  
  const hasPrereqs = !!(session.prereqs && session.prereqs !== '' && session.prereqs !== 'TBD')

  // time · [pin] location — shared across all card types
  const TimeLocation = () => (
    <div className="session-time-location">
      <span className="time">{timeRange(session.start, session.end)}</span>
      {session.location && (
        <>
          <svg className="location-pin" viewBox="0 0 12 16" width="9" height="11" fill="currentColor" aria-hidden="true">
            <path d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 7.5C4.62 7.5 3.5 6.38 3.5 5S4.62 2.5 6 2.5 8.5 3.62 8.5 5 7.38 7.5 6 7.5z"/>
          </svg>
          <span className="location">{session.location}</span>
        </>
      )}
    </div>
  )

  // Shared teacher photo block (detailed + photo cards)
  const TeacherPhoto = () => {
    if (!session.teachers || session.teachers.length === 0) return null
    return (
      <div className="teacher-photos-bottom-right">
        {session.teachers.length === 1 ? (
          <div className="teacher-photo-single teacher-photo-frame">
            <div className="teacher-placeholder-large">
              {session.teachers[0].split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            {session.teacherPhotos?.[0] && (
              <img
                src={session.teacherPhotos[0]!}
                alt={session.teachers[0]}
                className="teacher-photo-large teacher-photo-overlay"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            )}
          </div>
        ) : (
          <div className="teacher-photos-multiple">
            {session.teachers.slice(0, 3).map((teacher, index) => (
              <div key={index} className="teacher-avatar-small teacher-photo-frame" style={{ zIndex: 10 - index }}>
                <div className="teacher-placeholder-small">
                  {teacher.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                {session.teacherPhotos?.[index] && (
                  <img
                    src={session.teacherPhotos[index]!}
                    alt={teacher}
                    className="teacher-photo-small teacher-photo-overlay"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                  />
                )}
              </div>
            ))}
            {session.teachers.length > 3 && (
              <div className="teacher-avatar-small teacher-avatar-more">
                <div className="teacher-placeholder-small">+{session.teachers.length - 3}</div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Shared teacher names row — max 2 shown on card to prevent overflow into tags
  const TeacherNames = () => {
    if (!session.teachers || session.teachers.length === 0) return null
    const shown = session.teachers.slice(0, 2)
    const extra = session.teachers.length - 2
    return (
      <div className="teachers-inline">
        {shown.map((teacher, index) => (
          <span key={index} className="teacher-name">
            <button
              className="teacher-link"
              onClick={(e) => { e.stopPropagation(); onTeacherClick(teacher) }}
              title={`Filter by ${teacher}`}
            >
              {teacher}
            </button>
            {index < shown.length - 1 && <span className="teacher-separator">&nbsp;&amp;&nbsp;</span>}
          </span>
        ))}
        {extra > 0 && <span className="teacher-extra">&nbsp;&amp;&nbsp;+{extra} more</span>}
      </div>
    )
  }

  const PuzzlePiece = () => (
    <button
      className="prereqs-icon"
      title="Prerequisites apply — tap for details"
      onClick={(e) => { e.stopPropagation(); onClick(session) }}
      type="button"
    >
      <Puzzle size={18} strokeWidth={2} aria-hidden="true" />
    </button>
  )

  // showPuzzle: featured cards show prereq text inline instead of the icon
  const Actions = ({ booking = true, showPuzzle = true }: { booking?: boolean; showPuzzle?: boolean }) => (
    <div className="session-actions">
      {hasPrereqs && showPuzzle && <PuzzlePiece />}
      <FavouriteButton isFavourite={isFavourite} onToggle={onFavouriteToggle} sessionId={session.id} />
      {booking && session.bookingEnabled && session.bookingCapacity && session.bookingCapacity > 0 ? (
        <button className="book-pill-button" onClick={(e) => { e.stopPropagation(); onClick(session) }}>Book</button>
      ) : (
        <button className="info-button" onClick={(e) => { e.stopPropagation(); onClick(session) }}><span>ℹ</span></button>
      )}
    </div>
  )

  // ── COMPACT: time / title only ────────────────────────────────────
  if (isCompact) {
    return (
      <div className={`session-card session-card-${size} simple-card non-workshop ${isFavourite ? 'is-favourited' : ''}`} onClick={() => onClick(session)}>
        <div className="session-header">
          <TimeLocation />
          <Actions booking={false} showPuzzle={false} />
        </div>
        <h3 className="session-title session-title-fixed-height">{session.title}</h3>
      </div>
    )
  }

  // ── STANDARD: time / title / teacher name + photo ─────────────────
  if (isStandard) {
    return (
      <div className={`session-card session-card-${size} photo-only-card non-workshop ${isFavourite ? 'is-favourited' : ''}`} onClick={() => onClick(session)}>
        <div className="session-header">
          <TimeLocation />
          {/* Puzzle shown in header if prereqs exist */}
          <Actions showPuzzle={true} />
        </div>
        <h3 className="session-title session-title-fixed-height">{session.title}</h3>
        <TeacherNames />
        <div className="session-card-footer">
          <TeacherPhoto />
        </div>
      </div>
    )
  }

  // ── FEATURED: full details — prereq text shown inline, no puzzle icon ──
  return (
    <div className={`session-card session-card-${size} ${workshopClass} ${isFavourite ? 'is-favourited' : ''}`} onClick={() => onClick(session)}>
      <div className="session-card__inner">
        <div className="session-header">
          <TimeLocation />
          {/* No puzzle icon — prereqs shown as text below */}
          <Actions showPuzzle={false} />
        </div>
        <h3 className="session-title session-title-fixed-height">{session.title}</h3>
        <TeacherNames />
        {/* Bottom block: tags/prereqs on the left, photo pinned to the right — both in flow */}
        <div className="session-card-bottom-block">
          <div className="session-card-level-tags">
            {session.level && (
              <button
                className="level-chip"
                style={{ backgroundColor: getLevelColor(session.level, customLevelColors) }}
                onClick={(e) => { e.stopPropagation(); onLevelClick(session.level) }}
                title={`Filter by ${session.level}`}
              >
                {session.level}
              </button>
            )}
            {session.styles.length > 0 && (
              <div className="card-tags-row">
                {session.styles.slice(0, 3).map((style, index) => (
                  <button
                    key={index}
                    className="style-tag"
                    onClick={(e) => { e.stopPropagation(); onStyleClick(style) }}
                    title={`Filter by ${style}`}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1).toLowerCase()}
                  </button>
                ))}
                {session.styles.length > 3 && (
                  <span className="tags-overflow">+{session.styles.length - 3}</span>
                )}
              </div>
            )}
            {hasPrereqs && (
              <p className="prereq-snippet" title="Tap for full prerequisites">
                <span className="prereq-snippet__label">Prereqs:</span> {session.prereqs}
              </p>
            )}
          </div>
          <TeacherPhoto />
        </div>
      </div>
    </div>
  )
}