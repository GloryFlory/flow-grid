'use client'
import React, { useState, useEffect } from 'react'

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
  teacherUrls?: (string | null)[]
  prereqs: string
  capacity: number
  currentBookings: number
  cardType: string
  bookingEnabled?: boolean
  bookingCapacity?: number | null
}

interface SessionModalProps {
  session: Session | null
  onClose: () => void
  festivalSlug: string
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

const getTeacherImageSrc = (session: Session, teacher: string, index: number) => {
  // Use the individual teacher's photo from the teacherPhotos array if available
  if (session.teacherPhotos && session.teacherPhotos[index]) {
    return session.teacherPhotos[index]
  }
  
  // Fallback to placeholder if no photo is available
  return '/teachers/placeholder.jpg'
}

const getTeacherLink = (teachers: string[], index: number, session: Session) => {
  if (!teachers || teachers.length === 0) return null
  if (!session.teacherUrls || !session.teacherUrls[index]) return null
  return session.teacherUrls[index]
}

export function SessionModal({ session, onClose, festivalSlug }: SessionModalProps) {
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingNames, setBookingNames] = useState('')
  const [bookingEmail, setBookingEmail] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [currentBookings, setCurrentBookings] = useState(0)
  
  // Initialize device ID
  useEffect(() => {
    let id = localStorage.getItem('deviceId')
    if (!id) {
      id = `device_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`
      localStorage.setItem('deviceId', id)
    }
    setDeviceId(id)
  }, [])
  
  // Check if user has already booked this session
  useEffect(() => {
    if (!session || !deviceId || !session.bookingEnabled) return
    
    const checkBooking = async () => {
      try {
        const response = await fetch(
          `/api/public/festivals/${festivalSlug}/bookings?deviceId=${deviceId}`
        )
        if (response.ok) {
          const bookings = await response.json()
          const hasBooked = bookings.some((b: any) => b.sessionId === session.id)
          setIsBooked(hasBooked)
        }
      } catch (error) {
        console.error('Error checking booking:', error)
      }
    }
    
    checkBooking()
  }, [session, deviceId, festivalSlug])
  
  // Fetch current booking count
  useEffect(() => {
    if (!session?.id) return
    
    const fetchBookingCount = async () => {
      try {
        const response = await fetch(
          `/api/public/festivals/${festivalSlug}/sessions/${session.id}/booking-count`
        )
        if (response.ok) {
          const data = await response.json()
          setCurrentBookings(data.count || 0)
        }
      } catch (error) {
        console.error('Error fetching booking count:', error)
      }
    }
    
    if (session.bookingEnabled) {
      fetchBookingCount()
    }
  }, [session, festivalSlug])
  
  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || isBooking) return
    
    setIsBooking(true)
    try {
      const names = bookingNames.split(',').map(n => n.trim()).filter(n => n)
      const response = await fetch(
        `/api/public/festivals/${festivalSlug}/sessions/${session.id}/book`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            names,
            email: bookingEmail,
            deviceId
          })
        }
      )
      
      if (!response.ok) {
        const error = await response.json()
        alert(error.error || 'Failed to book session')
        return
      }
      
      setIsBooked(true)
      setShowBookingForm(false)
      setBookingNames('')
      setBookingEmail('')
      setCurrentBookings(prev => prev + names.length)
    } catch (error) {
      console.error('Error booking session:', error)
      alert('Failed to book session. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }
  
  const handleCancelBooking = async () => {
    if (!session || !confirm('Are you sure you want to cancel your booking?')) return
    
    try {
      const response = await fetch(
        `/api/public/festivals/${festivalSlug}/sessions/${session.id}/book?deviceId=${deviceId}`,
        { method: 'DELETE' }
      )
      
      if (!response.ok) {
        alert('Failed to cancel booking')
        return
      }
      
      const data = await response.json()
      const namesCount = data.namesCount || 1
      
      setIsBooked(false)
      setCurrentBookings(prev => Math.max(0, prev - namesCount))
    } catch (error) {
      console.error('Error canceling booking:', error)
      alert('Failed to cancel booking')
    }
  }
  
  if (!session) return null

  const cardType = session.cardType || 'detailed'
  const isSimplified = cardType === 'minimal' || cardType === 'simplified'
  const isPhotoOnly = cardType === 'photo' || cardType === 'photo-only'
  const isPhotoshoot = session.title.toLowerCase().includes('photoshoot')
  
  const capacity = session.bookingCapacity || 0
  const spotsLeft = capacity > 0 ? capacity - currentBookings : null
  const isFull = spotsLeft !== null && spotsLeft <= 0

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
                {session.teachers.map((teacher, index) => {
                  const teacherUrl = getTeacherLink(session.teachers, index, session)
                  return (
                    <div key={index} className="modal-teacher-item">
                      <div className="modal-teacher-photo">
                        <img 
                          src={getTeacherImageSrc(session, teacher, index)}
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
                        {teacherUrl && (
                          <a 
                            href={teacherUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="modal-teacher-bio-link"
                          >
                            View Teacher Bio →
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
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
          
          {/* Booking Section */}
          {session.bookingEnabled && (
            <div className="modal-booking-section">
              <h3 className="modal-section-title">Booking</h3>
              
              {/* Capacity Display */}
              {capacity > 0 && (
                <div className="booking-capacity">
                  {isFull ? (
                    <span className="capacity-full">⚠️ Session Full</span>
                  ) : spotsLeft !== null && spotsLeft <= 5 ? (
                    <span className="capacity-low">🔥 Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!</span>
                  ) : (
                    <span className="capacity-available">
                      ✓ {currentBookings}/{capacity} spots taken
                    </span>
                  )}
                </div>
              )}
              
              {/* Booking Status / Actions */}
              <div className="booking-actions">
                {isBooked ? (
                  <div className="booking-confirmed">
                    <div className="booking-confirmed-badge">
                      ✓ You're booked for this session
                    </div>
                    <button 
                      onClick={handleCancelBooking}
                      className="cancel-booking-btn"
                    >
                      Cancel Booking
                    </button>
                  </div>
                ) : isFull ? (
                  <div className="booking-full-message">
                    This session is currently full. Check back later in case spots open up!
                  </div>
                ) : !showBookingForm ? (
                  <button 
                    onClick={() => setShowBookingForm(true)}
                    className="book-spot-btn"
                  >
                    Book Your Spot
                  </button>
                ) : (
                  <form onSubmit={handleBookSubmit} className="booking-form">
                    <div className="form-group">
                      <label htmlFor="booking-names">
                        Name(s) <span className="form-hint">(separate multiple names with commas)</span>
                      </label>
                      <input
                        id="booking-names"
                        type="text"
                        value={bookingNames}
                        onChange={(e) => setBookingNames(e.target.value)}
                        placeholder="Your Name, Partner's Name"
                        required
                        className="booking-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="booking-email">Email</label>
                      <input
                        id="booking-email"
                        type="email"
                        value={bookingEmail}
                        onChange={(e) => setBookingEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        className="booking-input"
                      />
                    </div>
                    <div className="booking-form-actions">
                      <button 
                        type="submit" 
                        disabled={isBooking}
                        className="submit-booking-btn"
                      >
                        {isBooking ? 'Booking...' : 'Confirm Booking'}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setShowBookingForm(false)}
                        className="cancel-form-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}