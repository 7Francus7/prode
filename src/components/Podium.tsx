import { cn } from "@/lib/utils";
import type { RankingEntry } from "@/types";

function getInitials(name: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface PodiumItemProps {
  entry: RankingEntry;
  position: 1 | 2 | 3;
}

const MEDAL_COLOR = {
  1: "text-amber-400",
  2: "text-slate-400",
  3: "text-amber-700",
} as const;

const AVATAR_SIZE = {
  1: "w-16 h-16 text-base",
  2: "w-12 h-12 text-sm",
  3: "w-12 h-12 text-sm",
} as const;

const AVATAR_BORDER = {
  1: "border-amber-500/50 bg-amber-500/10 text-amber-300",
  2: "border-slate-500/40 bg-slate-500/10 text-slate-300",
  3: "border-amber-700/40 bg-amber-800/10 text-amber-600",
} as const;

const BAR_HEIGHT = {
  1: "h-20",
  2: "h-12",
  3: "h-8",
} as const;

const BAR_BG = {
  1: "bg-amber-500/10 border-amber-500/20",
  2: "bg-slate-400/8 border-slate-500/20",
  3: "bg-amber-700/8 border-amber-700/20",
} as const;

const MEDAL_LABEL = { 1: "1°", 2: "2°", 3: "3°" } as const;

function PodiumItem({ entry, position }: PodiumItemProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 flex-1 min-w-0",
        position === 2 && "order-first",
        position === 3 && "order-last"
      )}
    >
      <span
        className={cn(
          "text-[10px] font-black uppercase tracking-widest",
          MEDAL_COLOR[position]
        )}
      >
        {MEDAL_LABEL[position]}
      </span>

      {entry.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.image}
          alt={entry.name ?? ""}
          className={cn(
            "rounded-full object-cover border-2 border-brand-border flex-shrink-0",
            AVATAR_SIZE[position]
          )}
        />
      ) : (
        <div
          className={cn(
            "rounded-full flex items-center justify-center font-black border-2 flex-shrink-0",
            AVATAR_SIZE[position],
            AVATAR_BORDER[position]
          )}
        >
          {getInitials(entry.name)}
        </div>
      )}

      <div className="text-center w-full px-1 min-w-0">
        <p
          className={cn(
            "font-bold text-white leading-tight truncate",
            position === 1 ? "text-sm" : "text-xs"
          )}
        >
          {entry.name ?? "Anónimo"}
        </p>
        <p className={cn("font-black text-white", position === 1 ? "text-xl" : "text-base")}>
          {entry.totalPoints}
          <span className="text-[10px] font-medium text-slate-600 ml-0.5">pts</span>
        </p>
      </div>

      <div
        className={cn(
          "w-full rounded-t-xl border border-b-0",
          BAR_HEIGHT[position],
          BAR_BG[position]
        )}
      />
    </div>
  );
}

export default function Podium({ entries }: { entries: RankingEntry[] }) {
  const [first, second, third] = entries;

  return (
    <div className="flex items-end gap-2 px-4 pb-0">
      {second && <PodiumItem entry={second} position={2} />}
      {first && <PodiumItem entry={first} position={1} />}
      {third && <PodiumItem entry={third} position={3} />}
    </div>
  );
}
