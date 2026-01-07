import { MetadataRoute } from 'next'

// Blog posts data - keep in sync with blog/page.tsx
const blogPosts = [
  { slug: 'wetravel-flowgrid-perfect-combination', date: '2025-12-27' },
  { slug: 'event-planning-software-guide', date: '2025-12-08' },
  { slug: 'event-scheduling-tool-features', date: '2025-12-08' },
  { slug: 'interactive-schedule-builder', date: '2025-12-08' },
  { slug: 'waitlist-automation-maximizes-attendance', date: '2024-12-04' },
  { slug: 'export-master-event-analytics', date: '2024-12-04' },
  { slug: 'many-ways-to-use-flow-grid', date: '2024-12-04' },
  { slug: 'event-app-community-building', date: '2025-11-29' },
  { slug: 'hidden-costs-manual-event-scheduling', date: '2025-11-29' },
  { slug: 'wellness-retreat-scheduling', date: '2025-11-29' },
  { slug: 'get-festival-live-10-minutes', date: '2025-11-14' },
  { slug: 'qr-code-event-schedules', date: '2025-11-12' },
  { slug: 'volunteer-scheduling-best-practices', date: '2025-11-12' },
  { slug: 'real-time-schedule-updates', date: '2025-11-12' },
  { slug: 'how-to-create-yoga-retreat-schedule', date: '2025-11-08' },
  { slug: 'festival-schedule-template-guide', date: '2025-11-07' },
  { slug: 'spreadsheet-vs-scheduling-software', date: '2025-11-06' },
  { slug: 'event-planning-checklist', date: '2025-11-05' },
  { slug: 'multi-day-festival-scheduling-tips', date: '2025-11-04' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tryflowgrid.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/flow-grid-demo/schedule`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/glossary`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Generate blog post URLs dynamically
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...blogPages]
}
