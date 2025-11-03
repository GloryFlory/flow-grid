'use client'
import React from 'react'

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

interface SessionModalProps {
  session: Session | null
  onClose: () => void
}

// Helper functions
const timeRange = (start: string, end: string) => {
  return `${start} - ${end}`
}

const getDuration = (start: string, end: string) => {
  const startTime = new Date(`2000-01-01 ${start}`)
  const endTime = new Date(`2000-01-01 ${end}`)
  return (endTime.getTime() - startTime.getTime()) / (1000 * 60) // minutes
}

const getLevelColor = (level: string) => {
  switch (level) {
    case 'Beginner':
      return '#10b981' // green
    case 'Intermediate':
      return '#f59e0b' // amber
    case 'Advanced':
      return '#ef4444' // red
    default:
      return '#3b82f6' // blue
  }
}

const getTeacherImageSrc = (session: any, teacher?: string) => {
  // Use the teacherPhoto from the API if available
  if (session.teacherPhoto) {
    return session.teacherPhoto
  }
  
  // Fallback to placeholder if no photo is available
  return '/teachers/placeholder.jpg'
}

const getTeacherLink = (teachers: string[]) => {
  if (!teachers || teachers.length === 0) return '#'
  // For now, return a placeholder - this could link to teacher profiles
  return '#'
}

export function SessionModal({ session, onClose }: SessionModalProps) {
  if (!session) return null

  const cardType = session.cardType || 'detailed'
  const isSimplified = cardType === 'minimal' || cardType === 'simplified'
  const isPhotoOnly = cardType === 'photo' || cardType === 'photo-only'
  const isPhotoshoot = session.title.toLowerCase().includes('photoshoot')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header with title, time, day, and location */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{session.title}</h2>
            <div className="modal-meta-tags">
              <span className="modal-meta-tag">{timeRange(session.start, session.end)}</span>
              <span className="modal-meta-tag">{session.day}</span>
              <span className="modal-meta-tag">{session.location}</span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          {/* Teachers section - Clean display with photo and bio link */}
          {session.teachers && session.teachers.length > 0 && (
            <div className="modal-teachers-section">
              <div className="modal-teachers-list">
                {session.teachers.map((teacher, index) => (
                  <div key={index} className="modal-teacher-item">
                    <div className="modal-teacher-photo">
                      <img 
                        src={getTeacherImageSrc(session, teacher)}
                        alt={teacher}
                        className="teacher-photo-modal"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const nextElement = target.nextElementSibling as HTMLElement
                          if (nextElement) nextElement.style.display = 'flex'
                        }}
                      />
                      <div className="teacher-placeholder-modal" style={{ display: 'none' }}>
                        {teacher.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                    </div>
                    <div className="modal-teacher-info">
                      <h3 className="modal-teacher-name">{teacher}</h3>
                      <a 
                        href={getTeacherLink([teacher])}
                        className="modal-teacher-bio-link"
                      >
                        View Teacher Bio →
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* About This Workshop - Clean section with blue left border */}
          {session.description && session.description !== "" && (
            <div className="modal-about-section">
              <h3 className="modal-section-title">About This Workshop</h3>
              <p className="modal-about-text">{session.description}</p>
            </div>
          )}
          
          {/* Session Details Grid */}
          <div className="modal-details-grid">
            {/* Level */}
            {session.level && !isSimplified && !isPhotoOnly && (
              <div className="modal-detail-card">
                <h5>LEVEL</h5>
                <span 
                  className="modal-level-badge" 
                  style={{ backgroundColor: getLevelColor(session.level) }}
                >
                  {session.level}
                </span>
              </div>
            )}
            
            {/* Duration */}
            <div className="modal-detail-card">
              <h5>DURATION</h5>
              <span className="modal-duration">{Math.round(getDuration(session.start, session.end))} minutes</span>
            </div>
            
            {/* Prerequisites - only show if they exist */}
            {session.prereqs && session.prereqs !== "" && session.prereqs !== "TBD" && (
              <div className="modal-detail-card modal-prereqs-card">
                <h5>PREREQUISITES</h5>
                <span className="modal-prereqs">
                  {session.prereqs}
                </span>
              </div>
            )}
          </div>
          
          {/* Workshop Types - More spacing */}
          {!isPhotoshoot && !isSimplified && session.styles && session.styles.length > 0 && (
            <div className="modal-workshop-types-section">
              <h3 className="modal-section-title">Workshop Types</h3>
              <div className="modal-styles-list">
                {session.styles.map((style, index) => (
                  <span key={index} className="modal-style-tag">
                    {style}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}