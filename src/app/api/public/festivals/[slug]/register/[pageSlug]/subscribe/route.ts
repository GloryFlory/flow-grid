import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { rateLimit, getRateLimitHeaders } from '@/lib/rate-limit'
import { sendWebinarSignupConfirmation, sendSignupNotificationToOrganiser } from '@/lib/email'
import { normalizeEmail } from '@/lib/email'
import { createHash } from 'crypto'

const CONSENT_VERSION = '1.0'
const CONSENT_TEXT =
  'I agree to receive event updates and information. I understand I can unsubscribe at any time.'

// POST /api/public/festivals/[slug]/register/[pageSlug]/subscribe
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; pageSlug: string }> }
) {
  try {
    const { slug, pageSlug } = await params

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

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    const normalizedEmail = normalizeEmail(email)
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }
    if (!consent) {
      return NextResponse.json({ error: 'Consent is required to subscribe' }, { status: 400 })
    }

    const festival = await prisma.festival.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        logo: true,
        primaryColor: true,
        user: { select: { email: true } },
        landingPages: {
          where: { pageSlug, isPublished: true },
          select: {
            id: true,
            pageType: true,
            headline: true,
            description: true,
            webinarDate: true,
            webinarDuration: true,
            webinarLink: true,
            speakerName: true,
            speakerTitle: true,
          },
          take: 1,
        },
      },
    })

    const landingPage = festival?.landingPages[0]
    if (!festival || !landingPage) {
      return NextResponse.json({ error: 'This signup page is not available' }, { status: 404 })
    }

    const hashedIp = createHash('sha256').update(ip + (process.env.NEXTAUTH_SECRET || '')).digest('hex')

    // Upsert — if already subscribed, handle silently
    const existing = await prisma.webinarSubscriber.findUnique({
      where: { landingPageId_email: { landingPageId: landingPage.id, email: normalizedEmail } },
    })

    if (existing) {
      if (existing.unsubscribedAt) {
        await prisma.webinarSubscriber.update({
          where: { id: existing.id },
          data: {
            unsubscribedAt: null,
            consentAt: new Date(),
            consentVersion: CONSENT_VERSION,
            consentText: CONSENT_TEXT,
            firstName: firstName?.trim() || existing.firstName,
            lastName: lastName?.trim() || existing.lastName,
          },
        })
      }
      return NextResponse.json({ success: true })
    }

    const subscriber = await prisma.webinarSubscriber.create({
      data: {
        landingPageId: landingPage.id,
        festivalId: festival.id,
        email: normalizedEmail,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        consentAt: new Date(),
        consentVersion: CONSENT_VERSION,
        consentText: CONSENT_TEXT,
        ipAddress: hashedIp,
      },
    })

    const appUrl = process.env.NEXTAUTH_URL || 'https://tryflowgrid.com'
    const unsubscribeUrl = `${appUrl}/unsubscribe/${subscriber.unsubscribeToken}`
    const calendarUrl = landingPage.webinarDate
      ? `${appUrl}/api/public/festivals/${slug}/register/${pageSlug}/calendar.ics`
      : undefined

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
    }).catch(err => console.error('Failed to send confirmation email:', err))

    if (festival.user?.email) {
      sendSignupNotificationToOrganiser({
        to: festival.user.email,
        pageType: landingPage.pageType,
        pageTitle: landingPage.headline,
        festivalName: festival.name,
        festivalId: festival.id,
        pageId: landingPage.id,
        subscriberFirstName: firstName?.trim() || undefined,
        subscriberLastName: lastName?.trim() || undefined,
        subscriberEmail: normalizedEmail,
        appUrl: process.env.NEXTAUTH_URL || 'https://tryflowgrid.com',
      }).catch(err => console.error('Failed to send organiser notification:', err))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error subscribing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
