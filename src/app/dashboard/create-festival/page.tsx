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
      delimiter: '', // Auto-detect delimiter (supports both comma and semicolon)
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
          const cardType = row.CardType?.toLowerCase().trim()
          if (cardType && !['minimal', 'photo', 'detailed', ''].includes(cardType)) {
            errors.push(`Row ${index + 1}: Invalid CardType "${row.CardType}". Must be "minimal", "photo", or "detailed" (or leave empty for default "detailed")`)
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
    // Use semicolon delimiter for Windows Excel compatibility
    // Note: Using semicolon (;) instead of comma (,) because Excel on Windows expects this format
    const csvContent = `id;day;start;end;title;level;capacity;types;CardType;teachers;location;Description;Prerequisites
1;Friday;08:00;09:00;Registration & Check-in;;50;Logistics;minimal;;Main Entrance;Welcome and registration desk;Event ticket required
2;Friday;09:00;10:30;Opening Keynote;;200;Presentation;photo;Dr. Sarah Chen;Main Auditorium;Welcome address and festival overview;
3;Friday;11:00;12:30;Workshop: Creative Writing;Beginner;25;Workshop;detailed;Alex Rivera;Room 101;Hands-on writing workshop exploring narrative techniques;Notebook and pen recommended
4;Friday;13:00;14:00;Lunch Break;;80;Break;minimal;;Garden Terrace;Catered lunch and networking time;
5;Friday;14:30;16:00;Panel Discussion;Intermediate;40;Panel;photo;Maria Lopez & John Smith;Conference Room;Industry experts discuss current trends;Basic familiarity with topic helpful
6;Friday;16:30;17:30;Networking Session;;60;Social;minimal;;Lobby;Informal networking and refreshments;
7;Saturday;08:30;09:30;Morning Meditation;;30;Wellness;photo;Emma Thompson;Quiet Room;Guided meditation to start the day;Comfortable clothing suggested
8;Saturday;10:00;12:00;Advanced Masterclass;Advanced;15;Masterclass;detailed;Prof. David Kim;Studio;Deep dive into advanced techniques;Previous experience required
9;Saturday;13:00;14:00;Lunch Break;;80;Break;minimal;;Dining Hall;Lunch and informal discussions;
10;Saturday;15:00;16:00;Closing Ceremony;;100;Community;minimal;;Main Hall;Wrap-up and thank you remarks;`

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
              level: session.level || '',
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Create New Festival</h1>
        <p className="text-sm sm:text-base text-gray-600">Set up your festival in just a few steps</p>
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
                  <div className="w-full">
                    <h3 className="font-semibold text-blue-900 mb-3">CSV Template & Instructions</h3>
                    
                    <p className="text-blue-800 mb-6">
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
                              <td className="py-2 px-3 font-medium">day</td>
                              <td className="py-2 px-3">Day of the festival</td>
                              <td className="py-2 px-3 text-blue-600">Friday</td>
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
                  Pre-filled with sample event data to get you started
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
