import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  let name = slug
  let dates = ''
  let accentColor = '#ff7119'
  let logoBase64: string | null = null

  try {
    const festival = await prisma.festival.findFirst({
      where: { slug, isPublished: true },
      select: { name: true, logo: true, startDate: true, endDate: true, primaryColor: true },
    })

    if (festival) {
      name = festival.name
      accentColor = festival.primaryColor ?? '#ff7119'

      const start = new Date(festival.startDate)
      const end = new Date(festival.endDate)
      const fmt = (d: Date) =>
        d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      dates = `${fmt(start)} – ${fmt(end)}`

      if (festival.logo) {
        const imgRes = await fetch(festival.logo)
        if (imgRes.ok) {
          const buf = await imgRes.arrayBuffer()
          const ct = imgRes.headers.get('content-type') ?? 'image/webp'
          logoBase64 = `data:${ct};base64,${Buffer.from(buf).toString('base64')}`
        }
      }
    }
  } catch {
    // keep defaults
  }

  const nameFontSize = name.length > 30 ? 52 : 68

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(160deg, #080f20 0%, #0d1e3c 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexGrow: 1,
            flexShrink: 0,
            flexDirection: 'row',
            alignItems: 'center',
            padding: '60px 80px',
            gap: 48,
          }}
        >
          {logoBase64 ? (
            <img
              src={logoBase64}
              width={140}
              height={140}
              style={{ display: 'flex', borderRadius: 20, flexShrink: 0 }}
            />
          ) : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                fontSize: nameFontSize,
                fontWeight: 700,
                color: '#ffffff',
              }}
            >
              {name}
            </div>
            {dates ? (
              <div style={{ display: 'flex', fontSize: 26, color: 'rgba(255,255,255,0.55)' }}>
                {dates}
              </div>
            ) : null}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 80px',
            height: 96,
            background: accentColor,
          }}
        >
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 700, color: '#fff' }}>
            View the full schedule →
          </div>
          <div style={{ display: 'flex', fontSize: 18, color: 'rgba(255,255,255,0.75)' }}>
            tryflowgrid.com
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
