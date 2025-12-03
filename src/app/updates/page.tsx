'use client'

import { ArrowLeft, Sparkles, Zap, Bug, Wrench } from 'lucide-react'
import Link from 'next/link'

type UpdateType = 'feature' | 'improvement' | 'fix' | 'maintenance'

interface Update {
  date: string
  version?: string
  type: UpdateType
  title: string
  description: string
  details?: string[]
}

const updates: Update[] = [
  {
    date: '2025-12-03',
    type: 'improvement',
    title: 'Better URL Slug Validation',
    description: 'The event URL field now automatically converts uppercase letters to lowercase and shows instant feedback when invalid characters are entered.',
    details: [
      'Auto-lowercase and clean URL slugs',
      'Orange highlight when invalid characters are typed',
      'Helpful hint message appears instantly',
    ]
  },
  {
    date: '2025-12-03',
    type: 'fix',
    title: 'Improved Error Messages',
    description: 'When something goes wrong during event creation, you now see clear, specific error messages instead of generic ones.',
    details: [
      'Shows exactly which field has an issue',
      'Provides actionable guidance to fix problems',
    ]
  },
  {
    date: '2025-12-02',
    type: 'feature',
    title: 'Event Insights Dashboard',
    description: 'New analytics dashboard for event organizers with detailed metrics about attendee engagement.',
    details: [
      'Unique visitor tracking',
      'View mode preferences (Grid vs List vs Timeline)',
      'Top sessions by views',
      'Device breakdown (Mobile vs Desktop)',
      'Peak viewing hours',
    ]
  },
  {
    date: '2025-12-02',
    type: 'improvement',
    title: 'Analytics Performance Boost',
    description: 'Analytics pages now load up to 10x faster thanks to optimized database queries.',
  },
  {
    date: '2025-11-30',
    type: 'feature',
    title: 'Google Sheets Integration',
    description: 'Import your session schedule directly from Google Sheets. Just paste a link and we\'ll sync your data.',
    details: [
      'One-click import from Google Sheets',
      'Automatic column mapping',
      'Real-time preview before import',
    ]
  },
  {
    date: '2025-11-28',
    type: 'feature',
    title: 'Presenter Label Customization',
    description: 'Choose how to label your presenters: Teachers, Instructors, Speakers, or create your own custom label.',
  },
  {
    date: '2025-11-25',
    type: 'feature',
    title: 'Multiple View Modes',
    description: 'Attendees can now switch between Grid, List, and Timeline views to find the layout that works best for them.',
    details: [
      'Grid view for visual overview',
      'List view for compact reading',
      'Timeline view for chronological planning',
    ]
  },
  {
    date: '2025-11-20',
    type: 'feature',
    title: 'Session Favorites',
    description: 'Attendees can now save their favorite sessions and filter to see only what they\'ve saved.',
  },
  {
    date: '2025-11-15',
    type: 'feature',
    title: 'Multi-Week Festival Support',
    description: 'Create festivals that span multiple weeks with sessions properly assigned to the correct dates.',
  },
]

const typeConfig: Record<UpdateType, { icon: typeof Sparkles, color: string, label: string }> = {
  feature: { icon: Sparkles, color: 'text-purple-600 bg-purple-100', label: 'New Feature' },
  improvement: { icon: Zap, color: 'text-blue-600 bg-blue-100', label: 'Improvement' },
  fix: { icon: Bug, color: 'text-orange-600 bg-orange-100', label: 'Bug Fix' },
  maintenance: { icon: Wrench, color: 'text-gray-600 bg-gray-100', label: 'Maintenance' },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

export default function UpdatesPage() {
  // Group updates by month
  const groupedUpdates = updates.reduce((acc, update) => {
    const date = new Date(update.date)
    const monthKey = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    if (!acc[monthKey]) {
      acc[monthKey] = []
    }
    acc[monthKey].push(update)
    return acc
  }, {} as Record<string, Update[]>)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Flow Grid</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">What's New</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We're constantly improving Flow Grid. Here's what we've been working on.
          </p>
        </div>

        {/* Updates Timeline */}
        <div className="space-y-12">
          {Object.entries(groupedUpdates).map(([month, monthUpdates]) => (
            <div key={month}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6">
                {month}
              </h2>
              <div className="space-y-6">
                {monthUpdates.map((update, index) => {
                  const config = typeConfig[update.type]
                  const Icon = config.icon
                  
                  return (
                    <div 
                      key={`${update.date}-${index}`}
                      className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-lg ${config.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.color}`}>
                              {config.label}
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(update.date)}
                            </span>
                            {update.version && (
                              <span className="text-xs text-gray-400 font-mono">
                                v{update.version}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {update.title}
                          </h3>
                          <p className="text-gray-600 mb-3">
                            {update.description}
                          </p>
                          {update.details && (
                            <ul className="space-y-1">
                              {update.details.map((detail, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Subscribe CTA */}
        <div className="mt-16 text-center p-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Want to stay updated?
          </h3>
          <p className="text-gray-600 mb-4">
            Follow us on social media or check back here regularly for the latest updates.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/"
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Flow Grid
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 text-center text-sm text-gray-500">
        <p>© 2025 Flow Grid. All rights reserved.</p>
      </footer>
    </div>
  )
}
