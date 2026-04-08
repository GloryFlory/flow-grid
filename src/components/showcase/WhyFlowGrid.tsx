'use client'

/**
 * WhyFlowGrid — Six key benefit cards.
 *
 * v2 improvements:
 * - First card ("Instant live updates") spans full width as a hero feature
 *   with a larger layout: icon left, title + body right, plus a mini visual
 * - Remaining 5 cards in a 2+3 responsive grid
 * - Stronger hover: icon lifts + scales, bottom border glow brighter
 * - Corner gradient glow always present at low opacity, intensifies on hover
 */

import { motion } from 'framer-motion'
import AnimateIn from './ui/AnimateIn'

// ── Feature data ──────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'Instant live updates',
    body: 'Change a room, swap a teacher, cancel a session. Every attendee sees it in real time — no reprinting, no mass message, no confusion.',
    color: '#EDB75B',
    gradient: 'from-amber-500/20 to-transparent',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'Export to your calendar',
    body: 'Attendees save their personal schedule and export it directly to Google Calendar, Outlook, or iCal. Their sessions show up alongside the rest of their life.',
    color: '#3B82F6',
    gradient: 'from-blue-500/20 to-transparent',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'Your brand, your schedule',
    body: 'Upload your logo, set your fonts and brand colours. Every schedule page looks completely native to your event — no FlowGrid branding in the way.',
    color: '#8B5CF6',
    gradient: 'from-purple-500/20 to-transparent',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'Filter everything',
    body: 'By style, level, teacher, room, or time. Guests find what\'s right for them — no more scanning 6-page PDFs.',
    color: '#10B981',
    gradient: 'from-emerald-500/20 to-transparent',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'Connect your community',
    body: 'Link your Instagram, Facebook group, or WhatsApp community directly from the schedule. Attendees find the conversation — you stop answering the same questions.',
    color: '#F59E0B',
    gradient: 'from-amber-500/20 to-transparent',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.8" />
        <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.8" />
        <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.8" />
        <path d="M14 17h7M17.5 14v7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'QR codes per venue',
    body: "Generate a QR poster for every stage or room. Attendees scan on arrival and see exactly that space's programme.",
    color: '#EF4444',
    gradient: 'from-red-500/20 to-transparent',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'Beautiful on every phone',
    body: 'The schedule adapts perfectly to any screen. Attendees get a native app-like experience — no pinching, no zooming, no frustration.',
    color: '#06B6D4',
    gradient: 'from-cyan-500/20 to-transparent',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'Personal schedules',
    body: "Attendees bookmark the sessions they want and build their own personal timetable. No app download needed — it just works in the browser.",
    color: '#F97316',
    gradient: 'from-orange-500/20 to-transparent',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'Analytics & insights',
    body: 'See which sessions get the most views, when attendees check the schedule, and how your event is performing — all from one dashboard.',
    color: '#466D60',
    gradient: 'from-emerald-700/20 to-transparent',
  },
]

// ── Stagger variants ──────────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

// ── Hero feature card (first card, full width) ────────────────────────────────
function HeroFeatureCard({ feature }: { feature: typeof FEATURES[0] }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative col-span-full p-7 rounded-2xl border border-white/8 bg-[#0E1117] overflow-hidden hover:border-white/18 transition-all duration-300"
    >
      {/* Large corner gradient — always slightly visible */}
      <div
        className={`absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gradient-to-br ${feature.gradient} blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500`}
      />

      <div className="relative flex flex-col md:flex-row md:items-center gap-6">
        {/* Icon — larger for hero card */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
          style={{ background: `${feature.color}20`, color: feature.color }}
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Text */}
        <div className="flex-1">
          <h3 className="text-white font-bold text-xl mb-2">{feature.headline}</h3>
          <p className="text-slate-400 text-base leading-relaxed max-w-2xl">{feature.body}</p>
        </div>

        {/* Mini visual — a tiny "live update" animation */}
        <div className="hidden lg:flex flex-col gap-2 flex-shrink-0">
          {['Room changed: Studio B → Rooftop', 'Teacher updated: Carlos → Luis', 'Session added: 16:00 Zouk'].map((msg, i) => (
            <motion.div
              key={msg}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-xs text-slate-400 whitespace-nowrap"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              {msg}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom border glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-40 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${feature.color}80, transparent)` }}
      />
    </motion.div>
  )
}

// ── Regular feature card ──────────────────────────────────────────────────────
function FeatureCard({ feature }: { feature: typeof FEATURES[0] }) {
  return (
    <motion.div
      variants={cardVariants}
      className="group relative p-6 rounded-2xl border border-white/8 bg-[#0E1117] overflow-hidden hover:border-white/18 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Corner gradient */}
      <div
        className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${feature.gradient} blur-2xl opacity-20 group-hover:opacity-50 transition-opacity duration-500`}
      />

      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
        style={{ background: `${feature.color}18`, color: feature.color }}
      >
        {feature.icon}
      </div>

      <h3 className="text-white font-semibold text-base mb-2">{feature.headline}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{feature.body}</p>

      {/* Bottom border glow */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${feature.color}70, transparent)` }}
      />
    </motion.div>
  )
}

// ── Section ───────────────────────────────────────────────────────────────────
export default function WhyFlowGrid() {
  const [heroFeature, ...restFeatures] = FEATURES

  return (
    <section id="features" className="py-32 bg-[#080A0F] relative overflow-hidden">
      {/* Ambient purple glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 80% 50%, rgba(139,92,246,0.07) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <AnimateIn className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-purple-400 bg-purple-400/10 border border-purple-400/20 mb-5">
            Why FlowGrid
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
            Built for the way events
            <br />
            <span className="text-slate-400">actually work.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Every feature exists because real event organisers asked for it.
          </p>
        </AnimateIn>

        {/* Cards grid */}
        <AnimateIn>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {/* Hero feature — full width */}
            <HeroFeatureCard feature={heroFeature} />

            {/* Remaining 8 cards */}
            {restFeatures.map(feature => (
              <FeatureCard key={feature.headline} feature={feature} />
            ))}
          </motion.div>
        </AnimateIn>
      </div>
    </section>
  )
}
