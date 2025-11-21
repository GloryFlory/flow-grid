import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixMACDates() {
  const festivalId = 'cmhrlarpv0001pat1pq05861v' // Your MAC festival ID
  
  console.log('🔍 Fetching sessions...')
  
  const sessions = await prisma.festivalSession.findMany({
    where: { festivalId },
    orderBy: { startTime: 'asc' }
  })
  
  console.log(`📋 Found ${sessions.length} sessions to fix\n`)
  
  for (const session of sessions) {
    const updates: any = {}
    
    // Extract date from startTime if it contains a full datetime
    if (session.startTime && session.startTime.includes('T')) {
      const extractedDate = session.startTime.split('T')[0] // "2025-11-14"
      const extractedTime = session.startTime.split('T')[1]?.substring(0, 5) // "07:00"
      
      if (extractedDate && extractedTime) {
        updates.day = extractedDate
        updates.startTime = extractedTime
        
        // Fix endTime too if it has full datetime
        if (session.endTime && session.endTime.includes('T')) {
          updates.endTime = session.endTime.split('T')[1]?.substring(0, 5)
        }
        
        console.log(`✏️  ${session.title}`)
        console.log(`   OLD: day="${session.day}" startTime="${session.startTime}"`)
        console.log(`   NEW: day="${updates.day}" startTime="${updates.startTime}"`)
        
        await prisma.festivalSession.update({
          where: { id: session.id },
          data: updates
        })
        
        console.log(`   ✅ Updated\n`)
      }
    } else {
      console.log(`⏭️  ${session.title} - Already in correct format\n`)
    }
  }
  
  console.log('✅ Migration complete!')
  await prisma.$disconnect()
}

fixMACDates().catch(console.error)
