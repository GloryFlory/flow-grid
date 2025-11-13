'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, QrCode, Share2, Link as LinkIcon, Code, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import QRCodePosterGenerator from '@/components/dashboard/QRCodePosterGenerator'

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
}

export default function ShareAndPromote() {
  const params = useParams()
  const festivalId = params.id as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)
  const [embedCopied, setEmbedCopied] = useState(false)

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const copyEmbedCode = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setEmbedCopied(true)
      setTimeout(() => setEmbedCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
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

  const scheduleUrl = `https://tryflowgrid.com/${festival.slug}/schedule`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="mb-4">
            <Link href={`/dashboard/festivals/${festival.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Festival Dashboard
              </Button>
            </Link>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Share & Promote</h1>
            <p className="text-lg text-gray-600">{festival.name}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!festival.isPublished ? (
          <Card className="mb-8">
            <CardContent className="p-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Publish Your Festival First
                </h2>
                <p className="text-gray-600 mb-6">
                  Your festival needs to be published before you can share it with attendees.
                </p>
                <Link href={`/dashboard/festivals/${festival.id}/settings`}>
                  <Button>Go to Festival Settings</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Schedule URL Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  Schedule URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Share this link with attendees to view your live schedule
                </p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={scheduleUrl}
                    readOnly
                    className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm"
                  />
                  <Button
                    onClick={() => copyToClipboard(scheduleUrl)}
                    variant={copySuccess ? "default" : "outline"}
                  >
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Link href={`/${festival.slug}/schedule`} target="_blank">
                    <Button variant="outline">View Live</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Poster Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5" />
                  QR Code Poster
                </CardTitle>
              </CardHeader>
              <CardContent>
                <QRCodePosterGenerator
                  festivalName={festival.name}
                  festivalSlug={festival.slug}
                  festivalDates={`${formatDate(festival.startDate)} - ${formatDate(festival.endDate)}`}
                  logoUrl={festival.logo || undefined}
                  isPremium={false} // TODO: Connect to subscription tier
                  accentColor={festival.accentColor}
                />
              </CardContent>
            </Card>

            {/* Embed Code Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Embed Schedule on Your Website
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Copy this code and paste it into your website to display your live schedule in an iframe
                </p>
                
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                  <code className="text-xs text-gray-800 font-mono break-all">
                    {`<iframe src="${scheduleUrl}" width="100%" height="800" frameborder="0" style="border-radius: 8px;"></iframe>`}
                  </code>
                </div>

                <div className="flex gap-3 mb-4">
                  <Button
                    onClick={() => copyEmbedCode(`<iframe src="${scheduleUrl}" width="100%" height="800" frameborder="0" style="border-radius: 8px;"></iframe>`)}
                    variant={embedCopied ? "default" : "outline"}
                    className="flex-1"
                  >
                    {embedCopied ? 'Copied!' : 'Copy Embed Code'}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    💡 Customization Tips
                  </p>
                  <ul className="text-xs text-blue-800 space-y-1">
                    <li>• Adjust <code className="bg-blue-100 px-1 rounded">height="800"</code> to fit your page layout</li>
                    <li>• The schedule updates automatically when you make changes</li>
                    <li>• Works on WordPress, Squarespace, Wix, and custom websites</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Social Media Templates feature fully retired */}

            {/* Future: More promotional tools */}
            {/* <Card>
              <CardHeader>
                <CardTitle>Additional Marketing Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">Coming soon: Email templates, calendar exports, and more</p>
              </CardContent>
            </Card> */}
          </div>
        )}
      </div>
    </div>
  )
}
