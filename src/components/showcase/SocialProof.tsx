'use client'

/**
 * SocialProof — Stats + testimonials.
 *
 * v2 improvements:
 * - Stats count up from 0 when scrolled into view (useCountUp hook)
 * - Event types become an infinite auto-scrolling marquee ticker
 * - Testimonial cards: quote mark is bigger and bolder, subtle left border accent
 * - Section divider gradient at top for smoother flow from previous section
 */

import { useRef, useEffect, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import AnimateIn from './ui/AnimateIn'

// ── Count-up hook ─────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1.6, startOnView = true) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const started = useRef(false)

  useEffect(() => {
    if (!inView || started.current) return
    started.current = true
    const steps = 40
    const interval = (duration * 1000) / steps
    let step = 0
    const timer = setInterval(() => {
      step++
      // Ease out: fast start, slow finish
      const progress = 1 - Math.pow(1 - step / steps, 3)
      setCount(Math.round(progress * target))
      if (step >= steps) clearInterval(timer)
    }, interval)
    return () => clearInterval(timer)
  }, [inView, target, duration])

  return { count, ref }
}

// ── Stats data ────────────────────────────────────────────────────────────────
const STATS = [
  { targetNum: 50, suffix: '+', label: 'Events powered', color: '#EDB75B' },
  { targetNum: 7, suffix: 'k+', label: 'Schedule views', color: '#466D60' },
  { targetNum: 20, suffix: ' min', label: 'Avg. setup time', color: '#2A468B' },
]

function StatItem({ stat, index }: { stat: typeof STATS[0]; index: number }) {
  const { count, ref } = useCountUp(stat.targetNum, 1.4)

  return (
    <motion.div
      className="bg-[#0E1117] px-8 py-10 text-center flex flex-col items-center gap-2"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <span ref={ref} className="text-5xl font-bold tracking-tight" style={{ color: stat.color }}>
        {count}{stat.suffix}
      </span>
      <span className="text-slate-400 text-sm font-medium">{stat.label}</span>
    </motion.div>
  )
}

// ── Testimonials ──────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: 'We used to send a PDF that was outdated the moment it was printed. FlowGrid changed that completely — we push updates in seconds.',
    author: 'Bachata festival organiser',
    location: 'Berlin, Germany',
    emoji: '💃',
    color: '#B40225',
  },
  {
    quote: 'The grid view showed us a scheduling clash between two headliners on day 1. We caught it before the event. That alone was worth everything.',
    author: 'Festival director',
    location: 'Amsterdam, Netherlands',
    emoji: '🎵',
    color: '#EDB75B',
  },
  {
    quote: 'Attendees actually knew where to go. First time in six years of running this conference. The QR posters at each room were a game changer.',
    author: 'Conference chair',
    location: 'London, UK',
    emoji: '🎤',
    color: '#2A468B',
  },
]

// ── Marquee ticker data ───────────────────────────────────────────────────────
const TICKER_ITEMS = [
  'Dance Festivals',
  'Yoga Retreats',
  'Music Festivals',
  'Conferences',
  'Workshop Series',
  'Sports Events',
  'Wellness Retreats',
  'Surf Camps',
  'Arts Festivals',
  'Fitness Events',
]

// Duplicate for seamless loop
const TICKER_DOUBLED = [...TICKER_ITEMS, ...TICKER_ITEMS]

export default function SocialProof() {
  return (
    <section id="proof" className="py-32 bg-[#0A0C10] relative overflow-hidden">
      {/* Section entry gradient — smooths the join from the previous section */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(8,10,15,0.8), transparent)' }}
      />

      {/* Ambient green glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 20% 60%, rgba(70,109,96,0.10) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <AnimateIn className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 mb-5">
            Social Proof
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
            Trusted by organisers
            <br />
            <span className="text-slate-400">who've been there.</span>
          </h2>
        </AnimateIn>

        {/* Animated stats strip */}
        <AnimateIn className="mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-white/8 rounded-2xl overflow-hidden border border-white/8">
            {STATS.map((stat, i) => (
              <StatItem key={stat.label} stat={stat} index={i} />
            ))}
          </div>
        </AnimateIn>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <AnimateIn key={t.author} delay={i * 0.1}>
              <div
                className="h-full p-6 rounded-2xl border border-white/8 bg-[#0E1117] flex flex-col gap-5 hover:border-white/15 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
                style={{ borderLeft: `2px solid ${t.color}50` }}
              >
                {/* Big quote mark */}
                <div
                  className="text-5xl font-serif leading-none select-none"
                  style={{ color: t.color, opacity: 0.6 }}
                >
                  "
                </div>

                <p className="text-slate-300 text-sm leading-relaxed flex-1">{t.quote}</p>

                <div className="flex items-center gap-3 pt-4 border-t border-white/8">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `${t.color}22` }}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{ color: t.color }}>
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{t.author}</p>
                    <p className="text-slate-500 text-xs">{t.location}</p>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Auto-scrolling marquee ticker */}
        <AnimateIn delay={0.1} className="mt-20">
          <p className="text-xs text-slate-600 uppercase tracking-widest mb-6 font-semibold text-center">
            Used for all types of events
          </p>

          {/* Outer mask for fade edges */}
          <div
            className="relative overflow-hidden"
            style={{
              maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
            }}
          >
            <motion.div
              className="flex gap-4 w-max"
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 28, repeat: Infinity, ease: 'linear' }}
            >
              {TICKER_DOUBLED.map((label, i) => (
                <div
                  key={`${label}-${i}`}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/8 text-slate-400 text-sm whitespace-nowrap"
                >
                  <span>{label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
