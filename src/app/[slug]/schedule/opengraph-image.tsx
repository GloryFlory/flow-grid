import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let name = slug
  let dates = ''
  let accentColor = '#ff7119'
  let logoBase64: string | null = null

  try {
    const res = await fetch(
      `https://tryflowgrid.com/api/public/festivals/${slug}`,
      { cache: 'no-store' }
    )
    if (res.ok) {
      const json = await res.json()
      const f = json.festival
      if (f) {
        name = f.name ?? slug
        accentColor = f.primaryColor ?? '#ff7119'
        if (f.startDate && f.endDate) {
          const start = new Date(f.startDate)
          const end = new Date(f.endDate)
          const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
          dates = `${start.toLocaleDateString('en-GB', opts)} – ${end.toLocaleDateString('en-GB', opts)}`
        }
        if (f.logo) {
          try {
            const imgRes = await fetch(f.logo)
            if (imgRes.ok) {
              const buf = await imgRes.arrayBuffer()
              const ct = imgRes.headers.get('content-type') ?? 'image/png'
              logoBase64 = `data:${ct};base64,${Buffer.from(buf).toString('base64')}`
            }
          } catch {
            logoBase64 = null
          }
        }
      }
    }
  } catch {
    // keep defaults
  }

  const fontSize = name.length > 30 ? 52 : 68

  try {
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
              flex: 1,
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
                style={{ borderRadius: 20, display: 'flex', flexShrink: 0 }}
              />
            ) : null}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize,
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  display: 'flex',
                }}
              >
                {name}
              </div>
              {dates ? (
                <div
                  style={{
                    fontSize: 26,
                    color: 'rgba(255,255,255,0.55)',
                    display: 'flex',
                  }}
                >
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
            <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', display: 'flex' }}>
              View the full schedule →
            </div>
            <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.75)', display: 'flex' }}>
              tryflowgrid.com
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  } catch {
    // Last resort fallback — never return a 500
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: '#080f20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ color: '#fff', fontSize: 52, fontWeight: 700, display: 'flex' }}>
            {name}
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    )
  }
}
