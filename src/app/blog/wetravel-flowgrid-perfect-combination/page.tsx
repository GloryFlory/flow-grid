import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Calendar, CreditCard, Users, Clock, Globe, Smartphone, Zap, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'WeTravel + FlowGrid: The Perfect End-to-End Solution for Retreat & Festival Organizers | Flow Grid',
  description: 'Discover how WeTravel (for payments & bookings) and FlowGrid (for schedules) work together to create a seamless experience for multi-day events, wellness retreats, and festivals.',
  openGraph: {
    title: 'WeTravel + FlowGrid: The Perfect End-to-End Solution for Retreat & Festival Organizers',
    description: 'Discover how WeTravel (for payments & bookings) and FlowGrid (for schedules) work together to create a seamless experience for multi-day events, wellness retreats, and festivals.',
    type: 'article',
  },
}

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Calendar className="w-4 h-4" />
            <time>December 27, 2024</time>
            <span className="mx-2">•</span>
            <span>9 min read</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            WeTravel + FlowGrid: The Perfect End-to-End Solution for Retreat & Festival Organizers
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            Running multi-day events means juggling registrations, payments, schedules, and participant communication. Here's how WeTravel and FlowGrid work together to transform chaos into a seamless, professional experience.
          </p>
        </div>

        {/* The Problem */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Challenge Every Event Organizer Faces</h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            You've spent months planning the perfect wellness retreat, yoga festival, or workshop series. The sessions are curated, teachers are confirmed, venue is booked. But then reality hits:
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-red-600 mt-1">❌</span>
                <span><strong>Payment chaos:</strong> Manual invoicing, chasing international wire transfers, high credit card fees eating into your margins</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 mt-1">❌</span>
                <span><strong>Schedule nightmares:</strong> Static PDFs that participants can't read on mobile, last-minute changes requiring new documents</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 mt-1">❌</span>
                <span><strong>Communication overload:</strong> Endless emails about "What time is the yoga session?" and "Where do I find the schedule?"</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-red-600 mt-1">❌</span>
                <span><strong>Registration complexity:</strong> Spreadsheets to track who paid, who needs a refund, what room they're in</span>
              </li>
            </ul>
          </div>

          <p className="text-gray-700 leading-relaxed">
            Sound familiar? You're not alone. Most event organizers patch together 5-7 different tools (payment processor, booking system, schedule builder, email platform, spreadsheets...) and spend more time managing software than creating amazing experiences.
          </p>
        </section>

        {/* The Solution */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Solution: Two Tools That Work Better Together</h2>
          
          <p className="text-gray-700 leading-relaxed mb-8">
            Instead of juggling a dozen platforms, you only need two specialized tools that each do one thing brilliantly—and work seamlessly together:
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* WeTravel Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">WeTravel</h3>
              </div>
              <p className="text-gray-700 mb-4">
                <strong>What it does:</strong> Handles everything before and after your event—payments, registrations, booking management, participant details, and refunds.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Accept payments in 34 currencies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Flexible payment plans (deposits, installments)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Collect participant information & waivers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Room assignment & inventory management</span>
                </div>
              </div>
            </div>

            {/* FlowGrid Card */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-8 h-8 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">FlowGrid</h3>
              </div>
              <p className="text-gray-700 mb-4">
                <strong>What it does:</strong> Handles everything during your event—beautiful schedules, session management, real-time updates, and attendee experience.
              </p>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Mobile-first interactive schedules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Real-time session updates & changes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Teacher/facilitator profiles & bios</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span>Session capacity & booking tracking</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
            <p className="text-gray-900 font-semibold mb-2">💡 Think of it this way:</p>
            <p className="text-gray-700">
              <strong>WeTravel</strong> gets people registered and paid. <strong>FlowGrid</strong> tells them where to be and when once they arrive. Together, they create a seamless journey from "interested" to "attending" to "amazing experience."
            </p>
          </div>
        </section>

        {/* Why WeTravel */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why WeTravel Excels at Payments & Bookings</h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Used by over 8,000 travel businesses worldwide, WeTravel solves the hardest part of multi-day events: getting paid efficiently and managing international participants.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                <Globe className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Global Payments, Local Fees</h3>
                <p className="text-gray-700 mb-3">
                  Price your retreat in USD, EUR, GBP, or any of 34 currencies while participants pay in <em>their</em> local currency. No foreign exchange headaches for you or them.
                </p>
                <ul className="space-y-2 text-gray-600 ml-6">
                  <li className="list-disc">Fee-free bank transfers (ACH, SEPA, BECS) in supported regions</li>
                  <li className="list-disc">Industry-low credit card rates (1.5%-2.9% depending on region)</li>
                  <li className="list-disc">Option to pass fees to participants transparently</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Flexible Payment Plans</h3>
                <p className="text-gray-700 mb-3">
                  Make your $2,000 retreat accessible with payment plans: deposit upfront, installments over time, automated billing reminders.
                </p>
                <p className="text-gray-600 italic">
                  "We've seen a 50% increase in sales since using WeTravel's flexible payment options." — Matteo Troiani, Be In Italy
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Booking Management</h3>
                <p className="text-gray-700 mb-3">
                  Collect custom information (dietary restrictions, room preferences, emergency contacts), manage room inventory, send automated emails, and track everything in one dashboard.
                </p>
                <ul className="space-y-2 text-gray-600 ml-6">
                  <li className="list-disc">Customizable registration forms & questionnaires</li>
                  <li className="list-disc">eSignature collection for waivers</li>
                  <li className="list-disc">Add-ons (spa treatments, excursions, equipment rentals)</li>
                  <li className="list-disc">Participant manifest export for on-site coordination</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-full p-3 flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Partner Network & Supplier Payments</h3>
                <p className="text-gray-700">
                  Pay retreat centers, yoga teachers, tour guides, and other partners directly through WeTravel with low-fee transfers. No more juggling Venmo, PayPal, and international wires.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why FlowGrid */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Why FlowGrid Excels at Schedules & Experience</h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Once participants are registered (thanks to WeTravel), they need to know what's happening when. FlowGrid makes your event schedule the best part of the experience.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Mobile-First, Always Beautiful</h3>
                <p className="text-gray-700 mb-3">
                  80% of attendees check schedules on their phones. FlowGrid's responsive design works perfectly on any device—no pinching, zooming, or squinting at tiny PDFs.
                </p>
                <ul className="space-y-2 text-gray-600 ml-6">
                  <li className="list-disc">Day tabs for easy navigation across multi-day events</li>
                  <li className="list-disc">Session cards with all key info (time, teacher, location, capacity)</li>
                  <li className="list-disc">One tap to see full session details</li>
                  <li className="list-disc">Search & filter to find exactly what you're looking for</li>
                </ul>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Updates (No Re-Printing)</h3>
                <p className="text-gray-700 mb-3">
                  Teacher gets sick? Room changes? Add a surprise session? Update once in FlowGrid, and everyone sees it instantly. No more printing 200 updated PDFs.
                </p>
                <p className="text-gray-600 italic">
                  "We made 15 last-minute changes during our 5-day festival. With FlowGrid, nobody missed a thing." — Sarah K., Yoga Festival Organizer
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Teacher/Facilitator Profiles</h3>
                <p className="text-gray-700 mb-3">
                  Give your teachers the spotlight they deserve. Professional profiles with photos, bios, and all their sessions in one place. Participants can explore who they'll learn from.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Session Capacity & Bookings</h3>
                <p className="text-gray-700 mb-3">
                  Track which sessions are filling up with real-time capacity indicators ("5 spots left", "FULL", "Waitlist available"). Participants can register for specific sessions if needed.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-purple-100 rounded-full p-3 flex-shrink-0">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Setup in Under 10 Minutes</h3>
                <p className="text-gray-700">
                  Upload your schedule via CSV, customize colors and logo, publish. That's it. No technical skills needed, no developer required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How They Work Together */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How WeTravel + FlowGrid Work Together</h2>
          
          <p className="text-gray-700 leading-relaxed mb-8">
            Here's the magic: these tools don't overlap—they complement each other perfectly. Here's a real-world workflow:
          </p>

          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 border border-purple-200 rounded-lg p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Create Your Retreat in WeTravel</h3>
                  <p className="text-gray-700">Set up your trip page with dates, pricing, itinerary overview, photos. Add payment plans, collect custom information, set room inventory.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Promote & Accept Registrations</h3>
                  <p className="text-gray-700">Share your WeTravel booking link via email, social media, your website. Participants book, pay deposits, receive confirmation emails automatically.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Build Your Schedule in FlowGrid</h3>
                  <p className="text-gray-700">Upload your detailed day-by-day schedule (CSV or manual entry). Add teacher profiles, session descriptions, locations, capacity limits.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Share Your FlowGrid Schedule</h3>
                  <p className="text-gray-700">Add your FlowGrid schedule link to WeTravel's trip page, confirmation emails, and pre-event reminders. Participants can explore before they arrive.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">5</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">During the Event</h3>
                  <p className="text-gray-700">Participants check FlowGrid daily on their phones. You make real-time updates as needed. Everyone stays informed without constant announcements.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">6</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Post-Event Analytics</h3>
                  <p className="text-gray-700">WeTravel shows you booking data, revenue, and refunds. FlowGrid shows you which sessions were most popular, total views, peak engagement times.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <p className="text-gray-900 font-semibold mb-2">💡 Pro Tip: Embed Your Schedule</p>
            <p className="text-gray-700">
              Add your FlowGrid schedule URL to WeTravel's automated confirmation emails, so every participant gets the schedule link the moment they book. Zero extra work for you.
            </p>
          </div>
        </section>

        {/* Real-World Example */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Real-World Example: 7-Day Wellness Retreat in Bali</h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            Let's see this in action with a concrete example:
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Event Details</h3>
            <ul className="space-y-2 text-gray-700">
              <li>📍 <strong>Location:</strong> Ubud, Bali</li>
              <li>📅 <strong>Duration:</strong> 7 days, 6 nights</li>
              <li>👥 <strong>Capacity:</strong> 30 participants</li>
              <li>💰 <strong>Price:</strong> $2,500 USD per person</li>
              <li>🧘 <strong>Activities:</strong> 42 sessions across yoga, meditation, workshops, excursions</li>
            </ul>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                What WeTravel Handles:
              </h4>
              <ul className="space-y-2 text-gray-700 ml-6">
                <li className="list-disc">Registration page with beautiful photos and retreat description</li>
                <li className="list-disc">Payment plan: $500 deposit + 3 monthly installments of $666</li>
                <li className="list-disc">Collect dietary restrictions, yoga experience level, room preferences</li>
                <li className="list-disc">Automated payment reminders sent 1 week before each installment</li>
                <li className="list-disc">Manage room assignments (singles, doubles, shared)</li>
                <li className="list-disc">Add-ons: Private massages ($80), airport transfers ($50), surfing lesson ($120)</li>
                <li className="list-disc">Send pre-departure emails with packing list and travel info</li>
                <li className="list-disc">Process $75,000 in revenue with 1.5% average fee (vs 2.9% with PayPal)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                What FlowGrid Handles:
              </h4>
              <ul className="space-y-2 text-gray-700 ml-6">
                <li className="list-disc">Daily schedule with 6-8 sessions per day</li>
                <li className="list-disc">4 teacher profiles with photos and bios</li>
                <li className="list-disc">Session details: "Morning Vinyasa Flow - 7:00 AM - Main Shala - All Levels - 30 capacity"</li>
                <li className="list-disc">Track which workshops are filling up ("Breathwork Circle: 5 spots left")</li>
                <li className="list-disc">Real-time update when afternoon hike gets moved due to rain</li>
                <li className="list-disc">Mobile schedule accessible on retreat center WiFi and personal hotspots</li>
                <li className="list-disc">Post-retreat analytics: "Sunset Meditation" was viewed 127 times, most popular session</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
            <p className="text-gray-900 font-semibold mb-2">📊 Results:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>Time saved:</strong> 15+ hours not spent on payment follow-ups and schedule questions</li>
              <li>• <strong>Revenue increased:</strong> 40% booking conversion (vs 25% previous year with generic forms)</li>
              <li>• <strong>Participant satisfaction:</strong> 28 out of 30 participants rated schedule accessibility 5/5</li>
              <li>• <strong>Reduced printing costs:</strong> Zero printed schedules needed, saved $200+</li>
            </ul>
          </div>
        </section>

        {/* Pricing Comparison */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What It Costs (Transparent Pricing)</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* WeTravel Pricing */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-600" />
                WeTravel Pricing
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Platform fee:</strong> Varies by plan (contact for quote)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Payment processing:</strong> 1.5-2.9% for cards (region-dependent)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Bank transfers:</strong> 0% (ACH, SEPA, PIX, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Option:</strong> Pass fees to participants transparently</span>
                </li>
              </ul>
              <a 
                href="https://product.wetravel.com/request-a-demo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="mt-4 inline-block"
              >
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Get WeTravel Demo
                </Button>
              </a>
            </div>

            {/* FlowGrid Pricing */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                FlowGrid Pricing
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Free:</strong> First 5 events with all Pro features</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Pro:</strong> $29/month or $290/year after trial</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Includes:</strong> Unlimited sessions, custom branding, analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span><strong>No hidden fees:</strong> One flat monthly price, no per-attendee charges</span>
                </li>
              </ul>
              <Link href="/auth/signin">
                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">
                  Start Free with FlowGrid
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-gray-900 font-semibold mb-2">💰 Total Cost Example (30-person retreat, $75,000 revenue):</p>
            <ul className="space-y-2 text-gray-700">
              <li>• <strong>WeTravel:</strong> ~$1,500-2,000 (payment processing + platform fee)</li>
              <li>• <strong>FlowGrid:</strong> $29/month (one event) = <strong>Total: ~$1,530-2,030</strong></li>
              <li>• <strong>Old way</strong> (Stripe + Google Forms + PDF): ~$2,500+ in fees + 20 hours of manual work</li>
              <li className="text-green-700 font-semibold pt-2">💚 You save: $500+ and 15-20 hours of admin time</li>
            </ul>
          </div>
        </section>

        {/* Who This Is For */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Who Should Use This Combination?</h2>
          
          <p className="text-gray-700 leading-relaxed mb-6">
            The WeTravel + FlowGrid pairing works brilliantly for:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">✅ Perfect For:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Wellness retreats</strong> (yoga, meditation, detox)</li>
                <li>• <strong>Multi-day festivals</strong> (dance, music, arts)</li>
                <li>• <strong>Workshop series</strong> (3-7 day immersives)</li>
                <li>• <strong>Educational programs</strong> (courses, trainings, teacher certifications)</li>
                <li>• <strong>Adventure tours</strong> with daily itineraries</li>
                <li>• <strong>Conference organizers</strong> with breakout sessions</li>
              </ul>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">🎯 Ideal Event Size:</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>15-500 participants</strong></li>
                <li>• <strong>3+ days</strong> duration</li>
                <li>• <strong>10+ sessions</strong> to manage</li>
                <li>• <strong>$500+ ticket price</strong> (payment plans helpful)</li>
                <li>• <strong>International attendees</strong> (multi-currency useful)</li>
                <li>• <strong>Mobile-first audience</strong> (millennials/Gen Z)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">How to Get Started</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-purple-200 rounded-lg p-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sign up for WeTravel</h3>
                  <p className="text-gray-700 mb-2">
                    Book a demo to discuss your specific needs, event size, and get custom pricing.
                  </p>
                  <a 
                    href="https://product.wetravel.com/request-a-demo" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Request WeTravel Demo →
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Start FlowGrid for Free</h3>
                  <p className="text-gray-700 mb-2">
                    No credit card required. Create your first event, upload your schedule, and see how it looks on mobile.
                  </p>
                  <Link href="/auth/signin" className="text-purple-600 hover:underline font-medium">
                    Create Free FlowGrid Account →
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Connect the Two</h3>
                  <p className="text-gray-700">
                    Add your FlowGrid schedule link to your WeTravel trip page, confirmation emails, and pre-event communications. That's it—you're done!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Stop Juggling Tools. Start Creating Better Experiences.</h2>
            <p className="text-xl text-blue-100 mb-6">
              Join thousands of retreat organizers and festival creators who've simplified their operations with WeTravel + FlowGrid.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/auth/signin">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                  Try FlowGrid Free
                </Button>
              </Link>
              <a 
                href="https://product.wetravel.com/request-a-demo" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Get WeTravel Demo
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Related Articles */}
        <section className="border-t border-gray-200 pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Articles</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/blog/get-festival-live-10-minutes" className="text-blue-600 hover:underline">
              → Get Your Festival Live in 10 Minutes
            </Link>
            <Link href="/blog/festival-schedule-template-guide" className="text-blue-600 hover:underline">
              → Festival Schedule Template Guide
            </Link>
            <Link href="/blog/spreadsheet-vs-scheduling-software" className="text-blue-600 hover:underline">
              → Spreadsheets vs. Scheduling Software
            </Link>
          </div>
        </section>
      </article>

      <Footer />
    </div>
  )
}
