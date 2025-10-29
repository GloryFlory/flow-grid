import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Tag, 
  Users, 
  Calendar, 
  Settings, 
  Palette, 
  Globe,
  FileText,
  Clock,
  MapPin,
  Camera,
  BarChart3,
  Zap,
  Shield,
  Database
} from 'lucide-react'

export default function GlossaryPage() {
  const searchableTerms = [
    {
      category: "Festival Management",
      icon: Calendar,
      color: "text-blue-600",
      terms: [
        {
          term: "Festival",
          definition: "A complete event with multiple sessions, teachers, and a schedule. Each festival gets its own subdomain (e.g., yourfestival.tryflowgrid.com)."
        },
        {
          term: "Slug",
          definition: "The unique URL identifier for your festival that becomes part of your public URL. Must be lowercase, use hyphens for spaces, and be URL-friendly (e.g., 'summer-dance-fest')."
        },
        {
          term: "Published/Unpublished",
          definition: "Published festivals are visible to the public at their subdomain. Unpublished festivals are only accessible to organizers in the dashboard."
        },
        {
          term: "Festival Settings",
          definition: "Configuration options including branding, timezone, contact information, and public visibility settings."
        }
      ]
    },
    {
      category: "Sessions & Scheduling",
      icon: Clock,
      color: "text-green-600",
      terms: [
        {
          term: "Session",
          definition: "An individual workshop, class, performance, or event within a festival. Contains details like title, description, teacher, time, location, and capacity."
        },
        {
          term: "Session Type",
          definition: "Categories that help organize sessions: Workshop, Performance, Social, Panel, Masterclass, Open Stage, etc."
        },
        {
          term: "Time Slot",
          definition: "The scheduled start and end time for a session. Used for organizing the daily schedule and preventing conflicts."
        },
        {
          term: "Capacity",
          definition: "Maximum number of participants allowed in a session. Can be set for booking management and display purposes."
        },
        {
          term: "Level",
          definition: "Difficulty or experience level required: Beginner, Intermediate, Advanced, All Levels, etc."
        },
        {
          term: "Room/Location",
          definition: "Physical or virtual space where a session takes place. Helps participants navigate the festival venue."
        }
      ]
    },
    {
      category: "Teachers & Profiles",
      icon: Users,
      color: "text-purple-600",
      terms: [
        {
          term: "Teacher/Instructor",
          definition: "Person leading a session. Can have a profile with bio, photo, website, and social media links."
        },
        {
          term: "Teacher Profile",
          definition: "Comprehensive information about an instructor including biography, specialties, experience, and contact details."
        },
        {
          term: "Profile Photo",
          definition: "Professional headshot or image representing the teacher. Can be cropped and optimized within Flow Grid."
        },
        {
          term: "Bio/Biography",
          definition: "Written description of the teacher's background, experience, teaching style, and qualifications."
        }
      ]
    },
    {
      category: "Design & Branding",
      icon: Palette,
      color: "text-orange-600",
      terms: [
        {
          term: "Theme/Branding",
          definition: "Visual customization including colors, fonts, logos, and styling that matches your festival's identity."
        },
        {
          term: "Card Types",
          definition: "Different visual layouts for displaying sessions: Minimal (text-only), Photo (with teacher image), and Detailed (full information)."
        },
        {
          term: "Color Scheme",
          definition: "Primary and secondary colors used throughout your festival's public pages and materials."
        },
        {
          term: "Logo Upload",
          definition: "Custom festival logo that appears on your public schedule and branding materials."
        },
        {
          term: "Custom CSS",
          definition: "Advanced styling options for further customization of your festival's appearance."
        }
      ]
    },
    {
      category: "Public Features",
      icon: Globe,
      color: "text-indigo-600",
      terms: [
        {
          term: "Public Schedule",
          definition: "The main page visitors see at yourfestival.tryflowgrid.com, displaying all published sessions in an organized, filterable format."
        },
        {
          term: "Filtering",
          definition: "Options for visitors to narrow down sessions by day, teacher, level, type, or location."
        },
        {
          term: "Search Functionality",
          definition: "Ability for participants to search sessions by title, teacher name, description, or keywords."
        },
        {
          term: "Responsive Design",
          definition: "Festival pages automatically adapt to work perfectly on desktop, tablet, and mobile devices."
        },
        {
          term: "SEO Optimization",
          definition: "Search engine friendly URLs, metadata, and structure to help people discover your festival online."
        }
      ]
    },
    {
      category: "Data & Import",
      icon: Database,
      color: "text-teal-600",
      terms: [
        {
          term: "CSV Import",
          definition: "Bulk upload sessions from a spreadsheet file with predefined columns for efficient festival setup."
        },
        {
          term: "Google Sheets Integration",
          definition: "Direct connection to Google Sheets for importing and syncing session data."
        },
        {
          term: "Data Export",
          definition: "Download festival information, sessions, and analytics in CSV or other formats."
        },
        {
          term: "Bulk Operations",
          definition: "Actions that can be performed on multiple sessions at once, like updating times or categories."
        }
      ]
    },
    {
      category: "Analytics & Insights",
      icon: BarChart3,
      color: "text-rose-600",
      terms: [
        {
          term: "Page Views",
          definition: "Number of times your festival schedule has been viewed by visitors."
        },
        {
          term: "Popular Sessions",
          definition: "Sessions that receive the most attention or engagement from participants."
        },
        {
          term: "Traffic Sources",
          definition: "Where your festival visitors are coming from (direct links, social media, search engines, etc.)."
        },
        {
          term: "Engagement Metrics",
          definition: "Data showing how participants interact with your festival schedule and session details."
        }
      ]
    },
    {
      category: "Account & Access",
      icon: Shield,
      color: "text-yellow-600",
      terms: [
        {
          term: "Dashboard",
          definition: "Your private control panel for managing festivals, sessions, teachers, and settings."
        },
        {
          term: "User Permissions",
          definition: "Different access levels for team members working on the same festival."
        },
        {
          term: "Multi-Festival Account",
          definition: "Ability to manage multiple festivals from a single Flow Grid account."
        },
        {
          term: "Authentication",
          definition: "Secure login system supporting email/password and Google sign-in options."
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-12 flex items-center justify-between bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <Image src="/flow-grid-logo.png" alt="Flow Grid Logo" width={40} height={40} className="h-10 w-auto" />
            <div className="ml-4">
              <h1 className="text-3xl font-bold text-gray-900">Flow Grid Glossary</h1>
              <p className="text-gray-600">Complete reference for all Flow Grid terms and features</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/help"><Button variant="outline">Help Center</Button></Link>
            <Link href="/auth/signin"><Button variant="outline">Sign In</Button></Link>
            <Link href="/auth/signup"><Button>Get Started</Button></Link>
          </div>
        </header>

        {/* Introduction */}
        <div className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-200">
          <div className="flex items-start space-x-4">
            <Search className="w-8 h-8 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to Use This Glossary</h2>
              <p className="text-lg text-gray-700 mb-4">
                This comprehensive glossary covers all terminology used in Flow Grid. Use your browser's search (Ctrl/Cmd + F) 
                to quickly find specific terms, or browse by category below.
              </p>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <strong className="text-gray-800">Quick Search Tips:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Use Ctrl/Cmd + F to search this page</li>
                    <li>• All terms are indexed for search engines</li>
                    <li>• Click on categories to jump to sections</li>
                  </ul>
                </div>
                <div>
                  <strong className="text-gray-800">Can't Find Something?</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Check our <Link href="/help" className="text-blue-600 hover:text-blue-500">Help Center</Link></li>
                    <li>• <Link href="/contact" className="text-blue-600 hover:text-blue-500">Contact us</Link> to suggest additions</li>
                    <li>• Browse <Link href="/about" className="text-blue-600 hover:text-blue-500">About</Link> for more context</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table of Contents */}
        <div className="mb-12 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Quick Navigation
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {searchableTerms.map((category, index) => {
              const IconComponent = category.icon
              return (
                <Link 
                  key={index}
                  href={`#${category.category.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <IconComponent className={`w-5 h-5 mr-3 ${category.color}`} />
                  <span className="font-medium text-gray-900">{category.category}</span>
                  <span className="ml-auto text-sm text-gray-500">
                    {category.terms.length} terms
                  </span>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Glossary Content */}
        <div className="space-y-12">
          {searchableTerms.map((category, categoryIndex) => {
            const IconComponent = category.icon
            const categoryId = category.category.toLowerCase().replace(/[^a-z0-9]/g, '-')
            
            return (
              <section key={categoryIndex} id={categoryId} className="scroll-mt-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center text-2xl">
                      <IconComponent className={`w-6 h-6 mr-3 ${category.color}`} />
                      {category.category}
                      <span className="ml-auto text-sm font-normal text-gray-500">
                        {category.terms.length} terms
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-6">
                      {category.terms.map((item, termIndex) => (
                        <div 
                          key={termIndex} 
                          className="border-l-4 border-gray-200 pl-6 py-2 hover:border-blue-300 transition-colors"
                          id={item.term.toLowerCase().replace(/[^a-z0-9]/g, '-')}
                        >
                          <dt className="text-lg font-semibold text-gray-900 mb-2">
                            {item.term}
                          </dt>
                          <dd className="text-gray-700 leading-relaxed">
                            {item.definition}
                          </dd>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </section>
            )
          })}
        </div>

        {/* Additional Resources */}
        <div className="mt-16 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-8 border border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
            Need More Help?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Help Center</h3>
              <p className="text-gray-600 mb-4">
                Step-by-step guides and tutorials for using Flow Grid effectively.
              </p>
              <Link href="/help">
                <Button variant="outline" size="sm">
                  Browse Help Articles
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Start</h3>
              <p className="text-gray-600 mb-4">
                Get your festival up and running in minutes with our guided setup.
              </p>
              <Link href="/auth/signup">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  Start Creating
                </Button>
              </Link>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Personal Support</h3>
              <p className="text-gray-600 mb-4">
                Can't find what you're looking for? Our team is here to help.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            This glossary is regularly updated. Last updated: 29 October 2025
          </p>
          <div className="mt-4 space-x-6">
            <Link href="/about" className="text-blue-600 hover:text-blue-500">About Flow Grid</Link>
            <Link href="/contact" className="text-blue-600 hover:text-blue-500">Suggest Improvements</Link>
            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
