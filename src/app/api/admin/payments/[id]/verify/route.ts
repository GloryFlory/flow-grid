import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * POST /api/admin/payments/[id]/verify
 * 
 * Admin verifies or flags a payment request
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await req.json()
    const { action, notes } = body // action: 'VERIFY' or 'FLAG'

    if (!['VERIFY', 'FLAG'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be VERIFY or FLAG' },
        { status: 400 }
      )
    }

    // Update payment request
    const paymentRequest = await prisma.paymentRequest.update({
      where: { id: params.id },
      data: {
        verificationStatus: action === 'VERIFY' ? 'VERIFIED' : 'FLAGGED',
        verifiedAt: action === 'VERIFY' ? new Date() : null,
        verifiedBy: action === 'VERIFY' ? session.user.id : null,
        flaggedAt: action === 'FLAG' ? new Date() : null,
        flaggedBy: action === 'FLAG' ? session.user.id : null,
        flagReason: action === 'FLAG' ? notes : null,
        adminNotes: notes || null,
      },
      include: {
        // Note: We don't have a relation to User in PaymentRequest
        // We'll fetch user separately if needed
      }
    })

    return NextResponse.json({
      success: true,
      paymentRequest: {
        id: paymentRequest.id,
        status: paymentRequest.verificationStatus,
        userEmail: paymentRequest.userEmail,
        amount: paymentRequest.amount.toString(),
      }
    })

  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
