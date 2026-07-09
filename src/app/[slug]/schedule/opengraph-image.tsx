import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
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

async function toBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = await res.arrayBuffer()
    const ct = res.headers.get('content-type') ?? 'image/png'
    return `data:${ct};base64,${Buffer.from(buf).toString('base64')}`
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
    },
  })

  const accent = festival?.primaryColor ?? '#ff7119'
  const navy = '#080f20'

  if (!festival) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', background: navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#fff', fontSize: 56, fontWeight: 700 }}>Flow Grid</span>
      </div>,
      { width: 1200, height: 630 }
    )
  }

  const logoSrc = festival.logo ? await toBase64(festival.logo) : null
  const dates = formatDateRange(festival.startDate, festival.endDate)
  const nameFontSize = festival.name.length > 32 ? 52 : festival.name.length > 22 ? 62 : 72

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `linear-gradient(160deg, ${navy} 0%, #0d1e3c 100%)`,
      }}
    >
      {/* Main content area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          padding: '60px 80px',
          gap: 52,
        }}
      >
        {/* Logo */}
        {logoSrc && (
          <div
            style={{
              display: 'flex',
              width: 148,
              height: 148,
              borderRadius: 24,
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid rgba(255,255,255,0.12)',
            }}
          >
            <img src={logoSrc} width={148} height={148} />
          </div>
        )}

        {/* Event name + date */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
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
            {festival.location ? (
              <>
                <span style={{ fontSize: 27, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
                  {festival.location}
                </span>
                <span style={{ fontSize: 24, color: 'rgba(255,255,255,0.2)' }}>·</span>
              </>
            ) : null}
            <span style={{ fontSize: 27, color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
              {dates}
            </span>
          </div>
        </div>
      </div>

      {/* Coloured bottom strip */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 80px',
          height: 104,
          background: accent,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 28, fontWeight: 700, color: '#fff', letterSpacing: '-0.5px' }}>
          View the full schedule →
        </span>
        <span style={{ fontSize: 20, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
          tryflowgrid.com
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
