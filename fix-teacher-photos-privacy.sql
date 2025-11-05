-- SAFE migration to add teacherId column if it doesn't exist
-- Run this in Supabase SQL Editor

-- Step 1: Add teacherId column if it doesn't exist (safe - won't error if exists)
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

-- Step 3: Add foreign key constraint (safe - won't error if exists)
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

-- Step 4: Show current state
SELECT 
  COUNT(*) as total_photos,
  COUNT("teacherId") as photos_with_teacher_id,
  COUNT(*) - COUNT("teacherId") as photos_without_teacher_id
FROM "teacher_photos";
