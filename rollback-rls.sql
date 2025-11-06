-- ============================================================================
-- ROLLBACK RLS MIGRATION
-- Use this to quickly disable RLS if something breaks
-- ============================================================================

-- ============================================================================
-- STEP 1: DROP ALL POLICIES
-- ============================================================================

-- Users table policies
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can be created" ON users;

-- Festivals table policies
DROP POLICY IF EXISTS "Published festivals are publicly viewable" ON festivals;
DROP POLICY IF EXISTS "Users can create own festivals" ON festivals;
DROP POLICY IF EXISTS "Users can update own festivals" ON festivals;
DROP POLICY IF EXISTS "Users can delete own festivals" ON festivals;

-- Festival sessions table policies
DROP POLICY IF EXISTS "Sessions for published festivals are viewable" ON festival_sessions;
DROP POLICY IF EXISTS "Festival owners can create sessions" ON festival_sessions;
DROP POLICY IF EXISTS "Festival owners can update sessions" ON festival_sessions;
DROP POLICY IF EXISTS "Festival owners can delete sessions" ON festival_sessions;

-- Teachers table policies
DROP POLICY IF EXISTS "Teachers for published festivals are viewable" ON teachers;
DROP POLICY IF EXISTS "Festival owners can create teachers" ON teachers;
DROP POLICY IF EXISTS "Festival owners can update teachers" ON teachers;
DROP POLICY IF EXISTS "Festival owners can delete teachers" ON teachers;

-- Teacher photos table policies
DROP POLICY IF EXISTS "Teacher photos for published festivals are viewable" ON teacher_photos;
DROP POLICY IF EXISTS "Festival owners can create teacher photos" ON teacher_photos;
DROP POLICY IF EXISTS "Festival owners can update teacher photos" ON teacher_photos;
DROP POLICY IF EXISTS "Festival owners can delete teacher photos" ON teacher_photos;

-- Bookings table policies
DROP POLICY IF EXISTS "Users can view own bookings" ON bookings;
DROP POLICY IF EXISTS "Anyone can create bookings" ON bookings;
DROP POLICY IF EXISTS "Users can update own bookings" ON bookings;
DROP POLICY IF EXISTS "Users can delete own bookings" ON bookings;

-- Subscriptions table policies
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON subscriptions;
DROP POLICY IF EXISTS "Subscriptions can be created" ON subscriptions;

-- Analytics table policies
DROP POLICY IF EXISTS "Festival owners can view analytics" ON analytics;
DROP POLICY IF EXISTS "Anyone can create analytics" ON analytics;

-- Accounts table policies
DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
DROP POLICY IF EXISTS "Accounts can be created" ON accounts;
DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;

-- Sessions table policies
DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
DROP POLICY IF EXISTS "Sessions can be created" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;

-- Verification tokens policies
DROP POLICY IF EXISTS "Verification tokens are accessible" ON verification_tokens;

-- WebAuthn credentials policies
DROP POLICY IF EXISTS "Users can view own credentials" ON webauthn_credentials;
DROP POLICY IF EXISTS "Users can create credentials" ON webauthn_credentials;
DROP POLICY IF EXISTS "Users can update own credentials" ON webauthn_credentials;
DROP POLICY IF EXISTS "Users can delete own credentials" ON webauthn_credentials;

-- ============================================================================
-- STEP 2: DISABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE festivals DISABLE ROW LEVEL SECURITY;
ALTER TABLE festival_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_photos DISABLE ROW LEVEL SECURITY;
ALTER TABLE teachers DISABLE ROW LEVEL SECURITY;
ALTER TABLE analytics DISABLE ROW LEVEL SECURITY;
ALTER TABLE verification_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE webauthn_credentials DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Should show no policies
SELECT COUNT(*) as remaining_policies
FROM pg_policies
WHERE schemaname = 'public';

-- ============================================================================
-- DONE! RLS has been completely disabled and all policies removed
-- ============================================================================
