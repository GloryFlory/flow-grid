'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, CreditCard, ArrowRight, Info } from 'lucide-react'
import Link from 'next/link'

export default function ClaimProPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [claiming, setClaiming] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClaimPro = async () => {
    if (!session?.user) {
      router.push('/auth/signin?callbackUrl=/claim-pro')
      return
    }

    setClaiming(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/revolut/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'PRO',
          billingCycle: 'YEARLY', // Default to yearly, admin will verify actual payment
          transactionRef: null,
        })
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 3000)
      } else {
        setError(data.error || 'Failed to activate Pro. Please contact support.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again or contact support.')
    } finally {
      setClaiming(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Welcome to Pro! 🎉
          </h1>
          <p className="text-slate-600 mb-6">
            Your account has been upgraded! We'll verify your payment within 24 hours.
          </p>
          <p className="text-sm text-slate-500">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Claim Your Pro Access
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Just completed your payment? Activate your Pro features instantly!
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          
          {/* How it Works */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">How it works:</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Complete your payment</h3>
                  <p className="text-slate-600">Make your payment via Revolut using card, Apple Pay, Google Pay, or bank transfer</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">Claim your Pro access</h3>
                  <p className="text-slate-600">Click the button below to instantly activate your Pro features</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">We verify your payment</h3>
                  <p className="text-slate-600">We'll confirm your payment within 24 hours - but you can start using Pro immediately!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <strong>Important:</strong> Only click "Claim Pro Access" if you've actually completed the payment. We manually verify all payments.
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* CTA */}
          {!session ? (
            <div className="text-center">
              <p className="text-slate-600 mb-4">Please sign in to claim your Pro access</p>
              <Link
                href="/auth/signin?callbackUrl=/claim-pro"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                Sign In
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          ) : (
            <Button
              onClick={handleClaimPro}
              disabled={claiming}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-6 text-lg font-semibold"
            >
              {claiming ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Activating Pro...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Claim Pro Access
                </>
              )}
            </Button>
          )}
        </div>

        {/* Haven't Paid Yet */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 text-center">
          <h3 className="font-semibold text-slate-900 mb-2">Haven't paid yet?</h3>
          <p className="text-slate-600 mb-4">Go back to the pricing page to choose your plan</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            View Pricing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
