export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="bg-brand-dark flex flex-col items-center justify-center px-4 py-10"
      style={{ minHeight: "100dvh" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" x2="18" y1="20" y2="10" />
              <line x1="12" x2="12" y1="20" y2="4" />
              <line x1="6" x2="6" y1="20" y2="14" />
            </svg>
          </div>
          <h1 className="text-[15px] font-black tracking-[0.1em] uppercase text-white">
            Prode <span className="text-blue-400">2026</span>
          </h1>
          <p className="text-[11px] text-slate-600 mt-1 tracking-wide">
            Predicciones del Mundial
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
