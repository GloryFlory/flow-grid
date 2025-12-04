'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Loader2, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface ClaimResult {
  success?: boolean
  error?: string
  message?: string
  booking?: {
    sessionTitle: string
    festivalName: string
  }
}

export default function ClaimSpotPage({ params }: { params: Promise<{ slug: string }> }) {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [slug, setSlug] = useState<string>('')
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [result, setResult] = useState<ClaimResult | null>(null)

  useEffect(() => {
    params.then(p => setSlug(p.slug))
  }, [params])

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setResult({ error: 'No claim token provided' })
      return
    }

    const claimSpot = async () => {
      try {
        const response = await fetch('/api/waitlist/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })

        const data = await response.json()

        if (response.status === 410) {
          setStatus('expired')
          setResult(data)
        } else if (!response.ok) {
          setStatus('error')
          setResult(data)
        } else {
          setStatus('success')
          setResult(data)
        }
      } catch (error) {
        setStatus('error')
        setResult({ error: 'Failed to claim spot. Please try again.' })
      }
    }

    claimSpot()
  }, [token])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 text-green-500 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Claiming Your Spot...</h1>
          <p className="text-gray-600">Please wait while we confirm your booking.</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You're In! 🎉</h1>
          <p className="text-gray-600 mb-6">
            {result?.message || 'Your spot has been successfully booked.'}
          </p>
          {result?.booking && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
              <p className="font-semibold text-green-800">{result.booking.sessionTitle}</p>
              <p className="text-green-700 text-sm">{result.booking.festivalName}</p>
            </div>
          )}
          {slug && (
            <Link
              href={`/${slug}/schedule`}
              className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              View Schedule
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-12 h-12 text-amber-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Offer Expired</h1>
          <p className="text-gray-600 mb-6">
            {result?.error || 'This offer has expired and the spot has been offered to the next person.'}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Don't worry - if you're still on the waitlist, you'll be notified when another spot opens up.
          </p>
          {slug && (
            <Link
              href={`/${slug}/schedule`}
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-amber-700 transition-colors"
            >
              Back to Schedule
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
        <p className="text-gray-600 mb-6">
          {result?.error || "We couldn't process your request. Please try again."}
        </p>
        {slug && (
          <Link
            href={`/${slug}/schedule`}
            className="inline-flex items-center gap-2 bg-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Back to Schedule
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  )
}
