import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = new Set(["/login", "/register"]);

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;
  const isAdmin = req.auth?.user?.isAdmin ?? false;

  // ── Admin pages ───────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    if (!isAdmin) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  // ── Public auth pages ─────────────────────────────────────────
  if (PUBLIC_ROUTES.has(pathname)) {
    if (isLoggedIn) return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  // ── /pending — logged-in only (isPaid checked server-side) ────
  if (pathname === "/pending") {
    if (!isLoggedIn) return NextResponse.redirect(new URL("/login", req.url));
    return NextResponse.next();
  }

  // ── Everything else — must be logged in ──────────────────────
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|apple-icon\\.png|manifest\\.json|icons).*)",
  ],
};
