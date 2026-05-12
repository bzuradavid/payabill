import bcrypt from "bcryptjs";

import { PrismaClient } from "../generated/prisma/index.js";
import { seedOrganization } from "../src/server/seed-user";

const db = new PrismaClient();

async function main() {
  // Wipe any prior demo state so seeding is fully idempotent. Org delete
  // cascades to vendors / bills / GL accounts / invitations; users with
  // `User.organizationId` pointing at the deleted org get nulled out, so
  // we also delete the test-user rows explicitly by email.
  await db.organization.deleteMany({ where: { name: "Payable Demo Co" } });
  await db.user.deleteMany({
    where: { email: { in: ["manager@payabill.com", "staff@payabill.com"] } },
  });

  const passwordHash = await bcrypt.hash("pass1234", 10);

  const org = await db.organization.create({
    data: { name: "Payable Demo Co" },
  });

  const manager = await db.user.create({
    data: {
      name: "Demo Manager",
      email: "manager@payabill.com",
      passwordHash,
      organizationId: org.id,
      role: "MANAGER",
    },
  });

  const staff = await db.user.create({
    data: {
      name: "Demo Staff",
      email: "staff@payabill.com",
      passwordHash,
      organizationId: org.id,
      role: "STAFF",
    },
  });

  await seedOrganization(db, org.id, manager.id, staff.id);

  console.log("[seed] Demo org seeded:");
  console.log("       manager@payabill.com / pass1234");
  console.log("       staff@payabill.com / pass1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
