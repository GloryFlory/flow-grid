import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create a test festival
  const festival = await prisma.festival.create({
    data: {
      name: 'Flow Grid Demo Festival',
      description: 'A beautiful demonstration of the interactive schedule system',
      slug: 'flow-grid-demo',
      startDate: new Date('2025-10-25'),
      endDate: new Date('2025-10-27'),
      timezone: 'America/Montreal',
      isPublished: true,
      userId: 'cmgweoi1m0000wfrbtvq4pi87', // Using existing user ID from logs
      sessions: {
        create: [
          {
            title: 'Welcome Circle',
            description: 'Opening ceremony to welcome everyone to our festival',
            day: 'Friday',
            startTime: '09:00',
            endTime: '10:00',
            location: 'Main Hall',
            level: 'All Levels',
            styles: ['Community'],
            capacity: 50,
            teachers: ['Festival Team'],
            teacherBios: [],
            prerequisites: '',
            cardType: 'minimal'
          },
          {
            title: 'Morning Flow Yoga',
            description: 'Energizing vinyasa flow to start your day with intention',
            day: 'Friday',
            startTime: '10:30',
            endTime: '11:30',
            location: 'Yoga Studio',
            level: 'Beginner',
            styles: ['Vinyasa', 'Hatha'],
            capacity: 20,
            teachers: ['Sarah Johnson'],
            teacherBios: [],
            prerequisites: '',
            cardType: 'photo'
          },
          {
            title: 'Acro Fundamentals Workshop',
            description: 'Learn the foundational skills of partner acrobatics in a safe and supportive environment. Perfect for beginners!',
            day: 'Friday',
            startTime: '12:00',
            endTime: '14:00',
            location: 'Main Hall',
            level: 'Beginner',
            styles: ['Acrobatics', 'Partner Work'],
            capacity: 15,
            teachers: ['Mike Chen', 'Lisa Rodriguez'],
            teacherBios: [],
            prerequisites: 'No experience required',
            cardType: 'detailed'
          },
          {
            title: 'Lunch Break',
            description: 'Time to nourish your body with healthy, delicious food',
            day: 'Friday',
            startTime: '14:00',
            endTime: '15:00',
            location: 'Restaurant',
            level: 'All Levels',
            styles: ['Food'],
            capacity: 100,
            teachers: ['Kitchen Team'],
            teacherBios: [],
            prerequisites: '',
            cardType: 'minimal'
          },
          {
            title: 'Advanced Flow Sequences',
            description: 'Challenge yourself with complex acrobatic flows and transitions. High energy workshop for experienced practitioners.',
            day: 'Friday',
            startTime: '15:30',
            endTime: '17:00',
            location: 'Main Hall',
            level: 'Advanced',
            styles: ['Advanced Acrobatics', 'Flow'],
            capacity: 12,
            teachers: ['Alex Thompson'],
            teacherBios: [],
            prerequisites: '2+ years acro experience',
            cardType: 'detailed'
          },
          {
            title: 'Sound Healing Journey',
            description: 'Relax and restore with crystal bowls, gongs, and healing frequencies',
            day: 'Friday',
            startTime: '19:00',
            endTime: '20:00',
            location: 'Relaxation Room',
            level: 'All Levels',
            styles: ['Sound Healing', 'Meditation'],
            capacity: 30,
            teachers: ['Emma Wilson'],
            teacherBios: [],
            prerequisites: '',
            cardType: 'photo'
          }
        ]
      }
    }
  })

  console.log(`Created festival: ${festival.name} with slug: ${festival.slug}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })