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
    <div className="app-shell min-h-screen">
      <Navbar />
      <main
        className="max-w-2xl mx-auto px-4 pb-nav sm:pt-4 sm:pb-10"
        style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}
      >
        {children}
      </main>
    </div>
  );
}
