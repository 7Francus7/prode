import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
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

  return (
    <AdminUsersClient
      initialUsers={users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
      }))}
    />
  );
}
