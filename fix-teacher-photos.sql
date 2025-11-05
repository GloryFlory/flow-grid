-- SAFE migration to add teacherId column and link existing photos
-- This will NOT delete any data!

-- Step 1: Add teacherId column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'teacher_photos' AND column_name = 'teacherId'
  ) THEN
    ALTER TABLE "teacher_photos" ADD COLUMN "teacherId" TEXT;
    RAISE NOTICE 'Added teacherId column';
  ELSE
    RAISE NOTICE 'teacherId column already exists';
  END IF;
END $$;

-- Step 2: Add index for better query performance
CREATE INDEX IF NOT EXISTS "teacher_photos_teacherId_idx" ON "teacher_photos"("teacherId");

-- Step 3: Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'teacher_photos_teacherId_fkey'
  ) THEN
    ALTER TABLE "teacher_photos" 
    ADD CONSTRAINT "teacher_photos_teacherId_fkey" 
    FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE;
    RAISE NOTICE 'Added foreign key constraint';
  ELSE
    RAISE NOTICE 'Foreign key constraint already exists';
  END IF;
END $$;

-- Step 4: Link existing photos to teachers (where possible)
-- This matches photos to teachers by name within the same festival
UPDATE "teacher_photos" tp
SET "teacherId" = t.id
FROM "teachers" t
WHERE tp."teacherId" IS NULL
  AND tp."teacherName" = t.name
  AND EXISTS (
    SELECT 1 FROM "festival_sessions" fs
    WHERE fs."festivalId" = t."festivalId"
    AND t.name = ANY(fs.teachers)
  );

-- Step 5: Show results
SELECT 
  COUNT(*) as total_photos,
  COUNT("teacherId") as photos_linked_to_teachers,
  COUNT(*) - COUNT("teacherId") as orphaned_photos
FROM "teacher_photos";
