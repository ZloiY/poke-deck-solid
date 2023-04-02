import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = new PrismaClient({
  log:
    import.meta.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});
