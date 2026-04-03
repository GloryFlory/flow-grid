-- Add EVENT_PASS to PlanType enum
ALTER TYPE "PlanType" ADD VALUE IF NOT EXISTS 'EVENT_PASS';

-- Make billingCycle nullable in payment_requests table
ALTER TABLE "payment_requests" ALTER COLUMN "billingCycle" DROP NOT NULL;

-- ============================================================
-- Backfill existing users as Founding Members
-- Gives all current users: PRO plan, 10 free events, founding member status
-- ============================================================

-- Update existing subscriptions
UPDATE "subscriptions"
SET
  "plan" = 'PRO',
  "status" = 'ACTIVE',
  "isFoundingMember" = true,
  "festivalsLimit" = GREATEST("festivalsLimit", 10), -- Don't reduce anyone's existing limit
  "stripeCurrentPeriodEnd" = GREATEST(
    COALESCE("stripeCurrentPeriodEnd", NOW()),
    NOW() + INTERVAL '1 year'
  ),
  "updatedAt" = NOW()
WHERE "isFoundingMember" = false OR "plan" = 'FREE';

-- Create subscriptions for any users who somehow don't have one yet
INSERT INTO "subscriptions" (
  "id", "userId", "plan", "status", "isFoundingMember",
  "festivalsLimit", "festivalsUsed", "stripeCurrentPeriodEnd",
  "createdAt", "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  u."id",
  'PRO',
  'ACTIVE',
  true,
  10,
  0,
  NOW() + INTERVAL '1 year',
  NOW(),
  NOW()
FROM "users" u
LEFT JOIN "subscriptions" s ON s."userId" = u."id"
WHERE s."id" IS NULL;
