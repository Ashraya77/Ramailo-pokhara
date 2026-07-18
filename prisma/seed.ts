import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  UserRole,
} from "../app/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
const adminEmail = process.env.ADMIN_EMAIL;
const adminPassword = process.env.ADMIN_PASSWORD;
const adminName = process.env.ADMIN_NAME ?? "News Admin";

if (!connectionString) {
  throw new Error("DATABASE_URL is required.");
}

if (!adminEmail) {
  throw new Error("ADMIN_EMAIL is required.");
}

if (!adminPassword || adminPassword.length < 12) {
  throw new Error(
    "ADMIN_PASSWORD must contain at least 12 characters.",
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

async function main(
  email: string,
  password: string,
  name: string,
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: {
      email: normalizedEmail,
    },

    update: {
      name,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },

    create: {
      name,
      email: normalizedEmail,
      passwordHash,
      role: UserRole.ADMIN,
      isActive: true,
    },

    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("Admin account seeded:", admin.email);
}

main(adminEmail, adminPassword, adminName)
  .catch((error: unknown) => {
    console.error("Failed to seed database:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
