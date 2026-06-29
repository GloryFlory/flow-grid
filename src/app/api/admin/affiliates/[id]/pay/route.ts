import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/affiliates/[id]/pay
 * Marks an affiliate referral as paid.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const body = await req.json()
  const { notes } = body

  const referral = await prisma.affiliateReferral.findUnique({
    where: { id: params.id },
  })

  if (!referral) {
    return NextResponse.json({ error: 'Referral not found' }, { status: 404 })
  }

  if (referral.status !== 'CONVERTED') {
    return NextResponse.json({ error: 'Only CONVERTED referrals can be marked as paid' }, { status: 400 })
  }

  const updated = await prisma.affiliateReferral.update({
    where: { id: params.id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      paidBy: session.user.id,
      notes: notes ?? referral.notes,
    },
  })

  return NextResponse.json({ success: true, referral: updated })
}
