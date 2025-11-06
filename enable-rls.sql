-- ============================================================================
-- COMPREHENSIVE ROW LEVEL SECURITY (RLS) MIGRATION
-- Festival Scheduler Application
-- 
-- Run this in Supabase SQL Editor
-- IMPORTANT: Test thoroughly after applying!
-- ============================================================================

-- ============================================================================
-- STEP 1: ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE festival_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: USERS TABLE POLICIES
-- Most sensitive - users can only see/update themselves
-- ============================================================================

-- Users can read their own data
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.jwt() ->> 'email' = email);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.jwt() ->> 'email' = email);

-- New users can be created (for signup)
CREATE POLICY "Users can be created"
ON users FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- STEP 3: FESTIVALS TABLE POLICIES
-- Users own their festivals, public can view published ones
-- ============================================================================

-- Anyone can view published festivals
CREATE POLICY "Published festivals are publicly viewable"
ON festivals FOR SELECT
USING (
  "isPublished" = true
  OR auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

-- Users can create their own festivals
CREATE POLICY "Users can create own festivals"
ON festivals FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

-- Users can update their own festivals
CREATE POLICY "Users can update own festivals"
ON festivals FOR UPDATE
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

-- Users can delete their own festivals
CREATE POLICY "Users can delete own festivals"
ON festivals FOR DELETE
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

-- ============================================================================
-- STEP 4: FESTIVAL_SESSIONS TABLE POLICIES
-- Public for published festivals, owner-only for drafts
-- ============================================================================

-- Anyone can view sessions for published festivals
CREATE POLICY "Sessions for published festivals are viewable"
ON festival_sessions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId" 
    AND festivals."isPublished" = true
  )
  OR EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId" 
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- Festival owners can create sessions
CREATE POLICY "Festival owners can create sessions"
ON festival_sessions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- Festival owners can update their sessions
CREATE POLICY "Festival owners can update sessions"
ON festival_sessions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- Festival owners can delete their sessions
CREATE POLICY "Festival owners can delete sessions"
ON festival_sessions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- ============================================================================
-- STEP 5: TEACHERS TABLE POLICIES
-- Public for published festivals
-- ============================================================================

-- Anyone can view teachers for published festivals
CREATE POLICY "Teachers for published festivals are viewable"
ON teachers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId" 
    AND festivals."isPublished" = true
  )
  OR EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId" 
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- Festival owners can create teachers
CREATE POLICY "Festival owners can create teachers"
ON teachers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- Festival owners can update teachers
CREATE POLICY "Festival owners can update teachers"
ON teachers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- Festival owners can delete teachers
CREATE POLICY "Festival owners can delete teachers"
ON teachers FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- ============================================================================
-- STEP 6: TEACHER_PHOTOS TABLE POLICIES
-- Public for published festivals
-- ============================================================================

-- Anyone can view photos for published festivals
CREATE POLICY "Teacher photos for published festivals are viewable"
ON teacher_photos FOR SELECT
USING (
  "teacherId" IS NULL -- Legacy photos without teacherId
  OR EXISTS (
    SELECT 1 FROM teachers t
    JOIN festivals f ON t."festivalId" = f.id
    WHERE t.id = "teacherId"
    AND (
      f."isPublished" = true
      OR auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = f."userId")
    )
  )
);

-- Festival owners can create photos
CREATE POLICY "Festival owners can create teacher photos"
ON teacher_photos FOR INSERT
WITH CHECK (
  "teacherId" IS NULL -- Allow legacy uploads
  OR EXISTS (
    SELECT 1 FROM teachers t
    JOIN festivals f ON t."festivalId" = f.id
    WHERE t.id = "teacherId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = f."userId")
  )
);

-- Festival owners can update photos
CREATE POLICY "Festival owners can update teacher photos"
ON teacher_photos FOR UPDATE
USING (
  "teacherId" IS NULL
  OR EXISTS (
    SELECT 1 FROM teachers t
    JOIN festivals f ON t."festivalId" = f.id
    WHERE t.id = "teacherId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = f."userId")
  )
);

-- Festival owners can delete photos
CREATE POLICY "Festival owners can delete teacher photos"
ON teacher_photos FOR DELETE
USING (
  "teacherId" IS NULL
  OR EXISTS (
    SELECT 1 FROM teachers t
    JOIN festivals f ON t."festivalId" = f.id
    WHERE t.id = "teacherId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = f."userId")
  )
);

-- ============================================================================
-- STEP 7: BOOKINGS TABLE POLICIES
-- Users can see their own bookings, festival owners can see all
-- ============================================================================

-- Anyone can view bookings for their device
CREATE POLICY "Users can view own bookings"
ON bookings FOR SELECT
USING (
  "deviceId" = current_setting('request.headers')::json->>'x-device-id'
  OR EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- Anyone can create bookings
CREATE POLICY "Anyone can create bookings"
ON bookings FOR INSERT
WITH CHECK (true);

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings"
ON bookings FOR UPDATE
USING (
  "deviceId" = current_setting('request.headers')::json->>'x-device-id'
  OR EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- Users can delete their own bookings
CREATE POLICY "Users can delete own bookings"
ON bookings FOR DELETE
USING (
  "deviceId" = current_setting('request.headers')::json->>'x-device-id'
  OR EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
);

-- ============================================================================
-- STEP 8: SUBSCRIPTIONS TABLE POLICIES
-- Highly sensitive - users can only see their own
-- ============================================================================

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON subscriptions FOR SELECT
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

-- Users can update their own subscription
CREATE POLICY "Users can update own subscription"
ON subscriptions FOR UPDATE
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

-- Subscriptions can be created
CREATE POLICY "Subscriptions can be created"
ON subscriptions FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- STEP 9: ANALYTICS TABLE POLICIES
-- Festival owners can view their analytics, limited public tracking
-- ============================================================================

-- Festival owners can view their analytics
CREATE POLICY "Festival owners can view analytics"
ON analytics FOR SELECT
USING (
  "festivalId" IS NULL
  OR EXISTS (
    SELECT 1 FROM festivals 
    WHERE festivals.id = "festivalId"
    AND auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = festivals."userId")
  )
  OR auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

-- Anyone can create analytics (for tracking)
CREATE POLICY "Anyone can create analytics"
ON analytics FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- STEP 10: AUTH TABLES (NEXTAUTH)
-- Special handling for NextAuth tables
-- ============================================================================

-- Accounts - users can view their own OAuth accounts
CREATE POLICY "Users can view own accounts"
ON accounts FOR SELECT
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

CREATE POLICY "Accounts can be created"
ON accounts FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update own accounts"
ON accounts FOR UPDATE
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

-- Sessions - users can view their own sessions
CREATE POLICY "Users can view own sessions"
ON sessions FOR SELECT
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

CREATE POLICY "Sessions can be created"
ON sessions FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can delete own sessions"
ON sessions FOR DELETE
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

-- Verification tokens - open for email verification
CREATE POLICY "Verification tokens are accessible"
ON verification_tokens FOR ALL
USING (true)
WITH CHECK (true);

-- WebAuthn credentials - users can manage their own
CREATE POLICY "Users can view own credentials"
ON webauthn_credentials FOR SELECT
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

CREATE POLICY "Users can create credentials"
ON webauthn_credentials FOR INSERT
WITH CHECK (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

CREATE POLICY "Users can update own credentials"
ON webauthn_credentials FOR UPDATE
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

CREATE POLICY "Users can delete own credentials"
ON webauthn_credentials FOR DELETE
USING (
  auth.jwt() ->> 'email' = (SELECT email FROM users WHERE id = "userId")
);

-- ============================================================================
-- VERIFICATION QUERIES
-- Run these to verify RLS is working correctly
-- ============================================================================

-- Check RLS status on all tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- View all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- DONE! 
-- Next: Test your application thoroughly
-- - Public schedule should still load
-- - Users can only see their own festivals in dashboard
-- - Admin operations still work
-- ============================================================================
