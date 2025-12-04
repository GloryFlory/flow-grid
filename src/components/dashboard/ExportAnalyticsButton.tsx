'use client'

import { useState } from 'react'
import { Download, Loader2, Crown } from 'lucide-react'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import Link from 'next/link'

interface ExportAnalyticsButtonProps {
  festivalId?: string
  festivalName?: string
}

export function ExportAnalyticsButton({ festivalId, festivalName }: ExportAnalyticsButtonProps) {
  const [isExporting, setIsExporting] = useState(false)
  const { limits, isLoading: limitsLoading } = usePlanLimits()
  const isPro = limits?.currentPlan && ['PRO', 'ENTERPRISE', 'EVENT_PASS'].includes(limits.currentPlan)

  const handleExport = async () => {
    if (!isPro) return
    
    setIsExporting(true)
    try {
      const url = festivalId 
        ? `/api/analytics/export?festivalId=${festivalId}`
        : '/api/analytics/export'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      const filename = festivalName 
        ? `flowgrid-${festivalName.toLowerCase().replace(/\s+/g, '-')}-analytics-${new Date().toISOString().split('T')[0]}.csv`
        : `flowgrid-analytics-${new Date().toISOString().split('T')[0]}.csv`
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export analytics. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  if (limitsLoading) {
    return (
      <button
        disabled
        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-400 cursor-not-allowed"
      >
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </button>
    )
  }

  if (!isPro) {
    return (
      <Link
        href="/pricing"
        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg text-sm font-medium text-amber-700 hover:from-amber-100 hover:to-yellow-100 transition-colors"
      >
        <Crown className="w-4 h-4" />
        Export CSV
        <span className="text-xs bg-amber-200 px-1.5 py-0.5 rounded">Pro</span>
      </Link>
    )
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="w-4 h-4" />
          Export CSV
        </>
      )}
    </button>
  )
}
