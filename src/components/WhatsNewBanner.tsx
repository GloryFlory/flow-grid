'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { X, Sparkles } from 'lucide-react'

// Update this date whenever you want to show the banner again
const LATEST_UPDATE_DATE = '2025-12-07'
const STORAGE_KEY = 'flowgrid_last_seen_update'

interface WhatsNewBannerProps {
  variant?: 'banner' | 'toast'
}

export function WhatsNewBanner({ variant = 'banner' }: WhatsNewBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // Check if user has seen this update
    const lastSeen = localStorage.getItem(STORAGE_KEY)
    
    if (!lastSeen || lastSeen < LATEST_UPDATE_DATE) {
      // Small delay for nicer UX - let the page load first
      const timer = setTimeout(() => {
        setIsVisible(true)
        setIsAnimating(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      localStorage.setItem(STORAGE_KEY, LATEST_UPDATE_DATE)
    }, 300)
  }

  const handleLinkClick = () => {
    localStorage.setItem(STORAGE_KEY, LATEST_UPDATE_DATE)
  }

  if (!isVisible) return null

  if (variant === 'toast') {
    return (
      <div 
        className={`fixed bottom-4 right-4 z-50 max-w-sm transition-all duration-300 ${
          isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-4 relative overflow-hidden">
          {/* Gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
          
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3 pr-6">
            <div className="p-2 bg-purple-100 rounded-lg shrink-0">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">New features available! ✨</h4>
              <p className="text-sm text-gray-600 mt-1">
                Team collaboration with role-based permissions is now live!
              </p>
              <Link 
                href="/updates"
                onClick={handleLinkClick}
                className="inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium mt-2"
              >
                See what's new →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default banner variant
  return (
    <div 
      className={`transition-all duration-300 overflow-hidden ${
        isAnimating ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" />
            <p className="text-sm font-medium">
              <span className="hidden sm:inline">🎉 New features just launched! </span>
              <span className="sm:hidden">New features! </span>
              <Link 
                href="/updates" 
                onClick={handleLinkClick}
                className="underline hover:no-underline font-semibold"
              >
                Check out what's new
              </Link>
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
