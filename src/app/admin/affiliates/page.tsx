'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BadgeEuro, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AffiliateReferral {
  id: string
  affiliateUserId: string
  affiliateEmail: string | null
  affiliateName: string | null
  referredEmail: string | null
  conversionType: string | null
  payoutAmount: string | null
  status: 'SIGNED_UP' | 'CONVERTED' | 'PAID'
  convertedAt: string | null
  paidAt: string | null
  notes: string | null
}

export default function AdminAffiliatesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [referrals, setReferrals] = useState<AffiliateReferral[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'CONVERTED' | 'PAID' | 'ALL'>('CONVERTED')
  const [paying, setPaying] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin')
  }, [status, router])

  useEffect(() => {
    fetchReferrals()
  }, [filter])

  const fetchReferrals = async () => {
    setLoading(true)
    const res = await fetch(`/api/admin/affiliates?status=${filter}`)
    if (res.ok) {
      const data = await res.json()
      setReferrals(data.referrals)
    }
    setLoading(false)
  }

  const handleMarkPaid = async (id: string) => {
    setPaying(id)
    const res = await fetch(`/api/admin/affiliates/${id}/pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    if (res.ok) {
      setReferrals((prev) => prev.map((r) => r.id === id ? { ...r, status: 'PAID', paidAt: new Date().toISOString() } : r))
    }
    setPaying(null)
  }

  const totalPending = referrals
    .filter((r) => r.status === 'CONVERTED')
    .reduce((sum, r) => sum + Number(r.payoutAmount ?? 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Platform Dashboard Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/platform"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Platform Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-900">Affiliate Payouts</h1>
            </div>

            <Link
              href="/dashboard"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              My Dashboard →
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Affiliate Payouts</h2>
          <p className="text-gray-500 mt-1 text-sm">
            {filter === 'CONVERTED' && totalPending > 0 && (
              <span className="font-medium text-amber-700">€{totalPending} pending payout</span>
            )}
            {filter === 'CONVERTED' && totalPending === 0 && 'No pending payouts'}
          </p>
        </div>
        <div className="flex gap-2">
          {(['CONVERTED', 'PAID', 'ALL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'CONVERTED' ? 'Pending' : f === 'PAID' ? 'Paid' : 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading...</div>
        ) : !referrals.length ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No referrals found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Affiliate</th>
                <th className="px-6 py-3">Referred user</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Payout</th>
                <th className="px-6 py-3">Converted</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {referrals.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{r.affiliateName ?? '—'}</div>
                    <div className="text-xs text-gray-400">{r.affiliateEmail ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.referredEmail ?? '—'}</td>
                  <td className="px-6 py-4 text-gray-500">{r.conversionType ?? '—'}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {r.payoutAmount ? `€${Number(r.payoutAmount).toFixed(0)}` : '—'}
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">
                    {r.convertedAt
                      ? new Date(r.convertedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {r.status === 'CONVERTED' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    )}
                    {r.status === 'PAID' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    )}
                    {r.status === 'SIGNED_UP' && (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        Signed up
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {r.status === 'CONVERTED' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkPaid(r.id)}
                        disabled={paying === r.id}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      >
                        <BadgeEuro className="w-3 h-3 mr-1" />
                        {paying === r.id ? 'Saving...' : 'Mark paid'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      </div>
    </div>
  )
}
