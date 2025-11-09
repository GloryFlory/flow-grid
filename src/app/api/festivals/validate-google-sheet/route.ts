import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { validateGoogleSheetUrl, fetchGoogleSheetData } from '@/lib/googleSheets'

/**
 * POST /api/festivals/validate-google-sheet
 * Validate a Google Sheets URL and fetch sessions (for use during festival creation)
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { googleSheetUrl } = body

    if (!googleSheetUrl) {
      return NextResponse.json(
        { error: 'Google Sheets URL is required' },
        { status: 400 }
      )
    }

    // Validate Google Sheets URL
    const validation = await validateGoogleSheetUrl(googleSheetUrl)
    if (!validation.isValid) {
      return NextResponse.json({
        isValid: false,
        error: validation.error
      }, { status: 400 })
    }

    const sheetId = validation.sheetId!

    // Fetch and parse sheet data
    const result = await fetchGoogleSheetData(sheetId)
    if (!result.isValid || !result.sessions) {
      return NextResponse.json({
        isValid: false,
        error: result.error || 'Failed to parse sheet data'
      }, { status: 400 })
    }

    return NextResponse.json({
      isValid: true,
      sessionCount: result.sessions.length,
      sessions: result.sessions,
      warnings: result.error
    })
  } catch (error) {
    console.error('Google Sheets validation error:', error)
    return NextResponse.json(
      { 
        isValid: false,
        error: 'Failed to validate Google Sheets URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
