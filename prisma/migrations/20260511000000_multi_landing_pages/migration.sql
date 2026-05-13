-- Migration: Multi Landing Pages + Page Types
-- Run this in the Supabase SQL Editor

-- 1. Add new columns to landing_pages
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "pageType" TEXT NOT NULL DEFAULT 'WEBINAR';
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "pageSlug" TEXT NOT NULL DEFAULT 'webinar';
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "title" TEXT NOT NULL DEFAULT 'Webinar Signup';

-- 2. Drop the old 1:1 unique constraint on festivalId
ALTER TABLE "landing_pages" DROP CONSTRAINT IF EXISTS "landing_pages_festivalId_key";

-- 3. Add composite unique constraint (one slug per festival)
ALTER TABLE "landing_pages" ADD CONSTRAINT "landing_pages_festivalId_pageSlug_key" UNIQUE ("festivalId", "pageSlug");

-- 4. Add landingPageId to webinar_subscribers (nullable first for backfill)
ALTER TABLE "webinar_subscribers" ADD COLUMN IF NOT EXISTS "landingPageId" TEXT;

-- 5. Backfill landingPageId from the landing_pages table
UPDATE "webinar_subscribers" ws
SET "landingPageId" = lp.id
FROM "landing_pages" lp
WHERE lp."festivalId" = ws."festivalId"
  AND ws."landingPageId" IS NULL;

-- 6. Delete any orphaned subscribers (those whose festival had no landing page)
DELETE FROM "webinar_subscribers" WHERE "landingPageId" IS NULL;

-- 7. Make landingPageId NOT NULL
ALTER TABLE "webinar_subscribers" ALTER COLUMN "landingPageId" SET NOT NULL;

-- 8. Drop old unique constraint
ALTER TABLE "webinar_subscribers" DROP CONSTRAINT IF EXISTS "webinar_subscribers_festivalId_email_key";

-- 9. Add new unique constraint per landing page
ALTER TABLE "webinar_subscribers" ADD CONSTRAINT "webinar_subscribers_landingPageId_email_key" UNIQUE ("landingPageId", "email");

-- 10. Add FK constraint from subscribers to landing_pages
ALTER TABLE "webinar_subscribers" ADD CONSTRAINT "webinar_subscribers_landingPageId_fkey"
  FOREIGN KEY ("landingPageId") REFERENCES "landing_pages"(id) ON DELETE CASCADE;

-- 11. Add index for fast subscriber lookups per page
CREATE INDEX IF NOT EXISTS "webinar_subscribers_landingPageId_idx" ON "webinar_subscribers"("landingPageId");

-- Done. Existing data is preserved: current page gets pageType='WEBINAR', pageSlug='webinar'.

-- 12. Add webinarEndDate column (optional end date for events / early-bird deadlines)
ALTER TABLE "landing_pages" ADD COLUMN IF NOT EXISTS "webinarEndDate" TIMESTAMPTZ;
