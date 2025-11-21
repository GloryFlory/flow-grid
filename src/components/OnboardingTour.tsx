'use client'

import { useEffect, useState } from 'react'
import { startFestivalTour } from '@/lib/onboarding-tour'

interface OnboardingTourProps {
  userId: string
  hasCompletedOnboarding: boolean
}

export function OnboardingTour({ userId, hasCompletedOnboarding }: OnboardingTourProps) {
  const [shouldShowTour, setShouldShowTour] = useState(false)

  useEffect(() => {
    // Wait for DOM to be ready and check if tour should be shown
    if (!hasCompletedOnboarding) {
      // Small delay to ensure all elements are rendered
      const timer = setTimeout(() => {
        setShouldShowTour(true)
      }, 500)
      
      return () => clearTimeout(timer)
    }
  }, [hasCompletedOnboarding])

  useEffect(() => {
    if (shouldShowTour) {
      startFestivalTour(userId, () => {
        setShouldShowTour(false)
      })
    }
  }, [shouldShowTour, userId])

  return null
}

interface TourButtonProps {
  onClick: () => void
}

export function RetakeTourButton({ onClick }: TourButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Take Tour Again
    </button>
  )
}
