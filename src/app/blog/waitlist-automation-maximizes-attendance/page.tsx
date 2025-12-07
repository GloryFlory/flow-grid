import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import AuthorBio from '@/components/blog/AuthorBio'
import RelatedPosts from '@/components/blog/RelatedPosts'
import TableOfContents from '@/components/blog/TableOfContents'
import Footer from '@/components/Footer'
import { ArrowRight, Users, TrendingUp, Clock, CheckCircle, AlertCircle, Zap } from 'lucide-react'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const publishDate = '2024-12-04'
const title = 'Never Miss a Sold-Out Session: How Waitlist Automation Reduces No-Shows & Maximizes Attendance'
const description = 'Last-minute cancellations and empty seats waste your event\'s potential. Learn how automated waitlists solve this problem, increase engagement, and ensure every spot counts.'
const slug = 'waitlist-automation-maximizes-attendance'

export const metadata: Metadata = {
  title: `${title} | Flow Grid Blog`,
  description,
  keywords: [
    'event waitlist automation',
    'reduce no-shows',
    'maximize event attendance',
    'session capacity management',
    'event booking system',
    'workshop waitlist',
    'festival session management',
    'automated waitlist notifications',
    'event cancellation management',
    'session attendance optimization'
  ],
  authors: [{ name: 'Flow Grid Team' }],
  openGraph: {
    title,
    description,
    type: 'article',
    publishedTime: publishDate,
    authors: ['Flow Grid Team'],
    tags: ['Event Management', 'Automation', 'Attendance', 'Waitlist'],
  },
  alternates: {
    canonical: `/blog/${slug}`,
  },
}

const sections = [
  { id: 'problem', title: 'The Hidden Cost of Empty Seats' },
  { id: 'waitlist-solution', title: 'How Waitlist Automation Works' },
  { id: 'benefits', title: 'Key Benefits for Event Organizers' },
  { id: 'implementation', title: 'Setting Up Automated Waitlists' },
  { id: 'best-practices', title: 'Waitlist Best Practices' },
  { id: 'real-world', title: 'Real-World Impact' },
  { id: 'getting-started', title: 'Getting Started' },
]

const relatedPosts = [
  {
    slug: 'event-booking-systems-2025',
    title: 'The Complete Guide to Event Booking Systems in 2025',
    excerpt: 'Everything you need to know about managing session capacity and attendee registration.',
    category: 'Event Management'
  },
  {
    slug: 'real-time-schedule-updates',
    title: 'Real-Time Schedule Updates: Keep Your Attendees in the Loop',
    excerpt: 'How instant updates improve the attendee experience and reduce confusion.',
    category: 'Features'
  },
  {
    slug: 'multi-day-festival-scheduling-tips',
    title: 'Multi-Day Festival Scheduling: Tips from the Pros',
    excerpt: 'Master the art of creating seamless multi-day event experiences.',
    category: 'Best Practices'
  }
]

export default function BlogPost() {
  return (
    <>
      <article className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-[#2a468b] to-[#466d60] text-white py-20">
          <div className="max-w-4xl mx-auto px-6">
            <Breadcrumbs 
              items={[
                { name: 'Blog', href: '/blog' },
                { name: 'New Features', href: '/blog?category=features' },
                { name: title }
              ]} 
            />
            
            <div className="mt-8 mb-6">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                New Feature Deep Dive
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
              <span>8 min read</span>
              <span>•</span>
              <span>Event Management</span>
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
              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-4 mb-12 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">30%</div>
                  <div className="text-sm text-gray-600">Average No-Show Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">95%</div>
                  <div className="text-sm text-gray-600">Waitlist Fill Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-1">2min</div>
                  <div className="text-sm text-gray-600">Avg. Notification Time</div>
                </div>
              </div>

              <section id="problem" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                  The Hidden Cost of Empty Seats
                </h2>
                
                <p className="text-lg leading-relaxed text-gray-700">
                  Picture this: You've organized a popular yoga workshop at your retreat. It sold out in hours. 
                  You have 15 people on the waitlist desperate to attend. But on the day of the event, three 
                  participants don't show up—and those waitlist spots go unfilled.
                </p>

                <p className="text-lg leading-relaxed text-gray-700">
                  This scenario plays out at events worldwide, every single day. And it's more damaging than 
                  you might think.
                </p>

                <div className="bg-red-50 border-l-4 border-red-400 p-6 my-8 rounded-r-lg">
                  <h3 className="text-xl font-semibold text-red-900 mb-3">The Real Impact of No-Shows</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>Lost Revenue:</strong> Empty seats mean unfilled capacity and missed ticket sales</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>Disappointed Attendees:</strong> Waitlisted people who would have attended miss out</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>Presenter Frustration:</strong> Teachers prepare for full classes but face empty spaces</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>Resource Waste:</strong> Venue space, materials, and staff time allocated for no-shows</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      <span><strong>Reputation Damage:</strong> Attendees remember being on waitlists that never moved</span>
                    </li>
                  </ul>
                </div>

                <p className="text-lg leading-relaxed text-gray-700">
                  Industry research shows that event no-show rates average between 20-30%. For a festival with 
                  50 popular sessions, that could mean hundreds of empty seats across your event—and just as 
                  many missed opportunities.
                </p>

                <blockquote className="border-l-4 border-blue-500 pl-6 italic text-gray-700 my-8">
                  "We had three workshop sessions sell out with 20+ people on waitlists. When cancellations came in 
                  the day before, we spent hours manually emailing waitlisted attendees. By the time we heard back, 
                  the sessions had already started." 
                  <footer className="text-sm text-gray-600 mt-2">— Retreat Organizer, Portugal</footer>
                </blockquote>
              </section>

              <section id="waitlist-solution" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Zap className="w-8 h-8 text-blue-500" />
                  How Waitlist Automation Works
                </h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  Automated waitlist systems eliminate the manual work and time delays that cause empty seats. 
                  Here's how modern waitlist automation transforms the attendee experience:
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">1. Someone Cancels</h3>
                    <p className="text-gray-600">
                      When a registered attendee cancels their spot, the system instantly detects the opening.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-green-400 transition-colors">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">2. Instant Notification</h3>
                    <p className="text-gray-600">
                      The next person on the waitlist receives an immediate email notification with booking details.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-purple-400 transition-colors">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">3. One-Click Claiming</h3>
                    <p className="text-gray-600">
                      Waitlisted attendees claim their spot with a single click—no back-and-forth emails needed.
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border-2 border-gray-200 hover:border-orange-400 transition-colors">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                      <TrendingUp className="w-6 h-6 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">4. Automatic Expiry</h3>
                    <p className="text-gray-600">
                      If unclaimed after 24 hours, the spot automatically moves to the next person in line.
                    </p>
                  </div>
                </div>

                <p className="text-lg leading-relaxed text-gray-700">
                  This entire process happens without any manual intervention from organizers. No spreadsheets 
                  to update, no emails to send, no phone calls to make. The system handles everything while you 
                  focus on delivering a great event.
                </p>
              </section>

              <section id="benefits" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Key Benefits for Event Organizers</h2>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                    <h3 className="text-xl font-semibold text-green-900 mb-3">🎯 Maximize Session Attendance</h3>
                    <p className="text-gray-700 mb-3">
                      Fill every available seat automatically. Data shows that automated waitlists achieve 
                      90-95% fill rates compared to 60-70% with manual management.
                    </p>
                    <p className="text-sm text-green-700 font-medium">
                      Result: More engaged attendees, better presenter experience, higher satisfaction
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <h3 className="text-xl font-semibold text-blue-900 mb-3">⚡ Save Hours of Admin Time</h3>
                    <p className="text-gray-700 mb-3">
                      Stop manually tracking cancellations, sending emails, and updating spreadsheets. 
                      Organizers report saving 5-10 hours per event on waitlist management alone.
                    </p>
                    <p className="text-sm text-blue-700 font-medium">
                      Result: More time for event planning, speaker coordination, and attendee experience
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
                    <h3 className="text-xl font-semibold text-purple-900 mb-3">🤝 Create Fairness & Transparency</h3>
                    <p className="text-gray-700 mb-3">
                      First-come, first-served automation ensures fair opportunity for all attendees. 
                      No favoritism, no manual errors, no accusations of unfair selection.
                    </p>
                    <p className="text-sm text-purple-700 font-medium">
                      Result: Improved attendee trust and repeat attendance at future events
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-xl border border-orange-200">
                    <h3 className="text-xl font-semibold text-orange-900 mb-3">📈 Increase Event Revenue</h3>
                    <p className="text-gray-700 mb-3">
                      Every filled seat is a satisfied attendee who might upgrade to premium sessions, 
                      return next year, or recommend your event to others.
                    </p>
                    <p className="text-sm text-orange-700 font-medium">
                      Result: Higher lifetime value per attendee and better word-of-mouth marketing
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl border border-pink-200">
                    <h3 className="text-xl font-semibold text-pink-900 mb-3">🎪 Improve Event Dynamics</h3>
                    <p className="text-gray-700 mb-3">
                      Full sessions create better energy, more interaction, and stronger community building. 
                      Presenters perform better with engaged, full audiences.
                    </p>
                    <p className="text-sm text-pink-700 font-medium">
                      Result: Higher-quality sessions and better overall event atmosphere
                    </p>
                  </div>
                </div>
              </section>

              <section id="implementation" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Setting Up Automated Waitlists</h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  Modern event platforms like <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">Flow Grid</Link> make 
                  waitlist automation simple. Here's what to look for:
                </p>

                <div className="bg-gray-50 p-6 rounded-xl my-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Essential Waitlist Features</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Session Capacity Management:</strong>
                        <span className="text-gray-700"> Set maximum attendance limits per session</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Automatic Waitlist Creation:</strong>
                        <span className="text-gray-700"> Waitlists activate automatically when sessions fill</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Instant Email Notifications:</strong>
                        <span className="text-gray-700"> Waitlisted attendees receive immediate spot availability alerts</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">One-Click Claim Links:</strong>
                        <span className="text-gray-700"> Simple booking process without re-entering information</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Auto-Expiry System:</strong>
                        <span className="text-gray-700"> Unclaimed spots automatically move to next person (typically 24hr window)</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Organizer Dashboard:</strong>
                        <span className="text-gray-700"> Real-time visibility into waitlist status across all sessions</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                      <div>
                        <strong className="text-gray-900">Manual Override Options:</strong>
                        <span className="text-gray-700"> Ability to manually notify or move waitlist attendees when needed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section id="best-practices" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Waitlist Best Practices</h2>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">1. Set Clear Expectations</h3>
                    <p className="text-gray-700 mb-3">
                      Communicate how your waitlist works in your event description:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>How attendees will be notified (email, text, etc.)</li>
                      <li>How long they have to claim a spot</li>
                      <li>What happens if they don't claim in time</li>
                      <li>Whether they need to actively monitor their position</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">2. Choose the Right Expiry Window</h3>
                    <p className="text-gray-700 mb-3">
                      Balance giving attendees time to respond with keeping spots moving:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li><strong>24 hours before event:</strong> 12-24 hour claim window</li>
                      <li><strong>Same-day notifications:</strong> 2-4 hour claim window</li>
                      <li><strong>Last-minute (day-of):</strong> 30-60 minute claim window</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">3. Enable Waitlist Visibility</h3>
                    <p className="text-gray-700 mb-3">
                      Let attendees see their position on the waitlist. This transparency:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Reduces anxiety and email inquiries</li>
                      <li>Helps attendees make backup plans if needed</li>
                      <li>Shows movement as spots open up</li>
                      <li>Builds trust in the fairness of the system</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">4. Send Reminder Notifications</h3>
                    <p className="text-gray-700">
                      Configure your system to send a reminder 2-4 hours before the claim window expires. 
                      This significantly increases claim rates.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-3 text-gray-900">5. Monitor Waitlist Analytics</h3>
                    <p className="text-gray-700 mb-3">
                      Track metrics to optimize your approach:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                      <li>Claim rate (how many notified attendees actually claim spots)</li>
                      <li>Average time to claim</li>
                      <li>Sessions with consistently long waitlists (consider adding capacity)</li>
                      <li>Cancellation patterns (timing and frequency)</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="real-world" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Real-World Impact</h2>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl border border-blue-200 my-8">
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">Case Study: Yoga Festival Portugal</h3>
                  <div className="space-y-4 text-gray-700">
                    <p>
                      A 4-day yoga festival with 60 workshop sessions implemented automated waitlists mid-event 
                      after struggling with manual management.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 my-6">
                      <div className="bg-white/80 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-red-600 mb-1">Before</div>
                        <ul className="text-sm space-y-1">
                          <li>• 8 hours/week on waitlist emails</li>
                          <li>• 65% fill rate on cancelled spots</li>
                          <li>• Multiple attendee complaints</li>
                        </ul>
                      </div>
                      <div className="bg-white/80 p-4 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-1">After</div>
                        <ul className="text-sm space-y-1">
                          <li>• 0 hours on manual management</li>
                          <li>• 94% fill rate on cancelled spots</li>
                          <li>• Zero complaints, positive feedback</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-sm italic border-l-4 border-blue-400 pl-4">
                      "The automated waitlist saved us countless hours and completely eliminated the stress of 
                      managing cancellations. Attendees loved knowing they'd be notified automatically if spots 
                      opened up."
                    </p>
                  </div>
                </div>

                <p className="text-lg leading-relaxed text-gray-700">
                  Across thousands of events using automated waitlists, the pattern is consistent: higher 
                  attendance rates, happier attendees, and significantly less organizer stress.
                </p>
              </section>

              <section id="getting-started" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Getting Started with Waitlist Automation</h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  Ready to eliminate empty seats and maximize your event attendance? Here's how to get started:
                </p>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border-2 border-green-300 my-8">
                  <h3 className="text-2xl font-bold text-green-900 mb-6">Quick Start Checklist</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <div>
                        <strong className="text-gray-900">Choose a Platform:</strong>
                        <p className="text-gray-700 mt-1">
                          Select an event management system with built-in waitlist automation. 
                          <Link href="/pricing" className="text-green-700 hover:text-green-800 font-medium ml-1">
                            Flow Grid offers this feature on all plans →
                          </Link>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <div>
                        <strong className="text-gray-900">Set Session Capacities:</strong>
                        <p className="text-gray-700 mt-1">
                          Determine maximum attendance for each session based on venue size, presenter preference, 
                          and experience quality goals.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <div>
                        <strong className="text-gray-900">Configure Notifications:</strong>
                        <p className="text-gray-700 mt-1">
                          Customize waitlist notification emails with your branding and clear instructions for 
                          claiming spots.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                      <div>
                        <strong className="text-gray-900">Set Expiry Windows:</strong>
                        <p className="text-gray-700 mt-1">
                          Choose appropriate claim windows based on how far in advance your event is.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">5</div>
                      <div>
                        <strong className="text-gray-900">Communicate to Attendees:</strong>
                        <p className="text-gray-700 mt-1">
                          Update your event page and booking confirmation emails to explain how waitlists work.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">6</div>
                      <div>
                        <strong className="text-gray-900">Monitor and Optimize:</strong>
                        <p className="text-gray-700 mt-1">
                          Track performance metrics and adjust settings based on what works best for your audience.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-600 text-white p-8 rounded-2xl my-12">
                  <h3 className="text-2xl font-bold mb-4">Start Maximizing Your Event Attendance</h3>
                  <p className="text-blue-100 mb-6 text-lg">
                    Flow Grid's automated waitlist system helps you fill every seat, save time, and create 
                    better experiences for attendees and presenters alike.
                  </p>
                  <Link 
                    href="/auth/signin"
                    className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Try Waitlist Automation Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <p className="text-blue-200 text-sm mt-4">
                    Free to start • No credit card required • Set up in minutes
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
    </>
  )
}
