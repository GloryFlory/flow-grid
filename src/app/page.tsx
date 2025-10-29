import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar, 
  Users, 
  BarChart3, 
  Clock, 
  DollarSign, 
  Zap,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Image 
                  src="/flow-grid-logo.png" 
                  alt="Flow Grid Logo" 
                  width={40} 
                  height={40}
                  className="h-10 w-auto"
                  priority
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
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Transform Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#edb75b] to-[#ff7119]">Festival</span> Into a Seamless Experience
            </h1>
            <p className="text-xl text-gray-100 mb-8 max-w-3xl mx-auto">
              Flow Grid helps festivals, retreats, and events create beautiful schedules and manage their event details with professional-grade tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3 bg-[#ff7119] hover:bg-[#b40225] text-white">
                  Get Started <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/flow-grid-demo/schedule" target="_blank">
                <Button size="lg" className="text-lg px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white hover:text-[#2a468b]">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to run successful events
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From manual session creation to beautiful public schedules, Flow Grid handles your event scheduling needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Calendar className="w-12 h-12 mb-4" style={{ color: '#2a468b' }} />
                <CardTitle>Smart Schedule Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Create sessions manually with an intuitive interface. Our intelligent system helps you organize multi-day events with ease.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Users className="w-12 h-12 mb-4" style={{ color: '#466d60' }} />
                <CardTitle>Teacher Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Manage teacher profiles with photos, crop images perfectly, and showcase your instructors beautifully in session cards.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="w-12 h-12 mb-4" style={{ color: '#edb75b' }} />
                <CardTitle>Analytics Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Track your festivals and sessions with basic analytics. Advanced booking metrics coming soon!
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="w-12 h-12 mb-4" style={{ color: '#ff7119' }} />
                <CardTitle>Public Schedule View</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Beautiful, responsive schedule pages for attendees with filtering by day, teacher, style, and level.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <DollarSign className="w-12 h-12 mb-4" style={{ color: '#2a468b' }} />
                <CardTitle>Multi-Festival Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Manage multiple festivals from one dashboard. Each festival gets its own unique URL and branding.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="w-12 h-12 text-yellow-600 mb-4" />
                <CardTitle>Custom Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Customize colors, logos, and styling to match your festival's unique brand identity.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#2a468b] to-[#466d60]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to transform your next event?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join event organizers who use Flow Grid to create beautiful festival schedules.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="bg-[#ff7119] hover:bg-[#b40225] text-white text-lg px-8 py-3">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Image 
                  src="/flow-grid-logo.png" 
                  alt="Flow Grid" 
                  width={32} 
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="ml-3 text-xl font-bold text-white">Flow Grid</span>
              </div>
              <p className="text-gray-400">
                The complete solution for festival and retreat scheduling.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/flow-grid-demo/schedule" className="hover:text-white transition-colors">View Demo</Link></li>
                <li><Link href="/glossary" className="hover:text-white transition-colors">Glossary</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/glossary" className="hover:text-white transition-colors">Glossary</Link></li>
                <li><Link href="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center">
              <p>&copy; 2025 Flow Grid. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 sm:mt-0">
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}