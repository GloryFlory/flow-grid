import './globals.css';
import { Providers } from '@/components/providers';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Flow Grid - Festival & Event Schedule Maker | Create Beautiful Schedules in Minutes',
  description: 'Professional festival scheduling software for retreats, workshops & events. Create beautiful schedules, manage sessions, track attendance. Free to start. Perfect for yoga retreats, music festivals & conferences.',
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
    icon: '/flow-grid-logo.png',
    apple: '/flow-grid-logo.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/flow-grid-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/flow-grid-logo.png" />
        
        {/* Amplitude Analytics */}
        <script 
          src="https://cdn.eu.amplitude.com/script/46325823b94e297568aa8e2ee0361dd7.js"
          async
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.amplitude = window.amplitude || { _q: [], _iq: {} };
              window.amplitude.add = window.amplitude.add || function(plugin) {
                window.amplitude._q = window.amplitude._q || [];
                window.amplitude._q.push(['add', plugin]);
              };
              if (typeof window !== 'undefined') {
                window.addEventListener('load', function() {
                  if (window.amplitude && window.amplitude.init && window.sessionReplay) {
                    window.amplitude.add(window.sessionReplay.plugin({sampleRate: 1}));
                    window.amplitude.init('46325823b94e297568aa8e2ee0361dd7', {
                      fetchRemoteConfig: true,
                      serverZone: 'EU',
                      autocapture: true
                    });
                  }
                });
              }
            `,
          }}
        />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}