import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, HelpCircle, Calendar, Users, Settings, Globe } from 'lucide-react'

export default function HelpCenterPage() {
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
              <h1 className="ml-3 text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors">Help Center</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin"><Button variant="outline">Sign In</Button></Link>
            <Link href="/auth/signup"><Button>Get Started</Button></Link>
          </div>
        </header>
        <div className="mb-6">
          <p className="text-xl text-gray-600">
            Get help with Flow Grid and learn how to create amazing festival schedules
          </p>
        </div>

        <div className="prose prose-lg max-w-none">
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Quick Start
            </h2>
            <p className="text-blue-800 mb-4">
              New to Flow Grid? See our <Link href="/glossary" className="text-blue-600 hover:text-blue-500 font-medium">Glossary</Link> for terminology. Below is a short overview of the <strong>Create festival</strong> flow.
            </p>
            <div className="mt-4 bg-white border rounded-lg p-4">
              <h3 className="font-semibold">Create festival — 3 quick steps</h3>
              <ol className="list-decimal list-inside mt-3 text-sm text-gray-700">
                <li><strong>Festival Details</strong> — Name, description, dates, and a unique slug. Keep the slug short and url-friendly.</li>
                <li><strong>Schedule Setup</strong> — Upload a CSV (we provide a template) or add sessions manually. Choose card types (minimal, photo, detailed).</li>
                <li><strong>Preview & Publish</strong> — Review imported sessions, set visibility, and publish your festival. Your festival will appear at <code>https://yourslug.tryflowgrid.com</code>.</li>
              </ol>
              <div className="mt-4 flex gap-3">
                <Link href="/dashboard/create-festival"><Button>Start Creating</Button></Link>
                <Link href="/contact" className="ml-auto text-sm text-blue-600">Need help? Contact us</Link>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            Festival Setup
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I create my first festival?</h3>
              <p className="text-gray-700 mb-2">
                After signing up, click "Create New Festival" on your dashboard. You'll need to provide:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Festival name and description</li>
                <li>Start and end dates</li>
                <li>A unique slug (URL identifier)</li>
                <li>Location information</li>
              </ul>
            </div>

            <div className="border-l-4 border-blue-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What makes a good festival slug?</h3>
              <p className="text-gray-700">
                Your slug becomes part of your public URL (e.g., yourfestival.tryflowgrid.com). Use lowercase letters, numbers, and hyphens only. Examples: "summer-dance-fest", "2025-tango-weekend", "montreal-swing-festival".
              </p>
            </div>

            <div className="border-l-4 border-blue-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I change my festival information later?</h3>
              <p className="text-gray-700">
                Yes! You can edit all festival details except the slug after creation. The slug is permanent to ensure your public links don't break.
              </p>
            </div>

            <div className="border-l-4 border-blue-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I make my festival public?</h3>
              <p className="text-gray-700">
                In your festival settings, toggle "Public" to "Yes". This makes your festival visible on your public URL and allows visitors to view the schedule.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-blue-600" />
            Sessions & Schedule
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What's the easiest way to add many sessions?</h3>
              <p className="text-gray-700 mb-2">
                Use the CSV import feature:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-4">
                <li>Download the CSV template from your festival dashboard</li>
                <li>Fill in your session information using Excel or Google Sheets</li>
                <li>Upload the completed file</li>
                <li>Review and edit individual sessions as needed</li>
              </ol>
            </div>

            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I handle different time zones?</h3>
              <p className="text-gray-700">
                Set your festival's time zone in the festival settings. All session times will be displayed in this time zone on your public page. Enter session times in your local time zone.
              </p>
            </div>

            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What session categories should I use?</h3>
              <p className="text-gray-700 mb-2">
                Common categories include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li><strong>Workshop</strong> - Teaching sessions</li>
                <li><strong>Performance</strong> - Shows and demonstrations</li>
                <li><strong>Social</strong> - Dancing and social activities</li>
                <li><strong>Competition</strong> - Contests and judged events</li>
                <li><strong>Meeting</strong> - Announcements and gatherings</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Can sessions overlap in time?</h3>
              <p className="text-gray-700">
                Yes! Flow Grid supports parallel sessions. Participants can see all options at each time slot and choose which session to attend.
              </p>
            </div>

            <div className="border-l-4 border-green-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I handle session cancellations or changes?</h3>
              <p className="text-gray-700">
                Edit the session directly from your dashboard. Changes appear immediately on your public page. For major changes, consider adding an announcement to your festival description.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Teachers & Profiles
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-purple-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What photo size works best for teacher profiles?</h3>
              <p className="text-gray-700">
                Upload square images at least 400x400 pixels. Larger images (up to 1000x1000) work great too - they'll be automatically optimized. JPG, PNG, and WebP formats are supported.
              </p>
            </div>

            <div className="border-l-4 border-purple-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Can teachers have multiple social media links?</h3>
              <p className="text-gray-700">
                Yes! You can add Instagram, Facebook, website, and other social links to each teacher profile. These appear as clickable icons on the public teacher pages.
              </p>
            </div>

            <div className="border-l-4 border-purple-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I assign multiple teachers to one session?</h3>
              <p className="text-gray-700">
                When creating or editing a session, you can select multiple teachers from the dropdown. All assigned teachers will appear on the session card and detail page.
              </p>
            </div>

            <div className="border-l-4 border-purple-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What should I include in teacher bios?</h3>
              <p className="text-gray-700 mb-2">
                Great teacher bios include:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Teaching experience and specialties</li>
                <li>Notable achievements or credentials</li>
                <li>Teaching style and philosophy</li>
                <li>Personal interests that connect with students</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Customization & Branding
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-orange-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I upload my festival logo?</h3>
              <p className="text-gray-700">
                Go to Admin → Branding in your festival dashboard. Upload a high-resolution logo (PNG or JPG). It will appear on your public festival page header.
              </p>
            </div>

            <div className="border-l-4 border-orange-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I customize the colors of my festival page?</h3>
              <p className="text-gray-700">
                Yes! In the Branding section, you can set custom colors for your festival's theme. Choose colors that match your brand and create a cohesive visual experience.
              </p>
            </div>

            <div className="border-l-4 border-orange-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What content appears on my public festival page?</h3>
              <p className="text-gray-700 mb-2">
                Your public page includes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Festival name, dates, and description</li>
                <li>Interactive schedule with filtering options</li>
                <li>Teacher profiles with photos and bios</li>
                <li>Session details with times and descriptions</li>
                <li>Your custom branding and colors</li>
              </ul>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Globe className="w-6 h-6 mr-2 text-blue-600" />
            Publishing & Sharing
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-red-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">What's my festival's public URL?</h3>
              <p className="text-gray-700">
                Your festival is available at yourslug.tryflowgrid.com (where "yourslug" is the slug you chose when creating the festival).
              </p>
            </div>

            <div className="border-l-4 border-red-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I share my festival on social media?</h3>
              <p className="text-gray-700">
                Simply share your public URL! Flow Grid automatically generates beautiful preview images and descriptions for Facebook, Twitter, and other social platforms.
              </p>
            </div>

            <div className="border-l-4 border-red-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I embed my schedule on another website?</h3>
              <p className="text-gray-700">
                Currently, we don't offer embed codes, but you can always link to your Flow Grid festival page from your main website or social media.
              </p>
            </div>

            <div className="border-l-4 border-red-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Is my festival mobile-friendly?</h3>
              <p className="text-gray-700">
                Absolutely! All Flow Grid festival pages are fully responsive and work beautifully on phones, tablets, and desktops. Most festival participants view schedules on their phones.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Technical Issues
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-gray-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">I can't log in to my account</h3>
              <p className="text-gray-700 mb-2">
                Try these steps:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700 ml-4">
                <li>Make sure you're using the correct email address</li>
                <li>Check that your password is correct (it's case-sensitive)</li>
                <li>Clear your browser cache and cookies</li>
                <li>Try a different browser or incognito mode</li>
                <li>If still having issues, <Link href="/contact" className="text-blue-600 hover:text-blue-500">contact support</Link></li>
              </ol>
            </div>

            <div className="border-l-4 border-gray-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">My changes aren't showing on the public page</h3>
              <p className="text-gray-700">
                Changes usually appear immediately. Try refreshing the page or clearing your browser cache. If the issue persists, contact support.
              </p>
            </div>

            <div className="border-l-4 border-gray-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">I'm having trouble uploading photos</h3>
              <p className="text-gray-700 mb-2">
                Check that your image:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Is under 10MB in size</li>
                <li>Is in JPG, PNG, or WebP format</li>
                <li>Has appropriate dimensions (at least 400x400 for profiles)</li>
              </ul>
            </div>

            <div className="border-l-4 border-gray-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I export my festival data?</h3>
              <p className="text-gray-700">
                You can export your sessions to CSV format from your festival dashboard. This includes all session details, teachers, and scheduling information.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-12 mb-6 flex items-center">
            <HelpCircle className="w-6 h-6 mr-2 text-blue-600" />
            Account & Billing
          </h2>

          <div className="space-y-6">
            <div className="border-l-4 border-indigo-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Is Flow Grid free to use?</h3>
              <p className="text-gray-700">
                Yes! Flow Grid is currently free for all users. You can create unlimited festivals and sessions without any cost.
              </p>
            </div>

            <div className="border-l-4 border-indigo-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How many festivals can I create?</h3>
              <p className="text-gray-700">
                There's no limit! Create as many festivals as you need for different events, years, or organizations.
              </p>
            </div>

            <div className="border-l-4 border-indigo-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Can I delete my account?</h3>
              <p className="text-gray-700">
                Yes, you can delete your account and all associated data from your account settings. This action is permanent and cannot be undone.
              </p>
            </div>

            <div className="border-l-4 border-indigo-200 pl-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I change my email address?</h3>
              <p className="text-gray-700">
                Update your email address in your account settings. You'll need to verify the new email address before the change takes effect.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-12">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2" />
              Still Need Help?
            </h2>
            <p className="text-gray-700">
              Can't find what you're looking for? Use the Contact page to send us a message and we'll help you through the Create festival flow.
            </p>
            <div className="space-y-2">
              <p className="text-gray-700">
                <strong>Response Time:</strong> Usually within 24 hours
              </p>
              <div className="mt-4">
                <Link href="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}