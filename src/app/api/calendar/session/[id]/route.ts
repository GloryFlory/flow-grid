/**
 * GET /api/calendar/session/[id]
 * 
 * Generate ICS file for a single session
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSessionICS, generateICSFilename } from '@/lib/ics/generator'
import { trackCalendarExport } from '@/lib/trackEvent'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch the session with festival for timezone
    const session = await prisma.festivalSession.findUnique({
      where: { id },
      include: {
        festival: {
          select: {
            timezone: true,
            name: true
          }
        }
      }
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Generate ICS content
    const icsContent = generateSessionICS(
      {
        id: session.id,
        title: session.title,
        description: session.description || undefined,
        location: session.location || undefined,
        startTime: session.startTime,
        endTime: session.endTime,
        teachers: session.teachers,
        day: session.day
      },
      {
        timezone: session.festival.timezone,
        reminderMinutes: 15
      }
    )

    // Generate filename
    const filename = generateICSFilename(session.title, 'session')

    // Track the calendar export event
    await trackCalendarExport(
      session.festivalId,
      'single_session',
      'ics_download',
      1
    )

    // Return as downloadable ICS file
    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })
  } catch (error) {
    console.error('Error generating session ICS:', error)
    return NextResponse.json(
      { error: 'Failed to generate calendar file' },
      { status: 500 }
    )
  }
}
