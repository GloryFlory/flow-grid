import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'
import { toPageSlug } from '@/lib/landing-page-types'

// GET /api/admin/festivals/[id]/landing-pages
// Returns all landing pages for this festival
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await params
    const { error } = await requireFestivalAccess(festivalId)
    if (error) return error

    const pages = await prisma.landingPage.findMany({
      where: { festivalId },
      select: {
        id: true,
        pageType: true,
        pageSlug: true,
        title: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { subscribers: { where: { unsubscribedAt: null } } } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ pages })
  } catch (error) {
    console.error('Error fetching landing pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/festivals/[id]/landing-pages
// Creates a new landing page
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error, access } = await requireFestivalAccess(festivalId)
    if (error) return error
    if (!access.canManageSettings) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Pro gate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscription: { select: { plan: true } }, role: true },
    })
    const isPro = user?.subscription?.plan === 'PRO' || user?.role === 'ADMIN'
    if (!isPro) {
      return NextResponse.json(
        { error: 'Landing pages are a Pro feature. Please upgrade to access this.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { pageType, title } = body

    const validTypes = ['WEBINAR', 'EARLY_BIRD', 'WAITLIST', 'RETREAT_INTEREST', 'VOLUNTEER', 'SCHOLARSHIP', 'DISCOVERY_CALL']
    if (!pageType || !validTypes.includes(pageType)) {
      return NextResponse.json({ error: 'Invalid page type' }, { status: 400 })
    }
    if (!title || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Generate a unique pageSlug within this festival
    let baseSlug = toPageSlug(title.trim())
    let pageSlug = baseSlug
    let attempt = 1
    while (true) {
      const existing = await prisma.landingPage.findUnique({
        where: { festivalId_pageSlug: { festivalId, pageSlug } },
      })
      if (!existing) break
      pageSlug = `${baseSlug}-${++attempt}`
    }

    const defaultCtaMap: Record<string, string> = {
      WEBINAR: 'Sign me up',
      EARLY_BIRD: 'Get early access',
      WAITLIST: 'Join the waitlist',
      RETREAT_INTEREST: "I'm interested",
      VOLUNTEER: 'Apply to volunteer',
      SCHOLARSHIP: 'Apply for a scholarship',
      DISCOVERY_CALL: 'Request a call',
    }
    const defaultTemplateMap: Record<string, string> = {
      WEBINAR: 'minimal',
      EARLY_BIRD: 'countdown',
      WAITLIST: 'minimal',
      RETREAT_INTEREST: 'minimal',
      VOLUNTEER: 'minimal',
      SCHOLARSHIP: 'minimal',
      DISCOVERY_CALL: 'speaker',
    }

    const page = await prisma.landingPage.create({
      data: {
        festivalId,
        pageType,
        pageSlug,
        title: title.trim(),
        headline: title.trim(),
        ctaText: defaultCtaMap[pageType] || 'Sign me up',
        template: defaultTemplateMap[pageType] || 'minimal',
      },
    })

    return NextResponse.json({ page }, { status: 201 })
  } catch (error) {
    console.error('Error creating landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
