import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/admin/payments
 * 
 * Get all payment requests for admin verification
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is admin
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Get filter from query params
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'ALL'

    // Build where clause
    const where = status === 'ALL' 
      ? {}
      : { verificationStatus: status as 'PENDING' | 'VERIFIED' | 'FLAGGED' }

    // Fetch payment requests
    const payments = await prisma.paymentRequest.findMany({
      where,
      orderBy: { userUpgradedAt: 'desc' },
    })

    return NextResponse.json({
      payments: payments.map(p => ({
        id: p.id,
        userEmail: p.userEmail,
        userName: p.userName,
        plan: p.plan,
        billingCycle: p.billingCycle,
        amount: p.amount.toString(),
        verificationStatus: p.verificationStatus,
        userUpgradedAt: p.userUpgradedAt.toISOString(),
        transactionRef: p.transactionRef,
        adminNotes: p.adminNotes,
        flagReason: p.flagReason,
      }))
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
