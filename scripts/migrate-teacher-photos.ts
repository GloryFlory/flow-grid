/**
 * Migration script to link TeacherPhoto records to Teacher records
 * 
 * This script should be run after adding the teacherId column to teacher_photos table.
 * It will:
 * 1. Find all TeacherPhoto records without a teacherId
 * 2. Match them to Teacher records by name within each festival
 * 3. Update the teacherId to create the proper relation
 * 
 * Run with: npx ts-node scripts/migrate-teacher-photos.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateTeacherPhotos() {
  console.log('🔄 Starting teacher photo migration...')
  
  try {
    // Get all teacher photos without a teacherId
    const photosToMigrate = await prisma.teacherPhoto.findMany({
      where: {
        teacherId: null
      }
    })
    
    console.log(`📸 Found ${photosToMigrate.length} photos to migrate`)
    
    if (photosToMigrate.length === 0) {
      console.log('✅ No photos need migration')
      return
    }
    
    let successCount = 0
    let skippedCount = 0
    
    for (const photo of photosToMigrate) {
      // Find matching teachers by name across all festivals
      const matchingTeachers = await prisma.teacher.findMany({
        where: {
          name: {
            equals: photo.teacherName,
            mode: 'insensitive'
          }
        },
        include: {
          festival: {
            select: {
              name: true,
              slug: true
            }
          }
        }
      })
      
      if (matchingTeachers.length === 0) {
        console.log(`⚠️  No teacher found for photo "${photo.filename}" (${photo.teacherName})`)
        skippedCount++
        continue
      }
      
      if (matchingTeachers.length === 1) {
        // Exactly one match - link it
        await prisma.teacherPhoto.update({
          where: { id: photo.id },
          data: { teacherId: matchingTeachers[0].id }
        })
        console.log(`✅ Linked "${photo.filename}" to ${photo.teacherName} in ${matchingTeachers[0].festival.name}`)
        successCount++
      } else {
        // Multiple matches - this is ambiguous
        // For now, we'll skip it and log a warning
        // In production, you might want to manually resolve these
        console.log(`⚠️  Multiple teachers found for "${photo.filename}" (${photo.teacherName}):`)
        matchingTeachers.forEach(t => {
          console.log(`   - ${t.name} in ${t.festival.name} (${t.festival.slug})`)
        })
        console.log(`   Skipping - please manually assign this photo`)
        skippedCount++
      }
    }
    
    console.log('\n📊 Migration Summary:')
    console.log(`   ✅ Successfully migrated: ${successCount}`)
    console.log(`   ⚠️  Skipped (needs manual review): ${skippedCount}`)
    console.log(`   📸 Total processed: ${photosToMigrate.length}`)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the migration
migrateTeacherPhotos()
  .then(() => {
    console.log('\n✨ Migration complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Migration error:', error)
    process.exit(1)
  })
