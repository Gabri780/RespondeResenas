process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";
import { PrismaClient } from "@prisma/client";

const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const getPrisma = () => {
  if (process.env.NODE_ENV === "production") return prismaClientSingleton();
  if (!globalThis.prisma) {
    globalThis.prisma = prismaClientSingleton();
  }
  return globalThis.prisma;
};

export default getPrisma;
