import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/affiliate/stats
 * Returns the current user's affiliate code, link, and referral history.
 */
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { affiliateCode: true },
  })

  const referrals = await prisma.affiliateReferral.findMany({
    where: { affiliateUserId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      referredEmail: true,
      conversionType: true,
      payoutAmount: true,
      status: true,
      signedUpAt: true,
      convertedAt: true,
      paidAt: true,
    },
  })

  const totalEarned = referrals
    .filter((r) => r.status === 'PAID')
    .reduce((sum, r) => sum + Number(r.payoutAmount ?? 0), 0)

  const pendingPayout = referrals
    .filter((r) => r.status === 'CONVERTED')
    .reduce((sum, r) => sum + Number(r.payoutAmount ?? 0), 0)

  return NextResponse.json({
    affiliateCode: user?.affiliateCode ?? null,
    referrals,
    stats: {
      totalReferrals: referrals.length,
      conversions: referrals.filter((r) => r.status !== 'SIGNED_UP').length,
      pendingPayout,
      totalEarned,
    },
  })
}
