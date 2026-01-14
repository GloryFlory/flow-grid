/**
 * Payment Configuration
 * 
 * Controls whether payments are enabled globally.
 * Set NEXT_PUBLIC_PAYMENTS_ENABLED=true in production when ready to charge.
 * 
 * During "Early Access" phase:
 * - All new signups get PRO with 5 free events
 * - Pricing page shows "Early Access - Free" badges
 * - No payment buttons, just signup CTAs
 * 
 * When payments are enabled:
 * - Pricing page shows real prices
 * - Stripe checkout flows become active
 * - Existing founding members keep their benefits
 */

export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

// Pricing configuration
export const PRICING = {
  EVENT_PASS: {
    regular: 69, // EUR - standard price
    proDiscount: 39, // EUR - discounted price for Pro subscribers
  },
  PRO: {
    monthly: 29,
    yearly: 23, // per month, billed annually (€276/year)
    yearlyTotal: 276, // Total annual cost
  },
};

// Revolut Payment Links
export const REVOLUT_LINKS = {
  PRO_ANNUAL: process.env.NEXT_PUBLIC_REVOLUT_PRO_ANNUAL_LINK || '',
  PRO_MONTHLY: process.env.NEXT_PUBLIC_REVOLUT_PRO_MONTHLY_LINK || '',
  EVENT_PASS_REGULAR: process.env.NEXT_PUBLIC_REVOLUT_EVENT_PASS_LINK || '',
  EVENT_PASS_PRO: process.env.NEXT_PUBLIC_REVOLUT_EVENT_PASS_PRO_LINK || '',
};

// Early access messaging
export const EARLY_ACCESS_CONFIG = {
  badge: 'Early Access',
  tagline: 'Your first 5 events are on us',
  proDescription: 'Start free with 5 events included',
  eventPassDescription: 'Try all Pro features free',
  ctaText: 'Get Started Free',
  freeEventsIncluded: 5,
};
