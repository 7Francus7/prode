export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-4 py-12"
      style={{
        background:
          "radial-gradient(circle at 50% -8%, rgba(214,164,74,0.14) 0%, transparent 32%), " +
          "radial-gradient(circle at 8% 92%, rgba(148,163,184,0.08) 0%, transparent 24%), " +
          "linear-gradient(180deg, #0d1119 0%, #090c13 48%, #06080d 100%)",
      }}
    >
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 82% 82% at 50% 45%, rgba(0,0,0,0.8) 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 82% 82% at 50% 45%, rgba(0,0,0,0.8) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-12 flex flex-col items-center">
          <div className="logo-glow mb-6">
            <div
              className="flex h-[76px] w-[76px] items-center justify-center rounded-[24px]"
              style={{
                background: "linear-gradient(145deg, #d6a44a 0%, #8f5c1f 100%)",
                boxShadow:
                  "0 12px 34px rgba(143,92,31,0.38), inset 0 1px 0 rgba(255,255,255,0.14)",
              }}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2z" />
              </svg>
            </div>
          </div>

          <div className="text-center">
            <h1 className="font-display text-[2rem] font-bold tracking-[-0.05em] text-white">
              Prode <span className="text-amber-200">2026</span>
            </h1>
            <p className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-500">
              Predicciones · Mundial FIFA
            </p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
