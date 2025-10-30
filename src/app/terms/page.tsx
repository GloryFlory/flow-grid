import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Footer from '@/components/Footer'

export default function TermsOfServicePage() {
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
              <h1 className="ml-3 text-2xl font-bold cursor-pointer hover:text-blue-600 transition-colors">Terms of Service</h1>
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
            Welcome to Flow Grid! These Terms of Service ("Terms") govern your use of our festival scheduling platform. By using Flow Grid, you agree to these terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing or using Flow Grid, you agree to be bound by these Terms and our Privacy Policy. 
            If you don't agree to these terms, please don't use our service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
          <p className="text-gray-700 mb-4">
            Flow Grid is a web-based platform that enables users to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Create and manage festival schedules</li>
            <li>Organize sessions, teachers, and event details</li>
            <li>Publish public-facing festival websites</li>
            <li>Manage teacher profiles and photos</li>
            <li>Customize branding and styling</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Account Creation</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>You must provide accurate and complete information</li>
            <li>You're responsible for maintaining account security</li>
            <li>You must be at least 13 years old to create an account</li>
            <li>One person may not maintain multiple accounts</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Account Security</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Keep your login credentials confidential</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>You're responsible for all activities under your account</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Acceptable Use</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">You May:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Create legitimate festival and event schedules</li>
            <li>Upload appropriate photos and content</li>
            <li>Share public festival pages</li>
            <li>Use the platform for its intended purposes</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">You May Not:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Upload illegal, harmful, or offensive content</li>
            <li>Violate any laws or regulations</li>
            <li>Infringe on others' intellectual property rights</li>
            <li>Attempt to hack, damage, or interfere with our service</li>
            <li>Spam or send unsolicited communications</li>
            <li>Impersonate others or provide false information</li>
            <li>Use the service for commercial purposes beyond festival organization</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Content and Intellectual Property</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Your Content</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>You retain ownership of content you upload</li>
            <li>You grant us license to display and process your content</li>
            <li>You're responsible for ensuring you have rights to uploaded content</li>
            <li>You can delete your content or account at any time</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Our Platform</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Flow Grid's code, design, and features are our intellectual property</li>
            <li>You may not copy, modify, or reverse engineer our platform</li>
            <li>Our trademarks and logos are protected</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Service Availability</h2>
          <p className="text-gray-700 mb-4">
            We strive to provide reliable service, but we cannot guarantee:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>100% uptime or uninterrupted service</li>
            <li>Error-free operation</li>
            <li>Compatibility with all devices or browsers</li>
            <li>Permanent availability of the service</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Termination</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">By You</h3>
          <p className="text-gray-700">
            You may delete your account at any time through your account settings.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">By Us</h3>
          <p className="text-gray-700 mb-4">
            We may suspend or terminate your account if you:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Violate these Terms of Service</li>
            <li>Engage in harmful or illegal activities</li>
            <li>Fail to pay required fees (when applicable)</li>
            <li>Remain inactive for an extended period</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Privacy</h2>
          <p className="text-gray-700">
            Your privacy is important to us. Please review our <Link href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link> to understand how we collect, use, and protect your information.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Disclaimers and Limitations</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Service Provided "As Is"</h3>
          <p className="text-gray-700">
            Flow Grid is provided "as is" without warranties of any kind. We don't guarantee that the service will meet your specific needs or be error-free.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Limitation of Liability</h3>
          <p className="text-gray-700">
            To the maximum extent permitted by law, Flow Grid shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Indemnification</h2>
          <p className="text-gray-700">
            You agree to indemnify and hold Flow Grid harmless from any claims, damages, or expenses arising from your use of the service or violation of these terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
          <p className="text-gray-700">
            We may update these Terms from time to time. We'll notify you of significant changes by email or through our platform. Continued use of Flow Grid after changes constitutes acceptance of the new terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
          <p className="text-gray-700">
            These Terms are governed by the laws of Malta. Any disputes will be resolved in the competent courts of Malta.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">13. Contact Information</h2>
          <p className="text-gray-700">
            If you have questions about these Terms of Service, please reach out via our <Link href="/contact" className="text-blue-600 hover:text-blue-500">Contact page</Link>.
          </p>
          <div className="bg-gray-50 p-6 rounded-lg mt-4">
            <p className="text-gray-700">
              <strong>Address:</strong> Flow Grid Inc., Sliema, Malta (CET)
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">14. Entire Agreement</h2>
          <p className="text-gray-700">
            These Terms, together with our Privacy Policy, constitute the entire agreement between you and Flow Grid regarding your use of the service.
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}