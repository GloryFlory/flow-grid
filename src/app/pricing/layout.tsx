import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — Free',
  description: 'Flow Grid is free for event organisers — every feature included, no paid tiers. The project is supported by donations.',
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
