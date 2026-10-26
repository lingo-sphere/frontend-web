import React from "react";

export interface CefrBadgeProps {
  level: string;
  confidence?: string;
  className?: string;
}

const CEFR_COLORS: Record<string, string> = {
  A1: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  A2: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  B1: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  B2: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  C1: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  C2: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

export function CefrBadge({ level, confidence, className = "" }: CefrBadgeProps) {
  const normLevel = (level || "A1").toUpperCase();
  const colorClass = CEFR_COLORS[normLevel] || "bg-primary/10 text-primary border-primary/20";

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border ${colorClass} ${className}`}
    >
      <span>CEFR {normLevel}</span>
      {confidence && (
        <span className="text-[9px] opacity-75 font-normal">({confidence})</span>
      )}
    </span>
  );
}

export default CefrBadge;

