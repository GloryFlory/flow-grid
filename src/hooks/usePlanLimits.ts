import { useEffect, useState } from 'react'
import { PlanFeatures } from '@/types'

interface PlanLimits {
  currentPlan: 'FREE' | 'PRO' | 'ENTERPRISE'
  festivalsUsed: number
  festivalsLimit: number
  sessionsLimit: number
  isAdmin: boolean
  isFoundingMember: boolean
  canCreateMore: boolean
  features: PlanFeatures
}

export function usePlanLimits() {
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasFetched, setHasFetched] = useState(false)

  useEffect(() => {
    // Only fetch if we haven't already fetched data
    if (!hasFetched) {
      fetchLimits()
    }
  }, [hasFetched])

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/user/limits')
      if (response.ok) {
        const data = await response.json()
        setLimits(data)
        setHasFetched(true)
      }
    } catch (error) {
      console.error('Failed to fetch plan limits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = () => {
    setIsLoading(true)
    setHasFetched(false) // Reset hasFetched to allow refetch
    fetchLimits()
  }

  return { limits, isLoading, refresh }
}