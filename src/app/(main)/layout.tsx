import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-brand-dark">
      <Navbar />
      {/* pb-nav = 4.5rem + safe-area-inset-bottom, defined in globals.css */}
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-nav sm:pb-10">
        {children}
      </main>
    </div>
  );
}
