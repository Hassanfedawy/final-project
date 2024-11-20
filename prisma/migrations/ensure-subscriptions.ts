const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Get all users without subscriptions
  const usersWithoutSubscription = await prisma.user.findMany({
    where: {
      subscription: null,
    },
  })

  console.log(`Found ${usersWithoutSubscription.length} users without subscriptions`)

  // Create free subscriptions for these users
  for (const user of usersWithoutSubscription) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        plan: 'FREE',
        status: 'ACTIVE',
        startDate: new Date(),
      },
    })
    console.log(`Created free subscription for user ${user.id}`)
  }

  console.log('Migration completed successfully')
}

main()
  .catch((e) => {
    console.error('Migration failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
