import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart, Users, Globe, Lightbulb, Target, Calendar } from 'lucide-react'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/">
              <img src="/flow-grid-logo.png" alt="Flow Grid Logo" className="h-10 w-auto cursor-pointer" />
            </Link>
            <Link href="/">
              <h1 className="ml-3 text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors">About Flow Grid</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin"><Button variant="outline">Sign In</Button></Link>
            <Link href="/auth/signup"><Button>Get Started</Button></Link>
          </div>
        </header>
        <div className="mb-6">
          <p className="text-xl text-gray-600">
            Empowering festival organizers to create beautiful, professional schedules with ease
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-6 h-6 mr-2 text-red-500" />
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 mb-4">
              We believe that every festival, workshop, and event deserves a beautiful, professional online presence. 
              Flow Grid was born from the frustration of seeing amazing events struggle with clunky, outdated scheduling tools 
              that didn't reflect the quality and passion of their organizers.
            </p>
            <p className="text-lg text-gray-700">
              Our mission is simple: make it effortless for festival organizers to create stunning, 
              user-friendly schedules that help participants discover and engage with their events.
            </p>
          </div>

          {/* Story Section */}
          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Lightbulb className="w-6 h-6 mr-2 text-yellow-500" />
            Our Story
          </h2>
          
          <p className="text-gray-700 mb-4">
            Flow Grid started in Montreal's vibrant dance community, where we witnessed firsthand the challenges 
            festival organizers face when trying to present their events professionally online. Too many amazing 
            festivals were stuck with:
          </p>
          
            <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Complicated spreadsheets that looked unprofessional</li>
            <li>Expensive, bloated software designed for corporate conferences</li>
            <li>Static PDFs that were impossible to navigate on mobile devices</li>
            <li>Post-it notes for workshops that would disappear throughout the day</li>
          </ul>

          <p className="text-gray-700 mb-4">
            We knew there had to be a better way. Festival organizers pour their hearts into creating incredible 
            experiences – their online presence should reflect that same level of care and professionalism.
          </p>

          <p className="text-gray-700 mb-6">
            So we built Flow Grid: a platform that combines the simplicity organizers need with the 
            beautiful, modern design their festivals deserve.
          </p>

          {/* Values Section */}
          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-green-500" />
            Our Values
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="border-l-4 border-blue-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Simplicity First</h3>
              <p className="text-gray-700">
                Festival organizing is complex enough. We believe technology should make your life easier, 
                not harder. Every feature we build prioritizes clarity and ease of use.
              </p>
            </div>

            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Beautiful by Default</h3>
              <p className="text-gray-700">
                Your festival is unique and special. Our designs ensure your event looks professional 
                and inviting, helping you attract and engage more participants.
              </p>
            </div>

            <div className="border-l-4 border-purple-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Community Focused</h3>
              <p className="text-gray-700">
                We're part of the festival community ourselves. We understand the challenges you face 
                because we've lived them, and we're committed to supporting your success.
              </p>
            </div>

            <div className="border-l-4 border-orange-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Accessible to All</h3>
              <p className="text-gray-700">
                Great festivals come in all sizes and budgets. We're committed to keeping Flow Grid 
                affordable and accessible to grassroots organizers and major events alike.
              </p>
            </div>
          </div>

          {/* What We've Built */}
          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-500" />
            What We've Built
          </h2>

          <p className="text-gray-700 mb-4">
            Flow Grid is more than just a scheduling tool. It's a complete platform designed specifically 
            for festival organizers who want to:
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">For Organizers</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Quick festival setup in minutes</li>
                  <li>• Bulk session import via CSV</li>
                  <li>• Teacher profile management</li>
                  <li>• Custom branding and styling</li>
                  <li>• Real-time updates and edits</li>
                  <li>• Analytics and insights</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">For Participants</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Mobile-responsive design</li>
                  <li>• Intuitive filtering and search</li>
                  <li>• Teacher profiles and photos</li>
                  <li>• Session details and descriptions</li>
                  <li>• Easy sharing on social media</li>
                  <li>• Fast loading and navigation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Impact Section (commented out per content update request)
          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Globe className="w-6 h-6 mr-2 text-indigo-500" />
            Our Impact
          </h2>

          <p className="text-gray-700 mb-4">
            Since launching, Flow Grid has helped festival organizers around the world create beautiful, 
            professional online presences for their events. We've seen:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">50+</div>
              <p className="text-gray-700">Festivals Created</p>
            </div>
            <div className="text-center p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
              <p className="text-gray-700">Sessions Scheduled</p>
            </div>
            <div className="text-center p-6 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">15+</div>
              <p className="text-gray-700">Countries Reached</p>
            </div>
          </div>

          <blockquote className="border-l-4 border-gray-300 pl-6 italic text-gray-700 mb-8">
            "Flow Grid transformed how we present our festival online. What used to take weeks of website 
            development now takes minutes, and the result looks more professional than anything we could 
            have built ourselves."
            <footer className="text-sm text-gray-600 mt-2">— Festival Organizer, Europe</footer>
          </blockquote>
          */}

          {/* Team Section */}
          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-pink-500" />
            The Team
          </h2>

          <p className="text-gray-700 mb-6">
            Flow Grid is built by a small, passionate team based in Sliema, Malta. We're dancers,
            developers, and festival enthusiasts who understand the community we serve because we're part of it.
          </p>

          {/* We're Hiring! (commented out per content update request)
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">We're Hiring!</h3>
            <p className="text-gray-700 mb-4">
              Interested in joining our mission to make festival organizing easier and more beautiful? 
              We're always looking for talented people who share our passion for community and great design.
            </p>
            <p className="text-gray-700">
              Reach out to us at <a href="mailto:careers@tryflowgrid.com" className="text-blue-600 hover:text-blue-500 font-medium">careers@tryflowgrid.com</a>
            </p>
          </div>
          */}

          {/* Future Section */}
          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Target className="w-6 h-6 mr-2 text-red-500" />
            Looking Forward
          </h2>

          <p className="text-gray-700 mb-4">
            We're just getting started. Our roadmap includes exciting features like:
          </p>

          <ul className="list-disc list-inside space-y-2 text-gray-700 mb-6">
            <li>Advanced participant registration and ticketing integration</li>
            <li>Mobile apps for iOS and Android</li>
            <li>Enhanced analytics and reporting tools</li>
            <li>Multi-language support for international festivals</li>
            <li>Collaborative editing tools for organizing teams</li>
            <li>Integration with popular calendar and email platforms</li>
          </ul>

          <p className="text-gray-700 mb-8">
            But most importantly, we're committed to staying true to our core values: keeping Flow Grid 
            simple, beautiful, and accessible to festival organizers everywhere.
          </p>

          {/* Contact CTA */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Let's Build Something Amazing Together
            </h2>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Whether you're organizing your first workshop or your fiftieth festival, 
              we're here to help you create an online presence that matches the quality of your event.
            </p>
            <div className="space-x-4">
              <Link href="/auth/signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Start Your Festival
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600">
              Flow Grid is proudly made in Sliema, Malta 🇲🇹<br />
              With love for the global festival community ❤️
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}