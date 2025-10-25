'use client'


import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import TeacherModal from '@/components/dashboard/TeacherModal'
import { Upload, Image as ImageIcon, Trash2, User, Plus, X, Check, AlertCircle, Link as LinkIcon, Users } from 'lucide-react'
import Image from 'next/image'

interface TeacherPhoto {
  id: string
  filename: string
  filePath: string
  teacherId: string
}

interface Teacher {
  id: string
  name: string
  url?: string
  isGroup: boolean
  photos: TeacherPhoto[]
}

export default function TeacherAdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Teacher | null>(null)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchTeachers()
  }, [])

  const fetchTeachers = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/teachers/all')
      if (res.ok) {
        const data = await res.json()
        setTeachers(data.teachers || [])
      } else {
        setError('Failed to load teachers')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This cannot be undone.`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchTeachers()
      } else {
        alert('Failed to delete teacher')
      }
    } catch (err) {
      alert('Error deleting teacher')
    }
  }

  return (
    <div className="teacher-admin-page p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Teacher Management</h1>
          <p className="text-gray-600">Manage teacher profiles and photos</p>
        </div>
        <Button 
          onClick={() => { setEditing(null); setModalOpen(true) }} 
          className="inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Teacher
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teachers...</p>
          </div>
        </div>
      ) : teachers.length === 0 ? (
        <Card className="p-12 text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No teachers yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first teacher</p>
          <Button onClick={() => { setEditing(null); setModalOpen(true) }}>
            <Plus className="w-4 h-4 mr-2" /> Add Teacher
          </Button>
        </Card>
      ) : (
        <div className="teacher-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teachers.map((teacher) => (
            <Card key={teacher.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  {teacher.isGroup ? (
                    <Users className="w-5 h-5 text-purple-600" />
                  ) : (
                    <User className="w-5 h-5 text-blue-600" />
                  )}
                  <span className="truncate">{teacher.name}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4 mb-4">
                  {teacher.photos && teacher.photos.length > 0 ? (
                    <Image 
                      src={teacher.photos[0].filePath} 
                      alt={teacher.name} 
                      width={80} 
                      height={80} 
                      className="rounded-lg border-2 border-gray-200 object-cover" 
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-500 mb-2">
                      {teacher.isGroup ? 'Couple/Group' : 'Individual'}
                    </div>
                    {teacher.url && (
                      <a 
                        href={teacher.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1 hover:underline"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span className="truncate">Website</span>
                      </a>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => { setEditing(teacher); setModalOpen(true) }} 
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Edit
                  </Button>
                  <Button 
                    onClick={() => handleDelete(teacher.id, teacher.name)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TeacherModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing ? { name: editing.name, url: editing.url, photo: editing.photos?.[0] } : undefined}
        onSave={async ({ name, url, photoFile }) => {
          try {
            const fd = new FormData()
            fd.append('name', name)
            if (url) fd.append('url', url)
            if (photoFile) fd.append('file', photoFile)

            const method = editing ? 'PATCH' : 'POST'
            const path = editing ? `/api/admin/teachers/${editing.id}` : '/api/admin/teachers'
            const res = await fetch(path, { method, body: fd })
            
            if (res.ok) {
              setModalOpen(false)
              setEditing(null)
              fetchTeachers()
            } else {
              const error = await res.text()
              console.error('Failed to save teacher:', error)
              alert('Failed to save teacher. Check console for details.')
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

