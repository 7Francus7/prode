import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin || session.user.isBlocked) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
  }

  const { isPaid } = body as { isPaid?: unknown };

  if (typeof isPaid !== "boolean") {
    return NextResponse.json({ error: "isPaid debe ser boolean" }, { status: 400 });
  }

  try {
    const target = await prisma.user.findUnique({
      where: { id },
      select: { isAdmin: true },
    });

    if (!target) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (target.isAdmin && !session.user.isSuperAdmin) {
      return NextResponse.json({ error: "Solo un super admin puede modificar admins" }, { status: 403 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { isPaid },
      select: { id: true, name: true, email: true, isPaid: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    console.error("[admin:user-payment] error:", error);
    return NextResponse.json({ error: "No se pudo actualizar el pago" }, { status: 500 });
  }
}
