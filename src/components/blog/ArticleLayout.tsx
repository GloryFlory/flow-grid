import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Calendar } from 'lucide-react'
import RelatedPosts from '@/components/blog/RelatedPosts'
import AuthorBio from '@/components/blog/AuthorBio'

type RelatedPost = {
  slug: string
  title: string
  excerpt: string
  category: string
}

type ArticleLayoutProps = {
  title: string
  description?: string
  category?: string
  date?: string
  readTime?: string
  jsonLd?: Record<string, unknown>
  children: React.ReactNode
  relatedPosts?: RelatedPost[]
  showNav?: boolean
}

export default function ArticleLayout({
  title,
  description,
  category,
  date,
  readTime,
  jsonLd,
  children,
  relatedPosts,
  showNav = true,
}: ArticleLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {jsonLd ? (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      ) : null}

      {showNav && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center">
                <Link href="/" className="flex items-center">
                  <Image src="/flow-grid-logo.png" alt="Flow Grid Logo" width={160} height={40} className="h-10 w-auto" />
                  <span className="ml-3 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">Flow Grid</span>
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                <Link href="/auth/signin" className="inline-flex items-center px-3 py-2 rounded-md border border-gray-300 text-sm font-medium hover:bg-gray-50">Sign In</Link>
                <Link href="/auth/signin" className="inline-flex items-center px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">Get Started</Link>
              </div>
            </div>
          </div>
        </nav>
      )}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            {category && (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">{category}</span>
            )}
            {date && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {date}
              </span>
            )}
            {readTime && <span>• {readTime}</span>}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{title}</h1>
          {description && <p className="text-xl text-gray-600">{description}</p>}
        </header>

        <div className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-h2:mt-12 prose-h2:border-b prose-h2:pb-2 prose-h3:mt-8 prose-p:leading-relaxed prose-li:marker:text-blue-600">
          {children}
        </div>

        {relatedPosts && relatedPosts.length > 0 && <RelatedPosts posts={relatedPosts} />}
        <AuthorBio />

        <div className="mt-12 pt-8 border-t">
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all articles
          </Link>
        </div>
      </article>
    </div>
  )
}
