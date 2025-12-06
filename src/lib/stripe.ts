import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Price IDs - replace these with your actual Stripe price IDs
// Only PRO is self-serve. Enterprise is contact-us (custom pricing).
export const STRIPE_PRICES = {
  PRO: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  },
  EVENT_PASS: {
    'one-time': process.env.STRIPE_EVENT_PASS_PRICE_ID || 'price_event_pass_69',
    'one-time-pro-discount': process.env.STRIPE_EVENT_PASS_PRO_PRICE_ID || 'price_event_pass_39',
  },
} as const

export type BillingPeriod = 'monthly' | 'yearly' | 'one-time' | 'one-time-pro-discount'

