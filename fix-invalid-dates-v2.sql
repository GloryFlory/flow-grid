-- Fix Invalid Date entries in festival_sessions
-- This will replace "Invalid Date" with a proper day name based on the session's startTime

-- First, let's see what we have
SELECT 
  id, 
  title, 
  day, 
  "startTime", 
  "endTime"
FROM festival_sessions 
WHERE day = 'Invalid Date' 
ORDER BY "startTime"
LIMIT 10;

-- Update sessions where we can derive the day from startTime
UPDATE festival_sessions 
SET day = CASE 
  WHEN "startTime" IS NOT NULL AND "startTime" != '' THEN
    TO_CHAR(CAST("startTime" AS TIMESTAMP), 'Day')
  ELSE 
    'TBD'
  END
WHERE day = 'Invalid Date';

-- Show results
SELECT 
  COUNT(*) as total_sessions,
  COUNT(CASE WHEN day = 'Invalid Date' THEN 1 END) as invalid_date_sessions,
  COUNT(CASE WHEN day = 'TBD' THEN 1 END) as tbd_sessions
FROM festival_sessions;