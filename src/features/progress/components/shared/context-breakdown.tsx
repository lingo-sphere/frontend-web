import React from "react";
import { Card } from "@/components/card";

export interface ContextBreakdownItem {
  context_name?: string;
  accuracy: number;
  total?: number;
  correct?: number;
  cefr_level?: string;
}

export interface ContextBreakdownProps {
  byContext?: Record<string, ContextBreakdownItem>;
  title?: string;
  onSelectContext?: (contextId: string) => void;
}

export function ContextBreakdown({
  byContext,
  title = "Hiệu quả Ngữ pháp theo Ngữ cảnh Thực tế (Contextual Fluency)",
  onSelectContext,
}: ContextBreakdownProps) {
  if (!byContext || Object.keys(byContext).length === 0) {
    return null;
  }

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return "bg-emerald-500 text-emerald-600";
    if (acc >= 60) return "bg-amber-500 text-amber-600";
    return "bg-rose-500 text-rose-600";
  };

  return (
    <Card className="dashboard-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-text-primary">{title}</h4>
          <p className="text-[11px] text-text-tertiary">
            Mức độ áp dụng ngữ pháp chính xác khi giao tiếp theo từng tình huống
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {Object.entries(byContext).map(([ctxKey, ctxVal]) => {
          const acc = Math.round(ctxVal.accuracy || 0);
          const color = getAccuracyColor(acc);

          return (
            <div
              key={ctxKey}
              onClick={() => onSelectContext?.(ctxKey)}
              className={`p-3 rounded-xl bg-surface-subtle/50 border border-border flex flex-col justify-between transition-colors ${
                onSelectContext ? "cursor-pointer hover:border-primary/50" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-text-primary">
                  {ctxVal.context_name || ctxKey}
                </span>
                {ctxVal.cefr_level && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-primary/10 text-primary border border-primary/20">
                    {ctxVal.cefr_level}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-text-tertiary">Độ chính xác</span>
                  <span className="font-bold text-text-primary">{acc}%</span>
                </div>
                <div className="w-full bg-surface-subtle h-1.5 rounded-full overflow-hidden border border-border/40">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      color.split(" ")[0]
                    }`}
                    style={{ width: `${Math.min(acc, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default ContextBreakdown;

