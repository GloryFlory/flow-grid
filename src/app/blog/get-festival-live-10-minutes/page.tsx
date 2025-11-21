import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Footer from '@/components/Footer'
import AuthorBio from '@/components/blog/AuthorBio'
import RelatedPosts from '@/components/blog/RelatedPosts'
import type { Metadata } from 'next'
import { ArrowLeft, CheckCircle, Clock, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Get Your First Festival Live in 10 Minutes | FlowGrid',
  description: 'Skip the complexity. Create your festival schedule in minutes, not days. Step-by-step guide to launching your first event with FlowGrid\'s quick create feature.',
  keywords: [
    'create festival schedule fast',
    'quick festival setup',
    'festival scheduling software',
    'how to create festival schedule',
    'event planning software'
  ],
  openGraph: {
    title: 'Get Your First Festival Live in 10 Minutes',
    description: 'Launch your festival schedule in minutes with FlowGrid\'s quick create feature. No CSV, no complexity.',
    images: ['/og-image.png'],
  },
}

export default function BlogPost() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: 'Get Your First Festival Live in 10 Minutes',
    description: 'Skip the complexity. Create your festival schedule in minutes, not days. Step-by-step guide to launching your first event with FlowGrid\'s quick create feature.',
    image: 'https://tryflowgrid.com/og-image.png',
    datePublished: '2025-11-14',
    dateModified: '2025-11-14',
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
      '@id': 'https://tryflowgrid.com/blog/get-festival-live-10-minutes',
    },
    wordCount: 2200,
    articleBody: 'Complete guide to creating your first festival schedule in under 10 minutes...',
  }

  const relatedPosts = [
    {
      slug: 'how-to-create-yoga-retreat-schedule',
      title: 'How to Create the Perfect Yoga Retreat Schedule',
      excerpt: 'Balance practice, rest & community with proven retreat scheduling strategies.',
      category: 'Retreat Planning'
    },
    {
      slug: 'festival-schedule-template-guide',
      title: 'Festival Schedule Template Guide',
      excerpt: 'Professional templates for multi-day festivals and single-day events.',
      category: 'Festival Planning'
    },
    {
      slug: 'multi-day-festival-scheduling-tips',
      title: '7 Multi-Day Festival Scheduling Tips',
      excerpt: 'Manage complex events with overlapping sessions and multiple venues.',
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
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              Quick Start Guide
            </span>
            <span>•</span>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              <span>8 min read</span>
            </div>
            <span>•</span>
            <time dateTime="2025-11-14">November 14, 2025</time>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Get Your First Festival Live in 10 Minutes
          </h1>

          <p className="text-xl text-gray-600 leading-relaxed">
            Stop overthinking it. You don't need a perfect CSV file, a complete session list, or hours of planning to get started. Here's how to create your first festival schedule in under 10 minutes—really.
          </p>
        </header>

        {/* CTA Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-12">
          <div className="flex items-start gap-4">
            <Zap className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Ready to launch your festival?</h3>
              <p className="text-gray-700 mb-4">Follow along and create your schedule while reading this guide.</p>
              <Link href="/auth/signin">
                <Button>Start Creating (Free) →</Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="prose prose-lg max-w-none">
          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Why Speed Matters</h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            I've organized festivals for over a decade, and I've watched countless organizers get stuck in "planning paralysis." They spend weeks perfecting spreadsheets, debating session formats, and tweaking schedules—before they've even validated if anyone wants to attend.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Here's what I learned: <strong>The faster you get your festival online, the faster you can start promoting it, gathering feedback, and making real progress.</strong>
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            That's why we built FlowGrid's "Quick Create" feature. Create your festival now, add sessions later. Let's do this.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">The 10-Minute Festival Setup</h2>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">1</span>
            Create Your Account (2 minutes)
          </h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            Head to <Link href="/" className="text-blue-600 hover:underline">FlowGrid.com</Link> and sign up. You can use Google sign-in or create an account with your email. No credit card required.
          </p>

          <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Pro tip:</strong> Use your festival email address if you have one. This makes it easier to manage permissions later when you invite your team.
            </p>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">2</span>
            Fill in Basic Festival Details (3 minutes)
          </h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            Click "Create Festival" and you'll see a simple form. You only need five things:
          </p>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <span className="text-gray-700"><strong>Festival Name:</strong> What's it called? Keep it simple.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <span className="text-gray-700"><strong>Start & End Dates:</strong> When is it happening? Even if it's 6 months away.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <span className="text-gray-700"><strong>Slug:</strong> Your custom URL (e.g., <code className="bg-gray-100 px-2 py-1 rounded text-sm">summer-yoga-fest</code>). This creates your public schedule link.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <span className="text-gray-700"><strong>Location:</strong> City and venue name. You can add details later.</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-1 flex-shrink-0" />
              <span className="text-gray-700"><strong>Description:</strong> A one-liner about your festival. 10-15 words is plenty.</span>
            </li>
          </ul>

          <p className="text-gray-700 leading-relaxed mb-6">
            That's it. You don't need tracks, venues, or sponsor logos yet. Those come later.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">3</span>
            Skip the Sessions (30 seconds)
          </h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            Here's the game-changer: when you reach the "Schedule" step, you'll see a checkbox that says:
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <p className="text-gray-900 font-medium mb-2">☑️ I'll add sessions later</p>
            <p className="text-sm text-gray-600">Create your festival now and upload your schedule when it's ready.</p>
          </div>

          <p className="text-gray-700 leading-relaxed mb-6">
            Check that box. Click "Continue to Preview." You just saved yourself hours of CSV wrangling.
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Why this works:</strong> Most festivals don't have their full schedule finalized until weeks before the event. Why wait? Get your festival page live now, start building buzz, and add sessions as they're confirmed.
            </p>
          </div>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">4</span>
            Preview & Publish (2 minutes)
          </h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            Review your festival details in the preview. You'll see:
          </p>

          <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
            <li>Your festival name and dates displayed beautifully</li>
            <li>Your custom public URL (e.g., <code className="bg-gray-100 px-2 py-1 rounded text-sm">flowgrid.com/summer-yoga-fest</code>)</li>
            <li>A message that says "Sessions coming soon" (perfectly fine!)</li>
          </ul>

          <p className="text-gray-700 leading-relaxed mb-6">
            Click <strong>"Publish Festival"</strong> and boom—you're live.
          </p>

          <h3 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold mr-3">5</span>
            Share Your Page (30 seconds)
          </h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            Your festival has a public schedule page now. Share it:
          </p>

          <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
            <li>Post the link on Instagram/Facebook: "Festival dates locked in! 🎉"</li>
            <li>Send it to potential speakers: "Want to teach? Here are the dates."</li>
            <li>Email your mailing list: "Mark your calendars—schedule details coming soon."</li>
          </ul>

          <p className="text-gray-700 leading-relaxed mb-8">
            You're officially promoting your festival. In 10 minutes.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">What Happens Next?</h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            Now that your festival is live, you can add sessions whenever you're ready. Here's the workflow:
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Option 1: Add Sessions Manually</h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            Go to your festival dashboard → <strong>Manage Sessions</strong> → Click "Add Session." Fill in:
          </p>

          <ul className="list-disc list-inside space-y-2 mb-6 text-gray-700">
            <li>Session title (e.g., "Morning Vinyasa Flow")</li>
            <li>Teacher name</li>
            <li>Start and end time</li>
            <li>Location/track (optional)</li>
          </ul>

          <p className="text-gray-700 leading-relaxed mb-6">
            Perfect for festivals with 5-20 sessions, or when you're confirming teachers one-by-one.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Option 2: Upload a CSV Later</h3>

          <p className="text-gray-700 leading-relaxed mb-4">
            When your schedule is finalized, upload a CSV file with all your sessions at once. Go to <strong>Manage Sessions</strong> → <strong>Import from CSV</strong>.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            Download our <Link href="/blog/festival-schedule-template-guide" className="text-blue-600 hover:underline">free CSV template</Link> to get started.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Option 3: Sync with Google Sheets</h3>

          <p className="text-gray-700 leading-relaxed mb-6">
            If you're already managing your schedule in Google Sheets, connect it to FlowGrid for automatic updates. Changes in your sheet sync to your public schedule in real-time. <Link href="/blog/spreadsheet-vs-scheduling-software" className="text-blue-600 hover:underline">Learn more about spreadsheet integration</Link>.
          </p>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Real Organizer Success Stories</h2>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-gray-700 italic mb-4">
              "I used to spend days perfecting my schedule before launching. Now I create the festival page in 10 minutes, share it with speakers, and they tell ME what times work for them. Game-changer."
            </p>
            <p className="text-gray-900 font-medium">— Sarah Chen, Mindful Movement Retreat</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-gray-700 italic mb-4">
              "I was stuck trying to build a CSV with 80 sessions. FlowGrid's quick create let me launch with 'Schedule TBA' and start taking early-bird registrations immediately. Added sessions over 3 weeks as teachers confirmed."
            </p>
            <p className="text-gray-900 font-medium">— Marcus Rivera, Urban Dance Festival</p>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Common Mistakes to Avoid</h2>

          <div className="space-y-6 mb-8">
            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">❌ Waiting for the "perfect" schedule</h4>
              <p className="text-gray-700">Your schedule will change. Teachers cancel, times shift, venues swap. Launch now, iterate later.</p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">❌ Over-customizing on day one</h4>
              <p className="text-gray-700">You don't need custom colors, sponsor logos, or fancy track names to launch. Add those later.</p>
            </div>

            <div className="border-l-4 border-red-500 pl-4">
              <h4 className="font-semibold text-gray-900 mb-2">❌ Creating a CSV before you're ready</h4>
              <p className="text-gray-700">CSVs are for bulk imports. If you have fewer than 20 sessions, just add them manually one-by-one.</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Your 10-Minute Action Plan</h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            Here's your checklist. Set a timer and go:
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h4 className="font-semibold text-gray-900 mb-4">⏱️ 10-Minute Checklist:</h4>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 rounded border-2 border-gray-400 mr-3 mt-1 flex-shrink-0"></span>
                <span className="text-gray-700">Sign up at FlowGrid.com (2 min)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 rounded border-2 border-gray-400 mr-3 mt-1 flex-shrink-0"></span>
                <span className="text-gray-700">Fill in festival name, dates, slug, location (3 min)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 rounded border-2 border-gray-400 mr-3 mt-1 flex-shrink-0"></span>
                <span className="text-gray-700">Check "I'll add sessions later" (30 sec)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 rounded border-2 border-gray-400 mr-3 mt-1 flex-shrink-0"></span>
                <span className="text-gray-700">Preview and publish (2 min)</span>
              </li>
              <li className="flex items-start">
                <span className="inline-block w-6 h-6 rounded border-2 border-gray-400 mr-3 mt-1 flex-shrink-0"></span>
                <span className="text-gray-700">Share your public link on social media (30 sec)</span>
              </li>
            </ul>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Frequently Asked Questions</h2>

          <div className="space-y-6 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change everything later?</h4>
              <p className="text-gray-700">Absolutely. Festival name, dates, description, logo—everything is editable. You're not locked in.</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What if I don't have final dates yet?</h4>
              <p className="text-gray-700">Use your best estimate. You can update dates later. The goal is to get a page live so people can start hearing about your festival.</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do I need a paid plan to create a festival?</h4>
              <p className="text-gray-700">No. FlowGrid's free plan lets you create one festival with unlimited sessions. Perfect for getting started.</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can attendees see my schedule if I haven't added sessions?</h4>
              <p className="text-gray-700">Yes, they'll see your festival details and a message that says "Sessions coming soon." Great for early promotion!</p>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6">Ready to Launch?</h2>

          <p className="text-gray-700 leading-relaxed mb-6">
            Most festival organizers overthink the setup. They delay launching until everything is perfect. But perfect is the enemy of done.
          </p>

          <p className="text-gray-700 leading-relaxed mb-6">
            <strong>Your festival doesn't need to be perfect. It needs to exist.</strong>
          </p>

          <p className="text-gray-700 leading-relaxed mb-8">
            So set that timer, follow the 5 steps above, and get your festival page live in the next 10 minutes. You've got this.
          </p>

          {/* Final CTA */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 text-center text-white mb-12">
            <h3 className="text-2xl font-bold mb-4">Create Your Festival in 10 Minutes</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join hundreds of organizers who've launched their festivals with FlowGrid's quick create feature. No credit card required.
            </p>
            <Link href="/auth/signin">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Start Creating (Free) →
              </Button>
            </Link>
          </div>
        </div>

        {/* Author Bio */}
        <AuthorBio />

        {/* Related Posts */}
        <RelatedPosts posts={relatedPosts} />
      </article>

      <Footer />
    </div>
  )
}
