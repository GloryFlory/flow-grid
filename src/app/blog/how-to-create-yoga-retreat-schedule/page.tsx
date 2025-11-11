import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Footer from '@/components/Footer'
import AuthorBio from '@/components/blog/AuthorBio'
import RelatedPosts from '@/components/blog/RelatedPosts'
import type { Metadata } from 'next'
import { ArrowLeft, Calendar, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Yoga Retreat Schedule Guide: Perfect Planning Template',
  description: 'Plan perfect yoga retreat schedules with proven templates. Balance practice, rest & community with timing strategies from successful retreat leaders.',
  keywords: [
    'yoga retreat schedule',
    'retreat planning',
    'yoga retreat planner',
    'retreat schedule template',
    'wellness retreat planning'
  ],
  openGraph: {
    title: 'How to Create the Perfect Yoga Retreat Schedule',
    description: 'Complete guide to planning yoga retreat schedules with templates and best practices.',
    images: ['/og-image.png'],
  },
}

export default function BlogPost() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'How to Create the Perfect Yoga Retreat Schedule',
    description: 'Plan perfect yoga retreat schedules with proven templates. Balance practice, rest & community with timing strategies from successful retreat leaders.',
    image: 'https://tryflowgrid.com/og-image.png',
    datePublished: '2025-11-08',
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
      jobTitle: 'Event Organizer & Podcast Host',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Flow Grid',
      logo: {
        '@type': 'ImageObject',
        url: 'https://tryflowgrid.com/flow-grid-logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://tryflowgrid.com/blog/how-to-create-yoga-retreat-schedule',
    },
    wordCount: 2100,
    articleBody: 'Full guide to creating yoga retreat schedules...',
  }

  const relatedPosts = [
    {
      slug: 'festival-schedule-template-guide',
      title: 'Festival Schedule Template Guide',
      excerpt: 'Create professional festival schedules with our comprehensive templates and expert tips.',
      category: 'Festival Planning'
    },
    {
      slug: 'event-planning-checklist',
      title: 'Event Planning Checklist 2025',
      excerpt: 'Complete checklist covering everything from 6 months before to post-event follow-up.',
      category: 'Event Planning'
    },
    {
      slug: 'multi-day-festival-scheduling-tips',
      title: '7 Multi-Day Festival Scheduling Tips',
      excerpt: 'Master complex multi-day events with overlapping sessions and multiple venues.',
      category: 'Festival Planning'
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
              Retreat Planning
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              November 8, 2025
            </span>
            <span>• 10 min read</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How to Create the Perfect Yoga Retreat Schedule
          </h1>
          
          <p className="text-xl text-gray-600">
            A comprehensive guide to planning yoga retreat schedules that balance practice, rest, and community time. Includes templates and best practices from successful retreat leaders.
          </p>
        </header>

  <div className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-h2:mt-12 prose-h2:border-b prose-h2:pb-2 prose-h3:mt-8 prose-p:leading-relaxed prose-li:marker:text-blue-600">
          <p>
            Planning a yoga retreat schedule is both an art and a science. You need to create enough structure to give participants a transformative experience while leaving room for spontaneity, rest, and personal reflection. After years of helping retreat organizers create schedules, we've identified the key elements that make a retreat schedule truly exceptional.
          </p>

          <h2>Understanding the Rhythm of a Retreat Day</h2>
          
          <p>
            Unlike a typical yoga class schedule, retreat days follow natural energy cycles. <a href="https://www.yogaalliance.org/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Research in yoga and wellness practices</a> shows that honoring these natural rhythms—rather than fighting against them—leads to deeper transformation and participant satisfaction.
          </p>

          <h3>Morning Sessions (6:00 AM - 9:00 AM)</h3>
          
          <p>
            Early morning is prime time for practice. Participants are fresh, energized, and their minds are clear. This is when you should schedule your most intensive practices:
          </p>

          <ul>
            <li><strong>Sunrise meditation</strong> (6:00-6:30 AM) - Start quietly, honoring the transition from sleep to wakefulness</li>
            <li><strong>Morning asana practice</strong> (6:30-8:00 AM) - Vigorous vinyasa or challenging practices work well here</li>
            <li><strong>Light breakfast</strong> (8:00-9:00 AM) - Give at least an hour before the next session</li>
          </ul>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 my-8">
            <p className="font-semibold text-blue-900 mb-2">Pro Tip:</p>
            <p className="text-blue-800 m-0">
              Make morning practice optional on day one. Many participants arrive tired from travel and appreciate the flexibility to sleep in and adjust to the new environment.
            </p>
          </div>

          <h3>Mid-Morning Sessions (9:30 AM - 12:00 PM)</h3>
          
          <p>
            This is excellent time for workshops, learning, and skill-building activities:
          </p>

          <ul>
            <li>Yoga philosophy discussions</li>
            <li>Pranayama workshops</li>
            <li>Alignment-focused classes</li>
            <li>Partner or group activities</li>
          </ul>

          <h3>Midday Break (12:00 PM - 4:00 PM)</h3>
          
          <p>
            This is where many retreat organizers make their biggest mistake: over-scheduling. According to <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6137615/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">research on rest and recovery</a>, the midday period is crucial for integration and rest. Here's the ideal structure:
          </p>

          <ul>
            <li><strong>Lunch</strong> (12:00-1:00 PM) - Make it leisurely and social</li>
            <li><strong>Free time</strong> (1:00-4:00 PM) - This is non-negotiable. Participants need this time for:</li>
            <ul>
              <li>Napping and physical rest</li>
              <li>Journaling and reflection</li>
              <li>Exploring the local area</li>
              <li>Personal practice or reading</li>
              <li>Connecting with other participants informally</li>
            </ul>
          </ul>

          <h3>Afternoon Sessions (4:00 PM - 6:00 PM)</h3>
          
          <p>
            Energy returns in late afternoon, but not at morning levels. Schedule gentler, more restorative activities:
          </p>

          <ul>
            <li>Restorative yoga</li>
            <li>Yin yoga</li>
            <li>Guided meditation</li>
            <li>Nature walks or outdoor activities</li>
          </ul>

          <h3>Evening (6:00 PM onwards)</h3>
          
          <p>
            Evening is for winding down and building community:
          </p>

          <ul>
            <li><strong>Dinner</strong> (6:00-7:30 PM) - The most social meal of the day</li>
            <li><strong>Evening practice</strong> (7:30-8:30 PM) - Gentle movement, yoga nidra, or chanting</li>
            <li><strong>Optional social time</strong> (8:30 PM+) - Fire circles, tea ceremonies, or informal gathering</li>
          </ul>

          <h2>The Golden Ratios of Retreat Scheduling</h2>
          
          <p>
            After analyzing hundreds of successful retreat schedules, we've identified these optimal ratios:
          </p>

          <div className="bg-gray-50 p-6 rounded-lg my-8">
            <ul className="space-y-3 m-0">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <strong>40% Structured Practice</strong> - Scheduled yoga, meditation, and workshops
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <strong>35% Free Time</strong> - Completely unstructured time for rest and integration
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <strong>25% Meals & Transitions</strong> - Including time to get from place to place
                </div>
              </li>
            </ul>
          </div>

          <h2>Sample 3-Day Retreat Schedule</h2>
          
          <p>
            Here's a battle-tested schedule template for a weekend yoga retreat:
          </p>

          <h3>Friday Evening (Arrival Day)</h3>
          <ul>
            <li>4:00 PM - Check-in begins</li>
            <li>6:00 PM - Welcome circle & light dinner</li>
            <li>7:30 PM - Gentle opening practice</li>
            <li>8:30 PM - Free time / early rest</li>
          </ul>

          <h3>Saturday (Full Day)</h3>
          <ul>
            <li>6:30 AM - Optional sunrise meditation</li>
            <li>7:00 AM - Morning vinyasa practice</li>
            <li>8:30 AM - Breakfast</li>
            <li>10:00 AM - Yoga philosophy workshop</li>
            <li>12:00 PM - Lunch</li>
            <li>1:00 PM - FREE TIME (3 hours)</li>
            <li>4:00 PM - Restorative yoga</li>
            <li>6:00 PM - Dinner</li>
            <li>7:30 PM - Evening meditation & yoga nidra</li>
            <li>8:30 PM - Optional bonfire / social time</li>
          </ul>

          <h3>Sunday (Departure Day)</h3>
          <ul>
            <li>7:00 AM - Morning practice</li>
            <li>8:30 AM - Breakfast</li>
            <li>10:00 AM - Integration circle</li>
            <li>11:00 AM - Closing ceremony</li>
            <li>12:00 PM - Departures begin</li>
          </ul>

          <h2>Common Scheduling Mistakes to Avoid</h2>
          
          <h3>1. Over-Programming</h3>
          <p>
            The most common mistake is packing too much in. Remember: participants came to retreat, not to race through a packed schedule. If you're wondering whether to add another activity, the answer is probably no. Learn more about <Link href="/blog/multi-day-festival-scheduling-tips" className="text-blue-600 hover:underline">managing multi-day event energy</Link>.
          </p>

          <h3>2. Insufficient Transition Time</h3>
          <p>
            Allow at least 15-30 minutes between sessions. People need time to use the bathroom, change clothes, get water, and mentally transition between activities.
          </p>

          <h3>3. Forgetting About Meals</h3>
          <p>
            Meal times should be generous - at least 1 hour for breakfast, 1.5 hours for lunch and dinner. Shared meals are where much of the community bonding happens.
          </p>

          <h3>4. No Flexibility</h3>
          <p>
            Build in some "float" sessions that can be adjusted based on weather, energy levels, or participant requests. Label some sessions as "optional" to give people permission to rest.
          </p>

          <h3>5. Starting Too Early</h3>
          <p>
            Unless it's a meditation-focused retreat, 6:00-6:30 AM is early enough. Starting at 5:00 AM might work for seasoned practitioners but can be off-putting for beginners.
          </p>

          <h2>Managing Multi-Day Retreats</h2>
          
          <p>
            For retreats longer than 3 days, you need to think about arc and progression:
          </p>

          <ul>
            <li><strong>Day 1-2:</strong> Arrival and settling in. Gentler practices, lots of explanation, community building.</li>
            <li><strong>Middle days:</strong> Peak intensity. This is where transformation happens. Can include challenging practices, deep workshops, and intensive sessions.</li>
            <li><strong>Final 1-2 days:</strong> Integration and preparation for departure. Gentler again, with time for reflection and closure.</li>
          </ul>

          <h2>Using Technology to Streamline Your Schedule</h2>
          
          <p>
            Gone are the days of printed schedules that become outdated the moment you make a change. Modern scheduling tools like Flow Grid allow you to:
          </p>

          <ul>
            <li>Create beautiful, mobile-friendly schedules</li>
            <li>Update times and sessions in real-time</li>
            <li>Share your schedule via simple link</li>
            <li>Track which sessions participants are interested in</li>
            <li>Manage room assignments and locations</li>
          </ul>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 p-8 rounded-lg my-12 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to Create Your Retreat Schedule?
            </h3>
            <p className="text-gray-700 mb-6">
              Flow Grid makes it easy to plan, share, and manage your yoga retreat schedule. Get started in minutes.
            </p>
            <Link href="/auth/signin">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Create Your Schedule Free
              </Button>
            </Link>
          </div>

          <h2>Final Thoughts</h2>
          
          <p>
            The perfect retreat schedule honors the natural rhythm of the day, balances structure with freedom, and creates space for transformation to unfold. Remember that your schedule is a container for the experience, not the experience itself.
          </p>

          <p>
            Start with a template, adjust based on your specific location and teaching style, and don't be afraid to modify things as you go. The best retreat leaders are responsive to their participants' needs while maintaining enough structure to create safety and predictability.
          </p>

          <p>
            Your retreat schedule is often the first thing potential participants see. Make it clear, beautiful, and inviting - it sets the tone for the entire experience.
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
