'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import ScheduleInterface from '@/components/schedule/ScheduleInterface'

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

interface Festival {
  id: string
  name: string
  description?: string
  slug: string
  location?: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
  startDate: Date
  endDate: Date
  timezone: string
}

// This page will render the public schedule for any festival
export default function FestivalSchedule() {
  const params = useParams()
  const slug = params.slug as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFestivalData() {
      try {
        const response = await fetch(`/api/public/festivals/${slug}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Festival not found or not published')
          } else {
            setError('Failed to load festival data')
          }
          return
        }
        
        const data = await response.json()
        setFestival(data.festival)
        setSessions(data.sessions)
      } catch (err) {
        console.error('Error fetching festival:', err)
        setError('Failed to load festival data')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchFestivalData()
    }
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600 font-medium">Loading {festival?.name || 'Festival'} Schedule...</p>
          <p className="text-sm text-blue-500 mt-2">Fetching latest session information...</p>
        </div>
      </div>
    )
  }

  if (error || !festival) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || 'Festival Not Found'}
          </h1>
          <p className="text-red-500">
            {error === 'Festival not found or not published' 
              ? 'This festival is not available or has not been published yet.'
              : 'Please try again later or contact support.'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="schedule-container">
      <ScheduleInterface 
        festival={festival}
        sessions={sessions}
      />
    </div>
  )
}