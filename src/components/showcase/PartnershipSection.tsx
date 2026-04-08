'use client'

/**
 * PartnershipSection — For platforms, retreat companies, and event tech partners.
 *
 * Targets three audiences:
 * 1. Retreat/festival platforms looking to offer FlowGrid to their clients
 * 2. Event companies wanting white-label scheduling
 * 3. Tech co-founders / marketplaces interested in API integration
 */

import AnimateIn from './ui/AnimateIn'

const PLATFORM_FEATURES = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'White-label ready',
    description: "Your brand, your colours, your domain. FlowGrid disappears — your platform shines.",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'API & embed',
    description: 'Embed a live schedule anywhere with a single `<script>` tag. Or connect via REST API.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Multi-event management',
    description: 'Manage a portfolio of events from one dashboard. Perfect for networks and venue groups.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Booking integrations',
    description: 'Connect your existing booking system. Attendee data flows in — schedules update automatically.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'Analytics for organisers',
    description: 'Your clients get real engagement data — which sessions attract the most attention, peak traffic times, and more.',
  },
]

export default function PartnershipSection() {
  return (
    <section id="partners" className="py-32 bg-[#080A0F] relative overflow-hidden">
      {/* Ambient navy blue glow */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(42,70,139,0.15) 0%, transparent 60%)',
        }}
      />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Section header */}
        <AnimateIn className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-blue-400 bg-blue-400/10 border border-blue-400/20 mb-5">
            Built for Platforms
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-5">
            The scheduling layer for
            <br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #2A468B, #3B82F6)' }}
            >
              the events ecosystem.
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            FlowGrid isn't just a tool — it's infrastructure. Add powerful, branded scheduling
            to your platform without building it yourself.
          </p>
        </AnimateIn>

        {/* Two column layout: features + partner CTA */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Feature grid (3 columns) */}
          <div className="lg:col-span-3">
            <AnimateIn>
              <div className="grid sm:grid-cols-2 gap-4">
                {PLATFORM_FEATURES.map((feature, i) => (
                  <div
                    key={feature.title}
                    className="p-5 rounded-2xl border border-white/8 bg-[#0E1117] hover:border-white/15 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-3">
                      {feature.icon}
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-1.5">{feature.title}</h4>
                    <p className="text-slate-400 text-xs leading-relaxed">{feature.description}</p>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>

          {/* Partner CTA card */}
          <AnimateIn delay={0.15} className="lg:col-span-2">
            <div className="h-full p-8 rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 to-transparent flex flex-col">
              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="text-white font-bold text-xl mb-3">
                Let's build something together.
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6 flex-1">
                We're looking for retreat platforms, festival networks, event agencies,
                and booking systems to partner with. If your users organise events,
                we should talk.
              </p>

              {/* Partner indicators */}
              <div className="space-y-2 mb-7">
                {[
                  'Retreat booking platforms',
                  'Festival & event networks',
                  'Venue management software',
                  'Event agencies & promoters',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-slate-300 text-sm">
                    <svg className="w-4 h-4 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>

              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white border border-blue-400/40 hover:bg-blue-500/15 hover:border-blue-400/60 transition-all duration-200"
              >
                Start a partnership conversation
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  )
}
