import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "What's New",
  description: 'Stay updated with the latest Flow Grid features, improvements, and bug fixes. See what\'s new in event scheduling, team collaboration, and more.',
}

export default function UpdatesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
