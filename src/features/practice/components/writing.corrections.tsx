"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/card";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { speakingGrammarService } from "../services/speaking-grammar.service";
import type { GrammarError } from "../types/writing";
import type { SpeakingWordTarget } from "../types/speaking-vocabulary";
import { SpeakingGrammarActions } from "./speaking.grammar.actions";
import { SpeakingVocabularySaving } from "./speaking.vocabulary.saving";

const categoryStyles: Record<
  string,
  { badge: string; dot: string; labelVi: string; labelEn: string }
> = {
  GRAMMAR: {
    badge: "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300",
    dot: "bg-purple-500",
    labelVi: "Ngữ pháp",
    labelEn: "Grammar",
  },
  VOCABULARY: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300",
    dot: "bg-emerald-500",
    labelVi: "Từ vựng",
    labelEn: "Vocabulary",
  },
  SPELLING: {
    badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300",
    dot: "bg-amber-500",
    labelVi: "Chính tả",
    labelEn: "Spelling",
  },
  PUNCTUATION: {
    badge: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300",
    dot: "bg-slate-500",
    labelVi: "Dấu câu",
    labelEn: "Punctuation",
  },
  FORMAT: {
    badge: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/60 dark:bg-orange-950/40 dark:text-orange-300",
    dot: "bg-orange-500",
    labelVi: "Định dạng",
    labelEn: "Format",
  },
  STYLE: {
    badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300",
    dot: "bg-blue-500",
    labelVi: "Gợi ý diễn đạt",
    labelEn: "Style suggestion",
  },
};

/** Shared Speaking learning actions, backed by canonical Writing evidence. */
export function WritingCorrections({
  submissionId,
  errors,
  compact = false,
}: {
  submissionId: string;
  errors: Pick<
    GrammarError,
    "type" | "original" | "correction" | "explanation"
  >[];
  compact?: boolean;
}) {
  const { i18n } = useTranslation();
  const vi = i18n.language.startsWith("vi");
  const userId = useAuthStore((state) => state.user?.user_id);

  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(() => {
    // Default: expand all if few errors (<= 4), otherwise expand first 2
    const initial = new Set<number>();
    const count = errors.length <= 4 ? errors.length : 2;
    for (let i = 0; i < count; i++) initial.add(i);
    return initial;
  });

  const source = useQuery({
    queryKey: ["writing-grammar", userId, submissionId],
    queryFn: () => speakingGrammarService.source(submissionId, "WRITING"),
    enabled: Boolean(userId && /^[a-f\d]{24}$/i.test(submissionId)),
    staleTime: 30_000,
    retry: 1,
  });

  const targets = useMemo(
    () =>
      (source.data?.vocabulary_targets || []).map((row) => ({
        ...row,
        target: {
          source_kind: "WRITING",
          attempt_id: submissionId,
          turn_number: row.index,
          word: row.word,
        } as SpeakingWordTarget,
      })),
    [source.data?.vocabulary_targets, submissionId]
  );

  // Group and count categories
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: errors.length };
    for (const err of errors) {
      counts[err.type] = (counts[err.type] || 0) + 1;
    }
    return counts;
  }, [errors]);

  const filteredErrorsWithIndex = useMemo(() => {
    return errors
      .map((error, originalIndex) => ({ error, originalIndex }))
      .filter(({ error }) => {
        if (activeCategory === "ALL") return true;
        return error.type === activeCategory;
      });
  }, [errors, activeCategory]);

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<number>();
    filteredErrorsWithIndex.forEach(({ originalIndex }) => all.add(originalIndex));
    setExpandedIndices(all);
  };

  const collapseAll = () => {
    setExpandedIndices(new Set());
  };

  const availableCategories = useMemo(() => {
    const cats = Object.keys(categoryStyles).filter(
      (cat) => (categoryCounts[cat] || 0) > 0
    );
    return cats;
  }, [categoryCounts]);

  // If in compact mode (e.g. SRS sheet), render lightweight view
  if (compact) {
    return (
      <SpeakingVocabularySaving targets={targets.map((row) => row.target)}>
        {({ renderSaveButton }) => (
          <div className="space-y-3">
            {errors.map((error, index) => {
              const vocabulary = targets.find(
                (row) =>
                  row.original === error.original &&
                  row.corrected === error.correction
              );
              const style = categoryStyles[error.type] || categoryStyles.STYLE;
              return (
                <div
                  key={`${index}:${error.original}`}
                  className="rounded-xl border border-border bg-surface p-3 text-sm shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${style.badge}`}
                    >
                      {vi ? style.labelVi : style.labelEn}
                    </span>
                    <div className="flex items-center gap-1.5 font-medium">
                      <span className="line-through text-red-600 bg-red-50 dark:bg-red-950/40 px-1.5 py-0.5 rounded">
                        {error.original}
                      </span>
                      <ArrowRight size={13} className="text-text-secondary" />
                      <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded font-semibold">
                        {error.correction}
                      </span>
                    </div>
                  </div>
                  {error.explanation && (
                    <p className="text-xs text-text-secondary mb-2">{error.explanation}</p>
                  )}
                  {error.type === "GRAMMAR" && (
                    <SpeakingGrammarActions
                      kind="WRITING"
                      attemptId={submissionId}
                      issue={{
                        turn_number: 0,
                        category: "GRAMMAR",
                        original: error.original,
                        corrected: error.correction,
                      }}
                    />
                  )}
                  {["SPELLING", "VOCABULARY"].includes(error.type) && (
                    <div className="flex items-center gap-2 text-xs">
                      {vocabulary ? (
                        <>
                          {renderSaveButton(vocabulary.target)}
                          <span>
                            {vi
                              ? `Lưu “${vocabulary.word}” vào Sổ tay.`
                              : `Save “${vocabulary.word}” to notebook.`}
                          </span>
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SpeakingVocabularySaving>
    );
  }

  // Full "Promax" Interactive Inspection View
  return (
    <SpeakingVocabularySaving targets={targets.map((row) => row.target)}>
      {({ renderSaveButton }) => (
        <section className="space-y-4">
          {/* Header & Category Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary sm:text-lg">
                  {vi ? "Chi tiết sửa lỗi & gợi ý cải thiện" : "Corrections & Polish Suggestions"}
                </h2>
                <p className="text-xs text-text-secondary">
                  {vi
                    ? `Phát hiện ${errors.length} điểm cần lưu ý để bài viết chuẩn xác hơn`
                    : `Found ${errors.length} points to refine your writing`}
                </p>
              </div>
            </div>

            {/* Expand / Collapse buttons */}
            {filteredErrorsWithIndex.length > 1 && (
              <div className="flex items-center gap-2 self-end text-xs text-text-secondary">
                <button
                  type="button"
                  onClick={expandAll}
                  className="rounded-md px-2 py-1 transition hover:bg-surface-subtle hover:text-text-primary"
                >
                  {vi ? "Mở rộng tất cả" : "Expand all"}
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="rounded-md px-2 py-1 transition hover:bg-surface-subtle hover:text-text-primary"
                >
                  {vi ? "Thu gọn tất cả" : "Collapse all"}
                </button>
              </div>
            )}
          </div>

          {/* Filter Pills */}
          {availableCategories.length > 1 && (
            <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
              <button
                type="button"
                onClick={() => setActiveCategory("ALL")}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeCategory === "ALL"
                    ? "bg-primary text-white shadow-sm"
                    : "bg-surface-subtle text-text-secondary hover:bg-surface hover:text-text-primary"
                }`}
              >
                <span>{vi ? "Tất cả" : "All"}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                    activeCategory === "ALL"
                      ? "bg-white/20 text-white"
                      : "bg-border text-text-secondary"
                  }`}
                >
                  {categoryCounts.ALL}
                </span>
              </button>

              {availableCategories.map((cat) => {
                const style = categoryStyles[cat];
                const count = categoryCounts[cat] || 0;
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                      active
                        ? "bg-text-primary text-white dark:bg-white dark:text-zinc-900 shadow-sm"
                        : "bg-surface-subtle text-text-secondary hover:bg-surface hover:text-text-primary"
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    <span>{vi ? style.labelVi : style.labelEn}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        active
                          ? "bg-white/25 text-white dark:bg-zinc-800 dark:text-white"
                          : "bg-border text-text-secondary"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* List of Corrections */}
          <div className="space-y-2.5">
            {filteredErrorsWithIndex.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-8 text-center">
                <CheckCircle2 size={36} className="text-emerald-500 mb-2" />
                <p className="text-sm font-semibold text-text-primary">
                  {vi ? "Không có lỗi trong phân loại này" : "No errors in this category"}
                </p>
                <p className="text-xs text-text-secondary mt-1">
                  {vi
                    ? "Hãy chọn phân loại khác hoặc xem tất cả."
                    : "Select another category or view all."}
                </p>
              </div>
            ) : (
              filteredErrorsWithIndex.map(({ error, originalIndex }) => {
                const isExpanded = expandedIndices.has(originalIndex);
                const style = categoryStyles[error.type] || categoryStyles.STYLE;
                const vocabulary = targets.find(
                  (row) =>
                    row.original === error.original &&
                    row.corrected === error.correction
                );

                return (
                  <div
                    key={`${originalIndex}:${error.original}`}
                    className={`group relative overflow-hidden rounded-xl border transition-all duration-200 ${
                      isExpanded
                        ? "border-primary/30 bg-surface shadow-sm"
                        : "border-border/80 bg-surface hover:border-border"
                    }`}
                  >
                    {/* Compact Clickable Summary Row */}
                    <div
                      onClick={() => toggleExpand(originalIndex)}
                      className="flex cursor-pointer items-start justify-between gap-3 p-3.5 sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                        <span
                          className={`inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${style.badge}`}
                        >
                          {vi ? style.labelVi : style.labelEn}
                        </span>

                        {/* Inline diff */}
                        <div className="flex flex-wrap items-center gap-1.5 text-sm">
                          <span className="line-through decoration-red-400 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded font-medium text-xs sm:text-sm">
                            {error.original}
                          </span>
                          <ArrowRight
                            size={14}
                            className="text-text-secondary shrink-0"
                          />
                          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-semibold text-xs sm:text-sm">
                            {error.correction}
                          </span>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          type="button"
                          aria-label={isExpanded ? "Collapse" : "Expand"}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-text-secondary hover:bg-surface-subtle"
                        >
                          {isExpanded ? (
                            <ChevronUp size={16} />
                          ) : (
                            <ChevronDown size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Explanation & Actions Section */}
                    {isExpanded && (
                      <div className="border-t border-border/60 bg-surface-subtle/30 px-4 py-3 text-sm space-y-3">
                        {error.explanation && (
                          <div className="flex items-start gap-2.5 text-text-secondary">
                            <span className="mt-0.5 text-primary text-xs font-bold">💡</span>
                            <p className="text-xs sm:text-sm leading-relaxed">
                              {error.explanation}
                            </p>
                          </div>
                        )}

                        {/* Integrated Learning & Memory SRS Action */}
                        <div className="pt-1">
                          {error.type === "GRAMMAR" && (
                            <div className="flex flex-wrap items-center gap-2">
                              <SpeakingGrammarActions
                                kind="WRITING"
                                attemptId={submissionId}
                                issue={{
                                  turn_number: 0,
                                  category: "GRAMMAR",
                                  original: error.original,
                                  corrected: error.correction,
                                }}
                              />
                            </div>
                          )}

                          {["SPELLING", "VOCABULARY"].includes(error.type) && (
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {vocabulary ? (
                                <div className="flex items-center gap-2">
                                  {renderSaveButton(vocabulary.target)}
                                  <span className="text-text-secondary">
                                    {vi
                                      ? `Lưu “${vocabulary.word}” vào Sổ tay để học SRS.`
                                      : `Save “${vocabulary.word}” for SRS spaced repetition.`}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xs text-text-secondary">
                                  {!userId
                                    ? vi
                                      ? "Đăng nhập để lưu từ vựng vào sổ tay."
                                      : "Sign in to save vocabulary to your notebook."
                                    : source.isPending
                                    ? vi
                                      ? "Đang đối chiếu từ vựng…"
                                      : "Matching vocabulary…"
                                    : vi
                                    ? "Gợi ý từ vựng đã được tối ưu cho bài viết."
                                    : "Vocabulary recommendation ready."}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {source.isError && (
            <div
              role="alert"
              className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/20"
            >
              <span>
                {vi
                  ? "Chưa tải được liên kết luyện tập Sổ tay."
                  : "Could not load notebook practice links."}
              </span>
              <button
                type="button"
                className="font-medium underline hover:text-red-700"
                onClick={() => void source.refetch()}
              >
                {vi ? "Thử lại" : "Retry"}
              </button>
            </div>
          )}
        </section>
      )}
    </SpeakingVocabularySaving>
  );
}
