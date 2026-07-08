import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const alt = 'Event Schedule'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function formatDateRange(start: Date, end: Date): string {
  const sameYear = start.getFullYear() === end.getFullYear()
  const sameMonth = sameYear && start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${start.getDate()}–${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
  }
  if (sameYear) {
    return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
  return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

async function fetchImageAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'image/png'
    return `data:${contentType};base64,${Buffer.from(buffer).toString('base64')}`
  } catch {
    return null
  }
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const festival = await prisma.festival.findUnique({
    where: { slug },
    select: {
      name: true,
      logo: true,
      startDate: true,
      endDate: true,
      location: true,
      primaryColor: true,
      description: true,
    },
  })

  const navy = '#080e1e'
  const accent = festival?.primaryColor || '#ff7119'

  // Fetch logo as base64 so ImageResponse can render it reliably
  const logoBase64 = festival?.logo ? await fetchImageAsBase64(festival.logo) : null

  if (!festival) {
    return new ImageResponse(
      <div
        style={{
          width: '100%', height: '100%',
          background: navy,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ color: '#fff', fontSize: 56, fontWeight: 700 }}>Flow Grid</span>
      </div>,
      { width: 1200, height: 630 }
    )
  }

  const dates = formatDateRange(festival.startDate, festival.endDate)
  const nameFontSize = festival.name.length > 32 ? 52 : festival.name.length > 22 ? 62 : 72

  return new ImageResponse(
    <div
      style={{
        width: '100%', height: '100%',
        background: `linear-gradient(145deg, ${navy} 0%, #0d1d3a 55%, #0a1628 100%)`,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow orb using event colour */}
      <div
        style={{
          position: 'absolute',
          top: -160, right: -100,
          width: 560, height: 560,
          borderRadius: '50%',
          background: accent,
          opacity: 0.13,
          filter: 'blur(90px)',
          display: 'flex',
        }}
      />
      {/* Second glow — bottom left */}
      <div
        style={{
          position: 'absolute',
          bottom: -120, left: -60,
          width: 380, height: 380,
          borderRadius: '50%',
          background: accent,
          opacity: 0.07,
          filter: 'blur(70px)',
          display: 'flex',
        }}
      />

      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0, top: 0, bottom: 0,
          width: 5,
          background: accent,
          display: 'flex',
          opacity: 0.9,
        }}
      />

      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 88px 64px 96px',
          width: '100%',
          height: '100%',
        }}
      >
        {/* Top — identity */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 40 }}>
          {/* Logo */}
          {logoBase64 && (
            <div
              style={{
                display: 'flex',
                width: 120, height: 120,
                borderRadius: 22,
                overflow: 'hidden',
                flexShrink: 0,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <img
                src={logoBase64}
                width={120}
                height={120}
                style={{ width: 120, height: 120 }}
              />
            </div>
          )}

          {/* Name + date */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 6 }}>
            <span
              style={{
                fontSize: nameFontSize,
                fontWeight: 700,
                color: '#ffffff',
                lineHeight: 1.05,
                letterSpacing: '-1.5px',
              }}
            >
              {festival.name}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {festival.location && (
                <>
                  <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                    {festival.location}
                  </span>
                  <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.2)' }}>·</span>
                </>
              )}
              <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                {dates}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* CTA pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              background: accent,
              borderRadius: 100,
              padding: '14px 28px',
            }}
          >
            <span style={{ fontSize: 26, fontWeight: 700, color: '#fff' }}>
              View the full schedule
            </span>
            <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.8)' }}>→</span>
          </div>

          {/* Branding */}
          <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
            tryflowgrid.com
          </span>
        </div>
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
