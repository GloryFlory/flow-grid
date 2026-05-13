import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

// GET /api/public/festivals/[slug]/register/[pageSlug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; pageSlug: string }> }
) {
  try {
    const { slug, pageSlug } = await params
    const { searchParams } = new URL(request.url)
    const isPreview = searchParams.get('preview') === 'true'

    const festival = await prisma.festival.findUnique({
      where: { slug },
      select: {
        id: true,
        userId: true,
        name: true,
        slug: true,
        logo: true,
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        headerFont: true,
        location: true,
        landingPages: {
          where: { pageSlug },
          select: {
            id: true,
            pageType: true,
            pageSlug: true,
            title: true,
            template: true,
            headline: true,
            subheadline: true,
            description: true,
            ctaText: true,
            webinarDate: true,
            webinarDuration: true,
            webinarLink: true,
            speakerName: true,
            speakerTitle: true,
            speakerBio: true,
            speakerPhoto: true,
            privacyPolicyUrl: true,
            isPublished: true,
          },
          take: 1,
        },
      },
    })

    if (!festival) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const landingPage = festival.landingPages[0] ?? null

    // Unpublished: only allow with preview=true and ownership verified
    if (!landingPage?.isPublished) {
      if (!isPreview) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      const { error: accessError } = await requireFestivalAccess(festival.id)
      if (accessError) return NextResponse.json({ error: 'Not found' }, { status: 404 })

      // No page saved yet — return festival data so preview can use localStorage draft
      if (!landingPage) {
        const { userId: _u, landingPages: _lp, ...festivalData } = festival
        return NextResponse.json(
          { festival: festivalData, landingPage: null, isPreview: true },
          { headers: { 'Cache-Control': 'no-store' } }
        )
      }
    }

    const { userId: _u, landingPages: _lp, ...festivalData } = festival

    return NextResponse.json(
      { festival: festivalData, landingPage, isPreview },
      {
        headers: isPreview
          ? { 'Cache-Control': 'no-store' }
          : { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
      }
    )
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
