'use client'

/**
 * ProductPreview — Interactive mock of the FlowGrid schedule experience.
 *
 * v2 improvements:
 * - Day picker tabs (Day 1 / Day 2 / Day 3) inside the browser chrome
 * - Desktop / Mobile view toggle — phone mockup rendered when mobile selected
 * - Session cards: left colour stripe, duration badge, capacity bar
 * - Smoother persona transition with AnimatePresence
 * - Persona stat card transitions with motion.key
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PERSONAS, Persona, MockSession, PersonaId } from '@/app/showcase/personas'
import AnimateIn from './ui/AnimateIn'

// ── Day picker data (3 demo days shown in the browser chrome) ─────────────────
const DAYS = ['Day 1', 'Day 2', 'Day 3']

// ── Icons for each persona (replaces emoji) ───────────────────────────────────
const PERSONA_ICONS: Record<PersonaId, JSX.Element> = {
  dance: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" /></svg>,
  yoga:  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>,
  music: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
  conference: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>,
  workshop: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>,
  sports: <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>,
}

// ── Persona tab ───────────────────────────────────────────────────────────────
function PersonaTab({ persona, active, onClick }: { persona: Persona; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
        active ? 'text-[#080A0F] shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
      style={active ? { background: persona.color, boxShadow: `0 4px 20px ${persona.color}50` } : {}}
    >
      {PERSONA_ICONS[persona.id]}
      <span className="hidden sm:inline">{persona.label}</span>
    </button>
  )
}

// ── Session card (desktop grid view) ─────────────────────────────────────────
function SessionCard({ session }: { session: MockSession }) {
  const [starred, setStarred] = useState(false)

  // Fake capacity so cards feel like a real product
  const capacity = Math.floor(Math.random() * 30) + 10
  const booked = Math.floor(capacity * (0.4 + Math.random() * 0.55))
  const pct = booked / capacity

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="group bg-[#0A0C12] rounded-2xl border border-white/8 hover:border-white/18 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden flex flex-col"
    >
      {/* Left colour stripe */}
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: session.color }}
      />

      <div className="p-4 pl-5 flex-1 flex flex-col">
        {/* Time + star */}
        <div className="flex items-start justify-between mb-2">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: `${session.color}22`, color: session.color, border: `1px solid ${session.color}35` }}
          >
            {session.time}
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setStarred(s => !s) }}
            className="p-1 rounded-lg hover:bg-white/8 transition-colors"
            aria-label="Favourite"
          >
            <svg className="w-3.5 h-3.5" fill={starred ? '#EDB75B' : 'none'} stroke={starred ? '#EDB75B' : '#4B5563'} strokeWidth="2" viewBox="0 0 24 24">
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        </div>

        {/* Title */}
        <h4 className="text-white font-semibold text-sm leading-snug mb-1">{session.title}</h4>
        <p className="text-slate-500 text-xs mb-3 truncate">{session.teacher}</p>

        {/* Location + Level */}
        <div className="flex items-center gap-1.5 flex-wrap mt-auto">
          <span className="flex items-center gap-1 text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
            <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {session.location}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md font-medium" style={{ background: `${session.color}18`, color: session.color }}>
            {session.level}
          </span>
        </div>

        {/* Capacity bar */}
        <div className="mt-3">
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-slate-700">Capacity</span>
            <span style={{ color: pct > 0.85 ? '#EF4444' : pct > 0.65 ? '#F59E0B' : '#10B981' }}>
              {booked}/{capacity}
            </span>
          </div>
          <div className="h-[3px] rounded-full bg-white/6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct * 100}%`,
                background: pct > 0.85 ? '#EF4444' : pct > 0.65 ? '#F59E0B' : '#10B981',
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ── Phone mockup — mobile schedule view ──────────────────────────────────────
function PhoneMockup({ persona, activeLocation }: { persona: Persona; activeLocation: string }) {
  const sessions = activeLocation === 'All'
    ? persona.sessions
    : persona.sessions.filter(s => s.location === activeLocation)

  return (
    <div className="flex justify-center py-4">
      <div
        className="relative w-[260px] rounded-[2.5rem] p-[3px] shadow-2xl"
        style={{ background: `linear-gradient(145deg, ${persona.color}55, #ffffff18, ${persona.color}22)` }}
      >
        <div className="bg-[#0A0C12] rounded-[2.3rem] overflow-hidden">
          {/* Phone notch */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-20 h-[5px] bg-white/10 rounded-full" />
          </div>

          {/* App header */}
          <div
            className="px-4 py-3"
            style={{ background: `linear-gradient(135deg, ${persona.color}30, ${persona.color}10)` }}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-white text-xs font-bold">{persona.label}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <p className="text-slate-400 text-[10px]">{persona.tagline}</p>
          </div>

          {/* Filter chips */}
          <div className="px-3 py-2 flex gap-1.5 overflow-hidden">
            {['All', persona.sessions[0].location, persona.sessions[1]?.location].filter(Boolean).map((loc, i) => (
              <span
                key={loc}
                className="text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap font-medium"
                style={i === 0
                  ? { background: persona.color, color: '#080A0F' }
                  : { background: 'rgba(255,255,255,0.07)', color: '#9CA3AF' }}
              >
                {loc}
              </span>
            ))}
          </div>

          {/* Session rows */}
          <div className="px-3 pb-4 space-y-2">
            {sessions.map(session => (
              <div
                key={session.title}
                className="bg-[#111827] rounded-xl p-2.5 flex items-center gap-2.5 border border-white/5"
              >
                <div className="w-[3px] h-8 rounded-full flex-shrink-0" style={{ background: session.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">{session.title}</p>
                  <p className="text-slate-500 text-[10px]">{session.location}</p>
                </div>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ color: session.color, background: `${session.color}20` }}
                >
                  {session.time}
                </span>
              </div>
            ))}
          </div>

          {/* Phone bottom bar */}
          <div className="flex justify-center pb-2">
            <div className="w-24 h-[4px] bg-white/10 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductPreview() {
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0])
  const [activeLocation, setActiveLocation] = useState('All')
  const [activeDay, setActiveDay] = useState('Day 1')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')

  const locations = ['All', ...Array.from(new Set(activePersona.sessions.map(s => s.location)))]

  const filteredSessions = activeLocation === 'All'
    ? activePersona.sessions
    : activePersona.sessions.filter(s => s.location === activeLocation)

  const handlePersonaChange = (persona: Persona) => {
    setActivePersona(persona)
    setActiveLocation('All')
    setActiveDay('Day 1')
  }

  return (
    <section id="product" className="py-32 bg-[#0A0C10] relative overflow-hidden">
      {/* Ambient glow that follows persona colour */}
      <motion.div
        key={activePersona.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 65% 45% at 50% 0%, ${activePersona.color}14 0%, transparent 60%)`,
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <AnimateIn className="text-center mb-14">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 mb-5">
            Live Product Preview
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
            One platform, every event type.
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Switch between event types to see FlowGrid adapt to your exact use case.
          </p>
        </AnimateIn>

        {/* Persona tabs */}
        <AnimateIn delay={0.1}>
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {PERSONAS.map(persona => (
              <PersonaTab
                key={persona.id}
                persona={persona}
                active={activePersona.id === persona.id}
                onClick={() => handlePersonaChange(persona)}
              />
            ))}
          </div>
        </AnimateIn>

        {/* Browser chrome */}
        <AnimateIn delay={0.15}>
          <div className="rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/60">

            {/* Browser top bar */}
            <div className="bg-[#161B2C] px-4 py-3 flex items-center gap-3 border-b border-white/8">
              {/* Traffic lights */}
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
              </div>

              {/* URL bar */}
              <div className="flex-1 bg-[#0E1117] rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-xs mx-auto">
                <svg className="w-3 h-3 text-emerald-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-slate-400 text-xs truncate">
                  tryflowgrid.com/{activePersona.id}-event/schedule
                </span>
              </div>

              {/* Desktop / Mobile toggle */}
              <div className="flex items-center gap-1 bg-[#0E1117] rounded-lg p-1 flex-shrink-0">
                <button
                  onClick={() => setViewMode('desktop')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Desktop view"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="2" y="3" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 21h8M12 17v4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('mobile')}
                  className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  title="Mobile view"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="5" y="2" width="14" height="20" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 18h.01" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* App content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activePersona.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                {/* Event header stripe */}
                <div
                  className="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
                  style={{
                    background: `linear-gradient(135deg, ${activePersona.color}22 0%, ${activePersona.color}08 100%)`,
                    borderBottom: `1px solid ${activePersona.color}20`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${activePersona.color}22`, color: activePersona.color }}
                    >
                      {PERSONA_ICONS[activePersona.id]}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base leading-tight">
                        Example {activePersona.label}
                      </h3>
                      <p className="text-slate-400 text-xs">{activePersona.tagline}</p>
                    </div>
                  </div>

                  {/* Day picker */}
                  <div className="flex items-center gap-1 bg-black/30 rounded-xl p-1">
                    {DAYS.map(day => (
                      <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-200 ${
                          activeDay === day ? 'text-[#080A0F]' : 'text-slate-400 hover:text-white'
                        }`}
                        style={activeDay === day ? { background: activePersona.color } : {}}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-400">Live</span>
                  </div>
                </div>

                {/* Filter bar */}
                <div className="px-5 py-2.5 bg-[#0E1117] flex items-center gap-2 flex-wrap border-b border-white/5">
                  <span className="text-xs text-slate-600 mr-1">Room:</span>
                  {locations.map(location => (
                    <button
                      key={location}
                      onClick={() => setActiveLocation(location)}
                      className={`text-xs px-3 py-1 rounded-lg font-medium transition-all duration-150 ${
                        activeLocation === location
                          ? 'text-[#080A0F]'
                          : 'text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white'
                      }`}
                      style={activeLocation === location ? { background: activePersona.color } : {}}
                    >
                      {location}
                    </button>
                  ))}
                </div>

                {/* Desktop or Mobile view */}
                {viewMode === 'desktop' ? (
                  <div className="bg-[#080A0F] p-5">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 min-h-[240px]">
                      <AnimatePresence mode="popLayout">
                        {filteredSessions.map(session => (
                          <SessionCard key={session.title} session={session} />
                        ))}
                      </AnimatePresence>
                      {filteredSessions.length === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          className="col-span-full flex items-center justify-center py-16 text-slate-600 text-sm"
                        >
                          No sessions in this room.
                        </motion.div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                      <p className="text-xs text-slate-600">
                        Showing {filteredSessions.length} of {activePersona.sessions.length} sessions · {activeDay}
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <svg className="w-3 h-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Tap the star to save to your schedule
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#080A0F]">
                    <PhoneMockup persona={activePersona} activeLocation={activeLocation} />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </AnimateIn>

        {/* Persona insight card */}
        <AnimateIn delay={0.2}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activePersona.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="mt-6 rounded-2xl border p-5 grid md:grid-cols-3 gap-5"
              style={{ borderColor: `${activePersona.color}25`, background: `${activePersona.color}08` }}
            >
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">The problem</p>
                <p className="text-slate-300 text-sm leading-relaxed">"{activePersona.painPoint}"</p>
              </div>
              <div className="md:border-l md:border-white/8 md:pl-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Real organiser quote</p>
                <p className="text-slate-300 text-sm leading-relaxed italic">"{activePersona.quote}"</p>
                <p className="text-slate-500 text-xs mt-1">— {activePersona.quoteAuthor}</p>
              </div>
              <div className="md:border-l md:border-white/8 md:pl-5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Key features</p>
                <ul className="space-y-1.5">
                  {activePersona.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-slate-300 text-xs">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: activePersona.color }} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </AnimateIn>
      </div>
    </section>
  )
}
