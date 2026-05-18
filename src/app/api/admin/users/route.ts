import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      isPaid: true,
      isAdmin: true,
      createdAt: true,
      _count: { select: { predictions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}
