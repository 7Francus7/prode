import SoccerLoader from "@/components/SoccerLoader";

// Skeleton del fixture: hero con pelota + grid de grupos + posiciones + partidos.
export default function Loading() {
  return (
    <div className="space-y-5">
      <section
        className="rounded-[1.9rem] border px-4 py-6"
        style={{
          background: "var(--app-hero-bg)",
          borderColor: "var(--app-hero-border)",
          boxShadow: "var(--app-hero-shadow)",
        }}
      >
        <div className="flex justify-center py-2">
          <SoccerLoader label="Cargando fixture" size={56} />
        </div>
        <div className="mt-5 grid grid-cols-6 gap-1.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-10 w-full rounded-2xl skeleton" />
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-brand-border bg-brand-card p-4 space-y-3">
        <div className="h-3 w-24 rounded-md skeleton" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-3 w-full rounded-md skeleton" />
        ))}
      </div>

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-brand-border bg-brand-card"
          >
            <div className="px-4 pt-3.5 pb-0">
              <div className="h-3 w-16 rounded-md skeleton" />
            </div>
            <div className="px-4 pt-3 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex flex-1 flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full skeleton" />
                  <div className="h-3 w-10 rounded-md skeleton" />
                </div>
                <div className="flex min-w-[84px] flex-col items-center gap-2">
                  <div className="h-7 w-16 rounded-lg skeleton" />
                  <div className="h-2.5 w-20 rounded-md skeleton" />
                </div>
                <div className="flex flex-1 flex-col items-center gap-2">
                  <div className="h-10 w-10 rounded-full skeleton" />
                  <div className="h-3 w-10 rounded-md skeleton" />
                </div>
              </div>
            </div>
            <div className="border-t border-brand-border px-3 pt-2.5 pb-3">
              <div className="flex gap-1.5">
                <div className="h-11 flex-1 rounded-xl skeleton" />
                <div className="h-11 flex-1 rounded-xl skeleton" />
                <div className="h-11 flex-1 rounded-xl skeleton" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
