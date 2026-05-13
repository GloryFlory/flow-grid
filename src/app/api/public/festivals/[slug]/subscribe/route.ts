import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { sendWebinarSignupConfirmation } from '@/lib/email'
import { normalizeEmail } from '@/lib/email'
import { createHash } from 'crypto'

const CONSENT_VERSION = '1.0'
const CONSENT_TEXT =
  'I agree to receive event updates and webinar information. I understand I can unsubscribe at any time.'

// POST /api/public/festivals/[slug]/subscribe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Rate limit: 5 signups per IP per 10 minutes
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown'
    const rateLimitResult = await rateLimit(`subscribe:${ip}`, { max: 5, windowMs: 10 * 60 * 1000 })
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: getRateLimitHeaders(rateLimitResult) }
      )
    }

    const body = await request.json()
    const { email, firstName, lastName, consent } = body

    // Validate input at the boundary
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    const normalizedEmail = normalizeEmail(email)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!consent) {
      return NextResponse.json(
        { error: 'Consent is required to subscribe' },
        { status: 400 }
      )
    }

    // Find the festival and its landing page
    const festival = await prisma.festival.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        logo: true,
        primaryColor: true,
        landingPages: {
          where: { isPublished: true },
          select: {
            id: true,
            isPublished: true,
            headline: true,
            description: true,
            webinarDate: true,
            webinarDuration: true,
            webinarLink: true,
            speakerName: true,
            speakerTitle: true,
          },
          orderBy: { createdAt: 'asc' },
          take: 1,
        }
      }
    })

    if (!festival || !festival.landingPages[0]) {
      return NextResponse.json(
        { error: 'This signup page is not available' },
        { status: 404 }
      )
    }

    // Hash IP address for GDPR compliance (we store a hash, not the raw IP)
    const hashedIp = createHash('sha256').update(ip + process.env.NEXTAUTH_SECRET).digest('hex')

    // Upsert — if already subscribed, return success silently (don't leak info)
    const existing = await prisma.webinarSubscriber.findUnique({
      where: { landingPageId_email: { landingPageId: festival.landingPages[0].id, email: normalizedEmail } }
    })

    if (existing) {
      if (existing.unsubscribedAt) {
        // Re-subscribe: clear unsubscribe date, update consent timestamp
        await prisma.webinarSubscriber.update({
          where: { id: existing.id },
          data: {
            unsubscribedAt: null,
            consentAt: new Date(),
            consentVersion: CONSENT_VERSION,
            consentText: CONSENT_TEXT,
            firstName: firstName?.trim() || existing.firstName,
            lastName: lastName?.trim() || existing.lastName,
          }
        })
      }
      // Already subscribed — return success without revealing that (anti-enumeration)
      return NextResponse.json({ success: true })
    }

    const subscriber = await prisma.webinarSubscriber.create({
      data: {
        landingPageId: festival.landingPages[0].id,
        festivalId: festival.id,
        email: normalizedEmail,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        consentAt: new Date(),
        consentVersion: CONSENT_VERSION,
        consentText: CONSENT_TEXT,
        ipAddress: hashedIp,
      }
    })

    // Send confirmation email (fire-and-forget — don't block the response)
    const appUrl = process.env.NEXTAUTH_URL || 'https://tryflowgrid.com'
    const unsubscribeUrl = `${appUrl}/unsubscribe/${subscriber.unsubscribeToken}`
    const calendarUrl = `${appUrl}/api/public/festivals/${slug}/calendar.ics`
    const landingPage = festival.landingPages[0]

    sendWebinarSignupConfirmation({
      to: normalizedEmail,
      firstName: firstName?.trim() || undefined,
      festivalName: festival.name,
      festivalLogo: festival.logo || undefined,
      primaryColor: festival.primaryColor || '#4a90e2',
      headline: landingPage.headline,
      description: landingPage.description || undefined,
      webinarDate: landingPage.webinarDate ? new Date(landingPage.webinarDate) : undefined,
      webinarDuration: landingPage.webinarDuration || undefined,
      webinarLink: landingPage.webinarLink || undefined,
      speakerName: landingPage.speakerName || undefined,
      speakerTitle: landingPage.speakerTitle || undefined,
      calendarUrl,
      unsubscribeUrl,
    }).catch(err => {
      console.error('Failed to send webinar confirmation email:', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error subscribing to webinar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
