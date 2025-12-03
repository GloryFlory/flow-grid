import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, STRIPE_PRICES, BillingPeriod } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'You must be signed in to upgrade' },
        { status: 401 }
      )
    }

    const { plan, billingPeriod } = await request.json() as {
      plan: 'PRO' | 'EVENT_PASS'
      billingPeriod: BillingPeriod
    }

    // Only PRO and EVENT_PASS are self-serve, Enterprise requires contact
    if (plan !== 'PRO' && plan !== 'EVENT_PASS') {
      return NextResponse.json(
        { error: 'Invalid plan. For Enterprise, please contact sales.' },
        { status: 400 }
      )
    }

    // Validate billing period based on plan
    if (plan === 'EVENT_PASS' && billingPeriod !== 'one-time') {
      return NextResponse.json(
        { error: 'Event Pass is a one-time purchase' },
        { status: 400 }
      )
    }

    if (plan === 'PRO' && !['monthly', 'yearly'].includes(billingPeriod)) {
      return NextResponse.json(
        { error: 'Invalid billing period for Pro' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
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

    let customerId = user.subscription?.stripeCustomerId

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id

      // Save customer ID to database
      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          stripeCustomerId: customerId,
          plan: 'FREE',
          status: 'ACTIVE',
          festivalsLimit: 1,
        },
        update: {
          stripeCustomerId: customerId,
        },
      })
    }

    // Get the correct price ID
    const priceId = plan === 'EVENT_PASS' 
      ? STRIPE_PRICES.EVENT_PASS['one-time']
      : STRIPE_PRICES.PRO[billingPeriod as 'monthly' | 'yearly']

    // Create Stripe checkout session
    // Event Pass is a one-time payment, Pro is a subscription
    if (plan === 'EVENT_PASS') {
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgrade=success&plan=${plan}`,
        cancel_url: `${process.env.NEXTAUTH_URL}/pricing?upgrade=cancelled`,
        metadata: {
          userId: user.id,
          plan,
          billingPeriod: 'one-time',
        },
        allow_promotion_codes: true,
      })

      return NextResponse.json({ url: checkoutSession.url })
    }

    // Pro subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgrade=success&plan=${plan}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?upgrade=cancelled`,
      metadata: {
        userId: user.id,
        plan,
        billingPeriod,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          plan,
        },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
