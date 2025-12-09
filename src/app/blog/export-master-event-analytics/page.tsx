import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import AuthorBio from '@/components/blog/AuthorBio'
import RelatedPosts from '@/components/blog/RelatedPosts'
import TableOfContents from '@/components/blog/TableOfContents'
import Footer from '@/components/Footer'
import { ArrowRight, BarChart3, Download, TrendingUp, Users, Calendar, Target, CheckCircle, Eye, Lightbulb, FileSpreadsheet } from 'lucide-react'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const publishDate = '2024-12-04'
const title = 'Data-Driven Decisions: How to Export and Master Your Event Analytics'
const description = 'Move beyond dashboard views. Learn how to export event analytics, analyze data in Excel or Google Sheets, create stakeholder reports, track growth, and uncover hidden trends that improve future events.'
const slug = 'export-master-event-analytics'

export const metadata: Metadata = {
  title: `${title} | Flow Grid Blog`,
  description,
  keywords: [
    'event analytics export',
    'CSV event data',
    'event metrics analysis',
    'Excel event reporting',
    'Google Sheets event data',
    'event ROI tracking',
    'attendee behavior analysis',
    'event performance metrics',
    'festival analytics',
    'event data visualization'
  ],
  authors: [{ name: 'Florian Hohenleitner' }],
  openGraph: {
    title,
    description,
    type: 'article',
    publishedTime: publishDate,
    authors: ['Florian Hohenleitner'],
    tags: ['Analytics', 'Data', 'Event Management', 'Reporting'],
  },
  alternates: {
    canonical: `/blog/${slug}`,
  },
}

const sections = [
  { id: 'beyond-dashboard', title: 'Beyond the Dashboard' },
  { id: 'export-basics', title: 'How to Export Your Data' },
  { id: 'excel-analysis', title: 'Analyzing in Excel or Sheets' },
  { id: 'key-metrics', title: 'Key Metrics to Track' },
  { id: 'stakeholder-reports', title: 'Creating Stakeholder Reports' },
  { id: 'year-over-year', title: 'Year-over-Year Comparisons' },
  { id: 'hidden-insights', title: 'Finding Hidden Insights' },
  { id: 'action-items', title: 'From Data to Action' },
]

const relatedPosts = [
  {
    slug: 'waitlist-automation-maximizes-attendance',
    title: 'Never Miss a Sold-Out Session: How Waitlist Automation Reduces No-Shows',
    excerpt: 'Learn how automated waitlists fill every seat and maximize event attendance.',
    category: 'Features'
  },
  {
    slug: 'event-app-community-building',
    title: 'Why Every Festival Needs an Event App for Community Building',
    excerpt: 'How modern event apps transform festivals from one-time gatherings into lasting communities.',
    category: 'Event Management'
  },
  {
    slug: 'hidden-costs-manual-event-scheduling',
    title: 'The Hidden Costs of Manual Event Scheduling (And How to Avoid Them)',
    excerpt: 'Discover the true price of managing events manually and why automation pays for itself.',
    category: 'Best Practices'
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
        <header className="bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-800 text-white py-20">
          <div className="max-w-4xl mx-auto px-6">
            <Breadcrumbs 
              items={[
                { name: 'Blog', href: '/blog' },
                { name: 'Analytics', href: '/blog?category=analytics' },
                { name: title }
              ]} 
            />
            
            <div className="mt-8 mb-6">
              <span className="inline-block bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                Analytics
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
              <span>12 min read</span>
              <span>•</span>
              <span>Analytics</span>
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
              {/* Hero Visual */}
              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-8 rounded-2xl text-white mb-12">
                <div className="flex items-center gap-4 mb-4">
                  <Download className="w-12 h-12" />
                  <div>
                    <div className="text-3xl font-bold">Your Data, Your Way</div>
                    <div className="text-blue-100">Export. Analyze. Improve.</div>
                  </div>
                </div>
              </div>

              <section id="beyond-dashboard" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  Beyond the Dashboard
                </h2>
                
                <p className="text-lg leading-relaxed text-gray-700">
                  Your event platform's dashboard gives you a quick overview: total views, popular sessions, 
                  peak times. That's useful. But what if you want to:
                </p>

                <ul className="space-y-3 text-gray-700 my-6">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl mt-1">→</span>
                    <span>Compare this year's yoga retreat attendance to last year's by session type?</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl mt-1">→</span>
                    <span>Show your venue partner exactly which time slots drive the most engagement?</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl mt-1">→</span>
                    <span>Identify which presenters consistently fill sessions vs. which need more marketing support?</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl mt-1">→</span>
                    <span>Create a custom visualization for your board meeting or sponsor pitch deck?</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl mt-1">→</span>
                    <span>Merge event data with ticket sales data from your payment processor?</span>
                  </li>
                </ul>

                <p className="text-lg leading-relaxed text-gray-700">
                  For these deeper insights, you need raw data. That's where CSV export transforms your 
                  analytics from "interesting to look at" into "actionable business intelligence."
                </p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 my-8 rounded-r-lg">
                  <h3 className="text-xl font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6" />
                    The Power of Owning Your Data
                  </h3>
                  <p className="text-gray-700">
                    When you export event analytics to CSV, you're not just downloading numbers—you're 
                    taking ownership of insights that can shape your event strategy for years to come. 
                    You can slice it, dice it, combine it with other data sources, and answer questions 
                    the dashboard was never designed to answer.
                  </p>
                </div>
              </section>

              <section id="export-basics" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Download className="w-8 h-8 text-green-600" />
                  How to Export Your Data
                </h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  Most modern event platforms offer CSV export functionality. Here's what to look for 
                  and how to make the most of it:
                </p>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-6 my-8">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">What Should Be Included in Your Export?</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📊 Session-Level Data</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                        <li>Session title, presenter, room, time slot</li>
                        <li>Total views (how many people viewed this session)</li>
                        <li>Click-through rate (views that led to detail views)</li>
                        <li>Favorites/bookmarks count</li>
                        <li>Calendar exports for this session</li>
                        <li>Booking numbers (if applicable)</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">👥 Presenter Performance</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                        <li>Total sessions per presenter</li>
                        <li>Average views per session</li>
                        <li>Click-through to bio/website</li>
                        <li>Total engagement across all their sessions</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📈 Time-Based Metrics</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                        <li>Views by hour (traffic patterns)</li>
                        <li>Peak engagement times</li>
                        <li>Views before vs. during event</li>
                        <li>Post-event archive access</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🔍 Interaction Data</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                        <li>Filter usage (which filters attendees use most)</li>
                        <li>View mode preferences (cards, grid, my schedule)</li>
                        <li>Share button clicks</li>
                        <li>Search queries (if tracked)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-xl my-8">
                  <h3 className="text-xl font-semibold text-green-900 mb-4">Pro Tip: Export Regularly</h3>
                  <p className="text-gray-700">
                    Don't wait until after your event ends. Export data during the event to track 
                    real-time engagement. This lets you:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 mt-3">
                    <li>Identify underperforming sessions and boost their promotion mid-event</li>
                    <li>Recognize trending sessions and add capacity if needed</li>
                    <li>Spot technical issues (sessions with unusually low engagement)</li>
                    <li>Make data-driven decisions while you can still impact outcomes</li>
                  </ul>
                </div>
              </section>

              <section id="excel-analysis" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <FileSpreadsheet className="w-8 h-8 text-purple-600" />
                  Analyzing in Excel or Google Sheets
                </h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  Once you've exported your CSV, the real magic begins. Here are practical analysis 
                  techniques you can apply immediately:
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">1. Sort by Engagement</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      Sort your session data by total views, favorites, or bookings to instantly identify:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ Your most popular content themes</li>
                      <li>✓ Best-performing presenters</li>
                      <li>✓ Ideal session lengths and times</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-purple-900 mb-3">2. Create Pivot Tables</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      Use pivot tables to cross-reference variables:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ Views by time slot AND day</li>
                      <li>✓ Presenter performance by room</li>
                      <li>✓ Session type popularity by demographics</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">3. Calculate Ratios</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      Create formulas to reveal deeper patterns:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ View-to-booking conversion rate</li>
                      <li>✓ Favorites per presenter</li>
                      <li>✓ Engagement rate (views ÷ total attendees)</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-orange-900 mb-3">4. Visualize Trends</h3>
                    <p className="text-gray-700 text-sm mb-3">
                      Create charts to communicate insights:
                    </p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>✓ Line graph: Traffic over event duration</li>
                      <li>✓ Bar chart: Top 10 sessions by views</li>
                      <li>✓ Heat map: Engagement by time + day</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-900 text-white p-6 rounded-xl my-8">
                  <h3 className="text-xl font-semibold mb-4">Example Analysis Workflow</h3>
                  <div className="space-y-3 text-gray-300 text-sm font-mono">
                    <div><span className="text-green-400">1.</span> Import CSV into Google Sheets</div>
                    <div><span className="text-green-400">2.</span> Create column: =SUM(views + favorites + bookings) → "Total Engagement"</div>
                    <div><span className="text-green-400">3.</span> Sort by Total Engagement (descending)</div>
                    <div><span className="text-green-400">4.</span> Create pivot: Rows=Presenter | Values=AVG(Total Engagement)</div>
                    <div><span className="text-green-400">5.</span> Insert column chart from pivot data</div>
                    <div><span className="text-green-400">6.</span> Filter to top 20% performers</div>
                    <div><span className="text-green-400">7.</span> Analyze: What do top performers have in common?</div>
                  </div>
                </div>
              </section>

              <section id="key-metrics" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <Target className="w-8 h-8 text-red-600" />
                  Key Metrics to Track
                </h2>

                <p className="text-lg leading-relaxed text-gray-700 mb-6">
                  Not all metrics are created equal. Focus on these key performance indicators (KPIs) 
                  that actually drive event improvements:
                </p>

                <div className="space-y-6">
                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Session Engagement Rate</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Formula:</strong> (Total Interactions ÷ Total Schedule Views) × 100
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Why it matters:</strong> Shows which sessions capture attention relative to total traffic. 
                      A session with 100 views and 40 interactions (40% engagement) is more compelling than one with 
                      500 views and 50 interactions (10% engagement).
                    </p>
                  </div>

                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Presenter Performance Score</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Formula:</strong> Average engagement across all presenter's sessions
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Why it matters:</strong> Identifies your star presenters. Invite high performers back. 
                      Offer lower performers training or pair them with popular co-presenters.
                    </p>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Time Slot Effectiveness</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Formula:</strong> Average engagement for sessions in each time slot
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Why it matters:</strong> Reveals optimal scheduling. Morning slots might outperform 
                      late afternoon. Use this to schedule your most important sessions at peak times.
                    </p>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Conversion Funnel</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Stages:</strong> Schedule View → Session Click → Favorite → Booking/Calendar Export
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Why it matters:</strong> Identifies where attendees drop off. Low click-through? 
                      Improve session titles. High clicks but low bookings? Clarify prerequisites or capacity.
                    </p>
                  </div>

                  <div className="border-l-4 border-pink-500 pl-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Content Category Performance</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Method:</strong> Group sessions by type (workshop, lecture, practice, etc.) and compare
                    </p>
                    <p className="text-gray-600 text-sm">
                      <strong>Why it matters:</strong> Shows what your audience really wants. If workshops consistently 
                      outperform lectures 3:1, adjust your next event's session mix accordingly.
                    </p>
                  </div>
                </div>
              </section>

              <section id="stakeholder-reports" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Creating Stakeholder Reports</h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  Different stakeholders care about different metrics. Tailor your reports to their interests:
                </p>

                <div className="grid md:grid-cols-2 gap-6 my-8">
                  <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🎤 For Presenters</h3>
                    <p className="text-sm text-gray-700 mb-3">Give each presenter a personalized report:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Total views across their sessions</li>
                      <li>• Engagement rate vs. event average</li>
                      <li>• Attendee feedback (if collected)</li>
                      <li>• Booking/waitlist statistics</li>
                      <li>• Year-over-year growth (for returning presenters)</li>
                    </ul>
                  </div>

                  <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">💼 For Sponsors</h3>
                    <p className="text-sm text-gray-700 mb-3">Demonstrate value with hard numbers:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Total unique viewers</li>
                      <li>• Demographic breakdown (if available)</li>
                      <li>• Engagement duration</li>
                      <li>• Social share metrics</li>
                      <li>• Comparison to previous events</li>
                    </ul>
                  </div>

                  <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">🏢 For Venue Partners</h3>
                    <p className="text-sm text-gray-700 mb-3">Show how attendees used the space:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Room utilization rates</li>
                      <li>• Peak capacity times</li>
                      <li>• Popular room features</li>
                      <li>• Traffic flow patterns</li>
                      <li>• Suggestions for next event</li>
                    </ul>
                  </div>

                  <div className="bg-white border-2 border-gray-200 p-6 rounded-xl">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 For Board/Investors</h3>
                    <p className="text-sm text-gray-700 mb-3">Focus on growth and ROI:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Year-over-year growth trends</li>
                      <li>• Engagement per marketing dollar</li>
                      <li>• Attendee retention rates</li>
                      <li>• New vs. returning attendee ratio</li>
                      <li>• Projections for next event</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section id="year-over-year" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  Year-over-Year Comparisons
                </h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  The real power of exported analytics emerges when you track multiple events over time. 
                  Here's how to build valuable historical comparisons:
                </p>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200 my-8">
                  <h3 className="text-2xl font-bold text-green-900 mb-6">Building Your Analytics Archive</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <div>
                        <strong className="text-gray-900">Create a Master Spreadsheet</strong>
                        <p className="text-gray-700 text-sm mt-1">
                          Build one Google Sheet with tabs for each event: "2024-Spring-Retreat", "2024-Fall-Festival", etc.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <div>
                        <strong className="text-gray-900">Standardize Column Names</strong>
                        <p className="text-gray-700 text-sm mt-1">
                          Use identical column headers across all exports so you can easily compare and merge data.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <div>
                        <strong className="text-gray-900">Add Context Columns</strong>
                        <p className="text-gray-700 text-sm mt-1">
                          Include event name, date, total attendees, venue, weather—contextual factors that might 
                          explain performance variations.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">4</div>
                      <div>
                        <strong className="text-gray-900">Create Summary Dashboards</strong>
                        <p className="text-gray-700 text-sm mt-1">
                          Build a separate tab with formulas that pull key metrics from all event tabs for 
                          at-a-glance comparisons.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-4 mt-8">Key Questions Year-over-Year Data Can Answer:</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">Q:</span>
                    <div>
                      <strong>Are we growing?</strong>
                      <p className="text-sm text-gray-600">Compare total views, bookings, and engagement across events</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">Q:</span>
                    <div>
                      <strong>What content resonates?</strong>
                      <p className="text-sm text-gray-600">Track which session types consistently perform vs. trending topics that fade</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">Q:</span>
                    <div>
                      <strong>Are returning presenters improving?</strong>
                      <p className="text-sm text-gray-600">Track individual presenter performance across multiple events</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">Q:</span>
                    <div>
                      <strong>What's our attendee retention rate?</strong>
                      <p className="text-sm text-gray-600">If you track attendee emails, measure how many return year after year</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-600 font-bold mt-1">Q:</span>
                    <div>
                      <strong>Did that marketing campaign work?</strong>
                      <p className="text-sm text-gray-600">Compare views before/during campaigns vs. baseline traffic</p>
                    </div>
                  </li>
                </ul>
              </section>

              <section id="hidden-insights" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Finding Hidden Insights</h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  The most valuable discoveries often come from unexpected patterns. Here are analysis techniques 
                  that reveal insights your dashboard would never show:
                </p>

                <div className="space-y-6 my-8">
                  <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-xl">
                    <h3 className="text-lg font-semibold text-purple-900 mb-2">🔍 The "Surprise Hit" Analysis</h3>
                    <p className="text-gray-700 mb-3">
                      Filter for sessions with high engagement BUT from relatively unknown presenters or obscure topics.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Action:</strong> These are goldmines. Promote these presenters more prominently next time. 
                      Their authentic appeal can build without big marketing budgets.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-xl">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">📉 The "Expectation Gap"</h3>
                    <p className="text-gray-700 mb-3">
                      Find sessions you heavily promoted but that underperformed. Calculate: 
                      (Actual Engagement ÷ Expected Engagement) × 100
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Action:</strong> Either your marketing messaging didn't match the content, or the session 
                      didn't deliver. Review and adjust for next time.
                    </p>
                  </div>

                  <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-xl">
                    <h3 className="text-lg font-semibold text-orange-900 mb-2">⏰ The "Time Warp" Pattern</h3>
                    <p className="text-gray-700 mb-3">
                      Group sessions by time slot and calculate average engagement. Look for non-obvious patterns.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Example insight:</strong> "7pm sessions on Thursday outperform 7pm sessions on Saturday by 40%—
                      probably because Saturday attendees are tired by evening."
                    </p>
                  </div>

                  <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-r-xl">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">🎯 The "Perfect Pairing"</h3>
                    <p className="text-gray-700 mb-3">
                      Identify which sessions attendees frequently favorite together (if your platform tracks this).
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Action:</strong> Schedule complementary sessions near each other. Bundle them in marketing. 
                      Create "learning paths" for next event.
                    </p>
                  </div>

                  <div className="bg-pink-50 border-l-4 border-pink-500 p-6 rounded-r-xl">
                    <h3 className="text-lg font-semibold text-pink-900 mb-2">📱 The "Device Preference" Signal</h3>
                    <p className="text-gray-700 mb-3">
                      If your export includes device type, compare mobile vs. desktop engagement patterns.
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Example insight:</strong> "Mobile users favorite 3x more sessions but book 50% less—they're 
                      browsing on-the-go. Send them booking reminders when they're likely at a computer."
                    </p>
                  </div>
                </div>
              </section>

              <section id="action-items" className="prose prose-lg max-w-none mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">From Data to Action</h2>

                <p className="text-lg leading-relaxed text-gray-700">
                  Analytics are only valuable if they drive improvements. Here's how to turn insights into results:
                </p>

                <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-8 rounded-2xl my-8">
                  <h3 className="text-2xl font-bold mb-6">Your Post-Event Analysis Checklist</h3>
                  
                  <div className="space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-white/30" />
                      <span className="text-white/90">
                        <strong className="text-white">Export data within 48 hours of event ending</strong> 
                        <span className="block text-sm text-white/70 mt-1">While memory is fresh and context is clear</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-white/30" />
                      <span className="text-white/90">
                        <strong className="text-white">Identify top 10% and bottom 10% performers</strong>
                        <span className="block text-sm text-white/70 mt-1">Focus improvement efforts where they matter most</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-white/30" />
                      <span className="text-white/90">
                        <strong className="text-white">Document 3 key insights</strong>
                        <span className="block text-sm text-white/70 mt-1">What surprised you? What confirmed hunches? What changes behavior?</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-white/30" />
                      <span className="text-white/90">
                        <strong className="text-white">Create "Next Time" action items</strong>
                        <span className="block text-sm text-white/70 mt-1">Specific changes based on data, not assumptions</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-white/30" />
                      <span className="text-white/90">
                        <strong className="text-white">Share insights with team</strong>
                        <span className="block text-sm text-white/70 mt-1">Presenters, sponsors, volunteers deserve to see the impact</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-white/30" />
                      <span className="text-white/90">
                        <strong className="text-white">Add to historical archive</strong>
                        <span className="block text-sm text-white/70 mt-1">Build year-over-year comparison capability</span>
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1 w-5 h-5 rounded border-white/30" />
                      <span className="text-white/90">
                        <strong className="text-white">Schedule review meeting</strong>
                        <span className="block text-sm text-white/70 mt-1">Discuss findings with stakeholders while data is relevant</span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="bg-green-50 p-8 rounded-2xl border-2 border-green-300 my-12">
                  <h3 className="text-2xl font-bold text-green-900 mb-4">Start Mastering Your Event Data Today</h3>
                  <p className="text-gray-700 mb-6 text-lg">
                    Flow Grid's analytics export feature gives you complete ownership of your event data. 
                    Export to CSV, analyze in your favorite tools, and make data-driven decisions that 
                    improve every future event.
                  </p>
                  <Link 
                    href="/auth/signin"
                    className="inline-flex items-center gap-2 bg-green-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Get Started with Flow Grid
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <p className="text-green-700 text-sm mt-4">
                    Analytics export included on Pro plan • 5 free events to start
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
