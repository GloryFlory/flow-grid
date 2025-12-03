'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Upload,
  Download,
  Eye,
  Info,
  ExternalLink,
  FileText,
  Image,
  Users,
  MapPin,
  Loader2
} from 'lucide-react'

type Step = 'basic' | 'schedule' | 'preview'

interface ParsedSession {
  id: string
  day: string
  start: string
  end: string
  title: string
  level: string
  capacity?: number
  types: string
  cardType: 'minimal' | 'photo' | 'detailed'
  teachers: string
  location: string
  description: string
  prerequisites: string
}

export default function CreateFestivalPage() {
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  
  // Plan/subscription state for limiting publishing
  const [planInfo, setPlanInfo] = useState<{
    plan: string
    festivalsLimit: number
    activeFestivals: number
    canPublish: boolean
  } | null>(null)
  
  // Location/timezone detection state
  const [isDetectingLocation, setIsDetectingLocation] = useState(true) // Start true - detecting on load
  const [isDetectingTimezone, setIsDetectingTimezone] = useState(false)
  const [showLocationEditor, setShowLocationEditor] = useState(false)
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null)
  const locationDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Form state
  const [festivalData, setFestivalData] = useState({
    name: '',
    description: '',
    slug: '',
    startDate: '',
    endDate: '',
    timezone: '',
    location: ''
  })
  
  // Fetch plan info on mount
  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        const response = await fetch('/api/user/subscription')
        if (response.ok) {
          const data = await response.json()
          const totalFestivals = data.activeFestivals || 0
          const festivalsLimit = data.subscription?.festivalsLimit || 1
          setPlanInfo({
            plan: data.subscription?.plan || 'FREE',
            festivalsLimit,
            activeFestivals: totalFestivals,
            canPublish: totalFestivals < festivalsLimit // Actually means canCreate now
          })
        } else {
          // API returned error - allow creation, limit will be enforced server-side
          setPlanInfo({ plan: 'FREE', festivalsLimit: 1, activeFestivals: 0, canPublish: true })
        }
      } catch (error) {
        console.error('Error fetching plan info:', error)
        // Network error - allow creation, limit will be enforced server-side
        setPlanInfo({ plan: 'FREE', festivalsLimit: 1, activeFestivals: 0, canPublish: true })
      }
    }
    fetchPlanInfo()
  }, [])
  
  // Auto-detect location and timezone on mount using browser geolocation
  useEffect(() => {
    const detectLocationAndTimezone = async () => {
      // First, set timezone from browser as fallback
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
      setFestivalData(prev => ({ ...prev, timezone: userTimezone || 'America/New_York' }))
      
      // Try to get location from browser geolocation
      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 300000 // Cache for 5 minutes
            })
          })
          
          // Reverse geocode to get city name
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=en`
          )
          
          if (response.ok) {
            const data = await response.json()
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality
            const country = data.address?.country
            
            if (city && country) {
              const locationString = `${city}, ${country}`
              setDetectedLocation(locationString)
              setFestivalData(prev => ({ ...prev, location: locationString }))
              
              // Also detect timezone from this location
              const tzResponse = await fetch(`/api/timezone/detect?location=${encodeURIComponent(locationString)}`)
              if (tzResponse.ok) {
                const tzData = await tzResponse.json()
                if (tzData.found && tzData.timezone) {
                  setFestivalData(prev => ({ ...prev, timezone: tzData.timezone.id }))
                }
              }
            }
          }
        } catch (error) {
          // Geolocation failed or denied - that's fine, we have the browser timezone as fallback
          console.log('Geolocation not available or denied, using browser timezone')
        }
      }
      
      setIsDetectingLocation(false)
    }
    
    detectLocationAndTimezone()
  }, [])
  
  // Detect timezone from location when user types
  const detectTimezone = useCallback(async (location: string) => {
    if (!location || location.trim().length < 3) {
      return
    }

    setIsDetectingTimezone(true)
    try {
      const response = await fetch(`/api/timezone/detect?location=${encodeURIComponent(location)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.found && data.timezone) {
          // Auto-apply the timezone (no manual "Apply" button needed)
          setFestivalData(prev => ({ ...prev, timezone: data.timezone.id }))
          if (data.displayName) {
            setDetectedLocation(data.displayName)
          }
        }
      }
    } catch (error) {
      console.error('Error detecting timezone:', error)
    } finally {
      setIsDetectingTimezone(false)
    }
  }, [])

  // Handle location change with debounce
  const handleLocationChange = (value: string) => {
    setFestivalData(prev => ({ ...prev, location: value }))
    
    // Clear previous timeout
    if (locationDebounceRef.current) {
      clearTimeout(locationDebounceRef.current)
    }
    
    // Debounce the timezone detection (800ms delay)
    locationDebounceRef.current = setTimeout(() => {
      detectTimezone(value)
    }, 800)
  }

  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [sessions, setSessions] = useState<ParsedSession[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isParsingCsv, setIsParsingCsv] = useState(false)
  const [slugValidation, setSlugValidation] = useState({ isChecking: false, isAvailable: true, message: '' })
  const [slugHint, setSlugHint] = useState<string | null>(null)
  
  // Google Sheets state
  const [googleSheetUrl, setGoogleSheetUrl] = useState('')
  const [isValidatingSheet, setIsValidatingSheet] = useState(false)
  const [sheetValidation, setSheetValidation] = useState<{
    isValid: boolean
    message: string
    sessionCount?: number
  } | null>(null)
  
  // Quick create state
  const [skipSessions, setSkipSessions] = useState(false)

  const steps = [
    { id: 'basic', title: 'Event Details', description: 'Basic information about your event' },
    { id: 'schedule', title: 'Schedule Setup', description: 'Upload your CSV and configure display' },
    { id: 'preview', title: 'Preview & Publish', description: 'Review and launch your event' }
  ]

  const currentStepIndex = steps.findIndex(step => step.id === currentStep)

  // Debug state changes
  useEffect(() => {
    console.log('State updated - festivalData:', festivalData)
  }, [festivalData])

  useEffect(() => {
    console.log('State updated - sessions:', sessions, 'length:', sessions.length)
  }, [sessions])

  useEffect(() => {
    console.log('Current step changed to:', currentStep)
  }, [currentStep])

  // Debounced slug validation
  useEffect(() => {
    if (!festivalData.slug) {
      setSlugValidation({ isChecking: false, isAvailable: true, message: '' })
      return
    }

    const timer = setTimeout(async () => {
      setSlugValidation({ isChecking: true, isAvailable: true, message: 'Checking availability...' })
      
      try {
        const response = await fetch(`/api/festivals/check-slug?slug=${encodeURIComponent(festivalData.slug)}`)
        const data = await response.json()
        
        if (response.ok) {
          setSlugValidation({
            isChecking: false,
            isAvailable: data.available,
            message: data.available ? '✓ Slug is available' : '✗ This slug is already taken'
          })
        } else {
          setSlugValidation({
            isChecking: false,
            isAvailable: false,
            message: 'Error checking slug availability'
          })
        }
      } catch (error) {
        console.error('Error checking slug:', error)
        setSlugValidation({
          isChecking: false,
          isAvailable: false,
          message: 'Error checking slug availability'
        })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [festivalData.slug])

  const handleBasicSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('=== HANDLE BASIC SUBMIT ===')
    console.log('festivalData before submit:', festivalData)
    
    // Check slug availability before proceeding
    if (!slugValidation.isAvailable) {
      alert('Please choose a different slug. This one is already taken.')
      return
    }
    
    // Generate slug from name if not provided
    if (!festivalData.slug && festivalData.name) {
      const slug = festivalData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      console.log('Generated slug:', slug)
      setFestivalData(prev => ({ ...prev, slug }))
    }
    
    console.log('Moving to schedule step')
    setCurrentStep('schedule')
  }

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCsvFile(file)
    setIsParsingCsv(true)
    setCsvErrors([])
    
    // Clear Google Sheets data when CSV is uploaded
    setGoogleSheetUrl('')
    setSheetValidation(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      delimiter: '', // Auto-detect delimiter (supports both comma and semicolon)
      complete: (results) => {
        const errors: string[] = []
        const parsedSessions: ParsedSession[] = []

        // Helper function to parse various date formats and normalize to YYYY-MM-DD
        const parseDate = (dateStr: string): string => {
          if (!dateStr || dateStr.trim() === '') return ''
          
          const trimmed = dateStr.trim()
          
          // Already in YYYY-MM-DD format
          if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed
          }
          
          // DD/MM/YYYY or DD-MM-YYYY format (European)
          if (/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4}$/.test(trimmed)) {
            const parts = trimmed.split(/[\/\-]/)
            const day = parts[0].padStart(2, '0')
            const month = parts[1].padStart(2, '0')
            const year = parts[2]
            return `${year}-${month}-${day}`
          }
          
          // MM/DD/YYYY format (American) - harder to distinguish, we prioritize European
          // Users should use YYYY-MM-DD for unambiguous dates
          
          return trimmed // Return as-is if we can't parse it
        }

        results.data.forEach((row: any, index: number) => {
          // Support both 'day' and 'date' column names
          const dateValue = row.day || row.date || ''
          
          // Validate required fields
          if (!row.title || !dateValue || !row.start || !row.end) {
            errors.push(`Row ${index + 1}: Missing required fields (title, day/date, start, end)`)
            return
          }

          // Validate CardType
          const cardTypeRaw = row.CardType?.toLowerCase().trim() || ''
          const validCardType: 'minimal' | 'photo' | 'detailed' = ['minimal', 'photo', 'detailed'].includes(cardTypeRaw) 
            ? (cardTypeRaw as 'minimal' | 'photo' | 'detailed')
            : 'detailed'
          
          // Log for debugging
          if (index < 3) {
            console.log(`Row ${index}: CardType="${row.CardType}" → raw="${cardTypeRaw}" → valid="${validCardType}"`)
          }
          
          if (cardTypeRaw && !['minimal', 'photo', 'detailed', ''].includes(cardTypeRaw)) {
            errors.push(`Row ${index + 1}: Invalid CardType "${row.CardType}". Must be "minimal", "photo", or "detailed" (or leave empty for default "detailed")`)
          }

          // Parse the date (supports day or date column, and various formats)
          const parsedDate = parseDate(dateValue)

          parsedSessions.push({
            id: row.id || `session-${index}`,
            day: parsedDate !== 'Invalid Date' ? parsedDate : '',
            start: row.start || '',
            end: row.end || '',
            title: row.title || '',
            level: row.level || '',
            capacity: row.capacity ? parseInt(row.capacity) : undefined,
            types: row.types || '',
            cardType: validCardType,
            teachers: row.teachers || '',
            location: row.location || '',
            description: row.Description || '',
            prerequisites: row.Prerequisites || ''
          })
        })

        setSessions(parsedSessions)
        setCsvErrors(errors)
        setIsParsingCsv(false)
        
        console.log('CSV parsing complete - parsed sessions:', parsedSessions)
        console.log('CSV errors:', errors)
      },
      error: (error) => {
        setCsvErrors([`CSV parsing error: ${error.message}`])
        setIsParsingCsv(false)
      }
    })
  }

  const downloadCsvTemplate = () => {
    // Use semicolon delimiter for Windows Excel compatibility
    // Note: Using semicolon (;) instead of comma (,) because Excel on Windows expects this format
    // Column 'day' expects YYYY-MM-DD format (e.g., 2025-11-28) or DD/MM/YYYY
    const csvContent = `id;day;start;end;title;level;capacity;types;CardType;teachers;location;Description;Prerequisites
1;2025-11-28;08:00;09:00;Registration & Check-in;;50;Logistics;minimal;;Main Entrance;Welcome and registration desk;Event ticket required
2;2025-11-28;09:00;10:30;Opening Keynote;;200;Presentation;photo;Dr. Sarah Chen;Main Auditorium;Welcome address and event overview;
3;2025-11-28;11:00;12:30;Workshop: Creative Writing;Beginner;25;Workshop;detailed;Alex Rivera;Room 101;Hands-on writing workshop exploring narrative techniques;Notebook and pen recommended
4;2025-11-28;13:00;14:00;Lunch Break;;80;Break;minimal;;Garden Terrace;Catered lunch and networking time;
5;2025-11-28;14:30;16:00;Panel Discussion;Intermediate;40;Panel;photo;Maria Lopez, John Smith;Conference Room;Industry experts discuss current trends;Basic familiarity with topic helpful
6;2025-11-28;16:30;17:30;Networking Session;;60;Social;minimal;;Lobby;Informal networking and refreshments;
7;2025-11-29;08:30;09:30;Morning Meditation;;30;Wellness;photo;Emma Thompson;Quiet Room;Guided meditation to start the day;Comfortable clothing suggested
8;2025-11-29;10:00;12:00;Advanced Masterclass;Advanced;15;Masterclass;detailed;Prof. David Kim;Studio;Deep dive into advanced techniques;Previous experience required
9;2025-11-29;13:00;14:00;Lunch Break;;80;Break;minimal;;Dining Hall;Lunch and informal discussions;
10;2025-11-29;15:00;16:00;Closing Ceremony;;100;Community;minimal;;Main Hall;Wrap-up and thank you remarks;`

    // Add UTF-8 BOM for Excel compatibility (helps Excel recognize UTF-8 encoding)
    const BOM = '\uFEFF'
    const csvWithBom = BOM + csvContent

    const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${festivalData.slug || 'festival'}-template.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleGoogleSheetValidation = async () => {
    if (!googleSheetUrl.trim()) {
      setSheetValidation({ isValid: false, message: 'Please enter a Google Sheets URL' })
      return
    }

    setIsValidatingSheet(true)
    setSheetValidation(null)
    setCsvErrors([])

    try {
      const response = await fetch('/api/festivals/validate-google-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleSheetUrl })
      })

      const data = await response.json()

      if (response.ok && data.isValid) {
        const warnings: string[] = []
        
        // Map Google Sheets sessions to ParsedSession format and validate CardType
        const parsedSessions: ParsedSession[] = data.sessions.map((session: any, index: number) => {
          // Validate CardType
          const cardTypeRaw = session.cardType?.toLowerCase().trim() || ''
          const validCardType: 'minimal' | 'photo' | 'detailed' = ['minimal', 'photo', 'detailed'].includes(cardTypeRaw)
            ? (cardTypeRaw as 'minimal' | 'photo' | 'detailed')
            : 'detailed'
          
          // Log for debugging
          if (index < 3) {
            console.log(`Google Row ${index}: CardType="${session.cardType}" → raw="${cardTypeRaw}" → valid="${validCardType}"`)
          }
          
          if (cardTypeRaw && !['minimal', 'photo', 'detailed', ''].includes(cardTypeRaw)) {
            warnings.push(`Row ${index + 1}: Invalid CardType "${session.cardType}". Using default "detailed"`)
          }
          
          return {
            id: `google-${index}`,
            day: session.day || '',
            start: session.start || '',
            end: session.end || '',
            title: session.title || '',
            level: session.level || '',
            capacity: session.capacity || undefined,
            types: session.types || '',
            cardType: validCardType,
            teachers: session.teachers || '',
            location: session.location || '',
            description: session.description || '',
            prerequisites: session.prerequisites || ''
          }
        })

        setSessions(parsedSessions)
        setCsvFile(null) // Clear CSV file if Google Sheets is used
        setCsvErrors(warnings) // Set warnings if any CardType issues
        
        let message = `✓ Successfully loaded ${data.sessionCount} sessions from Google Sheets`
        if (warnings.length > 0) {
          message += ` (${warnings.length} warnings - check CardType values)`
        }
        
        setSheetValidation({
          isValid: true,
          message,
          sessionCount: data.sessionCount
        })
      } else {
        setSheetValidation({
          isValid: false,
          message: data.error || 'Failed to validate Google Sheets URL'
        })
      }
    } catch (error) {
      console.error('Google Sheets validation error:', error)
      setSheetValidation({
        isValid: false,
        message: 'Failed to connect to Google Sheets. Please check the URL and try again.'
      })
    } finally {
      setIsValidatingSheet(false)
    }
  }

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Allow skipping sessions if user opted to add them later
    if (skipSessions) {
      console.log('User chose to skip sessions - proceeding to preview')
      setCurrentStep('preview')
      return
    }
    
    // Enhanced validation - check if sessions were loaded
    if (sessions.length === 0) {
      alert('No sessions found. Please upload a CSV file, load sessions from Google Sheets, or check "I\'ll add sessions later"')
      return
    }
    
    // Note: We allow csvErrors (warnings) for CardType issues - they default to 'detailed'
    // Only block if there are critical errors (missing required fields)
    const criticalErrors = csvErrors.filter(err => 
      err.includes('Missing required fields') || 
      err.includes('CSV parsing error')
    )
    
    if (criticalErrors.length > 0) {
      alert('Please fix the critical errors before proceeding:\n' + criticalErrors.join('\n'))
      return
    }
    
    // Debug log
    console.log('Moving to preview with:', {
      festivalData,
      sessions: sessions.length,
      csvFile: csvFile?.name,
      googleSheetUrl,
      warnings: csvErrors.length
    })
    
    setCurrentStep('preview')
  }

  const handlePublish = async () => {
    console.log('=== HANDLE PUBLISH START ===')
    console.log('festivalData at start:', festivalData)
    console.log('sessions at start:', sessions)
    console.log('currentStep:', currentStep)
    console.log('===============================')
    
    // Pre-flight validation
    if (!festivalData.name || !festivalData.slug || !festivalData.startDate) {
      alert('Please fill in all required festival details.')
      return
    }
    
    // Allow creating festival without sessions if user chose to skip
    if (sessions.length === 0 && !skipSessions) {
      alert('Please upload and process a CSV file with session data, or check "I\'ll add sessions later" on the previous step.')
      return
    }
    
    setIsLoading(true)
    
    // Debug: log the current state
    console.log('Festival data:', festivalData)
    console.log('Sessions:', sessions)
    console.log('Sessions length:', sessions.length)
    
    try {
      // Build festival date mappings ONCE before mapping sessions
      const startDate = new Date(festivalData.startDate)
      const endDate = new Date(festivalData.endDate)
      
      // Build a complete list of festival dates
      const festivalDates: Date[] = []
      const currentDate = new Date(startDate)
      
      while (currentDate <= endDate) {
        festivalDates.push(new Date(currentDate))
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      // Group dates by day name
      const dayNameToDates: Record<string, Date[]> = {}
      festivalDates.forEach(date => {
        const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
        if (!dayNameToDates[dayName]) {
          dayNameToDates[dayName] = []
        }
        dayNameToDates[dayName].push(date)
      })
      
      // Build a map of which date occurrence each session should use
      // This tracks transitions between different days to properly assign dates
      const sessionDateMap: Record<number, Date> = {}
      const dayNameCounters: Record<string, number> = {}
      let lastSeenDay: string | null = null
      
      sessions.forEach((session, index) => {
        const sessionDayName = session.day
        
        // If we've moved to a different day than the last session, increment the counter for this day
        if (lastSeenDay !== null && lastSeenDay !== sessionDayName) {
          // We've transitioned to a new day, so the next time we see the PREVIOUS day, use the next occurrence
          dayNameCounters[lastSeenDay] = (dayNameCounters[lastSeenDay] || 0) + 1
        }
        
        // Get current occurrence number for this day (defaults to 0 for first occurrence)
        const currentCounter = dayNameCounters[sessionDayName] || 0
        const datesForThisDay = dayNameToDates[sessionDayName] || []
        
        // Assign the date for this session
        const sessionDate = datesForThisDay[currentCounter] || datesForThisDay[datesForThisDay.length - 1] || startDate
        sessionDateMap[index] = sessionDate
        
        lastSeenDay = sessionDayName
      })
      
      // Validation: Check for potential issues
      const dayOccurrenceCounts: Record<string, number> = {}
      Object.values(dayNameCounters).forEach((count, _) => {
        const keys = Object.keys(dayNameCounters)
        keys.forEach(day => {
          dayOccurrenceCounts[day] = (dayNameCounters[day] || 0) + 1
        })
      })
      
      const multiWeekDays = Object.entries(dayOccurrenceCounts)
        .filter(([day, count]) => count > 1 && dayNameToDates[day])
        .map(([day, count]) => `${day} (${count}x)`)
      
      if (multiWeekDays.length > 0) {
        console.log('📅 Multi-week festival detected:', {
          festivalDuration: `${festivalDates.length} days`,
          repeatingDays: multiWeekDays,
          message: 'Sessions with the same day name will be assigned to different weeks based on CSV grouping'
        })
      }
      
      const payload = {
        ...festivalData,
        isPublished: true, // This is for publishing
        sessions: sessions.map((session, index) => {
          // Get the pre-calculated date for this session
          const sessionDate = sessionDateMap[index]
          const sessionDayName = session.day
          const datesForThisDay = dayNameToDates[sessionDayName] || []
          
          // Defensive validation
          if (!datesForThisDay || datesForThisDay.length === 0) {
            console.warn(`⚠️ Session ${index + 1} ("${session.title}"): Day "${sessionDayName}" not found in festival date range (${festivalData.startDate} to ${festivalData.endDate}). Using festival start date as fallback.`)
          }
          
          // Log first few sessions for debugging
          if (index < 3) {
            console.log(`Payload session ${index}: day="${sessionDayName}", date=${sessionDate.toISOString()}`)
          }
          
          return {
            title: session.title,
            description: session.description || '',
            teachers: session.teachers || '',
            teacherBio: '',
            teacherPhoto: '',
            startTime: `${sessionDate.toISOString().split('T')[0]}T${session.start}:00`,
            endTime: `${sessionDate.toISOString().split('T')[0]}T${session.end}:00`,
            duration: calculateDuration(session.start, session.end),
            level: session.level || '',
            maxParticipants: session.capacity || 0, // 0 means unlimited
            currentBookings: 0,
            location: session.location || '',
            requirements: session.prerequisites || '',
            price: 0,
            order: index,
            cardType: session.cardType || 'detailed',
            sessionTypes: session.types || ''
          }
        })
      }
      
      console.log('Payload being sent:', payload)
      
      const response = await fetch('/api/festivals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const festival = await response.json()
        router.push(`/dashboard/festivals/${festival.id}`)
      } else {
        // Try to parse error response
        let errorData: any = {}
        const responseText = await response.text()
        console.error('Raw error response:', responseText)
        
        try {
          errorData = JSON.parse(responseText)
        } catch (e) {
          console.error('Failed to parse error response as JSON')
          errorData = { error: responseText || `HTTP ${response.status}` }
        }
        
        console.error('API Error Response:', errorData)
        console.error('Validation errors details:', JSON.stringify(errorData.details, null, 2))
        console.error('Request payload was:', payload)
        
        // Build a user-friendly error message
        let userMessage = 'Failed to create event. '
        if (errorData.details && Array.isArray(errorData.details)) {
          const fieldErrors = errorData.details.map((d: any) => {
            const field = d.path?.join(' → ') || 'Unknown field'
            return `• ${field}: ${d.message}`
          }).join('\n')
          userMessage += 'Please fix the following:\n\n' + fieldErrors
        } else if (errorData.message) {
          userMessage += errorData.message
        } else if (errorData.error) {
          userMessage += errorData.error
        }
        
        throw new Error(userMessage)
      }
    } catch (error) {
      console.error('Error creating festival:', error)
      if (error instanceof Error) {
        alert(error.message)
      } else {
        alert('An unexpected error occurred. Please try again or contact support.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    console.log('=== HANDLE SAVE DRAFT START ===')
    console.log('festivalData at start:', festivalData)
    console.log('sessions at start:', sessions)
    console.log('currentStep:', currentStep)
    console.log('===============================')
    
    // Pre-flight validation
    if (!festivalData.name || !festivalData.slug) {
      alert('Please fill in at least the festival name.')
      return
    }
    
    setIsLoading(true)
    
    // Debug: log the current state
    console.log('Saving draft - Festival data:', festivalData)
    console.log('Saving draft - Sessions:', sessions)
    
    try {
      const payload = {
        ...festivalData,
        isPublished: false,
        sessions: sessions.map((session, index) => {
          // Map day names to actual dates
          const startDate = new Date(festivalData.startDate)
          const endDate = new Date(festivalData.endDate)
          
          // Create a mapping of day names to dates within the festival range
          const dayToDateMap: Record<string, Date> = {}
          const currentDate = new Date(startDate)
          
          while (currentDate <= endDate) {
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
            if (!dayToDateMap[dayName]) {
              dayToDateMap[dayName] = new Date(currentDate)
            }
            currentDate.setDate(currentDate.getDate() + 1)
          }
          
          // Get the correct date for this session's day
          const sessionDate = dayToDateMap[session.day] || startDate
          
          return {
            title: session.title,
            description: session.description || '',
            teachers: session.teachers || '',
            teacherBio: '',
            teacherPhoto: '',
            startTime: `${sessionDate.toISOString().split('T')[0]}T${session.start}:00`,
            endTime: `${sessionDate.toISOString().split('T')[0]}T${session.end}:00`,
            duration: calculateDuration(session.start, session.end),
            level: session.level || '',
            maxParticipants: session.capacity || 20,
            currentBookings: 0,
            location: session.location || '',
            requirements: session.prerequisites || '',
            price: 0,
            order: index,
            cardType: session.cardType || 'detailed',
            sessionTypes: session.types || ''
          }
        })
      }
      
      console.log('Draft payload being sent:', payload)
      
      const response = await fetch('/api/festivals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const festival = await response.json()
        alert('Festival saved as draft successfully!')
        router.push(`/dashboard/festivals/${festival.id}`)
      } else {
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to save draft`)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      if (error instanceof Error) {
        alert(`Error saving draft: ${error.message}`)
      } else {
        alert('An unexpected error occurred while saving draft.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Save draft and then redirect to pricing (for users at their limit)
  const handleSaveDraftAndUpgrade = async () => {
    // Pre-flight validation
    if (!festivalData.name || !festivalData.slug) {
      alert('Please fill in at least the festival name.')
      return
    }
    
    setIsLoading(true)
    
    try {
      const payload = {
        ...festivalData,
        isPublished: false,
        sessions: sessions.map((session, index) => {
          const startDate = new Date(festivalData.startDate)
          const endDate = new Date(festivalData.endDate)
          const dayToDateMap: Record<string, Date> = {}
          const currentDate = new Date(startDate)
          
          while (currentDate <= endDate) {
            const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long' })
            if (!dayToDateMap[dayName]) {
              dayToDateMap[dayName] = new Date(currentDate)
            }
            currentDate.setDate(currentDate.getDate() + 1)
          }
          
          const sessionDate = dayToDateMap[session.day] || startDate
          
          return {
            title: session.title,
            description: session.description || '',
            teachers: session.teachers || '',
            teacherBio: '',
            teacherPhoto: '',
            startTime: `${sessionDate.toISOString().split('T')[0]}T${session.start}:00`,
            endTime: `${sessionDate.toISOString().split('T')[0]}T${session.end}:00`,
            duration: calculateDuration(session.start, session.end),
            level: session.level || '',
            maxParticipants: session.capacity || 20,
            currentBookings: 0,
            location: session.location || '',
            requirements: session.prerequisites || '',
            price: 0,
            order: index,
            cardType: session.cardType || 'detailed',
            sessionTypes: session.types || ''
          }
        })
      }
      
      const response = await fetch('/api/festivals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        // Draft saved, now redirect to pricing
        router.push('/pricing')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save draft')
      }
    } catch (error) {
      console.error('Error saving draft:', error)
      alert(`Error saving draft: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateDuration = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)
    
    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin
    
    return endMinutes - startMinutes
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    
    if (files.length > 0) {
      const file = files[0]
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        // Create a synthetic file input event to reuse existing logic
        const fileInput = document.createElement('input')
        fileInput.type = 'file'
        
        // Create FileList from the dropped file
        const dataTransfer = new DataTransfer()
        dataTransfer.items.add(file)
        fileInput.files = dataTransfer.files
        
        // Create synthetic event
        const syntheticEvent = new Event('change', { bubbles: true })
        Object.defineProperty(syntheticEvent, 'target', {
          value: fileInput,
          enumerable: true
        })
        
        handleCsvUpload(syntheticEvent as any)
      } else {
        alert('Please upload a CSV file')
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create New Event</h1>
        <p className="text-sm sm:text-base text-gray-600">Set up your event in just a few steps</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 sm:mb-12">
        <div className="grid grid-cols-3 gap-3 sm:gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.id} className="text-center">
              <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-4 rounded-2xl flex items-center justify-center ${
                index <= currentStepIndex 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              } transition-all duration-200`}>
                {index < currentStepIndex ? (
                  <Check className="w-5 h-5 sm:w-8 sm:h-8" />
                ) : (
                  <span className="text-lg sm:text-2xl font-bold">{index + 1}</span>
                )}
              </div>
              <h3 className={`text-sm sm:text-lg font-semibold mb-1 sm:mb-2 ${
                index <= currentStepIndex ? 'text-gray-900' : 'text-gray-500'
              }`}>
                {step.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed max-w-xs mx-auto hidden sm:block">
                {step.description}
              </p>
            </div>
          ))}
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6 sm:mt-8 max-w-2xl mx-auto">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">{steps[currentStepIndex].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 'basic' && (
            <form onSubmit={handleBasicSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Event Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={festivalData.name}
                  onChange={(e) => {
                    console.log('Name input changed to:', e.target.value)
                    setFestivalData(prev => ({ ...prev, name: e.target.value }))
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mediterranean Acro Convention 2025"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={festivalData.description}
                  onChange={(e) => setFestivalData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="A brief description of your event..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={festivalData.startDate}
                    onChange={(e) => setFestivalData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={festivalData.endDate}
                    onChange={(e) => setFestivalData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Location & Timezone - auto-detected with option to change */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                {isDetectingLocation ? (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Detecting your location...</span>
                  </div>
                ) : !showLocationEditor ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>
                          Location: <span className="font-medium text-gray-900">
                            {festivalData.location || 'Not set'}
                          </span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowLocationEditor(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Change
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Timezone: {festivalData.timezone}
                    </p>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label htmlFor="location" className="text-sm font-medium text-gray-700">
                        Event Location
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowLocationEditor(false)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Done
                      </button>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        id="location"
                        type="text"
                        value={festivalData.location}
                        onChange={(e) => handleLocationChange(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        placeholder="City, venue, or address"
                        autoFocus
                      />
                      {isDetectingTimezone && (
                        <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4 animate-spin" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Timezone will auto-update: <span className="font-medium">{festivalData.timezone}</span>
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    https://
                  </span>
                  <input
                    id="slug"
                    type="text"
                    value={festivalData.slug}
                    onChange={(e) => {
                      const rawValue = e.target.value
                      // Auto-lowercase and remove invalid characters
                      const cleanSlug = rawValue.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      setFestivalData(prev => ({ ...prev, slug: cleanSlug }))
                      
                      // Show hint if characters were filtered out
                      if (rawValue !== cleanSlug) {
                        setSlugHint('Only lowercase letters, numbers, and hyphens allowed')
                        // Clear hint after 3 seconds
                        setTimeout(() => setSlugHint(null), 3000)
                      }
                    }}
                    className={`flex-1 px-3 py-2 border focus:outline-none focus:ring-2 focus:border-transparent ${
                      slugHint ? 'border-orange-300 focus:ring-orange-500' :
                      slugValidation.isChecking ? 'border-yellow-300 focus:ring-yellow-500' :
                      !slugValidation.isAvailable ? 'border-red-300 focus:ring-red-500' :
                      festivalData.slug && slugValidation.isAvailable ? 'border-green-300 focus:ring-green-500' :
                      'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="mac-2025"
                    required
                  />
                  <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    .tryflowgrid.com
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    This will be your public event URL
                  </p>
                  {slugHint ? (
                    <p className="text-xs text-orange-600 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {slugHint}
                    </p>
                  ) : festivalData.slug && (
                    <p className={`text-xs ${
                      slugValidation.isChecking ? 'text-yellow-600' :
                      !slugValidation.isAvailable ? 'text-red-600' :
                      'text-green-600'
                    }`}>
                      {slugValidation.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Continue to Schedule
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 'schedule' && (
            <form onSubmit={handleScheduleSubmit} className="space-y-6">
              {/* Brief Introduction */}
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Your Event Schedule</h2>
                <p className="text-gray-600">
                  Choose your preferred method: upload a CSV file or connect to a Google Sheet
                </p>
              </div>

              {/* CSV Upload Section */}
              <div className="border-2 border-gray-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Option 1: Upload CSV File</h3>
                    <p className="text-sm text-gray-600">Import sessions from a CSV file</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Download Template Button */}
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      onClick={downloadCsvTemplate}
                      className="flex-shrink-0 bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download CSV Template
                    </Button>
                    <p className="text-sm text-gray-600">
                      Pre-filled with example sessions to get you started
                    </p>
                  </div>

                  {/* CSV Drop Zone */}
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onClick={() => document.getElementById('csvUpload')?.click()}
                  >
                    {isParsingCsv ? (
                      <div>
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-blue-600 font-medium">Parsing CSV file...</p>
                      </div>
                    ) : csvFile ? (
                      <div>
                        <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
                        <p className="text-green-600 font-medium mb-2">✓ {csvFile.name}</p>
                        <p className="text-sm text-gray-600 mb-3">
                          {sessions.length} sessions loaded
                          {csvErrors.length > 0 && `, ${csvErrors.length} warnings`}
                        </p>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            document.getElementById('csvUpload')?.click()
                          }}
                        >
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-700 font-medium mb-2">Drop your CSV file here or click to browse</p>
                        <p className="text-sm text-gray-500">Supports .csv files up to 10MB</p>
                      </div>
                    )}
                    
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      className="hidden"
                      id="csvUpload"
                    />
                  </div>
                </div>
              </div>

              {/* OR Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300"></div>
                <span className="text-sm font-semibold text-gray-500 px-3">OR</span>
                <div className="flex-1 h-px bg-gray-300"></div>
              </div>

              {/* Google Sheets Section */}
              <div className="border-2 border-gray-300 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ExternalLink className="w-6 h-6 text-purple-600" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Option 2: Connect Google Sheet</h3>
                    <p className="text-sm text-gray-600">Link to a public Google Sheets document</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={googleSheetUrl}
                      onChange={(e) => setGoogleSheetUrl(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      disabled={isValidatingSheet}
                    />
                    <Button
                      type="button"
                      onClick={handleGoogleSheetValidation}
                      disabled={isValidatingSheet || !googleSheetUrl.trim()}
                      className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap"
                    >
                      {isValidatingSheet ? (
                        <>
                          <span className="mr-2">⏳</span>
                          Loading...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Load Sessions
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500">
                    Make sure your Google Sheet is publicly accessible or shared with "Anyone with the link can view"
                  </p>

                  {sheetValidation && (
                    <div className={`border rounded-lg p-4 ${
                      sheetValidation.isValid 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <p className={`text-sm font-medium ${
                        sheetValidation.isValid ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {sheetValidation.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed CSV Instructions (Collapsible) */}
              <details className="bg-blue-50 border border-blue-200 rounded-lg">
                <summary className="cursor-pointer font-semibold text-blue-900 p-4 flex items-center gap-2 hover:bg-blue-100">
                  <Info className="w-5 h-5" />
                  CSV Format Guide (click to expand)
                </summary>
                
                <div className="p-6 pt-2 space-y-6">
                  <p className="text-blue-800">
                    Upload your schedule CSV to create your festival program. 
                    Only a few columns are required — the rest simply make your schedule more visual and interactive.
                  </p>

                  {/* Required Columns */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Required Columns</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-blue-200">
                              <th className="text-left py-2 px-3 font-semibold text-blue-900">Column</th>
                              <th className="text-left py-2 px-3 font-semibold text-blue-900">Description</th>
                              <th className="text-left py-2 px-3 font-semibold text-blue-900">Example</th>
                            </tr>
                          </thead>
                          <tbody className="text-blue-800">
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">title</td>
                              <td className="py-2 px-3">Name of the session or event</td>
                              <td className="py-2 px-3 text-blue-600">Morning Yoga</td>
                            </tr>
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">date</td>
                              <td className="py-2 px-3">
                                Session date in YYYY-MM-DD format<br />
                                <span className="text-xs text-blue-700 mt-1 inline-block">
                                  Use ISO date format (e.g., 2025-11-28) for all festivals. The system automatically displays the correct weekday name.
                                </span>
                              </td>
                              <td className="py-2 px-3 text-blue-600">
                                2025-11-28
                              </td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium">start / end</td>
                              <td className="py-2 px-3">Start and end time (24h format)</td>
                              <td className="py-2 px-3 text-blue-600">09:00 / 10:30</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Optional Columns */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Optional Columns</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-blue-200">
                              <th className="text-left py-2 px-3 font-semibold text-blue-900">Column</th>
                              <th className="text-left py-2 px-3 font-semibold text-blue-900">Description</th>
                              <th className="text-left py-2 px-3 font-semibold text-blue-900">Example</th>
                            </tr>
                          </thead>
                          <tbody className="text-blue-800">
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">id</td>
                              <td className="py-2 px-3">Unique identifier (auto-generated if empty)</td>
                              <td className="py-2 px-3 text-blue-600">001</td>
                            </tr>
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">level</td>
                              <td className="py-2 px-3">Difficulty or experience level</td>
                              <td className="py-2 px-3 text-blue-600">Beginner</td>
                            </tr>
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">capacity</td>
                              <td className="py-2 px-3">Max participants (defaults to 20)</td>
                              <td className="py-2 px-3 text-blue-600">25</td>
                            </tr>
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">types</td>
                              <td className="py-2 px-3">Tags or categories for filtering</td>
                              <td className="py-2 px-3 text-blue-600">Yoga, Breathwork</td>
                            </tr>
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">teachers</td>
                              <td className="py-2 px-3">Facilitator or instructor names</td>
                              <td className="py-2 px-3 text-blue-600">Maria & Flo</td>
                            </tr>
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">location</td>
                              <td className="py-2 px-3">Room or area name</td>
                              <td className="py-2 px-3 text-blue-600">Main Hall</td>
                            </tr>
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">description</td>
                              <td className="py-2 px-3">Details about the session</td>
                              <td className="py-2 px-3 text-blue-600">Grounding flow with breath focus</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium">prerequisites</td>
                              <td className="py-2 px-3">Preparation or requirements</td>
                              <td className="py-2 px-3 text-blue-600">Bring your mat and water bottle</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Display Style */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-slate-700 mb-3">Display Style (CardType)</h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="border-b border-blue-200">
                              <th className="text-left py-2 px-3 font-semibold text-blue-900">Type</th>
                              <th className="text-left py-2 px-3 font-semibold text-blue-900">Layout</th>
                              <th className="text-left py-2 px-3 font-semibold text-blue-900">Description</th>
                            </tr>
                          </thead>
                          <tbody className="text-blue-800">
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">minimal</td>
                              <td className="py-2 px-3">Simple</td>
                              <td className="py-2 px-3">Title, time, and location only</td>
                            </tr>
                            <tr className="border-b border-blue-100">
                              <td className="py-2 px-3 font-medium">photo</td>
                              <td className="py-2 px-3">Photo</td>
                              <td className="py-2 px-3">Adds teacher photo space</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 font-medium">detailed (default)</td>
                              <td className="py-2 px-3">Full</td>
                              <td className="py-2 px-3">Includes all info and descriptions</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-blue-700">
                        <p>• CardType must be one of: "minimal", "photo", or "detailed" (not case-sensitive).</p>
                        <p>• If you leave CardType empty, it defaults to "detailed".</p>
                      </div>
                    </div>

                    {/* Hint */}
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                      <p className="text-sm text-blue-800">
                        💡 <strong>Not sure where to start?</strong> Download the CSV template — it's pre-filled with examples you can edit.
                      </p>
                    </div>
                  </div>
                </details>

              {/* CSV Errors/Warnings */}
              {csvErrors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-800 mb-2">Validation Warnings:</h4>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    {csvErrors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                  <p className="text-yellow-600 text-xs mt-2">
                    ℹ️ These are warnings only. Invalid CardTypes will default to "detailed". You can still proceed.
                  </p>
                </div>
              )}

              {/* Session Preview */}
              {sessions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Session Preview ({sessions.length} sessions)
                    </h3>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                        <span>Minimal ({sessions.filter(s => s.cardType === 'minimal').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-100 border border-purple-300 rounded"></div>
                        <span>Photo ({sessions.filter(s => s.cardType === 'photo').length})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                        <span>Detailed ({sessions.filter(s => s.cardType === 'detailed').length})</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                    {sessions.slice(0, 5).map((session) => (
                      <div key={session.id} className="flex items-start justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 mt-2 rounded-full ${
                              session.cardType === 'minimal' ? 'bg-gray-400' :
                              session.cardType === 'photo' ? 'bg-purple-500' : 'bg-green-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{session.title}</p>
                              <p className="text-sm text-gray-600">
                                {session.teachers} • {session.day} {session.start}-{session.end}
                                {session.location && ` • ${session.location}`}
                              </p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>{session.level}</span>
                                <span>Capacity: {session.capacity}</span>
                                <span className="capitalize">{session.cardType} card</span>
                              </div>
                              {session.prerequisites && (
                                <p className="text-xs text-blue-600 mt-1">
                                  Prerequisites: {session.prerequisites}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {sessions.length > 5 && (
                      <p className="text-sm text-gray-500 text-center py-2">
                        ...and {sessions.length - 5} more sessions
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Create Option */}
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 bg-blue-50">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="skipSessions"
                    checked={skipSessions}
                    onChange={(e) => setSkipSessions(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <label htmlFor="skipSessions" className="font-medium text-blue-900 cursor-pointer">
                      I'll add sessions later
                    </label>
                    <p className="text-sm text-blue-700 mt-1">
                      Skip the CSV upload for now and create your event. You can add sessions manually later from the event dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('basic')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={!skipSessions && sessions.length === 0}>
                  Continue to Preview
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 'preview' && (
            <div className="space-y-6">
              {/* Event Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Event Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Name:</span>
                    <span className="ml-2 text-gray-900">{festivalData.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">URL:</span>
                    <span className="ml-2 text-gray-900">https://{festivalData.slug}.tryflowgrid.com</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Dates:</span>
                    <span className="ml-2 text-gray-900">{festivalData.startDate} to {festivalData.endDate}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sessions:</span>
                    <span className="ml-2 text-gray-900">{sessions.length} sessions {sessions.length === 0 ? '(will add later)' : 'imported'}</span>
                  </div>
                  {sessions.length > 0 && (
                    <>
                      <div>
                        <span className="font-medium text-gray-700">Card Types:</span>
                        <span className="ml-2 text-gray-900">
                          {sessions.filter(s => s.cardType === 'minimal').length} minimal, {' '}
                          {sessions.filter(s => s.cardType === 'photo').length} photo, {' '}
                          {sessions.filter(s => s.cardType === 'detailed').length} detailed
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Teachers:</span>
                        <span className="ml-2 text-gray-900">
                          {Array.from(new Set(sessions.map(s => s.teachers).filter(Boolean))).length} instructors
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Empty State Message */}
              {sessions.length === 0 && (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 bg-blue-50 text-center">
                  <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-blue-900 mb-2">You're creating an empty event</h3>
                  <p className="text-blue-700 mb-4">
                    Don't worry! After creating your event, you can add sessions manually or upload a CSV from the event dashboard.
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm text-blue-600 bg-white px-4 py-2 rounded-lg border border-blue-200">
                    <Info className="w-4 h-4" />
                    <span>Navigate to <strong>Manage Sessions</strong> to add your schedule</span>
                  </div>
                </div>
              )}

              {/* Upgrade prompt for Free users at limit */}
              {planInfo && !planInfo.canPublish && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">Publishing Limit Reached</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        You've published {planInfo.festivalsLimit} of {planInfo.festivalsLimit} event{planInfo.festivalsLimit > 1 ? 's' : ''} on the {planInfo.plan} plan. 
                        Click "Save & Upgrade" to save your event as a draft and upgrade to Pro to publish up to 5 events.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('schedule')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save as Draft'}
                  </Button>
                  {/* Show Publish or Upgrade button based on plan limits */}
                  {planInfo?.canPublish === false ? (
                    <Button
                      onClick={handleSaveDraftAndUpgrade}
                      disabled={isLoading}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {isLoading ? 'Saving...' : 'Save & Upgrade'}
                    </Button>
                  ) : (
                    <Button
                      onClick={handlePublish}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Publishing...' : 'Publish Event'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
