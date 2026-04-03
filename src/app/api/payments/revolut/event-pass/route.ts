import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PRICING } from '@/config/payments'
import { Prisma } from '@prisma/client'

/**
 * POST /api/payments/revolut/event-pass
 * 
 * User confirms they've completed a Revolut Event Pass payment.
 * Instantly increases their festivalsLimit by 1 and creates PaymentRequest for admin verification.
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
    const { transactionRef } = body

    // Get user and subscription details
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Determine pricing based on user's plan
    const isPro = user.subscription?.plan === 'PRO'
    const amount = isPro ? PRICING.EVENT_PASS.proDiscount : PRICING.EVENT_PASS.regular

    // Increase festivals limit by 1
    const updatedSubscription = await prisma.subscription.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        plan: 'FREE',
        status: 'ACTIVE',
        festivalsUsed: user.subscription?.festivalsUsed || 0,
        festivalsLimit: (user.subscription?.festivalsLimit || 1) + 1, // Add 1 event slot
      },
      update: {
        festivalsLimit: {
          increment: 1 // Add 1 event slot
        }
      }
    })

    // Create payment request for admin verification
    // Note: 'EVENT_PASS' and nullable billingCycle require the DB migration to be run first
    // (prisma/migrations/add_event_pass_support.sql)
    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        userId: user.id,
        userEmail: user.email,
        userName: user.name || undefined,
        plan: 'EVENT_PASS' as any, // Valid after running add_event_pass_support.sql migration
        billingCycle: null as any,  // Nullable after migration; null = one-time purchase
        amount,
        currency: 'EUR',
        paymentMethod: 'REVOLUT',
        paymentLink: isPro 
          ? process.env.NEXT_PUBLIC_REVOLUT_EVENT_PASS_PRO_LINK 
          : process.env.NEXT_PUBLIC_REVOLUT_EVENT_PASS_LINK,
        transactionRef: transactionRef || undefined,
        verificationStatus: 'PENDING',
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Event Pass activated! Your festivals limit has been increased by 1.',
      subscription: {
        festivalsLimit: updatedSubscription.festivalsLimit,
        festivalsUsed: updatedSubscription.festivalsUsed,
      },
      paymentRequestId: paymentRequest.id,
    })

  } catch (error) {
    console.error('Event Pass purchase error:', error)
    return NextResponse.json(
      { error: 'Failed to process Event Pass purchase' },
      { status: 500 }
    )
  }
}
