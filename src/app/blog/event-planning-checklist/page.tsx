import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Footer from '@/components/Footer'
import AuthorBio from '@/components/blog/AuthorBio'
import RelatedPosts from '@/components/blog/RelatedPosts'
import type { Metadata } from 'next'
import { ArrowLeft, Calendar, CheckSquare } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Event Planning Checklist 2025 - Complete Guide',
  description: 'Complete event planning checklist from 6 months out to post-event. Don\'t miss critical steps for festivals, retreats & conferences.',
  keywords: [
    'event planning checklist',
    'event planning template',
    'festival planning checklist',
    'event organization checklist',
    'event planning guide'
  ],
  openGraph: {
    title: 'The Complete Event Planning Checklist for 2025',
    description: 'Don\'t miss a detail! Comprehensive event planning checklist from start to finish.',
    images: ['/og-image.png'],
  },
}

export default function BlogPost() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'The Complete Event Planning Checklist for 2025',
    description: 'Complete event planning checklist from 6 months out to post-event follow-up.',
    image: 'https://tryflowgrid.com/og-image.png',
    datePublished: '2025-11-05',
    dateModified: '2025-11-10',
    author: {
      '@type': 'Person',
      '@id': 'https://florianhohenleitner.com/#person',
      name: 'Florian Hohenleitner',
      url: 'https://florianhohenleitner.com',
      sameAs: [
        'https://growwiththeflo.com',
        'https://mediterranean-acro-convention.com'
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Flow Grid',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tryflowgrid.com/flow-grid-logo.png',
      },
    },
    wordCount: 1700,
  }

  const relatedPosts = [
    {
      slug: 'festival-schedule-template-guide',
      title: 'Festival Schedule Template Guide',
      excerpt: 'Create professional festival schedules from single-day to multi-day events.',
      category: 'Festival Planning'
    },
    {
      slug: 'multi-day-festival-scheduling-tips',
      title: '7 Multi-Day Festival Scheduling Tips',
      excerpt: 'Expert strategies for managing complex multi-day events.',
      category: 'Festival Planning'
    },
    {
      slug: 'spreadsheet-vs-scheduling-software',
      title: 'Spreadsheets vs Scheduling Software',
      excerpt: 'Compare tools and find the best fit for your event needs.',
      category: 'Event Management'
    }
  ]

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
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

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Blog
        </Link>

        <header className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
              Event Planning
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              November 5, 2025
            </span>
            <span>• 6 min read</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Complete Event Planning Checklist for 2025
          </h1>
          
          <p className="text-xl text-gray-600">
            Don't miss a detail! Our comprehensive event planning checklist covers everything from initial planning to post-event follow-up.
          </p>
        </header>

  <div className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-h2:mt-12 prose-h2:border-b prose-h2:pb-2 prose-h3:mt-8 prose-p:leading-relaxed prose-li:marker:text-blue-600">
          <p>
            Planning an event—whether it's a festival, retreat, conference, or workshop—involves coordinating hundreds of details. Miss one, and it can cascade into bigger problems. This checklist will keep you organized and on track from start to finish.
          </p>

          <h2>6 Months Before Your Event</h2>
          
          <div className="space-y-3 my-6">
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Define event goals and objectives</strong> - What do you want to achieve?</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Set your budget</strong> - Be realistic about what you can spend</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Choose event date(s)</strong> - Check for conflicts with holidays or competing events</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Secure your venue</strong> - Popular venues book far in advance</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Assemble your team</strong> - Identify roles and responsibilities</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Create project timeline</strong> - Work backwards from event date</p>
            </div>
          </div>

          <h2>4-6 Months Before</h2>
          
          <div className="space-y-3 my-6">
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Book keynote speakers/performers</strong> - Top talent books early</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Design event branding</strong> - Logo, colors, visual identity</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Set up event website/landing page</strong> - Your central info hub</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Create ticketing system</strong> - Early bird pricing drives urgency</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Start social media presence</strong> - Build buzz early</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Secure necessary permits/insurance</strong> - Don't wait until last minute</p>
            </div>
          </div>

          <h2>2-3 Months Before</h2>
          
          <div className="space-y-3 my-6">
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Finalize event schedule</strong> - Lock in times and programming</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Contract vendors</strong> - Catering, AV, equipment rental, etc.</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Launch marketing campaign</strong> - Email, social, paid ads</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Open registration/ticket sales</strong> - Promote early bird pricing</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Create event app/digital schedule</strong> - Attendees want mobile access</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Book accommodations</strong> - Negotiate group rates for attendees</p>
            </div>
          </div>

          <h2>1 Month Before</h2>
          
          <div className="space-y-3 my-6">
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Confirm all vendors and speakers</strong> - Get written confirmation</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Create run-of-show document</strong> - Minute-by-minute timeline</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Finalize AV and tech requirements</strong> - No surprises on event day</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Order signage and printed materials</strong> - Allow time for delivery</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Recruit and train volunteers/staff</strong> - Schedule orientation sessions</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Send "what to expect" email to attendees</strong> - Build excitement</p>
            </div>
          </div>

          <h2>1-2 Weeks Before</h2>
          
          <div className="space-y-3 my-6">
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Walk through venue</strong> - Identify any issues or needed adjustments</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Create emergency contact list</strong> - Venue, vendors, key team members</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Test all technology</strong> - Mics, projectors, WiFi, registration system</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Finalize headcount</strong> - Confirm with caterer and venue</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Prepare name tags/badges</strong> - Have extras on hand</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Send final reminder to attendees</strong> - Include schedule and logistics</p>
            </div>
          </div>

          <h2>Day Before Event</h2>
          
          <div className="space-y-3 my-6">
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Confirm all vendor arrival times</strong> - Create setup schedule</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Pre-load registration data</strong> - Reduce day-of technical issues</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Pack event kit</strong> - Tape, scissors, markers, chargers, first aid</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Brief your team</strong> - Final meeting to review roles and schedule</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Get good sleep</strong> - You'll need the energy tomorrow!</p>
            </div>
          </div>

          <h2>Event Day</h2>
          
          <div className="space-y-3 my-6">
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Arrive early</strong> - Be there before anyone else</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Set up registration area</strong> - Test check-in process</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Do final venue walkthrough</strong> - Ensure everything is in place</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Welcome speakers/performers</strong> - Show them green rooms and facilities</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Brief volunteers on shifts</strong> - Make sure everyone knows their role</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Document the event</strong> - Photos and videos for future marketing</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Stay visible and available</strong> - Be the calm leader when issues arise</p>
            </div>
          </div>

          <h2>Post-Event (Within 1 Week)</h2>
          
          <div className="space-y-3 my-6">
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Send thank you emails</strong> - To attendees, speakers, sponsors, volunteers</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Collect feedback</strong> - Survey while event is fresh in minds</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Pay all vendors</strong> - Process invoices promptly</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Share event photos/highlights</strong> - Social media and email recap</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Review budget</strong> - Compare actual vs. projected costs</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Debrief with team</strong> - What worked? What didn't?</p>
            </div>
            <div className="flex gap-3 items-start">
              <CheckSquare className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
              <p className="m-0"><strong>Document lessons learned</strong> - Create notes for next year</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-lg my-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Stay Organized with Flow Grid
            </h3>
            <p className="text-gray-700 mb-6">
              Managing your event schedule doesn't have to be stressful. Flow Grid keeps everything organized and easy to share.
            </p>
            <Link href="/auth/signin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Planning Your Event
              </Button>
            </Link>
          </div>

          <h2>Pro Tips for Event Success</h2>
          
          <ul>
            <li><strong>Build buffer time:</strong> Things always take longer than expected</li>
            <li><strong>Have a Plan B:</strong> Especially for outdoor events and technology</li>
            <li><strong>Designate a troubleshooter:</strong> One person focused only on solving problems</li>
            <li><strong>Create a communication system:</strong> Walkie-talkies or group chat for team</li>
            <li><strong>Don't forget the little things:</strong> Phone chargers, safety pins, breath mints</li>
            <li><strong>Celebrate afterward:</strong> You and your team deserve it!</li>
          </ul>

          <p>
            Event planning is complex, but with the right checklist and tools, you can stay organized and reduce stress. Remember that even the best-planned events will have unexpected moments—that's where your preparation and calm leadership make all the difference.
          </p>

        </div>

        <RelatedPosts posts={relatedPosts} />

        <AuthorBio />

        <div className="mt-12 pt-8 border-t">
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to all articles
          </Link>
        </div>
      </article>

      <Footer />
    </div>
  )
}
