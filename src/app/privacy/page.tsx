import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function PrivacyPolicyPage() {
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
              <h1 className="ml-3 text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors">Privacy Policy</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/auth/signin"><Button variant="outline">Sign In</Button></Link>
            <Link href="/auth/signup"><Button>Get Started</Button></Link>
          </div>
        </header>
        <div className="mb-6">
          <p className="text-gray-600">Last updated: 29 October 2025</p>
        </div>

        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-700 mb-8">
            At Flow Grid, we take your privacy seriously. This Privacy Policy explains how we collect, use, and protect your information when you use our festival scheduling platform.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Account Information</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Name and email address when you create an account</li>
            <li>Profile information you choose to provide</li>
            <li>Authentication data (encrypted passwords or OAuth tokens)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Festival Data</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Festival details (names, descriptions, dates, locations)</li>
            <li>Session information (schedules, teacher details, descriptions)</li>
            <li>Photos and images you upload for teachers and festivals</li>
            <li>Custom branding and styling preferences</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Usage Information</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>How you interact with our platform</li>
            <li>Device and browser information</li>
            <li>IP addresses and general location data</li>
            <li>Performance and error logs</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Provide Services:</strong> Enable you to create and manage festival schedules</li>
            <li><strong>Account Management:</strong> Authenticate users and maintain accounts</li>
            <li><strong>Communication:</strong> Send important updates about your account or festivals</li>
            <li><strong>Improvement:</strong> Analyze usage to improve our platform</li>
            <li><strong>Support:</strong> Provide customer support and troubleshooting</li>
            <li><strong>Security:</strong> Protect against fraud and unauthorized access</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell, trade, or rent your personal information to third parties. We may share information only in these specific circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Public Festival Pages:</strong> Information you choose to make public on festival schedules</li>
            <li><strong>Service Providers:</strong> Trusted third-party services that help us operate (hosting, analytics, email)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In the event of a merger or acquisition</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Security</h2>
          <p className="text-gray-700 mb-4">
            We implement industry-standard security measures to protect your data:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Encrypted data transmission (HTTPS/SSL)</li>
            <li>Secure password hashing</li>
            <li>Regular security audits and updates</li>
            <li>Access controls and authentication</li>
            <li>Secure cloud infrastructure</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Your Rights</h2>
          <p className="text-gray-700 mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct your information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Export your festival data</li>
            <li><strong>Objection:</strong> Opt out of certain data processing</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Cookies and Tracking</h2>
          <p className="text-gray-700 mb-4">
            We use cookies and similar technologies to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Keep you logged in to your account</li>
            <li>Remember your preferences</li>
            <li>Analyze platform usage and performance</li>
            <li>Provide a personalized experience</li>
          </ul>
          <p className="text-gray-700">
            You can control cookies through your browser settings, but this may affect platform functionality.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Data Retention</h2>
          <p className="text-gray-700">
            We retain your information for as long as your account is active or as needed to provide services. 
            When you delete your account, we remove your personal data within 30 days, except where we're 
            required to retain certain information for legal or security purposes.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Children's Privacy</h2>
          <p className="text-gray-700">
            Flow Grid is not intended for children under 13. We do not knowingly collect personal information 
            from children under 13. If you believe we have collected such information, please contact us 
            immediately. Parents or guardians concerned about their child's personal data should contact us via the <Link href="/contact" className="text-blue-600 hover:text-blue-500">Contact page</Link>.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">International Users</h2>
          <p className="text-gray-700">
            Flow Grid is operated from Sliema, Malta. If you're accessing our services from outside Malta,
            your information may be transferred to and processed in Malta, which may have different
            privacy laws than your country. If you are located in the European Economic Area (EEA),
            you have the rights described above under the General Data Protection Regulation (GDPR),
            including the right to access, correct, delete, and port your personal data, and the right
            to lodge a complaint with a supervisory authority.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How We Lawfully Process Data (GDPR)</h2>
          <p className="text-gray-700">
            Where GDPR applies, we process personal data on one or more lawful bases, including to
            perform the contract with you (providing the platform), to comply with legal obligations,
            based on your consent (for optional marketing communications), and for our legitimate
            interests (analytics, fraud prevention). You can exercise your rights or withdraw consent
            by contacting us via the <Link href="/contact" className="text-blue-600 hover:text-blue-500">Contact page</Link>.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Changes to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We'll notify you of significant changes 
            by email or through our platform. Your continued use of Flow Grid after changes become 
            effective constitutes acceptance of the updated policy.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Us</h2>
          <p className="text-gray-700">
            If you have questions about this Privacy Policy or how we handle your data, please reach out via our <Link href="/contact" className="text-blue-600 hover:text-blue-500">Contact page</Link>.
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mt-4">
            <p className="text-gray-700">
              <strong>Address:</strong> Flow Grid Inc., Sliema, Malta (CET)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}