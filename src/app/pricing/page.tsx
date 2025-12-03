'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import Footer from '@/components/Footer'
import { Check, X, Zap, Building, Sparkles, ArrowRight, Mail, HelpCircle, Calendar, FileText, Layers, Users, Palette, Globe, Type, QrCode, Code, Copy, Smartphone, Eye, Download, Bookmark, BarChart3, Heart, Shield, Headphones, Ticket } from 'lucide-react'

export default function PricingPage() {
  const { data: session } = useSession()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')
  const [showStickyHeader, setShowStickyHeader] = useState(false)
  const headerTriggerRef = useRef<HTMLDivElement>(null)
  const sectionEndRef = useRef<HTMLDivElement>(null)

  const prices = {
    pro: billingPeriod === 'monthly' ? 29 : 23,
  }

  // Show sticky header when original header scrolls past navbar (64px)
  // Show sticky header when original header scrolls under the navbar
  // Hide when we scroll past the feature comparison section
  useEffect(() => {
    const handleScroll = () => {
      if (headerTriggerRef.current && sectionEndRef.current) {
        const triggerRect = headerTriggerRef.current.getBoundingClientRect()
        const endRect = sectionEndRef.current.getBoundingClientRect()
        // Show when original header's BOTTOM edge goes above the navbar (64px)
        // This means the row is fully hidden under the navbar
        const headerHeight = triggerRect.height
        setShowStickyHeader(triggerRect.top + headerHeight <= 64 && endRect.bottom > 100)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Check initial state
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const savings = {
    pro: billingPeriod === 'yearly' ? Math.round((29 - 23) * 12) : 0,
  }

  const handleUpgrade = async (plan: 'PRO' | 'EVENT_PASS') => {
    if (!session) {
      window.location.href = `/auth/signin?callbackUrl=/pricing?upgrade=${plan}`
      return
    }

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          plan, 
          billingPeriod: plan === 'EVENT_PASS' ? 'one-time' : billingPeriod 
        }),
      })

      const { url, error } = await response.json()
      
      if (error) {
        alert(error)
        return
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sticky Plan Header - appears when scrolling past the original header */}
      {showStickyHeader && (
        <div className="fixed left-0 right-0 z-[100] bg-gradient-to-br from-blue-50 to-indigo-100 border-b border-slate-200/50 top-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-5 py-3">
                <div></div>
                <div className="text-center font-semibold text-slate-900">Free</div>
                <div className="text-center font-semibold text-orange-600">Event Pass</div>
                <div className="text-center font-semibold" style={{ color: '#b40225' }}>Pro</div>
                <div className="text-center font-semibold" style={{ color: '#466d60' }}>Enterprise</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation - matching main site */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <Image 
                    src="/flow-grid-logo.png" 
                    alt="Flow Grid Logo" 
                    width={40} 
                    height={40}
                    className="h-10 w-auto cursor-pointer"
                    priority
                  />
                </Link>
                <Link href="/">
                  <span className="ml-3 text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors">Flow Grid</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/auth/signin">
                    <Button variant="outline">Sign In</Button>
                  </Link>
                  <Link href="/auth/signin">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Start free and upgrade when you need more. No hidden fees, no surprises.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 bg-slate-100 p-1 rounded-full">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                billingPeriod === 'yearly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly
              <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-5">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Free</h3>
              <p className="text-slate-500 text-sm">Try out Flow Grid</p>
            </div>

            <div className="mb-5">
              <span className="text-3xl font-bold text-slate-900">€0</span>
              <p className="text-sm text-slate-500 mt-1">Free forever</p>
            </div>

            <Link
              href={session ? "/dashboard" : "/auth/signin"}
              className="block w-full text-center bg-slate-100 text-slate-900 py-2.5 px-4 rounded-lg font-medium hover:bg-slate-200 transition-colors mb-6"
            >
              {session ? 'Go to Dashboard' : 'Get Started Free'}
            </Link>

            <ul className="space-y-3 text-sm">
              <FeatureItem included>1 published event</FeatureItem>
              <FeatureItem included>Unlimited sessions</FeatureItem>
              <FeatureItem included>Custom colors & logo</FeatureItem>
              <FeatureItem included>Shareable link & QR code</FeatureItem>
              <FeatureItem included>Calendar exports</FeatureItem>
              <FeatureItem included>Basic analytics</FeatureItem>
              <FeatureItem>Flow Grid watermark</FeatureItem>
            </ul>
          </div>

          {/* Event Pass - One-time purchase */}
          <div className="bg-white rounded-2xl border-2 border-orange-400 p-6 shadow-md hover:shadow-lg transition-shadow relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                One-Time
              </span>
            </div>

            <div className="mb-5">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3">
                <Ticket className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Event Pass</h3>
              <p className="text-slate-500 text-sm">Pay per event</p>
            </div>

            <div className="mb-5">
              <span className="text-3xl font-bold text-slate-900">€29</span>
              <p className="text-sm text-slate-500 mt-1">One-time, per event</p>
            </div>

            <button
              onClick={() => handleUpgrade('EVENT_PASS')}
              className="block w-full text-center bg-orange-500 text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors mb-6"
            >
              {session ? 'Buy Event Pass' : 'Sign in to Buy'} <ArrowRight className="inline w-4 h-4 ml-1" />
            </button>

            <p className="text-xs text-slate-500 mb-3">Pro features for 1 event:</p>
            <ul className="space-y-3 text-sm">
              <FeatureItem included>1 Pro event (yours forever)</FeatureItem>
              <FeatureItem included>Remove watermark</FeatureItem>
              <FeatureItem included>Detailed analytics</FeatureItem>
              <FeatureItem included>Google Fonts</FeatureItem>
              <FeatureItem included>Embeddable widget</FeatureItem>
              <FeatureItem included>Priority support</FeatureItem>
              <FeatureItem included>Buy more as needed</FeatureItem>
            </ul>
          </div>

          {/* Pro Tier - Highlighted with border */}
          <div className="bg-white rounded-2xl border-2 border-[#b40225] p-6 shadow-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#b40225] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                Most Popular
              </span>
            </div>

            <div className="mb-5">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-[#b40225]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Pro</h3>
              <p className="text-slate-500 text-sm">Multiple events</p>
            </div>

            <div className="mb-5">
              <span className="text-3xl font-bold text-slate-900">€{prices.pro}</span>
              <span className="text-slate-500 text-sm">/mo</span>
              {savings.pro > 0 && (
                <p className="text-sm text-green-600 mt-1">
                  Save €{savings.pro}/year
                </p>
              )}
              {billingPeriod === 'monthly' && (
                <p className="text-sm text-slate-500 mt-1">Billed monthly</p>
              )}
            </div>

            <button
              onClick={() => handleUpgrade('PRO')}
              className="block w-full text-center bg-[#b40225] text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-[#8a011c] transition-colors mb-6"
            >
              {session ? 'Upgrade to Pro' : 'Sign in to Upgrade'} <ArrowRight className="inline w-4 h-4 ml-1" />
            </button>

            <p className="text-xs text-slate-500 mb-3">Everything in Event Pass, plus:</p>
            <ul className="space-y-3 text-sm">
              <FeatureItem included>Up to 5 published events</FeatureItem>
              <FeatureItem included>Swap events anytime</FeatureItem>
              <FeatureItem included>Duplicate events</FeatureItem>
              <FeatureItem included>All Pro features</FeatureItem>
              <FeatureItem included>Priority email support</FeatureItem>
            </ul>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: '#466d6015' }}>
                <Building className="w-5 h-5" style={{ color: '#466d60' }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Enterprise</h3>
              <p className="text-slate-500 text-sm">5+ events per year</p>
            </div>

            <div className="mb-5">
              <span className="text-3xl font-bold text-slate-900">Custom</span>
              <p className="text-sm text-slate-500 mt-1">Tailored to your needs</p>
            </div>

            <Link
              href="/contact/sales"
              className="block w-full text-center text-white py-2.5 px-4 rounded-lg font-semibold transition-colors mb-6"
              style={{ backgroundColor: '#466d60' }}
            >
              Contact Sales <Mail className="inline w-4 h-4 ml-1" />
            </Link>

            <p className="text-xs text-slate-500 mb-3">Everything in Pro, plus:</p>
            <ul className="space-y-3 text-sm">
              <FeatureItem included>Unlimited events</FeatureItem>
              <FeatureItem included>White-label & custom domain</FeatureItem>
              <FeatureItem included>Team members</FeatureItem>
              <FeatureItem included>API access</FeatureItem>
              <FeatureItem included>Dedicated success manager</FeatureItem>
            </ul>
          </div>
        </div>

        {/* All Features Comparison */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4">
            All Features
          </h2>
          <p className="text-slate-600 text-center mb-12 max-w-2xl mx-auto">
            A detailed breakdown of everything included in each plan
          </p>

          <div className="max-w-6xl mx-auto space-y-6">
            {/* Original Header Row - used as trigger for sticky */}
            <div ref={headerTriggerRef} className="grid grid-cols-5 py-3 border-b border-slate-200">
              <div></div>
              <div className="text-center font-semibold text-slate-900">Free</div>
              <div className="text-center font-semibold text-orange-600">Event Pass</div>
              <div className="text-center font-semibold" style={{ color: '#b40225' }}>Pro</div>
              <div className="text-center font-semibold" style={{ color: '#466d60' }}>Enterprise</div>
            </div>

            {/* Core Features */}
            <FeatureSection title="Core Features">
              <ComparisonRow icon={<Calendar className="w-4 h-4" />} feature="Published events" tooltip="The number of events you can make publicly visible at once" free="1" eventPass="1 (per pass)" pro="5" enterprise="Unlimited" />
              <ComparisonRow icon={<FileText className="w-4 h-4" />} feature="Draft events" tooltip="Create unlimited drafts to plan future events" free="Unlimited" eventPass="Unlimited" pro="Unlimited" enterprise="Unlimited" />
              <ComparisonRow icon={<Layers className="w-4 h-4" />} feature="Sessions per event" tooltip="Classes, workshops, talks - no limit on how many you can add" free="Unlimited" eventPass="Unlimited" pro="Unlimited" enterprise="Unlimited" />
              <ComparisonRow icon={<Users className="w-4 h-4" />} feature="Team members" tooltip="Invite collaborators to help manage your events" free="1" eventPass="1" pro="1" enterprise="Unlimited" />
            </FeatureSection>

            {/* Customization & Branding */}
            <FeatureSection title="Customization & Branding">
              <ComparisonRow icon={<Palette className="w-4 h-4" />} feature="Custom colors" tooltip="Match your schedule to your brand with custom color schemes" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Globe className="w-4 h-4" />} feature="Logo upload" tooltip="Display your organization's logo on the schedule" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Type className="w-4 h-4" />} feature="Google Fonts" tooltip="Choose from 500+ fonts to match your brand" free={false} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<X className="w-4 h-4" />} feature="Remove watermark" tooltip="Hide the Flow Grid attribution from your public schedule" free={false} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Globe className="w-4 h-4" />} feature="White-label experience" tooltip="Complete rebranding - your schedule looks 100% yours" free={false} eventPass={false} pro={false} enterprise={true} />
              <ComparisonRow icon={<Globe className="w-4 h-4" />} feature="Custom domain" tooltip="Use your own domain like schedule.yourevent.com" free={false} eventPass={false} pro={false} enterprise={true} />
            </FeatureSection>

            {/* Publishing & Sharing */}
            <FeatureSection title="Publishing & Sharing">
              <ComparisonRow icon={<Globe className="w-4 h-4" />} feature="Shareable public link" tooltip="Get a unique URL to share your schedule with attendees" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<QrCode className="w-4 h-4" />} feature="QR code poster" tooltip="Generate printable QR code posters for your venue" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Code className="w-4 h-4" />} feature="Embeddable widget" tooltip="Add your schedule directly to your website with an embed code" free={false} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Copy className="w-4 h-4" />} feature="Duplicate events" tooltip="Clone an entire event to quickly set up recurring events" free={false} eventPass={false} pro={true} enterprise={true} />
            </FeatureSection>

            {/* Attendee Experience */}
            <FeatureSection title="Attendee Experience">
              <ComparisonRow icon={<Smartphone className="w-4 h-4" />} feature="Mobile-responsive schedule" tooltip="Your schedule looks great on phones, tablets, and desktops" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Eye className="w-4 h-4" />} feature="Session search & filters" tooltip="Attendees can search and filter sessions by teacher, location, or type" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Download className="w-4 h-4" />} feature="Calendar exports (ICS, Google)" tooltip="Attendees can add sessions to their personal calendars" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Bookmark className="w-4 h-4" />} feature="Personal schedule builder" tooltip="Attendees can save their favorite sessions and build a personal itinerary" free={true} eventPass={true} pro={true} enterprise={true} />
            </FeatureSection>

            {/* Analytics & Insights */}
            <FeatureSection title="Analytics & Insights">
              <ComparisonRow icon={<BarChart3 className="w-4 h-4" />} feature="Page views" tooltip="Track how many people view your schedule" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Heart className="w-4 h-4" />} feature="Session popularity" tooltip="See which sessions get the most views and favorites" free="Basic" eventPass="Detailed" pro="Detailed" enterprise="Detailed" />
              <ComparisonRow icon={<Download className="w-4 h-4" />} feature="Export reports" tooltip="Download analytics data as CSV" free={false} eventPass={false} pro={false} enterprise={true} />
            </FeatureSection>

            {/* Data Import */}
            <FeatureSection title="Data Import">
              <ComparisonRow icon={<FileText className="w-4 h-4" />} feature="Google Sheets import" tooltip="Import your schedule data directly from Google Sheets" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<FileText className="w-4 h-4" />} feature="CSV import" tooltip="Upload schedule data from CSV files" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Code className="w-4 h-4" />} feature="API access" tooltip="Programmatically manage events via our REST API" free={false} eventPass={false} pro={false} enterprise={true} />
            </FeatureSection>

            {/* Security */}
            <FeatureSection title="Security">
              <ComparisonRow icon={<Shield className="w-4 h-4" />} feature="Passkey / 2FA authentication" tooltip="Secure passwordless login with passkeys" free={true} eventPass={true} pro={true} enterprise={true} />
            </FeatureSection>

            {/* Support */}
            <FeatureSection title="Support">
              <ComparisonRow icon={<Headphones className="w-4 h-4" />} feature="Help center & docs" tooltip="Access guides, tutorials, and documentation" free={true} eventPass={true} pro={true} enterprise={true} />
              <ComparisonRow icon={<Headphones className="w-4 h-4" />} feature="Email support" tooltip="Get help from our support team via email" free="Standard" eventPass="Priority" pro="Priority" enterprise="Priority" />
              <ComparisonRow icon={<Users className="w-4 h-4" />} feature="Dedicated success manager" tooltip="A personal contact to help you get the most from Flow Grid" free={false} eventPass={false} pro={false} enterprise={true} />
            </FeatureSection>
            
            {/* End marker for sticky header visibility */}
            <div ref={sectionEndRef} />
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            <FAQItem 
              question="What's the difference between Event Pass and Pro?"
              answer="Event Pass is a one-time purchase that unlocks Pro features for a single event - it's yours forever, no subscription needed. Pro is a monthly subscription that gives you 5 event slots you can swap anytime, plus the ability to duplicate events. Choose Event Pass if you have 1-2 events per year, or Pro if you manage multiple events regularly."
            />
            <FAQItem 
              question="Can I buy multiple Event Passes?"
              answer="Yes! Each Event Pass unlocks Pro features for one additional event. If you have 3 events, buy 3 Event Passes - each event keeps its Pro features permanently."
            />
            <FAQItem 
              question="Do I need a credit card to sign up?"
              answer="No! The Free plan is completely free forever with no credit card required. You only need to enter payment details when upgrading."
            />
            <FAQItem 
              question="Can I upgrade or downgrade at any time?"
              answer="Yes! You can upgrade your plan instantly. When downgrading from Pro, you'll keep your current plan features until the end of your billing period. Event Passes never expire - once purchased, that event has Pro features forever."
            />
            <FAQItem 
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express) through Stripe. For Enterprise annual plans, we also offer invoicing."
            />
            <FAQItem 
              question="What happens to my data if I cancel?"
              answer="Your data is yours. If you cancel Pro, your festivals remain accessible as drafts. Festivals with Event Passes keep their Pro features. You can export your data anytime."
            />
            <FAQItem 
              question="Can I get a refund?"
              answer="We offer a 30-day money-back guarantee. If you're not satisfied, contact us within 30 days of your purchase for a full refund."
            />
            <FAQItem 
              question="Do you offer discounts for non-profits?"
              answer="Yes! We offer 50% off for registered non-profit organizations. Contact us with your organization details to apply."
            />
            <FAQItem 
              question="What's included in Enterprise?"
              answer="Enterprise is fully customizable based on your needs. Common features include unlimited festivals, white-label branding, custom domains, team collaboration, payment processing, and dedicated support. Contact us to discuss your requirements."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-16 bg-gradient-to-r from-[#2a468b] to-[#466d60] rounded-3xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to create amazing schedules?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join event organizers who trust Flow Grid for their festivals, retreats, and workshops.
          </p>
          <Link href={session ? "/dashboard" : "/auth/signin"}>
            <Button size="lg" className="bg-[#ff7119] hover:bg-[#b40225] text-white text-lg px-8 py-3 shadow-xl">
              Start Free Today <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

function FeatureItem({ 
  children, 
  included = false
}: { 
  children: React.ReactNode
  included?: boolean
}) {
  return (
    <li className="flex items-center gap-3 text-slate-600">
      {included ? (
        <Check className="w-5 h-5 flex-shrink-0 text-green-500" />
      ) : (
        <X className="w-5 h-5 flex-shrink-0 text-slate-300" />
      )}
      <span className={!included ? 'text-slate-400' : ''}>{children}</span>
    </li>
  )
}

function FeatureSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="px-6 py-3 mb-0">
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="rounded-xl border border-slate-200/50 overflow-hidden bg-white divide-y divide-slate-100">
        {children}
      </div>
    </div>
  )
}

function ComparisonRow({ 
  feature, 
  tooltip,
  free, 
  eventPass,
  pro, 
  enterprise,
  icon
}: { 
  feature: string
  tooltip: string
  free: string | boolean
  eventPass: string | boolean
  pro: string | boolean
  enterprise: string | boolean
  icon?: React.ReactNode
}) {
  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-500 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-slate-300 mx-auto" />
      )
    }
    return <span className="font-medium text-slate-700 text-sm">{value}</span>
  }

  return (
    <div className="grid grid-cols-5 py-3 px-6 hover:bg-slate-50/50 items-center">
      <div className="flex items-center gap-3 pr-4">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {icon && (
            <span className="text-slate-400 flex-shrink-0 w-4 h-4 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
              {icon}
            </span>
          )}
          <span className="text-slate-700 text-sm">{feature}</span>
        </div>
        <div className="relative group flex-shrink-0">
          <HelpCircle className="w-4 h-4 text-slate-300 hover:text-slate-500 cursor-help" />
          <div className="invisible group-hover:visible absolute left-6 top-1/2 -translate-y-1/2 z-50 w-64 p-3 bg-slate-900 text-white text-xs rounded-lg shadow-lg">
            {tooltip}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -ml-1 w-2 h-2 bg-slate-900 rotate-45"></div>
          </div>
        </div>
      </div>
      <div className="text-center">{renderValue(free)}</div>
      <div className="text-center">{renderValue(eventPass)}</div>
      <div className="text-center">{renderValue(pro)}</div>
      <div className="text-center">{renderValue(enterprise)}</div>
    </div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6">
      <h3 className="font-semibold text-slate-900 mb-2">{question}</h3>
      <p className="text-slate-600">{answer}</p>
    </div>
  )
}
