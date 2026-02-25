import { prisma } from './src/lib/prisma'

async function testDatabasePerformance() {
  console.log('🔍 Testing database performance...\n')

  // Test 1: Simple query
  const start1 = Date.now()
  try {
    const userCount = await prisma.user.count()
    const time1 = Date.now() - start1
    console.log(`✅ User count query: ${time1}ms (${userCount} users)`)
  } catch (error: any) {
    console.error(`❌ User count query failed: ${error.message}`)
  }

  // Test 2: Complex query with relations
  const start2 = Date.now()
  try {
    const festivals = await prisma.festival.findMany({
      take: 5,
      include: {
        user: { select: { email: true } },
        sessions: true,
        _count: { select: { sessions: true } }
      }
    })
    const time2 = Date.now() - start2
    console.log(`✅ Festival query with relations: ${time2}ms (${festivals.length} festivals)`)
  } catch (error: any) {
    console.error(`❌ Festival query failed: ${error.message}`)
  }

  // Test 3: Analytics query
  const start3 = Date.now()
  try {
    const analyticsCount = await prisma.analytics.count()
    const time3 = Date.now() - start3
    console.log(`✅ Analytics count: ${time3}ms (${analyticsCount} events)`)
  } catch (error: any) {
    console.error(`❌ Analytics query failed: ${error.message}`)
  }

  // Test 4: Check connection pool stats
  console.log('\n📊 Connection Pool Info:')
  console.log(`DATABASE_URL: ${process.env.DATABASE_URL?.includes('pooler') ? '✅ Using pooler (port 6543)' : '❌ Not using pooler'}`)
  
  await prisma.$disconnect()
  console.log('\n✅ Tests complete!')
}

testDatabasePerformance()
  .catch(console.error)
  .finally(() => process.exit())
