import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, Tag, Users, Calendar } from 'lucide-react'

export default function GlossaryPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/flow-grid-logo.png" alt="Flow Grid Logo" width={40} height={40} className="h-10 w-auto" />
            <h1 className="ml-3 text-2xl font-bold">Flow Grid Glossary</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin"><Button variant="outline">Sign In</Button></Link>
            <Link href="/auth/signup"><Button>Get Started</Button></Link>
          </div>
        </header>

        <div className="mb-6">
          <p className="text-lg text-gray-700">This glossary explains the terms and elements used across Flow Grid. All entries are searchable from the site search.</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <h2 className="flex items-center gap-2"><Search className="w-5 h-5"/> Searchable Elements</h2>
          <p>Everything below can be indexed and is discoverable via the site search:</p>
          <ul>
            <li><strong>Festival Name</strong> — The public name of an event</li>
            <li><strong>Session Title</strong> — Individual workshop or performance titles</li>
            <li><strong>Teacher/Instructor</strong> — Names and profiles of instructors</li>
            <li><strong>Location/Room</strong> — Venue names used within a festival</li>
            <li><strong>Categories & Tags</strong> — Workshop types (Workshop, Performance, Social, etc.)</li>
            <li><strong>Slugs</strong> — The unique URL identifier for a festival (used in subdomains)</li>
            <li><strong>Announcements</strong> — Important updates shown on festival pages</li>
          </ul>

          <h3 className="mt-8">Common Terms</h3>
          <dl>
            <dt className="font-semibold">Card Types</dt>
            <dd>Visual formats for sessions: <em>minimal</em>, <em>photo</em>, and <em>detailed</em>.</dd>

            <dt className="font-semibold mt-4">Slug</dt>
            <dd>The short URL segment that creates a subdomain (e.g., <code>yourfestival.tryflowgrid.com</code>).</dd>

            <dt className="font-semibold mt-4">Capacity</dt>
            <dd>Maximum number of participants for a session.</dd>
          </dl>

          <h3 className="mt-8">How to use the Glossary</h3>
          <p>Use the site search to find any of the terms above. If something is missing, reach out via our <Link href="/contact" className="text-blue-600">Contact page</Link>.</p>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="font-semibold">Want this entry added to the Glossary?</h4>
            <p className="mt-2">Send us a message via <Link href="/contact" className="text-blue-600">Contact</Link> and we'll add it.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
