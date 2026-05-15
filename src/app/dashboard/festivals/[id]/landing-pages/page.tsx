'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import {
  ArrowLeft,
  Plus,
  ExternalLink,
  Lock,
  Crown,
  Loader2,
  Globe,
  Clock,
  ClipboardList,
  ChevronRight,
  Trash2,
  X,
  Heart,
  HandHelping,
  GraduationCap,
  Phone,
} from 'lucide-react'
import Link from 'next/link'
import { PAGE_TYPE_CONFIG, ALL_PAGE_TYPES, type PageType } from '@/lib/landing-page-types'

interface PageSummary {
  id: string
  pageType: string
  pageSlug: string
  title: string
  isPublished: boolean
  createdAt: string
  _count: { subscribers: number }
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  WEBINAR: <Globe className="w-5 h-5" />,
  EARLY_BIRD: <Clock className="w-5 h-5" />,
  WAITLIST: <ClipboardList className="w-5 h-5" />,
  RETREAT_INTEREST: <Heart className="w-5 h-5" />,
  VOLUNTEER: <HandHelping className="w-5 h-5" />,
  SCHOLARSHIP: <GraduationCap className="w-5 h-5" />,
  DISCOVERY_CALL: <Phone className="w-5 h-5" />,
}

export default function LandingPagesListPage() {
  const params = useParams()
  const router = useRouter()
  const festivalId = params.id as string
  const { limits } = usePlanLimits()
  // TODO: restrict to Pro+ when ready
  const isPro = limits === null ? null : true

  const [festivalSlug, setFestivalSlug] = useState('')
  const [festivalName, setFestivalName] = useState('')
  const [pages, setPages] = useState<PageSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // New page modal state
  const [showNewModal, setShowNewModal] = useState(false)
  const [newType, setNewType] = useState<PageType>('WEBINAR')
  const [newTitle, setNewTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadPages = () => {
    Promise.all([
      fetch(`/api/admin/festivals/${festivalId}`).then(r => r.json()),
      fetch(`/api/admin/festivals/${festivalId}/landing-pages`).then(r => r.json()),
    ])
      .then(([festData, pagesData]) => {
        setFestivalSlug(festData.festival?.slug || '')
        setFestivalName(festData.festival?.name || '')
        setPages(pagesData.pages || [])
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (!festivalId) return
    loadPages()
  }, [festivalId])

  const handleCreate = async () => {
    if (!newTitle.trim()) { setCreateError('Please enter a name for this page.'); return }
    setIsCreating(true)
    setCreateError('')
    try {
      const res = await fetch(`/api/admin/festivals/${festivalId}/landing-pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageType: newType, title: newTitle.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create page')
      router.push(`/dashboard/festivals/${festivalId}/landing-pages/${data.page.id}`)
    } catch (err: any) {
      setCreateError(err.message)
      setIsCreating(false)
    }
  }

  const handleDelete = async (pageId: string) => {
    if (!confirm('Delete this page and all its subscriber data? This cannot be undone.')) return
    setDeletingId(pageId)
    try {
      await fetch(`/api/admin/festivals/${festivalId}/landing-pages/${pageId}`, { method: 'DELETE' })
      setPages(ps => ps.filter(p => p.id !== pageId))
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading || isPro === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (!isPro) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href={`/dashboard/festivals/${festivalId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Event
              </Button>
            </Link>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Pro Feature</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Landing pages and signup collection are available on the Pro plan.
            </p>
            <Link href="/pricing">
              <Button className="bg-red-600 hover:bg-red-700 text-white">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/festivals/${festivalId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Landing Pages & Signups</h1>
              <p className="text-sm text-gray-500">{festivalName}</p>
            </div>
          </div>
          <Button
            onClick={() => { setShowNewModal(true); setNewTitle(''); setCreateError('') }}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New page
          </Button>
        </div>

        {/* Page list */}
        {pages.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-1">No pages yet</h3>
              <p className="text-sm text-gray-500 mb-5">
                Create your first signup page — for a webinar, early bird launch, or waitlist.
              </p>
              <Button
                onClick={() => setShowNewModal(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create first page
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {pages.map(page => {
              const cfg = PAGE_TYPE_CONFIG[page.pageType as PageType] ?? PAGE_TYPE_CONFIG.WEBINAR
              const publicUrl = festivalSlug
                ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${festivalSlug}/register/${page.pageSlug}`
                : null
              return (
                <Card key={page.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white"
                        style={{ backgroundColor: '#3b82f6' }}
                      >
                        {TYPE_ICONS[page.pageType] ?? <Globe className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 text-sm truncate">{page.title}</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {cfg.label}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              page.isPublished
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {page.isPublished ? 'Live' : 'Draft'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <p className="text-xs text-gray-500">
                            {page._count.subscribers} subscriber{page._count.subscribers !== 1 ? 's' : ''}
                          </p>
                          {publicUrl && page.isPublished && (
                            <a
                              href={publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline flex items-center gap-0.5"
                              onClick={e => e.stopPropagation()}
                            >
                              View live
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleDelete(page.id)}
                          disabled={deletingId === page.id}
                          className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete page"
                        >
                          {deletingId === page.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                        <Link href={`/dashboard/festivals/${festivalId}/landing-pages/${page.id}`}>
                          <Button variant="outline" size="sm">
                            Edit
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* New Page Modal */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowNewModal(false) }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-base font-bold text-gray-900">Create a new page</h2>
              <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Type selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What is this page for?</label>
                <div className="space-y-2">
                  {ALL_PAGE_TYPES.map(type => {
                    const cfg = PAGE_TYPE_CONFIG[type]
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          // Auto-update the title only if it still matches the previous type's label
                          const prevLabel = PAGE_TYPE_CONFIG[newType].label
                          setNewType(type)
                          if (!newTitle || newTitle === prevLabel) setNewTitle(cfg.label)
                        }}
                        className={`w-full text-left p-3 rounded-xl border-2 transition-all ${
                          newType === type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-blue-500">{TYPE_ICONS[type]}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{cfg.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{cfg.description}</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page name <span className="text-xs text-gray-400">(internal, not shown to visitors)</span>
                </label>
                <Input
                  placeholder={`e.g. Summer ${PAGE_TYPE_CONFIG[newType].label}`}
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
                  autoFocus
                />
              </div>

              {createError && (
                <p className="text-sm text-red-600">{createError}</p>
              )}
            </div>
            <div className="p-5 pt-3 border-t border-gray-100 flex gap-2 justify-end flex-shrink-0">
              <Button variant="outline" onClick={() => setShowNewModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating || !newTitle.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Create & edit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
