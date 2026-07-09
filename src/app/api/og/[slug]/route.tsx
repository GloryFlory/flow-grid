import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  // Hardcoded to isolate whether the fetch/Buffer is crashing the process
  const name = slug
  const dates = ''
  const accentColor = '#ff7119'

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
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div
              style={{
                display: 'flex',
                fontSize: 68,
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
