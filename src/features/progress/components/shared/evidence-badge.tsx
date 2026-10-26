import React from "react";

export interface EvidenceBadgeProps {
  level?: string;
  className?: string;
}

export function EvidenceBadge({ level, className = "" }: EvidenceBadgeProps) {
  const norm = (level || "LOW").toUpperCase();
  if (norm === "HIGH") {
    return (
      <span
        className={`text-[9px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 ${className}`}
      >
        Độ tin cậy cao
      </span>
    );
  }
  if (norm === "MEDIUM") {
    return (
      <span
        className={`text-[9px] px-1.5 py-0.5 rounded font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 ${className}`}
      >
        Độ tin cậy vừa
      </span>
    );
  }
  return (
    <span
      className={`text-[9px] px-1.5 py-0.5 rounded font-bold bg-surface-subtle text-text-tertiary border border-border ${className}`}
    >
      Cần thêm dữ liệu
    </span>
  );
}

export default EvidenceBadge;

