import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const sessions = await prisma.festivalSession.findMany({
    where: {
      festivalId: 'cmhm5ysfc000wbrvpq8pb4mdl',
      title: {
        in: ['Icarian Pizza and Log', "Catherine's Wheel Party", 'Tarzan 360']
      }
    },
    select: {
      id: true,
      title: true,
      day: true,
      startTime: true,
      displayOrder: true
    },
    orderBy: {
      displayOrder: 'asc'
    }
  })

  console.log('Current displayOrder in database:')
  sessions.forEach(s => {
    console.log(`  ${s.title}: displayOrder=${s.displayOrder}, day=${s.day}, time=${s.startTime}`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
