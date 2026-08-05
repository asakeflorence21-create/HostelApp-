import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

// Pilot institution first, plus a handful of others so the "select your
// institution" list isn't empty when the pilot expands.
const institutions = [
  { name: "University of Lagos (UNILAG)", city: "Lagos", state: "Lagos" },
  { name: "University of Ibadan (UI)", city: "Ibadan", state: "Oyo" },
  { name: "Obafemi Awolowo University (OAU)", city: "Ile-Ife", state: "Osun" },
  { name: "Covenant University", city: "Ota", state: "Ogun" },
  { name: "University of Nigeria, Nsukka (UNN)", city: "Nsukka", state: "Enugu" },
  { name: "Ahmadu Bello University (ABU)", city: "Zaria", state: "Kaduna" },
  { name: "Lagos State University (LASU)", city: "Lagos", state: "Lagos" },
];

async function main() {
  for (const institution of institutions) {
    await prisma.institution.upsert({
      where: { name: institution.name },
      update: {},
      create: institution,
    });
  }
  console.log(`Seeded ${institutions.length} institutions.`);

  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@studentnest.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "ChangeMe123!";

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "StudentNest Admin",
        role: "ADMIN",
        passwordHash,
        verified: true,
      },
    });
    console.log(`Seeded admin user: ${adminEmail} / ${adminPassword} (change this password immediately)`);
  } else {
    console.log("Admin user already exists, skipping.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
