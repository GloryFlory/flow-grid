'use client'

import Link from 'next/link'
import { 
  Zap, 
  ArrowRight, 
  Calendar, 
  Palette, 
  Code, 
  BarChart3,
  Globe,
  X
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface UpgradePromptProps {
  variant?: 'banner' | 'card' | 'inline' | 'modal'
  dismissible?: boolean
  storageKey?: string
}

const PRO_FEATURES = [
  { icon: Calendar, text: 'Up to 5 festivals' },
  { icon: Palette, text: 'Remove "Powered by Flow Grid"' },
  { icon: Code, text: 'Embeddable widget' },
  { icon: Globe, text: 'Custom subdomain' },
  { icon: BarChart3, text: 'Advanced analytics' },
]

export function UpgradePrompt({ 
  variant = 'card', 
  dismissible = false,
  storageKey = 'upgrade-prompt-dismissed'
}: UpgradePromptProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    if (dismissible && typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(storageKey)
      if (dismissed) {
        const dismissedDate = new Date(dismissed)
        const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
        // Show again after 7 days
        if (daysSinceDismissed < 7) {
          setIsDismissed(true)
        }
      }
    }
  }, [dismissible, storageKey])

  const handleDismiss = () => {
    setIsDismissed(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, new Date().toISOString())
    }
  }

  if (isDismissed) return null

  if (variant === 'inline') {
    return (
      <Link 
        href="/pricing"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium group"
      >
        <Zap className="w-4 h-4" />
        Upgrade to Pro
        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
      </Link>
    )
  }

  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 relative">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">
              Unlock more festivals, custom branding, and advanced features with Pro
            </span>
          </div>
          <Link 
            href="/pricing"
            className="bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
          >
            Upgrade Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {dismissible && (
          <button 
            onClick={handleDismiss}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }

  // Default: card variant
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 relative">
      {dismissible && (
        <button 
          onClick={handleDismiss}
          className="absolute right-3 top-3 p-1 hover:bg-blue-100 rounded text-blue-400 hover:text-blue-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            Upgrade to Pro
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Get more festivals, remove branding, and unlock powerful features.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            {PRO_FEATURES.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                <feature.icon className="w-4 h-4 text-blue-600" />
                {feature.text}
              </div>
            ))}
          </div>
          
          <Link 
            href="/pricing"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            View Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

// Smaller teaser for sidebars or smaller spaces
export function UpgradeTeaser() {
  return (
    <Link 
      href="/pricing"
      className="block bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 hover:from-blue-700 hover:to-purple-700 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <Zap className="w-5 h-5" />
        <div className="flex-1">
          <div className="font-semibold text-sm">Upgrade to Pro</div>
          <div className="text-xs text-blue-100">Starting at $23/mo</div>
        </div>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}
