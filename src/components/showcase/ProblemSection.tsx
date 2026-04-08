'use client'

/**
 * ProblemSection — Pain points of old-school scheduling.
 *
 * v2 improvements:
 * - WhatsApp messages animate in one-by-one with stagger when section scrolls into view
 * - "After" side: schedule wrapped in a phone frame mockup
 * - Pain point cards: icon background glow on hover
 * - Reduced motion offset in AnimateIn for more refined feel
 */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import AnimateIn from './ui/AnimateIn'

const PAIN_POINTS = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: "Outdated before it's printed",
    body: 'You design a beautiful PDF. An instructor cancels the next morning. Now 400 people have the wrong schedule.',
    tag: 'PDF Hell',
    color: '#EF4444',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'WhatsApp group chaos',
    body: '"What time is my class?" · "Which room is Jazz?" · "Did the schedule change?" — repeated 50 times a day.',
    tag: 'Message Overload',
    color: '#F59E0B',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'Wrong room, wrong time',
    body: 'Attendees wander the venue. Rooms overcrowded while others sit empty. Nobody knows where anything is.',
    tag: 'Navigation Chaos',
    color: '#8B5CF6',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    headline: 'Last-minute changes break everything',
    body: "One room change. You're redesigning, reprinting, redistributing. Hours lost. People still confused.",
    tag: 'Zero Flexibility',
    color: '#06B6D4',
  },
]

const FAKE_MESSAGES = [
  { text: 'Hey, what time is Bachata?' },
  { text: 'The schedule says Studio B but the door is locked??' },
  { text: 'Did Salsa move to 3pm or stay at 2?' },
  { text: 'Which stage is NOVA on tonight? Insta said Main Stage but the PDF says different' },
]

// Staggered message list — animates in when parent enters viewport
function AnimatedMessages() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })

  return (
    <div ref={ref} className="space-y-3">
      {FAKE_MESSAGES.map((msg, i) => (
        <motion.div
          key={i}
          className="flex items-start gap-2"
          initial={{ opacity: 0, x: -16 }}
          animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: 0.5, delay: 0.1 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-7 h-7 rounded-full bg-slate-700/80 flex-shrink-0 mt-0.5 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="bg-[#1A2030] rounded-2xl rounded-tl-sm px-3.5 py-2.5 max-w-[280px]">
            <p className="text-slate-300 text-sm leading-snug">{msg.text}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default function ProblemSection() {
  return (
    <section id="problem" className="py-32 bg-[#080A0F] relative overflow-hidden">
      {/* Subtle red ambient glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(180,2,37,0.08) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <AnimateIn className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-red-400 bg-red-400/10 border border-red-400/20 mb-5">
            The Old Way
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
            Your attendees deserve
            <br />
            <span className="text-slate-400">better than a PDF.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Static schedules create friction at every step — for you and for your guests.
          </p>
        </AnimateIn>

        {/* Pain point cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
          {PAIN_POINTS.map((point, i) => (
            <AnimateIn key={point.headline} delay={i * 0.08}>
              <div className="group p-6 rounded-2xl border border-white/8 bg-[#0E1117] hover:border-white/15 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                {/* Hover glow behind icon */}
                <div
                  className="absolute -top-6 -left-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `${point.color}25` }}
                />
                <div className="flex items-start gap-4 relative">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:scale-110"
                    style={{ background: `${point.color}15`, color: point.color }}
                  >
                    {point.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-white text-base">{point.headline}</h3>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${point.color}15`, color: point.color }}
                      >
                        {point.tag}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">{point.body}</p>
                  </div>
                </div>
              </div>
            </AnimateIn>
          ))}
        </div>

        {/* Before / After comparison */}
        <AnimateIn>
          <div className="rounded-3xl border border-white/8 bg-[#0E1117] overflow-hidden">
            <div className="grid md:grid-cols-2">

              {/* BEFORE — animated WhatsApp messages */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-white/8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">Without FlowGrid</span>
                </div>

                <AnimatedMessages />

                <p className="mt-5 text-xs text-slate-600 italic">You, answering these one-by-one at 11pm.</p>
              </div>

              {/* AFTER — phone frame mockup */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">With FlowGrid</span>
                </div>

                {/* Phone frame */}
                <div className="flex justify-start">
                  <div
                    className="relative w-[220px] rounded-[2rem] p-[3px] shadow-2xl"
                    style={{ background: 'linear-gradient(145deg, rgba(180,2,37,0.5), rgba(255,113,25,0.3), rgba(255,255,255,0.1))' }}
                  >
                    <div className="bg-[#0A0C12] rounded-[1.8rem] overflow-hidden">
                      {/* Notch */}
                      <div className="flex justify-center pt-2.5 pb-1">
                        <div className="w-16 h-[4px] bg-white/10 rounded-full" />
                      </div>

                      {/* App header */}
                      <div className="px-3 py-2.5 bg-gradient-to-r from-[#B40225] to-[#FF7119]">
                        <p className="text-white text-[10px] font-semibold opacity-80">Latin Dance Festival</p>
                        <p className="text-white text-xs font-bold">Day 1 — Saturday</p>
                      </div>

                      {/* Sessions */}
                      {[
                        { time: '10:00', title: 'Bachata Sensual', room: 'Main Hall', color: '#B40225' },
                        { time: '11:30', title: 'Salsa On2 Styling', room: 'Studio B', color: '#FF7119' },
                        { time: '13:00', title: 'Kizomba Musicality', room: 'Rooftop', color: '#466D60' },
                      ].map(s => (
                        <div key={s.time} className="flex items-center gap-2.5 px-3 py-2 border-b border-white/5 last:border-0">
                          <div className="w-[3px] h-7 rounded-full flex-shrink-0" style={{ background: s.color }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[11px] font-semibold truncate">{s.title}</p>
                            <p className="text-slate-500 text-[10px]">{s.room}</p>
                          </div>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                            style={{ color: s.color, background: `${s.color}22` }}
                          >
                            {s.time}
                          </span>
                        </div>
                      ))}

                      {/* Bottom bar */}
                      <div className="flex justify-center py-2">
                        <div className="w-16 h-[3px] bg-white/10 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="mt-5 text-sm text-slate-400">
                  Scan a QR. Tap a filter.{' '}
                  <span className="text-emerald-400 font-medium">Instantly know where to go.</span>
                </p>
              </div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  )
}
