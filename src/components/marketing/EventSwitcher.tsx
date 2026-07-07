'use client'

import { useState } from 'react'
import { Music2, Leaf, Mic, Palette, Zap, Briefcase, type LucideIcon } from 'lucide-react'

type EventTab = {
  id: string
  label: string
  icon: LucideIcon
  url: string
}

const EVENTS: EventTab[] = [
  { id: 'festival', label: 'Dance Festival',     icon: Music2,    url: 'https://tryflowgrid.com/your-festival/schedule' },
  { id: 'retreat',  label: 'Yoga Retreat',        icon: Leaf,      url: 'https://tryflowgrid.com/your-retreat/schedule' },
  { id: 'expo',     label: 'Conference & Expo',   icon: Mic,       url: 'https://tryflowgrid.com/your-expo/schedule' },
  { id: 'training', label: 'Training Programme',  icon: Palette,   url: 'https://tryflowgrid.com/your-training-program/schedule' },
  { id: 'camp',     label: 'Sports Camp',         icon: Zap,       url: 'https://tryflowgrid.com/your-sports-camp/schedule' },
  { id: 'summit',   label: 'Corporate Summit',    icon: Briefcase, url: 'https://tryflowgrid.com/your-corporate-summit/schedule' },
]

export default function EventSwitcher() {
  const [active, setActive] = useState(0)
  const [loading, setLoading] = useState(true)
  const event = EVENTS[active]

  function handleTabChange(i: number) {
    if (i === active) return
    setLoading(true)
    setActive(i)
  }

  return (
    <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 8, marginBottom: 20,
        overflowX: 'auto', paddingBottom: 4,
        justifyContent: 'center', flexWrap: 'wrap',
      }}>
        {EVENTS.map((e, i) => {
          const Icon = e.icon
          const isActive = i === active
          return (
            <button
              key={e.id}
              onClick={() => handleTabChange(i)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
                padding: '8px 16px', borderRadius: 100,
                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', transition: '.15s',
                background: isActive ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.06)',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.5)',
                outline: isActive ? '1px solid rgba(255,255,255,0.25)' : 'none',
              }}
            >
              <Icon size={14} />
              {e.label}
            </button>
          )
        })}
      </div>

      {/* iframe card */}
      <div style={{
        borderRadius: 16, overflow: 'hidden',
        boxShadow: '0 40px 80px -20px rgba(0,0,0,0.5), 0 12px 28px -8px rgba(0,0,0,0.3)',
        position: 'relative', height: 480,
        background: '#f6f7f9',
      }}>
        {/* Loading skeleton */}
        {loading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: '#f6f7f9', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              border: '3px solid #e7e8ec', borderTopColor: '#2a468b',
              animation: 'spin 0.8s linear infinite',
            }} />
          </div>
        )}

        <iframe
          key={event.url}
          src={event.url}
          title={event.label}
          onLoad={() => setLoading(false)}
          style={{
            width: '1400px',
            height: `${480 / 0.714}px`,
            border: 'none',
            display: 'block',
            transform: 'scale(0.714)',
            transformOrigin: 'top left',
            opacity: loading ? 0 : 1,
            transition: 'opacity .25s',
          }}
          allow="fullscreen"
        />

        {/* Fade out bottom edge */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(to bottom, transparent, #f6f7f9)',
          pointerEvents: 'none', zIndex: 1,
        }} />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
