-- CreateIndex (Performance optimization - safe to add)
-- Speeds up public festival lookups by slug
CREATE INDEX IF NOT EXISTS "festivals_slug_isPublished_idx" ON "festivals"("slug", "isPublished");

-- CreateIndex (Performance optimization - safe to add)
-- Speeds up user's festivals list
CREATE INDEX IF NOT EXISTS "festivals_userId_idx" ON "festivals"("userId");

-- CreateIndex (Performance optimization - safe to add)
-- Speeds up session queries by festival, day, and time
CREATE INDEX IF NOT EXISTS "festival_sessions_festivalId_day_startTime_idx" ON "festival_sessions"("festivalId", "day", "startTime");

-- CreateIndex (Performance optimization - safe to add)
-- Speeds up session ordering queries
CREATE INDEX IF NOT EXISTS "festival_sessions_festivalId_displayOrder_idx" ON "festival_sessions"("festivalId", "displayOrder");

-- CreateIndex (Performance optimization - safe to add)
-- Speeds up booking queries by festival
CREATE INDEX IF NOT EXISTS "bookings_festivalId_idx" ON "bookings"("festivalId");

-- CreateIndex (Performance optimization - safe to add)
-- Speeds up booking queries by session
CREATE INDEX IF NOT EXISTS "bookings_sessionId_idx" ON "bookings"("sessionId");
