import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/festivals/[slug]/register/[pageSlug]/calendar.ics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; pageSlug: string }> }
) {
  try {
    const { slug, pageSlug } = await params

    const festival = await prisma.festival.findUnique({
      where: { slug },
      select: {
        name: true,
        landingPages: {
          where: { pageSlug, isPublished: true },
          select: {
            headline: true,
            description: true,
            webinarDate: true,
            webinarDuration: true,
            webinarLink: true,
            speakerName: true,
          },
          take: 1,
        },
      },
    })

    const lp = festival?.landingPages[0]
    if (!lp?.webinarDate) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const start = new Date(lp.webinarDate)
    const end = new Date(start.getTime() + (lp.webinarDuration || 60) * 60 * 1000)

    const formatDate = (d: Date) =>
      d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
    const escape = (s: string) =>
      s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Flow Grid//FlowGrid//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${slug}-${pageSlug}@tryflowgrid.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(start)}`,
      `DTEND:${formatDate(end)}`,
      `SUMMARY:${escape(lp.headline)}`,
      lp.description ? `DESCRIPTION:${escape(lp.description)}` : null,
      lp.webinarLink ? `URL:${lp.webinarLink}` : null,
      lp.webinarLink ? `LOCATION:${lp.webinarLink}` : null,
      lp.speakerName ? `ORGANIZER;CN=${escape(lp.speakerName)}:MAILTO:noreply@tryflowgrid.com` : null,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n')

    return new NextResponse(lines, {
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slug}-${pageSlug}.ics"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Error generating ICS:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
