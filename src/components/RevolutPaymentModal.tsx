'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ExternalLink, CheckCircle2, Loader2 } from 'lucide-react'

interface RevolutPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paymentLink: string
  plan: string
  amount: number
  billingCycle: 'MONTHLY' | 'YEARLY'
}

export function RevolutPaymentModal({
  isOpen,
  onClose,
  paymentLink,
  plan,
  amount,
  billingCycle
}: RevolutPaymentModalProps) {
  const [step, setStep] = useState<'pay' | 'confirm' | 'success'>('pay')
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handlePaymentComplete = async () => {
    setConfirming(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/revolut/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          billingCycle,
          transactionRef: null, // Optional: user could provide this
        })
      })

      const data = await response.json()

      if (response.ok) {
        setStep('success')
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        setError(data.error || 'Failed to confirm payment')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {step === 'pay' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Complete Payment
            </h2>
            <div className="mb-6">
              <p className="text-slate-600 mb-4">
                You're upgrading to <strong>{plan}</strong> ({billingCycle.toLowerCase()})
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-900 font-medium">Amount: €{amount}</p>
              </div>
              <ol className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">1.</span>
                  <span>Click the button below to open Revolut payment</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">2.</span>
                  <span>Complete your payment on Revolut</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">3.</span>
                  <span>Return here and click "I've completed payment"</span>
                </li>
              </ol>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={paymentLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
                Pay with Revolut
              </a>
              <Button
                onClick={() => setStep('confirm')}
                variant="outline"
                className="w-full"
              >
                I've completed payment
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Confirm Payment
            </h2>
            <p className="text-slate-600 mb-6">
              Have you completed the payment on Revolut? Once confirmed, you'll be instantly upgraded to Pro!
            </p>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-amber-900">
                ⚠️ Only confirm if you've actually paid. We'll verify your payment within 24 hours.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handlePaymentComplete}
                disabled={confirming}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {confirming ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Yes, I've paid
                  </>
                )}
              </Button>
              <Button
                onClick={() => setStep('pay')}
                variant="outline"
                className="w-full"
                disabled={confirming}
              >
                Go back
              </Button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome to Pro! 🎉
            </h2>
            <p className="text-slate-600 mb-4">
              You've been upgraded successfully. We'll verify your payment within 24 hours.
            </p>
            <p className="text-sm text-slate-500">
              Redirecting to your dashboard...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
