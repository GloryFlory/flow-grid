import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import AuthorBio from '@/components/blog/AuthorBio'
import RelatedPosts from '@/components/blog/RelatedPosts'
import TableOfContents from '@/components/blog/TableOfContents'
import Footer from '@/components/Footer'
import { ArrowRight, BadgeEuro, Link2, Users, TrendingUp, CheckCircle } from 'lucide-react'

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const publishDate = '2026-06-29'
const title = 'Earn Money Referring Event Organisers to Flow Grid'
const description =
  'Flow Grid\'s affiliate programme pays you €25 per Pro referral and €50 per Event Pass. If you know event organisers who still rely on PDFs and spreadsheets, your link is worth real money.'
const slug = 'earn-money-referring-event-organisers-flow-grid'

export const metadata: Metadata = {
  title: `${title} | Flow Grid Blog`,
  description,
  keywords: [
    'flow grid affiliate programme',
    'event planning affiliate',
    'refer event organisers',
    'earn money event tools',
    'festival software referral',
    'passive income event industry',
    'flow grid referral link',
  ],
  authors: [{ name: 'Florian Hohenleitner' }],
  openGraph: {
    title,
    description,
    type: 'article',
    publishedTime: publishDate,
    authors: ['Florian Hohenleitner'],
    tags: ['Affiliate', 'Referrals', 'Earn Money'],
  },
  alternates: {
    canonical: `/blog/${slug}`,
  },
}

const sections = [
  { id: 'how-it-works', title: 'How It Works' },
  { id: 'the-numbers', title: 'The Numbers' },
  { id: 'who-to-refer', title: 'Who to Refer' },
  { id: 'how-to-share', title: 'How to Share Your Link' },
  { id: 'tracking', title: 'Tracking Your Referrals' },
  { id: 'get-started', title: 'Get Started' },
]

const relatedPosts = [
  {
    slug: 'many-ways-to-use-flow-grid',
    title: 'The Many Ways to Use Flow Grid: From Yoga Festivals to Corporate Retreats',
    excerpt: 'Flow Grid works for yoga festivals, dance conventions, corporate retreats, and much more.',
    category: 'Platform Overview',
  },
  {
    slug: 'get-festival-live-10-minutes',
    title: 'Get Your Festival Schedule Live in 10 Minutes (Seriously)',
    excerpt: 'A step-by-step walkthrough of getting your first event live on Flow Grid.',
    category: 'Getting Started',
  },
  {
    slug: 'hidden-costs-manual-event-scheduling',
    title: 'Hidden Costs of Manual Event Scheduling: The True Price of Spreadsheets',
    excerpt: 'The real cost of sticking with PDFs and spreadsheets for event scheduling.',
    category: 'Event Management',
  },
]

export default function AffiliatePostPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Breadcrumbs
          items={[
            { name: 'Blog', href: '/blog' },
            { name: title },
          ]}
        />

        {/* Header */}
        <header className="mt-8 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
              Earn Money
            </span>
            <span className="text-gray-400 text-sm">·</span>
            <time className="text-gray-500 text-sm">{formatDate(publishDate)}</time>
            <span className="text-gray-400 text-sm">·</span>
            <span className="text-gray-500 text-sm">6 min read</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {title}
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            You already recommend tools you love to people in your network. Flow Grid's affiliate
            programme means you get paid when those recommendations convert — €25 per Pro sign-up,
            €50 per Event Pass. No caps, no minimums.
          </p>
        </header>

        <div className="lg:grid lg:grid-cols-3 lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-8">
              <TableOfContents items={sections} />
            </div>
          </aside>

          <article className="lg:col-span-2 prose prose-lg prose-gray max-w-none">

            {/* Intro */}
            <p>
              If you organise events, you probably know a dozen other people who do too — yoga
              retreat leaders, workshop facilitators, festival producers, dance teachers. And if
              you've moved on from sending PDFs and manually updating spreadsheets, chances are
              you've already told someone about Flow Grid.
            </p>
            <p>
              The affiliate programme formalises that. Get your unique referral link, share it, and
              earn a payout every time someone upgrades to a paid plan.
            </p>

            {/* How it works */}
            <h2 id="how-it-works">How It Works</h2>
            <p>The mechanics are straightforward:</p>
            <ol>
              <li>
                <strong>Get your link.</strong> Every Flow Grid account automatically has a unique
                referral link. Find it under <strong>Settings → Affiliate</strong> in your dashboard.
              </li>
              <li>
                <strong>Share it.</strong> Send it to event organiser friends, post it in communities,
                add it to your email signature — anything works.
              </li>
              <li>
                <strong>They sign up.</strong> When someone clicks your link and creates an account,
                we track the referral for 30 days. They don't have to upgrade immediately.
              </li>
              <li>
                <strong>They upgrade.</strong> When they purchase a Pro subscription or an Event Pass,
                a payout is queued for you automatically.
              </li>
              <li>
                <strong>You get paid.</strong> We process payouts manually and reach out to you by
                email to arrange the transfer.
              </li>
            </ol>

            <div className="not-prose bg-emerald-50 border border-emerald-200 rounded-xl p-6 my-8">
              <div className="flex items-center gap-2 mb-3">
                <BadgeEuro className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">No minimums. No expiry.</span>
              </div>
              <p className="text-emerald-800 text-sm">
                There is no minimum payout threshold — your first conversion triggers a payout. And
                your referrals don't expire: if someone clicks your link today and upgrades three
                weeks later, it still counts.
              </p>
            </div>

            {/* The numbers */}
            <h2 id="the-numbers">The Numbers</h2>
            <p>
              Two payout tiers, both flat rates — no percentage calculations, no complexity:
            </p>

            <div className="not-prose grid sm:grid-cols-2 gap-4 my-8">
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">€25</div>
                <div className="font-semibold text-gray-700 mb-2">Pro Subscription</div>
                <p className="text-sm text-gray-500">
                  Paid once when the referred user first subscribes, regardless of whether they pay
                  monthly (€29/mo) or annually (€23/mo). One referral, one payout.
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">€50</div>
                <div className="font-semibold text-gray-700 mb-2">Event Pass</div>
                <p className="text-sm text-gray-500">
                  Event Pass is a one-time €69 purchase for a single event slot. Your €50 payout
                  represents 72% of the sale price — a generous rate to get the right people through
                  the door.
                </p>
              </div>
            </div>

            <p>
              To put that in context: if you refer just four people who each pick up an Event Pass,
              that's €200 in your pocket for sharing a link.
            </p>

            {/* Who to refer */}
            <h2 id="who-to-refer">Who to Refer</h2>
            <p>
              The best referrals are people who have an immediate, concrete problem that Flow Grid
              solves. Think about who in your network fits this profile:
            </p>

            <div className="not-prose space-y-3 my-6">
              {[
                {
                  icon: <Users className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
                  title: 'Yoga and wellness retreat leaders',
                  body: 'Still sending multi-page PDF schedules to attendees. They feel the pain every time they need to make a last-minute change.',
                },
                {
                  icon: <Users className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />,
                  title: 'Dance festival organisers',
                  body: 'Multi-track events with workshops, milongas, and masterclasses — exactly what Flow Grid was built for.',
                },
                {
                  icon: <Users className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />,
                  title: 'Conference and workshop producers',
                  body: 'Anyone managing parallel tracks and wanting attendees to be able to build their own schedule.',
                },
                {
                  icon: <Users className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />,
                  title: 'One-off event organisers',
                  body: 'Running a single retreat or workshop per year — the Event Pass is perfect, and the €50 payout reflects that.',
                },
              ].map(({ icon, title, body }) => (
                <div key={title} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                  {icon}
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{title}</div>
                    <div className="text-gray-600 text-sm mt-0.5">{body}</div>
                  </div>
                </div>
              ))}
            </div>

            <p>
              The common thread: anyone who currently relies on a PDF, a screenshot of a spreadsheet,
              or a badly formatted website table is a potential referral.
            </p>

            {/* How to share */}
            <h2 id="how-to-share">How to Share Your Link</h2>
            <p>
              There is no wrong way to share a referral link, but some placements consistently work
              better than others:
            </p>

            <h3>Direct recommendations</h3>
            <p>
              When you're in a conversation with someone who's struggling with their schedule — "the
              PDF thing is a nightmare" or "I had to resend it three times when the teachers
              changed" — that's your moment. A personal recommendation with context will always
              outperform a cold link.
            </p>

            <h3>Communities and Facebook groups</h3>
            <p>
              Event organiser communities on Facebook, Slack, or Discord are full of people actively
              looking for better tools. A genuine post about your experience with Flow Grid — ideally
              with a screenshot of your schedule — with your referral link at the end performs well
              because the audience is self-selected.
            </p>

            <h3>Your email signature</h3>
            <p>
              If you're an active event organiser, you send a lot of email to other organisers.
              Adding a one-line footer — "I use Flow Grid for my event schedules. Get started:
              [your link]" — is passive but surprisingly effective over time.
            </p>

            <h3>Your own event pages or social media</h3>
            <p>
              If you publicly promote your events, a note like "Schedule powered by Flow Grid — try
              it for your next event" on your website or Instagram bio works well. People who see
              your schedule and think "I want that" will click through.
            </p>

            {/* Tracking */}
            <h2 id="tracking">Tracking Your Referrals</h2>
            <p>
              Your <strong>Settings → Affiliate</strong> tab shows everything in one place:
            </p>
            <ul>
              <li>Your referral link and code</li>
              <li>A count of total referrals and conversions</li>
              <li>Pending payout amount (earned but not yet paid)</li>
              <li>Total paid out to date</li>
              <li>A table of individual referrals with their current status</li>
            </ul>
            <p>
              Each referral moves through three states: <strong>Signed up</strong> (they created an
              account), <strong>Payout pending</strong> (they upgraded — we owe you money), and{' '}
              <strong>Paid out</strong> (done).
            </p>
            <p>
              When a referral converts, we'll reach out to arrange the payout. We aim to process
              these promptly — no waiting months for a monthly batch payment.
            </p>

            {/* CTA */}
            <h2 id="get-started">Get Started</h2>
            <p>
              Your affiliate link is already waiting for you — no application, no approval process.
              Every Flow Grid account has one from day one.
            </p>

            <div className="not-prose bg-gray-900 rounded-2xl p-8 my-8 text-center">
              <BadgeEuro className="w-10 h-10 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Find your referral link</h3>
              <p className="text-gray-400 mb-6">
                Log in and go to Settings → Affiliate to grab your link and start sharing.
              </p>
              <Link href="/dashboard/settings?tab=affiliate">
                <Button className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-3">
                  Go to Affiliate settings <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            <p>
              Not a Flow Grid user yet?{' '}
              <Link href="/auth/signin" className="text-blue-600 hover:text-blue-700 font-medium">
                Create a free account
              </Link>{' '}
              — your affiliate code is generated the moment you sign up.
            </p>
          </article>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200">
          <AuthorBio />
        </div>

        <div className="mt-12">
          <RelatedPosts posts={relatedPosts} />
        </div>
      </div>

      <Footer />
    </div>
  )
}
