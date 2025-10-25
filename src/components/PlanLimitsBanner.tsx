'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Crown, 
  AlertTriangle, 
  Zap,
  ArrowRight,
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

  const usagePercentage = festivalsLimit > 0 ? (festivalsUsed / festivalsLimit) * 100 : 0
  const isNearLimit = usagePercentage >= 80
  const isAtLimit = !canCreateMore

  if (currentPlan === 'ENTERPRISE') {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Enterprise Plan</h3>
              <p className="text-sm text-green-700">
                Unlimited festivals • Priority support • Custom features
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isAtLimit) {
    return (
      <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Plan Limit Reached</h3>
              <p className="text-sm text-red-700">
                You've used {festivalsUsed} of {festivalsLimit} festivals on your {currentPlan} plan.
              </p>
            </div>
            <Link href="/pricing">
              <Button size="sm" className="bg-red-600 hover:bg-red-700">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isNearLimit) {
    return (
      <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-900">Almost at your limit</h3>
              <p className="text-sm text-yellow-700">
                You've used {festivalsUsed} of {festivalsLimit} festivals. Consider upgrading soon.
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="border-yellow-300 text-yellow-800 hover:bg-yellow-100">
                <Zap className="w-4 h-4 mr-2" />
                View Plans
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (currentPlan === 'FREE') {
    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-blue-600" />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900">Free Plan Active</h3>
              <p className="text-sm text-blue-700">
                You've used {festivalsUsed} of {festivalsLimit} festival. Upgrade for unlimited festivals and advanced features.
              </p>
            </div>
            <Link href="/pricing">
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-800 hover:bg-blue-100">
                <Crown className="w-4 h-4 mr-2" />
                Upgrade
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}