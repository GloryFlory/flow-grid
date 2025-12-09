import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | Flow Grid Event Scheduling Software',
  description: 'Simple, transparent pricing for event organizers. Start free, upgrade when you need advanced features like team collaboration, waitlists, and analytics.',
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
