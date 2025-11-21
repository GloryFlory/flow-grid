import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
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

  for (const festival of festivals) {
    console.log(`\n📅 Festival: ${festival.name} (${festival.sessions.length} sessions)`)
    
    // Sort sessions chronologically, PRESERVING displayOrder within same time slots
    const sortedSessions = festival.sessions.sort((a, b) => {
      // Create datetime string for comparison
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
    const updates: Array<{ id: string; displayOrder: number; title: string }> = []
    let currentDateTime = ''
    let sessionsInCurrentSlot: typeof sortedSessions = []

    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i]
      const dateTime = session.day && session.startTime ? `${session.day}T${session.startTime}` : session.day || ''
      
      // When we hit a new time slot, finalize the previous slot
      if (dateTime !== currentDateTime && sessionsInCurrentSlot.length > 0) {
        // Assign sequential displayOrder (0, 1, 2...) preserving the sorted order
        sessionsInCurrentSlot.forEach((s, index) => {
          updates.push({
            id: s.id,
            displayOrder: index,
            title: s.title
          })
        })
        sessionsInCurrentSlot = []
      }
      
      currentDateTime = dateTime
      sessionsInCurrentSlot.push(session)
    }
    
    // Don't forget the last slot
    if (sessionsInCurrentSlot.length > 0) {
      sessionsInCurrentSlot.forEach((s, index) => {
        updates.push({
          id: s.id,
          displayOrder: index,
          title: s.title
        })
      })
    }

    // Show what will be updated
    console.log('\nProposed changes:')
    let lastDateTime = ''
    for (const session of sortedSessions) {
      const dateTime = session.day && session.startTime ? `${session.day}T${session.startTime}` : session.day || ''
      if (dateTime !== lastDateTime) {
        console.log(`\n  ${dateTime}:`)
        lastDateTime = dateTime
      }
      const update = updates.find(u => u.id === session.id)
      const oldOrder = session.displayOrder !== null ? Number(session.displayOrder) : 'null'
      const newOrder = update?.displayOrder
      const changed = oldOrder !== newOrder ? '🔄' : '  '
      console.log(`    ${changed} ${session.title}: ${oldOrder} → ${newOrder}`)
    }

    // Update all sessions
    let updated = 0
    for (const update of updates) {
      await prisma.festivalSession.update({
        where: { id: update.id },
        data: { displayOrder: update.displayOrder }
      })
      updated++
    }

    console.log(`✅ Updated ${updated} sessions with proper displayOrder`)
  }

  console.log('\n✨ All festivals updated!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
