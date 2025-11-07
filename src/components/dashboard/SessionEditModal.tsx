'use client'
import React, { useState, useEffect } from 'react'
import { X, Clock, MapPin, Users, Star, AlertCircle, Save, Plus, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Session {
  id?: string
  title: string
  description?: string
  day: string
  startTime: string
  endTime: string
  teachers: string
  levels: string
  styles: string
  location?: string
  capacity?: number
  prerequisites?: string
  cardType: 'detailed' | 'minimal' | 'photo'
  displayOrder?: number
  bookingEnabled?: boolean
  bookingCapacity?: number
  requirePayment?: boolean
  price?: number
}

interface SessionEditModalProps {
  isOpen: boolean
  onClose: () => void
  session?: Session | null
  festivalId: string
  onSave: (session: Session) => Promise<void>
  availableDays: Array<{value: string, label: string}>
  festivalDateRange?: { startDate: string; endDate: string }
}

const CARD_TYPES = [
  { value: 'detailed', label: 'Detailed', description: 'Complete session with all details and descriptions' },
  { value: 'minimal', label: 'Minimal', description: 'Simple card with title, time, and location only' },
  { value: 'photo', label: 'Photo', description: 'Medium card with facilitator photo and basic info' }
]

const LEVEL_OPTIONS = [
  'Beginner', 'Beginner+', 'Intermediate', 'Intermediate+', 'Advanced', 'All Levels', 'Open Level'
]

const STYLE_OPTIONS = [
  // General session types
  'Workshop', 'Masterclass', 'Lecture', 'Panel Discussion', 'Open Practice',
  
  // Performance & Creative
  'Performance', 'Showcase', 'Competition', 'Jam Session', 'Improv',
  
  // Social & Community  
  'Social Dance', 'Community Circle', 'Meet & Greet', 'Q&A Session',
  
  // Specialized Activities
  'Technique Focus', 'Flow Session', 'Partner Work', 'Solo Practice',
  'Conditioning', 'Flexibility', 'Strength Training', 'Breathwork',
  
  // Event-specific
  'Acro Yoga', 'Contact Improv', 'Movement Medicine', 'Ecstatic Dance'
]

export default function SessionEditModal({ 
  isOpen, 
  onClose, 
  session, 
  festivalId, 
  onSave, 
  availableDays,
  festivalDateRange
}: SessionEditModalProps) {
  const [formData, setFormData] = useState<Session>({
    title: '',
    description: '',
    day: '',
    startTime: '',
    endTime: '',
    teachers: '',
    levels: '',
    styles: '',
    location: '',
    capacity: undefined,
    prerequisites: '',
    cardType: 'detailed',
    displayOrder: undefined,
    bookingEnabled: false,
    bookingCapacity: undefined,
    requirePayment: false,
    price: undefined
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const isEditMode = !!session?.id

  useEffect(() => {
    if (isOpen) {
      if (session) {
        setFormData({
          ...session,
          capacity: session.capacity || undefined,
          bookingEnabled: session.bookingEnabled === true,
          bookingCapacity: session.bookingCapacity || undefined,
          requirePayment: session.requirePayment === true,
          price: session.price || undefined
        })
        // Show advanced section if any advanced fields have values
        setShowAdvanced(!!(
          session.prerequisites || 
          session.location || 
          session.capacity || 
          session.bookingEnabled
        ))
      } else {
        // Reset form for new session
        setFormData({
          title: '',
          description: '',
          day: availableDays[0]?.value || '',
          startTime: '',
          endTime: '',
          teachers: '',
          levels: '',
          styles: '',
          location: '',
          capacity: undefined,
          prerequisites: '',
          cardType: 'detailed',
          bookingEnabled: false,
          bookingCapacity: undefined,
          requirePayment: false,
          price: undefined
        })
        setShowAdvanced(false)
      }
      setErrors({})
    }
  }, [isOpen, session, availableDays])

  const handleInputChange = (field: keyof Session, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Session title is required'
    }

    if (!formData.day) {
      newErrors.day = 'Day is required'
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required'
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required'
    }

    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = 'End time must be after start time'
    }

    // Teachers, levels, and styles are now optional - removed validation

    if (formData.capacity && formData.capacity < 1) {
      newErrors.capacity = 'Capacity must be at least 1'
    }

    // Check if day is within festival date range
    if (formData.day && festivalDateRange && !availableDays.some(d => d.value === formData.day)) {
      newErrors.day = 'Selected day is outside festival date range'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving session:', error)
      // Handle error (could show a toast notification)
    } finally {
      setIsSaving(false)
    }
  }

  const addMultiSelectValue = (field: 'levels' | 'styles', value: string) => {
    const currentValues = formData[field].split(',').map(v => v.trim()).filter(Boolean)
    if (!currentValues.includes(value)) {
      const newValue = [...currentValues, value].join(', ')
      handleInputChange(field, newValue)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Edit Session' : 'Add New Session'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Update session details' : 'Create a new session for your festival'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Session Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Beginner Lindy Hop"
                />
                {errors.title && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of the session (optional)"
                />
              </div>

              {/* Day and Time */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day *
                  </label>
                  <select
                    value={formData.day}
                    onChange={(e) => handleInputChange('day', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.day ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select day</option>
                    {availableDays.map(day => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                  {errors.day && (
                    <p className="text-red-600 text-xs mt-1">{errors.day}</p>
                  )}
                  {festivalDateRange && (
                    <p className="text-xs text-gray-500 mt-1">
                      Festival runs: {new Date(festivalDateRange.startDate).toLocaleDateString()} - {new Date(festivalDateRange.endDate).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.startTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.startTime && (
                    <p className="text-red-600 text-xs mt-1">{errors.startTime}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.endTime ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.endTime && (
                    <p className="text-red-600 text-xs mt-1">{errors.endTime}</p>
                  )}
                </div>
              </div>

              {/* Teachers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presenters / Facilitators
                </label>
                <input
                  type="text"
                  value={formData.teachers}
                  onChange={(e) => handleInputChange('teachers', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., John Smith, Jane Doe"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Separate multiple presenters with commas
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Levels */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Levels
                </label>
                <input
                  type="text"
                  value={formData.levels}
                  onChange={(e) => handleInputChange('levels', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Beginner, Intermediate"
                />
                <div className="flex flex-wrap gap-1 mt-2">
                  {LEVEL_OPTIONS.map(level => (
                    <button
                      key={level}
                      type="button"
                      onClick={() => addMultiSelectValue('levels', level)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Styles */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Styles
                </label>
                <input
                  type="text"
                  value={formData.styles}
                  onChange={(e) => handleInputChange('styles', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Workshop, Acro Yoga, Social Dance (separate multiple with commas)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Add any session types or activities - separate multiple with commas
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 mt-2 max-h-32 overflow-y-auto">
                  {STYLE_OPTIONS.map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => addMultiSelectValue('styles', style)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors text-left"
                    >
                      <Plus className="w-3 h-3 inline mr-1" />
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Card Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Type
                </label>
                <select
                  value={formData.cardType}
                  onChange={(e) => handleInputChange('cardType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {CARD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <div className="border-t border-gray-200 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Advanced Options
              <span className={`transform transition-transform ${showAdvanced ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Room or venue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity || ''}
                  onChange={(e) => handleInputChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.capacity ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Max participants"
                />
                {errors.capacity && (
                  <p className="text-red-600 text-xs mt-1">{errors.capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Star className="w-4 h-4 inline mr-1" />
                  Prerequisites
                </label>
                <input
                  type="text"
                  value={formData.prerequisites}
                  onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Required experience"
                />
              </div>
            </div>
          )}
          
          {/* Booking Options */}
          {showAdvanced && (
            <div className="pt-4 border-t border-gray-100 mt-4">
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.bookingEnabled || false}
                    onChange={(e) => handleInputChange('bookingEnabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Enable Booking System
                  </span>
                  <span className="text-xs text-gray-500">
                    Allow participants to reserve spots
                  </span>
                </label>
              </div>
              
              {formData.bookingEnabled && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pl-6 border-l-2 border-blue-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Booking Capacity *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.bookingCapacity || ''}
                      onChange={(e) => handleInputChange('bookingCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Max bookings"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Maximum number of spots available
                    </p>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                      <input
                        type="checkbox"
                        checked={formData.requirePayment || false}
                        onChange={(e) => handleInputChange('requirePayment', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Require Payment
                      </span>
                      <span className="text-xs text-gray-500">
                        (Coming soon with Stripe integration)
                      </span>
                    </label>
                    
                    {formData.requirePayment && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (€)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price || ''}
                          onChange={(e) => handleInputChange('price', e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="10.00"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Payment processing will be available in a future update
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            * Required fields: Title, Day, Start Time, End Time
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : (isEditMode ? 'Update Session' : 'Create Session')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}