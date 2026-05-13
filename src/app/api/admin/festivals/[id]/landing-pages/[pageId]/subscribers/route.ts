import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

// GET /api/admin/festivals/[id]/landing-pages/[pageId]/subscribers
// Returns subscriber count; supports ?format=csv for export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pageId: string }> }
) {
  try {
    const { id: festivalId, pageId } = await params

    const { error } = await requireFestivalAccess(festivalId)
    if (error) return error

    // Verify page belongs to this festival
    const page = await prisma.landingPage.findFirst({
      where: { id: pageId, festivalId },
      select: { id: true, title: true },
    })
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    const subscribers = await prisma.webinarSubscriber.findMany({
      where: { landingPageId: pageId, unsubscribedAt: null },
      select: {
        email: true,
        firstName: true,
        lastName: true,
        consentAt: true,
        consentVersion: true,
        confirmedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (format === 'csv') {
      const headers = ['Email', 'First Name', 'Last Name', 'Signed Up', 'Consent At', 'Double Opt-in']
      const rows = subscribers.map(s => [
        s.email,
        s.firstName || '',
        s.lastName || '',
        s.createdAt.toISOString(),
        s.consentAt.toISOString(),
        s.confirmedAt ? s.confirmedAt.toISOString() : 'pending',
      ])
      const csv = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n')

      const filename = `subscribers-${page.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${pageId.slice(-6)}.csv`
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    return NextResponse.json({ subscribers, total: subscribers.length })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
