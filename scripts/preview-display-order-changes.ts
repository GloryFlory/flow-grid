import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 DRY RUN - No changes will be made to the database\n')
  
  // Get all festivals
  const festivals = await prisma.festival.findMany({
    select: {
      id: true,
      name: true,
      sessions: {
        select: {
          id: true,
          title: true,
          day: true,
          startTime: true,
          displayOrder: true
        }
      }
    }
  })

  console.log(`Found ${festivals.length} festivals\n`)

  let totalChanges = 0

  for (const festival of festivals) {
    console.log(`\n📅 Festival: ${festival.name} (${festival.sessions.length} sessions)`)
    
    // Sort sessions chronologically, PRESERVING displayOrder within same time slots
    const sortedSessions = festival.sessions.sort((a, b) => {
      const dateTimeA = a.day && a.startTime ? `${a.day}T${a.startTime}` : a.day || ''
      const dateTimeB = b.day && b.startTime ? `${b.day}T${b.startTime}` : b.day || ''
      
      if (dateTimeA !== dateTimeB) {
        return dateTimeA.localeCompare(dateTimeB)
      }
      
      // For sessions at same time, preserve existing displayOrder
      const orderA = a.displayOrder !== null && a.displayOrder !== undefined ? Number(a.displayOrder) : 999999
      const orderB = b.displayOrder !== null && b.displayOrder !== undefined ? Number(b.displayOrder) : 999999
      return orderA - orderB
    })

    // Group by day+time and PRESERVE displayOrder within each slot
    const updates: Array<{ id: string; displayOrder: number; title: string; oldOrder: number | null }> = []
    let currentDateTime = ''
    let sessionsInCurrentSlot: typeof sortedSessions = []

    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i]
      const dateTime = session.day && session.startTime ? `${session.day}T${session.startTime}` : session.day || ''
      
      if (dateTime !== currentDateTime && sessionsInCurrentSlot.length > 0) {
        sessionsInCurrentSlot.forEach((s, index) => {
          updates.push({
            id: s.id,
            displayOrder: index,
            title: s.title,
            oldOrder: s.displayOrder !== null ? Number(s.displayOrder) : null
          })
        })
        sessionsInCurrentSlot = []
      }
      
      currentDateTime = dateTime
      sessionsInCurrentSlot.push(session)
    }
    
    if (sessionsInCurrentSlot.length > 0) {
      sessionsInCurrentSlot.forEach((s, index) => {
        updates.push({
          id: s.id,
          displayOrder: index,
          title: s.title,
          oldOrder: s.displayOrder !== null ? Number(s.displayOrder) : null
        })
      })
    }

    // Count changes for this festival
    const changes = updates.filter(u => u.oldOrder !== u.displayOrder)
    totalChanges += changes.length

    if (changes.length === 0) {
      console.log('   ✅ No changes needed - already correct!')
      continue
    }

    // Show what will be updated
    console.log(`\n   Changes needed: ${changes.length} sessions`)
    let lastDateTime = ''
    for (const session of sortedSessions) {
      const dateTime = session.day && session.startTime ? `${session.day}T${session.startTime}` : session.day || ''
      if (dateTime !== lastDateTime) {
        console.log(`\n   ${dateTime}:`)
        lastDateTime = dateTime
      }
      const update = updates.find(u => u.id === session.id)
      const oldOrder = session.displayOrder !== null ? Number(session.displayOrder) : 'null'
      const newOrder = update?.displayOrder
      const changed = oldOrder !== newOrder ? '🔄' : '   '
      console.log(`     ${changed} ${session.title.substring(0, 50).padEnd(50)} ${oldOrder} → ${newOrder}`)
    }
  }

  console.log(`\n\n${'='.repeat(60)}`)
  console.log(`📊 SUMMARY`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Total festivals: ${festivals.length}`)
  console.log(`Total sessions that need updating: ${totalChanges}`)
  console.log(`\n⚠️  THIS WAS A DRY RUN - No changes were made to the database`)
  console.log(`\nTo apply these changes, run: npx tsx scripts/fix-all-display-orders.ts`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
