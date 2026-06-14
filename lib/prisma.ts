import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { Prisma, PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "password",
  database: process.env.DATABASE_NAME || "mylog",
  connectionLimit: 5,
});

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaVersion: string | undefined;
};

function createPrismaClient() {
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  if (process.env.NODE_ENV === "production") {
    return globalForPrisma.prisma ?? createPrismaClient();
  }
  // Dev: invalidate cached client on schema change via version check
  const currentVersion = Prisma.prismaVersion?.client ?? "";
  if (globalForPrisma.prisma && globalForPrisma.prismaVersion !== currentVersion) {
    globalForPrisma.prisma = undefined;
  }
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
    globalForPrisma.prismaVersion = currentVersion;
  }
  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
