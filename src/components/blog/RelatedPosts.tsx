import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface RelatedPost {
  slug: string
  title: string
  excerpt: string
  category: string
}

interface RelatedPostsProps {
  posts: RelatedPost[]
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-8 my-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h3>
      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post) => (
          <Link 
            key={post.slug} 
            href={`/blog/${post.slug}`}
            className="bg-white rounded-lg p-5 hover:shadow-lg transition-shadow group"
          >
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
              {post.category}
            </span>
            <h4 className="text-lg font-bold text-gray-900 mt-2 mb-2 group-hover:text-blue-600 transition-colors">
              {post.title}
            </h4>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="flex items-center text-blue-600 text-sm font-medium">
              Read more <ArrowRight className="h-4 w-4 ml-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
