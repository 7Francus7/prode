"use client";

import Link from "next/link";
import { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";
import type { ComponentType } from "react";

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
  background: "var(--app-navbar-bg)",
  backdropFilter: "blur(20px) saturate(1.35)",
  WebkitBackdropFilter: "blur(20px) saturate(1.35)",
  borderColor: "var(--app-navbar-border)",
};

type NavItemType = { href: string; label: string; Icon: ComponentType };

// Item del nav inferior (mobile). Usa useLinkStatus para resaltar la pestaña
// apenas se toca —mientras la nueva ruta está "pending"— sin esperar a que
// cargue, dando feedback instantáneo.
function BottomNavItem({ item, active }: { item: NavItemType; active: boolean }) {
  return (
    <Link
      href={item.href}
      className="relative flex min-h-[64px] flex-col items-center justify-center gap-1 pt-2 pb-2 transition duration-200 active:scale-[0.94]"
    >
      <BottomNavContent item={item} active={active} />
    </Link>
  );
}

function BottomNavContent({ item, active }: { item: NavItemType; active: boolean }) {
  const { pending } = useLinkStatus();
  const show = active || pending;
  const color = show ? "text-amber-200" : "text-slate-600";
  return (
    <>
      {show && (
        <>
          <span className="absolute inset-0" style={{ background: "rgba(214,164,74,0.05)" }} />
          <span
            className="absolute top-0 left-1/2 h-[2px] w-8 -translate-x-1/2 rounded-full animate-nav-indicator"
            style={{
              background:
                "linear-gradient(90deg, rgba(214,164,74,0) 0%, rgba(214,164,74,1) 50%, rgba(214,164,74,0) 100%)",
            }}
          />
        </>
      )}
      <span className={cn("relative", color)}>
        <item.Icon />
      </span>
      <span className={cn("relative text-[9px] font-bold uppercase tracking-[0.18em]", color)}>
        {item.label}
      </span>
    </>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  return (
    <>
      <header
        className="sticky top-0 z-50 hidden items-center justify-between border-b px-6 py-3.5 sm:flex"
        style={NAVBAR_GLASS}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-xl"
            style={{
              background: "linear-gradient(145deg, #d6a44a 0%, #8f5c1f 100%)",
              boxShadow: "0 6px 18px rgba(143,92,31,0.28)",
            }}
          >
            <svg
              width="15"
              height="15"
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
          <div>
            <span className="font-display text-[1.05rem] font-bold tracking-[-0.04em] text-white">
              Prode <span className="text-amber-200">2026</span>
            </span>
            <p className="text-[0.62rem] uppercase tracking-[0.18em] text-slate-500">
              Mundial entre amigos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <nav className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-all duration-150",
                  active ? "text-white" : "text-slate-500 hover:bg-white/5 hover:text-white"
                )}
                style={
                  active
                    ? {
                        background: "rgba(214,164,74,0.12)",
                        border: "1px solid rgba(214,164,74,0.22)",
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
        </div>
      </header>

      <div className="fixed top-3 right-4 z-50 sm:hidden" style={{ top: "calc(0.75rem + env(safe-area-inset-top, 0px))" }}>
        <ThemeToggle compact />
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t sm:hidden"
        style={{
          ...NAVBAR_GLASS,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <BottomNavItem key={item.href} item={item} active={pathname === item.href} />
          ))}
        </div>
      </nav>
    </>
  );
}
