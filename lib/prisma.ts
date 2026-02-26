import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Only log errors — never log queries in any environment (too verbose, kills perf)
    log: ["error"],
  });

// Always reuse the single PrismaClient instance (avoids connection pool exhaustion)
globalForPrisma.prisma = prisma;
