'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Crown, 
  CheckCircle,
  AlertTriangle,
  Zap,
  ArrowRight
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

  // Show upgrade prompt when at limit
  if (!canCreateMore) {
    return (
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              <div>
                <h3 className="font-semibold text-amber-900">Festival Limit Reached</h3>
                <p className="text-sm text-amber-700">
                  You've used {festivalsUsed} of {festivalsLimit} festival{festivalsLimit !== 1 ? 's' : ''} on the {currentPlan} plan.
                </p>
              </div>
            </div>
            <Link 
              href="/pricing" 
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors whitespace-nowrap"
            >
              <Zap className="w-4 h-4" />
              Upgrade Now
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show usage for paid plans
  if (currentPlan !== 'FREE') {
    const usageText = festivalsLimit === -1 
      ? `${festivalsUsed} festival${festivalsUsed !== 1 ? 's' : ''} (unlimited)` 
      : `${festivalsUsed} of ${festivalsLimit} festivals`
    
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">{currentPlan} Plan</h3>
              <p className="text-sm text-green-700">
                {usageText}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Free plan with usage remaining
  return (
    <Card className="border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-600">
                {festivalsUsed}/{festivalsLimit}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Free Plan</h3>
              <p className="text-sm text-slate-600">
                {festivalsLimit - festivalsUsed} festival{festivalsLimit - festivalsUsed !== 1 ? 's' : ''} remaining
              </p>
            </div>
          </div>
          <Link 
            href="/pricing" 
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <Zap className="w-4 h-4" />
            Upgrade
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}