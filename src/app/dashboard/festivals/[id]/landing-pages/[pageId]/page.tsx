'use client'
import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/Input'
import {
  ArrowLeft,
  Save,
  Eye,
  ExternalLink,
  Users,
  Download,
  LayoutTemplate,
  Calendar,
  User,
  Globe,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { PAGE_TYPE_CONFIG, type PageType } from '@/lib/landing-page-types'

const TEMPLATES = [
  { id: 'minimal',   name: 'Minimal',   description: 'Clean, single-column. Text-focused.',               requiresDate: false },
  { id: 'hero',      name: 'Hero',      description: 'Bold split-screen with full branding panel.',       requiresDate: false },
  { id: 'speaker',   name: 'Speaker',   description: 'Speaker bio prominent alongside the form.',         requiresDate: false },
  { id: 'countdown', name: 'Countdown', description: 'Live countdown timer as the focal point.',           requiresDate: true  },
]

interface LandingPage {
  template: string
  headline: string
  subheadline: string
  description: string
  ctaText: string
  webinarDate: string
  webinarEndDate: string
  webinarDuration: string
  webinarLink: string
  speakerName: string
  speakerTitle: string
  speakerBio: string
  speakerPhoto: string
  privacyPolicyUrl: string
  isPublished: boolean
  pageType: string
  pageSlug: string
  title: string
}

const DEFAULT_FORM: LandingPage = {
  template: 'minimal',
  headline: '',
  subheadline: '',
  description: '',
  ctaText: 'Sign me up',
  webinarDate: '',
  webinarEndDate: '',
  webinarDuration: '',
  webinarLink: '',
  speakerName: '',
  speakerTitle: '',
  speakerBio: '',
  speakerPhoto: '',
  privacyPolicyUrl: '',
  isPublished: false,
  pageType: 'WEBINAR',
  pageSlug: '',
  title: '',
}

export default function LandingPageBuilder() {
  const params = useParams()
  const festivalId = params.id as string
  const pageId = params.pageId as string

  const [festivalSlug, setFestivalSlug] = useState('')
  const [festivalName, setFestivalName] = useState('')
  const [form, setForm] = useState<LandingPage>(DEFAULT_FORM)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [subscribers, setSubscribers] = useState<{ total: number } | null>(null)
  const [photoUploading, setPhotoUploading] = useState(false)

  useEffect(() => {
    if (!festivalId || !pageId) return
    Promise.all([
      fetch(`/api/admin/festivals/${festivalId}`).then(r => r.json()),
      fetch(`/api/admin/festivals/${festivalId}/landing-pages/${pageId}`).then(r => r.json()),
      fetch(`/api/admin/festivals/${festivalId}/landing-pages/${pageId}/subscribers`).then(r => r.json()),
    ])
      .then(([festData, lpData, subData]) => {
        setFestivalSlug(festData.festival?.slug || '')
        setFestivalName(festData.festival?.name || '')
        if (lpData.landingPage) {
          const lp = lpData.landingPage
          setForm({
            template: lp.template || 'minimal',
            headline: lp.headline || '',
            subheadline: lp.subheadline || '',
            description: lp.description || '',
            ctaText: lp.ctaText || 'Sign me up',
            webinarDate: lp.webinarDate ? new Date(lp.webinarDate).toISOString().slice(0, 16) : '',
            webinarEndDate: lp.webinarEndDate ? new Date(lp.webinarEndDate).toISOString().slice(0, 16) : '',
            webinarDuration: lp.webinarDuration ? String(lp.webinarDuration) : '',
            webinarLink: lp.webinarLink || '',
            speakerName: lp.speakerName || '',
            speakerTitle: lp.speakerTitle || '',
            speakerBio: lp.speakerBio || '',
            speakerPhoto: lp.speakerPhoto || '',
            privacyPolicyUrl: lp.privacyPolicyUrl || '',
            isPublished: lp.isPublished || false,
            pageType: lp.pageType || 'WEBINAR',
            pageSlug: lp.pageSlug || '',
            title: lp.title || '',
          })
        }
        setSubscribers({ total: subData.total || 0 })
      })
      .catch(console.error)
      .finally(() => setIsLoading(false))
  }, [festivalId, pageId])

  const field = (key: keyof LandingPage) => ({
    value: form[key] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  })

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append('photo', file)
      const res = await fetch(
        `/api/admin/festivals/${festivalId}/landing-pages/${pageId}/speaker-photo`,
        { method: 'POST', body: fd }
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setForm(f => ({ ...f, speakerPhoto: data.url }))
    } catch (err: any) {
      alert(`Photo upload failed: ${err.message}`)
    } finally {
      setPhotoUploading(false)
      e.target.value = ''
    }
  }

  const handleSave = async (published?: boolean) => {
    setIsSaving(true)
    setSaveSuccess(false)
    try {
      const payload = {
        ...form,
        isPublished: published !== undefined ? published : form.isPublished,
        webinarDuration: form.webinarDuration ? parseInt(form.webinarDuration) : null,
        webinarDate: form.webinarDate || null,
        webinarEndDate: form.webinarEndDate || null,
      }
      const res = await fetch(`/api/admin/festivals/${festivalId}/landing-pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setForm(f => ({ ...f, isPublished: data.landingPage.isPublished }))
      setSaveSuccess(true)
      try { localStorage.removeItem('flowgrid-lp-draft') } catch {}
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    if (!festivalSlug || !form.pageSlug) return
    try {
      localStorage.setItem('flowgrid-lp-draft', JSON.stringify({
        slug: festivalSlug,
        pageSlug: form.pageSlug,
        form,
        storedAt: Date.now(),
      }))
    } catch {}
    window.open(`/${festivalSlug}/register/${form.pageSlug}?preview=true`, '_blank', 'noopener,noreferrer')
  }

  const handleExportCSV = () => {
    window.open(`/api/admin/festivals/${festivalId}/landing-pages/${pageId}/subscribers?format=csv`)
  }

  const publicUrl = festivalSlug && form.pageSlug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/${festivalSlug}/register/${form.pageSlug}`
    : ''

  const ptCfg = PAGE_TYPE_CONFIG[form.pageType as PageType] ?? PAGE_TYPE_CONFIG.WEBINAR

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/festivals/${festivalId}/landing-pages`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Pages
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {form.title || 'Untitled page'}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {ptCfg.label}
                </span>
              </div>
              <p className="text-sm text-gray-500">{festivalName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePreview} disabled={!festivalSlug}>
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button
              onClick={() => handleSave()}
              disabled={isSaving || !form.headline}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : saveSuccess ? (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saveSuccess ? 'Saved!' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main builder */}
          <div className="lg:col-span-2 space-y-5">
            {/* Template picker */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <LayoutTemplate className="w-4 h-4" />
                  Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {TEMPLATES.filter(t => !t.requiresDate || ptCfg.showDate).map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, template: t.id }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        form.template === t.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t.description}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Headline <span className="text-red-500">*</span>
                  </label>
                  <Input placeholder="e.g. Join Our Free Yoga & Breathwork Webinar" {...field('headline')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subheadline</label>
                  <Input placeholder="e.g. Learn the fundamentals live with our lead instructor" {...field('subheadline')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[100px] resize-y"
                    placeholder="What will attendees get? What should they expect?"
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CTA Button Text</label>
                  <Input placeholder={ptCfg.defaultCta} {...field('ctaText')} />
                </div>
              </CardContent>
            </Card>

            {/* Event details — conditional based on page type */}
            {(ptCfg.showDate || ptCfg.showDuration || ptCfg.showJoinLink) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-4 h-4" />
                    Event Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(ptCfg.showDate || ptCfg.showDuration) && (
                    <div className="grid grid-cols-2 gap-4">
                      {ptCfg.showDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {ptCfg.dateLabel}
                          </label>
                          <Input type="datetime-local" {...field('webinarDate')} />
                        </div>
                      )}
                      {ptCfg.showDate && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            End date <span className="text-gray-400 font-normal">(optional)</span>
                          </label>
                          <Input type="datetime-local" {...field('webinarEndDate')} />
                        </div>
                      )}
                      {ptCfg.showDuration && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                          <Input type="number" placeholder="60" min="1" max="480" {...field('webinarDuration')} />
                        </div>
                      )}
                    </div>
                  )}
                  {ptCfg.showJoinLink && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {ptCfg.joinLinkLabel}
                      </label>
                      <Input placeholder={ptCfg.joinLinkPlaceholder} {...field('webinarLink')} />
                      <p className="text-xs text-gray-500 mt-1">
                        Shown as a "{ptCfg.joinButtonText}" button on the page and in the confirmation email.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Speaker */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4" />
                  Speaker / Host
                  <span className="text-xs font-normal text-gray-500 ml-1">(shown on all templates)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <Input placeholder="e.g. Sarah Johnson" {...field('speakerName')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title / Role</label>
                    <Input placeholder="e.g. Lead Instructor" {...field('speakerTitle')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[80px] resize-y"
                    placeholder="A short bio about the speaker..."
                    value={form.speakerBio}
                    onChange={e => setForm(f => ({ ...f, speakerBio: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
                  <div className="flex items-center gap-3">
                    {form.speakerPhoto && (
                      <img
                        src={form.speakerPhoto}
                        alt="Speaker"
                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-gray-200"
                      />
                    )}
                    <label className={`flex-1 cursor-pointer flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors ${photoUploading ? 'opacity-60 pointer-events-none' : ''}`}>
                      {photoUploading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                      ) : (
                        <><User className="w-4 h-4 text-gray-400" /> {form.speakerPhoto ? 'Change photo' : 'Upload photo'}</>
                      )}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="sr-only"
                        onChange={handlePhotoUpload}
                        disabled={photoUploading}
                      />
                    </label>
                    {form.speakerPhoto && (
                      <button
                        type="button"
                        onClick={() => setForm(f => ({ ...f, speakerPhoto: '' }))}
                        className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="w-4 h-4" />
                  Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy URL</label>
                  <Input placeholder="https://yourwebsite.com/privacy" {...field('privacyPolicyUrl')} />
                  <p className="text-xs text-gray-500 mt-1">
                    Linked from the consent checkbox. Leave blank to fall back to FlowGrid's privacy policy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Publish */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Status</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      form.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {form.isPublished ? 'Live' : 'Draft'}
                  </span>
                </div>
                {form.isPublished && publicUrl && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Public URL</p>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all flex items-start gap-1"
                    >
                      {publicUrl}
                      <ExternalLink className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    </a>
                  </div>
                )}
                {!form.isPublished ? (
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={isSaving || !form.headline}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="sm"
                  >
                    Publish Page
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    variant="outline"
                    className="w-full text-gray-700"
                    size="sm"
                  >
                    Unpublish
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Subscribers */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="w-4 h-4" />
                  Subscribers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-2">
                  <p className="text-3xl font-bold text-gray-900">{subscribers?.total ?? 0}</p>
                  <p className="text-sm text-gray-500">active subscribers</p>
                </div>
                <Button
                  onClick={handleExportCSV}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={!subscribers || subscribers.total === 0}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </CardContent>
            </Card>

            {/* GDPR */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-amber-800 mb-1">GDPR Reminder</p>
              <p className="text-xs text-amber-700 leading-relaxed">
                All signups include a timestamped consent record. Subscribers can unsubscribe with one
                click. As the event organiser, you are the data controller for this list.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
