-- Add teacherId column to teacher_photos table
-- This links photos to specific Teacher records (which are festival-scoped)
-- instead of using global name matching

-- Add the new column (nullable for backward compatibility)
ALTER TABLE "teacher_photos" ADD COLUMN IF NOT EXISTS "teacherId" TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "teacher_photos_teacherId_idx" ON "teacher_photos"("teacherId");

-- Add foreign key constraint
-- onDelete: CASCADE means if a teacher is deleted, their photos are deleted too
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'teacher_photos_teacherId_fkey'
  ) THEN
    ALTER TABLE "teacher_photos" 
    ADD CONSTRAINT "teacher_photos_teacherId_fkey" 
    FOREIGN KEY ("teacherId") 
    REFERENCES "teachers"("id") 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;
  END IF;
END $$;
