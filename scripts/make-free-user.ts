import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function makeFreeUser() {
  const email = 'florian.hohenleitner+2@gmail.com';
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true }
  });
  
  if (!user) {
    console.log('User not found');
    return;
  }
  
  console.log('Current subscription:', user.subscription);
  
  if (user.subscription) {
    await prisma.subscription.update({
      where: { id: user.subscription.id },
      data: {
        plan: 'FREE',
        festivalsLimit: 1,
        stripeCurrentPeriodEnd: null
      }
    });
    console.log('✅ Updated to FREE plan (1 festival limit)');
  } else {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
        status: 'ACTIVE',
        festivalsLimit: 1
      }
    });
    console.log('✅ Created FREE subscription (1 festival limit)');
  }
  
  const updated = await prisma.user.findUnique({
    where: { email },
    include: { subscription: true }
  });
  console.log('\nUpdated subscription:', updated?.subscription);
}

makeFreeUser()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
