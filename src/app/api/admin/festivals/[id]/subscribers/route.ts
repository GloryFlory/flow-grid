import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

// GET /api/admin/festivals/[id]/subscribers
// Returns subscriber list for the organiser; supports ?format=csv for export
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await params

    const { error } = await requireFestivalAccess(festivalId)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format')

    const subscribers = await prisma.webinarSubscriber.findMany({
      where: {
        festivalId,
        unsubscribedAt: null, // Only active subscribers
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        consentAt: true,
        consentVersion: true,
        confirmedAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    if (format === 'csv') {
      const headers = ['Email', 'First Name', 'Last Name', 'Signed Up', 'Consent Given At', 'Double Opt-in Confirmed']
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

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="subscribers-${festivalId}.csv"`,
        }
      })
    }

    return NextResponse.json({
      subscribers,
      total: subscribers.length,
    })
  } catch (error) {
    console.error('Error fetching subscribers:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
