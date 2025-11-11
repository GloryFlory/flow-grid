import './globals.css';
import { Providers } from '@/components/providers';
import { AmplitudeScript } from '@/components/AmplitudeScript';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flow Grid - Festival Schedule Maker | Free Event Planning Software',
  description: 'Create beautiful festival schedules in minutes. Manage sessions, bookings & attendees for retreats, workshops & events. Free to start, easy to use.',
  keywords: [
    'festival schedule maker',
    'event scheduling software',
    'retreat planner',
    'workshop schedule creator',
    'yoga retreat scheduler',
    'music festival planner',
    'conference schedule builder',
    'event management tool',
    'session booking system',
    'festival timetable creator'
  ],
  authors: [{ name: 'Flow Grid' }],
  creator: 'Flow Grid',
  publisher: 'Flow Grid',
  metadataBase: new URL('https://tryflowgrid.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Flow Grid - Create Beautiful Festival Schedules in Minutes',
    description: 'Professional event scheduling for festivals, retreats & workshops. Manage sessions, bookings & attendees with ease. Free to start.',
    url: 'https://tryflowgrid.com',
    siteName: 'Flow Grid',
    images: [
      {
        url: '/og-image.png', // We'll need to create this
        width: 1200,
        height: 630,
        alt: 'Flow Grid - Festival Scheduling Made Simple',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Flow Grid - Festival Schedule Maker',
    description: 'Create beautiful event schedules in minutes. Perfect for festivals, retreats & workshops.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/flow-grid-logo.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/flow-grid-logo.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.json',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Flow Grid',
  applicationCategory: 'BusinessApplication',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    ratingCount: '1'
  },
  description: 'Professional festival and event scheduling software. Create beautiful schedules for retreats, workshops, festivals and conferences.',
  operatingSystem: 'Web Browser',
  url: 'https://tryflowgrid.com',
  screenshot: 'https://tryflowgrid.com/og-image.png',
  featureList: [
    'Festival Schedule Creation',
    'Session Management',
    'Teacher/Speaker Profiles',
    'Booking System',
    'Custom Branding',
    'Analytics Dashboard',
    'Multi-Festival Support',
    'Public Schedule Pages'
  ],
  author: {
    '@type': 'Organization',
    name: 'Flow Grid',
    url: 'https://tryflowgrid.com'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/flow-grid-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/flow-grid-logo.png" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <AmplitudeScript />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}