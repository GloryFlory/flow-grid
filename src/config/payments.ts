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
    yearly: 23, // per month, billed annually
  },
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
