import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  if (session.user.isBlocked) {
    return NextResponse.json({ error: "Cuenta bloqueada" }, { status: 403 });
  }

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name.trim() },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile] error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
