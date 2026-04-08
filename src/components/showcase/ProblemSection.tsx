'use client'

import { useState } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
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
    headline: 'Group chat chaos',
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

// Chaos scenarios shown as message preview cards (like a chat app inbox)
const CHAOS_CARDS = [
  {
    id: 'a',
    from: 'Festival Group',
    meta: '47 members',
    sender: 'Maria K.',
    message: "What time is Bachata on Saturday? The website says different from the flyer",
    unread: 47,
    time: '14:23',
  },
  {
    id: 'b',
    from: 'Tom H.',
    meta: 'Direct message',
    sender: 'Tom H.',
    message: "Carlos had to cancel. Who's replacing him at 4pm? Nobody told us anything",
    unread: 1,
    time: '22:41',
  },
  {
    id: 'c',
    from: 'Schedule_v7_FINAL.pdf',
    meta: 'Sent by you · 3 versions',
    sender: 'You',
    message: "Wait — Studio B is on the PDF but someone taped a different sign to the door",
    unread: 0,
    time: 'Yesterday',
  },
  {
    id: 'd',
    from: 'Inês R.',
    meta: 'Direct message',
    sender: 'Inês R.',
    message: "Can you send the timetable again? The link from the website stopped working",
    unread: 3,
    time: '09:18',
  },
]

// Single swipeable card
function ChaosCard({
  card,
  index,
  onDismiss,
}: {
  card: typeof CHAOS_CARDS[0]
  index: number
  onDismiss?: () => void
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-8, 8])
  const opacity = useTransform(x, [-160, -80, 0, 80, 160], [0, 1, 1, 1, 0])
  const isTop = index === 0

  return (
    <motion.div
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        if (Math.abs(info.offset.x) > 80) onDismiss?.()
      }}
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        scale: 1 - index * 0.04,
        translateY: index * 14,
        zIndex: 10 - index,
        position: 'absolute',
        inset: 0,
      }}
      className={`bg-[#0E1117] border border-white/10 rounded-2xl p-5 ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">{card.from}</p>
            <p className="text-slate-500 text-xs">{card.meta}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-slate-500 text-xs">{card.time}</span>
          {card.unread > 0 && (
            <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
              {card.unread}
            </span>
          )}
        </div>
      </div>

      {/* Message preview */}
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
        <span className="text-slate-300 font-medium">{card.sender}: </span>
        {card.message}
      </p>
    </motion.div>
  )
}

// Swipeable card deck
function ChaosCardDeck() {
  const [activeIndex, setActiveIndex] = useState(0)

  const dismiss = () => setActiveIndex(i => (i + 1) % CHAOS_CARDS.length)

  // Show 3 cards: active + 2 behind
  const visibleCards = [0, 1, 2].map(offset =>
    CHAOS_CARDS[(activeIndex + offset) % CHAOS_CARDS.length]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Stack */}
      <div className="relative h-[148px]">
        <AnimatePresence mode="popLayout">
          {visibleCards.map((card, i) => (
            <ChaosCard
              key={card.id + activeIndex}
              card={card}
              index={i}
              onDismiss={i === 0 ? dismiss : undefined}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Swipe hint + dots */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-1.5 text-slate-600 text-xs">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M7 16l-4-4m0 0l4-4m-4 4h18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          swipe to see more
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M17 8l4 4m0 0l-4 4m4-4H3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="flex gap-1.5">
          {CHAOS_CARDS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex % CHAOS_CARDS.length ? 'bg-red-400 w-4' : 'bg-white/15 w-1.5'
              }`}
            />
          ))}
        </div>
      </div>

      <p className="text-xs text-slate-600 italic">You, answering these one by one at 11pm.</p>
    </div>
  )
}

export default function ProblemSection() {
  return (
    <section id="problem" className="py-32 bg-[#080A0F] relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(180,2,37,0.08) 0%, transparent 65%)' }}
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

        {/* Before / After */}
        <AnimateIn>
          <div className="rounded-3xl border border-white/8 bg-[#0E1117] overflow-hidden">
            <div className="grid md:grid-cols-2">

              {/* BEFORE — swipeable chaos card stack */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-white/8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs font-semibold text-red-400 uppercase tracking-widest">Without FlowGrid</span>
                </div>
                <ChaosCardDeck />
              </div>

              {/* AFTER — phone mockup */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">With FlowGrid</span>
                </div>

                <div className="flex justify-start">
                  <div
                    className="relative w-[220px] rounded-[2rem] p-[3px] shadow-2xl"
                    style={{ background: 'linear-gradient(145deg, rgba(180,2,37,0.5), rgba(255,113,25,0.3), rgba(255,255,255,0.1))' }}
                  >
                    <div className="bg-[#0A0C12] rounded-[1.8rem] overflow-hidden">
                      <div className="flex justify-center pt-2.5 pb-1">
                        <div className="w-16 h-[4px] bg-white/10 rounded-full" />
                      </div>
                      <div className="px-3 py-2.5 bg-gradient-to-r from-[#B40225] to-[#FF7119]">
                        <p className="text-white text-[10px] font-semibold opacity-80">Latin Dance Festival</p>
                        <p className="text-white text-xs font-bold">Day 1 — Saturday</p>
                      </div>
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
