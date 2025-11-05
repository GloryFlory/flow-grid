-- Diagnostic queries to check photo data
-- Run these in Supabase SQL Editor to see what's happening

-- 1. Check all teacher photos (should see teacherId for new photos)
SELECT 
  id,
  "teacherName",
  "teacherId",
  "filePath",
  "createdAt"
FROM "teacher_photos"
ORDER BY "createdAt" DESC;

-- 2. Check teachers for your festival (replace FESTIVAL_ID with your actual festival ID)
-- Festival ID: cmhm5ysfc000wbrvpq8pb4mdl
SELECT 
  t.id as teacher_id,
  t.name as teacher_name,
  t."festivalId",
  t.url,
  COUNT(tp.id) as photo_count
FROM "teachers" t
LEFT JOIN "teacher_photos" tp ON tp."teacherId" = t.id
WHERE t."festivalId" = 'cmhm5ysfc000wbrvpq8pb4mdl'
GROUP BY t.id, t.name, t."festivalId", t.url
ORDER BY t.name;

-- 3. Check if photos are linked correctly
SELECT 
  tp.id as photo_id,
  tp."teacherName",
  tp."teacherId",
  t.name as linked_teacher_name,
  t."festivalId" as linked_festival_id,
  tp."filePath"
FROM "teacher_photos" tp
LEFT JOIN "teachers" t ON t.id = tp."teacherId"
ORDER BY tp."createdAt" DESC
LIMIT 10;

-- 4. Check sessions for this festival to see which teacher names are in use
SELECT DISTINCT unnest(teachers) as teacher_name
FROM "festival_sessions"
WHERE "festivalId" = 'cmhm5ysfc000wbrvpq8pb4mdl'
ORDER BY teacher_name;
