import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Flow Grid - Beautiful Festival Schedules in Minutes',
  description: 'Create stunning, interactive festival schedules with booking capabilities. Perfect for yoga festivals, workshops, conferences, and events.',
  keywords: ['festival schedule', 'event management', 'workshop booking', 'yoga festival', 'conference schedule'],
  openGraph: {
    title: 'Flow Grid - Beautiful Festival Schedules',
    description: 'Transform your festival into an amazing digital experience with Flow Grid.',
    url: 'https://flowgrid.com',
    siteName: 'Flow Grid',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flow Grid - Beautiful Festival Schedules',
    description: 'Create stunning festival schedules in minutes.',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {children}
        </div>
      </body>
    </html>
  )
}