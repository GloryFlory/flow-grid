import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PRICING } from '@/config/payments'

/**
 * POST /api/payments/revolut/confirm
 * 
 * User confirms they've completed a Revolut payment.
 * Instantly upgrades them to Pro and creates PaymentRequest for admin verification.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { plan, billingCycle, transactionRef } = body

    // Validate input
    if (plan !== 'PRO') {
      return NextResponse.json(
        { error: 'Invalid plan. Only PRO upgrades supported.' },
        { status: 400 }
      )
    }

    if (!['MONTHLY', 'YEARLY'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle' },
        { status: 400 }
      )
    }

    // Calculate amount
    const amount = billingCycle === 'YEARLY' 
      ? PRICING.PRO.yearlyTotal 
      : PRICING.PRO.monthly

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Calculate subscription end date
    const now = new Date()
    const subscriptionEndDate = new Date(now)
    if (billingCycle === 'YEARLY') {
      subscriptionEndDate.setFullYear(now.getFullYear() + 1)
    } else {
      subscriptionEndDate.setMonth(now.getMonth() + 1)
    }

    // Transaction: Create payment request + upgrade user
    const result = await prisma.$transaction(async (tx) => {
      // Create payment request record
      const paymentRequest = await tx.paymentRequest.create({
        data: {
          userId: session.user.id!,
          userEmail: user.email,
          userName: user.name,
          plan: 'PRO',
          billingCycle,
          amount,
          currency: 'EUR',
          paymentMethod: 'REVOLUT',
          transactionRef: transactionRef || null,
          verificationStatus: 'PENDING',
        }
      })

      // Upgrade user subscription (or create if doesn't exist)
      const subscription = await tx.subscription.upsert({
        where: { userId: session.user.id! },
        create: {
          userId: session.user.id!,
          plan: 'PRO',
          status: 'ACTIVE',
          stripeCurrentPeriodEnd: subscriptionEndDate,
          festivalsLimit: 999, // Unlimited for Pro
        },
        update: {
          plan: 'PRO',
          status: 'ACTIVE',
          stripeCurrentPeriodEnd: subscriptionEndDate,
          festivalsLimit: 999,
        }
      })

      return { paymentRequest, subscription }
    })

    return NextResponse.json({
      success: true,
      message: 'You have been upgraded to Pro! Payment verification pending.',
      paymentRequest: {
        id: result.paymentRequest.id,
        status: result.paymentRequest.verificationStatus,
        amount: result.paymentRequest.amount.toString(),
        billingCycle: result.paymentRequest.billingCycle,
      },
      subscription: {
        plan: result.subscription.plan,
        validUntil: result.subscription.stripeCurrentPeriodEnd,
      }
    })

  } catch (error) {
    console.error('Error confirming Revolut payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment confirmation' },
      { status: 500 }
    )
  }
}
