import { cn } from "@/lib/utils";
import type { MatchStatus } from "@prisma/client";

interface StatusBadgeProps {
  status: MatchStatus;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  if (status === "LIVE") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest",
          "bg-red-500/10 text-red-400 border border-red-500/20 animate-live-glow",
          className
        )}
      >
        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
        </span>
        En vivo
      </span>
    );
  }

  if (status === "FINISHED") {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest",
          "text-slate-600 border border-slate-700/30",
          className
        )}
      >
        Final
      </span>
    );
  }

  return null;
}
