export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex flex-col items-center justify-center px-4 py-12 overflow-hidden"
      style={{
        minHeight: "100dvh",
        background:
          "radial-gradient(ellipse 110% 55% at 50% -5%, rgba(37,99,235,0.16) 0%, transparent 65%), " +
          "radial-gradient(ellipse 55% 40% at 5% 95%, rgba(79,70,229,0.09) 0%, transparent 55%), " +
          "#080c17",
      }}
    >
      {/* Subtle field grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.016) 1px, transparent 1px), " +
            "linear-gradient(90deg, rgba(255,255,255,0.016) 1px, transparent 1px)",
          backgroundSize: "52px 52px",
          maskImage:
            "radial-gradient(ellipse 85% 85% at 50% 45%, rgba(0,0,0,0.65) 0%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 85% at 50% 45%, rgba(0,0,0,0.65) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="logo-glow mb-6">
            <div
              className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center"
              style={{
                background: "linear-gradient(145deg, #4f95ff 0%, #2563eb 55%, #1e3faa 100%)",
                boxShadow:
                  "0 8px 32px rgba(37,99,235,0.44), " +
                  "inset 0 0 0 1px rgba(255,255,255,0.12), " +
                  "inset 0 2px 0 rgba(255,255,255,0.1)",
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
            <h1
              className="font-black uppercase leading-none text-white"
              style={{ fontSize: "26px", letterSpacing: "0.06em" }}
            >
              Prode <span style={{ color: "#60a5fa" }}>2026</span>
            </h1>
            <p
              className="font-semibold uppercase mt-2"
              style={{
                fontSize: "10px",
                letterSpacing: "0.18em",
                color: "rgba(148,163,184,0.42)",
              }}
            >
              Predicciones · Mundial FIFA
            </p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
