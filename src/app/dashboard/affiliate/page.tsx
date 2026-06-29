'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Copy, Check, Users, TrendingUp, Clock, BadgeEuro } from 'lucide-react'

type ReferralStatus = 'SIGNED_UP' | 'CONVERTED' | 'PAID'

interface Referral {
  id: string
  referredEmail: string | null
  conversionType: string | null
  payoutAmount: string | null
  status: ReferralStatus
  signedUpAt: string | null
  convertedAt: string | null
  paidAt: string | null
}

interface Stats {
  totalReferrals: number
  conversions: number
  pendingPayout: number
  totalEarned: number
}

interface AffiliateData {
  affiliateCode: string | null
  referrals: Referral[]
  stats: Stats
}

const statusLabel: Record<ReferralStatus, { label: string; className: string }> = {
  SIGNED_UP: { label: 'Signed up', className: 'bg-blue-100 text-blue-700' },
  CONVERTED: { label: 'Payout pending', className: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Paid out', className: 'bg-green-100 text-green-700' },
}

export default function AffiliatePage() {
  const { data: session } = useSession()
  const [data, setData] = useState<AffiliateData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch('/api/affiliate/stats')
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const affiliateLink = data?.affiliateCode
    ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://tryflowgrid.com'}/?ref=${data.affiliateCode}`
    : null

  const copyLink = () => {
    if (!affiliateLink) return
    navigator.clipboard.writeText(affiliateLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Affiliate Programme</h1>
        <p className="mt-1 text-gray-500">
          Share your link and earn <span className="font-medium text-gray-700">€25</span> per Pro signup
          or <span className="font-medium text-gray-700">€50</span> per Event Pass — paid out manually once confirmed.
        </p>
      </div>

      {/* Your affiliate link */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Your referral link</h2>
        {affiliateLink ? (
          <div className="flex items-center gap-3">
            <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-800 truncate">
              {affiliateLink}
            </code>
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Your affiliate code is being generated — try refreshing.</p>
        )}
        <p className="mt-3 text-xs text-gray-400">
          Your code: <span className="font-mono font-semibold">{data?.affiliateCode ?? '—'}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users className="w-5 h-5 text-blue-500" />} label="Referrals" value={data?.stats.totalReferrals ?? 0} />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-green-500" />} label="Conversions" value={data?.stats.conversions ?? 0} />
        <StatCard icon={<Clock className="w-5 h-5 text-amber-500" />} label="Pending payout" value={`€${data?.stats.pendingPayout ?? 0}`} />
        <StatCard icon={<BadgeEuro className="w-5 h-5 text-emerald-500" />} label="Total earned" value={`€${data?.stats.totalEarned ?? 0}`} />
      </div>

      {/* Referral table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Referral history</h2>
        </div>
        {!data?.referrals.length ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">
            No referrals yet. Share your link to get started!
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Plan</th>
                <th className="px-6 py-3">Payout</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.referrals.map((r) => {
                const badge = statusLabel[r.status]
                const date = r.paidAt ?? r.convertedAt ?? r.signedUpAt
                return (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-700">{r.referredEmail ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-500">{r.conversionType ?? '—'}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {r.payoutAmount ? `€${Number(r.payoutAmount).toFixed(0)}` : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {date ? new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        Payouts are processed manually — you'll hear from us via email once confirmed.
        Questions? <a href="mailto:hello@tryflowgrid.com" className="underline">hello@tryflowgrid.com</a>
      </p>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
      {icon}
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
