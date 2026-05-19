import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json() as { endpoint?: string };
  if (!body.endpoint) return NextResponse.json({ error: "Endpoint requerido" }, { status: 400 });

  await prisma.pushSubscription
    .deleteMany({ where: { userId: session.user.id, endpoint: body.endpoint } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
