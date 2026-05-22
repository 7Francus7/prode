import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const unsubscribeSchema = z.object({
  endpoint: z.string().url("Endpoint requerido"),
});

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = unsubscribeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Endpoint requerido" }, { status: 400 });
  }

  await prisma.pushSubscription
    .deleteMany({ where: { userId: session.user.id, endpoint: parsed.data.endpoint } })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
