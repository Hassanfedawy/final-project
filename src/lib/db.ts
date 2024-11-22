import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    errorFormat: 'pretty',
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add Prisma connection retry logic
    __internal: {
      engine: {
        connectTimeout: 30000, // 30 seconds
        binaryTargets: ["native"],
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Handle Prisma Client disconnection
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle uncaught errors
process.on('uncaughtException', async (e) => {
  console.error('Uncaught Exception:', e);
  await prisma.$disconnect();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (e) => {
  console.error('Unhandled Rejection:', e);
  await prisma.$disconnect();
  process.exit(1);
});
