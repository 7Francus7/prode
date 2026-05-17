"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconFixture() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  );
}

function IconRanking() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}

function IconPicks() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function IconProfile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/", label: "Inicio", Icon: IconHome },
  { href: "/fixture", label: "Fixture", Icon: IconFixture },
  { href: "/ranking", label: "Ranking", Icon: IconRanking },
  { href: "/predictions", label: "Picks", Icon: IconPicks },
  { href: "/profile", label: "Perfil", Icon: IconProfile },
];

const NAVBAR_GLASS: React.CSSProperties = {
  background: "rgba(8, 12, 22, 0.9)",
  backdropFilter: "blur(20px) saturate(1.5)",
  WebkitBackdropFilter: "blur(20px) saturate(1.5)",
  borderColor: "rgba(255,255,255,0.07)",
};

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top bar */}
      <header
        className="hidden sm:flex items-center justify-between px-6 py-3.5 border-b sticky top-0 z-50"
        style={NAVBAR_GLASS}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "linear-gradient(145deg, #4f95ff 0%, #2563eb 100%)",
              boxShadow: "0 2px 8px rgba(37,99,235,0.38)",
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="1.75"
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
          <span className="font-black text-[13px] tracking-[0.08em] uppercase text-white/90">
            Prode <span className="text-blue-400">2026</span>
          </span>
        </div>

        <nav className="flex items-center gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-150",
                  active
                    ? "text-blue-400"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
                style={
                  active
                    ? {
                        background: "rgba(59,130,246,0.1)",
                        border: "1px solid rgba(59,130,246,0.18)",
                      }
                    : { border: "1px solid transparent" }
                }
              >
                <item.Icon />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Mobile bottom bar */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-50 border-t"
        style={{
          ...NAVBAR_GLASS,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex flex-col items-center justify-center pt-2.5 pb-2 gap-1 transition-colors relative",
                  active ? "text-blue-400" : "text-slate-600"
                )}
                style={active ? { background: "rgba(59,130,246,0.04)" } : {}}
              >
                {active && (
                  <span
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[2px] rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, rgba(96,165,250,0) 0%, #60a5fa 50%, rgba(96,165,250,0) 100%)",
                    }}
                  />
                )}
                <item.Icon />
                <span className="text-[9px] font-bold tracking-wider uppercase">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
