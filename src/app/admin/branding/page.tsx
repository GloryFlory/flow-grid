'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Palette, 
  Upload, 
  Image as ImageIcon, 
  Save,
  RefreshCw,
  Eye,
  Download
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

interface BrandPreview {
  festivalName: string
  logo?: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export default function FestivalBrandingManager() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null)
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
    fetchFestivals()
  }, [])

  useEffect(() => {
    if (selectedFestival) {
      setPreviewColors({
        primary: selectedFestival.primaryColor,
        secondary: selectedFestival.secondaryColor,
        accent: selectedFestival.accentColor
      })
    }
  }, [selectedFestival])

  const fetchFestivals = async () => {
    try {
      const response = await fetch('/api/admin/festivals')
      if (response.ok) {
        const data = await response.json()
        setFestivals(data.festivals || [])
        if (data.festivals.length > 0) {
          setSelectedFestival(data.festivals[0])
        }
      }
    } catch (error) {
      console.error('Error fetching festivals:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = async (file: File) => {
    if (!selectedFestival) return

    setIsUploadingLogo(true)
    const formData = new FormData()
    formData.append('logo', file)
    formData.append('festivalId', selectedFestival.id)

    try {
      const response = await fetch('/api/admin/festivals/logo', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedFestival(prev => prev ? { ...prev, logo: data.logoPath } : null)
        // Update festivals list
        setFestivals(prev => prev.map(f => 
          f.id === selectedFestival.id ? { ...f, logo: data.logoPath } : f
        ))
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
    if (!selectedFestival) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/festivals/${selectedFestival.id}/branding`, {
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
        // Update selected festival
        setSelectedFestival(prev => prev ? {
          ...prev,
          primaryColor: previewColors.primary,
          secondaryColor: previewColors.secondary,
          accentColor: previewColors.accent,
        } : null)
        
        // Update festivals list
        setFestivals(prev => prev.map(f => 
          f.id === selectedFestival.id ? {
            ...f,
            primaryColor: previewColors.primary,
            secondaryColor: previewColors.secondary,
            accentColor: previewColors.accent,
          } : f
        ))
      }
    } catch (error) {
      console.error('Error saving branding:', error)
    } finally {
      setSaving(false)
    }
  }

  const resetColors = () => {
    if (selectedFestival) {
      setPreviewColors({
        primary: selectedFestival.primaryColor,
        secondary: selectedFestival.secondaryColor,
        accent: selectedFestival.accentColor
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <nav className="flex space-x-4 text-sm text-gray-600 mb-2">
                <Link href="/admin" className="hover:text-gray-900">Admin</Link>
                <span>/</span>
                <span className="text-gray-900">Festival Branding</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">Festival Branding</h1>
              <p className="text-gray-600">Customize logos and brand colors for your festivals</p>
            </div>
            {selectedFestival && (
              <Link href={`/${selectedFestival.slug}/schedule`} target="_blank">
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview Schedule
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading festivals...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Festival Selection & Logo Upload */}
            <div className="space-y-6">
              {/* Festival Selector */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Festival</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {festivals.map((festival) => (
                      <button
                        key={festival.id}
                        onClick={() => setSelectedFestival(festival)}
                        className={`w-full text-left p-3 rounded-lg border transition-all ${
                          selectedFestival?.id === festival.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <h3 className="font-medium text-gray-900">{festival.name}</h3>
                        <p className="text-sm text-gray-600">/{festival.slug}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Logo Upload */}
              {selectedFestival && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Festival Logo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      {selectedFestival.logo ? (
                        <div className="mb-4">
                          <img
                            src={selectedFestival.logo}
                            alt={`${selectedFestival.name} logo`}
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
                        {isUploadingLogo ? 'Uploading...' : selectedFestival.logo ? 'Replace Logo' : 'Upload Logo'}
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
              )}
            </div>

            {/* Color Customization */}
            {selectedFestival && (
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
            )}

            {/* Live Preview */}
            {selectedFestival && (
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
                        {selectedFestival.logo && (
                          <img
                            src={selectedFestival.logo}
                            alt="Festival logo"
                            className="w-12 h-12 object-contain bg-white rounded-lg p-1"
                          />
                        )}
                        <div>
                          <h2 className="text-xl font-bold">{selectedFestival.name}</h2>
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
            )}
          </div>
        )}
      </div>
    </div>
  )
}