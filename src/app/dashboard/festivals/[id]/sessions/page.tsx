'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Search,
  Filter,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  X,
  Check,
  AlertCircle,
  Eye,
  GripVertical,
  Lock,
  Frown
} from 'lucide-react'
import Link from 'next/link'
import SessionEditModal from '@/components/dashboard/SessionEditModal'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface FestivalSession {
  id: string
  title: string
  description?: string
  day: string
  startTime: string
  endTime: string
  location?: string
  level?: string
  styles: string[]
  prerequisites?: string
  capacity?: number
  teachers: string[]
  teacherBios: string[]
  cardType: 'minimal' | 'photo' | 'detailed'
  displayOrder?: number
  bookingEnabled?: boolean
  bookingCapacity?: number
  requirePayment?: boolean
  price?: number
  _count?: {
    bookings: number
  }
}

interface Festival {
  id: string
  name: string
  slug: string
  startDate: string
  endDate: string
  sessions: FestivalSession[]
}

// Sortable Row Component
function SortableSessionRow({ 
  session, 
  bookings,
  festival,
  onEdit, 
  onDelete,
  onViewBookings
}: { 
  session: FestivalSession
  bookings: any[]
  festival: Festival | null
  onEdit: (session: FestivalSession) => void
  onDelete: (id: string) => void
  onViewBookings: (sessionId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: session.id })

  // Use _count.bookings from the API response
  const totalBooked = session._count?.bookings || 0
  const capacity = session.bookingCapacity || 0
  const isFullyBooked = session.bookingEnabled && capacity > 0 && totalBooked >= capacity
  const hasBookings = session.bookingEnabled && totalBooked > 0

  // Check if session is outside festival range
  const isOutsideRange = festival && (() => {
    try {
      const sessionDate = new Date(session.day)
      const startDate = new Date(festival.startDate)
      const endDate = new Date(festival.endDate)
      endDate.setDate(endDate.getDate() + 1)
      return sessionDate < startDate || sessionDate >= endDate
    } catch {
      return false
    }
  })()

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr 
      ref={setNodeRef} 
      style={style}
      className="border-b border-gray-100 hover:bg-gray-50"
    >
      <td className="py-3 px-2 cursor-grab active:cursor-grabbing">
        <div {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </div>
      </td>
      <td className="py-3 px-4">
        <div>
          <h3 className="font-medium text-gray-900">{session.title}</h3>
          {session.location && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <MapPin className="w-3 h-3" />
              {session.location}
            </div>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm">
          <div className="font-medium text-gray-900 flex items-center gap-2">
            <span>
              {(() => {
                // Always try to extract date from startTime first (most reliable)
                let dateStr = session.startTime?.split('T')[0] || ''
                
                // If startTime doesn't have a valid date, fall back to session.day (unless it's Invalid Date)
                if (!dateStr || isNaN(Date.parse(dateStr))) {
                  dateStr = session.day !== 'Invalid Date' ? (session.day || '') : ''
                }
                
                // If we still don't have a valid date, return a fallback
                if (!dateStr || dateStr === 'Invalid Date' || isNaN(Date.parse(dateStr))) {
                  return session.day === 'Invalid Date' ? 'Date needs fixing' : (session.day || 'No date set')
                }
                
                try {
                  const date = new Date(dateStr + 'T12:00:00Z')
                  if (isNaN(date.getTime())) {
                    return session.day || dateStr
                  }
                  const dayName = date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
                  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
                  return `${dayName}, ${monthDay}`
                } catch {
                  return session.day === 'Invalid Date' ? 'Date needs fixing' : (session.day || dateStr)
                }
              })()}
            </span>
            {isOutsideRange && festival && (
              <div className="relative group">
                <AlertCircle className="w-4 h-4 text-amber-500 cursor-help flex-shrink-0" />
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  Date outside festival range ({new Date(festival.startDate).toLocaleDateString()} - {new Date(festival.endDate).toLocaleDateString()})
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45 -mt-1"></div>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-gray-500 mt-1 text-xs whitespace-nowrap">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="inline-block">
              {(() => {
                // Extract time from datetime string
                const extractTime = (datetime: string) => {
                  if (!datetime) return ''
                  if (datetime.match(/^\d{2}:\d{2}$/)) return datetime
                  const timePart = datetime.split('T')[1]
                  return timePart ? timePart.substring(0, 5) : datetime
                }
                return `${extractTime(session.startTime)} - ${extractTime(session.endTime)}`
              })()}
            </span>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <div className="text-sm text-gray-900">
          {session.teachers.join(', ')}
        </div>
      </td>
      <td className="py-3 px-4">
        {session.level && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {session.level}
          </span>
        )}
      </td>
      <td className="py-3 px-4">
        <div className="flex flex-wrap gap-1">
          {session.styles.slice(0, 2).map((style, index) => (
            <span 
              key={index}
              className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
            >
              {style}
            </span>
          ))}
          {session.styles.length > 2 && (
            <span className="text-xs text-gray-500">
              +{session.styles.length - 2} more
            </span>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        {session.bookingEnabled ? (
          <button
            onClick={() => onViewBookings(session.id)}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isFullyBooked
                ? 'bg-red-100 text-red-800 hover:bg-red-200'
                : hasBookings
                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            {totalBooked}/{capacity}
            {isFullyBooked && <span className="ml-1.5">FULL</span>}
          </button>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        )}
      </td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <Button
            onClick={() => onEdit(session)}
            size="sm"
            variant="outline"
          >
            <Edit className="w-3 h-3" />
          </Button>
          <Button
            onClick={() => onDelete(session.id)}
            size="sm"
            variant="outline"
            className="text-red-600 hover:text-red-700 hover:border-red-300"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </td>
    </tr>
  )
}

export default function SessionsManagement() {
  const params = useParams()
  const festivalId = params.id as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [sessions, setSessions] = useState<FestivalSession[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'sessions' | 'bookings'>('sessions')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<{ type: 'not-found' | 'forbidden' | 'error'; message: string } | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDay, setSelectedDay] = useState<string>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSession, setEditingSession] = useState<FestivalSession | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [bookingSearchTerm, setBookingSearchTerm] = useState('')
  const [bookingFilterSession, setBookingFilterSession] = useState('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Google Sheets import state
  const [googleSheetUrl, setGoogleSheetUrl] = useState('')
  const [isValidatingSheet, setIsValidatingSheet] = useState(false)
  const [isImportingSheet, setIsImportingSheet] = useState(false)
  const [sheetValidation, setSheetValidation] = useState<{ isValid: boolean; sessionCount?: number; error?: string } | null>(null)
  const [showGoogleSheetImport, setShowGoogleSheetImport] = useState(false)
  const [showGoogleSheetsPreview, setShowGoogleSheetsPreview] = useState(false)
  const [googleSheetsPreviewData, setGoogleSheetsPreviewData] = useState<any>(null)
  const [selectedGoogleSheetsMode, setSelectedGoogleSheetsMode] = useState<'replace' | 'merge'>('merge')

  // CSV Preview & Merge state
  const [showCSVPreview, setShowCSVPreview] = useState(false)
  const [csvPreviewData, setCSVPreviewData] = useState<any>(null)
  const [selectedMode, setSelectedMode] = useState<'replace' | 'merge'>('merge')
  const [suggestedMatchDecisions, setSuggestedMatchDecisions] = useState<Record<string, 'update' | 'create' | 'skip'>>({})
  const [isGoogleSheetsImport, setIsGoogleSheetsImport] = useState(false) // Track import source)
  const [showDateWarningBanner, setShowDateWarningBanner] = useState(true)

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Date range validation helper
  const isSessionOutsideRange = (sessionDay: string, festivalStart: string, festivalEnd: string): boolean => {
    try {
      const sessionDate = new Date(sessionDay)
      const startDate = new Date(festivalStart)
      const endDate = new Date(festivalEnd)
      
      // Add one day to end date to include the end day
      endDate.setDate(endDate.getDate() + 1)
      
      return sessionDate < startDate || sessionDate >= endDate
    } catch {
      return false
    }
  }

  // Get sessions outside festival range
  const getOutOfRangeSessions = () => {
    if (!festival || !sessions.length) return []
    
    return sessions.filter(session => 
      isSessionOutsideRange(session.day, festival.startDate, festival.endDate)
    )
  }

  const outOfRangeSessions = getOutOfRangeSessions()

  useEffect(() => {
    if (festivalId) {
      fetchFestival()
      fetchBookings() // Always fetch bookings for the count
    }
  }, [festivalId])

  const fetchFestival = async () => {
    try {
      // Fetch festival data
      const festivalResponse = await fetch(`/api/admin/festivals/${festivalId}`)
      
      if (festivalResponse.status === 403) {
        setError({ 
          type: 'forbidden', 
          message: 'You do not have permission to access this festival. Please contact support if you believe this is an error.' 
        })
        setIsLoading(false)
        return
      }
      
      if (festivalResponse.status === 404) {
        setError({ 
          type: 'not-found', 
          message: 'This festival could not be found. It may have been deleted.' 
        })
        setIsLoading(false)
        return
      }
      
      if (!festivalResponse.ok) {
        setError({ 
          type: 'error', 
          message: 'Failed to load festival data. Please try again.' 
        })
        setIsLoading(false)
        return
      }
      
      const festivalData = await festivalResponse.json()
      setFestival(festivalData.festival)

      // Fetch sessions data
      const sessionsResponse = await fetch(`/api/admin/festivals/${festivalId}/sessions`)
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching festival:', error)
      setError({ 
        type: 'error', 
        message: 'An unexpected error occurred. Please try again.' 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/bookings`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].name.endsWith('.csv')) {
      setSelectedFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith('.csv')) {
      setSelectedFile(file)
    }
  }

  const uploadCSV = async () => {
    if (!selectedFile || !festival) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      // First, get preview data
      const previewResponse = await fetch(`/api/admin/festivals/${festivalId}/sessions/csv/preview`, {
        method: 'POST',
        body: formData,
      })

      const previewData = await previewResponse.json()

      if (previewResponse.ok) {
        // Show preview modal
        setCSVPreviewData(previewData)
        setShowCSVPreview(true)
        setIsGoogleSheetsImport(false) // Mark as CSV import
        
        // Auto-select merge mode if there are bookings, otherwise default to merge
        if (previewData.sessionsWithBookingsCount > 0) {
          setSelectedMode('merge')
        }
      } else {
        alert(`Error: ${previewData.message || previewData.error || 'Failed to process CSV'}`)
      }
    } catch (error) {
      console.error('Error previewing CSV:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const confirmUpload = async () => {
    if ((!selectedFile && !isGoogleSheetsImport) || !festival) return

    setIsUploading(true)

    try {
      let response;
      
      if (isGoogleSheetsImport) {
        // Google Sheets import
        response = await fetch(`/api/admin/festivals/${festivalId}/import-google-sheet`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            googleSheetUrl,
            mode: selectedMode,
            suggestedMatches: suggestedMatchDecisions
          })
        })
      } else {
        // CSV import
        const formData = new FormData()
        formData.append('file', selectedFile!)
        formData.append('mode', selectedMode)
        formData.append('suggestedMatches', JSON.stringify(suggestedMatchDecisions))

        response = await fetch(`/api/admin/festivals/${festivalId}/sessions/csv`, {
          method: 'POST',
          body: formData,
        })
      }

      const data = await response.json()

      if (response.ok) {
        // Refresh the festival data to show updated sessions
        await fetchFestival()
        setSelectedFile(null)
        setShowCSVPreview(false)
        setCSVPreviewData(null)
        setSuggestedMatchDecisions({})
        setIsGoogleSheetsImport(false)
        
        if (isGoogleSheetsImport) {
          setGoogleSheetUrl('')
          setSheetValidation(null)
          setShowGoogleSheetImport(false)
        }
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        if (selectedMode === 'merge') {
          alert(
            `✅ Smart Merge completed!\n\n` +
            `• ${data.created} new sessions created\n` +
            `• ${data.updated} sessions updated` +
            (data.suggested ? `\n• ${data.suggested} suggested matches applied` : '') +
            `\n• Sessions with bookings preserved`
          )
        } else {
          alert(`✅ ${data.message}`)
        }
      } else {
        alert(`Error: ${data.message || data.error || 'Failed to import'}`)
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const exportCSV = async () => {
    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/sessions/csv`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${festival?.slug}-sessions.csv`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  const validateGoogleSheet = async () => {
    if (!googleSheetUrl.trim()) {
      setSheetValidation({ isValid: false, error: 'Please enter a Google Sheets URL' })
      return
    }

    setIsValidatingSheet(true)
    setSheetValidation(null)

    try {
      const response = await fetch(
        `/api/admin/festivals/${festivalId}/import-google-sheet?url=${encodeURIComponent(googleSheetUrl)}`
      )
      const data = await response.json()

      if (data.isValid) {
        setSheetValidation({
          isValid: true,
          sessionCount: data.sessionCount
        })
      } else {
        setSheetValidation({
          isValid: false,
          error: data.error || 'Failed to validate sheet'
        })
      }
    } catch (error) {
      setSheetValidation({
        isValid: false,
        error: 'Network error. Please try again.'
      })
    } finally {
      setIsValidatingSheet(false)
    }
  }

  const importFromGoogleSheet = async () => {
    if (!sheetValidation?.isValid) return

    setIsImportingSheet(true)

    try {
      // Always get merge mode preview first to show fuzzy matching
      const previewResponse = await fetch(
        `/api/admin/festivals/${festivalId}/import-google-sheet/preview`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            googleSheetUrl,
            mode: 'merge' // Always use merge mode for preview
          })
        }
      )

      if (!previewResponse.ok) {
        const error = await previewResponse.json()
        alert(error.error || 'Failed to load Google Sheets preview')
        setIsImportingSheet(false)
        return
      }

      const previewData = await previewResponse.json()

      // Use CSV preview modal with fuzzy matching (same as CSV import)
      setCSVPreviewData(previewData)
      setShowCSVPreview(true)
      setSelectedMode('merge')
      setIsGoogleSheetsImport(true) // Mark as Google Sheets import
      
    } catch (error) {
      console.error('Error loading Google Sheets preview:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsImportingSheet(false)
    }
  }

  const confirmGoogleSheetsImport = async () => {
    setIsImportingSheet(true)

    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/import-google-sheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          googleSheetUrl,
          mode: selectedGoogleSheetsMode
        })
      })

      const data = await response.json()

      if (data.success) {
        // Refresh festival data
        await fetchFestival()
        setGoogleSheetUrl('')
        setSheetValidation(null)
        setShowGoogleSheetImport(false)
        setShowGoogleSheetsPreview(false)
        
        if (selectedGoogleSheetsMode === 'merge') {
          alert(
            `Smart Merge complete!\n\n` +
            `✓ Updated: ${data.updated} sessions\n` +
            `✓ Created: ${data.created} new sessions\n` +
            `✓ Kept: ${data.kept} sessions with bookings\n` +
            `✓ Deleted: ${data.deleted} empty sessions`
          )
        } else {
          alert(data.message || `Successfully imported ${data.imported} sessions!`)
        }
      } else {
        alert(data.error || 'Failed to import from Google Sheets')
      }
    } catch (error) {
      console.error('Error importing from Google Sheets:', error)
      alert('Network error. Please try again.')
    } finally {
      setIsImportingSheet(false)
    }
  }

  const deleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
      }
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const activeSession = filteredSessions.find((s) => s.id === active.id)
    const overSession = filteredSessions.find((s) => s.id === over.id)

    if (!activeSession || !overSession) {
      return
    }

    // Only allow reordering within the same day and time slot
    if (activeSession.day !== overSession.day || activeSession.startTime !== overSession.startTime) {
      return
    }

    // Get all sessions in the same time slot FROM FILTERED SESSIONS (which are already sorted by displayOrder)
    const sameSlotSessions = filteredSessions.filter(
      s => s.day === activeSession.day && s.startTime === activeSession.startTime
    )

    const oldIndex = sameSlotSessions.findIndex((s) => s.id === active.id)
    const newIndex = sameSlotSessions.findIndex((s) => s.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Reorder within the same slot
    const reorderedSlot = arrayMove(sameSlotSessions, oldIndex, newIndex)
    
    // Assign displayOrder based on position within the slot
    const updatedSlotSessions = reorderedSlot.map((session, index) => ({
      ...session,
      displayOrder: index
    }))

    // Update local state first
    setSessions(prevSessions => {
      const newSessions = [...prevSessions]
      updatedSlotSessions.forEach(updatedSession => {
        const idx = newSessions.findIndex(s => s.id === updatedSession.id)
        if (idx !== -1) {
          newSessions[idx] = updatedSession
        }
      })
      return newSessions
    })

    // Save to backend after state update
    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/sessions/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessions: updatedSlotSessions.map((s, index) => ({
            id: s.id,
            displayOrder: index
          }))
        })
      })
      
      if (!response.ok) {
        // Silently fail - state already updated optimistically
        console.error('Failed to save reorder')
      }
    } catch (error) {
      // Silently fail - state already updated optimistically
      console.error('Error saving reorder:', error)
    }
  }

  const openEditModal = (session?: FestivalSession) => {
    setEditingSession(session || null)
    setShowEditModal(true)
  }

  const handleSaveSession = async (sessionData: any) => {
    try {
      // Clean and validate session data before saving
      const cleanedData = {
        ...sessionData,
        // Prevent "Invalid Date" from being saved - if it's still Invalid Date, the form should have corrected it
        day: sessionData.day === 'Invalid Date' ? 'TBD' : sessionData.day,
        // Ensure times are properly formatted
        startTime: sessionData.startTime || '',
        endTime: sessionData.endTime || ''
      }
      
      const url = cleanedData.id 
        ? `/api/admin/festivals/${festivalId}/sessions/${cleanedData.id}`
        : `/api/admin/festivals/${festivalId}/sessions`
      
      const method = cleanedData.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(cleanedData),
      })

      if (response.ok) {
        // Close modal first for better UX
        setShowEditModal(false)
        setEditingSession(null)
        
        // Force refresh both festival AND sessions data
        await fetchFestival()
      } else {
        // Better error handling
        let errorMessage = 'Unknown error'
        try {
          const errorData = await response.json()
          console.error('Error saving session (status ' + response.status + '):', errorData)
          errorMessage = errorData.error || errorMessage
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          console.error('Response status:', response.status, 'Status text:', response.statusText)
          errorMessage = `Server error (${response.status}): ${response.statusText}`
        }
        alert(`Failed to save session: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Error saving session:', error)
      alert('Error saving session. Please try again.')
    }
  }

  const getAvailableDays = (): Array<{value: string, label: string}> => {
    if (!festival) return []
    
    // Check if dates exist and are valid
    if (!festival.startDate || !festival.endDate) {
      console.warn('Festival missing start or end date')
      return []
    }
    
    // Parse dates as UTC midnight to avoid timezone issues
    const startDate = new Date(festival.startDate + 'T00:00:00.000Z')
    const endDate = new Date(festival.endDate + 'T00:00:00.000Z')
    
    // Check if dates are valid
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid festival dates:', { startDate: festival.startDate, endDate: festival.endDate })
      return []
    }
    
    // Generate dates from festival date range
    const days: Array<{value: string, label: string}> = []
    const currentDate = new Date(startDate)
    
    // Include all days within the festival date range
    while (currentDate.getTime() <= endDate.getTime()) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
      const dateKey = currentDate.toISOString().split('T')[0] // YYYY-MM-DD
      const dateStr = currentDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', timeZone: 'UTC' })
      
      days.push({
        value: dateKey, // Use ISO date as value
        label: `${dayName} (${dateStr})`
      })
      
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    
    return days
  }

  const convertSessionForModal = (session?: FestivalSession) => {
    if (!session) return null
    
    return {
      id: session.id,
      title: session.title,
      description: session.description || '',
      day: session.day,
      startTime: session.startTime,
      endTime: session.endTime,
      teachers: session.teachers.join(', '),
      levels: session.level || '',
      styles: session.styles.join(', '),
      location: session.location || '',
      capacity: session.capacity,
      prerequisites: session.prerequisites || '',
      cardType: session.cardType as 'detailed' | 'minimal' | 'photo',
      displayOrder: session.displayOrder,
      bookingEnabled: session.bookingEnabled,
      bookingCapacity: session.bookingCapacity,
      requirePayment: session.requirePayment,
      price: session.price
    }
  }

  const exportBookingsCSV = () => {
    const csv = [
      ['Session', 'Day', 'Time', 'Names', 'Email', 'Booked At'].join(','),
      ...filteredBookings.map(b => {
        // Fix display of Invalid Date entries
        const displayDay = b.session.day === 'Invalid Date' 
          ? (b.session.startTime ? new Date(b.session.startTime).toLocaleDateString('en-US', { weekday: 'long' }) : 'TBD')
          : b.session.day;
        
        return [
          `"${b.session.title}"`,
          displayDay,
          `${b.session.startTime}-${b.session.endTime}`,
          `"${b.names.join(', ')}"`,
          b.email || 'N/A',
          new Date(b.createdAt).toLocaleString()
        ].join(',')
      })
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${festival?.name}-bookings-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    
    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/bookings/${bookingId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setBookings(prev => prev.filter(b => b.id !== bookingId))
      } else {
        alert('Failed to delete booking')
      }
    } catch (error) {
      console.error('Error deleting booking:', error)
      alert('Failed to delete booking')
    }
  }

  // Helper function to get the effective day for a session
  const getEffectiveDay = (session: FestivalSession): string => {
    // If day is Invalid Date, try to reconstruct from startTime
    if (session.day === 'Invalid Date' && session.startTime) {
      const dateStr = session.startTime.split('T')[0]
      if (dateStr && !isNaN(Date.parse(dateStr))) {
        try {
          const date = new Date(dateStr + 'T12:00:00Z')
          return date.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
        } catch {
          return session.day
        }
      }
    }
    return session.day
  }

  // Filter and sort sessions by festival date order
  const filteredSessions = React.useMemo(() => {
    if (!festival) return sessions
    
    // Filter sessions based on search and day
    const filtered = sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.teachers.some(teacher => teacher.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           session.styles.some(style => style.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           session.level?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.description?.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesDay = selectedDay === 'all' || getEffectiveDay(session) === selectedDay
      
      return matchesSearch && matchesDay
    })
    
    // Sort by day+time, then by displayOrder for parallel sessions
    return filtered.sort((a, b) => {
      // First, sort by day and time
      const dateTimeA = a.day && a.startTime ? `${a.day}T${a.startTime}` : a.day || ''
      const dateTimeB = b.day && b.startTime ? `${b.day}T${b.startTime}` : b.day || ''
      
      if (dateTimeA !== dateTimeB) {
        return dateTimeA.localeCompare(dateTimeB)
      }
      
      // For sessions at the same day+time, sort by displayOrder
      const orderA = a.displayOrder !== null && a.displayOrder !== undefined ? Number(a.displayOrder) : 999999
      const orderB = b.displayOrder !== null && b.displayOrder !== undefined ? Number(b.displayOrder) : 999999
      return orderA - orderB
    })
  }, [sessions, searchTerm, selectedDay, festival])

  // Get unique days sorted by festival date order
  const uniqueDays = React.useMemo(() => {
    if (!festival) return []
    
    // Generate festival day order based on dates
    const festivalDayOrder: string[] = []
    const startDate = new Date(festival.startDate + 'T00:00:00Z')
    const endDate = new Date(festival.endDate + 'T00:00:00Z')
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
      festivalDayOrder.push(dayName)
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    
    // Get unique days from sessions using effective day, and sort by festival order
    return Array.from(new Set(sessions.map(s => getEffectiveDay(s))))
      .filter(day => day && day !== 'Invalid Date' && day.trim() !== '')
      .sort((a, b) => festivalDayOrder.indexOf(a) - festivalDayOrder.indexOf(b))
      .map(dayString => {
        // Check if it's already a day name (like "Friday", "Saturday")
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        if (dayNames.includes(dayString)) {
          return {
            value: dayString,
            label: dayString
          }
        }
      
        // If it's a date string, try to parse it
        const date = new Date(dayString)
        if (!isNaN(date.getTime())) {
          return {
            value: dayString,
            label: date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'short', 
              day: 'numeric' 
            })
          }
        }
      
        // Fallback for invalid dates
        return {
          value: dayString,
          label: dayString || 'Unknown Day'
        }
      })
  }, [sessions, festival])

  // Filter bookings
  const filteredBookings = React.useMemo(() => {
    if (!festival) return bookings
    
    // Generate festival day order based on dates
    const festivalDayOrder: string[] = []
    const startDate = new Date(festival.startDate + 'T00:00:00Z')
    const endDate = new Date(festival.endDate + 'T00:00:00Z')
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
      festivalDayOrder.push(dayName)
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    
    // Filter bookings
    const filtered = bookings.filter(booking => {
      const matchesSearch = bookingSearchTerm === '' || 
        booking.names.some((name: string) => name.toLowerCase().includes(bookingSearchTerm.toLowerCase())) ||
        booking.email?.toLowerCase().includes(bookingSearchTerm.toLowerCase()) ||
        booking.session.title.toLowerCase().includes(bookingSearchTerm.toLowerCase());
      
      const matchesSession = bookingFilterSession === 'all' || booking.session.id === bookingFilterSession;
      
      return matchesSearch && matchesSession;
    })
    
    // Sort by session day order, then by session time, then by booking creation time
    return filtered.sort((a, b) => {
      // First sort by session day
      const dayComparison = festivalDayOrder.indexOf(a.session.day) - festivalDayOrder.indexOf(b.session.day)
      if (dayComparison !== 0) return dayComparison
      
      // Then by session start time
      const timeComparison = a.session.startTime.localeCompare(b.session.startTime)
      if (timeComparison !== 0) return timeComparison
      
      // Finally by booking creation time (most recent first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  }, [bookings, bookingSearchTerm, bookingFilterSession, festival])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading sessions...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          {error.type === 'forbidden' ? (
            <>
              <div className="mb-4">
                <Lock className="w-16 h-16 text-red-500 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
              <p className="text-gray-600 mb-6">{error.message}</p>
            </>
          ) : error.type === 'not-found' ? (
            <>
              <div className="mb-4">
                <Frown className="w-16 h-16 text-gray-400 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Festival Not Found</h1>
              <p className="text-gray-600 mb-6">{error.message}</p>
            </>
          ) : (
            <>
              <div className="mb-4">
                <AlertCircle className="w-16 h-16 text-orange-500 mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
              <p className="text-gray-600 mb-6">{error.message}</p>
            </>
          )}
          <Link href="/dashboard">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (!festival) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Festival Not Found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile: Back button on its own row */}
          <div className="mb-3 sm:hidden">
            <Link href={`/dashboard/festivals/${festival.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Festival
              </Button>
            </Link>
          </div>
          
          {/* Main header content */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="flex items-start gap-4 min-w-0 flex-1">
              <div className="hidden sm:block flex-shrink-0">
                <Link href={`/dashboard/festivals/${festival.id}`}>
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Festival
                  </Button>
                </Link>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">Session Management</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">Manage sessions for {festival.name}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0 overflow-x-auto">
              <Link href={`/${festival.slug}/schedule`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">View Live Schedule</span>
                </Button>
              </Link>
              {activeTab === 'sessions' && (
                <>
                  <Button onClick={exportCSV} variant="outline" size="sm">
                    <Download className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </Button>
                  <Button onClick={() => openEditModal()} size="sm">
                    <Plus className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Session</span>
                  </Button>
                </>
              )}
              {activeTab === 'bookings' && (
                <Button onClick={exportBookingsCSV} variant="outline" size="sm">
                  <Download className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export Bookings</span>
                </Button>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'sessions'
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sessions ({sessions.length})
              {activeTab === 'sessions' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                activeTab === 'bookings'
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Bookings ({bookings.length})
              {activeTab === 'bookings' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'sessions' ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* CSV Upload Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Bulk Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Drag & Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Drop CSV file here
                  </h3>
                  <p className="text-xs text-gray-600 mb-3">
                    or click to browse
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    size="sm"
                  >
                    Select CSV File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Selected File */}
                {selectedFile && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-900 truncate">{selectedFile.name}</span>
                      <button
                        onClick={() => setSelectedFile(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <Button
                      onClick={uploadCSV}
                      disabled={isUploading}
                      className="w-full mt-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {isUploading ? 'Analyzing...' : 'Preview & Upload'}
                    </Button>
                  </div>
                )}

                {/* Upload Tips */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm mb-1">CSV Upload</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Same format as initial setup</li>
                    <li>• Smart Merge preserves bookings</li>
                    <li>• Download current CSV as template</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Google Sheets Import */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3h13l5 5v13H3V3z" fill="#0F9D58"/>
                    <path d="M16 3v5h5" fill="#0F9D58" opacity="0.5"/>
                    <path d="M6 10h12M6 14h12M6 18h8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Google Sheets
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showGoogleSheetImport ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                      Import sessions from a Google Sheets URL
                    </p>
                    <Button
                      onClick={() => setShowGoogleSheetImport(true)}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Import from Google Sheets
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Google Sheets URL
                      </label>
                      <input
                        type="url"
                        value={googleSheetUrl}
                        onChange={(e) => {
                          setGoogleSheetUrl(e.target.value)
                          setSheetValidation(null)
                        }}
                        placeholder="https://docs.google.com/spreadsheets/d/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      />
                    </div>

                    {sheetValidation && (
                      <div className={`p-3 rounded-lg text-sm ${
                        sheetValidation.isValid 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        {sheetValidation.isValid ? (
                          <div className="flex items-start gap-2 text-green-800">
                            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Sheet validated!</p>
                              <p className="text-xs mt-1">
                                Found {sheetValidation.sessionCount} sessions
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-2 text-red-800">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium">Validation failed</p>
                              <p className="text-xs mt-1">{sheetValidation.error}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        onClick={validateGoogleSheet}
                        disabled={isValidatingSheet || !googleSheetUrl.trim()}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        {isValidatingSheet ? 'Validating...' : 'Validate'}
                      </Button>
                      <Button
                        onClick={() => importFromGoogleSheet()}
                        disabled={!sheetValidation?.isValid || isImportingSheet}
                        size="sm"
                        className="flex-1"
                      >
                        {isImportingSheet ? 'Loading...' : 'Preview & Import'}
                      </Button>
                    </div>

                    <Button
                      onClick={() => {
                        setShowGoogleSheetImport(false)
                        setGoogleSheetUrl('')
                        setSheetValidation(null)
                      }}
                      variant="ghost"
                      size="sm"
                      className="w-full text-gray-600"
                    >
                      Cancel
                    </Button>

                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 text-sm mb-1">Important</h4>
                      <ul className="text-xs text-yellow-800 space-y-1">
                        <li>• Sheet must be publicly accessible</li>
                        <li>• Use same format as CSV template</li>
                        <li>• Share with "Anyone with the link can view"</li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-base">Session Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sessions</span>
                  <span className="font-semibold">{sessions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Days</span>
                  <span className="font-semibold">{uniqueDays.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unique Teachers</span>
                  <span className="font-semibold">
                    {Array.from(new Set(sessions.flatMap(s => s.teachers))).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Bookings</span>
                  <span className="font-semibold text-green-600">
                    {bookings.reduce((sum, booking) => {
                      const names = booking.participantName?.split(',').map((n: string) => n.trim()).filter(Boolean) || []
                      return sum + names.length
                    }, 0)}
                  </span>
                </div>
                
                {festival && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Festival Dates</span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(festival.startDate).toLocaleDateString()} - {new Date(festival.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      Sessions can be added for any day in this range
                    </p>
                    
                    {/* Debug info - remove this later */}
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                      <p><strong>Debug Info:</strong></p>
                      <p>Raw dates: {festival.startDate} to {festival.endDate}</p>
                      <p>Available days: {getAvailableDays().length}</p>
                      <p>Days: {getAvailableDays().map(d => d.label).join(', ')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sessions Table */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by title, teacher, style, level, location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Days</option>
                  {uniqueDays.map(day => (
                    <option key={day.value} value={day.value}>{day.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sessions Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Sessions ({filteredSessions.length})</span>
                  {sessions.length === 0 && (
                    <Button onClick={() => openEditModal()} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Session
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Date Range Warning Banner */}
                {outOfRangeSessions.length > 0 && showDateWarningBanner && festival && (
                  <div className="mb-4 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-amber-900">
                          {outOfRangeSessions.length} session{outOfRangeSessions.length !== 1 ? 's' : ''} outside festival range
                        </p>
                        <p className="text-xs text-amber-800 mt-1">
                          These sessions have dates outside your festival period (
                          {new Date(festival.startDate).toLocaleDateString()} - {new Date(festival.endDate).toLocaleDateString()}
                          ). Click on the warning icons to review and fix.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDateWarningBanner(false)}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {filteredSessions.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {sessions.length === 0 ? 'No sessions yet' : 'No sessions match your filters'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {sessions.length === 0 
                        ? 'Upload a CSV file or add sessions individually to get started.'
                        : 'Try adjusting your search terms or day filter.'
                      }
                    </p>
                    {sessions.length === 0 && (
                      <Button onClick={() => openEditModal()}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Your First Session
                      </Button>
                    )}
                  </div>
                ) : (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="w-8"></th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Session</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Day & Time</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Teachers</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Level</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Styles</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Bookings</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <SortableContext
                            items={filteredSessions.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            {filteredSessions.map((session) => (
                              <SortableSessionRow
                                key={session.id}
                                session={session}
                                festival={festival}
                                bookings={bookings}
                                onEdit={openEditModal}
                                onDelete={deleteSession}
                                onViewBookings={(sessionId) => {
                                  setBookingFilterSession(sessionId)
                                  setActiveTab('bookings')
                                }}
                              />
                            ))}
                          </SortableContext>
                        </tbody>
                      </table>
                    </div>
                  </DndContext>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        ) : (
          /* Bookings Tab Content */
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Search by name, email, or session..."
                value={bookingSearchTerm}
                onChange={(e) => setBookingSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
              <select
                value={bookingFilterSession}
                onChange={(e) => setBookingFilterSession(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent min-w-[250px]"
              >
                <option value="all">All Sessions ({bookings.length})</option>
                {Array.from(new Set(bookings.map(b => b.session.id))).map(sessionId => {
                  const booking = bookings.find(b => b.session.id === sessionId)!
                  const count = bookings.filter(b => b.session.id === sessionId).length
                  return (
                    <option key={sessionId} value={sessionId}>
                      {booking.session.title} ({count})
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Bookings Table */}
            {filteredBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No bookings found</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day & Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendees</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booked At</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredBookings.map((booking: any) => (
                          <tr key={booking.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{booking.session.title}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {booking.session.day === 'Invalid Date' 
                                  ? (booking.session.startTime ? new Date(booking.session.startTime).toLocaleDateString('en-US', { weekday: 'long' }) : 'TBD')
                                  : booking.session.day}
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.session.startTime.substring(0, 5)} - {booking.session.endTime.substring(0, 5)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-wrap gap-2">
                                {booking.names.map((name: string, idx: number) => (
                                  <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {name}
                                  </span>
                                ))}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {booking.names.length} spot{booking.names.length !== 1 ? 's' : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{booking.email || <span className="text-gray-400 italic">No email</span>}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{new Date(booking.createdAt).toLocaleDateString()}</div>
                              <div className="text-sm text-gray-500">
                                {new Date(booking.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <button
                                onClick={() => handleDeleteBooking(booking.id)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Session Edit Modal */}
      <SessionEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditingSession(null)
        }}
        session={convertSessionForModal(editingSession || undefined)}
        festivalId={festivalId}
        onSave={handleSaveSession}
        availableDays={getAvailableDays()}
        festivalDateRange={festival ? { startDate: festival.startDate, endDate: festival.endDate } : undefined}
      />

      {/* CSV Upload Preview Modal */}
      {showCSVPreview && csvPreviewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {isGoogleSheetsImport ? 'Google Sheets Import Preview' : 'CSV Upload Preview'}
                </h2>
                <button
                  onClick={() => {
                    setShowCSVPreview(false)
                    setCSVPreviewData(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Statistics */}
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">📊 Upload Summary</h3>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>• CSV contains: <strong>{csvPreviewData.csvSessionCount} sessions</strong></p>
                  <p>• Current database: <strong>{csvPreviewData.currentSessionCount} sessions</strong></p>
                  {csvPreviewData.sessionsWithBookingsCount > 0 && (
                    <p className="text-orange-600 font-medium">
                      • ⚠️ {csvPreviewData.sessionsWithBookingsCount} sessions have {csvPreviewData.totalBookings} total bookings
                    </p>
                  )}
                </div>
              </div>

              {/* Exact Matches with Changes - User Confirmation Required */}
              {csvPreviewData.mergePreview.exactMatchesWithChanges && csvPreviewData.mergePreview.exactMatchesWithChanges.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-gray-900">
                      {csvPreviewData.mergePreview.exactMatchesWithChanges.length} Sessions With Changes
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    These sessions match by day, time, and title but have field changes. Review and confirm each update:
                  </p>
                  <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    {csvPreviewData.mergePreview.exactMatchesWithChanges.map((match: any, idx: number) => (
                      <div key={idx} className="p-4 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{match.dbSession.title}</p>
                            <p className="text-sm text-gray-600">{match.dbSession.day}, {match.dbSession.startTime}</p>
                            
                            <div className="mt-2">
                              <span className="text-xs font-semibold text-gray-500 uppercase">Changes:</span>
                              <ul className="mt-1 space-y-0.5 text-sm text-gray-700">
                                {match.changes.map((change: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-blue-600">→</span>
                                    <span>{change}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setSuggestedMatchDecisions(prev => ({ ...prev, [match.dbSession.id]: 'update' }))}
                              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                suggestedMatchDecisions[match.dbSession.id] === 'update'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Apply Changes
                            </button>
                            <button
                              onClick={() => setSuggestedMatchDecisions(prev => ({ ...prev, [match.dbSession.id]: 'skip' }))}
                              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                suggestedMatchDecisions[match.dbSession.id] === 'skip'
                                  ? 'bg-gray-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Keep Current
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exact Matches without Changes */}
              {csvPreviewData.mergePreview.exactMatches > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">
                      {csvPreviewData.mergePreview.exactMatches - (csvPreviewData.mergePreview.exactMatchesWithChanges?.length || 0)} Sessions Unchanged
                    </h4>
                  </div>
                  <p className="text-sm text-green-700">
                    These sessions match perfectly and won't be modified.
                  </p>
                </div>
              )}

              {/* Suggested Matches */}
              {csvPreviewData.mergePreview.suggestedMatches && csvPreviewData.mergePreview.suggestedMatches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <h4 className="font-semibold text-gray-900">
                      {csvPreviewData.mergePreview.suggestedMatches.length} Potential Matches Found
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Review these potential matches and choose whether to update existing sessions or create new ones:
                  </p>
                  <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                    {csvPreviewData.mergePreview.suggestedMatches.map((match: any, idx: number) => (
                      <div key={idx} className="p-4 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="mb-2">
                              <span className="text-xs font-semibold text-gray-500 uppercase">CSV Session</span>
                              <p className="font-medium text-gray-900">{match.csvSession.title}</p>
                              <p className="text-sm text-gray-600">{match.csvSession.day}, {match.csvSession.startTime} - {match.csvSession.endTime}</p>
                            </div>
                            <div className="flex items-center gap-2 my-2">
                              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded">
                                {match.matchReason}
                              </span>
                            </div>
                            <div className="mb-2">
                              <span className="text-xs font-semibold text-gray-500 uppercase">Database Session</span>
                              <p className="font-medium text-gray-900">{match.dbSession.title}</p>
                              <p className="text-sm text-gray-600">
                                {match.dbSession.day}, {match.dbSession.startTime} - {match.dbSession.endTime}
                                {match.dbSession.bookings > 0 && (
                                  <span className="ml-2 text-orange-600 font-medium">
                                    • {match.dbSession.participants} booking(s)
                                  </span>
                                )}
                              </p>
                            </div>
                            {match.changes.length > 0 && (
                              <div className="mt-2">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Changes:</span>
                                <ul className="text-sm text-gray-700 mt-1 space-y-0.5">
                                  {match.changes.map((change: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="text-gray-400">→</span>
                                      <span>{change}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setSuggestedMatchDecisions(prev => ({ ...prev, [match.dbSession.id]: 'update' }))}
                              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                suggestedMatchDecisions[match.dbSession.id] === 'update'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Update
                            </button>
                            <button
                              onClick={() => setSuggestedMatchDecisions(prev => ({ ...prev, [match.dbSession.id]: 'create' }))}
                              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                suggestedMatchDecisions[match.dbSession.id] === 'create'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              Create New
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Sessions */}
              {csvPreviewData.mergePreview.toCreate > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">
                      {csvPreviewData.mergePreview.toCreate} New Sessions
                    </h4>
                  </div>
                  <p className="text-sm text-blue-700">
                    These sessions will be created (no match found in database).
                  </p>
                </div>
              )}

              {/* Kept Sessions */}
              {csvPreviewData.mergePreview.toKeep > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-600">📌</span>
                    <h4 className="font-semibold text-gray-900">
                      {csvPreviewData.mergePreview.toKeep} Sessions Preserved
                    </h4>
                  </div>
                  <p className="text-sm text-gray-700">
                    Existing sessions with bookings not in CSV will be kept.
                  </p>
                </div>
              )}

              {/* Warning about bookings - only show for Replace All mode */}
              {selectedMode === 'replace' && csvPreviewData.sessionsWithBookingsCount > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 mb-2">⚠️ Warning: Replace All Mode</h4>
                      <p className="text-sm text-orange-800 mb-3">
                        This will DELETE all {csvPreviewData.currentSessionCount} sessions and {csvPreviewData.totalBookings} bookings!
                      </p>
                      <div className="space-y-1 text-sm text-orange-700">
                        {csvPreviewData.sessionsWithBookings.map((s: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                            <span>{s.title} ({s.day}, {s.time}) - {s.participants} participant(s)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode Selection */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-gray-900">Choose Upload Strategy:</h3>
                
                {/* Smart Merge Option */}
                <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMode === 'merge'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="uploadMode"
                      value="merge"
                      checked={selectedMode === 'merge'}
                      onChange={() => setSelectedMode('merge')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">Smart Merge</span>
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          Recommended
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Update existing sessions and add new ones - never delete anything</p>
                    </div>
                  </div>
                </label>

                {/* Replace All Option */}
                <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedMode === 'replace'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="uploadMode"
                      value="replace"
                      checked={selectedMode === 'replace'}
                      onChange={() => setSelectedMode('replace')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">Replace All</span>
                        {csvPreviewData.sessionsWithBookingsCount > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                            ⚠️ Danger
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Delete everything and upload CSV as complete schedule</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t">
                {selectedMode === 'merge' && (() => {
                  const sessionsWithChanges = csvPreviewData.mergePreview.exactMatchesWithChanges || [];
                  const suggestedMatches = csvPreviewData.mergePreview.suggestedMatches || [];
                  
                  const undecidedExactMatches = sessionsWithChanges.filter(
                    (match: any) => !suggestedMatchDecisions[match.dbSession.id]
                  );
                  
                  const undecidedSuggested = suggestedMatches.filter(
                    (match: any) => !suggestedMatchDecisions[match.dbSession.id]
                  );
                  
                  const totalUndecided = undecidedExactMatches.length + undecidedSuggested.length;
                  
                  if (totalUndecided > 0) {
                    return (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-yellow-800">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          <span>
                            Please review and decide on {totalUndecided} session{totalUndecided !== 1 ? 's' : ''} before merging
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
                
                <div className="flex items-center justify-end gap-3">
                  <Button
                    onClick={() => {
                      setShowCSVPreview(false)
                      setCSVPreviewData(null)
                    }}
                    variant="outline"
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmUpload}
                    disabled={
                      isUploading || 
                      (selectedMode === 'merge' && (() => {
                        // For merge mode, check if all sessions with changes have decisions
                        const sessionsWithChanges = csvPreviewData.mergePreview.exactMatchesWithChanges || [];
                        const suggestedMatches = csvPreviewData.mergePreview.suggestedMatches || [];
                        
                        // Check if all exact matches with changes have been decided
                        const undecidedExactMatches = sessionsWithChanges.filter(
                          (match: any) => !suggestedMatchDecisions[match.dbSession.id]
                        );
                        
                        // Check if all suggested matches have been decided
                        const undecidedSuggested = suggestedMatches.filter(
                          (match: any) => !suggestedMatchDecisions[match.dbSession.id]
                        );
                        
                        return undecidedExactMatches.length > 0 || undecidedSuggested.length > 0;
                      })())
                    }
                    className={selectedMode === 'replace' ? 'bg-red-600 hover:bg-red-700' : ''}
                  >
                    {isUploading ? (
                      'Uploading...'
                    ) : selectedMode === 'merge' ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Merge Safely
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 mr-2" />
                        I Understand, Replace All
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets Preview Modal */}
      {showGoogleSheetsPreview && googleSheetsPreviewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Preview Google Sheets Import
              </h3>

              {/* Statistics */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-900 text-sm mb-2">Import Overview</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-blue-700">Sessions in Google Sheet:</span>
                    <span className="font-bold ml-2">{googleSheetsPreviewData.sheetSessionCount}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">Current sessions:</span>
                    <span className="font-bold ml-2">{googleSheetsPreviewData.currentSessionCount}</span>
                  </div>
                  {googleSheetsPreviewData.sessionsWithBookings > 0 && (
                    <div className="col-span-2">
                      <span className="text-orange-700">⚠️ Sessions with bookings:</span>
                      <span className="font-bold ml-2">
                        {googleSheetsPreviewData.sessionsWithBookings} ({googleSheetsPreviewData.totalBookings} participants)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Bookings Warning */}
              {googleSheetsPreviewData.totalBookings > 0 && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-orange-900 text-sm">Active Bookings Detected</h4>
                      <p className="text-sm text-orange-800 mt-1">
                        You have {googleSheetsPreviewData.totalBookings} active bookings. 
                        We recommend using Smart Merge to preserve these bookings.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode Selection */}
              <h4 className="font-semibold text-gray-900 mb-3">Choose Import Mode</h4>
              <div className="space-y-3 mb-6">
                {/* Smart Merge Option */}
                <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedGoogleSheetsMode === 'merge'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="googleSheetsMode"
                      value="merge"
                      checked={selectedGoogleSheetsMode === 'merge'}
                      onChange={() => setSelectedGoogleSheetsMode('merge')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">Smart Merge</span>
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          ✓ Recommended
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Intelligently sync without losing bookings</p>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-2 text-green-700">
                          <Check className="w-4 h-4" />
                          <span>Update {googleSheetsPreviewData.mergePreview.toUpdate} matching sessions</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <Check className="w-4 h-4" />
                          <span>Create {googleSheetsPreviewData.mergePreview.toCreate} new sessions</span>
                        </div>
                        <div className="flex items-center gap-2 text-green-700">
                          <Check className="w-4 h-4" />
                          <span>Keep {googleSheetsPreviewData.mergePreview.toKeep} sessions with bookings</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Check className="w-4 h-4" />
                          <span>Delete {googleSheetsPreviewData.mergePreview.toDelete} empty sessions not in sheet</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Replace All Option */}
                <label className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedGoogleSheetsMode === 'replace'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="googleSheetsMode"
                      value="replace"
                      checked={selectedGoogleSheetsMode === 'replace'}
                      onChange={() => setSelectedGoogleSheetsMode('replace')}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">Replace All</span>
                        {googleSheetsPreviewData.sessionsWithBookings > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                            ⚠️ Warning
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Delete everything and start fresh</p>
                      {googleSheetsPreviewData.sessionsWithBookings > 0 ? (
                        <p className="text-sm text-red-600 font-medium">
                          ⚠️ This will DELETE all {googleSheetsPreviewData.currentSessionCount} existing sessions 
                          and {googleSheetsPreviewData.totalBookings} bookings!
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Delete all {googleSheetsPreviewData.currentSessionCount} sessions and import {googleSheetsPreviewData.sheetSessionCount} new ones
                        </p>
                      )}
                    </div>
                  </div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button
                  onClick={() => {
                    setShowGoogleSheetsPreview(false)
                    setGoogleSheetsPreviewData(null)
                  }}
                  variant="outline"
                  disabled={isImportingSheet}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmGoogleSheetsImport}
                  disabled={isImportingSheet}
                  className={selectedGoogleSheetsMode === 'replace' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  {isImportingSheet ? (
                    'Importing...'
                  ) : selectedGoogleSheetsMode === 'merge' ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Merge Safely
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 mr-2" />
                      I Understand, Replace All
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}