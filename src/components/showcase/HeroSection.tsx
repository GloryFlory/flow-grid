'use client'

/**
 * HeroSection — Full-screen opening section.
 *
 * Improvements over v1:
 * - Grain texture overlay (the #1 signal of a premium dark-mode site)
 * - 4 floating cards (added yoga + sports) with capacity bars & duration badges
 * - Stronger ambient background: center amber glow + side blobs
 * - Event-type pills row replacing the single-line social proof text
 * - xl/2xl headline size bump
 * - Cards are wider (260px) with more product-realistic detail
 */

import { motion } from 'framer-motion'

// ── CSS injected into the page ────────────────────────────────────────────────
const HERO_CSS = `
  @keyframes float-a {
    0%, 100% { transform: translateY(0px) rotate(-6deg); }
    50%       { transform: translateY(-18px) rotate(-6deg); }
  }
  @keyframes float-b {
    0%, 100% { transform: translateY(0px) rotate(5deg); }
    50%       { transform: translateY(-12px) rotate(5deg); }
  }
  @keyframes float-c {
    0%, 100% { transform: translateY(0px) rotate(-3deg); }
    50%       { transform: translateY(-22px) rotate(-3deg); }
  }
  @keyframes float-d {
    0%, 100% { transform: translateY(0px) rotate(2deg); }
    50%       { transform: translateY(-14px) rotate(2deg); }
  }
`

// ── Framer Motion variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}

// ── Floating demo cards data ──────────────────────────────────────────────────
// Each card simulates a real FlowGrid session card visible in the background
const DEMO_CARDS = [
  {
    time: '10:00',
    duration: '90 min',
    title: 'Bachata Sensual Foundations',
    teacher: 'Carlos & Mia',
    location: 'Main Hall',
    level: 'Beginner',
    capacityLabel: '28 / 30',
    capacityPct: 0.93,
    color: '#B40225',
    bg: 'rgba(12,3,5,0.88)',
    border: 'rgba(180,2,37,0.30)',
    animation: 'float-a 5s ease-in-out infinite',
    positionClass: 'top-[17%] -left-2 lg:left-[3%]',
    delay: '0s',
  },
  {
    time: '07:00',
    duration: '60 min',
    title: 'Sunrise Hatha Practice',
    teacher: 'Priya Sharma',
    location: 'Shala',
    level: 'All Levels',
    capacityLabel: '12 / 20',
    capacityPct: 0.6,
    color: '#EDB75B',
    bg: 'rgba(12,10,4,0.88)',
    border: 'rgba(237,183,91,0.28)',
    animation: 'float-b 6.5s ease-in-out infinite',
    positionClass: 'top-[7%] right-[3%]',
    delay: '1s',
  },
  {
    time: '14:00',
    duration: '45 min',
    title: 'AI in Product Design',
    teacher: 'Mark Rivera',
    location: 'Track A',
    level: 'Intermediate',
    capacityLabel: '45 / 50',
    capacityPct: 0.9,
    color: '#3B5BDB',
    bg: 'rgba(4,6,18,0.88)',
    border: 'rgba(59,91,219,0.28)',
    animation: 'float-c 7s ease-in-out infinite',
    positionClass: 'bottom-[17%] right-[1%] lg:right-[4%]',
    delay: '2s',
  },
  {
    time: '21:00',
    duration: '120 min',
    title: 'Closing Party — Main Stage',
    teacher: 'DJ Solaris + NOVA',
    location: 'Main Stage',
    level: 'All',
    capacityLabel: '200 / 300',
    capacityPct: 0.67,
    color: '#466D60',
    bg: 'rgba(4,8,6,0.88)',
    border: 'rgba(70,109,96,0.28)',
    animation: 'float-d 5.5s ease-in-out infinite',
    positionClass: 'bottom-[9%] -left-2 lg:left-[2%]',
    delay: '0.5s',
  },
]

// ── Event type pills shown below CTAs ────────────────────────────────────────
const EVENT_TYPES = [
  { label: 'Dance Festivals', icon: <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg> },
  { label: 'Yoga Retreats', icon: <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg> },
  { label: 'Music Festivals', icon: <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg> },
  { label: 'Conferences', icon: <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg> },
  { label: 'Workshops', icon: <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg> },
  { label: 'Sports Events', icon: <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg> },
]

// ── Component ─────────────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
    >
      <style>{HERO_CSS}</style>

      {/* ── Layer 1: Grain texture — the single biggest "premium" signal ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '256px 256px',
          opacity: 0.045,
        }}
      />

      {/* ── Layer 2: Ambient gradient blobs ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          background: [
            'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(237,183,91,0.13) 0%, transparent 55%)',
            'radial-gradient(ellipse 70% 50% at 8% 18%, rgba(237,183,91,0.07) 0%, transparent 55%)',
            'radial-gradient(ellipse 65% 50% at 92% 80%, rgba(42,70,139,0.16) 0%, transparent 60%)',
          ].join(', '),
        }}
      />

      {/* ── Layer 3: Dot grid ── */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.14]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.45) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* ── Floating schedule cards (decorative, desktop only) ── */}
      {DEMO_CARDS.map((card) => (
        <div
          key={card.title}
          aria-hidden
          className={`absolute w-[260px] hidden lg:block z-10 pointer-events-none ${card.positionClass}`}
          style={{ animation: card.animation, animationDelay: card.delay }}
        >
          <div
            className="rounded-2xl p-4 shadow-2xl"
            style={{
              background: card.bg,
              border: `1px solid ${card.border}`,
              backdropFilter: 'blur(18px)',
              WebkitBackdropFilter: 'blur(18px)',
            }}
          >
            {/* Top accent line */}
            <div
              className="h-[2px] w-full rounded-full mb-3"
              style={{ background: `linear-gradient(90deg, ${card.color}, ${card.color}35)` }}
            />

            {/* Time + duration */}
            <div className="flex items-center justify-between mb-2.5">
              <span
                className="inline-block text-xs font-bold px-2.5 py-1 rounded-full"
                style={{
                  background: `${card.color}22`,
                  color: card.color,
                  border: `1px solid ${card.color}40`,
                }}
              >
                {card.time}
              </span>
              <span className="text-xs text-slate-600">{card.duration}</span>
            </div>

            {/* Session title */}
            <p className="text-white font-semibold text-sm leading-snug mb-1.5">{card.title}</p>

            {/* Teacher */}
            <p className="text-slate-400 text-xs mb-2.5 truncate">{card.teacher}</p>

            {/* Location + Level */}
            <div className="flex items-center gap-1.5 text-xs mb-3">
              <span className="flex items-center gap-1 text-slate-500">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {card.location}
              </span>
              <span className="w-1 h-1 rounded-full bg-slate-700 flex-shrink-0" />
              <span
                className="px-1.5 py-0.5 rounded font-medium"
                style={{ background: `${card.color}18`, color: card.color }}
              >
                {card.level}
              </span>
            </div>

            {/* Capacity bar — shows product utility at a glance */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-700">Capacity</span>
                <span
                  className="text-xs font-medium"
                  style={{ color: card.capacityPct > 0.85 ? '#EF4444' : card.capacityPct > 0.6 ? '#F59E0B' : '#10B981' }}
                >
                  {card.capacityLabel}
                </span>
              </div>
              <div className="h-[3px] bg-white/8 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${card.capacityPct * 100}%`,
                    background: card.capacityPct > 0.85 ? '#EF4444' : card.capacityPct > 0.6 ? '#F59E0B' : '#10B981',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ── Main content ── */}
      <motion.div
        className="relative z-20 text-center max-w-4xl mx-auto px-6 pt-24 pb-36"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Eyebrow label */}
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20">
            Interactive Event Scheduling Platform
          </span>
        </motion.div>

        {/* Headline — bigger on xl screens */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight leading-[1.03] mb-7"
        >
          The schedule your{' '}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(135deg, #EDB75B 0%, #FF7119 50%, #B40225 100%)',
            }}
          >
            attendees will
            <br className="hidden sm:block" /> actually open.
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto mb-10"
        >
          FlowGrid turns your festival, retreat, or workshop programme into a beautiful,
          live, interactive experience — loved by attendees, effortless for organisers.{' '}
          <span className="text-slate-300">No reprinting. No WhatsApp chaos. No confusion.</span>
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
        >
          <a
            href="/flow-grid-demo/schedule"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base text-[#080A0F] shadow-xl shadow-amber-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-amber-500/45"
            style={{ background: 'linear-gradient(135deg, #EDB75B 0%, #FF7119 100%)' }}
          >
            See it in action
            <svg
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
              fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>

          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base text-white border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
          >
            Book a demo call
          </a>
        </motion.div>

        {/* Event type pills — more visual than a single line of text */}
        <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-2">
          {EVENT_TYPES.map(({ icon, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-slate-500 bg-white/4 border border-white/8 hover:border-white/15 hover:text-slate-300 transition-all duration-200"
            >
              {icon} {label}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600"
      >
        <span className="text-[10px] tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-5 h-8 border border-white/12 rounded-full flex justify-center pt-1.5">
          <motion.div
            className="w-1 h-1.5 rounded-full bg-amber-400/70"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
    </section>
  )
}
