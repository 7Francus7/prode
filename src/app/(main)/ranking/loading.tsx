// Skeleton del ranking: hero + podio + filas de tabla.
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
        <div className="h-2.5 w-24 rounded-md skeleton" />
        <div className="mt-3 h-8 w-40 rounded-lg skeleton" />
      </section>

      <div className="grid grid-cols-3 items-end gap-2">
        {[14, 18, 12].map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full skeleton" />
            <div className="h-3 w-14 rounded-md skeleton" />
            <div className="w-full rounded-t-xl skeleton" style={{ height: `${h * 4}px` }} />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl border border-brand-border bg-brand-card px-4 py-3"
          >
            <div className="h-5 w-5 rounded-md skeleton" />
            <div className="h-8 w-8 rounded-full skeleton" />
            <div className="h-3 flex-1 rounded-md skeleton" />
            <div className="h-4 w-10 rounded-md skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
}
