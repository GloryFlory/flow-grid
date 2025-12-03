'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  Sparkles
} from 'lucide-react'
import Footer from '@/components/Footer'

type FormStep = 'form' | 'booking' | 'success'

export default function SalesContactPage() {
  const [step, setStep] = useState<FormStep>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [inquiryId, setInquiryId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    festivalsPerYear: '',
    typicalFestivalSize: '',
    currentSolution: '',
    biggestChallenge: '',
    timeline: '',
    additionalNotes: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/sales/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          source: 'sales_page'
        })
      })

      if (res.ok) {
        const data = await res.json()
        setInquiryId(data.inquiryId)
        setStep('booking')
      } else {
        alert('There was a problem submitting your inquiry. Please try again.')
      }
    } catch (err) {
      console.error('Submit error:', err)
      alert('There was a problem submitting your inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const skipBooking = () => {
    setStep('success')
  }

  // Load Cal.com embed when on booking step
  useEffect(() => {
    if (step === 'booking') {
      // Use Cal.com's recommended initialization pattern
      (function (C: any, A: string, L: string) {
        let p = function (a: any, ar: any) { a.q.push(ar); };
        let d = C.document;
        C.Cal = C.Cal || function () {
          let cal = C.Cal;
          let ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api: any = function () { p(api, arguments); };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else {
              p(cal, ar);
            }
            return;
          }
          p(cal, ar);
        };
      })(window, "https://app.cal.com/embed/embed.js", "init");

      // @ts-ignore
      window.Cal("init", "30min", { origin: "https://app.cal.com" });

      // @ts-ignore
      window.Cal.ns["30min"]("inline", {
        elementOrSelector: "#cal-inline-embed",
        config: { 
          layout: "month_view",
          name: formData.name,
          email: formData.email,
        },
        calLink: "flow-grid/30min",
      });

      // @ts-ignore
      window.Cal.ns["30min"]("ui", {
        hideEventTypeDetails: false,
        layout: "month_view"
      });
    }
  }, [step, formData.name, formData.email])

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Link href="/">
                <img 
                  src="/flow-grid-logo.png" 
                  alt="Flow Grid Logo" 
                  className="h-10 w-auto cursor-pointer"
                />
              </Link>
              <Link href="/">
                <span className="ml-3 text-2xl font-bold text-gray-900 cursor-pointer hover:text-purple-600 transition-colors">Flow Grid</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/pricing">
                <Button variant="outline">View Pricing</Button>
              </Link>
              <Link href="/auth/signin">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back link */}
        <Link href="/pricing" className="inline-flex items-center text-purple-600 hover:text-purple-700 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pricing
        </Link>

        {step === 'form' && (
          <>
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                Enterprise Solutions
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Tell us about your organization and scheduling needs. We'll prepare a customized solution for you.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg border">
                <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">Unlimited events & users</span>
              </div>
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg border">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">Custom integrations</span>
              </div>
              <div className="flex items-center gap-3 bg-white p-4 rounded-lg border">
                <Clock className="w-5 h-5 text-purple-600 flex-shrink-0" />
                <span className="text-sm text-gray-700">Dedicated support</span>
              </div>
            </div>

            {/* Form */}
            <Card>
              <CardHeader>
                <CardTitle>Tell us about your needs</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Information</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="John Smith"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Work Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                          Company / Organization *
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          required
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="Acme Events Inc."
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                        Your Role
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="">Select your role...</option>
                        <option value="event-manager">Event Manager</option>
                        <option value="operations-director">Operations Director</option>
                        <option value="event-organizer">Event Organizer</option>
                        <option value="producer">Producer</option>
                        <option value="founder-ceo">Founder / CEO</option>
                        <option value="marketing">Marketing</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Qualifying Questions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">About Your Events</h3>
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="festivalsPerYear" className="block text-sm font-medium text-gray-700 mb-1">
                          How many events per year?
                        </label>
                        <select
                          id="festivalsPerYear"
                          name="festivalsPerYear"
                          value={formData.festivalsPerYear}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select...</option>
                          <option value="1-5">1-5 events</option>
                          <option value="6-10">6-10 events</option>
                          <option value="11-20">11-20 events</option>
                          <option value="20+">20+ events</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="typicalFestivalSize" className="block text-sm font-medium text-gray-700 mb-1">
                          Typical event size (sessions)?
                        </label>
                        <select
                          id="typicalFestivalSize"
                          name="typicalFestivalSize"
                          value={formData.typicalFestivalSize}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select...</option>
                          <option value="under-50">Under 50 sessions</option>
                          <option value="50-100">50-100 sessions</option>
                          <option value="100-200">100-200 sessions</option>
                          <option value="200+">200+ sessions</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="currentSolution" className="block text-sm font-medium text-gray-700 mb-1">
                          What do you use currently?
                        </label>
                        <select
                          id="currentSolution"
                          name="currentSolution"
                          value={formData.currentSolution}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select...</option>
                          <option value="spreadsheets">Spreadsheets (Excel/Sheets)</option>
                          <option value="paper">Paper schedules</option>
                          <option value="other-software">Other scheduling software</option>
                          <option value="custom-built">Custom-built solution</option>
                          <option value="nothing">Nothing yet</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-1">
                          When do you need a solution?
                        </label>
                        <select
                          id="timeline"
                          name="timeline"
                          value={formData.timeline}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="">Select...</option>
                          <option value="immediately">Immediately</option>
                          <option value="1-month">Within 1 month</option>
                          <option value="1-3-months">1-3 months</option>
                          <option value="3-6-months">3-6 months</option>
                          <option value="just-exploring">Just exploring options</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="biggestChallenge" className="block text-sm font-medium text-gray-700 mb-1">
                        What's your biggest scheduling challenge?
                      </label>
                      <textarea
                        id="biggestChallenge"
                        name="biggestChallenge"
                        rows={3}
                        value={formData.biggestChallenge}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="e.g., Managing last-minute changes, coordinating across multiple venues, keeping attendees informed..."
                      />
                    </div>

                    <div>
                      <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                        Anything else we should know?
                      </label>
                      <textarea
                        id="additionalNotes"
                        name="additionalNotes"
                        rows={2}
                        value={formData.additionalNotes}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Special requirements, integrations needed, etc."
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-purple-600 hover:bg-purple-700 py-3 text-lg"
                    >
                      {isSubmitting ? 'Submitting...' : 'Continue to Book a Call'}
                    </Button>
                    <p className="text-sm text-gray-500 text-center mt-3">
                      We'll review your needs and prepare a customized demo for you.
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {step === 'booking' && (
          <>
            {/* Booking Step */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Thanks, {formData.name.split(' ')[0]}!
              </h1>
              <p className="text-xl text-gray-600">
                Your inquiry has been received. Book a call to discuss your needs.
              </p>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Schedule a Discovery Call
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Cal.com Inline Embed */}
                <div 
                  id="cal-inline-embed" 
                  className="w-full min-h-[600px] overflow-auto rounded-lg"
                />
                
                <div className="mt-6 flex justify-center">
                  <Button
                    variant="outline"
                    onClick={skipBooking}
                  >
                    Skip for now - I'll wait for your email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <p className="text-center text-gray-500 text-sm">
              Don't worry if no times work for you - we'll reach out within 24 hours to find a time that suits.
            </p>
          </>
        )}

        {step === 'success' && (
          <>
            {/* Success State */}
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                We've received your inquiry!
              </h1>
              <p className="text-xl text-gray-600 max-w-lg mx-auto mb-8">
                Our team will review your needs and reach out within 24 hours to schedule a personalized demo.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/">
                  <Button variant="outline">
                    Back to Home
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Try Flow Grid Free
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}
