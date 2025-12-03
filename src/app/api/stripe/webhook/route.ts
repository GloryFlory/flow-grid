import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { PlanType } from '@prisma/client'
import { PLAN_FEATURES } from '@/types'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdated(subscription)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentFailed(invoice)
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        await handlePaymentSucceeded(invoice)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId
  const plan = session.metadata?.plan
  const billingPeriod = session.metadata?.billingPeriod

  if (!userId || !plan) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Handle Event Pass one-time purchase
  if (plan === 'EVENT_PASS') {
    await handleEventPassPurchase(userId, session.customer as string)
    return
  }

  // Handle subscription (Pro plan)
  const subscriptionId = session.subscription as string
  const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId)

  const planFeatures = PLAN_FEATURES[plan as PlanType]

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: subscriptionId,
      stripePriceId: stripeSubscription.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      plan: plan as PlanType,
      status: 'ACTIVE',
      festivalsLimit: planFeatures.festivalsLimit,
    },
    update: {
      stripeSubscriptionId: subscriptionId,
      stripePriceId: stripeSubscription.items.data[0]?.price.id,
      stripeCurrentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
      plan: plan as PlanType,
      status: 'ACTIVE',
      festivalsLimit: planFeatures.festivalsLimit,
    },
  })

  console.log(`✅ User ${userId} upgraded to ${plan}`)
}

async function handleEventPassPurchase(userId: string, customerId: string) {
  // Event Pass: add 1 to festivalsLimit
  // TODO: Also increment eventPassCount once the migration is applied
  const existingSubscription = await prisma.subscription.findUnique({
    where: { userId }
  })

  if (existingSubscription) {
    // User has existing subscription - increment festivals limit
    await prisma.subscription.update({
      where: { userId },
      data: {
        stripeCustomerId: customerId,
        // eventPassCount: { increment: 1 },  // TODO: Uncomment after migration
        festivalsLimit: { increment: 1 },
      },
    })
    console.log(`✅ User ${userId} purchased Event Pass (festivalsLimit: ${existingSubscription.festivalsLimit + 1})`)
  } else {
    // Create new subscription with Event Pass
    await prisma.subscription.create({
      data: {
        userId,
        stripeCustomerId: customerId,
        plan: 'FREE', // Event Pass doesn't change the plan type
        status: 'ACTIVE',
        // eventPassCount: 1,  // TODO: Uncomment after migration
        festivalsLimit: 2, // 1 free + 1 from Event Pass
      },
    })
    console.log(`✅ User ${userId} purchased first Event Pass`)
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  
  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!dbSubscription) {
    console.error('Subscription not found for customer:', customerId)
    return
  }

  // Determine plan from price ID
  const priceId = subscription.items.data[0]?.price.id
  let plan: PlanType = 'FREE'
  
  // You'll need to map your actual price IDs here
  if (priceId?.includes('pro') || priceId === process.env.STRIPE_PRO_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_PRO_YEARLY_PRICE_ID) {
    plan = 'PRO'
  } else if (priceId?.includes('enterprise') || priceId === process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || priceId === process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID) {
    plan = 'ENTERPRISE'
  }

  const planFeatures = PLAN_FEATURES[plan]

  // Map Stripe status to our status
  let status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'UNPAID' = 'ACTIVE'
  if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
    status = subscription.status === 'canceled' ? 'CANCELED' : 'UNPAID'
  } else if (subscription.status === 'past_due') {
    status = 'PAST_DUE'
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: subscription.current_period_end 
        ? new Date(subscription.current_period_end * 1000) 
        : undefined,
      plan,
      status,
      festivalsLimit: planFeatures.festivalsLimit,
    },
  })

  console.log(`✅ Subscription updated for customer ${customerId}: ${plan} (${status})`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!dbSubscription) {
    console.error('Subscription not found for customer:', customerId)
    return
  }

  // Downgrade to free plan
  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      plan: 'FREE',
      status: 'CANCELED',
      festivalsLimit: 1,
    },
  })

  console.log(`✅ Subscription cancelled for customer ${customerId}, downgraded to FREE`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!dbSubscription) {
    return
  }

  await prisma.subscription.update({
    where: { id: dbSubscription.id },
    data: {
      status: 'PAST_DUE',
    },
  })

  console.log(`⚠️ Payment failed for customer ${customerId}`)
  
  // TODO: Send email notification about failed payment
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const dbSubscription = await prisma.subscription.findFirst({
    where: { stripeCustomerId: customerId }
  })

  if (!dbSubscription) {
    return
  }

  // Only update if it was past due
  if (dbSubscription.status === 'PAST_DUE') {
    await prisma.subscription.update({
      where: { id: dbSubscription.id },
      data: {
        status: 'ACTIVE',
      },
    })

    console.log(`✅ Payment succeeded, subscription reactivated for customer ${customerId}`)
  }
}
