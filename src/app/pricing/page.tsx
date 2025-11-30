'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Check, X, Zap, Building, Sparkles, ArrowRight, Calendar, Users, Palette, Globe, BarChart3, Headphones, Code, Copy, Mail } from 'lucide-react'

export default function PricingPage() {
  const { data: session } = useSession()
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  const prices = {
    pro: billingPeriod === 'monthly' ? 29 : 23,
  }

  const savings = {
    pro: billingPeriod === 'yearly' ? Math.round((29 - 23) * 12) : 0,
  }

  const handleUpgrade = async (plan: 'PRO') => {
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
          billingPeriod 
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">Flow Grid</span>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
                Home
              </Link>
              {session ? (
                <Link 
                  href="/dashboard" 
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link 
                  href="/auth/signin" 
                  className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

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
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {/* Free Tier */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Free</h3>
              <p className="text-slate-600">Perfect for small events and workshops</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">$0</span>
              <span className="text-slate-500">/month</span>
            </div>

            <Link
              href={session ? "/dashboard" : "/auth/signin"}
              className="block w-full text-center bg-slate-100 text-slate-900 py-3 px-4 rounded-lg font-medium hover:bg-slate-200 transition-colors mb-8"
            >
              {session ? 'Go to Dashboard' : 'Get Started Free'}
            </Link>

            <ul className="space-y-4">
              <FeatureItem included>1 festival</FeatureItem>
              <FeatureItem included>Unlimited sessions</FeatureItem>
              <FeatureItem included>Basic customization (colors + logo)</FeatureItem>
              <FeatureItem included>Shareable schedule link</FeatureItem>
              <FeatureItem included>Basic analytics</FeatureItem>
              <FeatureItem included>Booking system</FeatureItem>
              <FeatureItem included>QR codes</FeatureItem>
              <FeatureItem included>Calendar exports</FeatureItem>
              <FeatureItem>"Powered by Flow Grid" removed</FeatureItem>
              <FeatureItem>Embeddable widget</FeatureItem>
              <FeatureItem>Custom subdomain</FeatureItem>
              <FeatureItem>Advanced analytics</FeatureItem>
            </ul>
          </div>

          {/* Pro Tier */}
          <div className="bg-gradient-to-b from-blue-600 to-blue-700 rounded-2xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4">
              <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                Most Popular
              </span>
            </div>

            <div className="mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-blue-100">For festivals, retreats & conferences</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-white">${prices.pro}</span>
              <span className="text-blue-200">/month</span>
              {savings.pro > 0 && (
                <span className="ml-2 text-sm text-blue-100">
                  (save ${savings.pro}/year)
                </span>
              )}
            </div>

            <button
              onClick={() => handleUpgrade('PRO')}
              className="block w-full text-center bg-white text-blue-600 py-3 px-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors mb-8"
            >
              {session ? 'Upgrade to Pro' : 'Sign in to Upgrade'} <ArrowRight className="inline w-4 h-4 ml-1" />
            </button>

            <ul className="space-y-4">
              <FeatureItem included light>Up to 5 festivals</FeatureItem>
              <FeatureItem included light>Unlimited sessions</FeatureItem>
              <FeatureItem included light>Full customization</FeatureItem>
              <FeatureItem included light>Shareable schedule link</FeatureItem>
              <FeatureItem included light>Advanced analytics</FeatureItem>
              <FeatureItem included light>Booking system</FeatureItem>
              <FeatureItem included light>QR codes</FeatureItem>
              <FeatureItem included light>Calendar exports</FeatureItem>
              <FeatureItem included light>No "Powered by" branding</FeatureItem>
              <FeatureItem included light>Embeddable widget</FeatureItem>
              <FeatureItem included light>Custom subdomain</FeatureItem>
              <FeatureItem included light>Clone events</FeatureItem>
              <FeatureItem included light>Up to 5 team members</FeatureItem>
              <FeatureItem included light>Priority email support</FeatureItem>
            </ul>
          </div>

          {/* Enterprise Tier */}
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <Building className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-600">For agencies & large organizations</p>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-slate-900">Custom</span>
            </div>

            <Link
              href="/contact?subject=Enterprise%20Inquiry"
              className="block w-full text-center bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-8"
            >
              Contact Sales <Mail className="inline w-4 h-4 ml-1" />
            </Link>

            <ul className="space-y-4">
              <FeatureItem included>Unlimited festivals</FeatureItem>
              <FeatureItem included>Unlimited sessions</FeatureItem>
              <FeatureItem included>Full customization</FeatureItem>
              <FeatureItem included>Advanced analytics + export</FeatureItem>
              <FeatureItem included>Advanced booking (payments, waitlists)</FeatureItem>
              <FeatureItem included>Full white-label experience</FeatureItem>
              <FeatureItem included>Custom domain support</FeatureItem>
              <FeatureItem included>API access & integrations</FeatureItem>
              <FeatureItem included>Unlimited team members</FeatureItem>
              <FeatureItem included>Dedicated success manager</FeatureItem>
              <FeatureItem included>Priority SLA & support</FeatureItem>
              <FeatureItem included>Custom feature development</FeatureItem>
            </ul>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Compare all features
          </h2>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left py-4 px-6 text-slate-600 font-medium">Feature</th>
                  <th className="text-center py-4 px-6 text-slate-900 font-semibold">Free</th>
                  <th className="text-center py-4 px-6 text-blue-600 font-semibold">Pro</th>
                  <th className="text-center py-4 px-6 text-purple-600 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <ComparisonRow 
                  feature="Festivals" 
                  free="1" 
                  pro="5" 
                  enterprise="Unlimited" 
                  icon={<Calendar className="w-4 h-4" />}
                />
                <ComparisonRow 
                  feature="Sessions per festival" 
                  free="Unlimited" 
                  pro="Unlimited" 
                  enterprise="Unlimited" 
                />
                <ComparisonRow 
                  feature="Team members" 
                  free="1" 
                  pro="5" 
                  enterprise="Unlimited" 
                  icon={<Users className="w-4 h-4" />}
                />
                <ComparisonRow 
                  feature="Custom colors & branding" 
                  free={true} 
                  pro={true} 
                  enterprise={true} 
                  icon={<Palette className="w-4 h-4" />}
                />
                <ComparisonRow 
                  feature="Booking system" 
                  free={true} 
                  pro={true} 
                  enterprise="Advanced" 
                />
                <ComparisonRow 
                  feature="Analytics" 
                  free="Basic" 
                  pro="Advanced" 
                  enterprise="Advanced + Export" 
                  icon={<BarChart3 className="w-4 h-4" />}
                />
                <ComparisonRow 
                  feature="Embeddable widget" 
                  free={false} 
                  pro={true} 
                  enterprise={true} 
                  icon={<Code className="w-4 h-4" />}
                />
                <ComparisonRow 
                  feature="Custom subdomain" 
                  free={false} 
                  pro={true} 
                  enterprise={true} 
                  icon={<Globe className="w-4 h-4" />}
                />
                <ComparisonRow 
                  feature="Custom domain" 
                  free={false} 
                  pro={false} 
                  enterprise={true} 
                  icon={<Globe className="w-4 h-4" />}
                />
                <ComparisonRow 
                  feature="Clone events" 
                  free={false} 
                  pro={true} 
                  enterprise={true}
                  icon={<Copy className="w-4 h-4" />}
                />
                <ComparisonRow 
                  feature="Remove 'Powered by' branding" 
                  free={false} 
                  pro={true} 
                  enterprise={true} 
                />
                <ComparisonRow 
                  feature="API access" 
                  free={false} 
                  pro={false} 
                  enterprise={true} 
                />
                <ComparisonRow 
                  feature="Priority support" 
                  free={false} 
                  pro="Email" 
                  enterprise="Dedicated" 
                  icon={<Headphones className="w-4 h-4" />}
                />
                <ComparisonRow 
                  feature="Calendar exports (ICS, Google)" 
                  free={true} 
                  pro={true} 
                  enterprise={true} 
                />
                <ComparisonRow 
                  feature="QR codes" 
                  free={true} 
                  pro={true} 
                  enterprise={true} 
                />
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
            Frequently asked questions
          </h2>

          <div className="space-y-6">
            <FAQItem 
              question="Can I upgrade or downgrade at any time?"
              answer="Yes! You can upgrade your plan instantly. When downgrading, you'll keep your current plan features until the end of your billing period. Any festivals beyond your new plan's limit will become read-only."
            />
            <FAQItem 
              question="What payment methods do you accept?"
              answer="We accept all major credit cards (Visa, Mastercard, American Express) through Stripe. For Enterprise annual plans, we also offer invoicing."
            />
            <FAQItem 
              question="Is there a free trial for Pro?"
              answer="The Free plan lets you experience most features with 1 festival. If you need to test Pro features before committing, contact us and we'll set up a trial."
            />
            <FAQItem 
              question="What happens to my data if I cancel?"
              answer="Your data is yours. If you cancel, your festivals remain accessible in read-only mode. You can export your data anytime or resubscribe to regain full access."
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
              answer="Enterprise includes everything in Pro plus unlimited festivals, custom domain support, API access, advanced booking features (payments, waitlists), unlimited team members, and dedicated support. Contact us to discuss your specific needs."
            />
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-20 py-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to create amazing schedules?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join event organizers who trust Flow Grid for their festivals, retreats, and workshops.
          </p>
          <Link
            href={session ? "/dashboard" : "/auth/signin"}
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-full font-semibold text-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Start Free Today <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Flow Grid. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/privacy" className="hover:text-slate-900">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-900">Terms of Service</Link>
            <Link href="/contact" className="hover:text-slate-900">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureItem({ 
  children, 
  included = false, 
  light = false 
}: { 
  children: React.ReactNode
  included?: boolean
  light?: boolean 
}) {
  return (
    <li className={`flex items-center gap-3 ${light ? 'text-white' : 'text-slate-600'}`}>
      {included ? (
        <Check className={`w-5 h-5 flex-shrink-0 ${light ? 'text-blue-200' : 'text-green-500'}`} />
      ) : (
        <X className={`w-5 h-5 flex-shrink-0 ${light ? 'text-blue-300/50' : 'text-slate-300'}`} />
      )}
      <span className={!included && !light ? 'text-slate-400' : ''}>{children}</span>
    </li>
  )
}

function ComparisonRow({ 
  feature, 
  free, 
  pro, 
  enterprise,
  icon
}: { 
  feature: string
  free: string | boolean
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
    return <span className="font-medium text-slate-900">{value}</span>
  }

  return (
    <tr className="hover:bg-slate-50">
      <td className="py-4 px-6 text-slate-700">
        <span className="flex items-center gap-2">
          {icon && <span className="text-slate-400">{icon}</span>}
          {feature}
        </span>
      </td>
      <td className="py-4 px-6 text-center">{renderValue(free)}</td>
      <td className="py-4 px-6 text-center bg-blue-50/50">{renderValue(pro)}</td>
      <td className="py-4 px-6 text-center">{renderValue(enterprise)}</td>
    </tr>
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
