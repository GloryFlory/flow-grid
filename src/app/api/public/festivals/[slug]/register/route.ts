import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

// GET /api/public/festivals/[slug]/register
// Returns all published pages so the index route can redirect/list.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const festival = await prisma.festival.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        landingPages: {
          where: { isPublished: true },
          select: { pageSlug: true, title: true, pageType: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!festival) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(
      { pages: festival.landingPages },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } }
    )
  } catch (error) {
    console.error('Error fetching register index:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
