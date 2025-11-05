'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, BarChart3, Eye, Users, Clock, TrendingUp } from 'lucide-react'

interface Festival {
  id: string
  name: string
  slug: string
}

interface AnalyticsData {
  totalViews: number
  uniqueVisitors: number
  avgSessionTime: string
  topSessions: Array<{
    title: string
    clicks: number
  }>
}

export default function FestivalAnalytics() {
  const params = useParams()
  const festivalId = params.id as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (festivalId) {
      fetchData()
    }
  }, [festivalId])

  const fetchData = async () => {
    try {
      const [festivalRes, analyticsRes] = await Promise.all([
        fetch(`/api/admin/festivals/${festivalId}`),
        fetch(`/api/admin/festivals/${festivalId}/analytics`)
      ])

      if (festivalRes.ok) {
        const festivalData = await festivalRes.json()
        setFestival(festivalData.festival)
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      } else {
        // Set default empty analytics if endpoint doesn't exist
        setAnalytics({
          totalViews: 0,
          uniqueVisitors: 0,
          avgSessionTime: '0:00',
          topSessions: []
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setAnalytics({
        totalViews: 0,
        uniqueVisitors: 0,
        avgSessionTime: '0:00',
        topSessions: []
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading analytics...</p>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href={`/dashboard/festivals/${festival.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Festival
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
                <p className="text-gray-600">{festival.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.totalViews || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Visitors</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.uniqueVisitors || 0}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics?.avgSessionTime || '0:00'}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Sessions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Most Popular Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {analytics?.topSessions && analytics.topSessions.length > 0 ? (
              <div className="space-y-4">
                {analytics.topSessions.map((session, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{session.title}</p>
                      <p className="text-sm text-gray-500">{session.clicks} {session.clicks === 1 ? 'click' : 'clicks'}</p>
                    </div>
                    <div className="flex-shrink-0">
                      <BarChart3 className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No session clicks recorded yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Session popularity will appear here once people start clicking on sessions
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-8">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-blue-900 mb-3">
                Advanced Analytics Coming Soon
              </h3>
              <ul className="text-blue-700 space-y-2 max-w-2xl mx-auto">
                <li>• Peak viewing times (hourly breakdown)</li>
                <li>• Day-by-day view trends</li>
                <li>• Teacher profile click-through rates</li>
                <li>• Filter usage patterns</li>
                <li>• Session view duration tracking</li>
                <li>• Booking conversion rates (when booking system launches)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
