import { NextResponse } from 'next/server'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // Rate limit: 5 submissions per IP per 10 minutes (same tier as /subscribe) —
    // this sends an email via Resend on every request with no other guard.
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rateLimitResult = await rateLimit(`contact:${ip}`, { max: 5, windowMs: 10 * 60 * 1000 });
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      );
    }

    const body = await request.json()
    const { name, email, subject, 'festival-url': festivalUrl, message } = body

    const toEmail = 'florian.hohenleitner@gmail.com'
    const fromEmail = process.env.FROM_EMAIL || 'noreply@tryflowgrid.com'

    const emailHtml = `
      <h3>New contact form message</h3>
      <p><strong>From:</strong> ${name || 'Anonymous'} &lt;${email || 'no-reply'}&gt;</p>
      <p><strong>Subject:</strong> ${subject || 'No subject'}</p>
      <p><strong>Festival URL:</strong> ${festivalUrl || 'N/A'}</p>
      <hr />
      <p>${(message || '').replace(/\n/g, '<br/>')}</p>
    `

    // If a RESEND_API_KEY is configured, use Resend to send the email.
    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (RESEND_API_KEY) {
      const payload = {
        from: `Flow Grid <${fromEmail}>`,
        to: toEmail,
        subject: `[Flow Grid Contact] ${subject || 'New Message'}`,
        html: emailHtml
      }

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${RESEND_API_KEY}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const text = await res.text()
        console.error('Resend error:', res.status, text)
        return NextResponse.json({ error: 'Failed to send email via Resend' }, { status: 502 })
      }

      return NextResponse.json({ ok: true })
    }

    // Fallback: no email provider configured — log and return success to avoid exposing owner email
    console.warn('No RESEND_API_KEY configured — incoming contact saved to server logs (development).')
    console.info('Contact form payload:', { name, email, subject, festivalUrl, message })

    return NextResponse.json({ ok: true, warning: 'No email provider configured; message logged on server' })
  } catch (err) {
    console.error('Error in contact route:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
