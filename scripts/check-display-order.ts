import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const sessions = await prisma.festivalSession.findMany({
    where: {
      festivalId: 'cmhm5ysfc000wbrvpq8pb4mdl',
      day: '2025-11-14',
      startTime: '09:15'
    },
    select: {
      id: true,
      title: true,
      displayOrder: true
    },
    orderBy: {
      displayOrder: 'asc'
    }
  })

  console.log('Friday 09:15 sessions (current displayOrder):')
  sessions.forEach(s => {
    console.log(`  ${s.title}: displayOrder=${s.displayOrder}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
