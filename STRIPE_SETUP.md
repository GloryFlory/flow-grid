# Stripe Monetization Setup Guide

This guide walks you through setting up Stripe for Flow Grid's monetization.

## 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Complete the business verification process
3. Activate your account for live payments

## 2. Create Products and Prices

In the Stripe Dashboard, go to **Products** and create:

### Pro Plan
- **Name**: Flow Grid Pro
- **Description**: For growing events and retreats

Create two prices:
- Monthly: **$19/month** (recurring)
- Yearly: **$180/year** (save 20%)

### Enterprise Plan
- **Name**: Flow Grid Enterprise  
- **Description**: For agencies and large events

Create two prices:
- Monthly: **$49/month** (recurring)
- Yearly: **$468/year** (save 20%)

## 3. Get Your API Keys

In Stripe Dashboard → Developers → API Keys:

- **Publishable key**: `pk_live_...` or `pk_test_...`
- **Secret key**: `sk_live_...` or `sk_test_...`

## 4. Create Webhook Endpoint

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. URL: `https://yourdomain.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`
5. Copy the **Signing secret**: `whsec_...`

## 5. Configure Customer Portal

1. Go to Settings → Billing → Customer portal
2. Enable the features you want:
   - ✅ Allow customers to update subscriptions
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to update payment methods
   - ✅ Show invoice history

## 6. Set Environment Variables

Add these to your Vercel/local environment:

```bash
# Stripe API Keys
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# Stripe Price IDs (from step 2)
STRIPE_PRO_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_PRO_YEARLY_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_xxxxx
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=price_xxxxx
```

## 7. Test Mode

For testing, use your test API keys (start with `pk_test_` and `sk_test_`).

### Test Card Numbers
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Requires Auth**: 4000 0025 0000 3155

## 8. Pricing Page

The pricing page is available at `/pricing`. It includes:
- Three tiers: Free, Pro, Enterprise
- Monthly/yearly toggle (20% discount for yearly)
- Feature comparison table
- FAQ section
- Stripe checkout integration

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stripe/checkout` | POST | Create checkout session |
| `/api/stripe/webhook` | POST | Handle Stripe webhooks |
| `/api/stripe/portal` | POST | Open customer portal |
| `/api/user/limits` | GET | Get user's plan limits |

## Plan Features

| Feature | Free | Pro | Enterprise |
|---------|------|-----|------------|
| Festivals | 1 | 10 | Unlimited |
| Sessions/festival | 50 | ∞ | ∞ |
| Custom branding | ❌ | ✅ | ✅ |
| Custom domain | ❌ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ |
| Priority support | ❌ | ✅ | ✅ |
| White-label | ❌ | ❌ | ✅ |

## Troubleshooting

### Webhook not receiving events
- Verify the endpoint URL is correct and publicly accessible
- Check the webhook signing secret is correct
- Look at Stripe Dashboard → Developers → Webhooks → Event logs

### Checkout not redirecting
- Ensure `NEXTAUTH_URL` is set correctly
- Check browser console for errors
- Verify the price ID is valid

### Customer portal not working
- Ensure customer portal is enabled in Stripe settings
- Verify the customer has a valid `stripeCustomerId`

## Going Live Checklist

- [ ] Switch from test to live API keys
- [ ] Update webhook endpoint to production URL
- [ ] Test a real payment with a small amount
- [ ] Verify webhook events are being received
- [ ] Set up email notifications for failed payments
- [ ] Configure tax settings if needed
