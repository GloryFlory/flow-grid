import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, MessageCircle, Clock, MapPin, HelpCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/flow-grid-logo.png" alt="Flow Grid Logo" className="h-10 w-auto" />
            <h1 className="ml-3 text-2xl font-bold">Contact Flow Grid</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin"><Button variant="outline">Sign In</Button></Link>
            <Link href="/auth/signup"><Button>Get Started</Button></Link>
          </div>
        </header>
        <div className="mb-4">
          <p className="text-xl text-gray-600">
            Get in touch with our team — we're here to help with your festival scheduling needs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
                    <p className="text-gray-600">
                      We typically respond within 24 hours during business days (Monday-Friday)
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <MapPin className="w-6 h-6 text-blue-600 mt-1" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                    <p className="text-gray-600">
                      Sliema, Malta<br />
                      Central European Time (CET/CEST)
                    </p>
                  </div>
                </div>
              </div>

            <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
                <HelpCircle className="w-5 h-5 mr-2" />
                Before You Contact Us
              </h3>
              <p className="text-blue-800 mb-3">
                Check our resources for quick answers:
              </p>
              <div className="space-y-2">
                <Link href="/help" className="block text-blue-600 hover:text-blue-500 font-medium">
                  → Help Center & FAQ
                </Link>
                <Link href="/glossary" className="block text-blue-600 hover:text-blue-500 font-medium">
                  → Glossary
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send Us a Message</h2>
            
            <form id="contact-form" className="space-y-6" onSubmit={async (e) => {
              e.preventDefault()
              const form = e.currentTarget as HTMLFormElement
              const fd = new FormData(form)
              const payload = Object.fromEntries(fd.entries())

              // Submit to the API route
              try {
                const res = await fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                })

                if (res.ok) {
                  alert('Message sent — thank you! We will respond as soon as possible.')
                  form.reset()
                } else {
                  const data = await res.json()
                  console.error('Contact API error:', data)
                  alert('There was a problem sending your message. Please try again later.')
                }
              } catch (err) {
                console.error('Contact submit error', err)
                alert('There was a problem sending your message. Please try again later.')
              }
            }}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a subject...</option>
                  <option value="technical-support">Technical Support</option>
                  <option value="feature-request">Feature Request</option>
                  <option value="bug-report">Bug Report</option>
                  <option value="account-help">Account Help</option>
                  <option value="business-inquiry">Business Inquiry</option>
                  <option value="feedback">General Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="festival-url" className="block text-sm font-medium text-gray-700 mb-2">
                  Festival URL (if applicable)
                </label>
                <input
                  type="url"
                  id="festival-url"
                  name="festival-url"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://yourfestival.tryflowgrid.com"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Include this if your question is about a specific festival
                </p>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please describe your question or issue in detail. The more information you provide, the better we can help you."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Messages submitted via this form will be forwarded to the site owner for now.
                </p>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Send Message
              </Button>
            </form>

            <div className="mt-8 p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What to Include in Your Message
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>Detailed description</strong> of your question or issue</li>
                <li>• <strong>Steps you've already tried</strong> (if troubleshooting)</li>
                <li>• <strong>Your browser and device</strong> (for technical issues)</li>
                <li>• <strong>Screenshots or error messages</strong> (if relevant)</li>
                <li>• <strong>Your festival URL</strong> (if question is festival-specific)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
            Additional Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Help Center</h3>
              <p className="text-gray-600 mb-4">
                Browse our comprehensive FAQ and troubleshooting guides
              </p>
              <Link href="/help">
                <Button variant="outline" size="sm">
                  Visit Help Center
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Glossary</h3>
              <p className="text-gray-600 mb-4">
                Definitions and terms used across Flow Grid
              </p>
              <Link href="/glossary">
                <Button variant="outline" size="sm">
                  View Glossary
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Community Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Join the Flow Grid Community
          </h2>
          <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
            Stay updated with new features, get tips from other festival organizers, 
            and share your success stories with the Flow Grid community.
          </p>
          <div className="space-x-4">
            <Button variant="outline" disabled className="cursor-not-allowed">
              Join Newsletter (Coming Soon)
            </Button>
            <Button variant="outline" disabled className="cursor-not-allowed">
              Community Forum (Coming Soon)
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}