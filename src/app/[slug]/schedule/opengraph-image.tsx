import { ImageResponse } from 'next/og'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const alt = 'Event Schedule'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

function formatDateRange(start: Date, end: Date): string {
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()
  if (sameMonth) {
    return `${start.getDate()}–${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
  }
  return `${start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
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

  const navy = '#0a1628'
  const orange = '#ff7119'
  const accent = festival?.primaryColor || orange

  if (!festival) {
    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          background: navy,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ color: '#fff', fontSize: 56, fontWeight: 700 }}>Flow Grid</span>
      </div>,
      { width: 1200, height: 630 }
    )
  }

  const dates = formatDateRange(festival.startDate, festival.endDate)
  const nameFontSize = festival.name.length > 28 ? 58 : festival.name.length > 20 ? 68 : 80

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        background: `linear-gradient(140deg, ${navy} 0%, #0f2044 60%, ${navy} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px 88px',
      }}
    >
      {/* Event identity */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 36 }}>
        {festival.logo && (
          <img
            src={festival.logo}
            width={100}
            height={100}
            style={{ borderRadius: 20, objectFit: 'contain', flexShrink: 0, marginTop: 6 }}
          />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <span
            style={{
              fontSize: nameFontSize,
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: 1.05,
              letterSpacing: '-2px',
            }}
          >
            {festival.name}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {festival.location && (
              <>
                <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.55)' }}>
                  {festival.location}
                </span>
                <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.25)' }}>·</span>
              </>
            )}
            <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.55)' }}>{dates}</span>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 30, fontWeight: 600, color: accent }}>
          View the full schedule →
        </span>
        <span style={{ fontSize: 22, color: 'rgba(255,255,255,0.35)', fontWeight: 500 }}>
          tryflowgrid.com
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
