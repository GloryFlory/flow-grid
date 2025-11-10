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
  totalSessionClicks: number
  uniqueVisitors: number
  avgSessionTime?: string
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
          <div className="py-4 sm:py-6">
            {/* Back Button Row */}
            <div className="mb-3 sm:mb-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            
            {/* Festival Info Row */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">{festival.name}</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  {formatDate(festival.startDate)} - {formatDate(festival.endDate)}
                  {festival.location && ` • ${festival.location}`}
                </p>
              </div>
              
              {/* Status & Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                <span className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                  festival.isPublished 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {festival.isPublished ? 'Published' : 'Draft'}
                </span>
                {festival.isPublished && (
                  <Link href={`/${festival.slug}/schedule`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">View Live Schedule</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Festival Stats - 2x2 on mobile, 4 columns on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-2 sm:mb-0 sm:mr-4">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Sessions</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{festival._count.sessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center mb-2 sm:mb-0 sm:mr-4">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Page Views</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics?.totalViews || 0}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">Total views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-2 sm:mb-0 sm:mr-4">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Schedule URL</p>
                  <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">/{festival.slug}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-2 sm:mb-0 sm:mr-4">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Session Clicks</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{analytics?.totalSessionClicks || 0}</p>
                  <p className="text-xs text-gray-500 hidden sm:block">Engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Festival Content */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  Festival Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Link href={`/dashboard/festivals/${festival.id}/sessions`}>
                  <div className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 break-words">Session Management</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Edit workshops, add sessions</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl sm:text-2xl font-bold text-purple-600">{festival._count.sessions}</p>
                        <p className="text-xs text-gray-500 hidden sm:block">Sessions</p>
                      </div>
                    </div>
                  </div>
                </Link>

                <Link href={`/dashboard/festivals/${festival.id}/info`}>
                  <div className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 break-words">Festival Information</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Update details and dates</p>
                      </div>
                      <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
                  Analytics & Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/festivals/${festival.id}/analytics`}>
                  <div className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all cursor-pointer">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 break-words">Festival Analytics</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">View engagement stats</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-base sm:text-lg font-bold text-green-600">{analytics?.uniqueVisitors || 0}</p>
                        <p className="text-xs text-gray-500">Visitors</p>
                      </div>
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Branding & Assets */}
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
                  Branding & Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <Link href={`/dashboard/festivals/${festival.id}/branding`}>
                  <div className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all cursor-pointer">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 break-words">Festival Branding</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Customize logo and colors</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
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
                  <div className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 break-words">Facilitator Info & Photos</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Manage profiles and photos</p>
                      </div>
                      <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                  Festival Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/festivals/${festival.id}/settings`}>
                  <div className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all cursor-pointer">
                    <div className="flex items-start sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm sm:text-base font-semibold text-gray-900 break-words">Publish & Settings</h3>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">Control visibility and options</p>
                      </div>
                      <div className="text-right flex-shrink-0">
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