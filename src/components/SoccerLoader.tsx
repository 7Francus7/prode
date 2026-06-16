// Pelota de fútbol animada (rebota + gira) con sombra. Sin estado ni 'use
// client': es solo markup + CSS, así puede usarse en Server Components como
// los loading.tsx. Respeta prefers-reduced-motion (ver globals.css).
export default function SoccerLoader({
  label,
  size = 48,
}: {
  label?: string;
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3.5">
      <div
        className="soccer-loader"
        style={{ height: size * 1.32 }}
        role="status"
        aria-label={label ?? "Cargando"}
      >
        <div className="soccer-bounce">
          <svg
            className="soccer-spin"
            width={size}
            height={size}
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
          >
            <defs>
              <radialGradient id="ballGrad" cx="38%" cy="32%" r="75%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#dbe2ec" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="46" fill="url(#ballGrad)" stroke="#0f172a" strokeWidth="3" />
            <polygon
              points="50,34 65.2,45 59.4,62.8 40.6,62.8 34.8,45"
              fill="#0f172a"
            />
            <g stroke="#0f172a" strokeWidth="3" strokeLinecap="round">
              <line x1="50" y1="34" x2="50" y2="6" />
              <line x1="65.2" y1="45" x2="92" y2="36.4" />
              <line x1="59.4" y1="62.8" x2="76" y2="85.6" />
              <line x1="40.6" y1="62.8" x2="24" y2="85.6" />
              <line x1="34.8" y1="45" x2="8" y2="36.4" />
            </g>
          </svg>
        </div>
        <span className="soccer-shadow" style={{ width: size * 0.66 }} />
      </div>
      {label && (
        <p className="text-[0.66rem] font-bold uppercase tracking-[0.24em] text-slate-500 animate-urgent-blink">
          {label}
        </p>
      )}
    </div>
  );
}
