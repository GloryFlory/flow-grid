// Showcase layout — completely standalone, no app Providers/nav/cookie banner.
// Space Grotesk from root layout is inherited via CSS variables.
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FlowGrid — Interactive Event Schedules',
  description:
    'FlowGrid replaces static PDFs with a live, interactive schedule experience. Built for festivals, retreats, conferences, and every event in between.',
  openGraph: {
    title: 'FlowGrid — Interactive Event Schedules',
    description:
      'The schedule your attendees will actually open. Modern, mobile-first, and always up to date.',
    url: 'https://tryflowgrid.com/showcase',
    siteName: 'FlowGrid',
  },
}

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    // Thin wrapper — applies the Space Grotesk font and a dark base background.
    <div
      className="bg-[#080A0F] text-white"
      style={{ fontFamily: 'var(--font-space-grotesk), system-ui, sans-serif' }}
    >
      {children}
    </div>
  )
}
