'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Palette, 
  Upload, 
  Image as ImageIcon, 
  Save,
  RefreshCw,
  Eye,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface Festival {
  id: string
  name: string
  slug: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

export default function FestivalBranding() {
  const params = useParams()
  const festivalId = params.id as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [previewColors, setPreviewColors] = useState({
    primary: '#4a90e2',
    secondary: '#7b68ee',
    accent: '#ff6b6b'
  })
  const logoInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (festivalId) {
      fetchFestival()
    }
  }, [festivalId])

  useEffect(() => {
    if (festival) {
      setPreviewColors({
        primary: festival.primaryColor,
        secondary: festival.secondaryColor,
        accent: festival.accentColor
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

  const handleLogoUpload = async (file: File) => {
    if (!festival) return

    setIsUploadingLogo(true)
    const formData = new FormData()
    formData.append('logo', file)
    formData.append('festivalId', festival.id)

    try {
      const response = await fetch('/api/admin/festivals/logo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setFestival(prev => prev ? { ...prev, logo: data.logoPath } : null)
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleColorChange = (colorType: 'primary' | 'secondary' | 'accent', color: string) => {
    setPreviewColors(prev => ({ ...prev, [colorType]: color }))
  }

  const saveBranding = async () => {
    if (!festival) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/festivals/${festival.id}/branding`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryColor: previewColors.primary,
          secondaryColor: previewColors.secondary,
          accentColor: previewColors.accent,
        }),
      })

      if (response.ok) {
        setFestival(prev => prev ? {
          ...prev,
          primaryColor: previewColors.primary,
          secondaryColor: previewColors.secondary,
          accentColor: previewColors.accent,
        } : null)
      }
    } catch (error) {
      console.error('Error saving branding:', error)
    } finally {
      setSaving(false)
    }
  }

  const resetColors = () => {
    if (festival) {
      setPreviewColors({
        primary: festival.primaryColor,
        secondary: festival.secondaryColor,
        accent: festival.accentColor
      })
    }
  }

  const presetColorSchemes = [
    {
      name: 'Flow Grid Blue',
      colors: { primary: '#4a90e2', secondary: '#7b68ee', accent: '#ff6b6b' }
    },
    {
      name: 'Festival Orange',
      colors: { primary: '#ff8c00', secondary: '#ff6347', accent: '#ffd700' }
    },
    {
      name: 'Nature Green',
      colors: { primary: '#228b22', secondary: '#32cd32', accent: '#9acd32' }
    },
    {
      name: 'Royal Purple',
      colors: { primary: '#663399', secondary: '#9966cc', accent: '#cc99ff' }
    },
    {
      name: 'Sunset Red',
      colors: { primary: '#dc143c', secondary: '#ff69b4', accent: '#ffa500' }
    },
    {
      name: 'Ocean Teal',
      colors: { primary: '#008080', secondary: '#20b2aa', accent: '#40e0d0' }
    }
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
          <Link href="/admin">
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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href={`/admin/festivals/${festival.id}/manage`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Festival
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Festival Branding</h1>
                <p className="text-gray-600">Customize logo and brand colors for {festival.name}</p>
              </div>
            </div>
            <Link href={`/${festival.slug}/schedule`} target="_blank">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview Schedule
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Logo Upload & Color Customization */}
          <div className="space-y-6">
            {/* Logo Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Festival Logo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {festival.logo ? (
                    <div className="mb-4">
                      <img
                        src={festival.logo}
                        alt={`${festival.name} logo`}
                        className="w-32 h-32 object-contain mx-auto border border-gray-200 rounded-lg p-2"
                      />
                    </div>
                  ) : (
                    <div className="w-32 h-32 mx-auto mb-4 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  
                  <Button
                    onClick={() => logoInputRef.current?.click()}
                    disabled={isUploadingLogo}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploadingLogo ? 'Uploading...' : festival.logo ? 'Replace Logo' : 'Upload Logo'}
                  </Button>
                  
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleLogoUpload(file)
                    }}
                    className="hidden"
                  />
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Recommended: PNG or SVG, max 2MB
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Color Customization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Brand Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Color Pickers */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={previewColors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewColors.primary}
                        onChange={(e) => handleColorChange('primary', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#4a90e2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={previewColors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewColors.secondary}
                        onChange={(e) => handleColorChange('secondary', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#7b68ee"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={previewColors.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={previewColors.accent}
                        onChange={(e) => handleColorChange('accent', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                        placeholder="#ff6b6b"
                      />
                    </div>
                  </div>
                </div>

                {/* Color Presets */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Color Presets</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {presetColorSchemes.map((scheme) => (
                      <button
                        key={scheme.name}
                        onClick={() => setPreviewColors(scheme.colors)}
                        className="p-2 text-left border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: scheme.colors.primary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: scheme.colors.secondary }}
                          />
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: scheme.colors.accent }}
                          />
                        </div>
                        <p className="text-xs font-medium text-gray-900">{scheme.name}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={saveBranding}
                    disabled={isSaving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    onClick={resetColors}
                    variant="outline"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Header Preview */}
                <div 
                  className="p-6 rounded-lg text-white"
                  style={{ backgroundColor: previewColors.primary }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    {festival.logo && (
                      <img
                        src={festival.logo}
                        alt="Festival logo"
                        className="w-12 h-12 object-contain bg-white rounded-lg p-1"
                      />
                    )}
                    <div>
                      <h2 className="text-xl font-bold">{festival.name}</h2>
                      <p className="text-white/80">Festival Schedule</p>
                    </div>
                  </div>
                </div>

                {/* Session Card Preview */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Sample Workshop</h3>
                    <div 
                      className="px-2 py-1 rounded text-white text-sm"
                      style={{ backgroundColor: previewColors.secondary }}
                    >
                      Intermediate
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">14:00 - 15:30 • Main Studio</p>
                  <div className="flex gap-2">
                    <span 
                      className="px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: previewColors.accent }}
                    >
                      Flow
                    </span>
                    <span 
                      className="px-2 py-1 rounded text-white text-xs"
                      style={{ backgroundColor: previewColors.secondary }}
                    >
                      Standing
                    </span>
                  </div>
                </div>

                {/* Button Preview */}
                <div className="space-y-2">
                  <button 
                    className="w-full py-2 px-4 rounded-lg text-white font-medium"
                    style={{ backgroundColor: previewColors.primary }}
                  >
                    Primary Button
                  </button>
                  <button 
                    className="w-full py-2 px-4 rounded-lg text-white font-medium"
                    style={{ backgroundColor: previewColors.accent }}
                  >
                    Accent Button
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}