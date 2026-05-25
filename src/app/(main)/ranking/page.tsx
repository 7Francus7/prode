import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildRankingEntries } from "@/lib/ranking";
import Podium from "@/components/Podium";
import RankingTable from "@/components/RankingTable";
import MyPositionBanner from "@/components/MyPositionBanner";
import type { RankingEntry } from "@/types";

export const dynamic = "force-dynamic";

async function getRanking(): Promise<RankingEntry[]> {
  const users = await prisma.user.findMany({
    where: { isAdmin: false },
    select: {
      id: true,
      name: true,
      image: true,
      totalPoints: true,
      predictionPoints: {
        where: { correct: true },
        select: { id: true },
      },
      _count: {
        select: {
          predictions: true,
          predictionPoints: true,
        },
      },
    },
    orderBy: [{ totalPoints: "desc" }, { name: "asc" }],
  });

  return buildRankingEntries(users);
}

export default async function RankingPage() {
  const session = await auth();
  const ranking = await getRanking();
  const top3 = ranking.slice(0, 3);
  const myEntry = ranking.find((e) => e.id === session?.user.id);

  return (
    <div className="space-y-6">

      {/* Sticky my-position banner */}
      {myEntry && <MyPositionBanner entry={myEntry} total={ranking.length} />}

      {/* Title */}
      <div className="pt-2">
        <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600 mb-1">Clasificación</p>
        <h1 className="text-[22px] font-black text-white tracking-tight leading-none">Ranking</h1>
      </div>

      {ranking.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-brand-border bg-brand-card">
          <div className="w-14 h-14 rounded-full bg-brand-card-2 border border-brand-border flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600">
              <line x1="18" x2="18" y1="20" y2="10" />
              <line x1="12" x2="12" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="14" />
            </svg>
          </div>
          <p className="text-slate-400 font-semibold text-sm">Nadie ha sumado puntos aún</p>
          <p className="text-slate-700 text-xs mt-1.5">El Mundial arranca el 11 de junio</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {top3.length > 0 && (
            <div className="rounded-2xl border border-brand-border bg-brand-card pt-5 pb-0 overflow-hidden">
              <p className="text-center text-[9px] font-bold text-slate-700 uppercase tracking-[0.18em] mb-4">
                Podio
              </p>
              <Podium entries={top3} />
            </div>
          )}

          {/* Full table */}
          <div>
            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.14em] mb-3">
              Tabla completa
            </p>
            <RankingTable
              entries={ranking}
              currentUserId={session?.user.id}
            />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-5 py-2">
            {[
              { label: "Pts", desc: "Puntos" },
              { label: "Ac.", desc: "Aciertos" },
              { label: "%", desc: "Efectividad" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-600 uppercase">{l.label}</span>
                <span className="text-[10px] text-slate-700">= {l.desc}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
