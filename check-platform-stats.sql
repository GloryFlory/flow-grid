-- Platform Usage Summary
-- Run this in Supabase SQL Editor

-- Total Users
SELECT 'Total Users' as metric, COUNT(*) as count FROM "User";

-- Total Festivals
SELECT 'Total Festivals' as metric, COUNT(*) as count FROM "Festival";

-- Published Festivals
SELECT 'Published Festivals' as metric, COUNT(*) as count FROM "Festival" WHERE "isPublished" = true;

-- Festivals created in last 30 days
SELECT 'New Festivals (30d)' as metric, COUNT(*) as count 
FROM "Festival" 
WHERE "createdAt" >= NOW() - INTERVAL '30 days';

-- Total Schedule Views (from analytics)
SELECT 'Total Schedule Views' as metric, COUNT(*) as count 
FROM "Analytics" 
WHERE event = 'schedule_viewed';

-- Unique visitors (last 30 days)
SELECT 'Unique Visitors (30d)' as metric, COUNT(DISTINCT "deviceId") as count 
FROM "Analytics" 
WHERE "timestamp" >= NOW() - INTERVAL '30 days' 
AND "deviceId" IS NOT NULL;

-- Top 5 Most Viewed Festivals
SELECT 
  f.name,
  COUNT(*) as views,
  f."isPublished" as published
FROM "Analytics" a
JOIN "Festival" f ON a."festivalId" = f.id
WHERE a.event = 'schedule_viewed'
GROUP BY f.id, f.name, f."isPublished"
ORDER BY views DESC
LIMIT 5;
