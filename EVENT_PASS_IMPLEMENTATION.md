# Event Pass Implementation - Complete Guide

## ✅ What Was Implemented

### 1. Database Changes
- **Updated `PlanType` enum** to include `EVENT_PASS`
- **Made `billingCycle` nullable** in `PaymentRequest` table (EVENT_PASS is one-time, not recurring)
- **Migration SQL**: `prisma/migrations/add_event_pass_support.sql`

### 2. New API Endpoint
- **Route**: `/api/payments/revolut/event-pass`
- **Method**: POST
- **Function**: Handles Event Pass purchases via Revolut

**What it does:**
1. Authenticates user via session
2. Fetches user's subscription to check if they have Pro (for discount pricing)
3. **Instantly increases `festivalsLimit` by 1**
4. Creates `PaymentRequest` record with status `PENDING` for admin verification
5. Returns success with updated limits

### 3. Frontend Updates

#### Pricing Page (`src/app/pricing/page.tsx`)
- Updated `handleUpgrade` function to support EVENT_PASS
- Fetches user subscription to determine pricing (€69 or €39 for Pro users)
- Opens Revolut payment modal with correct link

#### Payment Modal (`src/components/RevolutPaymentModal.tsx`)
- Routes EVENT_PASS to new `/api/payments/revolut/event-pass` endpoint
- Shows appropriate messaging: "adds 1 event slot" instead of "upgrade to Pro"
- Handles one-time purchases (no billing cycle)

## 💰 Pricing Logic

| User Plan | Event Pass Price |
|-----------|------------------|
| FREE or PRO (not active) | €69 |
| PRO (active) | €39 |

**Revolut Links (from `.env.local`):**
- Regular: `https://checkout.revolut.com/pay/e0e3f758-c25d-4446-8d39-5f956aaf9ff0`
- Pro Discount: `https://checkout.revolut.com/pay/05e21de6-8b0e-4ffb-a1c5-2249bbfd27fd`

## 🔄 Complete User Flow

### User Experience:
1. User visits `/pricing`
2. Clicks "Buy Event Pass"
3. **If not signed in**: Redirected to signin → returns to pricing
4. **If signed in**: Modal opens
5. Sees pricing (€69 or €39 based on their plan)
6. Clicks "Pay with Revolut" → Opens Revolut checkout in new tab
7. Completes payment on Revolut
8. Returns to modal, clicks "I've completed payment"
9. Clicks "Confirm Payment"
10. **Instant upgrade** - festivalsLimit +1
11. Success message shown
12. Auto-redirected to `/dashboard` after 2 seconds

### Admin Experience (You):

**View Pending Payments:**
```
Go to: /admin/payments
Filter: PENDING
```

**Payment Request Record Created:**
```javascript
{
  id: "cm...",
  userId: "cm...",
  userEmail: "user@example.com",
  userName: "John Doe",
  plan: "EVENT_PASS",
  billingCycle: null,  // null for one-time purchases
  amount: 69.00 or 39.00,
  currency: "EUR",
  paymentMethod: "REVOLUT",
  paymentLink: "https://checkout.revolut.com/pay/...",
  transactionRef: null,  // Could allow users to provide this
  verificationStatus: "PENDING",
  userUpgradedAt: "2026-04-03T12:34:56Z",  // When they clicked confirm
  createdAt: "2026-04-03T12:34:56Z",
  updatedAt: "2026-04-03T12:34:56Z"
}
```

**Verification Process:**
1. User gets instant upgrade (trust-based system)
2. You log into Revolut dashboard
3. Check if payment exists matching:
   - Amount: €69 or €39
   - Date: Around `userUpgradedAt` timestamp
   - Email/name: Match `userEmail`/`userName`
4. **If payment found**: Mark as `VERIFIED` in admin panel
5. **If no payment found**: Mark as `FLAGGED`, contact user, potentially revoke access

## 🔐 Security Considerations

**Trust-Based Instant Upgrade:**
- ✅ **Pro**: Great UX - users get immediate access
- ⚠️ **Con**: Fraud risk - users could click "confirm" without paying

**Mitigation Strategies:**
1. **Admin verification dashboard** - You manually verify all payments
2. **PaymentRequest tracking** - Full audit trail
3. **Can revoke access** - If fraud detected, you can manually reduce `festivalsLimit`
4. **Email notifications** - Could send you alerts for new purchases
5. **Low risk for MVP** - Small amounts (€39-€69), limited users

**Future Improvements:**
- Add Revolut webhook integration for automatic verification
- Email receipts to users
- Fraud detection: Flag users with multiple unverified purchases
- Rate limiting: Max 1 EVENT_PASS purchase per 24 hours

## 📊 Database Queries for Admin

### Check all pending Event Pass purchases:
```sql
SELECT 
  pr.id,
  pr."userEmail",
  pr."userName",
  pr.amount,
  pr."userUpgradedAt",
  pr."verificationStatus",
  u.email,
  s."festivalsLimit",
  s."festivalsUsed"
FROM payment_requests pr
JOIN users u ON u.id = pr."userId"
LEFT JOIN subscriptions s ON s."userId" = u.id
WHERE pr.plan = 'EVENT_PASS'
  AND pr."verificationStatus" = 'PENDING'
ORDER BY pr."userUpgradedAt" DESC;
```

### Find users who might have fraudulent purchases:
```sql
SELECT 
  pr."userId",
  pr."userEmail",
  COUNT(*) as pending_count,
  SUM(pr.amount) as total_pending_amount
FROM payment_requests pr
WHERE pr."verificationStatus" = 'PENDING'
GROUP BY pr."userId", pr."userEmail"
HAVING COUNT(*) > 2  -- More than 2 pending payments
ORDER BY pending_count DESC;
```

## 🚀 Deployment Checklist

### Before Deploying:
- [ ] Run SQL migration in Supabase SQL Editor:
  ```sql
  -- Copy content from: prisma/migrations/add_event_pass_support.sql
  ```
- [ ] Verify Revolut payment links are correct in Vercel environment variables:
  - `NEXT_PUBLIC_REVOLUT_EVENT_PASS_LINK`
  - `NEXT_PUBLIC_REVOLUT_EVENT_PASS_PRO_LINK`

### After Deploying:
- [ ] Test Event Pass purchase with your account (use test payment if possible)
- [ ] Verify `festivalsLimit` increased in database
- [ ] Check `payment_requests` table has new record
- [ ] Test admin panel shows pending payment
- [ ] Mark test payment as VERIFIED

### Production Test:
```
1. Visit: https://tryflowgrid.com/pricing
2. Click "Buy Event Pass" 
3. Sign in (if not already)
4. Modal should open with €69 or €39 pricing
5. Click "Pay with Revolut"
6. DON'T actually pay (test only)
7. Close Revolut tab
8. In modal, click "I've completed payment"
9. Should redirect to dashboard
10. Check your database - festivalsLimit should be +1
```

## 🔧 Configuration Reference

### Environment Variables (.env.local)
```bash
NEXT_PUBLIC_PAYMENTS_ENABLED="true"  # Already enabled

# Revolut Payment Links
NEXT_PUBLIC_REVOLUT_PRO_ANNUAL_LINK="https://checkout.revolut.com/pay/a0069e51-315e-4ed8-a670-eb043a3fc59a"
NEXT_PUBLIC_REVOLUT_PRO_MONTHLY_LINK="https://checkout.revolut.com/pay/705422f2-b1bc-4ad8-969e-9694321ebc9e"
NEXT_PUBLIC_REVOLUT_EVENT_PASS_LINK="https://checkout.revolut.com/pay/e0e3f758-c25d-4446-8d39-5f956aaf9ff0"
NEXT_PUBLIC_REVOLUT_EVENT_PASS_PRO_LINK="https://checkout.revolut.com/pay/05e21de6-8b0e-4ffb-a1c5-2249bbfd27fd"
```

### Pricing Configuration (src/config/payments.ts)
```typescript
EVENT_PASS: {
  regular: 69,      // EUR - standard price
  proDiscount: 39,  // EUR - discounted for Pro subscribers
}
```

## ❓ FAQ

### Q: What happens to existing Pro users when monetization is enabled?
**A:** Nothing changes! Users with `isFoundingMember: true` keep all their benefits forever. They still get the €39 discounted Event Pass pricing.

### Q: How do I manually add an Event Pass to a user?
**A:** Run this SQL in Supabase:
```sql
UPDATE subscriptions 
SET "festivalsLimit" = "festivalsLimit" + 1
WHERE "userId" = '<user-id-here>';
```

### Q: Can users purchase multiple Event Passes?
**A:** Yes! Each purchase adds +1 to their `festivalsLimit`. No maximum enforced.

### Q: What if a user claims payment but didn't actually pay?
**A:** 
1. You'll see `PENDING` in admin panel
2. Check Revolut - no matching payment
3. Mark as `FLAGGED` with reason
4. Manually reduce their `festivalsLimit` by 1:
```sql
UPDATE subscriptions 
SET "festivalsLimit" = "festivalsLimit" - 1
WHERE "userId" = '<user-id>';
```
5. Consider banning repeat offenders

### Q: When should I switch from Revolut to Stripe?
**A:** When:
- You have >50 customers (manual verification becomes tedious)
- You want automated billing/invoicing
- You need recurring subscription management
- You want automatic refunds/chargebacks
- International tax compliance needed (Stripe Tax)

For now, Revolut + manual verification is fine for MVP!

## 📁 Files Changed

1. **prisma/schema.prisma** - Updated PlanType enum, made billingCycle nullable
2. **prisma/migrations/add_event_pass_support.sql** - Migration SQL for Supabase
3. **src/app/api/payments/revolut/event-pass/route.ts** - NEW - Event Pass purchase endpoint
4. **src/app/pricing/page.tsx** - Updated handleUpgrade to support EVENT_PASS
5. **src/components/RevolutPaymentModal.tsx** - Updated to handle EVENT_PASS messaging

## 🎯 Next Steps

1. **Run migration** in Supabase SQL Editor
2. **Commit and deploy** all changes
3. **Test** with your account (can do a real €39 purchase as Pro user)
4. **Monitor** admin panel for any purchases
5. **Verify payments** daily in Revolut dashboard
