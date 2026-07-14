/**
 * Monetisation Configuration
 *
 * Flow Grid is free to use — all features included, no paid tiers.
 * The project is supported by donations (Buy Me a Coffee).
 *
 * FORMER_PRICING keeps the retired plan prices around so the pricing page
 * can show what the product would cost — struck through — next to the
 * donation ask. Purely informational; nothing charges these amounts.
 */

// Where "Support Flow Grid" buttons point.
export const DONATION_URL = 'https://buymeacoffee.com/florianhohenleitner';

// Retired prices, shown struck-through on /pricing for context.
export const FORMER_PRICING = {
  EVENT_PASS: {
    regular: 69, // EUR — was: one-time price per extra event
  },
  PRO: {
    monthly: 29, // EUR — was: per month
    yearly: 23, // EUR — was: per month, billed annually (€276/year)
    yearlyTotal: 276,
  },
};
