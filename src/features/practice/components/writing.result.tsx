"use client";

import { useState } from "react";
import { usePracticeReview } from "../hooks/use.practice.review";
import { PracticeReviewPanel } from "./practice.review.panel";
import { useNavigate } from "@/lib/navigation";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  Layers,
  FileText,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  History,
  Clock,
  Type,
  Award,
} from "lucide-react";
import { Button } from "@/components/button";
import { Card, CardContent } from "@/components/card";
import { Badge } from "@/components/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import type { WritingSubmission, WritingExercise } from "../types/writing";
import { writingScoreLabel } from "../lib/writing-score";
import { WritingCorrections } from "./writing.corrections";
import { WritingEvaluationCard } from "./writing.evaluation.card";

interface WritingResultProps {
  submission: WritingSubmission;
  exercise: WritingExercise;
  onBack: () => void;
  onTryAgain: () => void;
  onNextExercise: () => void;
  onViewHistory: () => void;
}

export function WritingResult({
  submission,
  exercise,
  onBack,
  onTryAgain,
  onNextExercise,
  onViewHistory,
}: WritingResultProps) {
  const reviewState = usePracticeReview(
    "WRITING",
    submission.id,
    Number.isFinite(submission.overall_score)
  );
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const vi = i18n.language.startsWith("vi");

  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedSuggested, setCopiedSuggested] = useState(false);

  const evaluation = submission.ai_evaluation;
  const toeic = submission.grading_standard === "TOEIC";
  const errors = evaluation?.errors || [];

  // Default tab: if errors exist, default to corrections, otherwise writing comparison
  const defaultTab = errors.length > 0 ? "corrections" : "comparison";

  const handleCopy = async (text: string, type: "original" | "suggested") => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "original") {
        setCopiedOriginal(true);
        setTimeout(() => setCopiedOriginal(false), 2000);
      } else {
        setCopiedSuggested(true);
        setTimeout(() => setCopiedSuggested(false), 2000);
      }
    } catch {
      // Fallback if clipboard API is restricted
    }
  };

  const groups = [
    {
      title: vi ? "Điểm mạnh" : "Strengths",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      color: "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20",
      items: evaluation?.strengths || [],
    },
    {
      title: vi ? "Cần cải thiện" : "Areas to improve",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
      color: "border-amber-200 dark:border-amber-900/60 bg-amber-50/30 dark:bg-amber-950/20",
      items: evaluation?.weaknesses || [],
    },
    {
      title: vi ? "Việc nên làm tiếp" : "Next steps",
      icon: <Sparkles className="h-4 w-4 text-primary" />,
      color: "border-primary/20 bg-primary/5",
      items: evaluation?.improvement_tips || [],
    },
  ];

  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition"
        >
          <ArrowLeft size={16} />
          {vi ? "Quay lại danh sách" : "Back to exercises"}
        </button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewHistory}
            className="flex items-center gap-1.5 text-xs"
          >
            <History size={14} />
            {vi ? "Lịch sử làm bài" : "History"}
          </Button>
        </div>
      </div>

      {/* Teacher Review Status Panel */}
      <PracticeReviewPanel state={reviewState} />

      {/* Hero Score & Overview Card (Promax) */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Score Badge & Classification */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex h-22 w-22 sm:h-24 sm:w-24 shrink-0 flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-surface-subtle p-2 border border-primary/20 shadow-xs">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
                {writingScoreLabel(reviewState.query.data || submission)}
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                {toeic ? "Band Score" : "Overall"}
              </span>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {toeic
                    ? vi
                      ? "Nhiệm vụ TOEIC Writing"
                      : "Simulated TOEIC Task"
                    : vi
                    ? "Giao tiếp thực tế"
                    : "Practical Communication"}
                </span>
                {exercise.cefr_level && (
                  <Badge variant="secondary" className="text-[11px] font-medium">
                    CEFR {exercise.cefr_level}
                  </Badge>
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-bold text-text-primary truncate">
                {vi && exercise.title_vi ? exercise.title_vi : exercise.title}
              </h1>

              {vi && exercise.title_vi && (
                <p className="text-xs text-text-secondary truncate">{exercise.title}</p>
              )}

              {/* Quick Metrics Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5">
                  <Type size={12} className="text-primary" />
                  <strong className="text-text-primary">{submission.word_count}</strong> {vi ? "từ" : "words"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5">
                  <Clock size={12} className="text-primary" />
                  <strong className="text-text-primary">
                    {Math.round((submission.writing_time_seconds || 0) / 60)}
                  </strong>{" "}
                  {vi ? "phút" : "mins"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5">
                  <Sparkles size={12} className="text-primary" />
                  <strong className="text-text-primary">{errors.length}</strong> {vi ? "gợi ý sửa" : "corrections"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5 sm:self-center">
            <Button
              variant="outline"
              onClick={onTryAgain}
              className="flex-1 sm:flex-initial flex items-center gap-1.5"
            >
              <RotateCcw size={15} />
              {vi ? "Luyện lại" : "Try again"}
            </Button>
            <Button
              onClick={onNextExercise}
              className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-sm"
            >
              {vi ? "Bài tiếp theo" : "Next exercise"}
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* AI Overall Feedback Quote */}
        {(evaluation?.score_reason || evaluation?.overall_feedback) && (
          <div className="mt-4 rounded-xl border border-border/80 bg-surface-subtle/40 p-3.5 text-xs sm:text-sm text-text-secondary">
            <p className="whitespace-pre-wrap leading-relaxed">
              <span className="font-semibold text-text-primary mr-1">
                💬 {vi ? "Nhận xét tổng thể:" : "Overall feedback:"}
              </span>
              {evaluation?.score_reason || evaluation?.overall_feedback}
            </p>
          </div>
        )}

        {/* TOEIC Rubric task details banner (collapsible) */}
        {toeic && !!evaluation?.rubric_snapshot?.bands.length && (
          <details className="mt-3 text-xs text-text-secondary">
            <summary className="cursor-pointer font-medium hover:text-text-primary transition py-1">
              {vi ? "Xem mô tả thang điểm Rubric TOEIC nhiệm vụ này" : "View TOEIC task rubric band descriptions"}
            </summary>
            <ul className="mt-2 space-y-1.5 rounded-lg border border-border/70 bg-surface-subtle/30 p-3">
              {evaluation.rubric_snapshot.bands.map((band, index) => (
                <li
                  key={index}
                  className={`rounded-md p-1.5 ${
                    index === submission.raw_score
                      ? "bg-primary/10 font-medium text-primary"
                      : ""
                  }`}
                >
                  <span className="font-bold mr-1.5">Band {index}:</span>
                  {band}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      {/* SRS Spaced Repetition Flashcard Sync Banner */}
      {["writing-v2", "writing-v3"].includes(submission.grading_version || "") && (
        <section
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-primary/25 bg-primary/5 p-3.5 text-xs sm:text-sm"
          aria-label={vi ? "Theo dõi ôn Writing" : "Writing review tracking"}
        >
          <div className="space-y-0.5">
            <p className="font-semibold text-text-primary flex items-center gap-1.5">
              <Award size={15} className="text-primary shrink-0" />
              {vi ? "Đồng bộ lỗi vào Sổ tay ôn tập SRS" : "Spaced Repetition Notebook Synced"}
            </p>
            <p className="text-text-secondary text-xs">
              {submission.writing_srs_version !== 1
                ? vi
                  ? "Điểm bài đã lưu. Lỗi và bằng chứng sẵn sàng đồng bộ vào sổ tay."
                  : "Score saved. Target mistakes are queued for your notebook."
                : submission.writing_srs_summary?.some((row) => row.credited)
                ? vi
                  ? "Đã ghi nhận vận dụng đúng trong bài viết khác. Lịch ôn đã cập nhật."
                  : "Independent application recorded. Spaced schedule updated."
                : submission.writing_srs_summary?.some((row) => row.outcome === "ERROR")
                ? vi
                  ? "Đã ghi nhận các lỗi trong bài này vào sổ tay để nhắc ôn tập ngắt quãng."
                  : "Recorded error targets in this response for your spaced review."
                : vi
                ? "Lượt này chưa phát hiện thêm lỗi cần theo dõi mới."
                : "No new error targets recorded for this response."}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/practice/mistakes?section=WRITING")}
            className="shrink-0 text-xs"
          >
            {vi ? "Mở Sổ tay Writing" : "Open Notebook"}
          </Button>
        </section>
      )}

      {/* Main Tabbed Interactive Experience */}
      <Tabs defaultValue={defaultTab} className="w-full space-y-4">
        {/* Custom Tab Triggers */}
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-11 w-full sm:w-auto p-1 bg-surface border border-border rounded-xl">
            <TabsTrigger
              value="corrections"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <Sparkles size={15} />
              <span>{vi ? "Sửa lỗi & Gợi ý" : "Corrections & Polish"}</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[11px] ${
                  errors.length > 0
                    ? "bg-primary-foreground/20 text-inherit font-bold"
                    : "bg-surface-subtle text-text-secondary"
                }`}
              >
                {errors.length}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="comparison"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <BookOpen size={15} />
              <span>{vi ? "So sánh bài viết" : "Writing & Revision"}</span>
            </TabsTrigger>

            <TabsTrigger
              value="criteria"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <Layers size={15} />
              <span>{vi ? "6 Tiêu chí & Lời khuyên" : "Rubric & Insights"}</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Corrections & Feedback */}
        <TabsContent value="corrections" className="space-y-4 outline-none">
          {errors.length > 0 ? (
            <WritingCorrections
              submissionId={submission.id}
              errors={errors}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-8 text-center">
              <CheckCircle2 size={42} className="text-emerald-500 mb-3" />
              <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                {vi ? "Tuyệt vời! Không phát hiện lỗi sai đáng kể nào." : "Excellent! No critical errors found."}
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary max-w-md">
                {vi
                  ? "Bài viết của bạn diễn đạt rất tự nhiên và chính xác. Hãy chuyển qua tab 'So sánh bài viết' để xem thêm gợi ý nâng cấp diễn đạt phong phú hơn."
                  : "Your response is natural and accurate. Switch to 'Writing & Revision' to explore AI-suggested advanced phrasing."}
              </p>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Side-by-Side Comparison */}
        <TabsContent value="comparison" className="space-y-4 outline-none">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Left Column: Your Writing */}
            <div className="flex flex-col rounded-2xl border border-border bg-surface overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-border/80 bg-surface-subtle/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-text-primary">
                    {vi ? "Bài viết của bạn" : "Your Original Writing"}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-text-secondary">
                    {submission.word_count} {vi ? "từ" : "words"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(submission.content, "original")}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-secondary hover:bg-surface hover:text-text-primary transition"
                  >
                    {copiedOriginal ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span className="text-emerald-600 font-medium">
                          {vi ? "Đã chép" : "Copied"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>{vi ? "Chép" : "Copy"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex-1 p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans text-text-primary">
                {submission.content || (
                  <span className="italic text-text-secondary">
                    {vi ? "Không có nội dung bài viết." : "No submission content."}
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Suggested Revision */}
            <div className="flex flex-col rounded-2xl border border-primary/30 bg-surface overflow-hidden shadow-xs">
              <div className="flex items-center justify-between border-b border-primary/20 bg-primary/5 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-text-primary">
                    {vi ? "Bản hoàn thiện tham khảo" : "Suggested AI Polish"}
                  </h3>
                </div>
                {evaluation?.suggested_version && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(evaluation.suggested_version || "", "suggested")
                    }
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-text-secondary hover:bg-surface hover:text-text-primary transition"
                  >
                    {copiedSuggested ? (
                      <>
                        <Check size={13} className="text-emerald-500" />
                        <span className="text-emerald-600 font-medium">
                          {vi ? "Đã chép" : "Copied"}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>{vi ? "Chép" : "Copy"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex-1 p-4 text-sm leading-relaxed whitespace-pre-wrap font-sans text-text-primary bg-primary/2">
                {evaluation?.suggested_version ? (
                  evaluation.suggested_version
                ) : (
                  <span className="italic text-text-secondary">
                    {vi
                      ? "Chưa có bản sửa mẫu cho bài viết này."
                      : "Suggested revision unavailable."}
                  </span>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Six Criteria & Next Steps */}
        <TabsContent value="criteria" className="space-y-6 outline-none">
          <div className="grid gap-5 lg:grid-cols-12">
            {/* Left 7 cols: 6 Writing Criteria Diagnostics */}
            <div className="lg:col-span-7">
              <WritingEvaluationCard submission={submission} />
            </div>

            {/* Right 5 cols: Strengths, Weaknesses, Next steps */}
            <div className="lg:col-span-5 space-y-3.5">
              <h2 className="text-base font-bold text-text-primary">
                {vi ? "Định hướng & Lời khuyên" : "Actionable Insights"}
              </h2>

              {groups.map(({ title, icon, color, items }) => (
                <div
                  key={title}
                  className={`rounded-xl border p-4 shadow-xs ${color}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {icon}
                    <h3 className="text-sm font-bold text-text-primary">
                      {title}
                    </h3>
                  </div>

                  {items.length > 0 ? (
                    <ul className="space-y-1.5 pl-5 list-disc text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {items.map((item, idx) => (
                        <li key={idx} className="marker:text-text-secondary">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-text-secondary italic">
                      {vi ? "Không có ghi chú thêm." : "No additional points."}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Bottom Sticky-like Action Footer */}
      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
        <Button variant="outline" size="sm" onClick={onViewHistory}>
          {vi ? "Lịch sử làm bài" : "History"}
        </Button>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={onTryAgain} className="flex items-center gap-1.5">
            <RotateCcw size={14} />
            {vi ? "Luyện lại bài này" : "Practice again"}
          </Button>
          <Button
            size="sm"
            onClick={onNextExercise}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-sm"
          >
            {vi ? "Làm bài tiếp theo" : "Next exercise"}
            <ChevronRight size={15} />
          </Button>
        </div>
      </section>
    </main>
  );
}
