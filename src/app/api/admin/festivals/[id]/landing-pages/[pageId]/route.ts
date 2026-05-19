import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

// GET /api/admin/festivals/[id]/landing-pages/[pageId]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const { id: festivalId, pageId } = await params
    const { error } = await requireFestivalAccess(festivalId)
    if (error) return error

    const page = await prisma.landingPage.findFirst({
      where: { id: pageId, festivalId },
    })

    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ landingPage: page })
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/festivals/[id]/landing-pages/[pageId]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const { id: festivalId, pageId } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error, access } = await requireFestivalAccess(festivalId)
    if (error) return error
    if (!access.canManageSettings) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify page belongs to this festival
    const existing = await prisma.landingPage.findFirst({
      where: { id: pageId, festivalId },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await request.json()
    const {
      title,
      template,
      headline,
      subheadline,
      description,
      ctaText,
      webinarDate,
      webinarEndDate,
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

    const landingPage = await prisma.landingPage.update({
      where: { id: pageId },
      data: {
        title: title?.trim() || existing.title,
        template: template || 'minimal',
        headline: headline.trim(),
        subheadline: subheadline?.trim() || null,
        description: description?.trim() || null,
        ctaText: ctaText?.trim() || 'Sign me up',
        webinarDate: webinarDate ? new Date(webinarDate) : null,
        webinarEndDate: webinarEndDate ? new Date(webinarEndDate) : null,
        webinarDuration: webinarDuration ? parseInt(webinarDuration) : null,
        webinarLink: webinarLink?.trim() || null,
        speakerName: speakerName?.trim() || null,
        speakerTitle: speakerTitle?.trim() || null,
        speakerBio: speakerBio?.trim() || null,
        speakerPhoto: speakerPhoto?.trim() || null,
        privacyPolicyUrl: privacyPolicyUrl?.trim() || null,
        isPublished: isPublished ?? false,
      },
    })

    return NextResponse.json({ landingPage })
  } catch (error) {
    console.error('Error updating landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/festivals/[id]/landing-pages/[pageId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const { id: festivalId, pageId } = await params

    const { error, access } = await requireFestivalAccess(festivalId)
    if (error) return error
    if (!access.canManageSettings) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const existing = await prisma.landingPage.findFirst({
      where: { id: pageId, festivalId },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    await prisma.landingPage.delete({ where: { id: pageId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
