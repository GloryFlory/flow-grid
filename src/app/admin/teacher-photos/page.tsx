'use client'
import React, { useState, useEffect, useRef } from 'react'
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
  AlertCircle
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

export default function TeacherPhotosManager() {
  const [photos, setPhotos] = useState<TeacherPhoto[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPhotos()
    fetchTeachers()
  }, [])

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/admin/teacher-photos')
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
      const response = await fetch('/api/admin/teachers')
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files: FileList) => {
    setSelectedFiles(files)
  }

  const uploadFiles = async () => {
    if (!selectedFiles) return

    setIsUploading(true)
    const uploadedPhotos: TeacherPhoto[] = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const formData = new FormData()
      formData.append('file', file)

      try {
        const response = await fetch('/api/admin/teacher-photos/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          uploadedPhotos.push(data.photo)
        }
      } catch (error) {
        console.error('Error uploading file:', file.name, error)
      }
    }

    setPhotos(prev => [...prev, ...uploadedPhotos])
    setSelectedFiles(null)
    setIsUploading(false)
    
    // Refresh teachers list to update hasPhoto status
    await fetchTeachers()
  }

  const deletePhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/admin/teacher-photos/${photoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPhotos(prev => prev.filter(photo => photo.id !== photoId))
        await fetchTeachers() // Refresh to update hasPhoto status
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
    }
  }

  const filteredPhotos = photos.filter(photo =>
    photo.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    photo.filename.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

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
                <span className="text-gray-900">Teacher Photos</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">Teacher Photo Manager</h1>
              <p className="text-gray-600">Upload and manage teacher photos for your festival schedules</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Teacher Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {selectedFiles 
                    ? `${selectedFiles.length} file(s) selected` 
                    : 'Drop photos here or click to upload'
                  }
                </p>
                <p className="text-sm text-gray-600">
                  Supports JPG, PNG, WEBP up to 10MB each
                </p>
                <p className="text-xs text-gray-500">
                  Tip: Name files like "teacher-name.jpg" for automatic matching
                </p>
              </div>
              
              <div className="mt-6 flex justify-center gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  disabled={isUploading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
                
                {selectedFiles && (
                  <>
                    <Button
                      onClick={uploadFiles}
                      disabled={isUploading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isUploading ? 'Uploading...' : 'Upload Photos'}
                    </Button>
                    <Button
                      onClick={() => setSelectedFiles(null)}
                      variant="outline"
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  </>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search teachers or photos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Teachers Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Teachers ({teachers.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading teachers...</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredTeachers.map((teacher) => (
                    <div
                      key={teacher.name}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          teacher.hasPhoto ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <h3 className="font-medium text-gray-900">{teacher.name}</h3>
                          <p className="text-sm text-gray-600">{teacher.sessionCount} sessions</p>
                        </div>
                      </div>
                      {teacher.hasPhoto ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Uploaded Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Uploaded Photos ({photos.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={photo.filePath}
                      alt={photo.teacherName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{photo.teacherName}</h3>
                      <p className="text-sm text-gray-600 truncate">{photo.filename}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(photo.fileSize)}</p>
                    </div>
                    <Button
                      onClick={() => deletePhoto(photo.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                {filteredPhotos.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No photos uploaded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}