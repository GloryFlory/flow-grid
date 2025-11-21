import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkParallelSessions() {
  const sessions = await prisma.festivalSession.findMany({
    where: { festivalId: 'cmhm5ysfc000wbrvpq8pb4mdl' },
    select: { id: true, title: true, day: true, startTime: true, displayOrder: true },
    orderBy: [{ day: 'asc' }, { startTime: 'asc' }, { displayOrder: 'asc' }]
  })

  // Group by day + time to find slots with multiple sessions
  const slots = new Map()
  sessions.forEach(s => {
    const key = `${s.day} ${s.startTime}`
    if (!slots.has(key)) slots.set(key, [])
    slots.get(key).push(s)
  })

  console.log('Time slots with multiple sessions (drag-and-drop should work):\n')
  let found = false
  slots.forEach((sessions, key) => {
    if (sessions.length > 1) {
      found = true
      console.log(`📅 ${key}:`)
      sessions.forEach((s, i) => {
        console.log(`   ${i+1}. ${s.title.substring(0, 40).padEnd(40)} (displayOrder: ${s.displayOrder})`)
      })
      console.log('')
    }
  })

  if (!found) {
    console.log('⚠️  No time slots with multiple sessions found!')
    console.log('   Drag-and-drop only works when 2+ sessions are at the exact same time.')
  }

  await prisma.$disconnect()
}

checkParallelSessions().catch(console.error)
