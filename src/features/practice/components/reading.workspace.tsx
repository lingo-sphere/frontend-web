/**
 * @file reading.workspace.tsx
 * @description Màn hình không gian luyện tập Reading Practice với Giao diện Split-Screen 2 bên đồng bộ
 */

"use client";

import { PracticeKeyboard, PracticeOptionKey } from './practice.keyboard'


import { useState, useMemo } from "react";
import { useReadingSession } from "../hooks/use.reading.session";
import { DictionaryModal } from "@/features/vocabulary/components/dictionary.modal";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { toast } from "@/store/toast.store";
import { ReadingMedia } from "./reading.media";
import { PracticeExitConfirmModal } from "./practice.exit-confirm.modal";
import { Icon } from "@/components/icon.map";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Layers,
  Award,
  Clock,
  ArrowLeft,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  BookText,
  BarChart2,
  Folder,
} from "lucide-react";
import type {
  ReadingPassage,
  ReadingSession,
  ReadingQuestion,
  ReadingType,
  ReadingAttemptResultEnhanced,
  AIReadingExplanation,
  SkillBreakdownItem,
  WrongAnswerItem,
} from "../types/reading";

interface ReadingWorkspaceProps {
  passage: ReadingPassage;
  timeLimitSeconds: number;
  session?: ReadingSession;
  initialResult?: ReadingAttemptResultEnhanced;
  onBack: () => void;
  onComplete?: () => void;
}

export function ReadingWorkspace({
  passage,
  session,
  initialResult,
  onBack,
  onComplete,
}: ReadingWorkspaceProps) {
  const readingType: ReadingType = passage.reading_type || "PART_7";
  const questions: ReadingQuestion[] = passage.questions || [];

  const state = useReadingSession(passage, session, initialResult);
  const {
    elapsedTime,
    remaining,
    userAnswers,
    isSubmitting,
    isSubmitted,
    attemptResult,
    showResultModal,
    setShowResultModal,
    aiExplanation,
    aiExplanationStatus,
  } = state;
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [showExit, setShowExit] = useState(false);
  const [lookupWord, setLookupWord] = useState("");
  const userId = useAuthStore((state) => state.user?.user_id);
  const currentQuestion = questions[activeQuestionIndex];
  const answeredCount = Object.values(userAnswers).filter(Boolean).length;
  const formatTime = (seconds: number) => {
    const safe = Math.max(0, seconds);
    return (
      Math.floor(safe / 60)
        .toString()
        .padStart(2, "0") +
      ":" +
      (safe % 60).toString().padStart(2, "0")
    );
  };
  const renderText = (text: string) =>
    text.split(/([A-Za-z][A-Za-z'-]+)/g).map((part, index) =>
      index % 2 ? (
        <button
          key={index}
          type="button"
          aria-label={"Tra từ " + part}
          onClick={() => setLookupWord(part)}
          className="inline cursor-help rounded hover:bg-primary/10 hover:text-primary"
        >
          {part}
        </button>
      ) : (
        part
      )
    );
  const back = () => {
    if (isSubmitted) onBack();
    else setShowExit(true);
  };
  const exit = async () => {
    await state.save();
    await state.persist();
    onBack();
  };
  const handleSubmitAttempt = () => {
    void state.submit();
  };
  const handleSelectOption = state.select;

  // ==========================================================================
  // RENDER: KẾT QUẢ BÀI LUYỆN READING (PROMAX IN-PAGE VIEW)
  // ==========================================================================
  if (isSubmitted && attemptResult) {
    return (
      <ReadingResultView
        passage={passage}
        result={attemptResult}
        elapsedTime={elapsedTime}
        aiExplanation={aiExplanation}
        aiExplanationStatus={aiExplanationStatus}
        canRetryAi={state.canRetryAi}
        onRetryAi={() => void state.retryAi()}
        onBack={onBack}
        onComplete={onComplete}
        formatTime={formatTime}
        renderText={renderText}
        userId={userId}
      />
    );
  }

  return (
    <PracticeKeyboard features={['answers','navigate','save','submit']} className="flex flex-col min-h-[calc(100dvh-5rem)] md:h-[calc(100dvh-5rem)] w-full gap-3 overflow-visible md:overflow-hidden">
      <Button size="sm" variant="outline" data-practice-action="save" disabled={!state.ready || isSubmitting || isSubmitted || state.pending} onClick={() => void state.save()}>Lưu tiến độ</Button>
      {/* Top Bar Navigation & Timer Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-surface p-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            data-practice-action="exit" onClick={back}
            className="gap-1.5 text-xs"
          >
            <Icon name="arrow-left" size={16} />
            <span>Quay lại</span>
          </Button>

          <div className="h-4 w-px bg-border" />

          <div>
            <h2 className="text-sm font-bold text-text-primary line-clamp-1">
              {passage.title_vi || passage.title}
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-text-tertiary">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 font-semibold text-primary">
                {passage.cefr_level || "B1"}
              </span>
              <span>• {passage.word_count || 0} từ</span>
              <span>• {questions.length} câu hỏi</span>
            </div>
          </div>
        </div>

        {/* Timer & Controls */}
        <div className="flex items-center gap-3">
          <span
            role="timer"
            className="rounded-lg border px-3 py-2 font-mono font-bold"
          >
            {isSubmitted ? "Đã hoàn tất" : formatTime(remaining)}
          </span>

          <Button
            variant="default"
            size="sm"
            data-practice-action="submit" onClick={handleSubmitAttempt}
            disabled={
              isSubmitting ||
              questions.length === 0 ||
              isSubmitted ||
              !state.ready
            }
            className="gap-1.5 text-xs font-semibold"
          >
            {isSubmitting ? (
              <Icon name="loader" className="animate-spin" size={14} />
            ) : (
              <Icon name="check-circle" size={14} />
            )}
            <span>
              {isSubmitted
                ? "Đã nộp"
                : state.pending
                ? "Thử nộp lại"
                : `Nộp bài (${answeredCount}/${questions.length})`}
            </span>
          </Button>
        </div>
      </div>

      {state.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 p-3 text-sm text-red-700"
        >
          {state.error}
        </div>
      )}
      {state.saveError && (
        <div
          role="alert"
          className="rounded-lg border border-amber-300 p-3 text-sm"
        >
          {state.saveError}{" "}
          <button
            type="button"
            onClick={() => void state.save()}
            className="underline"
          >
            Đồng bộ lại
          </button>{" "}
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="underline"
          >
            Tải lại phiên
          </button>
        </div>
      )}
      {!isSubmitted && (
        <p className="text-xs text-text-secondary">
          Đáp án được lưu tự động. Đồng hồ vẫn tiếp tục khi rời trang.
        </p>
      )}
      {/* Main Split-Screen Workspace Container (50/50 Layout) */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-2 gap-4 overflow-visible md:overflow-hidden min-h-0">
        {/* LEFT PANEL: Passage / Document / Scenario / Info Cards */}
        <div className="flex flex-col rounded-2xl border border-border/50 bg-surface overflow-hidden shadow-xs">
          <div className="border-b border-border/40 bg-surface-elevated/50 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
              <Icon name="book-open" size={15} className="text-primary" />
              <span>Nội dung bài đọc & Thông tin dữ liệu</span>
            </span>
            <span className="text-[11px] text-text-tertiary">
              Chạm từ vựng để tra nghĩa và lưu từ
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {passage.media_id && passage.media_type && (
              <ReadingMedia
                id={passage.media_id}
                kind={passage.media_type}
                title={passage.title}
              />
            )}
            {/* RENDER 1: TOEIC Part 6 (Text Completion) */}
            {readingType === "PART_6" && (
              <div className="prose prose-sm dark:prose-invert max-w-none text-text-primary leading-relaxed whitespace-pre-line text-sm">
                {renderPart6Content(
                  passage.content,
                  questions,
                  userAnswers,
                  (qIdx) => setActiveQuestionIndex(qIdx),
                  renderText
                )}
              </div>
            )}

            {/* RENDER 2: TOEIC Part 7 (Document Format) */}
            {readingType === "PART_7" && (
              <div className="rounded-xl border border-border/60 bg-surface-elevated p-5 shadow-xs space-y-4">
                <div className="border-b border-border/40 pb-3">
                  <h3 className="text-base font-bold text-text-primary">
                    {passage.title}
                  </h3>
                  {passage.source && (
                    <p className="text-xs text-text-tertiary">
                      Nguồn: {passage.source}
                    </p>
                  )}
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none text-text-primary leading-relaxed text-sm whitespace-pre-line">
                  {renderText(passage.content)}
                </div>
              </div>
            )}

            {/* RENDER 3: REAL-WORLD TASK-BASED READING */}
            {readingType === "REAL_WORLD_TASK" && (
              <div className="space-y-4">
                {/* Mission Brief Box */}
                <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                    <Icon name="target" size={16} />
                    <span>Nhiệm vụ của bạn (Mission Brief)</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed font-medium">
                    {renderText(
                      passage.passage_metadata?.scenario_description ||
                        passage.content
                    )}
                  </p>

                  {/* Requirements Checklist */}
                  {passage.passage_metadata?.requirements && (
                    <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-primary/10">
                      {passage.passage_metadata.requirements.map((req, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs text-text-primary font-semibold"
                        >
                          <Icon
                            name="check-circle-2"
                            size={14}
                            className="text-success shrink-0"
                          />
                          <span>{req.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Data Cards (Hotel listings, Flight options, Products...) */}
                {passage.passage_metadata?.data_cards ? (
                  <div className="grid grid-cols-1 gap-3">
                    {passage.passage_metadata.data_cards.map((card) => (
                      <div
                        key={card.id}
                        className="rounded-xl border border-border/60 bg-surface p-3.5 hover:border-primary/40 transition-all shadow-2xs"
                      >
                        <div className="flex items-center justify-between border-b border-border/30 pb-2 mb-2">
                          <h4 className="text-xs font-bold text-text-primary">
                            {card.title}
                          </h4>
                          {card.subtitle && (
                            <span className="text-xs font-bold text-primary">
                              {card.subtitle}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-text-secondary">
                          {Object.entries(card.details).map(([key, val]) => (
                            <div
                              key={key}
                              className="flex justify-between gap-1"
                            >
                              <span className="text-text-tertiary">{key}:</span>
                              <span className="font-medium text-text-primary">
                                {renderText(String(val))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="prose prose-sm text-text-primary leading-relaxed text-sm whitespace-pre-line">
                    {renderText(passage.content)}
                  </div>
                )}
              </div>
            )}

            {/* RENDER 4: INFORMATION MATCHING */}
            {readingType === "INFO_MATCHING" && (
              <div className="space-y-3">
                {passage.passage_metadata?.info_paragraphs ? (
                  passage.passage_metadata.info_paragraphs.map((p, index) => (
                    <div
                      key={p.key}
                      className={`rounded-xl border bg-surface-elevated p-4 space-y-1.5 ${
                        currentQuestion?.paragraph_index === index
                          ? "border-primary ring-1 ring-primary"
                          : "border-border/60"
                      }`}
                    >
                      <div className="inline-flex items-center rounded-md bg-primary px-2 py-0.5 text-xs font-bold text-white">
                        Đoạn [{p.key}] - {p.title}
                      </div>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {renderText(p.text)}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="prose prose-sm text-text-primary leading-relaxed text-sm whitespace-pre-line">
                    {renderText(passage.content)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Questions & Options Selection */}
        <div className="flex flex-col rounded-2xl border border-border/50 bg-surface overflow-hidden shadow-xs">
          {/* Question Pills Navigation Header */}
          <div className="border-b border-border/40 bg-surface-elevated/50 p-3 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {questions.map((q, idx) => {
                const qId = q._id || q.id || "";
                const isAnswered = Boolean(userAnswers[qId]);
                const isActive = idx === activeQuestionIndex;

                return (
                  <button
                    key={qId}
                    type="button"
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                      isActive
                        ? "bg-primary text-white ring-2 ring-primary/40 shadow-xs"
                        : isAnswered
                        ? "bg-success/20 text-success border border-success/40"
                        : "bg-surface-elevated text-text-secondary border border-border/40 hover:bg-surface-hover"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-text-tertiary font-medium shrink-0">
              Câu {activeQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          {/* Question Details & Option Choices Container */}
          {currentQuestion ? (
            <div data-practice-question tabIndex={-1} role="group" aria-label={`Câu ${activeQuestionIndex + 1}: ${currentQuestion.question_text_en}`} className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Question Skill Tag & Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary uppercase tracking-wider">
                    {currentQuestion.exercise_type || "READING_QUESTION"}
                  </span>
                  {currentQuestion.line_start !== undefined && (
                    <span className="text-[11px] text-text-tertiary">
                      dòng {currentQuestion.line_start} -{" "}
                      {currentQuestion.line_end}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-text-primary leading-snug">
                  Câu {activeQuestionIndex + 1}:{" "}
                  {currentQuestion.question_text_en}
                </h3>

                {currentQuestion.question_text_vi && (
                  <p className="text-xs text-text-tertiary italic">
                    {currentQuestion.question_text_vi}
                  </p>
                )}
              </div>

              {(currentQuestion.instruction_vi ||
                currentQuestion.instruction_en) && (
                <p className="text-sm text-text-secondary">
                  {currentQuestion.instruction_vi ||
                    currentQuestion.instruction_en}
                </p>
              )}
              {/* Options List (A, B, C, D) */}
              <div className="space-y-2.5">
                {(
                  currentQuestion.options ||
                  currentQuestion.question_data?.options ||
                  []
                ).map((opt, optionIndex) => {
                  const qId = currentQuestion._id || currentQuestion.id || "";
                  const isSelected = userAnswers[qId] === opt.key;

                  return (
                    <button
                      data-practice-option={opt.key} key={opt.key}
                      type="button"
                      onClick={() => handleSelectOption(qId, opt.key)}
                      disabled={
                        isSubmitted ||
                        isSubmitting ||
                        state.pending ||
                        !state.ready ||
                        remaining === 0
                      }
                      className={`flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-xs transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 ring-2 ring-primary/30 font-medium text-text-primary shadow-xs"
                          : "border-border/60 bg-surface-elevated hover:border-primary/40 hover:bg-surface-hover text-text-secondary"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-surface text-text-secondary border border-border"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="mt-0.5 flex-1 leading-relaxed">
                        {opt.text}
                      </span>
                      <PracticeOptionKey index={optionIndex}/>
                    </button>
                  );
                })}
              </div>

              {/* Target Vocab Popover */}

              {/* Previous / Next Question Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-border/40">
                <Button
                  variant="outline"
                  size="sm"
                  data-practice-action="previous" onClick={() =>
                    setActiveQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={activeQuestionIndex === 0}
                  className="gap-1 text-xs"
                >
                  <Icon name="chevron-left" size={14} />
                  <span>Câu trước</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  data-practice-action="next" onClick={() =>
                    setActiveQuestionIndex((prev) =>
                      Math.min(questions.length - 1, prev + 1)
                    )
                  }
                  disabled={activeQuestionIndex === questions.length - 1}
                  className="gap-1 text-xs"
                >
                  <span>Câu tiếp</span>
                  <Icon name="chevron-right" size={14} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs text-text-tertiary">
              Chưa có câu hỏi cho bài đọc này.
            </div>
          )}
        </div>
      </div>

      <DictionaryModal
        open={Boolean(lookupWord)}
        initialQuery={lookupWord}
        onOpenChange={(open) => {
          if (!open) setLookupWord("");
        }}
        onAction={(message) => {
          if (/không thể|thất bại|cần đăng nhập/i.test(message))
            toast.error(message);
          else toast.success(message);
        }}
        userId={userId}
      />
      <PracticeExitConfirmModal
        isOpen={showExit}
        onClose={() => setShowExit(false)}
        onConfirmExit={() => void exit()}
        title="Rời bài Reading?"
        description="Đáp án được giữ để tiếp tục. Đồng hồ vẫn chạy theo hạn giờ của phiên."
        savedNotice="Bạn có thể mở lại phiên từ danh sách bài đang làm."
        confirmText="Lưu & quay lại"
      />
      {/* RESULTS MODAL UPON SUBMISSION REPLACED BY IN-PAGE PROMAX VIEW */}
    </PracticeKeyboard>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Skill Breakdown Bar Component
 */
function SkillBreakdownBar({ skill }: { skill: SkillBreakdownItem }) {
  const statusColors = {
    excellent: "bg-success",
    good: "bg-primary",
    needs_improvement: "bg-error",
  };

  const statusIcons = {
    excellent: "✓",
    good: "•",
    needs_improvement: "!",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-28 text-xs font-medium text-text-primary truncate">
        {skill.label_vi}
      </div>
      <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            statusColors[skill.status]
          }`}
          style={{ width: `${skill.percent}%` }}
        />
      </div>
      <div className="w-12 text-xs font-bold text-right">
        <span className={skill.percent >= 60 ? "text-success" : "text-error"}>
          {skill.percent}%
        </span>
      </div>
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
          statusColors[skill.status]
        }`}
      >
        {statusIcons[skill.status]}
      </div>
    </div>
  );
}

/**
 * Wrong Answer Card Component
 */
function WrongAnswerCard({ wrong }: { wrong: WrongAnswerItem }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-error/30 bg-error/5 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-error/20 flex items-center justify-center text-xs font-bold text-error shrink-0">
            {wrong.question_number}
          </div>
          <div>
            <div className="text-xs font-semibold text-text-primary">
              {wrong.exercise_type.replace(/_/g, " ")}
            </div>
            <div className="text-xs text-text-secondary line-clamp-2 mt-0.5">
              {wrong.question_text}
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-primary hover:text-primary-hover"
        >
          {isExpanded ? "Thu gọn" : "Chi tiết"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2 pt-2 border-t border-error/20">
          <div className="flex items-start gap-2 text-xs">
            <div className="w-16 font-semibold text-error shrink-0">
              Đáp án của bạn:
            </div>
            <div className="text-error">{wrong.user_answer}</div>
          </div>
          <div className="flex items-start gap-2 text-xs">
            <div className="w-16 font-semibold text-success shrink-0">
              Đáp án đúng:
            </div>
            <div className="text-success font-medium">
              {wrong.correct_answer}
            </div>
          </div>
          {wrong.explanation && (
            <div className="mt-2 text-xs text-text-secondary bg-surface-elevated rounded-lg p-2">
              <div className="font-semibold text-text-primary mb-1">
                Giải thích:
              </div>
              {wrong.explanation_vi || wrong.explanation}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * AI Explanation Section Component
 */
function AIExplanationSection({
  status,
  explanation,
}: {
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | null;
  explanation: AIReadingExplanation | null;
}) {
  if (status === null) return null;

  if (status === "PENDING" || status === "PROCESSING") {
    return (
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <div className="text-sm font-medium text-primary">
            {status === "PENDING"
              ? "Đang chuẩn bị phân tích AI..."
              : "AI đang phân tích câu sai..."}
          </div>
        </div>
        <div className="text-xs text-text-tertiary">
          Phân tích chi tiết sẽ sẵn sàng trong giây lát. Bạn có thể đóng modal
          và quay lại sau.
        </div>
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="rounded-xl border border-error/30 bg-error/5 p-4">
        <div className="flex items-center gap-2 text-sm text-error">
          <Icon name="alert-circle" size={16} />
          <span>Không thể tải phân tích AI. Vui lòng thử lại sau.</span>
        </div>
      </div>
    );
  }

  if (status === "COMPLETED" && explanation) {
    return (
      <div className="space-y-3">
        {/* Summary */}
        {explanation.summary && (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="sparkles" size={16} className="text-primary" />
              <span className="text-sm font-semibold text-primary">
                Tổng kết
              </span>
            </div>
            <p className="text-sm text-text-secondary">{explanation.summary}</p>
          </div>
        )}

        {/* Overall Advice */}
        {explanation.overall_advice && (
          <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="lightbulb" size={16} className="text-warning-dark" />
              <span className="text-sm font-semibold text-warning-dark">
                Gợi ý cải thiện
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {explanation.overall_advice}
            </p>
          </div>
        )}

        {/* Detailed Explanations */}
        {explanation.explanations && explanation.explanations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-text-primary">
              Phân tích chi tiết từng câu
            </h4>
            {explanation.explanations.map((exp, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-border bg-surface-elevated p-3 space-y-2"
              >
                <div className="text-xs font-semibold text-text-primary">
                  Câu {exp.question_number}:{" "}
                  {exp.recommended_topic && (
                    <span className="text-primary ml-2">
                      ({exp.recommended_topic})
                    </span>
                  )}
                </div>
                {exp.why_wrong && (
                  <div className="text-xs">
                    <span className="text-error font-medium">Sai: </span>
                    <span className="text-text-secondary">{exp.why_wrong}</span>
                  </div>
                )}
                {exp.why_correct && (
                  <div className="text-xs">
                    <span className="text-success font-medium">Đúng: </span>
                    <span className="text-text-secondary">
                      {exp.why_correct}
                    </span>
                  </div>
                )}
                {exp.trap_identified && (
                  <div className="text-xs">
                    <span className="text-warning-dark font-medium">
                      ⚠️ Bẫy:{" "}
                    </span>
                    <span className="text-text-secondary">
                      {exp.trap_identified}
                    </span>
                  </div>
                )}
                {exp.study_focus && (
                  <div className="text-xs">
                    <span className="text-primary font-medium">
                      📚 Hướng dẫn:{" "}
                    </span>
                    <span className="text-text-secondary">
                      {exp.study_focus}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

/**
 * Helper renderer cho TOEIC Part 6 (Text Completion)
 * Biến các vị trí `[1]`, `[2]`, `[3]` thành interactive badge buttons
 */
function renderPart6Content(
  text: string,
  questions: ReadingQuestion[],
  answers: Record<string, string>,
  onSelectBlank: (qIndex: number) => void,
  renderText: (text: string) => React.ReactNode
) {
  if (!text) return null;
  const regex = /\[(\d+)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const blankNum = parseInt(match[1], 10);
    const qIdx = questions.findIndex(
      (q) =>
        q.question_number === blankNum || questions.indexOf(q) + 1 === blankNum
    );
    const q = questions[qIdx];
    const qId = q ? q._id || q.id || "" : "";
    const selectedKey = answers[qId];
    const options = q ? q.options || q.question_data?.options || [] : [];
    const selectedOptionText = options.find((o) => o.key === selectedKey)?.text;

    // Push preceding normal text
    if (match.index > lastIndex) {
      parts.push(renderText(text.substring(lastIndex, match.index)));
    }

    // Push Interactive Blank Badge
    parts.push(
      <button
        key={`blank-${blankNum}-${match.index}`}
        type="button"
        onClick={() => onSelectBlank(qIdx >= 0 ? qIdx : 0)}
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-bold transition-all mx-1 ${
          selectedOptionText
            ? "bg-primary/20 text-primary border border-primary/40 ring-1 ring-primary/20"
            : "bg-warning/20 text-warning-dark border border-warning/40 animate-pulse"
        }`}
      >
        <span className="underline decoration-dashed">[{blankNum}]</span>
        {selectedOptionText ? (
          <span className="font-bold text-primary">{selectedOptionText}</span>
        ) : (
          <span className="italic opacity-80">(Chọn đáp án)</span>
        )}
      </button>
    );

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(renderText(text.substring(lastIndex)));
  }

  return parts;
}

// ============================================================================
// COMPONENT: READING RESULT VIEW (PROMAX IN-PAGE VIEW)
// ============================================================================

interface ReadingResultViewProps {
  passage: ReadingPassage;
  result: ReadingAttemptResultEnhanced;
  elapsedTime: number;
  aiExplanation: AIReadingExplanation | null;
  aiExplanationStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | null;
  canRetryAi?: boolean;
  onRetryAi?: () => void;
  onBack: () => void;
  onComplete?: () => void;
  formatTime: (seconds: number) => string;
  renderText: (text: string) => React.ReactNode;
  userId?: string;
}

function ReadingResultView({
  passage,
  result,
  elapsedTime,
  aiExplanation,
  aiExplanationStatus,
  canRetryAi,
  onRetryAi,
  onBack,
  onComplete,
  formatTime,
  renderText,
  userId,
}: ReadingResultViewProps) {
  const isPassed = result.score_percent >= 80;
  const wrongAnswers = result.wrong_answers || [];
  const wrongCount = result.wrong_count ?? wrongAnswers.length;
  const questions = passage.questions || [];

  const [lookupWord, setLookupWord] = useState("");
  const [selectedReviewQuestionIndex, setSelectedReviewQuestionIndex] = useState(0);
  const [expandedWrongIndex, setExpandedWrongIndex] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    wrongAnswers.slice(0, 3).forEach((_, idx) => initial.add(idx));
    return initial;
  });

  const toggleExpandWrong = (idx: number) => {
    setExpandedWrongIndex((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const defaultTab = wrongCount > 0 ? "wrong_answers" : "passage_review";
  const currentReviewQuestion = questions[selectedReviewQuestionIndex];

  const handleFinish = () => {
    if (onComplete) onComplete();
    else onBack();
  };

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleFinish}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          Về danh sách bài đọc
        </button>

        <div className="flex items-center gap-2">
          {isPassed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Sparkles size={12} className="text-emerald-500" />
              Đạt yêu cầu
            </span>
          )}
          {passage.cefr_level && (
            <Badge variant="secondary" className="text-xs">
              CEFR {passage.cefr_level}
            </Badge>
          )}
        </div>
      </div>

      {/* Hero Score Card (Promax) */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Score Badge & Title */}
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={`relative flex h-22 w-22 sm:h-24 sm:w-24 shrink-0 flex-col items-center justify-center rounded-2xl border p-2 shadow-xs ${
                isPassed
                  ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400"
                  : result.score_percent >= 60
                  ? "border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                  : "border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400"
              }`}
            >
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {result.score_percent}%
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-secondary">
                Chính xác
              </span>
            </div>

            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {passage.reading_type ? passage.reading_type.replace(/_/g, " ") : "Reading"}
                </span>
                {result.context && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    <Folder size={11} />
                    {result.context.name_vi || result.context.name_en}
                  </span>
                )}
                {passage.word_count && (
                  <span className="text-xs text-text-secondary">
                    · {passage.word_count} từ
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-xl font-bold text-text-primary truncate">
                {passage.title_vi || passage.title}
              </h1>

              {passage.title_vi && passage.title && (
                <p className="text-xs text-text-secondary truncate">{passage.title}</p>
              )}

              {/* Quick Metrics Chips */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-text-secondary">
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <strong className="text-text-primary">
                    {result.correct_count}/{result.total_questions}
                  </strong>{" "}
                  câu đúng
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2 py-0.5">
                  <Clock size={12} className="text-primary" />
                  <strong className="text-text-primary">
                    {formatTime(result.time_spent_seconds ?? elapsedTime)}
                  </strong>
                </span>
                {wrongCount > 0 ? (
                  <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-2 py-0.5 border border-rose-200 dark:border-rose-900/50">
                    <AlertTriangle size={12} className="text-rose-500" />
                    <strong>{wrongCount}</strong> câu cần xem
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 border border-emerald-200 dark:border-emerald-900/50">
                    <Sparkles size={12} className="text-emerald-500" />
                    Đúng 100%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5 sm:self-center">
            <Button
              variant="outline"
              onClick={onBack}
              className="flex-1 sm:flex-initial flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={15} />
              Làm lại bài này
            </Button>
            <Button
              onClick={handleFinish}
              className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-sm cursor-pointer"
            >
              Hoàn tất & Quay về
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Motivational Snippet */}
        <div className="mt-4 rounded-xl border border-border/80 bg-surface-subtle/40 p-3.5 text-xs sm:text-sm text-text-secondary">
          <p className="leading-relaxed">
            <span className="font-semibold text-text-primary mr-1">
              {isPassed ? "🎉 Đánh giá:" : "💡 Nhận xét:"}
            </span>
            {isPassed
              ? "Kỹ năng đọc hiểu bài này của bạn rất xuất sắc! Tốc độ đọc và khả năng xác định thông tin then chốt rất chính xác."
              : result.score_percent >= 60
              ? "Bạn đã nắm được nội dung chính của bài đọc, chỉ nhầm lẫn ở một số câu bẫy chi tiết hoặc từ vựng ngữ cảnh. Hãy xem giải thích bên dưới."
              : "Bài đọc có nhiều cấu trúc hoặc từ vựng mới khiến bạn gặp trở ngại. Hãy mở tab 'Đoạn văn & Câu hỏi' để đọc kỹ lại ngữ cảnh."}
          </p>
        </div>

        {result.submitted_after_deadline && (
          <p role="status" className="mt-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 p-2.5 text-xs text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50">
            ⚠️ Phiên đã hết hạn thời gian quy định. Điểm số được tính dựa trên đáp án đã gửi lên máy chủ.
          </p>
        )}
      </section>

      {/* Main Tabbed Interactive Workspace */}
      <Tabs defaultValue={defaultTab} className="w-full space-y-4">
        {/* Tab Triggers */}
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-11 w-full sm:w-auto p-1 bg-surface border border-border rounded-xl">
            <TabsTrigger
              value="wrong_answers"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <AlertTriangle size={15} />
              <span>Câu sai & Phân tích AI</span>
              <span
                className={`ml-1 rounded-full px-1.5 py-0.2 text-[11px] ${
                  wrongCount > 0
                    ? "bg-rose-500 text-white font-bold"
                    : "bg-surface-subtle text-text-secondary"
                }`}
              >
                {wrongCount}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="passage_review"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <BookOpen size={15} />
              <span>Đoạn văn & Toàn bộ câu hỏi</span>
              <span className="ml-1 rounded-full bg-surface-subtle px-1.5 py-0.2 text-[11px] text-text-secondary">
                {result.total_questions}
              </span>
            </TabsTrigger>

            {result.skill_breakdown && result.skill_breakdown.length > 0 && (
              <TabsTrigger
                value="skill_breakdown"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
              >
                <BarChart2 size={15} />
                <span>Kỹ năng đọc</span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Tab 1: Wrong Answers & AI Explanation */}
        <TabsContent value="wrong_answers" className="space-y-4 outline-none">
          {wrongCount === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-8 text-center">
              <CheckCircle2 size={42} className="text-emerald-500 mb-3" />
              <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                Xuất sắc! Bạn không làm sai câu nào 🎉
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary max-w-md">
                Tất cả câu trả lời của bạn đều chuẩn xác. Bạn có thể mở tab &apos;Đoạn văn & Toàn bộ câu hỏi&apos; để đọc lại bài đọc hoặc chuyển sang bài tiếp theo.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Mistakes List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>Chi tiết các câu cần lưu ý ({wrongAnswers.length} câu)</span>
                </div>

                {wrongAnswers.map((wrong, idx) => {
                  const isExpanded = expandedWrongIndex.has(idx);
                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                        isExpanded
                          ? "border-rose-200 dark:border-rose-900/50 bg-surface shadow-xs"
                          : "border-border/80 bg-surface hover:border-border"
                      }`}
                    >
                      <div
                        onClick={() => toggleExpandWrong(idx)}
                        className="flex cursor-pointer items-start justify-between gap-3 p-3.5 sm:items-center"
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-2">
                          <span className="inline-flex shrink-0 items-center rounded-md border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 px-2 py-0.5 text-xs font-semibold">
                            Câu {wrong.question_number}
                          </span>
                          <span className="text-xs text-text-secondary font-medium">
                            [{wrong.exercise_type.replace(/_/g, " ")}]
                          </span>
                          <span className="text-sm font-semibold text-text-primary truncate">
                            {wrong.question_text}
                          </span>
                        </div>

                        <button
                          type="button"
                          aria-label="Toggle details"
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-text-secondary hover:bg-surface-subtle"
                        >
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="border-t border-border/60 bg-surface-subtle/30 px-4 py-3.5 space-y-3 text-xs sm:text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-text-secondary">Đáp án của bạn:</span>
                            <span className="line-through decoration-rose-400 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded font-medium">
                              {wrong.user_answer || "(Chưa chọn)"}
                            </span>
                            <span className="text-text-secondary">➔ Đáp án đúng:</span>
                            <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-bold">
                              {wrong.correct_answer}
                            </span>
                          </div>

                          {(wrong.explanation_vi || wrong.explanation) && (
                            <div className="rounded-lg border border-border/60 bg-surface p-3 text-text-secondary space-y-1">
                              <span className="text-xs font-bold text-text-primary block">
                                💡 Giải thích vì sao đúng:
                              </span>
                              <p className="leading-relaxed">
                                {wrong.explanation_vi || wrong.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* AI Explanation Block */}
              <div className="pt-2">
                <AIExplanationSection
                  status={aiExplanationStatus}
                  explanation={aiExplanation}
                />

                {aiExplanationStatus === "FAILED" && canRetryAi && onRetryAi && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRetryAi}
                    className="mt-2 text-xs"
                  >
                    Thử phân tích AI lại
                  </Button>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Passage & Questions Review (Side-by-side or stacked) */}
        <TabsContent value="passage_review" className="space-y-4 outline-none">
          {/* Question Navigator Strip */}
          <div className="rounded-xl border border-border bg-surface p-3 space-y-2">
            <span className="text-xs font-semibold text-text-secondary">
              Chọn câu hỏi để xem vị trí trong bài:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((q, idx) => {
                const isWrong = wrongAnswers.some((w) => w.question_number === (q.question_number || idx + 1));
                const isCurrent = idx === selectedReviewQuestionIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedReviewQuestionIndex(idx)}
                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer ${
                      isCurrent
                        ? "ring-2 ring-primary ring-offset-1 font-black"
                        : ""
                    } ${
                      isWrong
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                        : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 Columns: Passage and Questions */}
          <div className="grid gap-4 lg:grid-cols-12">
            {/* Passage Column (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div className="flex items-center gap-2">
                  <BookText size={16} className="text-primary" />
                  <h3 className="text-sm font-bold text-text-primary">Đoạn văn bài đọc</h3>
                </div>
                <span className="text-xs text-text-secondary">
                  Click vào từ tiếng Anh để tra nghĩa
                </span>
              </div>
              <div className="text-sm leading-relaxed text-text-primary whitespace-pre-wrap max-h-[500px] overflow-y-auto pr-2">
                {passage.content ? (
                  renderText(passage.content)
                ) : (
                  <span className="italic text-text-secondary">Không có nội dung bài đọc.</span>
                )}
              </div>
            </div>

            {/* Questions Column (5 cols) */}
            <div className="lg:col-span-5 rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Câu hỏi {selectedReviewQuestionIndex + 1} / {questions.length}
                </span>
              </div>

              {currentReviewQuestion && (
                <div className="space-y-3 text-xs sm:text-sm">
                  <p className="font-semibold text-text-primary">
                    {currentReviewQuestion.question_text_en || currentReviewQuestion.question_text_vi}
                  </p>

                  <div className="space-y-1.5">
                    {(currentReviewQuestion.options || currentReviewQuestion.question_data?.options || []).map((opt) => {
                      const isCorrect = opt.key === (currentReviewQuestion.correct_answer || currentReviewQuestion.question_data?.correct_answer);
                      return (
                        <div
                          key={opt.key}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-xs sm:text-sm ${
                            isCorrect
                              ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200 font-medium"
                              : "border-border/70 bg-surface-subtle/40 text-text-secondary"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <strong className="text-text-primary">{opt.key}.</strong>
                            <span>{opt.text}</span>
                          </span>
                          {isCorrect && (
                            <span className="text-emerald-600 font-bold text-xs">✓ Đáp án đúng</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {(currentReviewQuestion.explanation_vi || currentReviewQuestion.explanation || currentReviewQuestion.question_data?.explanation) && (
                    <div className="rounded-lg border border-border/60 bg-surface-subtle/50 p-2.5 text-xs text-text-secondary">
                      <strong className="text-text-primary block mb-0.5">💡 Giải thích:</strong>
                      <p className="leading-relaxed">
                        {currentReviewQuestion.explanation_vi || currentReviewQuestion.explanation || currentReviewQuestion.question_data?.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Skill Breakdown */}
        {result.skill_breakdown && result.skill_breakdown.length > 0 && (
          <TabsContent value="skill_breakdown" className="space-y-4 outline-none">
            <div className="rounded-2xl border border-border bg-surface p-5 space-y-4 shadow-xs">
              <div>
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <BarChart2 size={16} className="text-primary" />
                  Phân tích kỹ năng đọc hiểu bài này
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Đo lường mức độ thành thạo theo từng dạng câu hỏi (Ý chính, Chi tiết, Từ vựng, Suy luận)
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {result.skill_breakdown.map((skill) => (
                  <SkillBreakdownBar key={skill.exercise_type} skill={skill} />
                ))}
              </div>

              {result.weakest_skill && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                  <span>
                    Kỹ năng cần cải thiện thêm:{" "}
                    <strong>
                      {result.weakest_skill_vi || result.weakest_skill}
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Sticky Action Footer */}
      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
        <Button variant="outline" size="sm" onClick={handleFinish}>
          Về danh sách bài đọc
        </Button>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-1.5">
            <RotateCcw size={14} />
            Luyện tập lại
          </Button>
          <Button
            size="sm"
            onClick={handleFinish}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-sm"
          >
            Hoàn tất bài làm
            <ChevronRight size={15} />
          </Button>
        </div>
      </section>

      {/* Tra từ điển nếu click vào từ */}
      <DictionaryModal
        open={Boolean(lookupWord)}
        initialQuery={lookupWord}
        onOpenChange={(open) => {
          if (!open) setLookupWord("");
        }}
        userId={userId}
        onAction={(message) => {
          if (/không thể|thất bại|cần đăng nhập/i.test(message))
            toast.error(message);
          else toast.success(message);
        }}
      />
    </main>
  );
}
