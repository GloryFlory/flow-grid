'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users,
  Star
} from 'lucide-react'

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
  cardType: 'simplified' | 'photo' | 'full'
}

interface Festival {
  id: string
  name: string
  description?: string
  slug: string
  location?: string
  startDate: string
  endDate: string
  timezone: string
  isPublished: boolean
  sessions: FestivalSession[]
}

export default function PublicFestivalPage() {
  const params = useParams()
  const [festival, setFestival] = useState<Festival | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFestival()
  }, [params.slug])

  const fetchFestival = async () => {
    try {
      const response = await fetch(`/api/public/festivals/${params.slug}`)
      if (response.ok) {
        const data = await response.json()
        setFestival(data)
      } else {
        setError('Festival not found')
      }
    } catch (err) {
      setError('Failed to load festival')
    } finally {
      setIsLoading(false)
    }
  }

  const renderSessionCard = (session: FestivalSession) => {
    const cardClasses = "border rounded-lg p-6 transition-all hover:shadow-lg hover:border-blue-300"
    
    switch (session.cardType) {
      case 'simplified':
        return (
          <Card key={session.id} className={cardClasses}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900">{session.title}</h3>
                  <div className="flex items-center gap-4 text-gray-600 mt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">{session.startTime} - {session.endTime}</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span>{session.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                {session.level && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {session.level}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'photo':
        return (
          <Card key={session.id} className={cardClasses}>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-10 h-10 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-gray-900">{session.title}</h3>
                  {session.teachers.length > 0 && (
                    <p className="text-gray-700 mt-1 font-medium">
                      with {session.teachers.join(', ')}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-gray-600 mt-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span className="font-medium">{session.startTime} - {session.endTime}</span>
                    </div>
                    {session.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        <span>{session.location}</span>
                      </div>
                    )}
                  </div>
                </div>
                {session.level && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium h-fit">
                    {session.level}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )

      case 'full':
      default:
        return (
          <Card key={session.id} className={cardClasses}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl text-gray-900">{session.title}</CardTitle>
                {session.level && (
                  <span className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                    {session.level}
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {session.description && (
                  <p className="text-gray-700 leading-relaxed">{session.description}</p>
                )}
                
                <div className="flex flex-wrap gap-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">{session.startTime} - {session.endTime}</span>
                  </div>
                  {session.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <span>{session.location}</span>
                    </div>
                  )}
                  {session.capacity && (
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>Max {session.capacity} people</span>
                    </div>
                  )}
                </div>

                {session.teachers.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Teachers</h4>
                    <p className="text-gray-700">{session.teachers.join(', ')}</p>
                  </div>
                )}

                {session.styles.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {session.styles.map((style, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 rounded-full text-sm font-medium"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                )}

                {session.prerequisites && (
                  <div className="border-l-4 border-orange-200 pl-4 py-2">
                    <h4 className="font-semibold text-gray-900 mb-1">Prerequisites</h4>
                    <p className="text-gray-700 text-sm">{session.prerequisites}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-96 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-40 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !festival) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Festival Not Found</h2>
          <p className="text-gray-600">{error || 'This festival could not be loaded.'}</p>
        </div>
      </div>
    )
  }

  // Group sessions by day
  const sessionsByDay = festival.sessions.reduce((acc, session) => {
    if (!acc[session.day]) {
      acc[session.day] = []
    }
    acc[session.day].push(session)
    return acc
  }, {} as Record<string, FestivalSession[]>)

  // Sort sessions within each day by start time
  Object.keys(sessionsByDay).forEach(day => {
    sessionsByDay[day].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime)
    })
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">{festival.name}</h1>
          {festival.description && (
            <p className="text-xl text-gray-700 mb-6">{festival.description}</p>
          )}
          <div className="flex items-center justify-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                {new Date(festival.startDate).toLocaleDateString()} - {new Date(festival.endDate).toLocaleDateString()}
              </span>
            </div>
            {festival.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{festival.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Schedule by Day */}
        <div className="space-y-12">
          {Object.entries(sessionsByDay).map(([day, sessions]) => (
            <div key={day}>
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">{day}</h2>
              <div className="space-y-6">
                {sessions.map(renderSessionCard)}
              </div>
            </div>
          ))}
        </div>

        {festival.sessions.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-gray-600 text-lg">The schedule will be available soon!</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Powered by <span className="font-semibold">Flow Grid</span>
          </p>
        </div>
      </div>
    </div>
  )
}