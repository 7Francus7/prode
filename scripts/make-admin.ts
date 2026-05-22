import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run admin:make -- <email>");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true, isPaid: true },
    select: { id: true, name: true, email: true, isAdmin: true, isPaid: true },
  });
  console.log("Admin activado:");
  console.log(`  Nombre:  ${user.name ?? "(sin nombre)"}`);
  console.log(`  Email:   ${user.email}`);
  console.log(`  isAdmin: ${user.isAdmin}`);
  console.log(`  isPaid:  ${user.isPaid}`);
} catch (e: unknown) {
  if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
    console.error(`No existe usuario con email: ${email}`);
    console.error("Registralo primero en /register.");
  } else {
    console.error("Error al activar admin:", e);
  }
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
