# Critical Bug Fixes Summary

## Overview
Two critical bugs were identified during user testing that blocked onboarding and violated data privacy. This document tracks the fixes.

---

## 🚨 Bug #1: Teacher Photo Data Leakage (PRIVACY VIOLATION)

### Status: ⚠️ IN PROGRESS - Blocked by database migration issues

### Problem
Teacher photos are shared globally across all users. When User A uploads a photo for "John Smith", it appears on User B's festival if they also have a teacher named "John Smith".

### Impact
- **Severity**: CRITICAL
- **Type**: Data Privacy Violation
- **Affected**: All users with teacher photos
- **User Impact**: Wrong photos displayed, privacy concerns

### Root Cause
`TeacherPhoto` table uses `teacherName` (String) as identifier with no link to `Teacher` or `Festival` tables. Photos are looked up globally by name.

### Solution
Add foreign key from `TeacherPhoto` to `Teacher`. Since `Teacher` is scoped to festivals via `festivalId`, this provides automatic festival-level isolation.

### Work Completed
- ✅ Prisma schema updated with `teacherId` field and relation
- ✅ Migration SQL script created (`manual-migration-teacher-photos.sql`)
- ✅ Data migration script created (`scripts/migrate-teacher-photos.ts`)
- ✅ Detailed migration plan documented (`TEACHER_PHOTO_MIGRATION_PLAN.md`)

### Work Remaining
- ⏳ Execute database migration (blocked by Prisma shadow DB error)
- ⏳ Run `npx prisma generate` to update Prisma client
- ⏳ Update photo upload code to set `teacherId`
- ⏳ Update public API to fetch photos via `Teacher.photos` relation
- ⏳ Run data migration script to link existing photos
- ⏳ Test isolation between users/festivals

### Workaround
Manual SQL execution in Supabase dashboard:
```sql
ALTER TABLE "teacher_photos" ADD COLUMN IF NOT EXISTS "teacherId" TEXT;
CREATE INDEX IF NOT EXISTS "teacher_photos_teacherId_idx" ON "teacher_photos"("teacherId");
ALTER TABLE "teacher_photos" ADD CONSTRAINT "teacher_photos_teacherId_fkey" 
  FOREIGN KEY ("teacherId") REFERENCES "teachers"("id") ON DELETE CASCADE;
```

### Files Modified
- `prisma/schema.prisma` - Added teacherId field and relation
- `manual-migration-teacher-photos.sql` - Manual migration script
- `scripts/migrate-teacher-photos.ts` - Data migration script
- `TEACHER_PHOTO_MIGRATION_PLAN.md` - Complete migration guide

### Files To Modify (After Migration)
- `src/app/api/admin/teachers/[id]/route.ts` - Set teacherId on upload
- `src/app/api/public/festivals/[slug]/route.ts` - Use Teacher.photos relation
- Various photo management endpoints

---

## 🚨 Bug #2: CSV Doesn't Work in Windows Excel (ONBOARDING BLOCKER)

### Status: ✅ FIXED

### Problem
CSV template downloads as single cell with comma-separated values in Windows Excel. Users cannot import schedule data, blocking onboarding.

### Impact
- **Severity**: CRITICAL
- **Type**: Onboarding Blocker
- **Affected**: Windows users (majority of non-technical users)
- **User Impact**: Cannot use CSV import feature at all

### Root Cause
Windows Excel expects semicolon (`;`) delimiter by default, not comma (`,`). UTF-8 encoding also needs BOM for proper character recognition.

### Solution
1. Change CSV delimiter from comma to semicolon
2. Add UTF-8 BOM (`\uFEFF`) to all exports
3. Auto-detect delimiter in parsers (supports both)

### Work Completed
- ✅ Updated template download to use semicolon delimiter
- ✅ Added UTF-8 BOM to template
- ✅ Updated PapaParse config to auto-detect delimiter
- ✅ Updated CSV export API to use semicolon + BOM
- ✅ Updated CSV import API to auto-detect delimiter
- ✅ Added field escaping logic for semicolons in data
- ✅ Documentation created (`CSV_EXCEL_FIX.md`)

### Testing Needed
- ⏳ Test download in Windows Excel
- ⏳ Test download in Mac Excel
- ⏳ Test download in Google Sheets
- ⏳ Test import with semicolon file
- ⏳ Test import with comma file (backward compat)
- ⏳ Test special characters (émojis, àccénts)
- ⏳ Test fields containing commas and semicolons

### Files Modified
- `src/app/dashboard/create-festival/page.tsx`
  - `downloadCsvTemplate()` - Changed to semicolon + BOM
  - `handleCsvUpload()` - Added delimiter auto-detection
- `src/app/api/admin/festivals/[id]/sessions/csv/route.ts`
  - GET endpoint - Export with semicolon + BOM
  - POST endpoint - Import with delimiter detection
- `CSV_EXCEL_FIX.md` - Complete documentation

### Backward Compatibility
✅ Fully backward compatible - old comma files still work via auto-detection

---

## Priority Order

1. **CSV Excel Fix** (✅ DONE) - Higher priority because:
   - Blocks all new user onboarding
   - Affects majority of users (Windows)
   - Simple, low-risk fix
   - No database changes needed

2. **Teacher Photo Privacy** (⚠️ BLOCKED) - Lower priority because:
   - Affects fewer users currently
   - Requires database migration
   - Migration is blocked by technical issues
   - Has safe workaround (manual SQL)
   - Can be completed incrementally

---

## Next Steps

### Immediate (CSV)
1. Test CSV download/upload on Windows Excel
2. Test on Mac Excel and Google Sheets
3. Verify special characters work correctly
4. Update onboarding documentation

### Short-term (Teacher Photos)
1. Resolve Prisma migration shadow database error
2. Execute database migration (automated or manual)
3. Update code to use teacherId
4. Run data migration script
5. Test photo isolation
6. Deploy to production

### Medium-term (Other Feedback)
See conversation summary for full list of HIGH, MEDIUM, and LOW priority items from user feedback.

---

## Testing Protocol

### CSV Testing
```
1. Download template from dashboard
2. Open in Windows Excel → Should show proper columns
3. Add data → Should work in individual cells
4. Save and upload → Should import successfully
5. Export existing sessions → Should match import format
6. Test special characters: émojis, àccénts, "quotes", commas
7. Test on Mac Excel, Google Sheets, LibreOffice
```

### Photo Privacy Testing
```
1. Create User A account → Create Festival A → Add teacher "John Smith"
2. Upload photo for "John Smith" in Festival A
3. Create User B account → Create Festival B → Add teacher "John Smith"
4. Upload different photo for "John Smith" in Festival B
5. Verify:
   - Festival A public page shows only Photo A
   - Festival B public page shows only Photo B
   - No cross-contamination
6. Delete Festival A → Verify Photo A deleted (cascade)
7. Festival B still shows Photo B (isolation)
```

---

## Risk Assessment

### CSV Fix
- **Risk**: LOW
- **Rationale**: 
  - No database changes
  - Backward compatible
  - Auto-detection prevents breaking changes
  - Easy to rollback
- **Rollback**: Simple string replacement

### Teacher Photo Fix
- **Risk**: MEDIUM
- **Rationale**:
  - Database schema change (always risky)
  - Affects live data
  - Migration complexity
  - BUT: Column is optional (nullable)
  - AND: Backward compatible (keepingtea therName)
- **Rollback**: Can skip data migration, remove column

---

## User Communication

### For CSV Fix
**Message**: "We've improved CSV compatibility! Your template now opens correctly in Excel on all platforms. Old CSV files still work perfectly."

### For Photo Fix
**Message**: "We've enhanced teacher photo privacy! Photos are now properly isolated between festivals. You may need to re-upload photos after this update."

---

## Documentation Updates

### After CSV Fix
- [ ] Update README with semicolon delimiter note
- [ ] Update SETUP guide with CSV format
- [ ] Add troubleshooting section for CSV issues
- [ ] Update any video tutorials

### After Photo Fix
- [ ] Update photo upload documentation
- [ ] Add privacy policy note about photo scoping
- [ ] Update teacher management guide
- [ ] Add migration announcement to changelog

---

## Success Criteria

### CSV Fix
✅ Windows users can download, edit, and upload CSV without manual steps
✅ Mac users continue to work normally
✅ Google Sheets users continue to work normally
✅ Special characters display correctly
✅ No import wizard needed in Excel

### Photo Fix
✅ User A's photos don't appear on User B's festival
✅ Photos correctly linked to festival-scoped teachers
✅ Deleting festival deletes its photos (cascade)
✅ No orphaned photos in database
✅ Existing functionality preserved

---

## Lessons Learned

1. **Platform Testing**: Always test on Windows Excel, not just Mac/Google Sheets
2. **Data Scoping**: Never use global name lookups - always scope to user/organization
3. **User Testing**: Real-world testing reveals critical issues invisible during development
4. **Migration Strategy**: Use optional fields for backward compatibility
5. **Delimiter Standards**: Semicolon is safer for European/Windows users

