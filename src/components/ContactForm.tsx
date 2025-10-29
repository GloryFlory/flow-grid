'use client'

import { Button } from '@/components/ui/button'

export default function ContactForm() {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
  }

  return (
    <form id="contact-form" className="space-y-6" onSubmit={handleSubmit}>
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
  )
}