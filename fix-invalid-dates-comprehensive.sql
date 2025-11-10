-- Comprehensive fix for Invalid Date issues in festival_sessions
-- Run this in Supabase SQL Editor

-- Step 1: Diagnose the problem
SELECT 
  'Current Invalid Date Sessions:' as description,
  COUNT(*) as count
FROM festival_sessions 
WHERE day = 'Invalid Date';

-- Step 2: Show sample invalid sessions
SELECT 
  id,
  title,
  day,
  "startTime",
  "endTime",
  "festivalId"
FROM festival_sessions 
WHERE day = 'Invalid Date'
ORDER BY "createdAt" DESC
LIMIT 5;

-- Step 3: Fix sessions where we can derive day from startTime
UPDATE festival_sessions 
SET day = CASE 
  -- If startTime is a valid datetime, extract the day name
  WHEN "startTime" IS NOT NULL 
    AND "startTime" != '' 
    AND "startTime" ~ '^\d{4}-\d{2}-\d{2}' THEN
    TRIM(TO_CHAR(CAST("startTime" AS TIMESTAMP), 'Day'))
  -- If startTime is not available or invalid, set to 'TBD'
  ELSE 'TBD'
END
WHERE day = 'Invalid Date';

-- Step 4: Verify the fix
SELECT 
  'After Fix - Sessions by Day:' as description,
  day,
  COUNT(*) as session_count
FROM festival_sessions 
GROUP BY day
ORDER BY 
  CASE 
    WHEN day = 'TBD' THEN 1
    WHEN day = 'Invalid Date' THEN 2
    ELSE 0
  END,
  day;

-- Step 5: Show any remaining issues
SELECT 
  'Remaining Invalid Sessions:' as description,
  COUNT(*) as count
FROM festival_sessions 
WHERE day = 'Invalid Date' OR day IS NULL OR day = '';