'use client'

/**
 * ShowcaseNav — Sticky navigation bar for the FlowGrid showcase page.
 * Starts transparent, transitions to a blurred dark background on scroll.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function ShowcaseNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // Track scroll position to toggle the background style
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Smooth scroll to a section by id
  const scrollTo = (id: string) => {
    setMenuOpen(false)
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#080A0F]/90 backdrop-blur-md border-b border-white/8 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo — links back to top of showcase */}
        <button
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-2.5 group"
        >
          <Image
            src="/flow-grid-logo.png"
            alt="FlowGrid"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="font-bold text-lg text-white tracking-tight">FlowGrid</span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Problem', id: 'problem' },
            { label: 'Product', id: 'product' },
            { label: 'Features', id: 'features' },
            { label: 'Partners', id: 'partners' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {/* Back to main site */}
          <Link
            href="/"
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-200 flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to FlowGrid
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <Link
            href="/auth/signin"
            className="text-sm text-slate-400 hover:text-white transition-colors duration-200 px-4 py-2"
          >
            Log in
          </Link>
          <button
            onClick={() => scrollTo('cta')}
            className="text-sm font-semibold bg-gradient-to-r from-[#EDB75B] to-[#FF7119] text-[#080A0F] px-5 py-2.5 rounded-full hover:opacity-90 transition-all duration-200 shadow-lg shadow-amber-500/20"
          >
            Get Started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-slate-400 hover:text-white"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l12 12M16 4L4 16" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h14M3 10h14M3 14h14" strokeLinecap="round" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0E1117]/95 backdrop-blur-md border-t border-white/8 px-6 py-4 flex flex-col gap-4">
          {[
            { label: 'Problem', id: 'problem' },
            { label: 'Product', id: 'product' },
            { label: 'Features', id: 'features' },
            { label: 'Partners', id: 'partners' },
          ].map(({ label, id }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-left text-slate-300 hover:text-white py-2 text-base"
            >
              {label}
            </button>
          ))}
          <div className="pt-2 border-t border-white/8 flex flex-col gap-3">
            <Link href="/" className="text-slate-500 hover:text-slate-300 py-2 text-sm flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to FlowGrid
            </Link>
            <Link href="/auth/signin" className="text-slate-400 py-2 text-base">
              Log in
            </Link>
            <button
              onClick={() => scrollTo('cta')}
              className="font-semibold bg-gradient-to-r from-[#EDB75B] to-[#FF7119] text-[#080A0F] px-5 py-3 rounded-full"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
