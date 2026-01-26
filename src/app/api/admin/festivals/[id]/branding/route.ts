import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireFestivalAccess } from '@/lib/festival-access'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: festivalId } = await context.params

    // Check access - require manage settings permission (OWNER or ADMIN role)
    const { error } = await requireFestivalAccess(festivalId, { requireManageSettings: true })
    if (error) return error

    const body = await request.json()
    const { primaryColor, secondaryColor, accentColor, headerFont, customLevelColors } = body

    // Update branding colors and font
    const updatedFestival = await prisma.festival.update({
      where: { id: festivalId },
      data: {
        primaryColor,
        secondaryColor,
        accentColor,
        headerFont: headerFont || null,
        customLevelColors: customLevelColors || null,
      },
    })

    return NextResponse.json({
      success: true,
      festival: updatedFestival,
    })
  } catch (error) {
    console.error('Branding update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
