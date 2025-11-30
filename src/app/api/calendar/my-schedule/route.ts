/**
 * GET /api/calendar/my-schedule
 * 
 * Generate bulk ICS file for all favourited sessions
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateBulkICS, generateICSFilename, type ICSSession } from '@/lib/ics/generator'
import { trackCalendarExport } from '@/lib/trackEvent'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const anonUserId = searchParams.get('anonUserId')
    const festivalId = searchParams.get('festivalId')
    const day = searchParams.get('day')  // Optional: export single day

    if (!anonUserId) {
      return NextResponse.json(
        { error: 'anonUserId is required' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = { anonUserId }
    if (festivalId) {
      where.festivalId = festivalId
    }

    // Fetch all favourited sessions
    const favourites = await prisma.sessionFavourite.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            title: true,
            description: true,
            day: true,
            startTime: true,
            endTime: true,
            location: true,
            teachers: true
          }
        },
        festival: {
          select: {
            id: true,
            name: true,
            timezone: true
          }
        }
      },
      orderBy: {
        session: {
          startTime: 'asc'
        }
      }
    })

    if (favourites.length === 0) {
      return NextResponse.json(
        { error: 'No favourited sessions found' },
        { status: 404 }
      )
    }

    // Filter by day if specified
    let filteredFavourites: any[] = favourites
    if (day) {
      filteredFavourites = favourites.filter((f: any) => f.session.day === day)
      if (filteredFavourites.length === 0) {
        return NextResponse.json(
          { error: 'No sessions found for the specified day' },
          { status: 404 }
        )
      }
    }

    // Get the first festival's timezone (or default to UTC if mixed)
    const timezone = filteredFavourites[0]?.festival.timezone || 'UTC'
    const festivalName = filteredFavourites[0]?.festival.name || 'Flow Grid'

    // Convert to ICS format
    const icsSessions: ICSSession[] = filteredFavourites.map((f: any) => ({
      id: f.session.id,
      title: f.session.title,
      description: f.session.description || undefined,
      location: f.session.location || undefined,
      startTime: f.session.startTime,
      endTime: f.session.endTime,
      teachers: f.session.teachers,
      day: f.session.day
    }))

    // Generate calendar name
    const calendarName = day 
      ? `${festivalName} - ${day}`
      : `My ${festivalName} Schedule`

    // Generate ICS content
    const icsContent = generateBulkICS(icsSessions, calendarName, {
      timezone,
      reminderMinutes: 15
    })

    // Generate filename
    const filename = generateICSFilename(
      day ? `${festivalName}-${day}` : `${festivalName}-schedule`,
      'schedule'
    )

    // Track the calendar export event
    const actualFestivalId = filteredFavourites[0]?.festival.id
    if (actualFestivalId) {
      await trackCalendarExport(
        actualFestivalId,
        day ? 'single_day' : 'full_schedule',
        'ics_download',
        filteredFavourites.length,
        undefined,
        anonUserId
      )
    }

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
    console.error('Error generating schedule ICS:', error)
    return NextResponse.json(
      { error: 'Failed to generate calendar file' },
      { status: 500 }
    )
  }
}
