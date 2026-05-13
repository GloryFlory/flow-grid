import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'

export default function UnsubscribedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 max-w-sm w-full text-center">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">You've been unsubscribed</h1>
        <p className="text-gray-600 text-sm mb-6">
          You won't receive any more emails from this event. If this was a mistake, you can sign
          up again from the event page.
        </p>
        <Link
          href="/"
          className="text-sm text-blue-600 hover:underline"
        >
          Back to Flow Grid
        </Link>
      </div>
    </div>
  )
}
