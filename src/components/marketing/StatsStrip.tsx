'use client'

import { useEffect, useRef, useState } from 'react'

const STATS = [
  { target: 45,   fmt: (n: number) => `${n}`,         suffix: '+',  label: 'Published schedules' },
  { target: 1763, fmt: (n: number) => n.toLocaleString(), suffix: '+', label: 'Sessions scheduled' },
  { target: 181,  fmt: (n: number) => `${n}`,         suffix: '+',  label: 'Teachers & artists' },
  { target: 27,   fmt: (n: number) => `${n}k`,        suffix: '+',  label: 'Attendee interactions' },
]

function useCountUp(target: number, active: boolean) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!active) return
    let frame = 0
    const total = 60
    const timer = setInterval(() => {
      frame++
      const eased = 1 - Math.pow(1 - frame / total, 3)
      setValue(Math.min(Math.round(eased * target), target))
      if (frame >= total) clearInterval(timer)
    }, 20)
    return () => clearInterval(timer)
  }, [active, target])
  return value
}

function Stat({ target, fmt, suffix, label, active }: (typeof STATS)[0] & { active: boolean }) {
  const value = useCountUp(target, active)
  return (
    <div>
      <div style={{ fontSize: 52, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
        {fmt(value)}<span style={{ color: '#ff7119' }}>{suffix}</span>
      </div>
      <div style={{ fontSize: 14, color: '#6b7280', marginTop: 12, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

export default function StatsStrip() {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect() } },
      { threshold: 0.4 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={{ padding: '0 28px' }}>
      <div style={{
        maxWidth: 1160, margin: '0 auto',
        background: '#0b0e14', color: '#fff', borderRadius: 22, padding: '60px 40px',
        fontFamily: 'var(--font-space-grotesk), -apple-system, sans-serif',
      }}>
        <p style={{ textAlign: 'center', fontSize: 13.5, color: '#6b7280', fontWeight: 500, marginBottom: 38, letterSpacing: '.02em' }}>
          Real events, real numbers
        </p>
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, textAlign: 'center' }}
          className="max-sm:grid-cols-2 max-sm:gap-y-10"
        >
          {STATS.map((s) => <Stat key={s.label} {...s} active={started} />)}
        </div>
      </div>
    </div>
  )
}
