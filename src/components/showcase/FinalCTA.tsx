'use client'

/**
 * FinalCTA — Closing section. One last push to convert.
 *
 * Structure:
 * - Strong, memorable headline
 * - Short copy that re-frames the decision
 * - Two CTA buttons (demo link + email)
 * - Minimalist footer strip
 */

import AnimateIn from './ui/AnimateIn'
import Link from 'next/link'
import Footer from '@/components/Footer'

export default function FinalCTA() {
  return (
    <>
      {/* CTA Section */}
      <section
        id="cta"
        className="py-40 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(160deg, #0A0C12 0%, #0E1117 40%, #111827 100%)',
        }}
      >
        {/* Background decorative gradient */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(237,183,91,0.08) 0%, rgba(42,70,139,0.06) 50%, transparent 70%)',
          }}
        />

        {/* Grid texture */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          {/* Eyebrow */}
          <AnimateIn>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 mb-8">
              Ready when you are
            </span>
          </AnimateIn>

          {/* Headline */}
          <AnimateIn delay={0.08}>
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-7 text-white">
              Your next event
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #EDB75B 0%, #FF7119 60%, #B40225 100%)',
                }}
              >
                deserves better.
              </span>
            </h2>
          </AnimateIn>

          {/* Subtext */}
          <AnimateIn delay={0.14}>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-12">
              Stop fighting with PDFs, WhatsApp groups, and spreadsheets.
              FlowGrid takes 20 minutes to set up — and pays off before day one of your event.
            </p>
          </AnimateIn>

          {/* CTA buttons */}
          <AnimateIn delay={0.2}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {/* Primary */}
              <Link
                href="/auth/signin"
                className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full font-semibold text-base text-[#080A0F] shadow-xl shadow-amber-500/25 transition-all duration-300 hover:scale-105 hover:shadow-amber-500/40"
                style={{ background: 'linear-gradient(135deg, #EDB75B 0%, #FF7119 100%)' }}
              >
                Create your first event
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              {/* Secondary */}
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-base text-white border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all duration-200"
              >
                Book a 20-min demo
              </Link>
            </div>
          </AnimateIn>

          {/* Trust badges */}
          <AnimateIn delay={0.26}>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-slate-600 text-sm">
              {[
                '✓ Free to start',
                '✓ No credit card required',
                '✓ Set up in 20 minutes',
                '✓ Cancel anytime',
              ].map((item) => (
                <span key={item} className="text-slate-500">
                  {item}
                </span>
              ))}
            </div>
          </AnimateIn>

          {/* Live demo link */}
          <AnimateIn delay={0.32} className="mt-14">
            <p className="text-slate-600 text-sm mb-3">Or explore a live example first:</p>
            <a
              href="/flow-grid-demo/schedule"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors group text-sm"
            >
              View demo event schedule
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </AnimateIn>
        </div>
      </section>

      <Footer />
    </>
  )
}
