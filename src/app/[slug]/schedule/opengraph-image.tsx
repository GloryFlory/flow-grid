import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt = 'Event Schedule'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function formatDateRange(start: string, end: string): string {
  const s = new Date(start)
  const e = new Date(end)
  const sameYear = s.getFullYear() === e.getFullYear()
  const sameMonth = sameYear && s.getMonth() === e.getMonth()
  if (sameMonth) {
    return `${s.getDate()}–${e.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
  }
  if (sameYear) {
    return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
  }
  return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} – ${e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
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

  // Use the public API instead of Prisma directly — avoids bundling issues
  // in the opengraph-image route context
  let festival: {
    name: string
    logo?: string
    startDate: string
    endDate: string
    location?: string
    primaryColor?: string
  } | null = null

  try {
    const res = await fetch(`https://tryflowgrid.com/api/public/festivals/${slug}`)
    if (res.ok) {
      const data = await res.json()
      festival = data.festival ?? null
    }
  } catch {
    festival = null
  }

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
      {/* Main content */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          padding: '60px 80px',
          gap: 52,
        }}
      >
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
