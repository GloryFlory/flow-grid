'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'

interface PaymentRequest {
  id: string
  userEmail: string
  userName: string | null
  plan: string
  billingCycle: string
  amount: string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FLAGGED'
  userUpgradedAt: string
  transactionRef: string | null
  adminNotes: string | null
  flagReason: string | null
}

export default function PaymentVerificationPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'FLAGGED'>('PENDING')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  useEffect(() => {
    fetchPayments()
  }, [filter])

  const fetchPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/payments?status=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/payments/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'VERIFY' })
      })

      if (response.ok) {
        fetchPayments() // Refresh list
      }
    } catch (error) {
      console.error('Failed to verify payment:', error)
    }
  }

  const handleFlag = async (id: string) => {
    const reason = prompt('Why are you flagging this payment?')
    if (!reason) return

    try {
      const response = await fetch(`/api/admin/payments/${id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'FLAG', notes: reason })
      })

      if (response.ok) {
        fetchPayments()
      }
    } catch (error) {
      console.error('Failed to flag payment:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Payment Verification</h1>
          <p className="text-slate-600 mt-2">Verify Revolut payments from users</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'ALL' ? 'default' : 'outline'}
            onClick={() => setFilter('ALL')}
          >
            All ({payments.length})
          </Button>
          <Button
            variant={filter === 'PENDING' ? 'default' : 'outline'}
            onClick={() => setFilter('PENDING')}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            Pending
          </Button>
          <Button
            variant={filter === 'VERIFIED' ? 'default' : 'outline'}
            onClick={() => setFilter('VERIFIED')}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Verified
          </Button>
          <Button
            variant={filter === 'FLAGGED' ? 'default' : 'outline'}
            onClick={() => setFilter('FLAGGED')}
            className="gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Flagged
          </Button>
        </div>

        {/* Payments table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {payment.userName || 'Unknown'}
                        </div>
                        <div className="text-sm text-slate-500">{payment.userEmail}</div>
                        {payment.transactionRef && (
                          <div className="text-xs text-slate-400">Ref: {payment.transactionRef}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{payment.plan}</div>
                      <div className="text-sm text-slate-500">{payment.billingCycle}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      €{payment.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(payment.userUpgradedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.verificationStatus === 'PENDING' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                      {payment.verificationStatus === 'VERIFIED' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                      {payment.verificationStatus === 'FLAGGED' && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Flagged
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {payment.verificationStatus === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleVerify(payment.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Verify
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleFlag(payment.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Flag
                          </Button>
                        </div>
                      )}
                      {payment.flagReason && (
                        <div className="text-xs text-slate-500 mt-1">
                          Reason: {payment.flagReason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
