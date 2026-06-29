import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/affiliates?status=CONVERTED|PAID|ALL
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })
  if (admin?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
  }

  const statusParam = req.nextUrl.searchParams.get('status') ?? 'CONVERTED'
  const statuses: ('CONVERTED' | 'PAID')[] = statusParam === 'ALL' ? ['CONVERTED', 'PAID'] : [statusParam as 'CONVERTED' | 'PAID']

  const referrals = await prisma.affiliateReferral.findMany({
    where: { status: { in: statuses } },
    orderBy: { convertedAt: 'desc' },
  })

  // Fetch affiliate user details separately
  const userIds = [...new Set(referrals.map((r) => r.affiliateUserId))]
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, email: true, name: true },
  })
  const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

  return NextResponse.json({
    referrals: referrals.map((r) => ({
      id: r.id,
      affiliateUserId: r.affiliateUserId,
      affiliateEmail: userMap[r.affiliateUserId]?.email ?? null,
      affiliateName: userMap[r.affiliateUserId]?.name ?? null,
      referredEmail: r.referredEmail,
      conversionType: r.conversionType,
      payoutAmount: r.payoutAmount?.toString() ?? null,
      status: r.status,
      convertedAt: r.convertedAt?.toISOString() ?? null,
      paidAt: r.paidAt?.toISOString() ?? null,
      notes: r.notes,
    })),
  })
}
