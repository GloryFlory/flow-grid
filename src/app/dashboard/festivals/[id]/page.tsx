'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Settings, 
  Image as ImageIcon, 
  Palette, 
  Calendar,
  Users,
  BarChart3,
  Globe,
  Eye,
  ArrowLeft,
  FileText
} from 'lucide-react'
import Link from 'next/link'

interface Festival {
  id: string
  name: string
  slug: string
  description?: string
  location?: string
  startDate: string
  endDate: string
  isPublished: boolean
  logo?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  _count: {
    sessions: number
  }
}

interface AnalyticsData {
  totalViews: number
  sessionClicks: number
  uniqueVisitors: number
  avgSessionTime: string
}

export default function FestivalManagement() {
  const params = useParams()
  const festivalId = params.id as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (festivalId) {
      fetchFestival()
      fetchAnalytics()
    }
  }, [festivalId])

  const fetchFestival = async () => {
    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}`)
      if (response.ok) {
        const data = await response.json()
        setFestival(data.festival)
      }
    } catch (error) {
      console.error('Error fetching festival:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/analytics`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading festival...</p>
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
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{festival.name}</h1>
                <p className="text-gray-600">
                  {formatDate(festival.startDate)} - {formatDate(festival.endDate)}
                  {festival.location && ` • ${festival.location}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                festival.isPublished 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {festival.isPublished ? 'Published' : 'Draft'}
              </span>
              {festival.isPublished && (
                <Link href={`/${festival.slug}/schedule`} target="_blank">
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Live Schedule
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Festival Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{festival._count.sessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Page Views</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.totalViews || 0}</p>
                  <p className="text-xs text-gray-500">Total views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                  <Globe className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Schedule URL</p>
                  <p className="text-sm font-bold text-gray-900">/{festival.slug}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <BarChart3 className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Session Clicks</p>
                  <p className="text-2xl font-bold text-gray-900">{analytics?.sessionClicks || 0}</p>
                  <p className="text-xs text-gray-500">Engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Festival Content */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Festival Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/dashboard/festivals/${festival.id}/sessions`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Session Management</h3>
                        <p className="text-sm text-gray-600">Edit workshops, add new sessions, manage schedule</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">{festival._count.sessions}</p>
                        <p className="text-xs text-gray-500">Sessions</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href={`/dashboard/festivals/${festival.id}/info`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Festival Information</h3>
                        <p className="text-sm text-gray-600">Update festival name, dates, location, description</p>
                      </div>
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics & Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/festivals/${festival.id}/analytics`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Festival Analytics</h3>
                        <p className="text-sm text-gray-600">View engagement and usage statistics</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">{analytics?.uniqueVisitors || 0}</p>
                        <p className="text-xs text-gray-500">Visitors</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Branding & Assets */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Branding & Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href={`/dashboard/festivals/${festival.id}/branding`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Festival Branding</h3>
                        <p className="text-sm text-gray-600">Customize logo and brand colors</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: festival.primaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: festival.secondaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border" 
                          style={{ backgroundColor: festival.accentColor }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href={`/dashboard/festivals/${festival.id}/teacher-photos`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Facilitator Info and Photos</h3>
                        <p className="text-sm text-gray-600">Manage facilitator profiles and photos</p>
                      </div>
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Festival Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/festivals/${festival.id}/settings`}>
                  <div className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">Publish & Settings</h3>
                        <p className="text-sm text-gray-600">Control visibility and advanced options</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          festival.isPublished 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {festival.isPublished ? 'Live' : 'Draft'}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}