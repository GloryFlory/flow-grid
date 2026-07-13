import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import { DONATION_URL } from '@/config/payments'
import {
  ArrowRight, BarChart3, Globe, Smartphone, Zap, Ticket, Briefcase,
  Star, CalendarPlus, SlidersHorizontal, Layout, Users, Building2, Code2, Layers, Camera,
} from 'lucide-react'
import MarketingNav from '@/components/marketing/MarketingNav'
import EventSwitcher from '@/components/marketing/EventSwitcher'
import StatsStrip from '@/components/marketing/StatsStrip'

export const metadata: Metadata = {
  title: { absolute: 'Flow Grid — Event Schedule Builder for Festivals & Retreats' },
  description: 'Turn a messy spreadsheet into a beautiful, branded, mobile-first schedule your attendees will actually use — live in minutes. Free to start.',
  openGraph: {
    title: 'Flow Grid — The schedule builder festivals actually run on.',
    description: 'Turn a messy spreadsheet into a beautiful, branded, mobile-first schedule your attendees will actually use — live in minutes.',
    url: 'https://tryflowgrid.com',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Flow Grid',
  applicationCategory: 'BusinessApplication',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  description: 'Event scheduling software for festivals, retreats, workshops and conferences.',
  url: 'https://tryflowgrid.com',
  operatingSystem: 'Web',
}

const C = {
  ink:    '#0b0e14',
  ink2:   '#3a3f4b',
  soft:   '#6b7280',
  line:   '#e7e8ec',
  line2:  '#eef0f3',
  bg:     '#ffffff',
  gray:   '#f6f7f9',
  accent: '#ff7119',
  accentD:'#d9440f',
  navy:   '#2a468b',
  green:  '#466d60',
}

export default function HomePage() {
  return (
    <div style={{ fontFamily: 'var(--font-space-grotesk), -apple-system, sans-serif', color: C.ink, background: C.bg }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      <MarketingNav />

      {/* ── DARK HERO ───────────────────────────────────────────────────── */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(160deg, #0c1628 0%, #0f2044 60%, #0c1628 100%)',
        overflow: 'hidden',
        paddingBottom: 72,
      }}>
        {/* dot grid */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          pointerEvents: 'none',
        }} />
        {/* bottom fade */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 90,
          background: 'linear-gradient(to bottom, transparent, rgba(12,22,40,0.7))',
          pointerEvents: 'none', zIndex: 1,
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1160, margin: '0 auto', padding: '80px 28px 0', textAlign: 'center' }}>
          {/* chip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
            color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600,
            padding: '5px 13px 5px 8px', borderRadius: 100, marginBottom: 28,
          }}>
            <span style={{
              background: C.navy, color: '#fff', fontWeight: 700, fontSize: 11,
              padding: '2px 8px', borderRadius: 100,
            }}>NEW</span>
            Landing pages &amp; waitlists for every event
          </div>

          {/* headline */}
          <h1 style={{
            fontSize: 'clamp(38px, 6vw, 64px)', lineHeight: 1.02,
            letterSpacing: '-0.035em', fontWeight: 700,
            maxWidth: 820, margin: '0 auto 22px', color: '#fff',
          }}>
            The schedule builder<br />festivals actually <span style={{ color: C.accent }}>run on</span>.
          </h1>

          <p style={{
            fontSize: 19, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)',
            maxWidth: 540, margin: '0 auto 32px', fontWeight: 400,
          }}>
            Turn a messy spreadsheet into a beautiful, branded, mobile-first schedule your attendees will actually use — live in minutes.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
            <Link href="/auth/signin" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontWeight: 600, fontSize: 15, background: C.accent, color: '#fff',
              borderRadius: 9, padding: '12px 22px', textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(255,113,25,0.4)', transition: '.14s',
            }} className="hover:bg-[#d9440f]">
              Start free <ArrowRight size={16} />
            </Link>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontWeight: 500, marginBottom: 64 }}>
            Free to start · No credit card required
          </p>

          <EventSwitcher />
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section style={{ padding: '80px 28px', background: '#fff' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: 12.5, fontWeight: 700, letterSpacing: '.05em',
            textTransform: 'uppercase', color: C.soft, marginBottom: 48,
          }}>
            What organisers say
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }} className="max-md:grid-cols-1">
            {[
              {
                quote: 'Finally I don\'t have to use printed out Excel spreadsheets anymore. Our attendees always have the latest version.',
                author: 'Sarah M.',
                role: 'Yoga retreat organiser, Vienna',
                accent: C.green,
              },
              {
                quote: 'I love how I can update it instantly. No more worrying about outdated printouts mid-event when the schedule changes.',
                author: 'Tom K.',
                role: 'Acro festival director, Berlin',
                accent: C.navy,
              },
              {
                quote: 'It\'s done so quickly. A huge headache of our event setup has just gone. I genuinely can\'t believe we used to do it any other way.',
                author: 'Maria V.',
                role: 'Workshop series organiser, Amsterdam',
                accent: C.accent,
              },
            ].map(({ quote, author, role, accent }) => (
              <div key={author} style={{
                border: `1px solid ${C.line}`, borderRadius: 16, padding: '28px 28px 24px',
                background: '#fff', display: 'flex', flexDirection: 'column',
                borderTop: `3px solid ${accent}`,
              }}>
                <p style={{ fontSize: 16, lineHeight: 1.65, color: C.ink, fontWeight: 400, flexGrow: 1, margin: '0 0 24px' }}>
                  &ldquo;{quote}&rdquo;
                </p>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{author}</div>
                  <div style={{ fontSize: 13, color: C.soft, marginTop: 3 }}>{role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── LOGO STRIP ──────────────────────────────────────────────────── */}
      <section style={{ padding: '64px 28px 64px', background: '#fff' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: 12, letterSpacing: '.08em',
            textTransform: 'uppercase', color: C.soft, fontWeight: 600, marginBottom: 28,
          }}>
            Powering schedules across Europe, Australia and beyond
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 44, flexWrap: 'wrap' }}>
            {[
              { src: '/festival1.png', alt: 'European Acro Festival', href: 'https://www.facebook.com/europeanacrofestival/' },
              { src: '/festival2.png', alt: 'Mediterranean Acro Convention', href: 'https://acrointhesun.com/' },
              { src: '/festival3.png', alt: 'Australian Partner Acrobatic Convention', href: 'https://www.spincircus.com/event-details' },
              { src: '/festival4.png', alt: 'Spin Festival', href: 'https://www.spincircus.com/spin2026' },
              { src: '/festival5.png', alt: 'Easter Acro', href: 'https://easteracro.be/#_' },
              { src: '/SAC Logo No Dates.png', alt: 'Standing Acro Convention', href: 'https://www.mmacro.co.uk/standing-acro-convention-2026' },
            ].map((p) => (
              <a key={p.src} href={p.href} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center' }}>
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={72} height={72}
                  className="partner-logo"
                  style={{ objectFit: 'contain' }}
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES BENTO ──────────────────────────────────────────────── */}
      <section style={{ padding: '16px 28px 88px', background: C.gray }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <p style={{
            textAlign: 'center', fontSize: 12.5, fontWeight: 700, letterSpacing: '.05em',
            textTransform: 'uppercase', color: C.accent, marginBottom: 14,
          }}>
            Everything in one place
          </p>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.08,
            letterSpacing: '-0.03em', fontWeight: 700, maxWidth: 640, margin: '0 auto 14px',
          }}>
            Built for the way events really run
          </h2>
          <p style={{
            textAlign: 'center', fontSize: 18, color: C.soft,
            maxWidth: 520, margin: '0 auto 52px', fontWeight: 400,
          }}>
            Made by organisers who were done juggling spreadsheets, email threads, and last-minute changes.
          </p>

          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="max-md:grid-cols-1">
            {/* Publish — wide */}
            <div style={{
              border: `1px solid ${C.line}`, borderRadius: 16, padding: 28,
              background: '#fff', display: 'flex', flexDirection: 'column', gridColumn: 'span 2',
            }} className="max-md:col-span-1">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <Layout size={20} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>From spreadsheet to live schedule in minutes</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55, maxWidth: 360 }}>
                Import from CSV or Google Sheets, arrange sessions where they belong, and publish. Changes go out instantly — no broken formulas, no resending PDFs.
              </p>
            </div>

            {/* Analytics */}
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <BarChart3 size={20} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>See what's working</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55 }}>Real-time analytics on your most-viewed sessions and peak traffic times.</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 72, marginTop: 'auto' }}>
                {[38, 60, 100, 52, 72].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: i === 2 ? C.accent : C.navy, borderRadius: '5px 5px 0 0', height: `${h}%`, opacity: i === 2 ? 1 : 0.8 }} />
                ))}
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }} className="max-md:grid-cols-1">
            {/* Mobile */}
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, background: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <Smartphone size={20} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Beautiful on every phone</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55 }}>Mobile-first and works offline. Attendees can browse, filter, and favourite sessions without installing anything.</p>
            </div>

            {/* Personal schedule / Favourites */}
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#fdf4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <Star size={20} color="#c4830a" />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>My Schedule</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55 }}>Attendees star their favourite sessions and build a personal schedule — no login needed, saved right in the browser.</p>
            </div>

            {/* Calendar export */}
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#e8f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <CalendarPlus size={20} color={C.green} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Add to calendar</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55 }}>One tap to export any session to Google Calendar, Apple Calendar, or Outlook. Attendees never miss their workshop.</p>
            </div>
          </div>

          {/* Row 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }} className="max-md:grid-cols-1">
            {/* Filtering */}
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#eef2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <SlidersHorizontal size={20} color={C.navy} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Smart filters</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55 }}>Filter by level, teacher, style, or time slot. Attendees find exactly what they want without scrolling endlessly.</p>
            </div>

            {/* Teacher profiles */}
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#e8f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <Camera size={20} color={C.green} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Your teachers look the part</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55 }}>Upload headshots and let attendees know who they&apos;re learning from. Built-in cropping keeps every photo sharp and consistent — no more pixelated thumbnails.</p>
              <div style={{ display: 'flex', marginTop: 'auto', paddingTop: 16 }}>
                {[C.navy, C.green, '#b40225', '#edb75b', C.accent].map((c, i) => (
                  <div key={c} style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: c, border: '2px solid #fff',
                    marginLeft: i > 0 ? -8 : 0,
                  }} />
                ))}
              </div>
            </div>

            {/* Branding */}
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <Globe size={20} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Completely on-brand</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55, marginBottom: 16 }}>Your logo, colours, fonts and own URL. Looks like it was built by your design team.</p>
              <div style={{ display: 'flex', gap: 9, marginTop: 'auto' }}>
                {[C.navy, C.green, '#edb75b', C.accent, '#b40225'].map((c) => (
                  <div key={c} style={{ width: 28, height: 28, borderRadius: 8, background: c }} />
                ))}
              </div>
            </div>
          </div>

          {/* Row 4 — Landing pages wide */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }} className="max-md:grid-cols-1">
            <div style={{
              border: `1px solid ${C.line}`, borderRadius: 16, padding: 28,
              background: '#fff', display: 'flex', flexDirection: 'column',
              gridColumn: 'span 2',
            }} className="max-md:col-span-1">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#fdece2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <Zap size={20} color={C.accent} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Landing pages & waitlists</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55, maxWidth: 400 }}>
                Every event gets a beautiful landing page with your lineup, dates, and a built-in waitlist. Collect sign-ups before the schedule is even ready.
              </p>
            </div>

            <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#e8f0eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <BarChart3 size={20} color={C.green} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Organised dashboard</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55 }}>All your events in one place. Duplicate last year's schedule, manage your team, and track analytics across events.</p>
            </div>
          </div>

          {/* Row 5 — Bookings + Team */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 16 }} className="max-md:grid-cols-1">
            {/* Booking system */}
            <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: 28, background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#fdf4e7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <Ticket size={20} color="#c4830a" />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Bookable sessions</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55 }}>Set capacity limits per session. Attendees claim their spot, and an automatic waitlist handles the overflow.</p>
            </div>

            {/* Team collaboration — wide */}
            <div style={{
              border: `1px solid ${C.line}`, borderRadius: 16, padding: 28,
              background: '#fff', display: 'flex', flexDirection: 'column',
              gridColumn: 'span 2',
            }} className="max-md:col-span-1">
              <div style={{ width: 40, height: 40, borderRadius: 11, background: '#eef2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, flexShrink: 0 }}>
                <Users size={20} color={C.navy} />
              </div>
              <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 }}>Work together as a team</h3>
              <p style={{ fontSize: 14.5, color: C.soft, lineHeight: 1.55, maxWidth: 400 }}>Invite co-organisers and give them exactly the access they need — admin, editor, or view-only. Everyone works from the same schedule, no more emailing files back and forth.</p>
            </div>
          </div>

          {/* Enterprise tile */}
          <div style={{
            marginTop: 16, borderRadius: 16, padding: '32px 36px',
            background: 'linear-gradient(135deg, #0f1c3f 0%, #162647 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={20} color="rgba(255,255,255,0.8)" />
                </div>
                <div>
                  <h3 style={{ fontSize: 19, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', margin: 0 }}>Enterprise</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', margin: 0 }}>For platforms, venue groups &amp; festival networks</p>
                </div>
              </div>
              <Link
                href="/contact"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  fontWeight: 600, fontSize: 14, color: '#fff',
                  background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 9, padding: '9px 18px', textDecoration: 'none', whiteSpace: 'nowrap',
                }}
              >
                Talk to us <ArrowRight size={14} />
              </Link>
            </div>

            {/* Capability blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }} className="max-md:grid-cols-2">
              {([
                { Icon: Globe,     label: 'White-label ready',       desc: 'Your brand, colours & custom domain' },
                { Icon: Code2,     label: 'API & Embed',             desc: 'Single script tag or REST API' },
                { Icon: Layers,    label: 'Multi-event management',  desc: 'Portfolios, networks & venue groups' },
                { Icon: Briefcase, label: 'Custom integrations',     desc: 'Connect your existing booking system' },
              ] as const).map(({ Icon, label, desc }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.05)', borderRadius: 12,
                  padding: '18px 20px', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <Icon size={18} color="rgba(255,255,255,0.65)" style={{ marginBottom: 10 }} />
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: '#fff', margin: '0 0 4px' }}>{label}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.45, margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* See all features link */}
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <Link href="/pricing" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 15, fontWeight: 600, color: C.navy, textDecoration: 'none',
            }}
              className="hover:opacity-70 transition-opacity"
            >
              See everything that&apos;s included <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section style={{ padding: '88px 0' }}>
        <StatsStrip />
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '0 28px 88px', background: C.bg }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <p style={{ textAlign: 'center', fontSize: 12.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: C.accent, marginBottom: 14 }}>Pricing</p>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.08, letterSpacing: '-0.03em', fontWeight: 700, maxWidth: 640, margin: '0 auto 14px' }}>Free. Yes, really.</h2>
          <p style={{ textAlign: 'center', fontSize: 18, color: C.soft, maxWidth: 560, margin: '0 auto 52px', fontWeight: 400 }}>Every feature included. No paid tiers, no trials — Flow Grid is supported by donations, not subscriptions.</p>

          <div style={{ maxWidth: 640, margin: '0 auto', border: `2px solid ${C.navy}`, borderRadius: 16, padding: 34, background: '#fafbff' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 600, color: C.soft, textDecoration: 'line-through' }}>€29/mo</span>
              <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: '-0.04em', color: C.ink }}>€0</span>
            </div>
            <p style={{ textAlign: 'center', fontSize: 14, color: C.soft, margin: '0 0 26px' }}>
              What used to be the Pro plan is now the only plan — for everyone.
            </p>
            <ul style={{ fontSize: 14.5, color: C.ink2, lineHeight: 2.2, listStyle: 'none', padding: 0, margin: '0 0 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }} className="max-sm:grid-cols-1">
              {['Unlimited sessions', 'Custom colours, logo & fonts', 'QR code poster', 'Embed widget & duplicate', 'Detailed analytics & export', 'Team collaboration'].map(f => (
                <li key={f} style={{ display: 'flex', gap: 8 }}><span style={{ color: C.green }}>✓</span>{f}</li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/auth/signin" style={{ display: 'inline-block', textAlign: 'center', fontWeight: 600, fontSize: 14.5, background: C.navy, borderRadius: 9, padding: '11px 26px', textDecoration: 'none', color: '#fff', transition: '.14s' }} className="hover:bg-[#1e3470]">
                Start free →
              </Link>
              <a href={DONATION_URL} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', textAlign: 'center', fontWeight: 600, fontSize: 14.5, border: `1px solid ${C.line}`, borderRadius: 9, padding: '11px 26px', textDecoration: 'none', color: C.ink, transition: '.14s' }} className="hover:border-[#cfd2d8] hover:bg-[#f6f7f9]">
                ♥ Support with a donation
              </a>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link href="/pricing" style={{ fontSize: 14.5, fontWeight: 600, color: C.navy, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }} className="hover:underline">
              Why is it free? <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED ARTICLES ───────────────────────────────────────────── */}
      <section style={{ padding: '80px 28px', background: C.gray }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 12 }}>
            <div>
              <p style={{ fontSize: 12.5, fontWeight: 700, letterSpacing: '.05em', textTransform: 'uppercase', color: C.accent, marginBottom: 6 }}>From the blog</p>
              <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.025em', margin: 0 }}>Learn from the experts</h2>
            </div>
            <Link href="/blog" style={{ fontSize: 14, fontWeight: 600, color: C.navy, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }} className="hover:underline">
              All articles <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }} className="max-md:grid-cols-1">
            {[
              {
                label: 'Guide', href: '/blog/festival-schedule-template-guide',
                title: 'The ultimate festival schedule template guide',
                desc: 'Everything you need to plan, structure and publish a schedule that attendees actually use.',
                color: C.navy,
              },
              {
                label: 'How-to', href: '/blog/get-festival-live-10-minutes',
                title: 'Get your festival schedule live in 10 minutes',
                desc: 'A step-by-step walkthrough from blank slate to published URL — no design skills needed.',
                color: C.green,
              },
              {
                label: 'Planning', href: '/blog/how-to-create-yoga-retreat-schedule',
                title: 'How to create a yoga retreat schedule people love',
                desc: 'From morning practice to evening meals — how to structure your retreat day-by-day.',
                color: '#b40225',
              },
            ].map(({ label, href, title, desc, color }) => (
              <Link key={href} href={href} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  border: `1px solid ${C.line}`, borderRadius: 14, padding: 24, background: '#fff',
                  display: 'flex', flexDirection: 'column', height: '100%',
                  transition: '.14s',
                }} className="hover:shadow-sm hover:border-[#cfd2d8]">
                  <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color, marginBottom: 14 }}>{label}</span>
                  <h3 style={{ fontSize: 16.5, fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.3, marginBottom: 10, color: C.ink }}>{title}</h3>
                  <p style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, flexGrow: 1 }}>{desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13.5, fontWeight: 600, color: C.navy, marginTop: 16 }}>
                    Read more <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section style={{ textAlign: 'center', padding: '96px 28px 96px', background: C.bg }}>
        <div style={{ maxWidth: 1160, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', lineHeight: 1.04, letterSpacing: '-0.035em', fontWeight: 700, marginBottom: 18 }}>
            Your next event,<br />live in ten minutes.
          </h2>
          <p style={{ fontSize: 19, color: C.soft, marginBottom: 30, fontWeight: 400 }}>Free to start. No credit card. Cancel the spreadsheet.</p>
          <Link href="/auth/signin" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontWeight: 600, fontSize: 16, background: C.accent, color: '#fff',
            borderRadius: 9, padding: '14px 26px', textDecoration: 'none', transition: '.14s',
          }} className="hover:bg-[#d9440f]">
            Create your first schedule <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
