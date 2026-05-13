'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Loader2, CheckCircle2, Calendar, Clock, Globe } from 'lucide-react'
import Image from 'next/image'
import { PAGE_TYPE_CONFIG, type PageType } from '@/lib/landing-page-types'

interface LandingPage {
  pageType?: string
  template: string
  headline: string
  subheadline?: string
  description?: string
  ctaText: string
  webinarDate?: string
  webinarDuration?: number
  webinarLink?: string
  webinarEndDate?: string
  speakerName?: string
  speakerTitle?: string
  speakerBio?: string
  speakerPhoto?: string
  privacyPolicyUrl?: string
  isPublished?: boolean
}

interface Festival {
  name: string
  slug: string
  logo?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  headerFont?: string
  location?: string
}

interface PageData {
  festival: Festival
  landingPage: LandingPage
  isPreview?: boolean
}

function formatEventDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
function formatEventTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
function darken(hex: string, pct: number) {
  const n = parseInt(hex.replace('#', ''), 16)
  const amt = Math.round(2.55 * pct)
  const R = Math.max((n >> 16) - amt, 0)
  const G = Math.max((n >> 8 & 0xff) - amt, 0)
  const B = Math.max((n & 0xff) - amt, 0)
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)
}

const PreviewCtx = createContext(false)

function getDraftFromLocalStorage(slug: string, pageSlug: string): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('flowgrid-lp-draft')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.slug !== slug) return null
    if (parsed.pageSlug && parsed.pageSlug !== pageSlug) return null
    if (Date.now() - parsed.storedAt > 15 * 60 * 1000) return null
    return parsed.form as Record<string, unknown>
  } catch {
    return null
  }
}

function JoinButton({ url, text, primaryColor }: { url: string; text: string; primaryColor: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-opacity hover:opacity-90"
      style={{ backgroundColor: primaryColor }}
    >
      <Globe className="w-4 h-4" />
      {text}
    </a>
  )
}

function SignupForm({
  ctaText, primaryColor, privacyPolicyUrl, slug, pageSlug, onSuccess,
}: {
  ctaText: string
  primaryColor: string
  privacyPolicyUrl?: string
  slug: string
  pageSlug: string
  onSuccess: () => void
}) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', consent: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const previewMode = useContext(PreviewCtx)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.consent) { setError('Please tick the consent box to continue.'); return }
    if (previewMode) { onSuccess(); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/public/festivals/${slug}/register/${pageSlug}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      onSuccess()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 w-full">
      <div className="grid grid-cols-2 gap-3">
        <Input placeholder="First name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} className="bg-white" />
        <Input placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} className="bg-white" />
      </div>
      <Input type="email" placeholder="Your email address" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="bg-white" />
      <label className="flex items-start gap-2 cursor-pointer">
        <input type="checkbox" checked={form.consent} onChange={e => setForm(f => ({ ...f, consent: e.target.checked }))} className="mt-1 flex-shrink-0 accent-current" required />
        <span className="text-xs text-gray-600 leading-relaxed">
          I agree to receive event updates and information. I understand I can unsubscribe at any time.{' '}
          <a href={privacyPolicyUrl || '/privacy'} target="_blank" rel="noopener noreferrer" className="underline">Privacy Policy</a>
        </span>
      </label>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button type="submit" disabled={loading} className="w-full py-3 px-6 rounded-lg font-semibold text-white text-base transition-opacity disabled:opacity-60 flex items-center justify-center gap-2" style={{ backgroundColor: primaryColor }}>
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {ctaText}
      </button>
    </form>
  )
}

const SUCCESS_COPY: Record<string, { title: string; body: string }> = {
  EARLY_BIRD:       { title: "You're on the early bird list!", body: "We'll let you know as soon as tickets go live." },
  WAITLIST:         { title: "You're on the waitlist!",        body: "We'll let you know as soon as spots open up." },
  RETREAT_INTEREST: { title: "Thanks for your interest!",      body: "We'll be in touch with more details soon." },
  VOLUNTEER:        { title: 'Application received!',          body: "We'll review your application and be in touch." },
  SCHOLARSHIP:      { title: 'Application received!',          body: "We'll review your application and be in touch soon." },
  DISCOVERY_CALL:   { title: 'Request received!',              body: "We'll reach out soon to schedule a time that works for you." },
}

function SuccessMessage({ primaryColor, pageType }: { primaryColor: string; pageType?: string }) {
  const { title, body } = (pageType && SUCCESS_COPY[pageType]) ?? { title: "You're signed up!", body: "Check your inbox — we've sent you a confirmation email." }
  return (
    <div className="text-center py-8 space-y-3">
      <CheckCircle2 className="w-14 h-14 mx-auto" style={{ color: primaryColor }} />
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      <p className="text-gray-600 text-sm">{body}</p>
    </div>
  )
}

function SpeakerCard({ lp, primary, size = 'md' }: { lp: LandingPage; primary: string; size?: 'sm' | 'md' | 'lg' }) {
  if (!lp.speakerName && !lp.speakerPhoto) return null
  const imgSize = size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12'
  return (
    <div className={`flex items-start gap-3 p-4 bg-gray-50 rounded-xl ${size === 'sm' ? 'items-center' : ''}`}>
      {lp.speakerPhoto ? (
        <img src={lp.speakerPhoto} alt={lp.speakerName || 'Speaker'} className={`${imgSize} rounded-full object-cover flex-shrink-0`} />
      ) : lp.speakerName ? (
        <div className={`${imgSize} rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold`} style={{ backgroundColor: primary }}>
          {lp.speakerName.charAt(0)}
        </div>
      ) : null}
      <div>
        {lp.speakerName && <p className={`font-semibold text-gray-900 ${size === 'sm' ? 'text-sm' : ''}`}>{lp.speakerName}</p>}
        {lp.speakerTitle && <p className="text-xs text-gray-500 mt-0.5">{lp.speakerTitle}</p>}
        {size !== 'sm' && lp.speakerBio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{lp.speakerBio}</p>}
      </div>
    </div>
  )
}

function MinimalTemplate({ festival, lp, pageSlug }: { festival: Festival; lp: LandingPage; pageSlug: string }) {
  const [submitted, setSubmitted] = useState(false)
  const primary = festival.primaryColor || '#4a90e2'
  const ptCfg = PAGE_TYPE_CONFIG[(lp.pageType as PageType) ?? 'WEBINAR']

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {festival.logo && (
          <div className="text-center mb-6">
            <Image src={festival.logo} alt={festival.name} width={80} height={80} className="mx-auto h-16 w-auto" />
          </div>
        )}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <p className="text-sm font-semibold uppercase tracking-wider mb-2" style={{ color: primary }}>{festival.name}</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{lp.headline}</h1>
          {lp.subheadline && <p className="text-gray-600 mb-4">{lp.subheadline}</p>}
          {lp.webinarDate && (
            <div className="mb-4 space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span>
                  {ptCfg.showDuration
                    ? `${formatEventDate(lp.webinarDate)} at ${formatEventTime(lp.webinarDate)}`
                    : formatEventDate(lp.webinarDate)}
                  {lp.webinarDuration && ptCfg.showDuration && ` · ${lp.webinarDuration} min`}
                </span>
              </div>
              {lp.webinarEndDate && (
                <p className="text-sm text-gray-400 pl-6">Closes {formatEventDate(lp.webinarEndDate)}</p>
              )}
            </div>
          )}
          {lp.description && <p className="text-sm text-gray-600 mb-6 leading-relaxed">{lp.description}</p>}
          {lp.webinarLink && ptCfg.joinButtonText && (
            <div className="mb-5">
              <JoinButton url={lp.webinarLink} text={ptCfg.joinButtonText} primaryColor={primary} />
            </div>
          )}
          <SpeakerCard lp={lp} primary={primary} size="sm" />
          <div className="mt-5">
            {submitted ? <SuccessMessage primaryColor={primary} pageType={lp.pageType} /> : (
              <SignupForm ctaText={lp.ctaText} primaryColor={primary} privacyPolicyUrl={lp.privacyPolicyUrl} slug={festival.slug} pageSlug={pageSlug} onSuccess={() => setSubmitted(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroTemplate({ festival, lp, pageSlug }: { festival: Festival; lp: LandingPage; pageSlug: string }) {
  const [submitted, setSubmitted] = useState(false)
  const primary = festival.primaryColor || '#4a90e2'
  const dark = darken(primary, 20)
  const ptCfg = PAGE_TYPE_CONFIG[(lp.pageType as PageType) ?? 'WEBINAR']

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 flex flex-col justify-center items-start p-10 md:p-16 text-white" style={{ background: `linear-gradient(135deg, ${primary} 0%, ${dark} 100%)` }}>
        {festival.logo && <Image src={festival.logo} alt={festival.name} width={64} height={64} className="h-12 w-auto mb-6 brightness-0 invert" />}
        <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-2">{festival.name}</p>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-3">{lp.headline}</h1>
        {lp.subheadline && <p className="text-lg opacity-90 mb-4">{lp.subheadline}</p>}
        {lp.description && <p className="text-white/80 text-sm leading-relaxed mb-5">{lp.description}</p>}
        {lp.speakerName && (
          <div className="flex items-center gap-3 bg-white/15 rounded-xl px-4 py-3 mb-5">
            {lp.speakerPhoto ? (
              <img src={lp.speakerPhoto} alt={lp.speakerName} className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-bold flex-shrink-0">{lp.speakerName.charAt(0)}</div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">{lp.speakerName}</p>
              {lp.speakerTitle && <p className="text-xs text-white/75">{lp.speakerTitle}</p>}
            </div>
          </div>
        )}
        {lp.webinarDate && (
          <div className="bg-white/20 rounded-xl px-4 py-3 space-y-1">
            <div className="flex items-center gap-2 text-sm"><Calendar className="w-4 h-4" /><span>{formatEventDate(lp.webinarDate)}</span></div>
            {ptCfg.showDuration && (
              <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4" /><span>{formatEventTime(lp.webinarDate)}{lp.webinarDuration ? ` · ${lp.webinarDuration} min` : ''}</span></div>
            )}
            {lp.webinarEndDate && (
              <div className="flex items-center gap-2 text-sm opacity-75"><Calendar className="w-4 h-4" /><span>Closes {formatEventDate(lp.webinarEndDate)}</span></div>
            )}
          </div>
        )}
        {lp.webinarLink && ptCfg.joinButtonText && (
          <div className="mt-5">
            <a href={lp.webinarLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 border border-white/40 rounded-lg text-white font-semibold text-sm hover:bg-white/30 transition-colors">
              <Globe className="w-4 h-4" />{ptCfg.joinButtonText}
            </a>
          </div>
        )}
      </div>
      <div className="md:w-1/2 flex items-center justify-center bg-white p-10 md:p-16">
        <div className="w-full max-w-sm">
          {submitted ? <SuccessMessage primaryColor={primary} pageType={lp.pageType} /> : (
            <SignupForm ctaText={lp.ctaText} primaryColor={primary} privacyPolicyUrl={lp.privacyPolicyUrl} slug={festival.slug} pageSlug={pageSlug} onSuccess={() => setSubmitted(true)} />
          )}
        </div>
      </div>
    </div>
  )
}

function SpeakerTemplate({ festival, lp, pageSlug }: { festival: Festival; lp: LandingPage; pageSlug: string }) {
  const [submitted, setSubmitted] = useState(false)
  const primary = festival.primaryColor || '#4a90e2'
  const ptCfg = PAGE_TYPE_CONFIG[(lp.pageType as PageType) ?? 'WEBINAR']

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        {festival.logo && <Image src={festival.logo} alt={festival.name} width={36} height={36} className="h-9 w-auto" />}
        <span className="font-semibold text-gray-800">{festival.name}</span>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{lp.headline}</h1>
            {lp.subheadline && <p className="text-lg text-gray-600 mb-4">{lp.subheadline}</p>}
            {lp.webinarDate && (
              <div className="mb-6 space-y-1">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {ptCfg.showDuration
                      ? `${formatEventDate(lp.webinarDate)} · ${formatEventTime(lp.webinarDate)}`
                      : formatEventDate(lp.webinarDate)}
                    {lp.webinarDuration && ptCfg.showDuration && ` · ${lp.webinarDuration} min`}
                  </span>
                </div>
                {lp.webinarEndDate && (
                  <p className="text-sm text-gray-400 pl-6">Closes {formatEventDate(lp.webinarEndDate)}</p>
                )}
              </div>
            )}
            {lp.description && <p className="text-gray-600 text-sm leading-relaxed mb-6">{lp.description}</p>}
            {lp.webinarLink && ptCfg.joinButtonText && (
              <div className="mb-6">
                <JoinButton url={lp.webinarLink} text={ptCfg.joinButtonText} primaryColor={primary} />
              </div>
            )}
            <SpeakerCard lp={lp} primary={primary} size="lg" />
          </div>
          <div className="bg-gray-50 rounded-2xl p-7">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">{lp.ctaText}</h2>
            {submitted ? <SuccessMessage primaryColor={primary} pageType={lp.pageType} /> : (
              <SignupForm ctaText={lp.ctaText} primaryColor={primary} privacyPolicyUrl={lp.privacyPolicyUrl} slug={festival.slug} pageSlug={pageSlug} onSuccess={() => setSubmitted(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CountdownTemplate({ festival, lp, pageSlug }: { festival: Festival; lp: LandingPage; pageSlug: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const primary = festival.primaryColor || '#4a90e2'
  const dark = darken(primary, 15)
  const ptCfg = PAGE_TYPE_CONFIG[(lp.pageType as PageType) ?? 'WEBINAR']

  useEffect(() => {
    if (!lp.webinarDate) return
    const target = new Date(lp.webinarDate).getTime()
    const tick = () => {
      const diff = Math.max(target - Date.now(), 0)
      setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), minutes: Math.floor((diff % 3600000) / 60000), seconds: Math.floor((diff % 60000) / 1000) })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [lp.webinarDate])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: `linear-gradient(160deg, ${primary} 0%, ${dark} 100%)` }}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-white text-center">
        {festival.logo && <Image src={festival.logo} alt={festival.name} width={56} height={56} className="h-14 w-auto mb-6 brightness-0 invert" />}
        <p className="text-sm font-semibold uppercase tracking-widest opacity-70 mb-3">{festival.name}</p>
        <h1 className="text-3xl md:text-5xl font-bold max-w-2xl leading-tight mb-4">{lp.headline}</h1>
        {lp.subheadline && <p className="text-lg opacity-85 max-w-xl mb-6">{lp.subheadline}</p>}
        {lp.description && <p className="text-white/80 text-sm max-w-lg mb-8 leading-relaxed">{lp.description}</p>}
        {lp.webinarLink && ptCfg.joinButtonText && (
          <div className="mb-8">
            <a href={lp.webinarLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 border border-white/40 rounded-lg text-white font-semibold text-sm hover:bg-white/30 transition-colors">
              <Globe className="w-4 h-4" />{ptCfg.joinButtonText}
            </a>
          </div>
        )}
        {lp.webinarDate && (
          <div className="flex gap-4 md:gap-6 mb-10">
            {[{ label: 'Days', value: timeLeft.days }, { label: 'Hours', value: timeLeft.hours }, { label: 'Min', value: timeLeft.minutes }, { label: 'Sec', value: timeLeft.seconds }].map(({ label, value }) => (
              <div key={label} className="bg-white/20 rounded-xl px-4 py-3 min-w-[64px]">
                <div className="text-3xl font-bold tabular-nums">{String(value).padStart(2, '0')}</div>
                <div className="text-xs uppercase tracking-wider opacity-75 mt-1">{label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
          {lp.webinarEndDate && (
            <p className="text-gray-400 text-sm text-center mb-4">Early bird closes {formatEventDate(lp.webinarEndDate)}</p>
          )}
          {submitted ? <SuccessMessage primaryColor={primary} pageType={lp.pageType} /> : (
            <SignupForm ctaText={lp.ctaText} primaryColor={primary} privacyPolicyUrl={lp.privacyPolicyUrl} slug={festival.slug} pageSlug={pageSlug} onSuccess={() => setSubmitted(true)} />
          )}
        </div>
      </div>
    </div>
  )
}

export default function RegisterPageBySlug() {
  const params = useParams()
  const searchParams = useSearchParams()
  const slug = params.slug as string
  const pageSlug = params.pageSlug as string
  const isPreview = searchParams.get('preview') === 'true'

  const [data, setData] = useState<PageData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [noPageSaved, setNoPageSaved] = useState(false)
  const [isDraftPreview, setIsDraftPreview] = useState(false)

  useEffect(() => {
    const url = `/api/public/festivals/${slug}/register/${pageSlug}${isPreview ? '?preview=true' : ''}`
    fetch(url)
      .then(async r => {
        if (!r.ok) { setNotFound(true); return null }
        return r.json()
      })
      .then(d => {
        if (!d) return
        const draft = isPreview ? getDraftFromLocalStorage(slug, pageSlug) : null
        if (draft) {
          setIsDraftPreview(true)
          setData({
            festival: d.festival,
            landingPage: {
              pageType: (draft.pageType as string) || 'WEBINAR',
              template: (draft.template as string) || 'minimal',
              headline: (draft.headline as string) || '',
              subheadline: draft.subheadline as string | undefined,
              description: draft.description as string | undefined,
              ctaText: (draft.ctaText as string) || 'Sign me up',
              webinarDate: draft.webinarDate as string | undefined,
              webinarDuration: draft.webinarDuration ? parseInt(String(draft.webinarDuration)) : undefined,
              webinarLink: draft.webinarLink as string | undefined,
              webinarEndDate: draft.webinarEndDate as string | undefined,
              speakerName: draft.speakerName as string | undefined,
              speakerTitle: draft.speakerTitle as string | undefined,
              speakerBio: draft.speakerBio as string | undefined,
              speakerPhoto: draft.speakerPhoto as string | undefined,
              privacyPolicyUrl: draft.privacyPolicyUrl as string | undefined,
              isPublished: false,
            },
          })
        } else if (!d.landingPage) {
          setNoPageSaved(true)
        } else {
          setData(d)
        }
      })
      .catch(() => setNotFound(true))
  }, [slug, pageSlug, isPreview])

  useEffect(() => {
    if (!data?.festival.headerFont) return
    const fontName = data.festival.headerFont
    const id = `gfont-${fontName.replace(/\s+/g, '-').toLowerCase()}`
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id; link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@400;600;700&display=swap`
    document.head.appendChild(link)
  }, [data?.festival.headerFont])

  if (notFound || noPageSaved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-600">This signup page doesn't exist or is no longer active.</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const { festival, landingPage: lp } = data
  const fontStyle = festival.headerFont ? { fontFamily: `'${festival.headerFont}', sans-serif` } : {}
  const showBanner = isDraftPreview || (isPreview && !lp.isPublished)

  return (
    <PreviewCtx.Provider value={!!(isPreview || isDraftPreview)}>
      <div style={fontStyle}>
        {isDraftPreview && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white text-center text-sm py-2.5 px-4 font-medium">
            Draft preview — showing unsaved changes · form submissions are simulated
          </div>
        )}
        {isPreview && !isDraftPreview && !lp.isPublished && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white text-center text-sm py-2.5 px-4 font-medium">
            Preview — this page is not yet published · form submissions are simulated
          </div>
        )}
        {showBanner && <div className="h-10" />}
        {(() => {
          switch (lp.template) {
            case 'hero': return <HeroTemplate festival={festival} lp={lp} pageSlug={pageSlug} />
            case 'speaker': return <SpeakerTemplate festival={festival} lp={lp} pageSlug={pageSlug} />
            case 'countdown': return <CountdownTemplate festival={festival} lp={lp} pageSlug={pageSlug} />
            default: return <MinimalTemplate festival={festival} lp={lp} pageSlug={pageSlug} />
          }
        })()}
      </div>
    </PreviewCtx.Provider>
  )
}
