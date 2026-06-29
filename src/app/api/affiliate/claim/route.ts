import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/affiliate/claim
 *
 * Called once after signup (from the dashboard layout) to link the fg_ref
 * cookie to the newly created user. Safe to call multiple times — idempotent.
 */
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const refCode = req.cookies.get('fg_ref')?.value
  if (!refCode) {
    return NextResponse.json({ claimed: false })
  }

  // Find the affiliate user by code
  const affiliateUser = await prisma.user.findUnique({
    where: { affiliateCode: refCode },
    select: { id: true },
  })

  if (!affiliateUser) {
    return NextResponse.json({ claimed: false })
  }

  // Don't let someone refer themselves
  if (affiliateUser.id === session.user.id) {
    return NextResponse.json({ claimed: false })
  }

  // Check if this user already has a referral record
  const existing = await prisma.affiliateReferral.findFirst({
    where: { referredUserId: session.user.id },
  })

  if (existing) {
    return NextResponse.json({ claimed: false })
  }

  await prisma.affiliateReferral.create({
    data: {
      affiliateUserId: affiliateUser.id,
      referredUserId: session.user.id,
      referredEmail: session.user.email ?? null,
      status: 'SIGNED_UP',
      signedUpAt: new Date(),
    },
  })

  // Clear the cookie in the response
  const response = NextResponse.json({ claimed: true })
  response.cookies.set('fg_ref', '', { maxAge: 0, path: '/' })
  return response
}
