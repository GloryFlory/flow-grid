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

  // Free plan with usage remaining - show upgrade prompt
  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">You're on the Free Plan</h3>
              <p className="text-sm text-slate-600 mt-0.5">
                {festivalsUsed === 0 
                  ? `Create your first festival for free!`
                  : `${festivalsLimit - festivalsUsed} festival${festivalsLimit - festivalsUsed !== 1 ? 's' : ''} remaining`
                }
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> 1 festival
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> Basic customization
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" /> Shareable link
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-stretch sm:items-end gap-2">
            <Link 
              href="/pricing" 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              <Crown className="w-4 h-4" />
              Upgrade to Pro
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-xs text-slate-500 text-center sm:text-right">
              5 festivals, custom branding & more
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}