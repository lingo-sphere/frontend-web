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
import { WritingTaskAssessmentView } from './writing.task.assessment';

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
      <WritingTaskAssessmentView assessment={reviewState.query.data?.review?.teacher_grading?.task_assessment || evaluation?.task_assessment} policy={reviewState.query.data?.review?.teacher_grading?.score_policy || evaluation?.score_policy} source={reviewState.query.data?.review?.teacher_grading ? (vi ? 'Đánh giá giáo viên hiện tại' : 'Current teacher assessment') : (vi ? 'Đánh giá AI' : 'AI assessment')} />

      {/* Hero Score & Overview Card (Lingo-sphere Design System) */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-surface to-surface-subtle/40 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Circular SVG Gauge & Exercise Metadata */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* SVG Circular Score Ring */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 96 96">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-border/70 fill-none"
                  strokeWidth="7"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  className="stroke-primary fill-none transition-all duration-1000 ease-out"
                  strokeWidth="7"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={
                    2 * Math.PI * 40 * (1 - Math.min(100, Math.max(15, (submission.overall_score || (submission.raw_score ? submission.raw_score * 12.5 : 80)))) / 100)
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
                  {writingScoreLabel(reviewState.query.data || submission)}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                  {toeic ? "Band" : "Overall"}
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  <Award size={13} />
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
                {/* Dynamic Motivational Badge */}
                {(() => {
                  const score = submission.overall_score || (submission.raw_score ? submission.raw_score * 12.5 : 75);
                  if (score >= 80) {
                    return (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        {vi ? "Xuất sắc" : "Excellent"}
                      </span>
                    );
                  }
                  if (score >= 60) {
                    return (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                        <Sparkles size={12} className="text-blue-500" />
                        {vi ? "Làm tốt lắm" : "Good Job"}
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
                      <AlertTriangle size={12} className="text-amber-500" />
                      {vi ? "Cần rèn luyện thêm" : "Keep Practicing"}
                    </span>
                  );
                })()}
              </div>

              <h1 className="text-lg sm:text-xl font-extrabold text-text-primary">
                {vi && exercise.title_vi ? exercise.title_vi : exercise.title}
              </h1>

              {vi && exercise.title_vi && (
                <p className="text-xs text-text-secondary">{exercise.title}</p>
              )}

              {/* Motivational Quote */}
              <p className="text-xs italic text-text-secondary">
                {(() => {
                  const score = submission.overall_score || (submission.raw_score ? submission.raw_score * 12.5 : 75);
                  if (score >= 80) {
                    return vi
                      ? "“Văn phong tự nhiên, bố cục mạch lạc và cấu trúc ngữ pháp rất chuẩn xác!”"
                      : "“Natural phrasing, coherent structure, and highly accurate grammar!”";
                  }
                  if (score >= 60) {
                    return vi
                      ? "“Ý tưởng truyền đạt rõ ràng. Chú ý thêm một vài chi tiết để nâng band điểm!”"
                      : "“Clear message and expression. Polish a few details to boost your band score!”";
                  }
                  return vi
                    ? "“Hãy xem kỹ phần sửa lỗi và bản hoàn thiện tham khảo bên dưới để cải thiện nhé!”"
                    : "“Review the corrections and AI polished version below to improve further!”";
                })()}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5 sm:self-center shrink-0">
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

        {/* 4 Productive Quick Stat Cards */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border/80 bg-surface/90 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium">{vi ? "Số từ bài viết" : "Word Count"}</span>
              <Type size={15} className="text-primary" />
            </div>
            <p className="mt-1 text-xl font-bold text-text-primary">
              {submission.word_count || 0}
              <span className="ml-1 text-xs font-normal text-text-secondary">
                {vi ? "từ" : "words"}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-surface/90 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium">{vi ? "Thời gian viết" : "Writing Time"}</span>
              <Clock size={15} className="text-blue-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-text-primary">
              {Math.round((submission.writing_time_seconds || 0) / 60)}
              <span className="ml-1 text-xs font-normal text-text-secondary">
                {vi ? "phút" : "mins"}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-surface/90 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium">{vi ? "Góp ý sửa lỗi" : "Corrections"}</span>
              <Sparkles size={15} className="text-amber-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-text-primary">
              {errors.length}
              <span className="ml-1 text-xs font-normal text-text-secondary">
                {vi ? "vị trí" : "points"}
              </span>
            </p>
          </div>

          <div className="rounded-xl border border-border/80 bg-surface/90 p-3 shadow-2xs">
            <div className="flex items-center justify-between text-text-secondary">
              <span className="text-xs font-medium">{vi ? "Đánh giá đạt" : "Rating Level"}</span>
              <Award size={15} className="text-emerald-500" />
            </div>
            <p className="mt-1 text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {toeic ? `Band ${submission.raw_score ?? writingScoreLabel(reviewState.query.data || submission)}` : writingScoreLabel(reviewState.query.data || submission)}
            </p>
          </div>
        </div>

        {/* AI Overall Feedback Quote */}
        {(evaluation?.score_reason || evaluation?.overall_feedback) && (
          <div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm text-text-secondary">
            <p className="whitespace-pre-wrap leading-relaxed">
              <span className="font-bold text-primary mr-1">
                💬 {vi ? "Nhận xét tổng thể từ AI:" : "AI Overall Feedback:"}
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
      {["writing-v2", "writing-v3", "writing-v4"].includes(submission.grading_version || "") && (
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
