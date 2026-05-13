import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/unsubscribe/[token]
// One-click unsubscribe — no auth required, token is the proof of identity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 400 })
    }

    const subscriber = await prisma.webinarSubscriber.findUnique({
      where: { unsubscribeToken: token },
      select: { id: true, unsubscribedAt: true }
    })

    if (!subscriber) {
      return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 404 })
    }

    if (!subscriber.unsubscribedAt) {
      await prisma.webinarSubscriber.update({
        where: { id: subscriber.id },
        data: { unsubscribedAt: new Date() }
      })
    }

    // Redirect to a simple confirmation page
    const appUrl = process.env.NEXTAUTH_URL || 'https://tryflowgrid.com'
    return NextResponse.redirect(`${appUrl}/unsubscribed`)
  } catch (error) {
    console.error('Error unsubscribing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
