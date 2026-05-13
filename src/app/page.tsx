'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Footer from '@/components/Footer'
import { PAYMENTS_ENABLED } from '@/config/payments'
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Clock, 
  DollarSign, 
  Zap,
  ArrowRight,
  Heart,
  Music,
  Briefcase,
  Ticket,
  Globe,
} from 'lucide-react'

const heroMessages = [
  {
    title: "Create Beautiful Event Schedules in Minutes",
    subtitle: "Professional scheduling software for yoga retreats, music festivals, workshops & conferences. Stop wrestling with spreadsheets.",
  },
  {
    title: "Stop Wrestling with Spreadsheets",
    subtitle: "Build professional event schedules in minutes, not hours. Perfect for retreats, festivals & conferences.",
  },
  {
    title: "Your Events. Your Brand. Your Schedule.",
    subtitle: "Custom-branded schedules for yoga retreats, music festivals, workshops & conferences. Free to start.",
  },
  {
    title: "From Chaos to Clarity in 5 Minutes",
    subtitle: "Transform messy spreadsheets into beautiful, shareable schedules. Mobile-friendly. Analytics included.",
  },
]

export default function HomePage() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % heroMessages.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [])
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Flow Grid",
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Professional event scheduling software for yoga retreats, music festivals, workshops and conferences. Create beautiful schedules in minutes.",
    "url": "https://tryflowgrid.com",
    "screenshot": "https://tryflowgrid.com/og-image.png",
    "operatingSystem": "Web",
    "browserRequirements": "Requires JavaScript. Requires HTML5."
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* SEO Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
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
            <div className="flex items-center gap-3">
              <Link href="/showcase">
                <Button variant="outline" className="border-gray-300 text-gray-700 hover:border-[#2a468b] hover:text-[#2a468b] transition-colors">
                  Take a Tour
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="bg-[#ff7119] hover:bg-[#b40225] text-white transition-colors">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/header.jpg" 
            alt="Flow Grid Header" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2a468b]/80 to-[#466d60]/75"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 transition-all duration-500 min-h-[160px] md:min-h-[200px] flex items-center justify-center">
              <span className="inline-block">
                {heroMessages[currentMessageIndex].title.split(' ').map((word, i) => {
                  const isHighlight = word === 'Event' || word === 'Schedules' || word === 'Spreadsheets' || word === 'Brand.' || word === 'Clarity'
                  return (
                    <span key={i} className="inline-block mx-1">
                      {isHighlight ? (
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#edb75b] to-[#ff7119]">
                          {word}
                        </span>
                      ) : (
                        word
                      )}
                    </span>
                  )
                })}
              </span>
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto min-h-[60px] transition-all duration-500">
              {heroMessages[currentMessageIndex].subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/auth/signin">
                <Button size="lg" className="text-lg px-8 py-3 bg-[#ff7119] hover:bg-[#b40225] text-white shadow-lg">
                  Start Free Today <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/showcase">
                <Button size="lg" className="text-lg px-8 py-3 bg-white text-[#2a468b] hover:bg-[#2a468b] hover:text-white transition-colors shadow-lg font-semibold">
                  See How It Works →
                </Button>
              </Link>
              <Link href="/flow-grid-demo/schedule" target="_blank">
                <Button size="lg" className="text-lg px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#2a468b]">
                  View Live Demo →
                </Button>
              </Link>
            </div>
            {/* Carousel indicators */}
            <div className="flex justify-center gap-2">
              {heroMessages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentMessageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentMessageIndex 
                      ? 'bg-white w-8' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to message ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need. Nothing you don't.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Built by event organizers who were tired of juggling spreadsheets, email threads, and last-minute changes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Calendar className="w-12 h-12 mb-4" style={{ color: '#2a468b' }} />
                <CardTitle>Build Schedules in Minutes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Drag-and-drop sessions, import from CSV or Google Sheets, and publish instantly. No more copy-pasting between tabs or fixing broken formulas at 2am.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 mb-4" style={{ color: '#466d60' }} />
                <CardTitle>Showcase Your Teachers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Upload photos that actually look good on mobile. Built-in cropping ensures every teacher photo is perfect—no awkward headshots or pixelated images.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="w-12 h-12 mb-4" style={{ color: '#edb75b' }} />
                <CardTitle>See What's Working</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Which sessions are most popular? When do people check the schedule? Real-time analytics without exporting to Excel or begging your webmaster.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="w-12 h-12 mb-4" style={{ color: '#ff7119' }} />
                <CardTitle>Attendees Will Love It</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Mobile-first schedules that work offline. Filter by teacher, style, or level. Add to calendar with one tap. Your attendees deserve better than a PDF.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <DollarSign className="w-12 h-12 mb-4" style={{ color: '#2a468b' }} />
                <CardTitle>One Dashboard for Everything</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Running multiple events? Manage them all from one place. Each gets its own branded page and URL. No more logging into different accounts.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="w-12 h-12 text-yellow-600 mb-4" />
                <CardTitle>Actually Looks Like Yours</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Upload your logo, pick your colors, and ship. Takes 2 minutes. Looks like you spent $5k on a custom website. (You didn't.)
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Globe className="w-12 h-12 mb-4" style={{ color: '#b40225' }} />
                <CardTitle>Grow Your Audience Before Your Event</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create landing pages for early bird sign-ups, waitlists, webinars, and retreat interest — all linked to your event. Collect subscribers and get notified by email the moment someone signs up.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Built for your type of event
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Yoga & Wellness */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4" style={{ borderTopColor: '#466d60' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: '#466d6015' }}>
                <Heart className="w-6 h-6" style={{ color: '#466d60' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Yoga & Wellness Retreats</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Perfect for multi-day retreats with diverse class offerings. Manage teacher schedules, session levels, and styles all in one place.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start text-gray-700">
                  <span className="font-bold mr-3 mt-0.5" style={{ color: '#466d60' }}>✓</span>
                  <span>Teacher profiles with bios and photos</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="font-bold mr-3 mt-0.5" style={{ color: '#466d60' }}>✓</span>
                  <span>Filter by level (Beginner to Advanced)</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="font-bold mr-3 mt-0.5" style={{ color: '#466d60' }}>✓</span>
                  <span>Session capacity and booking tracking</span>
                </li>
              </ul>
            </div>

            {/* Music Festivals */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4" style={{ borderTopColor: '#edb75b' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: '#edb75b15' }}>
                <Music className="w-6 h-6" style={{ color: '#edb75b' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Music Festivals</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Handle complex multi-stage lineups with hundreds of sessions. Keep your audience informed with real-time schedule updates.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start text-gray-700">
                  <span className="font-bold mr-3 mt-0.5" style={{ color: '#edb75b' }}>✓</span>
                  <span>Multi-stage and multi-day support</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="font-bold mr-3 mt-0.5" style={{ color: '#edb75b' }}>✓</span>
                  <span>Filter by stage, genre, or artist</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="font-bold mr-3 mt-0.5" style={{ color: '#edb75b' }}>✓</span>
                  <span>Mobile-first design for festival-goers</span>
                </li>
              </ul>
            </div>

            {/* Conferences */}
            <div className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4" style={{ borderTopColor: '#2a468b' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-6" style={{ backgroundColor: '#2a468b15' }}>
                <Briefcase className="w-6 h-6" style={{ color: '#2a468b' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Conferences & Workshops</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Organize breakout sessions, keynotes, and networking events. Track attendance and manage multiple tracks effortlessly.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start text-gray-700">
                  <span className="font-bold mr-3 mt-0.5" style={{ color: '#2a468b' }}>✓</span>
                  <span>Track sessions across multiple rooms</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="font-bold mr-3 mt-0.5" style={{ color: '#2a468b' }}>✓</span>
                  <span>Speaker management and bios</span>
                </li>
                <li className="flex items-start text-gray-700">
                  <span className="font-bold mr-3 mt-0.5" style={{ color: '#2a468b' }}>✓</span>
                  <span>Capacity limits and waitlists</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {PAYMENTS_ENABLED ? 'Simple, transparent pricing' : 'Your First 5 Events Are On Us'}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {PAYMENTS_ENABLED 
                ? 'Start free and upgrade when you need more. No hidden fees.'
                : 'Get Pro features completely free during Early Access. No credit card required.'}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Free */}
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-gray-600" />
                </div>
                <CardTitle>Free</CardTitle>
                <p className="text-gray-500 text-sm">Best for trying out Flow Grid</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">€0</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 1 published event
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Unlimited sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Custom colors & logo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> QR code poster
                  </li>
                </ul>
                <Link href="/auth/signin">
                  <Button variant="outline" className="w-full">Get Started Free</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Event Pass */}
            <Card className="relative hover:shadow-lg transition-shadow border-2" style={{ borderColor: '#ff7119' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-md" style={{ backgroundColor: '#ff7119' }}>
                  {PAYMENTS_ENABLED ? 'One-Time' : 'Included Free'}
                </span>
              </div>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#ff711915' }}>
                  <Ticket className="w-6 h-6" style={{ color: '#ff7119' }} />
                </div>
                <CardTitle>Event Pass</CardTitle>
                <p className="text-gray-500 text-sm">Unlock 1 additional event</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  {PAYMENTS_ENABLED ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">€69</span>
                      <span className="text-gray-500"> one-time</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-400 line-through">€69</span>
                      <span className="text-4xl font-bold text-green-600 ml-2">Free</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 1 published event
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Google Fonts
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Basic analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Yours forever
                  </li>
                </ul>
                <Link href={PAYMENTS_ENABLED ? "/pricing" : "/auth/signin"}>
                  <Button className="w-full text-white" style={{ backgroundColor: '#ff7119' }}>
                    {PAYMENTS_ENABLED ? 'View Details' : 'Get Early Access'} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro - Highlighted */}
            <Card className="relative border-2 hover:shadow-xl transition-shadow" style={{ borderColor: '#b40225' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="text-white text-sm font-semibold px-4 py-1.5 rounded-full shadow-md" style={{ backgroundColor: '#b40225' }}>
                  {PAYMENTS_ENABLED ? 'Most Popular' : '5 Free Events'}
                </span>
              </div>
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" style={{ color: '#b40225' }} />
                </div>
                <CardTitle>Pro</CardTitle>
                <p className="text-gray-500 text-sm">For serious event organizers</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  {PAYMENTS_ENABLED ? (
                    <>
                      <span className="text-4xl font-bold text-gray-900">€29</span>
                      <span className="text-gray-500">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-bold text-gray-400 line-through">€29/mo</span>
                      <span className="text-4xl font-bold text-green-600 ml-2">Free</span>
                    </>
                  )}
                </div>
                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Up to 5 published events
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Watermark removed
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Embed widget & duplicate
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Detailed analytics & export
                  </li>
                </ul>
                <Link href={PAYMENTS_ENABLED ? "/pricing" : "/auth/signin"}>
                  <Button className="w-full text-white" style={{ backgroundColor: '#b40225' }}>
                    {PAYMENTS_ENABLED ? 'View Details' : 'Get Early Access'} <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise */}
            <Card className="relative hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: '#466d6015' }}>
                  <Briefcase className="w-6 h-6" style={{ color: '#466d60' }} />
                </div>
                <CardTitle>Enterprise</CardTitle>
                <p className="text-gray-500 text-sm">For agencies & organizations</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">Custom</span>
                </div>
                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Unlimited events
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> White-label & custom domain
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Team collaboration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> Dedicated support
                  </li>
                </ul>
                <Link href="/contact/sales">
                  <Button variant="outline" className="w-full">Contact Sales</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1">
              Compare all features <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Articles Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Learn from Event Experts
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Practical guides and tips from organizers who've been there.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Article 1 */}
            <Link href="/blog/get-festival-live-10-minutes" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>Quick Start</span>
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    Get Your First Event Live in 10 Minutes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Skip the complexity. Create your event schedule in minutes, not days.
                  </p>
                  <span className="inline-flex items-center text-blue-600 font-medium mt-4 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Article 2 */}
            <Link href="/blog/hidden-costs-manual-event-scheduling" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span>Budget & ROI</span>
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    Hidden Costs of Manual Event Scheduling
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    That "free" spreadsheet might be costing you thousands. Here's how to calculate the true price.
                  </p>
                  <span className="inline-flex items-center text-blue-600 font-medium mt-4 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>

            {/* Article 3 */}
            <Link href="/blog/how-to-create-yoga-retreat-schedule" className="group">
              <Card className="h-full hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <CardHeader>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Heart className="w-4 h-4 text-pink-600" />
                    <span>Retreat Planning</span>
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">
                    How to Create the Perfect Yoga Retreat Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Balance practice, rest & community with proven retreat scheduling strategies.
                  </p>
                  <span className="inline-flex items-center text-blue-600 font-medium mt-4 group-hover:gap-2 transition-all">
                    Read more <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link href="/blog">
              <Button variant="outline" size="lg" className="text-lg">
                View All Articles <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#2a468b] to-[#466d60]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Stop planning in spreadsheets. Start today.
          </h2>
          <p className="text-xl text-blue-100 mb-4">
            Free to start. No credit card required.
          </p>
          <p className="text-lg text-blue-200 mb-8">
            Join event organizers who've saved hours of scheduling headaches.
          </p>
          <Link href="/auth/signin">
            <Button size="lg" className="bg-[#ff7119] hover:bg-[#b40225] text-white text-lg px-8 py-3 shadow-xl">
              Create Your First Schedule <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}