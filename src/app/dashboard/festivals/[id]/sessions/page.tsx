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
  Eye
} from 'lucide-react'
import Link from 'next/link'
import SessionEditModal from '@/components/dashboard/SessionEditModal'

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
}

interface Festival {
  id: string
  name: string
  slug: string
  startDate: string
  endDate: string
  sessions: FestivalSession[]
}

export default function SessionsManagement() {
  const params = useParams()
  const festivalId = params.id as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [sessions, setSessions] = useState<FestivalSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDay, setSelectedDay] = useState<string>('all')
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSession, setEditingSession] = useState<FestivalSession | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (festivalId) {
      fetchFestival()
    }
  }, [festivalId])

  const fetchFestival = async () => {
    try {
      // Fetch festival data
      const festivalResponse = await fetch(`/api/admin/festivals/${festivalId}`)
      if (festivalResponse.ok) {
        const festivalData = await festivalResponse.json()
        setFestival(festivalData.festival)
      }

      // Fetch sessions data
      const sessionsResponse = await fetch(`/api/admin/festivals/${festivalId}/sessions`)
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json()
        setSessions(sessionsData.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching festival:', error)
    } finally {
      setIsLoading(false)
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
      const response = await fetch(`/api/admin/festivals/${festivalId}/sessions/csv`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        // Refresh the festival data to show updated sessions
        await fetchFestival()
        setSelectedFile(null)
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Error uploading CSV:', error)
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

  const openEditModal = (session?: FestivalSession) => {
    setEditingSession(session || null)
    setShowEditModal(true)
  }

  const handleSaveSession = async (sessionData: any) => {
    try {
      const url = sessionData.id 
        ? `/api/admin/festivals/${festivalId}/sessions/${sessionData.id}`
        : `/api/admin/festivals/${festivalId}/sessions`
      
      const method = sessionData.id ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(sessionData),
      })

      if (response.ok) {
        // Close modal first for better UX
        setShowEditModal(false)
        setEditingSession(null)
        
        // Force refresh the festival data with no-cache
        const festivalResponse = await fetch(`/api/admin/festivals/${festivalId}`, {
          headers: { 'Cache-Control': 'no-cache' }
        })
        
        if (festivalResponse.ok) {
          const data = await festivalResponse.json()
          setFestival(data.festival)
        }
      } else {
        const error = await response.json()
        console.error('Error saving session:', error)
        alert(`Failed to save session: ${error.error || 'Unknown error'}`)
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
    
    console.log('Festival date range:', {
      start: festival.startDate,
      end: festival.endDate,
      startParsed: startDate.toISOString(),
      endParsed: endDate.toISOString()
    })
    
    // Generate day names from festival date range
    const days: Array<{value: string, label: string}> = []
    const currentDate = new Date(startDate)
    
    // Include all days within the festival date range
    while (currentDate.getTime() <= endDate.getTime()) {
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' })
      const dateStr = currentDate.toLocaleDateString('en-US', { timeZone: 'UTC' })
      
      days.push({
        value: dayName,
        label: `${dayName} (${dateStr})`
      })
      
      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }
    
    console.log('Generated days:', days)
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
      cardType: session.cardType as 'detailed' | 'minimal' | 'photo'
    }
  }

  // Filter and sort sessions by festival date order
  const filteredSessions = React.useMemo(() => {
    if (!festival) return sessions
    
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
    
    // Filter sessions
    const filtered = sessions.filter(session => {
      const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           session.teachers.some(teacher => teacher.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           session.styles.some(style => style.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesDay = selectedDay === 'all' || session.day === selectedDay
      
      return matchesSearch && matchesDay
    })
    
    // Sort by festival day order, then by time
    return filtered.sort((a, b) => {
      const dayComparison = festivalDayOrder.indexOf(a.day) - festivalDayOrder.indexOf(b.day)
      if (dayComparison !== 0) return dayComparison
      return a.startTime.localeCompare(b.startTime)
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
    
    // Get unique days from sessions and sort by festival order
    return Array.from(new Set(sessions.map(s => s.day)))
      .filter(day => day && day !== 'Invalid Date')
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
              <Button onClick={exportCSV} variant="outline" size="sm">
                <Download className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Export CSV</span>
              </Button>
              <Button onClick={() => openEditModal()} size="sm">
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Add Session</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
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
                      {isUploading ? 'Uploading...' : 'Upload & Replace Sessions'}
                    </Button>
                  </div>
                )}

                {/* Upload Tips */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 text-sm mb-1">CSV Format</h4>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Same format as initial setup</li>
                    <li>• Will replace ALL existing sessions</li>
                    <li>• Download current CSV as template</li>
                  </ul>
                </div>
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
                  placeholder="Search sessions, teachers, or styles..."
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
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Session</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Day & Time</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Teachers</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Level</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Styles</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredSessions.map((session) => (
                          <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                                <div className="font-medium text-gray-900">
                                  {session.day}
                                </div>
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Clock className="w-3 h-3" />
                                  {session.startTime?.substring(0, 5)} - {session.endTime?.substring(0, 5)}
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
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  onClick={() => openEditModal(session)}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() => deleteSession(session.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
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
    </div>
  )
}