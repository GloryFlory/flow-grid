import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: festivalId } = await context.params
    const body = await request.json()
    const { primaryColor, secondaryColor, accentColor } = body

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })
    const isAdmin = currentUser?.role === 'ADMIN'

    // Verify festival ownership (or admin access)
    const festival = await prisma.festival.findFirst({
      where: {
        id: festivalId,
        ...(isAdmin ? {} : { userId: session.user.id }),
      },
    })

    if (!festival) {
      return NextResponse.json({ error: 'Festival not found' }, { status: 404 })
    }

    // Update branding colors
    const updatedFestival = await prisma.festival.update({
      where: { id: festivalId },
      data: {
        primaryColor,
        secondaryColor,
        accentColor,
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
