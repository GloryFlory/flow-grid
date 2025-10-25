'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Search,
  Plus,
  X,
  Check,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface TeacherPhoto {
  id: string
  filename: string
  teacherName: string
  filePath: string
  fileSize: number
  mimeType: string
  createdAt: string
}

interface Teacher {
  name: string
  sessionCount: number
  hasPhoto: boolean
}

interface Festival {
  id: string
  name: string
  slug: string
}

export default function FestivalTeacherPhotos() {
  const params = useParams()
  const festivalId = params.id as string
  
  const [festival, setFestival] = useState<Festival | null>(null)
  const [photos, setPhotos] = useState<TeacherPhoto[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (festivalId) {
      fetchFestival()
      fetchPhotos()
      fetchTeachers()
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
    }
  }

  const fetchPhotos = async () => {
    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/teacher-photos`)
      if (response.ok) {
        const data = await response.json()
        setPhotos(data.photos || [])
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/teachers`)
      if (response.ok) {
        const data = await response.json()
        setTeachers(data.teachers || [])
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      setSelectedFiles(files)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFiles(files)
    }
  }

  const uploadPhotos = async () => {
    if (!selectedFiles || !festival) return

    setIsUploading(true)
    const formData = new FormData()
    
    // Add festival ID
    formData.append('festivalId', festival.id)
    
    // Add all selected files
    Array.from(selectedFiles).forEach((file, index) => {
      formData.append(`photos`, file)
    })

    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/teacher-photos`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setPhotos(prev => [...prev, ...data.photos])
        setSelectedFiles(null)
        fetchTeachers() // Refresh teacher status
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Error uploading photos:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const deletePhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/admin/festivals/${festivalId}/teacher-photos/${photoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPhotos(prev => prev.filter(p => p.id !== photoId))
        fetchTeachers() // Refresh teacher status
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const filteredPhotos = photos.filter(photo =>
    photo.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photo.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const teachersWithPhotos = filteredTeachers.filter(t => t.hasPhoto)
  const teachersWithoutPhotos = filteredTeachers.filter(t => !t.hasPhoto)

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
                <h1 className="text-3xl font-bold text-gray-900">Teacher Photos</h1>
                <p className="text-gray-600">Manage teacher photos for {festival.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {teachersWithPhotos.length} of {teachers.length} teachers have photos
              </p>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: teachers.length > 0 ? `${(teachersWithPhotos.length / teachers.length) * 100}%` : '0%'
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Drag & Drop Zone */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Drop photos here
                  </h3>
                  <p className="text-gray-600 mb-4">
                    or click to browse files
                  </p>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Select Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Selected Files Preview */}
                {selectedFiles && selectedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">
                      Selected Files ({selectedFiles.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Array.from(selectedFiles).map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-900 truncate">{file.name}</span>
                          <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        onClick={uploadPhotos}
                        disabled={isUploading}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {isUploading ? 'Uploading...' : 'Upload Photos'}
                      </Button>
                      <Button
                        onClick={() => setSelectedFiles(null)}
                        variant="outline"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Upload Tips */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Upload Tips</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Name files with teacher names for auto-matching</li>
                    <li>• Supported formats: JPG, PNG, WebP</li>
                    <li>• Recommended size: 400x400px minimum</li>
                    <li>• Max file size: 5MB per photo</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Teachers & Photos Management */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search teachers or photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Teacher Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Teachers with Photos</p>
                      <p className="text-2xl font-bold text-green-600">{teachersWithPhotos.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Missing Photos</p>
                      <p className="text-2xl font-bold text-orange-600">{teachersWithoutPhotos.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Teachers without Photos */}
            {teachersWithoutPhotos.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="w-5 h-5" />
                    Teachers Missing Photos ({teachersWithoutPhotos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teachersWithoutPhotos.map((teacher) => (
                      <div key={teacher.name} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{teacher.name}</p>
                          <p className="text-sm text-gray-600">{teacher.sessionCount} sessions</p>
                        </div>
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Uploaded Photos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Uploaded Photos ({filteredPhotos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredPhotos.length === 0 ? (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No photos uploaded yet</h3>
                    <p className="text-gray-600">Upload some teacher photos to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPhotos.map((photo) => (
                      <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="aspect-square relative">
                          <img
                            src={photo.filePath}
                            alt={photo.teacherName}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => deletePhoto(photo.id)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-gray-900">{photo.teacherName}</h3>
                          <p className="text-sm text-gray-600 truncate">{photo.filename}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(photo.fileSize)} • {new Date(photo.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}