import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateAccuracy } from "@/lib/ranking";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ProfileForm } from "./ProfileForm";

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function StatBox({ label, value, color = "text-white" }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="bg-brand-card border border-brand-border rounded-2xl px-2 py-3.5 text-center">
      <p className={`text-lg font-black leading-none ${color}`}>{value}</p>
      <p className="text-[9px] text-slate-600 mt-1.5 uppercase tracking-wider">{label}</p>
    </div>
  );
}

async function getProfileData(userId: string) {
  const [user, correctCount, totalPredictions, resolvedPredictions] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        image: true,
        totalPoints: true,
        isPaid: true,
        isAdmin: true,
        createdAt: true,
      },
    }),
    prisma.predictionPoints.count({ where: { userId, correct: true } }),
    prisma.prediction.count({ where: { userId } }),
    prisma.predictionPoints.count({ where: { userId } }),
  ]);

  const rank =
    (await prisma.user.count({
      where: { isAdmin: false, totalPoints: { gt: user.totalPoints } },
    })) + 1;

  return {
    user,
    correctCount,
    totalPredictions,
    rank,
    accuracy: calculateAccuracy(correctCount, resolvedPredictions),
  };
}

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  let data;
  try {
    data = await getProfileData(session.user.id);
  } catch {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-slate-500 text-sm">Error al cargar perfil.</p>
      </div>
    );
  }

  const { user, correctCount, totalPredictions, rank, accuracy } = data;

  const joined = new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(user.createdAt));

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Title */}
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Cuenta</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Perfil</h1>
      </div>

      {/* Avatar + identity */}
      <div className="theme-panel rounded-2xl overflow-hidden">
        <div className="flex flex-col items-center gap-3 py-7">
          <div className="w-20 h-20 rounded-full bg-brand-card-2 border-2 border-brand-border flex items-center justify-center text-2xl font-black text-slate-400 overflow-hidden">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(user.name)
            )}
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-base font-bold text-white">{user.name ?? "Anónimo"}</p>
              {user.isAdmin && (
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-600/20 border border-violet-600/30 text-violet-400">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{user.email}</p>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-3 py-1 rounded-full border ${
                user.isPaid
                  ? "bg-emerald-600/15 border-emerald-600/25 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/20 text-amber-500"
              }`}
            >
              {user.isPaid ? "Inscripto" : "Pago pendiente"}
            </span>
            {rank > 0 && (
              <span className="text-[10px] font-bold px-3 py-1 rounded-full border bg-blue-600/15 border-blue-600/25 text-blue-400">
                #{rank} en ranking
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2">
        <StatBox label="Puntos" value={user.totalPoints} />
        <StatBox label="Aciertos" value={correctCount} color="text-emerald-400" />
        <StatBox label="Predicciones" value={totalPredictions} color="text-blue-400" />
        <StatBox
          label="Efectiv."
          value={accuracy !== null ? `${accuracy}%` : "—"}
          color="text-amber-400"
        />
      </div>

      {/* Account info */}
      <div className="rounded-2xl border border-brand-border bg-brand-card overflow-hidden divide-y divide-brand-border">
        {[
          { label: "Email", value: user.email ?? "—" },
          { label: "Miembro desde", value: joined },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-xs text-slate-500">{row.label}</span>
            <span className="text-sm font-semibold text-white text-right truncate max-w-[55%]">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Quick link */}
      <Link
        href="/predictions"
        className="flex items-center gap-3 p-4 rounded-2xl border border-brand-border bg-brand-card active:bg-brand-card-2 transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-600/12 border border-emerald-600/20 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-white">Mis predicciones</p>
          <p className="text-[11px] text-slate-600">{totalPredictions} prediccion{totalPredictions !== 1 ? "es" : ""} · {correctCount} acierto{correctCount !== 1 ? "s" : ""}</p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 flex-shrink-0">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </Link>

      {/* Admin shortcut */}
      {user.isAdmin && (
        <Link
          href="/admin/users"
          className="flex items-center gap-3 p-4 rounded-2xl border border-violet-800/30 bg-violet-600/5 active:bg-violet-600/10 transition-colors"
        >
          <div className="w-9 h-9 rounded-xl bg-violet-600/15 border border-violet-600/20 flex items-center justify-center flex-shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-violet-300">Panel de administración</p>
            <p className="text-[11px] text-slate-600">Usuarios, partidos, sync</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-700 flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </Link>
      )}

      {/* Edit + sign out */}
      <ProfileForm initialName={user.name ?? ""} />
    </div>
  );
}
