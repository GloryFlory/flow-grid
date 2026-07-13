'use client'
import React, { useState, useEffect } from 'react'
import { Star, Puzzle } from 'lucide-react'
import { toast } from 'sonner'

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
  festivalId?: string
}

interface SessionModalProps {
  session: Session | null
  onClose: () => void
  festivalSlug: string
  isFavourite?: boolean
  onFavouriteToggle?: (sessionId: string) => void
  primaryColor?: string
  accentColor?: string
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

// Helper to darken a hex color
const darkenColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * percent)
  const R = Math.max((num >> 16) - amt, 0)
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0)
  const B = Math.max((num & 0x0000FF) - amt, 0)
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
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

const PuzzlePieceIcon = () => (
  <Puzzle size={13} strokeWidth={2} aria-hidden="true" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3rem', opacity: 0.6 }} />
)

export function SessionModal({ session, onClose, festivalSlug, isFavourite = false, onFavouriteToggle, primaryColor = '#4a90e2', accentColor = '#ff6b6b', customLevelColors }: SessionModalProps) {
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [bookingNames, setBookingNames] = useState('')
  const [bookingEmail, setBookingEmail] = useState('')
  const [isBooking, setIsBooking] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const [deviceId, setDeviceId] = useState('')
  const [currentBookings, setCurrentBookings] = useState(0)
  
  // Waitlist state
  const [showWaitlistForm, setShowWaitlistForm] = useState(false)
  const [waitlistName, setWaitlistName] = useState('')
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false)
  const [waitlistPosition, setWaitlistPosition] = useState<number | null>(null)
  const [isOnWaitlist, setIsOnWaitlist] = useState(false)
  
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
  
  // Check waitlist status
  useEffect(() => {
    if (!session?.id || !deviceId || !session.bookingEnabled) return
    
    const checkWaitlistStatus = async () => {
      try {
        const response = await fetch(
          `/api/waitlist/status?sessionId=${session.id}&deviceId=${deviceId}`
        )
        if (response.ok) {
          const data = await response.json()
          if (data.position) {
            setIsOnWaitlist(true)
            setWaitlistPosition(data.position)
          } else {
            setIsOnWaitlist(false)
            setWaitlistPosition(null)
          }
        }
      } catch (error) {
        console.error('Error checking waitlist status:', error)
      }
    }
    
    checkWaitlistStatus()
  }, [session, deviceId])
  
  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session || isJoiningWaitlist) return
    
    setIsJoiningWaitlist(true)
    try {
      const response = await fetch('/api/waitlist/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          festivalId: session.festivalId,
          deviceId,
          name: waitlistName.trim(),
          email: waitlistEmail.trim()
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        toast.error(data.error || 'Failed to join waitlist')
        return
      }
      
      setIsOnWaitlist(true)
      setWaitlistPosition(data.position)
      setShowWaitlistForm(false)
      setWaitlistName('')
      setWaitlistEmail('')
      toast.success(`You're #${data.position} on the waitlist! We'll email you when a spot opens.`)
    } catch (error) {
      console.error('Error joining waitlist:', error)
      toast.error('Failed to join waitlist. Please try again.')
    } finally {
      setIsJoiningWaitlist(false)
    }
  }
  
  const handleLeaveWaitlist = async () => {
    if (!session || !confirm('Are you sure you want to leave the waitlist?')) return
    
    try {
      const response = await fetch(
        `/api/waitlist/status?sessionId=${session.id}&deviceId=${deviceId}`,
        { method: 'DELETE' }
      )
      
      if (!response.ok) {
        toast.error('Failed to leave waitlist')
        return
      }
      
      setIsOnWaitlist(false)
      setWaitlistPosition(null)
      toast.success('You have left the waitlist')
    } catch (error) {
      console.error('Error leaving waitlist:', error)
      toast.error('Failed to leave waitlist')
    }
  }
  
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
        toast.error(error.error || 'Failed to book session')
        return
      }
      
      setIsBooked(true)
      setShowBookingForm(false)
      setBookingNames('')
      setBookingEmail('')
      setCurrentBookings(prev => prev + names.length)
      toast.success('🎉 Booking confirmed!')
    } catch (error) {
      console.error('Error booking session:', error)
      toast.error('Failed to book session. Please try again.')
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
        toast.error('Failed to cancel booking')
        return
      }
      
      const data = await response.json()
      const namesCount = data.namesCount || 1
      
      setIsBooked(false)
      setCurrentBookings(prev => Math.max(0, prev - namesCount))
      toast.success('Booking cancelled')
    } catch (error) {
      console.error('Error canceling booking:', error)
      toast.error('Failed to cancel booking')
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

  const formatDay = (day: string) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      const d = new Date(day + 'T12:00:00')
      return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    }
    return day
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <h2>{session.title}</h2>
            <div className="modal-meta-tags">
              <span className="modal-meta-tag">{timeRange(session.start, session.end)}</span>
              {session.day && <span className="modal-meta-tag">{formatDay(session.day)}</span>}
            </div>
          </div>
          <div className="modal-header-actions">
            {onFavouriteToggle && (
              <button
                className={`favourite-button modal-favourite ${isFavourite ? 'is-favourite' : ''}`}
                onClick={(e) => { e.stopPropagation(); onFavouriteToggle(session.id) }}
                aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
                title={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
              >
                <Star size={20} className="star-icon" fill={isFavourite ? 'currentColor' : 'none'} />
              </button>
            )}
            <button className="close-button" onClick={onClose}>&times;</button>
          </div>
        </div>

        <div className="modal-body">
          {/* Teachers */}
          {session.teachers && session.teachers.length > 0 && (
            <div className="modal-teachers-section">
              <div className="modal-teachers-list">
                {session.teachers.map((teacher, index) => {
                  const teacherUrl = getTeacherLink(session.teachers, index, session)
                  const photoSrc = session.teacherPhotos?.[index]
                  return (
                    <div key={index} className="modal-teacher-item">
                      <div className="modal-teacher-photo teacher-photo-frame">
                        <div className="teacher-placeholder-modal">
                          {teacher.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        {photoSrc && (
                          <img
                            src={photoSrc}
                            alt={teacher}
                            className="teacher-photo-modal teacher-photo-overlay"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                          />
                        )}
                      </div>
                      <div className="modal-teacher-info">
                        <h3 className="modal-teacher-name">{teacher}</h3>
                        {teacherUrl && (
                          <a href={teacherUrl} target="_blank" rel="noopener noreferrer" className="modal-teacher-bio-link">
                            View Bio →
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Description */}
          {session.description && session.description !== '' && (
            <div className="modal-about-section">
              <h3 className="modal-section-title">About This Workshop</h3>
              <p className="modal-about-text">{session.description}</p>
            </div>
          )}

          {/* Details grid: level · duration · location */}
          <div className="modal-details-grid">
            {session.level && !isSimplified && !isPhotoOnly && (
              <div className="modal-detail-card">
                <h5>LEVEL</h5>
                <span
                  className="modal-level-badge"
                  style={{ backgroundColor: getLevelColor(session.level, customLevelColors) }}
                >
                  {session.level}
                </span>
              </div>
            )}
            <div className="modal-detail-card">
              <h5>DURATION</h5>
              <span className="modal-duration">{Math.round(getDuration(session.start, session.end))} min</span>
            </div>
            {session.location && (
              <div className="modal-detail-card">
                <h5>LOCATION</h5>
                <span className="modal-location">{session.location}</span>
              </div>
            )}
            {session.prereqs && session.prereqs !== '' && session.prereqs !== 'TBD' && (
              <div className="modal-detail-card modal-prereqs-card">
                <h5><PuzzlePieceIcon />PREREQUISITES</h5>
                <span className="modal-prereqs">{session.prereqs}</span>
              </div>
            )}
          </div>

          {/* Style tags */}
          {!isPhotoshoot && !isSimplified && session.styles && session.styles.length > 0 && (
            <div className="modal-workshop-types-section">
              <h3 className="modal-section-title">Workshop Types</h3>
              <div className="modal-styles-list">
                {session.styles.map((style, index) => (
                  <span key={index} className="modal-style-tag">{style}</span>
                ))}
              </div>
            </div>
          )}

          {/* Booking Section */}
          {session.bookingEnabled && (
            <div className="modal-booking-section">
              <div className="booking-header">
                <h3 className="modal-section-title">Booking</h3>
                {isFull && (
                  <span className="session-full-pill">Session Full</span>
                )}
              </div>
              
              {/* Capacity Display */}
              {capacity > 0 && !isFull && (
                <div className="booking-capacity">
                  {spotsLeft !== null && spotsLeft <= 5 ? (
                    <span className="capacity-low">🔥 Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} left!</span>
                  ) : (
                    <span className="capacity-available">
                      ✓ {currentBookings}/{capacity} spots taken
                    </span>
                  )}
                </div>
              )}
              
              {/* Booking Status / Actions */}
              <div className="booking-actions" style={{ alignItems: 'flex-start' }}>
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
                  <div className="booking-full-section" style={{ alignItems: 'flex-start' }}>
                    {isOnWaitlist ? (
                      <div className="waitlist-status" style={{ textAlign: 'left' }}>
                        <div className="waitlist-position-badge">
                          You're #{waitlistPosition} on the waitlist
                        </div>
                        <p className="waitlist-info">
                          We'll email you if a spot opens up.
                        </p>
                        <button 
                          onClick={handleLeaveWaitlist}
                          className="leave-waitlist-btn"
                        >
                          Leave Waitlist
                        </button>
                      </div>
                    ) : !showWaitlistForm ? (
                      <div className="waitlist-offer" style={{ textAlign: 'left' }}>
                        <button 
                          onClick={() => setShowWaitlistForm(true)}
                          className="join-waitlist-btn"
                          style={{
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${darkenColor(primaryColor, 15)} 100%)`
                          }}
                        >
                          Join Waitlist
                        </button>
                        <p className="waitlist-hint">
                          Get notified if a spot opens up.
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleJoinWaitlist} className="waitlist-form">
                        <h4 className="waitlist-form-title">Join the Waitlist</h4>
                        <p className="waitlist-form-desc">
                          We'll email you if a spot becomes available.
                        </p>
                        <div className="form-group">
                          <label htmlFor="waitlist-name">Your Name</label>
                          <input
                            id="waitlist-name"
                            type="text"
                            value={waitlistName}
                            onChange={(e) => setWaitlistName(e.target.value)}
                            placeholder="Your Name"
                            required
                            className="booking-input"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="waitlist-email">Email</label>
                          <input
                            id="waitlist-email"
                            type="email"
                            value={waitlistEmail}
                            onChange={(e) => setWaitlistEmail(e.target.value)}
                            placeholder="your.email@example.com"
                            required
                            className="booking-input"
                          />
                        </div>
                        <div className="booking-form-actions">
                          <button 
                            type="submit" 
                            disabled={isJoiningWaitlist}
                            className="submit-booking-btn"
                            style={{
                              background: `linear-gradient(135deg, ${primaryColor} 0%, ${darkenColor(primaryColor, 15)} 100%)`
                            }}
                          >
                            {isJoiningWaitlist ? 'Joining...' : 'Join Waitlist'}
                          </button>
                          <button 
                            type="button"
                            onClick={() => setShowWaitlistForm(false)}
                            className="cancel-form-btn"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
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