import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, MessageCircle, Clock, MapPin, HelpCircle } from 'lucide-react'
import ContactForm from '@/components/ContactForm'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <img 
                  src="/flow-grid-logo.png" 
                  alt="Flow Grid Logo" 
                  className="h-10 w-auto"
                />
                <span className="ml-3 text-2xl font-bold text-gray-900">Flow Grid</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
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
            
            <ContactForm />

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