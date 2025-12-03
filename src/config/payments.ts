/**
 * Payment Configuration
 * 
 * Controls whether payments are enabled globally.
 * Set NEXT_PUBLIC_PAYMENTS_ENABLED=true in production when ready to charge.
 * 
 * During "Early Access" phase:
 * - All new signups get PRO for 1 year free
 * - Pricing page shows "Early Access - Free" badges
 * - No payment buttons, just signup CTAs
 * 
 * When payments are enabled:
 * - Pricing page shows real prices
 * - Stripe checkout flows become active
 * - Existing founding members keep their benefits until expiry
 */

export const PAYMENTS_ENABLED = process.env.NEXT_PUBLIC_PAYMENTS_ENABLED === 'true';

// Early access messaging
export const EARLY_ACCESS_CONFIG = {
  badge: 'Early Access',
  tagline: 'Free for founding members',
  proDescription: 'Get Pro free for 1 year',
  eventPassDescription: 'Try all Pro features free',
  ctaText: 'Get Free Access',
  expiryMonths: 12,
};
