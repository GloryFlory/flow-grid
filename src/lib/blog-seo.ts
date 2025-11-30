import { Metadata } from 'next'

export interface BlogArticleConfig {
  slug: string
  title: string
  description: string
  keywords: string[]
  publishedDate: string
  modifiedDate?: string
  author?: string
  category: string
  readTime: string
  ogImage?: string
}

/**
 * Generate complete metadata for a blog article
 * Use this in each blog article page.tsx
 */
export function generateBlogMetadata(config: BlogArticleConfig): Metadata {
  const baseUrl = 'https://tryflowgrid.com'
  const canonicalUrl = `${baseUrl}/blog/${config.slug}`
  const ogImage = config.ogImage || '/og/blog-default.png'

  return {
    title: `${config.title} | Flow Grid`,
    description: config.description,
    keywords: config.keywords,
    authors: [{ name: config.author || 'Flow Grid Team' }],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: config.title,
      description: config.description,
      type: 'article',
      publishedTime: new Date(config.publishedDate).toISOString(),
      modifiedTime: config.modifiedDate 
        ? new Date(config.modifiedDate).toISOString() 
        : new Date(config.publishedDate).toISOString(),
      authors: [config.author || 'Flow Grid Team'],
      section: config.category,
      tags: config.keywords,
      url: canonicalUrl,
      siteName: 'Flow Grid',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: config.title,
        },
      ],
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: config.title,
      description: config.description,
      images: [ogImage],
    },
    other: {
      'article:published_time': new Date(config.publishedDate).toISOString(),
      'article:modified_time': config.modifiedDate 
        ? new Date(config.modifiedDate).toISOString() 
        : new Date(config.publishedDate).toISOString(),
      'article:section': config.category,
      'article:tag': config.keywords.join(', '),
    },
  }
}

/**
 * Generate BlogPosting JSON-LD schema
 */
export function generateBlogSchema(config: BlogArticleConfig) {
  const baseUrl = 'https://tryflowgrid.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: config.title,
    description: config.description,
    datePublished: new Date(config.publishedDate).toISOString(),
    dateModified: config.modifiedDate 
      ? new Date(config.modifiedDate).toISOString() 
      : new Date(config.publishedDate).toISOString(),
    author: {
      '@type': 'Person',
      name: config.author || 'Florian Hohenleitner',
      url: 'https://florianhohenleitner.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Flow Grid',
      url: baseUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/flow-grid-logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/blog/${config.slug}`,
    },
    image: config.ogImage || `${baseUrl}/og/blog-default.png`,
    keywords: config.keywords.join(', '),
    articleSection: config.category,
    wordCount: parseInt(config.readTime) * 200, // Rough estimate: 200 words per minute
  }
}

/**
 * Generate FAQ schema for featured snippets
 */
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/**
 * Generate HowTo schema for tutorial articles
 */
export function generateHowToSchema(config: {
  name: string
  description: string
  totalTime?: string
  steps: { name: string; text: string }[]
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: config.name,
    description: config.description,
    ...(config.totalTime ? { totalTime: config.totalTime } : {}),
    step: config.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }
}
