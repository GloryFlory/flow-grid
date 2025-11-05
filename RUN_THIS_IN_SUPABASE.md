# CRITICAL: Run This SQL in Supabase to Fix Teacher Photo Privacy

## ⚠️ IMPORTANT
This SQL is **SAFE** - it will NOT delete any data. It only adds a column and links existing photos.

## Instructions

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy and paste the entire SQL below
6. Click "Run" button

---

## SQL to Run

```sql
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
```

---

## What This Does

1. ✅ Adds `teacherId` column to `teacher_photos` table (if not already there)
2. ✅ Creates an index for faster queries
3. ✅ Adds a foreign key constraint (ensures data integrity)
4. ✅ Links existing teacher photos to their correct teacher records
5. ✅ Shows you a summary of results

## Expected Output

After running, you should see something like:

```
NOTICE: Added teacherId column
NOTICE: Added foreign key constraint
```

And then a table showing:
- `total_photos`: Total number of teacher photos
- `photos_linked_to_teachers`: Photos successfully linked
- `orphaned_photos`: Photos without a teacher (these will be cleaned up automatically)

## After Running

Once you've run this SQL successfully, the teacher photo privacy bug will be **FIXED**. Each festival will only see photos for their own teachers, not other users' photos.

## Need Help?

If you see any errors, send me the exact error message and I'll help troubleshoot.
