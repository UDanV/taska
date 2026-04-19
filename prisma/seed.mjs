import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = process.env.ROOT_EMAIL || "root@taska.local";
  const password = process.env.ROOT_PASSWORD || "ChangeMe123!";
  const name = process.env.ROOT_NAME || "Root";

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      password: hashedPassword,
      role: "ROOT",
    },
    create: {
      name,
      email,
      password: hashedPassword,
      role: "ROOT",
    },
  });

  console.log("Root account is ready:");
  console.log(`email: ${user.email}`);
  console.log(`password: ${password}`);
}

main()
  .catch((error) => {
    console.error("Failed to seed root account", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
