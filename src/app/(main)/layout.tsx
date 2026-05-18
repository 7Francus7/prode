import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Admins bypass payment gate
  if (session.user.isAdmin) redirect("/admin/users");

  if (!session.user.isPaid) {
    redirect("/pending");
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #0a0f20 0%, #080b14 35%, #080914 100%)" }}>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-nav sm:pb-10">
        {children}
      </main>
    </div>
  );
}
