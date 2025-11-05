-- Fix Flo's photos to link to the correct teacher in your festival
-- Run this in Supabase SQL Editor

-- Step 1: Update the latest Flo photo to link to YOUR festival's Flo teacher
UPDATE "teacher_photos"
SET "teacherId" = 'cmhm60zb1003ibrvplss7q5um'  -- Your festival's Flo teacher ID
WHERE id = 'cmhm7mm50004rog6glh1ampmn';  -- Latest Flo photo

-- Step 2: Delete orphaned Flo photos (photos without teacherId)
DELETE FROM "teacher_photos"
WHERE "teacherName" = 'Flo'
  AND "teacherId" IS NULL;

-- Step 3: Verify the fix
SELECT 
  t.id as teacher_id,
  t.name as teacher_name,
  t."festivalId",
  COUNT(tp.id) as photo_count,
  tp."filePath" as photo_url
FROM "teachers" t
LEFT JOIN "teacher_photos" tp ON tp."teacherId" = t.id
WHERE t."festivalId" = 'cmhm5ysfc000wbrvpq8pb4mdl'
  AND t.name = 'Flo'
GROUP BY t.id, t.name, t."festivalId", tp."filePath";
