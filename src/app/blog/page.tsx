import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Footer from '@/components/Footer'
import type { Metadata } from 'next'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Festival & Event Planning Blog - Flow Grid',
  description: 'Expert guides on festival scheduling, retreat planning, event management, and creating beautiful schedules. Tips, templates, and best practices.',
  openGraph: {
    title: 'Festival & Event Planning Blog - Flow Grid',
    description: 'Expert guides on festival scheduling, retreat planning, and event management.',
  },
}

const blogPosts = [
  {
    slug: 'how-to-create-yoga-retreat-schedule',
    title: 'How to Create the Perfect Yoga Retreat Schedule',
    excerpt: 'A comprehensive guide to planning yoga retreat schedules that balance practice, rest, and community time. Includes templates and best practices.',
    date: '2025-11-08',
    readTime: '8 min read',
    category: 'Retreat Planning',
  },
  {
    slug: 'festival-schedule-template-guide',
    title: 'The Ultimate Festival Schedule Template Guide',
    excerpt: 'Everything you need to know about creating professional festival schedules. From multi-stage events to single-day workshops.',
    date: '2025-11-07',
    readTime: '10 min read',
    category: 'Festival Planning',
  },
  {
    slug: 'spreadsheet-vs-scheduling-software',
    title: 'Spreadsheets vs Scheduling Software: What\'s Best for Your Event?',
    excerpt: 'A detailed comparison of managing event schedules in spreadsheets versus dedicated scheduling software. Real-world examples included.',
    date: '2025-11-06',
    readTime: '7 min read',
    category: 'Event Management',
  },
  {
    slug: 'event-planning-checklist',
    title: 'The Complete Event Planning Checklist for 2025',
    excerpt: 'Don\'t miss a detail! Our comprehensive event planning checklist covers everything from initial planning to post-event follow-up.',
    date: '2025-11-05',
    readTime: '6 min read',
    category: 'Event Planning',
  },
  {
    slug: 'multi-day-festival-scheduling-tips',
    title: '7 Essential Tips for Multi-Day Festival Scheduling',
    excerpt: 'Learn how to manage complex multi-day festivals with overlapping sessions, multiple venues, and hundreds of attendees.',
    date: '2025-11-04',
    readTime: '9 min read',
    category: 'Festival Planning',
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="/flow-grid-logo.png" 
                  alt="Flow Grid Logo" 
                  className="h-10 w-auto"
                />
                <span className="ml-3 text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                  Flow Grid
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signin">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#2a468b] to-[#466d60] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Festival & Event Planning Blog
          </h1>
          <p className="text-xl text-white/90">
            Expert guides, templates, and best practices for creating amazing events
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {post.category}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
