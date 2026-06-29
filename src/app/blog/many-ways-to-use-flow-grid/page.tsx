import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import AuthorBio from '@/components/blog/AuthorBio'
import RelatedPosts from '@/components/blog/RelatedPosts'
import TableOfContents from '@/components/blog/TableOfContents'
import Footer from '@/components/Footer'
import { ArrowRight, Users, Calendar, Building2, Heart, Music, GraduationCap, Palette, Coffee, Mountain } from 'lucide-react'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const publishDate = '2024-12-07'
const title = 'The Many Ways to Use Flow Grid: From Yoga Festivals to Corporate Retreats'
const description = 'Flow Grid isn\'t just for yoga festivals. Discover how event organizers use this flexible platform for wellness festivals, dance conventions, workshops, corporate retreats, conferences, and more.'
const slug = 'many-ways-to-use-flow-grid'

export const metadata: Metadata = {
  title: `${title} | Flow Grid Blog`,
  description,
  keywords: [
    'event scheduling software',
    'yoga festival planner',
    'retreat management',
    'conference schedule',
    'workshop organizer',
    'dance convention schedule',
    'corporate retreat planner',
    'wellness festival software',
    'multi-track event management',
    'flexible scheduling platform'
  ],
  authors: [{ name: 'Florian Hohenleitner' }],
  openGraph: {
    title,
    description,
    type: 'article',
    publishedTime: publishDate,
    authors: ['Florian Hohenleitner'],
    tags: ['Event Types', 'Use Cases', 'Versatility'],
  },
  alternates: {
    canonical: `/blog/${slug}`,
  },
}

const sections = [
  { id: 'beyond-yoga', title: 'Beyond Yoga Festivals' },
  { id: 'wellness-events', title: 'Wellness & Mindfulness Events' },
  { id: 'creative-arts', title: 'Creative Arts & Performance' },
  { id: 'corporate-professional', title: 'Corporate & Professional' },
  { id: 'community-education', title: 'Community & Education' },
  { id: 'hybrid-special', title: 'Hybrid & Special Formats' },
  { id: 'core-features', title: 'Core Features That Work Everywhere' },
  { id: 'getting-started', title: 'Getting Started' },
]

const relatedPosts = [
  {
    slug: 'wellness-retreat-scheduling',
    title: 'Wellness Retreat Scheduling Made Simple: A Complete Guide',
    excerpt: 'Everything you need to know about organizing transformative wellness retreats.',
    category: 'Event Management'
  },
  {
    slug: 'earn-money-referring-event-organisers-flow-grid',
    title: 'Earn Money Referring Event Organisers to Flow Grid',
    excerpt: 'Know other event organisers? Flow Grid\'s affiliate programme pays €25–€50 per referral.',
    category: 'Earn Money'
  },
  {
    slug: 'get-festival-live-10-minutes',
    title: 'Get Your Festival Schedule Live in 10 Minutes (Seriously)',
    excerpt: 'The fastest way to publish a professional event schedule.',
    category: 'Getting Started'
  }
]

export default function BlogPost() {
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

      <article className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 text-white py-20">
          <div className="max-w-4xl mx-auto px-6">
            <Breadcrumbs 
              items={[
                { name: 'Blog', href: '/blog' },
                { name: 'Getting Started', href: '/blog?category=getting-started' },
                { name: title }
              ]} 
            />
            
            <div className="mt-8 mb-6">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                Getting Started
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
              {title}
            </h1>
            
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              {description}
            </p>
            
            <div className="flex items-center gap-6 text-sm text-white/80">
              <time dateTime={publishDate}>{formatDate(publishDate)}</time>
              <span>•</span>
              <span>10 min read</span>
              <span>•</span>
              <span>Getting Started</span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
            {/* Table of Contents - Desktop */}
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-8">
                <TableOfContents items={sections} />
              </div>
            </aside>

            {/* Article Content */}
            <div className="lg:col-span-4">
              {/* Hero Grid of Icons */}
              <div className="grid grid-cols-4 gap-4 mb-12 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Mountain className="w-8 h-8 text-green-600" />
                  <span className="text-xs font-medium text-gray-700">Retreats</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Music className="w-8 h-8 text-purple-600" />
                  <span className="text-xs font-medium text-gray-700">Festivals</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">Corporate</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <GraduationCap className="w-8 h-8 text-orange-600" />
                  <span className="text-xs font-medium text-gray-700">Education</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Heart className="w-8 h-8 text-pink-600" />
                  <span className="text-xs font-medium text-gray-700">Wellness</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Palette className="w-8 h-8 text-yellow-600" />
                  <span className="text-xs font-medium text-gray-700">Creative</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Coffee className="w-8 h-8 text-brown-600" />
                  <span className="text-xs font-medium text-gray-700">Workshops</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-center">
                  <Users className="w-8 h-8 text-indigo-600" />
                  <span className="text-xs font-medium text-gray-700">Community</span>
                </div>
              </div>

              <section id="beyond-yoga" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Beyond Yoga Festivals</h2>
                
                <p className="text-lg leading-relaxed text-gray-700">
                  When people first discover Flow Grid, they often see our yoga festival examples and think, 
                  "This looks perfect... but I don't run a yoga festival." Here's the thing: Flow Grid wasn't 
                  built specifically for yoga events—it was built for <em>any</em> event with multiple sessions, 
                  presenters, and attendees who need a clear, beautiful schedule.
                </p>

                <p className="text-lg leading-relaxed text-gray-700">
                  The core challenge is universal: How do you help attendees navigate a complex, multi-day, 
                  multi-track event without overwhelming them? Whether you're running a dance convention, 
                  a tech conference, a meditation retreat, or a corporate training weekend, the answer is 
                  the same: clear structure, flexible filtering, and attendee empowerment.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8 rounded-r-lg">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">What Makes Flow Grid Universal?</h3>
                  <p className="text-gray-700">
                    At its core, every event has the same building blocks: <strong>sessions</strong> (workshops, 
                    talks, classes), <strong>presenters</strong> (teachers, speakers, facilitators), 
                    <strong>times & locations</strong>, and <strong>attendees</strong> trying to build their 
                    ideal experience. Flow Grid organizes these elements in a way that works regardless of 
                    your event's theme or industry.
                  </p>
                </div>
              </section>

              <section id="wellness-events" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Heart className="w-8 h-8 text-pink-600" />
                  Wellness & Mindfulness Events
                </h2>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white p-6 rounded-xl border-2 border-pink-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🧘 Yoga Festivals</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Multi-day events with dozens of yoga styles, meditation sessions, and workshops.
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Key features used:</strong> Session filtering by style/level, teacher profiles, 
                      capacity management for popular classes, favorites for building personal schedules.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🌿 Wellness Retreats</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Week-long programs combining mindfulness, nutrition, movement, and personal development.
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Key features used:</strong> Multi-week calendar views, repeating session templates, 
                      different tracks for different participant groups, meal and activity integration.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🧠 Meditation Gatherings</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Silent retreats, vipassana courses, mindfulness intensives with structured practice schedules.
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Key features used:</strong> Simple, distraction-free interface, timezone support 
                      for international attendees, calendar export for personal tracking.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">💆 Holistic Health Expos</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Day-long events with talks, demos, and practitioner sessions on various healing modalities.
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Key features used:</strong> Category filtering (reiki, acupuncture, nutrition), 
                      booking system for one-on-one sessions, exhibitor/presenter profiles.
                    </p>
                  </div>
                </div>
              </section>

              <section id="creative-arts" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Palette className="w-8 h-8 text-yellow-600" />
                  Creative Arts & Performance
                </h2>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-xl font-semibold text-purple-900 mb-3">🎭 Dance Conventions & Competitions</h3>
                    <p className="text-gray-700 mb-3">
                      Multi-day events with classes across various dance styles, levels, and age groups, plus competitions.
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• <strong>Session organization:</strong> Filter by dance style (ballet, hip-hop, contemporary)</li>
                      <li>• <strong>Level filtering:</strong> Beginner, intermediate, advanced, competitive</li>
                      <li>• <strong>Age group tracking:</strong> Kids, teens, adults</li>
                      <li>• <strong>Competition schedules:</strong> Separate tracks for classes vs performances</li>
                      <li>• <strong>Instructor showcases:</strong> Prominent profiles for visiting choreographers</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                    <h3 className="text-xl font-semibold text-orange-900 mb-3">🎨 Art Workshops & Creative Retreats</h3>
                    <p className="text-gray-700 mb-3">
                      Weekend intensives teaching painting, pottery, photography, writing, and other creative practices.
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• <strong>Medium filtering:</strong> Watercolor, oil, digital, sculpture, etc.</li>
                      <li>• <strong>Skill requirements:</strong> No experience needed vs advanced techniques</li>
                      <li>• <strong>Materials lists:</strong> Add to session descriptions</li>
                      <li>• <strong>Capacity limits:</strong> Studio space constraints</li>
                      <li>• <strong>Portfolio showcasing:</strong> Artist bio pages with photo galleries</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-xl font-semibold text-indigo-900 mb-3">🎵 Music Festivals & Conferences</h3>
                    <p className="text-gray-700 mb-3">
                      Events featuring performances, masterclasses, jam sessions, and industry talks.
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• <strong>Stage/venue management:</strong> Multiple simultaneous performances</li>
                      <li>• <strong>Genre filtering:</strong> Jazz, classical, electronic, world music</li>
                      <li>• <strong>Event types:</strong> Performances vs workshops vs networking</li>
                      <li>• <strong>Artist profiles:</strong> Bio, music samples, social links</li>
                      <li>• <strong>Real-time updates:</strong> Last-minute set time changes</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="corporate-professional" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  Corporate & Professional Events
                </h2>

                <p className="text-lg leading-relaxed text-gray-700 mb-6">
                  Corporate events have unique needs: professional branding, clear ROI tracking, and seamless 
                  attendee experience. Flow Grid serves these requirements while maintaining simplicity.
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white p-6 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Industry Conferences</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Multi-track professional conferences with keynotes, breakouts, networking, and expo halls.
                    </p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        <span><strong>Track management:</strong> Marketing, Sales, Product, Leadership tracks</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        <span><strong>Session types:</strong> Keynote, panel, workshop, networking</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        <span><strong>Speaker credentials:</strong> Detailed bios with company affiliations</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        <span><strong>Capacity planning:</strong> Ballroom A (500), Breakout 1 (50)</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600">✓</span>
                        <span><strong>Analytics:</strong> Session popularity for future planning</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-green-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🏢 Corporate Retreats</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Company offsites, team building events, and strategic planning sessions.
                    </p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Custom branding:</strong> Company colors, logo, fonts</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Department filtering:</strong> Engineering, Design, Sales sessions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Optional vs required:</strong> Tag mandatory all-hands meetings</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Private access:</strong> Password-protected for internal events</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-600">✓</span>
                        <span><strong>Calendar integration:</strong> Export to Google Calendar/Outlook</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-purple-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🎓 Training Programs</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Multi-week certification courses, onboarding programs, and professional development.
                    </p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span><strong>Curriculum paths:</strong> Sequential learning tracks</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span><strong>Prerequisites:</strong> Note required prior sessions</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span><strong>Cohort management:</strong> Different start dates for groups</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span><strong>Instructor details:</strong> Credentials, specialties, contact info</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-purple-600">✓</span>
                        <span><strong>Attendance tracking:</strong> Booking system for mandatory sessions</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-orange-200 hover:shadow-lg transition-shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🤝 Networking Events</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Structured networking, speed networking, industry mixers, and meetup series.
                    </p>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-start gap-2">
                        <span className="text-orange-600">✓</span>
                        <span><strong>Topic-based rooms:</strong> Startups, SaaS, Healthcare, etc.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-orange-600">✓</span>
                        <span><strong>Facilitator profiles:</strong> Who's leading each session</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-orange-600">✓</span>
                        <span><strong>Capacity limits:</strong> Intimate conversation groups</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-orange-600">✓</span>
                        <span><strong>Recurring series:</strong> Monthly meetups with consistent format</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-orange-600">✓</span>
                        <span><strong>Quick booking:</strong> Grab spots in networking rounds</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="community-education" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <GraduationCap className="w-8 h-8 text-orange-600" />
                  Community & Education
                </h2>

                <div className="space-y-6">
                  <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
                    <h3 className="text-xl font-semibold text-green-900 mb-3">🏘️ Community Festivals</h3>
                    <p className="text-gray-700 mb-3">
                      Local cultural celebrations, neighborhood gatherings, farmers markets with programming.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <strong>Use cases:</strong>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>• Multi-stage music lineups</li>
                          <li>• Kids' activity zones with scheduled programs</li>
                          <li>• Food vendor locations and demo times</li>
                          <li>• Local artisan talks and performances</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Why Flow Grid works:</strong>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>• Free tier perfect for community events</li>
                          <li>• QR code posters around venue</li>
                          <li>• Mobile-friendly for families browsing</li>
                          <li>• No technical expertise needed</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
                    <h3 className="text-xl font-semibold text-blue-900 mb-3">📚 Educational Workshops & Summits</h3>
                    <p className="text-gray-700 mb-3">
                      Teacher conferences, homeschool co-ops, academic symposiums, skill-sharing events.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <strong>Use cases:</strong>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>• Subject-based breakout sessions</li>
                          <li>• Grade level or age group filtering</li>
                          <li>• Workshop series with prerequisites</li>
                          <li>• Poster session schedules</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Why Flow Grid works:</strong>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>• Filter by subject area or audience</li>
                          <li>• Presenter CVs and credentials</li>
                          <li>• Capacity management for hands-on sessions</li>
                          <li>• Export to institutional calendars</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500">
                    <h3 className="text-xl font-semibold text-purple-900 mb-3">🎪 Conventions & Fan Events</h3>
                    <p className="text-gray-700 mb-3">
                      Comic cons, gaming conventions, fandom gatherings with panels, cosplay, and screenings.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                      <div>
                        <strong>Use cases:</strong>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>• Celebrity panels and Q&As</li>
                          <li>• Gaming tournaments with stages</li>
                          <li>• Cosplay contests and photo shoots</li>
                          <li>• Vendor hall special events</li>
                        </ul>
                      </div>
                      <div>
                        <strong>Why Flow Grid works:</strong>
                        <ul className="mt-2 space-y-1 text-xs">
                          <li>• Handle huge parallel schedules</li>
                          <li>• Celebrity/guest profiles with photos</li>
                          <li>• Favorites for planning con experience</li>
                          <li>• Real-time updates for schedule changes</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="hybrid-special" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Hybrid & Special Event Formats</h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  Flow Grid adapts to unconventional event structures that don't fit neat categories:
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📅 Multi-Week Programs</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Month-long intensives, seasonal courses, certification programs spanning weeks.
                    </p>
                    <p className="text-xs text-gray-600">
                      The calendar view supports any date range. Add all sessions upfront or update 
                      week-by-week as you go.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🏠 Multi-Room Venues</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Hotels with 10+ conference rooms, retreat centers with multiple studios, university campuses.
                    </p>
                    <p className="text-xs text-gray-600">
                      Use the "room" field to organize by location. Attendees can filter to see what's happening 
                      in specific spaces.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🌍 Hybrid Events</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Some sessions in-person, others virtual, maybe some are both.
                    </p>
                    <p className="text-xs text-gray-600">
                      Add "Virtual" or "Zoom Room 1" as room names. Include video links in session descriptions. 
                      Filter to show only virtual or only in-person sessions.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🎟️ Ticketed vs Free Sessions</h3>
                    <p className="text-sm text-gray-700 mb-3">
                      Some sessions require extra payment, VIP access, or special registration.
                    </p>
                    <p className="text-xs text-gray-600">
                      Use booking system for paid sessions with capacity limits. Note requirements in descriptions. 
                      Create separate filtering categories for access levels.
                    </p>
                  </div>
                </div>
              </section>

              <section id="core-features" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Core Features That Work Everywhere</h2>

                <p className="text-lg leading-relaxed text-gray-700 mb-6">
                  Regardless of your event type, these Flow Grid features provide value:
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Multi-Day & Multi-Room Scheduling</h3>
                      <p className="text-sm text-gray-700">
                        Handle any combination of dates, times, and locations. Parallel sessions, sequential tracks, 
                        or anything in between.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <Users className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Presenter/Speaker Profiles</h3>
                      <p className="text-sm text-gray-700">
                        Beautiful bio pages with photos, descriptions, credentials, and social links. Attendees 
                        can click through to learn about who's presenting.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                      ∞
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Unlimited Filtering & Categories</h3>
                      <p className="text-sm text-gray-700">
                        Create custom categories that make sense for YOUR event. Filter by skill level, topic, 
                        format, age group, department—whatever helps attendees find what they need.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg">
                    <span className="text-2xl flex-shrink-0 mt-1">📱</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Mobile-First Experience</h3>
                      <p className="text-sm text-gray-700">
                        Attendees browse on their phones while at your event. The interface is optimized for 
                        quick scanning, favoriting, and navigating—no app download required.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-lg">
                    <span className="text-2xl flex-shrink-0 mt-1">⚡</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Real-Time Updates</h3>
                      <p className="text-sm text-gray-700">
                        Session time changed? Presenter canceled? Update once, and everyone sees the change 
                        instantly—no reprinting programs or confusing announcements.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <span className="text-2xl flex-shrink-0 mt-1">🎨</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Custom Branding</h3>
                      <p className="text-sm text-gray-700">
                        Your logo, your colors, your fonts, your domain. The schedule looks like part of YOUR 
                        event, not a generic scheduling tool.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg">
                    <span className="text-2xl flex-shrink-0 mt-1">📊</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Analytics & Insights</h3>
                      <p className="text-sm text-gray-700">
                        See which sessions get the most interest, when attendees are most active, and what 
                        content resonates. Use this data to improve future events.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg">
                    <span className="text-2xl flex-shrink-0 mt-1">🔗</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Easy Integration</h3>
                      <p className="text-sm text-gray-700">
                        Import from Google Sheets, export to CSV, generate calendar files, create QR code 
                        posters, embed on your website—Flow Grid plays nice with your existing workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section id="getting-started" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started with Your Event Type</h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  The best way to see if Flow Grid works for your event? Try it. Here's how to get started:
                </p>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8 rounded-2xl my-8">
                  <h3 className="text-2xl font-bold mb-6">Your Quick Start Plan</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <div>
                        <strong className="text-white">Sign up free</strong>
                        <p className="text-blue-100 text-sm mt-1">
                          No credit card required. Start with 5 events included during Early Access.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <div>
                        <strong className="text-white">Create your first event</strong>
                        <p className="text-blue-100 text-sm mt-1">
                          Give it a name, add your dates, and set your timezone. Takes 30 seconds.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <div>
                        <strong className="text-white">Add a few test sessions</strong>
                        <p className="text-blue-100 text-sm mt-1">
                          Just 3-5 sessions to see how it looks. Include times, rooms, and presenters.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                      <div>
                        <strong className="text-white">Customize the categories</strong>
                        <p className="text-blue-100 text-sm mt-1">
                          Create filter categories that match YOUR event (skill level, topic, track, etc.)
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">5</div>
                      <div>
                        <strong className="text-white">Preview as an attendee</strong>
                        <p className="text-blue-100 text-sm mt-1">
                          Open the public schedule link on your phone. Does it make sense? Is it easy to navigate?
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">6</div>
                      <div>
                        <strong className="text-white">Import your full schedule</strong>
                        <p className="text-blue-100 text-sm mt-1">
                          Use Google Sheets import or CSV upload to add all sessions at once. Or add them 
                          manually—your choice.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-8 rounded-2xl border-2 border-green-300 my-12">
                  <h3 className="text-2xl font-bold text-green-900 mb-4">Ready to Create Your Event Schedule?</h3>
                  <p className="text-gray-700 mb-6 text-lg">
                    Whatever type of event you're running, Flow Grid gives you the tools to create a clear, 
                    beautiful, attendee-friendly schedule in minutes.
                  </p>
                  <Link 
                    href="/auth/signin"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Start Your Event Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <p className="text-green-700 text-sm mt-4">
                    5 free events • No credit card required • Set up in minutes
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl my-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Still not sure if Flow Grid fits your event?</h3>
                  <p className="text-gray-700 mb-4">
                    We'd love to hear about your specific use case. <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">Get in touch</Link> and 
                    we'll help you figure out if Flow Grid is the right fit—or point you to something better if it's not.
                  </p>
                  <p className="text-sm text-gray-600">
                    Seriously. We're more interested in you having a great event than making a sale. Your success 
                    is our success.
                  </p>
                </div>
              </section>

              {/* Author Bio */}
              <AuthorBio />

              {/* Related Posts */}
              <RelatedPosts posts={relatedPosts} />
            </div>
          </div>
        </div>
      </article>
      
      <Footer />
    </div>
  )
}
