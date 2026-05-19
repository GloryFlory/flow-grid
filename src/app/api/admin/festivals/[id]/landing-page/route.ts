import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

// GET /api/admin/festivals/[id]/landing-page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await params

    const { error } = await requireFestivalAccess(festivalId)
    if (error) return error

    const landingPage = await prisma.landingPage.findFirst({
      where: { festivalId }
    })

    return NextResponse.json({ landingPage })
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/festivals/[id]/landing-page
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check festival access (owner or admin team member can edit settings)
    const { error, access } = await requireFestivalAccess(festivalId)
    if (error) return error
    if (!access.canManageSettings) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      template,
      headline,
      subheadline,
      description,
      ctaText,
      webinarDate,
      webinarDuration,
      webinarLink,
      speakerName,
      speakerTitle,
      speakerBio,
      speakerPhoto,
      privacyPolicyUrl,
      isPublished,
    } = body

    if (!headline || headline.trim().length === 0) {
      return NextResponse.json({ error: 'Headline is required' }, { status: 400 })
    }

    const validTemplates = ['minimal', 'hero', 'speaker', 'countdown']
    if (template && !validTemplates.includes(template)) {
      return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
    }

    const landingPage = await prisma.landingPage.upsert({
      where: { festivalId_pageSlug: { festivalId, pageSlug: 'webinar' } },
      create: {
        festivalId,
        pageType: 'WEBINAR',
        pageSlug: 'webinar',
        title: 'Webinar Signup',
        template: template || 'minimal',
        headline: headline.trim(),
        subheadline: subheadline?.trim() || null,
        description: description?.trim() || null,
        ctaText: ctaText?.trim() || 'Sign me up',
        webinarDate: webinarDate ? new Date(webinarDate) : null,
        webinarDuration: webinarDuration ? parseInt(webinarDuration) : null,
        webinarLink: webinarLink?.trim() || null,
        speakerName: speakerName?.trim() || null,
        speakerTitle: speakerTitle?.trim() || null,
        speakerBio: speakerBio?.trim() || null,
        speakerPhoto: speakerPhoto?.trim() || null,
        privacyPolicyUrl: privacyPolicyUrl?.trim() || null,
        isPublished: isPublished ?? false,
      },
      update: {
        template: template || 'minimal',
        headline: headline.trim(),
        subheadline: subheadline?.trim() || null,
        description: description?.trim() || null,
        ctaText: ctaText?.trim() || 'Sign me up',
        webinarDate: webinarDate ? new Date(webinarDate) : null,
        webinarDuration: webinarDuration ? parseInt(webinarDuration) : null,
        webinarLink: webinarLink?.trim() || null,
        speakerName: speakerName?.trim() || null,
        speakerTitle: speakerTitle?.trim() || null,
        speakerBio: speakerBio?.trim() || null,
        speakerPhoto: speakerPhoto?.trim() || null,
        privacyPolicyUrl: privacyPolicyUrl?.trim() || null,
        isPublished: isPublished ?? false,
      }
    })

    return NextResponse.json({ landingPage })
  } catch (error) {
    console.error('Error saving landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
