import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'
import sharp from 'sharp'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl

  const name = searchParams.get('name') ?? 'Event Schedule'
  const startIso = searchParams.get('start') ?? ''
  const endIso = searchParams.get('end') ?? ''
  const accentColor = searchParams.get('color') ?? '#ff7119'
  const logoUrl = searchParams.get('logo') ?? ''

  let dates = ''
  if (startIso && endIso) {
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    dates = `${fmt(new Date(startIso))} – ${fmt(new Date(endIso))}`
  }

  // Fetch logo and convert to PNG (Satori can't render webp)
  let logoBase64: string | null = null
  if (logoUrl) {
    try {
      const res = await fetch(logoUrl)
      if (res.ok) {
        const buf = await res.arrayBuffer()
        const png = await sharp(Buffer.from(buf)).resize(280, 280, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
        logoBase64 = `data:image/png;base64,${png.toString('base64')}`
      }
    } catch {
      logoBase64 = null
    }
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
