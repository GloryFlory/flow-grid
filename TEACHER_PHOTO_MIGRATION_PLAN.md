# Teacher Photo Data Leak Fix - Migration Plan

## Problem
**CRITICAL**: Teacher photos are currently shared globally across all users. When User A uploads a photo for "John Smith", it appears on User B's festival if they also have a teacher named "John Smith". This is a data privacy violation.

## Root Cause
The `TeacherPhoto` table uses `teacherName` (String) as the only identifier, with no link to the `Teacher` table or `Festival` table. This means photos are looked up globally by name, not scoped to specific festivals or users.

## Solution
Add a foreign key relationship from `TeacherPhoto` to `Teacher`. Since `Teacher` records are already scoped to festivals (via `festivalId`), this will automatically provide festival-level isolation.

## Schema Changes (Already Completed)
The Prisma schema has been updated in `prisma/schema.prisma`:

```prisma
model TeacherPhoto {
  id          String   @id @default(cuid())
  filename    String   @unique
  teacherName String   // Keep for backward compatibility
  teacherId   String?  // NEW: Link to Teacher record
  filePath    String
  fileSize    Int
  mimeType    String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  teacher     Teacher? @relation(fields: [teacherId], references: [id], onDelete: Cascade)
  
  @@map("teacher_photos")
}

model Teacher {
  id         String          @id @default(cuid())
  festivalId String
  name       String
  url        String?
  isGroup    Boolean         @default(false)
  createdAt  DateTime        @default(now())
  updatedAt  DateTime        @updatedAt
  
  festival   Festival        @relation(fields: [festivalId], references: [id], onDelete: Cascade)
  photos     TeacherPhoto[]  // NEW: One-to-many relation
  
  @@unique([festivalId, name])
  @@map("teachers")
}
```

## Migration Steps

### Step 1: Create Database Migration ⚠️ BLOCKED  
Run the following command to create and apply the migration:

```bash
npx prisma migrate dev --name link-teacher-photos-to-teachers
```

**Current Issue**: The migration is failing due to shadow database errors related to a previous migration.

**WORKAROUND - Manual SQL Migration**: Since Prisma migrations are blocked, you can run the manual SQL script directly:

1. Open your Supabase dashboard SQL editor
2. Run the SQL file `manual-migration-teacher-photos.sql`:

```sql
-- Add teacherId column to teacher_photos table
ALTER TABLE "teacher_photos" ADD COLUMN IF NOT EXISTS "teacherId" TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS "teacher_photos_teacherId_idx" ON "teacher_photos"("teacherId");

-- Add foreign key constraint
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
```

3. After running the SQL, regenerate Prisma client:

```bash
npx prisma generate
```

### Step 2: Run Data Migration
After the column is added, run the migration script to link existing photos:

```bash
npx ts-node scripts/migrate-teacher-photos.ts
```

This script will:
- Find all `TeacherPhoto` records without a `teacherId`
- Match them to `Teacher` records by name
- Update the `teacherId` to create the proper relation
- Report any ambiguous cases (same teacher name in multiple festivals)

### Step 3: Update Photo Upload Code
Modify `/src/app/api/admin/teachers/[id]/route.ts` to set `teacherId` when uploading:

```typescript
await prisma.teacherPhoto.create({
  data: {
    filename,
    teacherName: teacher.name,  // Keep for backward compat
    teacherId: teacher.id,       // NEW: Link to teacher
    filePath: `/teachers/${filename}`,
    fileSize: buffer.length,
    mimeType: file.type,
  },
})
```

### Step 4: Update Public API Photo Fetching
Modify `/src/app/api/public/festivals/[slug]/route.ts` to use the relation:

```typescript
// Fetch teachers with their photos
const teachers = await prisma.teacher.findMany({
  where: { festivalId: festival.id },
  include: { photos: true }
})

// Create lookup maps
const teacherUrlMap = teachers.reduce((acc, t) => {
  acc[t.name.toLowerCase().trim()] = t.url
  return acc
}, {})

const teacherPhotoMap = teachers.reduce((acc, t) => {
  if (t.photos && t.photos.length > 0) {
    // Use the first photo (or implement logic for multiple photos)
    acc[t.name.toLowerCase().trim()] = t.photos[0].filePath
  }
  return acc
}, {})
```

### Step 5: Test Isolation
1. Create two test user accounts
2. Both users create festivals with a teacher named "John Smith"
3. User A uploads a photo for their "John Smith"
4. User B uploads a different photo for their "John Smith"
5. Verify:
   - User A sees only their photo
   - User B sees only their photo
   - Deleting User A's festival removes only their photo

### Step 6: Cleanup (Optional)
Once all photos are linked via `teacherId`, you could:
- Remove the fallback to name-based lookup
- Make `teacherId` required (NOT NULL)
- Eventually remove `teacherName` column (after confirming no dependencies)

## Backward Compatibility
- `teacherId` is optional (nullable) so existing data continues to work
- `teacherName` is preserved for fallback lookups during migration period
- The public API still uses name-based matching as fallback

## Current Status
- ✅ Schema updated in code
- ❌ Database migration blocked (shadow database error)
- ⏳ Code changes pending (waiting for migration)
- ⏳ Data migration script created but not tested
- ⏳ Testing plan defined

## Next Steps
1. Resolve the Prisma migrate dev shadow database error
2. Apply the migration to add the teacherId column
3. Run the data migration script
4. Update the upload and fetch code
5. Test with multiple users/festivals
6. Deploy to production

## Rollback Plan
If issues arise:
1. The `teacherId` column is optional, so removing it won't break existing functionality
2. The name-based lookup is still in place as fallback
3. Simply don't run the data migration script and remove the schema changes
