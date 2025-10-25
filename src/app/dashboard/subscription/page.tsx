'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Crown, Zap, ArrowLeft } from 'lucide-react'

export default function SubscriptionPage() {
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = async (plan: string) => {
    setIsLoading(true)
    // TODO: Implement Stripe checkout
    alert(`Upgrade to ${plan} - Stripe integration coming soon!`)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
          <p className="text-gray-600 mt-2">Choose the perfect plan for your festival needs</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Free Plan */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-gray-600" />
                <CardTitle className="text-2xl">Free</CardTitle>
              </div>
              <div className="text-4xl font-bold">$0<span className="text-lg text-gray-600">/month</span></div>
              <p className="text-gray-600">Perfect for small events</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>1 festival</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Unlimited sessions</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Teacher management</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Basic analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Custom branding</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative border-2 border-blue-500 shadow-lg">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                Most Popular
              </span>
            </div>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-blue-600" />
                <CardTitle className="text-2xl">Pro</CardTitle>
              </div>
              <div className="text-4xl font-bold">$29<span className="text-lg text-gray-600">/month</span></div>
              <p className="text-gray-600">For growing festivals</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Up to 5 festivals</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>All Free features</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Advanced analytics</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Booking system (coming soon)</span>
                </div>
              </div>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => handleUpgrade('PRO')}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Upgrade to Pro'}
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-2xl">Enterprise</CardTitle>
              </div>
              <div className="text-4xl font-bold">$99<span className="text-lg text-gray-600">/month</span></div>
              <p className="text-gray-600">For large organizations</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Unlimited festivals</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>All Pro features</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>White-label solution</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Custom integrations</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Custom domain</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-600" />
                  <span>Dedicated support</span>
                </div>
              </div>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => handleUpgrade('ENTERPRISE')}
                disabled={isLoading}
              >
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Coming Soon Banner */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Stripe Integration Coming Soon
              </h3>
              <p className="text-blue-700">
                We're working on integrating Stripe for seamless subscription management. 
                For now, please contact us directly for plan upgrades.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
