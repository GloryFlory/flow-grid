# Monetisation — current state and how to turn it back on

_Last updated: July 2026_

## Current state

Monetisation is **switched off**. Flow Grid is free for everyone and supported by
donations (Buy Me a Coffee — the link lives in `src/config/payments.ts` as
`DONATION_URL`). There are no payment flows in the codebase.

What every account gets: unlimited published events, all former Pro features
(fonts, embed widget, duplication, full analytics + export, landing pages), and
team collaboration (flat cap of 10 members per festival as an email-spam backstop).

The one thing still differentiated: the **"Powered by Flow Grid" watermark**.
Grandfathered PRO/founding-member accounts keep it hidden (logic in
`src/app/api/public/festivals/[slug]/route.ts`); everyone else shows it.

## What was intentionally preserved (so payments CAN come back)

- **Database schema and data untouched** — the `Subscription` model, plan enums,
  Stripe customer fields, `isFoundingMember`, and every user's stored plan are
  all still there.
- **The feature-gating mechanism** — `PLAN_FEATURES` in `src/types/index.ts`,
  the `usePlanLimits` hook, and `/api/user/limits` + `/api/user/subscription`
  still run on every dashboard page. They currently *report* "everything
  unlocked"; the wiring to gate features again is intact.
- **The plan structure as marketing** — `/pricing` still shows the full
  Free / Event Pass / Pro / Enterprise comparison with struck-through prices,
  so the commercial story stays visible to users.
- **Founding-member perks** — badge + watermark-free, honoured everywhere.

## What was removed (July 2026 teardown) and where it lives

Deleted from the working tree, fully recoverable from git history:

- `src/app/api/stripe/{checkout,portal,webhook}/` and `src/lib/stripe.ts`
- `src/app/api/payments/revolut/{confirm,event-pass}/`
- `src/components/RevolutPaymentModal.tsx`, `UpgradePrompt.tsx`, `PlanLimitsBanner.tsx`
- `src/app/admin/payments/` + `src/app/api/admin/payments/` (manual verification queue)
- `src/app/claim-pro/`
- npm deps: `stripe`, `@stripe/stripe-js`

To view or restore any of it:

```bash
# find the commit that deleted a path
git log --diff-filter=D --oneline -- src/app/api/stripe

# restore a file from just before that commit
git checkout <deleting-commit>^ -- src/app/api/stripe
```

## Re-enable checklist (if payments come back)

1. **Decide the payment rail first.** Do NOT resurrect the old Revolut confirm
   flow — it upgraded users on an unverified self-claim (security finding #5,
   July 2026 review). Stripe with a real business account + verified webhooks
   is the sane path; the old webhook handler is a useful reference, not a
   drop-in (it was written for price IDs that no longer exist).
2. Re-tighten `PLAN_FEATURES.FREE` in `src/types/index.ts` (limits + feature booleans).
3. Restore limit enforcement in:
   - `src/app/api/festivals/route.ts` (publish limit — removed block is in git history)
   - `src/app/api/festivals/[id]/team/invite/route.ts` (plan-based team limits)
   - `src/app/api/user/limits/route.ts` + `src/app/api/user/subscription/route.ts`
     (currently hardcode unlimited)
4. Un-hardcode the per-page overrides: `canUseFonts` in
   `dashboard/festivals/[id]/branding/page.tsx`, `isPro`/`teamMemberLimit` in
   `dashboard/festivals/[id]/team/page.tsx`.
5. Swap `/pricing` messaging back: remove the "monetisation is off" banner/hero,
   un-strike the prices, restore purchase CTAs (old page: `git show 722287a:src/app/pricing/page.tsx`).
6. Restore upgrade CTAs where wanted (dashboard, settings "Plan & Support" tab,
   homepage pricing section).
7. Grandfather generously: anyone who published events while the tool was free
   should keep what they have — the FAQ on /pricing publicly promises this.
