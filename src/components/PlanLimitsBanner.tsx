'use client'

import { Card, CardContent } from '@/components/ui/card'
import { 
  Crown, 
  CheckCircle
} from 'lucide-react'

interface PlanLimitsBannerProps {
  currentPlan: 'FREE' | 'PRO' | 'ENTERPRISE'
  festivalsUsed: number
  festivalsLimit: number
  isAdmin: boolean
  canCreateMore: boolean
}

export function PlanLimitsBanner({ 
  currentPlan, 
  festivalsUsed, 
  festivalsLimit, 
  isAdmin, 
  canCreateMore 
}: PlanLimitsBannerProps) {
  
  if (isAdmin) {
    return (
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-purple-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-purple-900">Admin Access</h3>
              <p className="text-sm text-purple-700">
                You have unlimited access to all features and can manage any festival.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // For all users, show unlimited usage
  return (
    <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">Usage: Unlimited</h3>
            <p className="text-sm text-green-700">
              Create unlimited festivals and enjoy all features without restrictions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}