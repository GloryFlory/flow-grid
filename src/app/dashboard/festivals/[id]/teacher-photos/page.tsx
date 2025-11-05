'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TeacherModal from '@/components/dashboard/TeacherModal'
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Search,
  Plus,
  X,
  Check,
  AlertCircle,
  ArrowLeft,
  Edit,
  Link as LinkIcon,
  Users,
  User as UserIcon
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
  teacherRecord?: {
    id: string
    name: string
    url?: string
    isGroup: boolean
    photos: Array<{ id: string; filePath: string }>
  }
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
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null)
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
      const response = await fetch(`/api/admin/teacher-photos/${photoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setPhotos(prev => prev.filter(p => p.id !== photoId))
        fetchTeachers() // Refresh teacher status
      } else {
        console.error('Failed to delete photo:', await response.text())
        alert('Failed to delete photo')
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
      alert('Error deleting photo')
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 break-words">Facilitator Info & Photos</h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">Manage facilitator profiles for {festival.name}</p>
              </div>
            </div>
            
            <div className="text-left sm:text-right flex-shrink-0">
              <p className="text-xs sm:text-sm text-gray-600">
                {teachersWithPhotos.length} of {teachers.length} have photos
              </p>
              <div className="w-full sm:w-48 bg-gray-200 rounded-full h-2 mt-1">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teachers & Photos Management */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search facilitators..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button
                onClick={() => {
                  setEditingTeacher(null)
                  setModalOpen(true)
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Facilitator
              </Button>
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
                      <p className="text-sm text-gray-600">Facilitators with Photos</p>
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

            {/* Facilitators without Photos */}
            {teachersWithoutPhotos.length > 0 && (
              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="w-5 h-5" />
                    Facilitators Missing Photos ({teachersWithoutPhotos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachersWithoutPhotos.map((teacher) => (
                      <div key={teacher.name} className="bg-orange-50 rounded-lg border border-orange-100 overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-200 to-orange-300 rounded-full flex items-center justify-center flex-shrink-0">
                              {teacher.teacherRecord?.isGroup ? (
                                <Users className="w-6 h-6 text-orange-700" />
                              ) : (
                                <UserIcon className="w-6 h-6 text-orange-700" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">{teacher.name}</h3>
                              {teacher.teacherRecord?.isGroup && (
                                <span className="text-xs text-purple-600 font-medium">Couple/Group</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center text-sm text-gray-600">
                              <span className="font-medium">{teacher.sessionCount}</span>
                              <span className="ml-1">session{teacher.sessionCount !== 1 ? 's' : ''}</span>
                            </div>
                            {teacher.teacherRecord?.url && (
                              <a 
                                href={teacher.teacherRecord.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                              >
                                <LinkIcon className="w-3 h-3" />
                                <span className="truncate">Website</span>
                              </a>
                            )}
                          </div>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingTeacher(teacher)
                              setModalOpen(true)
                            }}
                            className="w-full"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit Info & Add Photo
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Facilitators with Photos */}
            {teachersWithPhotos.length > 0 && (
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <Check className="w-5 h-5" />
                    Facilitators with Photos ({teachersWithPhotos.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teachersWithPhotos.map((teacher) => {
                      // ONLY get photo from teacherRecord.photos (festival-scoped)
                      // DO NOT fallback to global teacherName lookup
                      const teacherPhoto = teacher.teacherRecord?.photos?.[0]
                      const photoUrl = teacherPhoto?.filePath
                      
                      return (
                        <div key={teacher.name} className="bg-green-50 rounded-lg border border-green-100 overflow-hidden">
                          {/* Photo Preview - Circular */}
                          <div className="relative bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center py-6">
                            {photoUrl ? (
                              <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                                  <img 
                                    src={`${photoUrl}?t=${Date.now()}`} 
                                    alt={teacher.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="absolute top-0 right-0 flex gap-1">
                                  {teacherPhoto && (
                                    <button
                                      onClick={() => deletePhoto(teacherPhoto.id)}
                                      className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                                      title="Delete photo"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                                {teacher.teacherRecord?.isGroup ? (
                                  <Users className="w-12 h-12 text-green-600 opacity-50" />
                                ) : (
                                  <UserIcon className="w-12 h-12 text-green-600 opacity-50" />
                                )}
                              </div>
                            )}
                          </div>
                          
                          <div className="p-4">
                            <div className="mb-3">
                              <h3 className="font-semibold text-gray-900 truncate">{teacher.name}</h3>
                              {teacher.teacherRecord?.isGroup && (
                                <span className="text-xs text-purple-600 font-medium">Couple/Group</span>
                              )}
                            </div>
                            
                            <div className="space-y-2 mb-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <span className="font-medium">{teacher.sessionCount}</span>
                                <span className="ml-1">session{teacher.sessionCount !== 1 ? 's' : ''}</span>
                              </div>
                              {teacher.teacherRecord?.url && (
                                <a 
                                  href={teacher.teacherRecord.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  <LinkIcon className="w-3 h-3" />
                                  <span className="truncate">Visit Website</span>
                                </a>
                              )}
                            </div>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTeacher(teacher)
                                setModalOpen(true)
                              }}
                              className="w-full"
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit Info
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Teacher Info Modal */}
      <TeacherModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditingTeacher(null)
        }}
        initial={editingTeacher?.teacherRecord ? {
          name: editingTeacher.teacherRecord.name,
          url: editingTeacher.teacherRecord.url,
          photo: editingTeacher.teacherRecord.photos?.[0]
        } : (editingTeacher ? {
          name: editingTeacher.name,
          url: undefined,
          photo: undefined
        } : undefined)}
        onSave={async ({ name, url, photoFile }) => {
          try {
            const fd = new FormData()
            fd.append('name', name)
            fd.append('festivalId', festivalId)
            if (url) fd.append('url', url)
            if (photoFile) fd.append('file', photoFile)

            const method = editingTeacher?.teacherRecord ? 'PATCH' : 'POST'
            const path = editingTeacher?.teacherRecord 
              ? `/api/admin/teachers/${editingTeacher.teacherRecord.id}` 
              : '/api/admin/teachers'
            
            const res = await fetch(path, { method, body: fd })
            
            if (res.ok) {
              setModalOpen(false)
              setEditingTeacher(null)
              // Refresh data
              fetchTeachers()
              fetchPhotos()
            } else {
              const errorData = await res.json()
              const errorMessage = errorData.error || 'Unknown error occurred'
              console.error('Failed to save teacher:', errorMessage)
              
              // Show user-friendly error message
              if (res.status === 409 || res.status === 400) {
                alert(`Cannot save teacher: ${errorMessage}\n\nTip: Teacher names are case-sensitive and must match your CSV exactly.`)
              } else {
                alert(`Failed to save teacher: ${errorMessage}`)
              }
            }
          } catch (err) {
            console.error('Error saving teacher:', err)
            alert('Error saving teacher. Check console for details.')
          }
        }}
      />
    </div>
  )
}