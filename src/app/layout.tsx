import type { Metadata, Viewport } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import SwRegister from "@/components/SwRegister";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Prode Mundial 2026",
  description: "Predicciones del Mundial 2026 entre amigos",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Prode Mundial",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f7fb",
  width: "device-width",
  initialScale: 1,
  // Bloquea el pinch-zoom y el doble-tap-zoom para un feel de app nativa
  // y evita el paneo lateral de la página al hacer zoom.
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bodyFont.variable} ${displayFont.variable}`} suppressHydrationWarning>
      <head>
        {/* Chrome/Android installability - Next.js doesn't auto-generate this one */}
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (() => {
                try {
                  const saved = localStorage.getItem("prode-theme");
                  const theme = saved === "dark" ? "dark" : "light";
                  const root = document.documentElement;
                  root.classList.toggle("dark", theme === "dark");
                  root.dataset.theme = theme;
                } catch {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <SessionProvider>{children}</SessionProvider>
        <SwRegister />
      </body>
    </html>
  );
}
