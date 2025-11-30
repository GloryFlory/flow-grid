import Link from 'next/link'

interface PoweredByFlowGridProps {
  className?: string
}

/**
 * "Powered by Flow Grid" footer for public schedules.
 * Shows on Free tier, hidden on Pro+ (whiteLabel: true).
 * 
 * Usage:
 * - Pass showPoweredBy={!festival.user.subscription?.whiteLabel} from parent
 * - Or check plan in API and pass as prop
 */
export function PoweredByFlowGrid({ className = '' }: PoweredByFlowGridProps) {
  return (
    <div className={`text-center py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      <Link 
        href="https://tryflowgrid.com?ref=powered-by"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gray-500 hover:text-gray-700 transition-colors inline-flex items-center gap-1.5"
      >
        <span>Powered by</span>
        <span className="font-semibold text-gray-700">Flow Grid</span>
        <span className="text-gray-400">·</span>
        <span className="text-blue-600 hover:text-blue-700">Create your schedule</span>
      </Link>
    </div>
  )
}
