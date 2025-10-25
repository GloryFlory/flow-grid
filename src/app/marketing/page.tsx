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
  Check,
  ArrowRight
} from 'lucide-react'

export default function MarketingPage() {
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
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
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

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-gray-600">
              Start free, upgrade as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <div className="text-4xl font-bold">$0<span className="text-lg text-gray-600">/month</span></div>
                <p className="text-gray-600">Perfect for small events</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>1 festival</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Unlimited sessions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Teacher management</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Basic analytics</span>
                  </div>
                </div>
                <Link href="/auth/signup?plan=free" className="block">
                  <Button variant="outline" className="w-full">
                    Get Started
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="relative border-2 border-blue-500">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold">$29<span className="text-lg text-gray-600">/month</span></div>
                <p className="text-gray-600">For growing festivals</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Up to 5 festivals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Custom branding</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Booking system (coming soon)</span>
                  </div>
                </div>
                <Link href="/auth/signup?plan=pro" className="block">
                  <Button className="w-full">
                    Start Free Trial
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="relative">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="text-4xl font-bold">$99<span className="text-lg text-gray-600">/month</span></div>
                <p className="text-gray-600">For large organizations</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Unlimited festivals</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>White-label solution</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Custom integrations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Dedicated support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-600" />
                    <span>Custom domain</span>
                  </div>
                </div>
                <Link href="/dashboard" className="block">
                  <Button variant="outline" className="w-full">
                    Contact Sales
                  </Button>
                </Link>
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
              Create Your Free Account
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
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link href="/marketing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/dashboard/festivals" className="hover:text-white transition-colors">My Festivals</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Documentation (Coming Soon)</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Help Center (Coming Soon)</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Contact (Coming Soon)</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="hover:text-white transition-colors">About (Coming Soon)</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Blog (Coming Soon)</Link></li>
                <li><Link href="/dashboard/settings" className="hover:text-white transition-colors">Settings</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p>&copy; 2024 Flow Grid. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}