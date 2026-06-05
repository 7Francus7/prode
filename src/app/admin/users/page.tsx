import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const session = await auth();
  if (session?.user?.isBlocked) redirect("/blocked");
  if (!session?.user?.isAdmin) redirect("/");

  const users = await prisma.user.findMany({
    select: {
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
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminUsersClient
      initialUsers={users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      }))}
      currentUserId={session.user.id}
      canManageAccounts={session.user.isSuperAdmin === true}
    />
  );
}
