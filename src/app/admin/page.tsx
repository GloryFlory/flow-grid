import { CreditCard, Mail } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-gray-900">Admin</h1>

        <div className="grid gap-4">
          <Link
            href="/admin/payments"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <CreditCard className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Payment Verification</span>
          </Link>
          <Link
            href="/admin/health-emails"
            className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <Mail className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Health Emails</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
