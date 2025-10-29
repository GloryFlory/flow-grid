const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@test.com' }
    })

    if (existingUser) {
      console.log('Test user already exists!')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12)

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        password: hashedPassword,
        emailVerified: new Date(),
        role: 'USER'
      }
    })

    // Create a FREE subscription for the user
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      }
    })

    console.log('Test user created successfully!')
    console.log('Email: test@test.com')
    console.log('Password: password123')
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()