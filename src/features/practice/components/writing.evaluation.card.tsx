"use client";

import { useState } from "react";
import { WritingScoreExplanation } from "./writing.score.explanation";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp, Layers, CheckCircle2, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/card";
import type { WritingSubmission } from "../types/writing";

const criteria = [
  [
    "task_achievement",
    "task_achievement_score",
    "Đáp ứng yêu cầu",
    "Task achievement",
  ],
  [
    "grammatical_accuracy",
    "grammatical_accuracy_score",
    "Ngữ pháp",
    "Grammatical accuracy",
  ],
  [
    "lexical_resource",
    "lexical_resource_score",
    "Từ vựng",
    "Lexical resource",
  ],
  [
    "coherence",
    "coherence_score",
    "Mạch lạc & Liên kết",
    "Coherence & cohesion",
  ],
  [
    "naturalness",
    "naturalness_score",
    "Diễn đạt tự nhiên",
    "Naturalness",
  ],
  [
    "register",
    "register_score",
    "Văn phong phù hợp",
    "Register & tone",
  ],
] as const;

function getScoreTone(score: number) {
  if (score >= 80) return { bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300" };
  if (score >= 65) return { bar: "bg-primary", text: "text-primary", badge: "bg-primary/10 text-primary" };
  if (score >= 50) return { bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300" };
  return { bar: "bg-rose-500", text: "text-rose-600 dark:text-rose-400", badge: "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300" };
}

export function WritingEvaluationCard({
  submission,
}: {
  submission: WritingSubmission;
}) {
  const { i18n } = useTranslation();
  const vi = i18n.language === "vi";

  // Track expanded criteria
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => {
    // Default open first criteria if available
    return new Set<string>(["task_achievement"]);
  });

  const toggleCriteria = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <section
      aria-label={vi ? "Sáu tiêu chí Writing" : "Six writing criteria"}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Layers size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary sm:text-lg">
              {vi ? "Nhận xét chi tiết theo 6 tiêu chí" : "Feedback on 6 Writing Criteria"}
            </h2>
            <p className="text-xs text-text-secondary">
              {vi
                ? "Đánh giá đa chiều giúp bạn nhận biết chính xác điểm mạnh và phần cần trau chuốt"
                : "Multi-dimensional diagnostics to help target your writing improvements"}
            </p>
          </div>
        </div>
      </div>

      {submission.grading_standard === "TOEIC" && (
        <p className="rounded-xl border border-border bg-surface-subtle/50 p-3 text-xs text-text-secondary">
          {vi
            ? "Các chỉ số này dùng để phân tích điểm mạnh - điểm yếu cho bài viết, không phải điểm thành phần TOEIC chính thức."
            : "These diagnostics explain your writing strengths and gaps. They are not official TOEIC subscores."}
        </p>
      )}

      {/* 6 Criteria in Compact Interactive Cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {criteria.map(([key, field, labelVi, labelEn]) => {
          const score = submission[field];
          const detail = submission.ai_evaluation?.criteria_feedback?.[key];
          const numeric = typeof score === "number" && Number.isFinite(score);
          const value = numeric ? Math.min(100, Math.max(0, score)) : 0;
          const tone = getScoreTone(value);
          const isExpanded = expandedKeys.has(key);
          const hasDetails = Boolean(detail?.comment || detail?.evidence?.length);

          return (
            <div
              key={key}
              className={`rounded-xl border transition-all duration-200 ${
                isExpanded
                  ? "border-primary/30 bg-surface shadow-sm"
                  : "border-border/80 bg-surface hover:border-border"
              }`}
            >
              {/* Header / Clickable summary */}
              <div
                onClick={() => hasDetails && toggleCriteria(key)}
                className={`p-3.5 ${hasDetails ? "cursor-pointer" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <h3 className="font-semibold text-sm text-text-primary">
                        {vi ? labelVi : labelEn}
                      </h3>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-bold ${
                          numeric
                            ? tone.badge
                            : "bg-surface-subtle text-text-secondary"
                        }`}
                      >
                        {numeric
                          ? `${value}/100`
                          : score === null
                          ? vi
                            ? "N/A"
                            : "N/A"
                          : "—"}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {numeric && (
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-subtle">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${tone.bar}`}
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {hasDetails && (
                    <button
                      type="button"
                      aria-label="Toggle criteria details"
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-subtle"
                    >
                      {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    </button>
                  )}
                </div>

                {/* Short snippet if collapsed */}
                {!isExpanded && detail?.comment && (
                  <p className="mt-2 line-clamp-1 text-xs text-text-secondary">
                    {detail.comment}
                  </p>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && hasDetails && (
                <div className="border-t border-border/60 bg-surface-subtle/30 p-3.5 space-y-2.5 text-xs sm:text-sm">
                  {detail?.comment && (
                    <p className="text-text-secondary leading-relaxed">
                      {detail.comment}
                    </p>
                  )}

                  {detail?.evidence && detail.evidence.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-text-secondary flex items-center gap-1">
                        <Quote size={12} className="text-primary" />
                        {vi ? "Trích dẫn bằng chứng:" : "Evidence quotations:"}
                      </span>
                      {detail.evidence.map((quote, index) => (
                        <blockquote
                          key={index}
                          className="rounded-lg border-l-2 border-primary/60 bg-surface/80 px-2.5 py-1.5 text-xs italic text-text-primary shadow-xs"
                        >
                          “{quote}”
                        </blockquote>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <WritingScoreExplanation submission={submission} />
    </section>
  );
}
