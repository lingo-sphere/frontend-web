import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Card } from "@/components/card";
import { Button } from "@/components/button";
import type { WeaknessAnalysis } from "@/features/progress/services/progress.service";

export interface GrammarWeaknessesCardProps {
  weaknesses?: WeaknessAnalysis[];
  onNavigate: (path: string) => void;
}

export function GrammarWeaknessesCard({
  weaknesses = [],
  onNavigate,
}: GrammarWeaknessesCardProps) {
  const grammarWeaknesses = weaknesses.filter(
    (w) =>
      w.skill?.toLowerCase() === "grammar"
  );

  if (grammarWeaknesses.length === 0) {
    return null;
  }

  return (
    <Card className="dashboard-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <div>
            <h4 className="text-xs font-bold text-text-primary">
              Điểm yếu Ngữ pháp Trọng tâm (Core Weaknesses)
            </h4>
            <p className="text-[11px] text-text-tertiary">
              Các chủ điểm ngữ pháp có tỷ lệ sai sót cao cần củng cố
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {grammarWeaknesses.slice(0, 4).map((w, idx) => {
          const acc = Math.round(w.accuracy ?? 0);
          const topicName =
            w.grammar_knowledge?.name_vi ||
            w.dimension_name ||
            w.dimension_id ||
            "Chủ điểm ngữ pháp";

          return (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-surface-subtle/50 border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-text-primary">
                    {topicName}
                  </span>
                  {w.grammar_knowledge?.cefr_level && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-primary/10 text-primary border border-primary/20">
                      CEFR {w.grammar_knowledge.cefr_level}
                    </span>
                  )}
                  {w.grammar_knowledge?.category && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-surface-subtle text-text-tertiary border border-border">
                      {w.grammar_knowledge.category}
                    </span>
                  )}
                </div>

                {w.grammar_knowledge?.structure_pattern && (
                  <p className="text-[11px] font-mono text-text-tertiary">
                    Cấu trúc: {w.grammar_knowledge.structure_pattern}
                  </p>
                )}

                <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                  <span>
                    Chính xác:{" "}
                    <strong className="text-rose-500">{acc}%</strong>
                  </span>
                  <span>
                    Tổng lượt:{" "}
                    <strong className="text-text-primary">
                      {w.attempts || 0}
                    </strong>
                  </span>
                </div>
              </div>

              <Button
                onClick={() => onNavigate(`/practice/grammar?topic=${w.dimension_id}`)}
                className="text-xs bg-primary hover:bg-primary/90 text-white shrink-0 self-start sm:self-center"
              >
                Khắc phục ngay <ArrowRight size={13} className="ml-1" />
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

export default GrammarWeaknessesCard;
