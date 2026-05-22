"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function PaymentPoller() {
  const router = useRouter();
  const [lastCheck, setLastCheck] = useState<string>("");
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const tick = () => {
      setChecking(true);
      router.refresh();
      setLastCheck(
        new Date().toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setTimeout(() => setChecking(false), 1200);
    };

    const interval = setInterval(tick, 10000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{
          background: checking ? "#60a5fa" : "rgba(148,163,184,0.35)",
          boxShadow: checking ? "0 0 6px rgba(96,165,250,0.6)" : "none",
          transition: "all 0.3s ease",
        }}
      />
      <span className="text-[10px]" style={{ color: "rgba(100,116,139,0.55)" }}>
        {lastCheck ? `Última verificación: ${lastCheck}` : "Verificando automáticamente cada 10s"}
      </span>
    </div>
  );
}
