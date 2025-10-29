'use client'

import { useState, useEffect } from 'react'
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
  Users
} from 'lucide-react'

type Step = 'basic' | 'schedule' | 'preview'

interface ParsedSession {
  id: string
  day: string
  start: string
  end: string
  title: string
  level: string
  capacity: number
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

  // Form state
  const [festivalData, setFestivalData] = useState({
    name: '',
    description: '',
    slug: '',
    startDate: '',
    endDate: '',
    timezone: 'America/Montreal'
  })

  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [sessions, setSessions] = useState<ParsedSession[]>([])
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  const [isParsingCsv, setIsParsingCsv] = useState(false)
  const [slugValidation, setSlugValidation] = useState({ isChecking: false, isAvailable: true, message: '' })

  const steps = [
    { id: 'basic', title: 'Festival Details', description: 'Basic information about your festival' },
    { id: 'schedule', title: 'Schedule Setup', description: 'Upload your CSV and configure display' },
    { id: 'preview', title: 'Preview & Publish', description: 'Review and launch your festival' }
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

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const errors: string[] = []
        const parsedSessions: ParsedSession[] = []

        results.data.forEach((row: any, index: number) => {
          // Validate required fields
          if (!row.title || !row.day || !row.start || !row.end) {
            errors.push(`Row ${index + 1}: Missing required fields (title, day, start, end)`)
            return
          }

          // Validate CardType
          const cardType = row.CardType?.toLowerCase()
          if (cardType && !['minimal', 'photo', 'detailed'].includes(cardType)) {
            errors.push(`Row ${index + 1}: Invalid CardType "${row.CardType}". Must be "minimal", "photo", or "detailed"`)
          }

          parsedSessions.push({
            id: row.id || `session-${index}`,
            day: row.day || '',
            start: row.start || '',
            end: row.end || '',
            title: row.title || '',
            level: row.level || '',
            capacity: parseInt(row.capacity) || 20,
            types: row.types || '',
            cardType: (cardType as 'minimal' | 'photo' | 'detailed') || 'detailed',
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
    const csvContent = `id,day,start,end,title,level,capacity,types,CardType,teachers,location,Description,Prerequisites
1,Friday,08:00,09:00,Registration,All Levels,50,Admin,minimal,,Main Entrance,"Check-in and welcome packets","Pre-registration required"
2,Friday,09:00,10:30,Morning Hatha Yoga,Beginner,25,Yoga,photo,Sarah Johnson,Studio A,"Gentle yoga flow focusing on breath and alignment","No experience required"
3,Friday,11:00,13:00,Acro Foundations,Beginner,20,Acrobatics,detailed,Mike Chen & Lisa Wang,Studio B,"Learn fundamental acrobatic skills including basic lifts and balances","Comfortable with basic movement patterns"
4,Friday,13:00,14:00,Lunch Break,All Levels,,Meal,minimal,,Garden Terrace,"Organic vegetarian lunch with local ingredients",""
5,Friday,14:30,16:00,Aerial Yoga,Intermediate,15,Yoga,photo,Emma Rodriguez,Studio C,"Explore traditional yoga poses using silk hammocks for support","Previous yoga experience recommended"
6,Friday,16:30,17:30,Contact Improv Jam,All Levels,30,Movement,minimal,,Dance Studio,"Open movement exploration session","Open mind and willingness to explore"
7,Saturday,08:00,09:30,Vinyasa Flow,Intermediate,20,Yoga,photo,David Kim,Studio A,"Dynamic linking of breath and movement","6+ months regular yoga practice"
8,Saturday,10:00,12:00,Partner Acrobatics,Advanced,12,Acrobatics,detailed,Mike Chen & Lisa Wang,Studio B,"Advanced partner balancing and dynamic movements","2+ years acro experience required"
9,Saturday,13:00,14:00,Lunch,All Levels,,Meal,minimal,,Dining Hall,"Healthy community lunch",""
10,Saturday,15:00,16:00,Closing Circle,All Levels,50,Community,minimal,,Main Hall,"Reflection and community sharing","Open heart and gratitude"`

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${festivalData.slug || 'festival'}-template.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Enhanced validation
    if (!csvFile) {
      alert('Please upload a CSV file')
      return
    }
    
    if (sessions.length === 0) {
      alert('No sessions found in the CSV. Please ensure your CSV file contains valid session data.')
      return
    }
    
    if (csvErrors.length > 0) {
      alert('Please fix the CSV errors before proceeding.')
      return
    }
    
    // Debug log
    console.log('Moving to preview with:', {
      festivalData,
      sessions: sessions.length,
      csvFile: csvFile.name
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
    
    if (sessions.length === 0) {
      alert('Please upload and process a CSV file with session data.')
      return
    }
    
    setIsLoading(true)
    
    // Debug: log the current state
    console.log('Festival data:', festivalData)
    console.log('Sessions:', sessions)
    console.log('Sessions length:', sessions.length)
    
    try {
      const payload = {
        ...festivalData,
        isPublished: true, // This is for publishing
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
            level: session.level || 'All Levels',
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
        const errorData = await response.json()
        console.error('API Error Response:', errorData)
        console.error('Request payload was:', {
          ...festivalData,
          sessions: sessions.map((session, index) => {
            const startDate = new Date(festivalData.startDate)
            const sessionDate = new Date(startDate)
            
            return {
              title: session.title,
              description: session.description || '',
              teachers: typeof session.teachers === 'string' ? session.teachers : (Array.isArray(session.teachers) ? (session.teachers as string[]).join(', ') : ''),
              teacherBio: '',
              teacherPhoto: '',
              startTime: `${sessionDate.toISOString().split('T')[0]}T${session.start}:00`,
              endTime: `${sessionDate.toISOString().split('T')[0]}T${session.end}:00`,
              duration: calculateDuration(session.start, session.end),
              level: session.level || 'All Levels',
              maxParticipants: session.capacity || 20,
              currentBookings: 0,
              location: session.location || '',
              requirements: session.prerequisites || '',
              price: 0,
              order: index,
              cardType: session.cardType || 'detailed',
              sessionTypes: typeof session.types === 'string' ? session.types : (Array.isArray(session.types) ? (session.types as string[]).join(', ') : '')
            }
          })
        })
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to create festival`)
      }
    } catch (error) {
      console.error('Error creating festival:', error)
      if (error instanceof Error) {
        alert(`Error creating festival: ${error.message}`)
      } else {
        alert('An unexpected error occurred. Please check the console for details.')
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
            level: session.level || 'All Levels',
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Festival</h1>
        <p className="text-gray-600">Set up your festival in just a few steps</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                index <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {index < currentStepIndex ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className={`text-sm font-medium ${
                  index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-px mx-4 ${
                  index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStepIndex].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {currentStep === 'basic' && (
            <form onSubmit={handleBasicSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Festival Name *
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
                  placeholder="A brief description of your festival..."
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
                    onChange={(e) => setFestivalData(prev => ({ ...prev, slug: e.target.value }))}
                    className={`flex-1 px-3 py-2 border focus:outline-none focus:ring-2 focus:border-transparent ${
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
                    This will be your public festival URL
                  </p>
                  {festivalData.slug && (
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
              {/* Information Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">CSV Template & Instructions</h3>
                    <div className="text-blue-800 space-y-3">
                      <p>
                        To create your festival schedule, download our CSV template and fill it out with your session details. 
                        This will allow you to import all sessions quickly and maintain consistency.
                      </p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Required CSV Columns:
                          </h4>
                          <ul className="text-sm space-y-1 list-disc list-inside">
                            <li><strong>id:</strong> Unique identifier (1, 2, 3...)</li>
                            <li><strong>day:</strong> Day name (Friday, Saturday, Sunday)</li>
                            <li><strong>start/end:</strong> 24-hour format (09:00, 13:30, 16:45)</li>
                            <li><strong>title:</strong> Session name</li>
                            <li><strong>level:</strong> Beginner | Intermediate | Advanced | All Levels</li>
                            <li><strong>capacity:</strong> Max participants (15, 20, 25, 30)</li>
                            <li><strong>types:</strong> Yoga | Acrobatics | Movement | Dance | Wellness | Community | Admin | Meal</li>
                            <li><strong>CardType:</strong> Display style:
                              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                                <li><strong>"minimal":</strong> Breaks, meals, admin → title, time, location only</li>
                                <li><strong>"photo":</strong> Yoga, simple classes → teacher photo + basic info</li>
                                <li><strong>"detailed":</strong> Workshops, complex sessions → full descriptions</li>
                              </ul>
                            </li>
                            <li><strong>teachers:</strong> Instructor names (use & for partnerships: "John & Mary")</li>
                            <li><strong>location:</strong> Studio A | Studio B | Main Hall | Garden | Dining Hall</li>
                          </ul>
                        </div>
                      </div>

                      <div className="bg-blue-100 rounded-lg p-4 mt-4">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <ExternalLink className="w-4 h-4" />
                          Live Demo Example:
                        </h4>
                        <p className="text-sm">
                          See the Mediterranean Acro Convention schedule in action: 
                          <a 
                            href="https://mac-five-iota.vercel.app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-1 underline hover:no-underline font-medium"
                          >
                            mac-five-iota.vercel.app
                          </a>
                        </p>
                        <p className="text-xs mt-1">This shows how your festival will look with different card types.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CSV Template Download */}
              <div className="text-center">
                <Button
                  type="button"
                  onClick={downloadCsvTemplate}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                  Pre-filled with example data from MAC festival
                </p>
              </div>

              {/* CSV Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Upload Your Completed CSV *
                </label>
                
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onClick={() => document.getElementById('csvUpload')?.click()}
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                  
                  {isParsingCsv ? (
                    <div>
                      <p className="text-blue-600 font-medium mb-2">⏳ Parsing CSV file...</p>
                      <p className="text-sm text-gray-500 mb-4">Please wait while we process your sessions</p>
                    </div>
                  ) : csvFile ? (
                    <div>
                      <p className="text-green-600 font-medium mb-2">✓ {csvFile.name} uploaded</p>
                      <p className="text-sm text-gray-500 mb-4">
                        {sessions.length} sessions found
                        {csvErrors.length > 0 && `, ${csvErrors.length} warnings`}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">Drop your CSV file here, or click to browse</p>
                      <p className="text-sm text-gray-500 mb-4">Supports .csv files up to 10MB</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvUpload}
                    className="hidden"
                    id="csvUpload"
                  />
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isParsingCsv}
                    onClick={(e) => {
                      e.stopPropagation()
                      document.getElementById('csvUpload')?.click()
                    }}
                  >
                    {csvFile ? 'Change File' : 'Choose CSV File'}
                  </Button>
                </div>
              </div>

              {/* CSV Errors */}
              {csvErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">CSV Validation Warnings:</h4>
                  <ul className="text-red-700 text-sm space-y-1">
                    {csvErrors.map((error, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-0.5">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                  <p className="text-red-600 text-xs mt-2">
                    ⚠️ These sessions may not display correctly. Please review your CSV file.
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

              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep('basic')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={!csvFile || sessions.length === 0}>
                  Continue to Preview
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          )}

          {currentStep === 'preview' && (
            <div className="space-y-6">
              {/* Festival Summary */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Festival Summary</h3>
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
                    <span className="ml-2 text-gray-900">{sessions.length} sessions imported</span>
                  </div>
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
                </div>
              </div>

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
                  <Button
                    onClick={handlePublish}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Publishing...' : 'Publish Festival'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
