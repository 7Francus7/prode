import SoccerLoader from "@/components/SoccerLoader";

// Skeleton de carga genérico. Next lo muestra al instante al navegar a
// cualquier ruta de (main) que no defina su propio loading, así el cambio
// de pantalla se siente inmediato mientras se cargan los datos en el server.
function MatchCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-brand-border bg-brand-card">
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
  );
}

export default function Loading() {
  return (
    <div className="space-y-5">
      <section
        className="flex items-center justify-center rounded-[1.9rem] border px-4 py-12"
        style={{
          background: "var(--app-hero-bg)",
          borderColor: "var(--app-hero-border)",
          boxShadow: "var(--app-hero-shadow)",
        }}
      >
        <SoccerLoader label="Cargando" size={58} />
      </section>

      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <MatchCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
