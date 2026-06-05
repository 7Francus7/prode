import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { z } from "zod";

const adminUserSelect = {
  id: true,
  name: true,
  email: true,
  isPaid: true,
  isAdmin: true,
  isSuperAdmin: true,
  isBlocked: true,
  totalPoints: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { predictions: true, predictionPoints: true } },
} satisfies Prisma.UserSelect;

const userPatchSchema = z
  .object({
    name: z.string().trim().min(1, "Nombre requerido").max(40, "Nombre demasiado largo").optional(),
    email: z.email("Email invalido").transform((value) => value.trim().toLowerCase()).optional(),
    isPaid: z.boolean().optional(),
    isAdmin: z.boolean().optional(),
    isSuperAdmin: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Sin cambios");

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function ensureOtherActiveSuperAdmin(targetId: string) {
  const otherSuperAdmins = await prisma.user.count({
    where: {
      id: { not: targetId },
      isAdmin: true,
      isSuperAdmin: true,
      isBlocked: false,
    },
  });

  return otherSuperAdmins > 0;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isAdmin || session.user.isBlocked) {
    return jsonError("No autorizado", 403);
  }

  const { id } = await params;
  const parsed = userPatchSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message ?? "Payload invalido", 400);
  }

  const changes = parsed.data;
  const superOnlyFields = ["name", "email", "isAdmin", "isSuperAdmin", "isBlocked"] as const;
  const touchesSuperOnlyField = superOnlyFields.some((field) => field in changes);

  if (touchesSuperOnlyField && !session.user.isSuperAdmin) {
    return jsonError("Solo un super admin puede editar cuentas", 403);
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      isAdmin: true,
      isSuperAdmin: true,
      isBlocked: true,
    },
  });

  if (!target) {
    return jsonError("Usuario no encontrado", 404);
  }

  if (!session.user.isSuperAdmin && target.isAdmin) {
    return jsonError("Solo un super admin puede modificar admins", 403);
  }

  const nextIsAdmin = "isAdmin" in changes ? changes.isAdmin : target.isAdmin;
  const nextIsSuperAdmin = "isSuperAdmin" in changes ? changes.isSuperAdmin : target.isSuperAdmin;
  const nextIsBlocked = "isBlocked" in changes ? changes.isBlocked : target.isBlocked;

  if (nextIsSuperAdmin && !nextIsAdmin) {
    return jsonError("Un super admin tambien debe ser admin", 400);
  }

  if (nextIsSuperAdmin && nextIsBlocked) {
    return jsonError("Un super admin activo no puede estar bloqueado", 400);
  }

  if (target.id === session.user.id && (nextIsBlocked || !nextIsAdmin || !nextIsSuperAdmin)) {
    return jsonError("No podes quitarte tu propio acceso de super admin", 400);
  }

  const losesActiveSuperAdmin =
    target.isSuperAdmin && (!nextIsSuperAdmin || !nextIsAdmin || nextIsBlocked);

  if (losesActiveSuperAdmin && !(await ensureOtherActiveSuperAdmin(target.id))) {
    return jsonError("Debe quedar al menos un super admin activo", 400);
  }

  const data: Prisma.UserUpdateInput = {};
  if ("name" in changes) data.name = changes.name;
  if ("email" in changes) data.email = changes.email;
  if ("isPaid" in changes) data.isPaid = changes.isPaid;
  if ("isAdmin" in changes) data.isAdmin = changes.isAdmin;
  if ("isSuperAdmin" in changes) data.isSuperAdmin = changes.isSuperAdmin;
  if ("isBlocked" in changes) data.isBlocked = changes.isBlocked;

  try {
    const user = await prisma.user.update({
      where: { id },
      data,
      select: adminUserSelect,
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return jsonError("Ese email ya esta registrado", 409);
    }

    console.error("[admin:user-update] error:", error);
    return jsonError("No se pudo actualizar el usuario", 500);
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.isSuperAdmin || session.user.isBlocked) {
    return jsonError("No autorizado", 403);
  }

  const { id } = await params;
  if (id === session.user.id) {
    return jsonError("No podes eliminar tu propia cuenta", 400);
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, isAdmin: true, isSuperAdmin: true, isBlocked: true },
  });

  if (!target) {
    return jsonError("Usuario no encontrado", 404);
  }

  const deletesActiveSuperAdmin = target.isAdmin && target.isSuperAdmin && !target.isBlocked;
  if (deletesActiveSuperAdmin && !(await ensureOtherActiveSuperAdmin(target.id))) {
    return jsonError("Debe quedar al menos un super admin activo", 400);
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("[admin:user-delete] error:", error);
    return jsonError("No se pudo eliminar el usuario", 500);
  }
}
