import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { isPaid } = await request.json();

  if (typeof isPaid !== "boolean") {
    return NextResponse.json({ error: "isPaid debe ser boolean" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id },
    data: { isPaid },
    select: { id: true, name: true, email: true, isPaid: true },
  });

  return NextResponse.json(user);
}
