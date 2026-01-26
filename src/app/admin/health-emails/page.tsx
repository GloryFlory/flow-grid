'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, AlertCircle, CheckCircle, Send, Loader2, ChevronDown, ChevronRight, ArrowLeft, X } from 'lucide-react'

interface FestivalEmailPreview {
  festivalId: string
  festivalName: string
  ownerEmail: string
  healthScore: number
  missingCriteria: Array<{
    label: string
    description: string
    action: string
    points: number
  }>
  emailSubject: string
  emailPreview: string
}

export default function HealthEmailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [festivals, setFestivals] = useState<FestivalEmailPreview[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<any>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [hasFetchedFestivals, setHasFetchedFestivals] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session?.user || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
    }
  }, [session, status, router])

  // Load festivals on mount
  useEffect(() => {
    if (session?.user?.role === 'ADMIN' && !hasFetchedFestivals) {
      loadFestivals()
    }
  }, [session, hasFetchedFestivals])

  if (status === 'loading') {
    return <div className="p-8">Loading...</div>
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }

  const loadFestivals = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/admin/health-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'preview', threshold: 100 }) // Get all festivals
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to load festivals')
      }
      
      const data = await response.json()
      // Filter to only show festivals with score < 100
      const incomplete = data.preview.filter((f: FestivalEmailPreview) => f.healthScore < 100)
      setFestivals(incomplete)
      setHasFetchedFestivals(true)
    } catch (error: any) {
      console.error('Load error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === festivals.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(festivals.map(f => f.festivalId)))
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedIds(newExpanded)
  }

  const handleSendClick = () => {
    if (selectedIds.size === 0) return
    setShowConfirmModal(true)
  }

  const handleSendConfirm = async () => {
    setShowConfirmModal(false)
    setLoading(true)
    
    try {
      const response = await fetch('/api/admin/health-emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          mode: 'send', 
          festivalIds: Array.from(selectedIds) 
        })
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to send emails')
      }
      
      const data = await response.json()
      setResult(data)
      setSelectedIds(new Set())
      // Reload to remove sent festivals
      await loadFestivals()
    } catch (error: any) {
      console.error('Send error:', error)
      setResult({ error: error.message })
    } finally {
      setLoading(false)
    }
  }

  // Helper functions for health score colors
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getHealthBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    if (score >= 40) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Platform Dashboard Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/platform"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Platform Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-900">Health Score Emails</h1>
            </div>
            
            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              My Dashboard →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Send Follow-Up Emails</h2>
          <p className="text-gray-600">
            Send personalized emails to event organizers with incomplete health scores.
          </p>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Send Health Score Emails?</h3>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                You're about to send personalized health score emails to <strong>{selectedIds.size}</strong> {selectedIds.size === 1 ? 'user' : 'users'}. 
                Each email will include specific recommendations based on their event's missing criteria.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendConfirm}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Emails
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !festivals.length && !result && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-gray-600">Loading festivals...</span>
          </div>
        )}

        {/* Error State */}
        {result?.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800 mb-1">Error</h3>
                <p className="text-sm text-red-700">{result.error}</p>
              </div>
              <button
                onClick={() => setResult(null)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Success Results */}
        {result && !result.error && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Emails Sent Successfully!
              </h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{result.results?.sent || 0}</div>
                <div className="text-sm text-green-800">Sent</div>
              </div>
              
              <div className="bg-red-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-600">{result.results?.failed || 0}</div>
                <div className="text-sm text-red-800">Failed</div>
              </div>
            </div>

            {result.results?.errors && result.results.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {result.results.errors.map((err: any, idx: number) => (
                    <li key={idx}>
                      Festival {err.festivalId}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setResult(null)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Close
            </button>
          </div>
        )}

        {/* Festivals List */}
        {!loading && festivals.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            
            {/* Header with Select All */}
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedIds.size === festivals.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {festivals.length} Incomplete Events
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedIds.size} selected
                  </p>
                </div>
              </div>

              <button
                onClick={handleSendClick}
                disabled={loading || selectedIds.size === 0}
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send to {selectedIds.size} User{selectedIds.size !== 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>

            {/* Festivals Table */}
            <div className="divide-y divide-gray-200">
              {festivals.map((festival) => {
                const isExpanded = expandedIds.has(festival.festivalId)
                const isSelected = selectedIds.has(festival.festivalId)
                
                return (
                  <div key={festival.festivalId} className="hover:bg-gray-50">
                    {/* Main Row */}
                    <div className="p-4 flex items-center gap-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelection(festival.festivalId)}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />

                      <button
                        onClick={() => toggleExpanded(festival.festivalId)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-medium text-gray-900 truncate">
                            {festival.festivalName}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthBadgeColor(festival.healthScore)}`}>
                            {festival.healthScore} / 100
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{festival.ownerEmail}</p>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">
                          {festival.missingCriteria.length} missing
                        </div>
                        <div className="text-xs text-gray-500">
                          +{festival.missingCriteria.reduce((sum, c) => sum + c.points, 0)} pts available
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 pl-16 space-y-3">
                        
                        {/* Email Subject */}
                        <div className="bg-gray-50 rounded p-3">
                          <p className="text-xs font-medium text-gray-700 mb-1">Email Subject:</p>
                          <p className="text-sm text-gray-900">{festival.emailSubject}</p>
                        </div>
                        
                        {/* Missing Criteria */}
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-2">Missing Criteria:</p>
                          <div className="space-y-2">
                            {festival.missingCriteria.map((criteria, idx) => (
                              <div 
                                key={idx}
                                className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <strong className="text-sm text-amber-900">{criteria.label}</strong>
                                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full font-medium">
                                    +{criteria.points} pts
                                  </span>
                                </div>
                                <p className="text-xs text-amber-800">{criteria.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && festivals.length === 0 && !result && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">All Events Looking Good! 🎉</h2>
            <p className="text-gray-600">
              Every event on the platform has a perfect health score. Nice work!
            </p>
          </div>
        )}

      </div>
    </div>
  )
}
