import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  name: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

// JSON-LD schema for breadcrumbs
export function getBreadcrumbSchema(items: BreadcrumbItem[], baseUrl: string = 'https://tryflowgrid.com') {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      ...items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        ...(item.href ? { item: `${baseUrl}${item.href}` } : {}),
      })),
    ],
  }
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
        <li>
          <Link 
            href="/" 
            className="hover:text-gray-700 flex items-center gap-1"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-gray-300" aria-hidden="true" />
            {item.href ? (
              <Link 
                href={item.href}
                className="hover:text-gray-700 hover:underline"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
