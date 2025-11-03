'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff, Trash2, Globe, AlertTriangle } from 'lucide-react'

interface Festival {
  id: string
  name: string
  slug: string
  isPublished: boolean
  customDomain?: string
}

export default function FestivalSettings() {
  const params = useParams()
  const router = useRouter()
  const festivalId = params.id as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (festivalId) {
      fetchFestival()
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

  const togglePublish = async () => {
    if (!festival) return
    
    setIsSaving(true)
    setMessage(null)
    
    try {
      const response = await fetch(`/api/admin/festivals/${festival.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: !festival.isPublished
        })
      })

      if (response.ok) {
        const data = await response.json()
        setFestival(data.festival)
        setMessage({
          type: 'success',
          text: `Festival ${data.festival.isPublished ? 'published' : 'unpublished'} successfully!`
        })
      } else {
        setMessage({ type: 'error', text: 'Failed to update festival status' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    } finally {
      setIsSaving(false)
    }
  }

  const deleteFestival = async () => {
    if (!festival) return
    
    const confirmed = confirm(`Are you sure you want to delete "${festival.name}"? This action cannot be undone.`)
    if (!confirmed) return

    try {
      const response = await fetch(`/api/admin/festivals/${festival.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        router.push('/dashboard/festivals')
      } else {
        setMessage({ type: 'error', text: 'Failed to delete festival' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred' })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading settings...</p>
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
          <div className="flex items-start gap-4 min-w-0">
            <div className="hidden sm:block flex-shrink-0">
              <Link href={`/dashboard/festivals/${festival.id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Festival
                </Button>
              </Link>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">Festival Settings</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 truncate">{festival.name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Message Banner */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Publish/Unpublish */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {festival.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              Visibility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Festival Status: {festival.isPublished ? 'Published' : 'Draft'}
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {festival.isPublished 
                    ? `Your festival is live and accessible at /${festival.slug}/schedule`
                    : 'Your festival is in draft mode and not visible to the public'
                  }
                </p>
                {festival.isPublished && (
                  <Link href={`/${festival.slug}/schedule`} target="_blank">
                    <Button variant="outline" size="sm">
                      <Globe className="w-4 h-4 mr-2" />
                      View Public Schedule
                    </Button>
                  </Link>
                )}
              </div>
              <Button
                onClick={togglePublish}
                disabled={isSaving}
                className={festival.isPublished ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isSaving ? 'Saving...' : festival.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Custom Domain */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Custom Domain
              </div>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Coming Soon</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Connect your own domain name to your festival schedule (e.g., schedule.yourfestival.com)
            </p>
            <input
              type="text"
              placeholder="schedule.yourfestival.com"
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-400 cursor-not-allowed"
            />
          </CardContent>
        </Card>

        {/* Slug/URL */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Festival URL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <code className="text-sm bg-gray-100 px-3 py-2 rounded border">
                tryflowgrid.com/{festival.slug}/schedule
              </code>
            </div>
            <p className="text-xs text-gray-500">
              This is your festival's public URL. Changing slugs will be available in a future update.
            </p>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Delete Festival</h3>
                <p className="text-sm text-gray-600">
                  Permanently delete this festival and all its sessions. This action cannot be undone.
                </p>
              </div>
              <Button
                onClick={deleteFestival}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
