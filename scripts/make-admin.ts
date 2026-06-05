import { PrismaClient } from "@prisma/client";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npm run admin:make -- <email> [--super]");
  process.exit(1);
}
const isSuperAdmin = process.argv.includes("--super") || process.env.npm_config_super !== undefined;

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        isAdmin: true,
        ...(isSuperAdmin ? { isSuperAdmin: true } : {}),
        isPaid: true,
        isBlocked: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isSuperAdmin: true,
        isPaid: true,
        isBlocked: true,
      },
    });
    console.log("Admin activado:");
    console.log(`  Nombre:  ${user.name ?? "(sin nombre)"}`);
    console.log(`  Email:   ${user.email}`);
    console.log(`  isAdmin: ${user.isAdmin}`);
    console.log(`  isSuperAdmin: ${user.isSuperAdmin}`);
    console.log(`  isPaid:  ${user.isPaid}`);
    console.log(`  isBlocked: ${user.isBlocked}`);
  } catch (e: unknown) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2025") {
      console.error(`No existe usuario con email: ${email}`);
      console.error("Registralo primero en /register.");
    } else {
      console.error("Error al activar admin:", e);
    }
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
