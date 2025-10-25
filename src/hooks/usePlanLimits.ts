import { useEffect, useState } from 'react'

interface PlanLimits {
  currentPlan: 'FREE' | 'PRO' | 'ENTERPRISE'
  festivalsUsed: number
  festivalsLimit: number
  isAdmin: boolean
  canCreateMore: boolean
}

export function usePlanLimits() {
  const [limits, setLimits] = useState<PlanLimits | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchLimits()
  }, [])

  const fetchLimits = async () => {
    try {
      const response = await fetch('/api/user/limits')
      if (response.ok) {
        const data = await response.json()
        setLimits(data)
      }
    } catch (error) {
      console.error('Failed to fetch plan limits:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = () => {
    setIsLoading(true)
    fetchLimits()
  }

  return { limits, isLoading, refresh }
}