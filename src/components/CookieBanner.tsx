'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, Cookie } from 'lucide-react'
import { Button } from '@/components/ui/button'

const COOKIE_CONSENT_KEY = 'flow-grid-cookie-consent'

type ConsentStatus = 'pending' | 'accepted' | 'rejected'

export default function CookieBanner() {
  const [consent, setConsent] = useState<ConsentStatus>('pending')
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimatingOut, setIsAnimatingOut] = useState(false)

  useEffect(() => {
    // Check if user has already made a choice
    const savedConsent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (savedConsent) {
      setConsent(savedConsent as ConsentStatus)
      return
    }

    // Show banner after 2 seconds (let user see the page first)
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    animateAndClose('accepted')
    
    // Enable analytics tracking
    if (typeof window !== 'undefined' && (window as any).enableAnalytics) {
      (window as any).enableAnalytics()
    }
  }

  const handleReject = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
    animateAndClose('rejected')
  }

  const animateAndClose = (status: ConsentStatus) => {
    setIsAnimatingOut(true)
    setTimeout(() => {
      setConsent(status)
      setIsVisible(false)
    }, 300)
  }

  if (consent !== 'pending' || !isVisible) return null

  return (
    <>
      {/* Backdrop - subtle, doesn't block interaction */}
      <div 
        className={`fixed inset-0 bg-black/5 backdrop-blur-[1px] z-40 transition-opacity duration-300 ${
          isAnimatingOut ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleReject}
      />
      
      {/* Banner - bottom right corner */}
      <div 
        className={`fixed bottom-6 right-6 z-50 max-w-md transition-all duration-500 ease-out ${
          isAnimatingOut 
            ? 'translate-y-[200%] opacity-0' 
            : 'translate-y-0 opacity-100'
        }`}
        style={{
          animation: isAnimatingOut ? 'none' : 'slideInBounce 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-[#2a468b] to-[#466d60] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md">
                <Image 
                  src="/flow-grid-logo.png" 
                  alt="Flow Grid" 
                  width={28} 
                  height={28}
                  className="object-contain"
                />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">Flow Grid</h3>
                <p className="text-white/80 text-xs">Cookie Preferences</p>
              </div>
            </div>
            <button
              onClick={handleReject}
              className="text-white/80 hover:text-white transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-4">
              <div className="flex items-start gap-3 mb-3">
                <Cookie className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">We value your privacy</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    We use cookies to enhance your experience. Here's what we use:
                  </p>
                </div>
              </div>

              <div className="space-y-3 ml-8">
                {/* Essential */}
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Essential Cookies</p>
                    <p className="text-xs text-gray-500">Authentication & security (always active)</p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Analytics Cookies</p>
                    <p className="text-xs text-gray-500">Anonymous usage data to improve our platform</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleReject}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                Essential Only
              </Button>
              <Button
                onClick={handleAccept}
                className="flex-1 bg-gradient-to-r from-[#2a468b] to-[#466d60] hover:from-[#1f3366] hover:to-[#3a5a4f] text-white shadow-md"
              >
                Accept All
              </Button>
            </div>

            {/* Footer link */}
            <div className="mt-4 text-center">
              <a 
                href="/privacy#cookies" 
                className="text-xs text-gray-500 hover:text-gray-700 underline decoration-dotted underline-offset-2"
                onClick={handleReject}
              >
                View Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes for bounce animation */}
      <style jsx>{`
        @keyframes slideInBounce {
          0% {
            transform: translateY(200%) scale(0.8);
            opacity: 0;
          }
          50% {
            transform: translateY(-10px) scale(1.02);
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  )
}
