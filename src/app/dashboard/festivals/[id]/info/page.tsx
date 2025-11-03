'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Save,
  Globe,
  Calendar,
  MapPin,
  FileText,
  Settings,
  Eye,
  AlertCircle,
  Check
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
  timezone: string
  isPublished: boolean
  customDomain?: string
  _count: {
    sessions: number
  }
}

export default function FestivalInformation() {
  const params = useParams()
  const festivalId = params.id as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    timezone: 'UTC',
    isPublished: false,
    customDomain: ''
  })

  useEffect(() => {
    if (festivalId) {
      fetchFestival()
    }
  }, [festivalId])

  useEffect(() => {
    if (festival) {
      setFormData({
        name: festival.name,
        slug: festival.slug,
        description: festival.description || '',
        location: festival.location || '',
        startDate: festival.startDate.split('T')[0], // Convert to YYYY-MM-DD
        endDate: festival.endDate.split('T')[0],
        timezone: festival.timezone,
        isPublished: festival.isPublished,
        customDomain: festival.customDomain || ''
      })
    }
  }, [festival])

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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setHasChanges(true)
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    handleInputChange('name', name)
    // Auto-generate slug if it hasn't been manually changed
    if (!hasChanges || formData.slug === generateSlug(formData.name)) {
      handleInputChange('slug', generateSlug(name))
    }
  }

  const saveFestival = async () => {
    if (!festival) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/admin/festivals/${festival.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          startDate: new Date(formData.startDate).toISOString(),
          endDate: new Date(formData.endDate).toISOString(),
        }),
      })

      if (response.ok) {
        const updatedFestival = await response.json()
        setFestival(updatedFestival.festival)
        setHasChanges(false)
      }
    } catch (error) {
      console.error('Error saving festival:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago', 
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Asia/Tokyo',
    'Australia/Sydney'
  ]

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
          
          {/* Desktop: Back button inline */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">Festival Information</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Basic details and settings</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              {festival.isPublished && (
                <Link href={`/${festival.slug}/schedule`} target="_blank">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </Link>
              )}
              <Button 
                onClick={saveFestival} 
                disabled={!hasChanges || isSaving}
                className="bg-blue-600 hover:bg-blue-700"
                size="sm"
              >
                <Save className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">{isSaving ? 'Saving...' : 'Save Changes'}</span>
                <span className="sm:hidden">{isSaving ? '...' : 'Save'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Festival Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter festival name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Slug *
                  </label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2 sm:px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-xs sm:text-sm whitespace-nowrap">
                      <span className="hidden sm:inline">tryflowgrid.com/</span>
                      <span className="sm:hidden">...com/</span>
                    </span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="festival-slug"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be your public schedule URL
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Brief description of your festival (optional)"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Date & Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Date & Location
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timezone
                  </label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City, venue, or address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Publishing Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Publishing Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Public Schedule</h3>
                    <p className="text-sm text-gray-600">
                      Make your festival schedule visible to participants
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublished}
                      onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Domain (Optional)
                  </label>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-3 py-2 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      https://
                    </span>
                    <input
                      type="text"
                      value={formData.customDomain}
                      onChange={(e) => handleInputChange('customDomain', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="yourfestival.com"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Pro plan feature - use your own domain
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Festival Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    formData.isPublished ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-sm font-medium">
                    {formData.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p>Sessions: {festival._count.sessions}</p>
                  <p>Created: {new Date(festival.startDate).toLocaleDateString()}</p>
                </div>

                {formData.isPublished && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-2">Public URL:</p>
                    <Link 
                      href={`/${formData.slug}/schedule`} 
                      target="_blank"
                      className="text-xs text-blue-600 hover:text-blue-700 break-all"
                    >
                      tryflowgrid.com/{formData.slug}/schedule
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/dashboard/festivals/${festival.id}/sessions`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Sessions
                  </Button>
                </Link>
                
                <Link href={`/dashboard/festivals/${festival.id}/branding`}>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Festival Branding
                  </Button>
                </Link>

                {formData.isPublished && (
                  <Link href={`/${formData.slug}/schedule`} target="_blank">
                    <Button variant="outline" className="w-full justify-start">
                      <Globe className="w-4 h-4 mr-2" />
                      View Public Site
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Publishing Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Publishing Checklist</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Festival information complete</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${
                  festival._count.sessions > 0 ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {festival._count.sessions > 0 ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>Sessions added ({festival._count.sessions})</span>
                </div>
                <div className={`flex items-center gap-2 text-sm ${
                  formData.isPublished ? 'text-green-600' : 'text-gray-400'
                }`}>
                  {formData.isPublished ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span>Published to public</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}