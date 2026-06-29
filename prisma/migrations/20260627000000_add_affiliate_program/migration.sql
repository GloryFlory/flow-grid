-- Migration: Affiliate Program
-- Safe to run on existing data — all new columns are nullable or have defaults

-- 1. Add affiliateCode to users (nullable, unique — backfilled lazily on next login)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "affiliateCode" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "users_affiliateCode_key" ON "users"("affiliateCode");

-- 2. Create AffiliateStatus enum
DO $$ BEGIN
  CREATE TYPE "AffiliateStatus" AS ENUM ('SIGNED_UP', 'CONVERTED', 'PAID');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. Create affiliate_referrals table
CREATE TABLE IF NOT EXISTS "affiliate_referrals" (
  "id"              TEXT NOT NULL,
  "affiliateUserId" TEXT NOT NULL,
  "referredUserId"  TEXT,
  "referredEmail"   TEXT,
  "conversionType"  TEXT,
  "payoutAmount"    DECIMAL(65,30),
  "status"          "AffiliateStatus" NOT NULL DEFAULT 'SIGNED_UP',
  "signedUpAt"      TIMESTAMPTZ,
  "convertedAt"     TIMESTAMPTZ,
  "paidAt"          TIMESTAMPTZ,
  "paidBy"          TEXT,
  "notes"           TEXT,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT "affiliate_referrals_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "affiliate_referrals_affiliateUserId_referredUserId_key"
    UNIQUE ("affiliateUserId", "referredUserId"),
  CONSTRAINT "affiliate_referrals_affiliateUserId_fkey"
    FOREIGN KEY ("affiliateUserId") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "affiliate_referrals_referredUserId_fkey"
    FOREIGN KEY ("referredUserId") REFERENCES "users"("id") ON DELETE SET NULL
);

-- 4. Indexes for fast lookups
CREATE INDEX IF NOT EXISTS "affiliate_referrals_affiliateUserId_idx" ON "affiliate_referrals"("affiliateUserId");
CREATE INDEX IF NOT EXISTS "affiliate_referrals_referredUserId_idx" ON "affiliate_referrals"("referredUserId");
CREATE INDEX IF NOT EXISTS "affiliate_referrals_status_idx" ON "affiliate_referrals"("status");

-- 5. Enable Row Level Security
ALTER TABLE "affiliate_referrals" ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read their own affiliate rows only
CREATE POLICY "affiliate_referrals_select_own"
  ON "affiliate_referrals" FOR SELECT
  TO authenticated
  USING ("affiliateUserId" = auth.uid()::TEXT);

-- All writes go through the server (Prisma service role) — no client write policies needed.

-- 6. Backfill affiliate codes for existing users who don't have one
UPDATE "users"
SET "affiliateCode" = UPPER(SUBSTRING(MD5(id || RANDOM()::TEXT) FROM 1 FOR 8))
WHERE "affiliateCode" IS NULL;
