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

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop top bar */}
      <header className="hidden sm:flex items-center justify-between px-6 py-3 border-b border-brand-border bg-brand-card sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a10 10 0 0 0-6.88 17.26L12 12 18.88 19.26A10 10 0 0 0 12 2z" fill="rgba(0,0,0,0.2)" />
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
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all",
                  active
                    ? "bg-blue-600/15 text-blue-400"
                    : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
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
        className="sm:hidden fixed bottom-0 inset-x-0 z-50 bg-brand-card border-t border-brand-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
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
              >
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[2px] rounded-full bg-blue-500" />
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
