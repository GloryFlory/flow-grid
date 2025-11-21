import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Map day names to dates for your November 12-16 festival
const dayNameToDate: Record<string, string> = {
  'Wednesday': '2025-11-12',
  'Thursday': '2025-11-13',
  'Friday': '2025-11-14',
  'Saturday': '2025-11-15',
  'Sunday': '2025-11-16'
}

async function fixTestFestivalDates() {
  const festivalId = 'cmhm5ysfc000wbrvpq8pb4mdl'
  
  console.log('🔍 Fetching festival details...')
  
  const festival = await prisma.festival.findUnique({
    where: { id: festivalId },
    select: { name: true, startDate: true, endDate: true }
  })
  
  if (!festival) {
    console.log('❌ Festival not found')
    return
  }
  
  console.log(`📅 Festival: ${festival.name}`)
  console.log(`   Dates: ${festival.startDate.toISOString().split('T')[0]} to ${festival.endDate.toISOString().split('T')[0]}\n`)
  
  const sessions = await prisma.festivalSession.findMany({
    where: { festivalId }
  })
  
  console.log(`📋 Found ${sessions.length} sessions to fix\n`)
  
  let fixed = 0
  let skipped = 0
  
  for (const session of sessions) {
    // Check if day is a day name (not already an ISO date)
    if (session.day && dayNameToDate[session.day]) {
      const isoDate = dayNameToDate[session.day]
      
      console.log(`✏️  ${session.title}`)
      console.log(`   OLD: day="${session.day}"`)
      console.log(`   NEW: day="${isoDate}"`)
      
      await prisma.festivalSession.update({
        where: { id: session.id },
        data: { day: isoDate }
      })
      
      console.log(`   ✅ Updated\n`)
      fixed++
    } else {
      console.log(`⏭️  ${session.title} - Already correct (${session.day})\n`)
      skipped++
    }
  }
  
  console.log(`\n✅ Migration complete!`)
  console.log(`   Fixed: ${fixed} sessions`)
  console.log(`   Skipped: ${skipped} sessions`)
  
  await prisma.$disconnect()
}

fixTestFestivalDates().catch(console.error)
