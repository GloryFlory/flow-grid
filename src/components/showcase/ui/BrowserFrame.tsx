'use client'

/**
 * BrowserFrame — Reusable browser chrome wrapper.
 *
 * Wraps any content in a realistic browser window mockup.
 * Used in ProductPreview and reusable anywhere you want to show
 * a product/website screenshot in a premium framed context.
 *
 * Usage:
 *   <BrowserFrame url="tryflowgrid.com/my-event/schedule">
 *     <YourContent />
 *   </BrowserFrame>
 */

import { ReactNode } from 'react'

interface BrowserFrameProps {
  /** URL shown in the fake address bar */
  url?: string
  /** Content rendered inside the browser window */
  children: ReactNode
  /** Optional extra class on the outer wrapper */
  className?: string
  /** Show the desktop/mobile toggle buttons */
  viewToggle?: ReactNode
}

export default function BrowserFrame({
  url = 'tryflowgrid.com',
  children,
  className = '',
  viewToggle,
}: BrowserFrameProps) {
  return (
    <div
      className={`rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-black/60 ${className}`}
    >
      {/* Top bar — traffic lights, URL, optional toggle */}
      <div className="bg-[#161B2C] px-4 py-3 flex items-center gap-3 border-b border-white/8">
        {/* Traffic lights */}
        <div className="flex gap-1.5 flex-shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
        </div>

        {/* URL bar */}
        <div className="flex-1 bg-[#0E1117] rounded-lg px-3 py-1.5 flex items-center gap-2 max-w-sm mx-auto">
          {/* HTTPS padlock */}
          <svg
            className="w-3 h-3 text-emerald-400 flex-shrink-0"
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-slate-400 text-xs truncate">{url}</span>
        </div>

        {/* Optional right-side slot (e.g. desktop/mobile toggle) */}
        {viewToggle && (
          <div className="flex-shrink-0">{viewToggle}</div>
        )}
      </div>

      {/* Content area */}
      {children}
    </div>
  )
}
