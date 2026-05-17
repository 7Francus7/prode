"use client";

import { cn } from "@/lib/utils";
import type { PredictionResult } from "@prisma/client";

interface PredictionButtonProps {
  label: string;
  value: PredictionResult;
  selected: boolean;
  correct?: boolean;
  wrong?: boolean;
  disabled: boolean;
  loading?: boolean;
  onClick: () => void;
}

export default function PredictionButton({
  label,
  value,
  selected,
  correct,
  wrong,
  disabled,
  loading,
  onClick,
}: PredictionButtonProps) {
  void value;

  const isSelectedCorrect = selected && correct;
  const isSelectedWrong = selected && wrong;
  const isCorrectUnselected = !selected && correct;
  const isPending = selected && !correct && !wrong;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "relative flex-1 flex items-center justify-center",
        "min-h-[44px] px-2 rounded-xl text-[11px] font-bold uppercase tracking-wider",
        "border transition-all duration-150 select-none",
        "focus-visible:outline-none",
        "active:scale-[0.96]",

        // Default
        !selected && !isCorrectUnselected &&
          "bg-transparent border-brand-border text-slate-600",

        // Hover (non-touch)
        !disabled && !selected && !isCorrectUnselected &&
          "[@media(hover:hover)]:hover:border-slate-600 [@media(hover:hover)]:hover:text-slate-300",

        // Selected pending
        isPending &&
          "bg-blue-600/15 border-blue-500/40 text-blue-300",

        // Selected correct
        isSelectedCorrect &&
          "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 animate-correct-pulse",

        // Selected wrong
        isSelectedWrong &&
          "bg-transparent border-red-900/25 text-red-800",

        // Correct unselected (show result faintly)
        isCorrectUnselected &&
          "bg-emerald-900/10 border-emerald-900/30 text-emerald-800",

        // Disabled unselected
        disabled && !selected && !isCorrectUnselected &&
          "border-brand-border/40 text-slate-700 cursor-not-allowed",

        loading && "opacity-60 cursor-wait",
      )}
    >
      {loading ? (
        <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <span className="flex items-center gap-1 pointer-events-none leading-none">
          {isSelectedCorrect && (
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 6l3 3 5-5" />
            </svg>
          )}
          {isSelectedWrong && (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M2 2l8 8M10 2l-8 8" />
            </svg>
          )}
          <span className="truncate">{label}</span>
        </span>
      )}
    </button>
  );
}
