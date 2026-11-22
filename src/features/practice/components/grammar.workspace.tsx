/**
 * @file grammar.workspace.tsx
 * @description Không gian luyện tập ngữ pháp tương tác (Grammar Practice Session Workspace)
 */

"use client";

import { PracticeKeyboard, PracticeOptionKey } from '@/features/practice/components/practice.keyboard'


import { useState, useMemo } from "react";
import { useGrammarSession } from "@/features/practice/hooks/use.grammar.session";
import { GrammarMedia } from "@/features/practice/components/grammar.media";
import { DictionaryModal } from "@/features/vocabulary/components/dictionary.modal";
import { toast } from "@/store/toast.store";
import { Card, CardContent } from "@/components/card";
import { Button } from "@/components/button";
import { Badge } from "@/components/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import { Icon } from "@/components/icon.map";
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
  Zap,
  Volume2,
} from "lucide-react";
import { useNavigate } from "@/lib/navigation";
import { PracticeExitConfirmModal } from "@/features/practice/components/practice.exit-confirm.modal";
import type {
  GrammarSession,
  GrammarQuestionItem,
  GrammarSessionResult,
  GrammarSessionResultDetail,
} from "@/features/practice/types/grammar-practice";

interface GrammarWorkspaceProps {
  session: GrammarSession;
  userId?: string;
  onClose: () => void;
  onRetry: () => void;
  backLabel?: string;
}

export function GrammarWorkspace({
  session,
  userId,
  onClose,
  onRetry,
  backLabel,
}: GrammarWorkspaceProps) {
  const navigate = useNavigate();
  const state = useGrammarSession(session, userId);
  const {
    index: currentIndex,
    currentAnswer,
    result: sessionResult,
    submitting: isSubmitting,
  } = state;
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [exitError, setExitError] = useState("");
  const [lookupWord, setLookupWord] = useState("");
  const currentQuestion: GrammarQuestionItem | undefined =
    session.questions[currentIndex];
  const totalQuestions = session.total_questions;
  const checkedState = {
    isChecked: Boolean(state.checked),
    isCorrect: state.checked?.is_correct || false,
  };
  const reorderSelectedWords = currentAnswer ? currentAnswer.split(" ") : [];
  const locked =
    !state.ready ||
    state.checking ||
    isSubmitting ||
    state.pending ||
    checkedState.isChecked;
  const formattedTime =
    Math.floor(state.seconds / 60)
      .toString()
      .padStart(2, "0") +
    ":" +
    (state.seconds % 60).toString().padStart(2, "0");
  const handleInitiateExit = () => {
    if (sessionResult) onClose();
    else {
      state.setPaused(true);
      setShowExitConfirm(true);
    }
  };
  const handleResume = () => {
    state.setPaused(false);
    setShowExitConfirm(false);
  };
  const handleConfirmExit = async () => {
    try {
      await state.exit();
      onClose();
    } catch {
      setExitError(
        "Chưa đồng bộ được bản nháp. Hãy thử lại hoặc tiếp tục làm bài."
      );
      setShowExitConfirm(false);
      state.setPaused(false);
    }
  };
  const handleSelectWord = (word: string) =>
    state.change([...reorderSelectedWords, word].join(" "));
  const handleRemoveWord = (index: number) =>
    state.change(
      reorderSelectedWords.filter((_word, i) => i !== index).join(" ")
    );
  const handleResetReorder = () => state.change("");
  const handleCheckAnswer = () => {
    void state.check();
  };
  const handleNextOrFinish = () => {
    if (currentIndex < totalQuestions - 1) state.next();
    else void state.submit();
  };
  if (!currentQuestion)
    return (
      <p role="alert">
        Phiên không có câu hỏi. <Button onClick={onClose}>Quay lại</Button>
      </p>
    );

  // ==========================================================================
  // RENDER: KẾT QUẢ PHIÊN LUYỆN TẬP (PROMAX IN-PAGE VIEW)
  // ==========================================================================
  if (sessionResult) {
    return (
      <GrammarResultView
        session={session}
        result={sessionResult}
        formattedTime={formattedTime}
        onRetry={onRetry}
        onClose={onClose}
        backLabel={backLabel}
      />
    );
  }

  // ==========================================================================
  // RENDER: WORKSPACE ĐANG LÀM BÀI
  // ==========================================================================
  const progressPercent = Math.round(
    ((currentIndex + 1) / totalQuestions) * 100
  );

  return (
    <PracticeKeyboard enterMode features={['answers','navigate','check','save','submit']} className="mx-auto max-w-3xl px-4 py-4 sm:py-6">
      <Button size="sm" variant="outline" data-practice-action="save" disabled={!state.ready || state.checking || isSubmitting || state.pending} onClick={() => void state.save().catch(() => toast.error("Chưa lưu được tiến độ. Hãy thử lại."))}>Lưu tiến độ</Button>
      {backLabel && <Button variant="ghost" data-practice-action="exit" onClick={handleInitiateExit} disabled={!state.ready || state.checking || isSubmitting} className="mb-3 min-h-11 gap-2">
        <Icon name="arrowLeft" size={16} />{backLabel}
      </Button>}
      {(state.error || exitError) && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-red-300 p-3 text-sm"
        >
          {state.error || exitError}
        </div>
      )}
      {state.saveError && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-amber-300 p-3 text-sm"
        >
          {state.saveError}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => void state.save().catch(() => {})}
          >
            Đồng bộ lại
          </button>{" "}
          <button
            type="button"
            className="underline"
            onClick={() => window.location.reload()}
          >
            Tải lại phiên
          </button>
        </div>
      )}
      <Card className="overflow-hidden border border-border shadow-xl">
        {/* Workspace Top Header */}
        <div className="flex items-center justify-between border-b border-border bg-surface-subtle px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-white">
              {session.cefr_level}
            </span>
            <h3 className="text-sm font-semibold text-text-primary sm:text-base line-clamp-1">
              {session.topic_name_vi}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 font-mono text-xs font-medium text-text-secondary">
              <Icon name="clock" size={14} />
              <span>{formattedTime}</span>
            </div>

            <button
              type="button"
              aria-label="Tạm dừng và quay lại"
              disabled={!state.ready || state.checking || isSubmitting}
              data-practice-action="exit" onClick={handleInitiateExit}
              className="rounded-lg p-1 text-text-tertiary transition-colors hover:bg-surface-elevated hover:text-text-primary cursor-pointer"
            >
              <Icon name="x" size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-surface-subtle">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <CardContent data-practice-question tabIndex={-1} role="group" aria-label={`Câu ${currentIndex + 1}: ${currentQuestion.question_text_en}`} className="p-6 sm:p-8 space-y-6">
          {/* Question Meta & Question Index */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Câu {currentIndex + 1} / {totalQuestions}
            </span>
            <span className="text-xs text-text-tertiary">
              {currentQuestion.question_type === "MULTIPLE_CHOICE" &&
                "Trắc nghiệm"}
              {currentQuestion.question_type === "FILL_BLANK" &&
                "Điền vào chỗ trống"}
              {currentQuestion.question_type === "ORDERING" && "Sắp xếp câu"}
            </span>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <p className="text-lg font-semibold text-text-primary leading-relaxed sm:text-xl">
              {currentQuestion.question_text_en}
            </p>
            {currentQuestion.question_text_vi && (
              <p className="text-sm text-text-secondary italic">
                {currentQuestion.question_text_vi}
              </p>
            )}
          </div>

          {/* Quick Vocab Popover for embedded words/phrases */}
          {currentQuestion.instruction_vi || currentQuestion.instruction_en ? (
            <p className="text-sm text-text-secondary">
              {currentQuestion.instruction_vi || currentQuestion.instruction_en}
            </p>
          ) : null}
          {currentQuestion.media_id && (
            <GrammarMedia
              key={currentQuestion.media_id}
              id={currentQuestion.media_id}
            />
          )}
          {Boolean(currentQuestion.target_vocabularies?.length) && (
            <div className="flex flex-wrap gap-2">
              {currentQuestion.target_vocabularies?.map((word) => (
                <Button
                  key={word.word}
                  variant="outline"
                  size="sm"
                  onClick={() => setLookupWord(word.word)}
                >
                  {word.word}
                  {word.pos ? " (" + word.pos + ")" : ""}
                </Button>
              ))}
            </div>
          )}

          {/* INTERACTION TYPES */}
          {/* 1. MULTIPLE CHOICE */}
          {currentQuestion.question_type === "MULTIPLE_CHOICE" &&
            currentQuestion.options && (
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                {currentQuestion.options.map((opt, optionIndex) => {
                  const isSelected =
                    currentAnswer.toUpperCase() === opt.key.toUpperCase();
                  return (
                    <button
                      data-practice-option={opt.key} key={opt.key}
                      type="button"
                      disabled={locked}
                      onClick={() => state.change(opt.key)}
                      className={`flex items-center gap-3.5 rounded-xl border p-4 text-left font-medium transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/20"
                          : "border-border bg-surface-subtle hover:border-primary/40 hover:bg-surface-elevated text-text-primary"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-surface-elevated text-text-secondary"
                        }`}
                      >
                        {opt.key}
                      </span>
                      <span className="text-sm sm:text-base leading-snug">
                        {opt.text}
                      </span>
                      <PracticeOptionKey index={optionIndex}/>
                    </button>
                  );
                })}
              </div>
            )}

          {/* 2. FILL IN THE BLANK */}
          {currentQuestion.question_type === "FILL_BLANK" && (
            <div className="space-y-3 pt-2">
              <label className="text-xs font-medium text-text-secondary">
                Nhập câu trả lời chính xác:
              </label>
              <input
                type="text"
                disabled={locked}
                value={currentAnswer}
                onChange={(e) => state.change(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !locked && currentAnswer.trim()) {
                    handleCheckAnswer();
                  }
                }}
                placeholder="Nhập từ hoặc cụm từ..."
                className="w-full rounded-xl border border-border bg-surface-subtle px-4 py-3 text-base font-medium text-text-primary placeholder:text-text-tertiary focus:border-primary focus:bg-surface-elevated focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          {/* 3. SENTENCE REORDERING */}
          {currentQuestion.question_type === "ORDERING" &&
            currentQuestion.ordering_items && (
              <div className="space-y-4 pt-2">
                {/* Drop area / Sentence Constructed */}
                <div className="min-h-[64px] rounded-xl border-2 border-dashed border-primary/30 bg-surface-subtle p-3 flex flex-wrap items-center gap-2">
                  {reorderSelectedWords.length === 0 ? (
                    <span className="text-sm text-text-tertiary select-none">
                      Nhấp vào các khối từ bên dưới để ghép thành câu đúng...
                    </span>
                  ) : (
                    reorderSelectedWords.map((word, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={locked}
                        onClick={() => handleRemoveWord(idx)}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover active:scale-95 transition-all"
                      >
                        <span>{word}</span>
                        <Icon name="x" size={13} className="opacity-70" />
                      </button>
                    ))
                  )}
                </div>

                {/* Word Bank */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                      Ngân hàng từ:
                    </span>
                    {reorderSelectedWords.length > 0 &&
                      !checkedState.isChecked && (
                        <button
                          type="button"
                          disabled={locked}
                          onClick={handleResetReorder}
                          className="text-xs font-medium text-text-secondary hover:text-primary transition-colors"
                        >
                          Đặt lại
                        </button>
                      )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {currentQuestion.ordering_items.map((word, idx) => {
                      const timesUsed = reorderSelectedWords.filter(
                        (w) => w === word
                      ).length;
                      const timesInSource =
                        currentQuestion.ordering_items?.filter(
                          (w) => w === word
                        ).length || 1;
                      const isExhausted = timesUsed >= timesInSource;

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isExhausted || locked}
                          onClick={() => handleSelectWord(word)}
                          className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-all ${
                            isExhausted
                              ? "border-border bg-surface-subtle text-text-tertiary opacity-40 cursor-not-allowed"
                              : "border-border bg-surface-elevated text-text-primary shadow-sm hover:border-primary/40 hover:bg-surface-subtle active:scale-95"
                          }`}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

          {/* CHECK RESULT BANNER */}
          {checkedState.isChecked && (
            <div
              className={`rounded-xl p-4 animate-in fade-in duration-200 ${
                checkedState.isCorrect
                  ? "border border-success/30 bg-success/10 text-success"
                  : "border border-error/30 bg-error/10 text-error"
              }`}
            >
              <div className="flex items-start gap-3">
                <Icon
                  name={checkedState.isCorrect ? "checkCircle2" : "xCircle"}
                  className="mt-0.5 flex-shrink-0"
                  size={20}
                />
                <div className="flex-1 space-y-1">
                  <p className="font-bold text-sm sm:text-base">
                    {checkedState.isCorrect
                      ? "Chính xác! Làm rất tốt!"
                      : "Chưa chính xác!"}
                  </p>
                  {!checkedState.isCorrect && (
                    <p className="text-xs text-text-secondary">
                      Câu sai sẽ được lưu vào Sổ tay lỗi sai khi bạn nộp cả bài.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {state.checked && (
            <div className="rounded-lg bg-surface-subtle p-3 text-sm">
              <p className="font-semibold">
                Đáp án đúng: {state.checked.correct_answer}
              </p>
              {(state.checked.explanation_vi || state.checked.explanation) && (
                <p className="mt-2">
                  {state.checked.explanation_vi || state.checked.explanation}
                </p>
              )}
            </div>
          )}
          {/* FOOTER ACTIONS */}
          <div className="flex items-center justify-between border-t border-border pt-5">
            <span className="text-xs text-text-tertiary">
              {currentIndex + 1} của {totalQuestions} câu
            </span>

            <div className="flex items-center gap-3">
              {!checkedState.isChecked && !state.pending ? (
                <Button
                  variant="default"
                  disabled={!currentAnswer.trim() || locked}
                  data-practice-action="check" onClick={handleCheckAnswer}
                  className="min-w-[120px]"
                >
                  {state.checking ? "Đang kiểm tra…" : "Kiểm tra"}
                </Button>
              ) : (
                <Button
                  variant="default"
                  disabled={isSubmitting || state.checking || !state.ready}
                  data-practice-action={state.pending || currentIndex === totalQuestions - 1 ? "submit" : "next"} onClick={
                    state.pending
                      ? () => void state.submit()
                      : handleNextOrFinish
                  }
                  className="min-w-[140px] gap-2"
                >
                  <span>
                    {state.pending
                      ? "Thử nộp lại"
                      : currentIndex < totalQuestions - 1
                      ? "Câu tiếp theo"
                      : "Xem kết quả"}
                  </span>
                  <Icon name="arrowRight" size={16} />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <DictionaryModal
        open={Boolean(lookupWord)}
        initialQuery={lookupWord}
        onOpenChange={(open) => {
          if (!open) setLookupWord("");
        }}
        userId={userId}
        onAction={(message) => {
          if (
            /không thể|thất bại|cần đăng nhập|failed|please login/i.test(
              message
            )
          )
            toast.error(message);
          else toast.success(message);
        }}
      />
      {/* Hộp thoại xác nhận tạm dừng & thoát phiên */}
      <PracticeExitConfirmModal
        isOpen={showExitConfirm}
        onClose={handleResume}
        onConfirmExit={handleConfirmExit}
        title="Tạm dừng bài luyện ngữ pháp?"
        description="Đồng hồ đếm thời gian đang được tạm ngưng. Bạn có chắc muốn dừng bài luyện tập ngữ pháp này?"
        savedNotice="Đáp án và thời gian được lưu để làm tiếp. Câu sai chưa được thêm vào Sổ tay lỗi sai; bạn cần mở lại phiên và nộp cả bài thành công."
      />
    </PracticeKeyboard>
  );
}

// ============================================================================
// COMPONENT: GRAMMAR RESULT VIEW (PROMAX IN-PAGE VIEW)
// ============================================================================

interface GrammarResultViewProps {
  session: GrammarSession;
  result: GrammarSessionResult;
  formattedTime: string;
  onRetry: () => void;
  onClose: () => void;
  backLabel?: string;
}

function GrammarResultView({
  session,
  result,
  formattedTime,
  onRetry,
  onClose,
  backLabel,
}: GrammarResultViewProps) {
  const navigate = useNavigate();
  const score = result.accuracy_rate ?? 0;
  const isPassed = score >= 80;
  const isGood = score >= 50 && score < 80;
  const wrongCount = result.incorrect_count + result.skipped_count;

  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "WRONG" | "CORRECT">("ALL");
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(() => {
    const initial = new Set<number>();
    result.details
      .filter((d) => !d.is_correct)
      .slice(0, 3)
      .forEach((d) => initial.add(d.question_index));
    return initial;
  });

  const speakText = (text?: string, key?: string) => {
    if (!text || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;
    if (key) setPlayingKey(key);
    utterance.onend = () => setPlayingKey(null);
    utterance.onerror = () => setPlayingKey(null);
    window.speechSynthesis.speak(utterance);
  };

  const scoreColor = isPassed
    ? "text-emerald-600 dark:text-emerald-400"
    : isGood
    ? "text-amber-600 dark:text-amber-400"
    : "text-rose-600 dark:text-rose-400";

  const toggleExpand = (idx: number) => {
    setExpandedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const expandAll = () => {
    const all = new Set<number>();
    result.details.forEach((d) => all.add(d.question_index));
    setExpandedIndices(all);
  };

  const collapseAll = () => {
    setExpandedIndices(new Set());
  };

  const mistakesList = useMemo(
    () => result.details.filter((d) => !d.is_correct),
    [result.details]
  );

  const filteredQuestions = useMemo(() => {
    if (activeFilter === "WRONG") return result.details.filter((d) => !d.is_correct);
    if (activeFilter === "CORRECT") return result.details.filter((d) => d.is_correct);
    return result.details;
  }, [result.details, activeFilter]);

  const defaultTab = wrongCount > 0 ? "mistakes" : "all_questions";

  return (
    <main className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6">
      {/* Top Nav */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-text-secondary hover:text-text-primary transition cursor-pointer"
        >
          <ArrowLeft size={16} />
          {backLabel || "Về danh sách chủ đề"}
        </button>

        <div className="flex items-center gap-2">
          {isPassed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              <Sparkles size={12} className="text-emerald-500" />
              Đạt yêu cầu
            </span>
          )}
          {session.cefr_level && (
            <Badge variant="secondary" className="text-xs">
              CEFR {session.cefr_level}
            </Badge>
          )}
        </div>
      </div>

      {/* Hero Score Card (Promax Redesigned) */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Score Ring & Title */}
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 shrink-0 items-center justify-center">
              <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-surface-subtle"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className={`${
                    isPassed ? "stroke-emerald-500" : isGood ? "stroke-amber-500" : "stroke-rose-500"
                  } transition-all duration-1000 ease-out`}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 40}
                  strokeDashoffset={2 * Math.PI * 40 * (1 - score / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${scoreColor}`}>
                  {score}%
                </span>
                <span className="text-[10px] font-semibold text-text-tertiary uppercase">
                  Chính xác
                </span>
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary">
                  Luyện tập Ngữ pháp
                </span>
                {session.total_questions && (
                  <span className="text-xs text-text-secondary">
                    · {session.total_questions} câu trắc nghiệm
                  </span>
                )}
              </div>

              <h1 className="text-lg sm:text-2xl font-bold text-text-primary truncate">
                {session.topic_name_vi || session.topic_name_en}
              </h1>

              {session.topic_name_en && session.topic_name_vi && (
                <p className="text-xs sm:text-sm text-text-secondary truncate">{session.topic_name_en}</p>
              )}

              {/* Achievement Badge */}
              <div className="pt-0.5">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isPassed
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : isGood
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                  }`}
                >
                  <Sparkles size={13} />
                  <span>
                    {isPassed
                      ? "Xuất sắc • Nắm vững ngữ pháp"
                      : isGood
                      ? "Khá tốt • Cần rà soát một số bẫy"
                      : "Cần nỗ lực • Xem kỹ lại quy tắc"}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2.5 sm:self-center">
            <Button
              variant="outline"
              onClick={onRetry}
              className="flex-1 sm:flex-initial flex items-center gap-1.5 font-semibold text-xs sm:text-sm cursor-pointer"
            >
              <RotateCcw size={15} />
              Luyện lại
            </Button>
            {wrongCount > 0 && (
              <Button
                variant="outline"
                onClick={() => navigate("/practice/mistakes")}
                className="flex-1 sm:flex-initial flex items-center gap-1.5 text-warning border-warning/40 hover:bg-warning/10 font-semibold text-xs sm:text-sm cursor-pointer"
              >
                <BookOpen size={15} />
                Ôn lỗi sai (SRS)
              </Button>
            )}
            <Button
              onClick={onClose}
              className="flex-1 sm:flex-initial flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-sm font-bold text-xs sm:text-sm cursor-pointer"
            >
              Hoàn tất
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Motivational / Performance Feedback Snippet */}
        <div className="mt-5 rounded-2xl border border-border/80 bg-surface-subtle/50 p-4 text-xs sm:text-sm text-text-secondary">
          <p className="leading-relaxed">
            <span className="font-bold text-text-primary mr-1">
              {isPassed ? "🎉 Đánh giá:" : "💡 Lời khuyên:"}
            </span>
            {isPassed
              ? "Bạn đã nắm rất vững cấu trúc và cách áp dụng chủ điểm ngữ pháp này! Hãy duy trì phong độ và chuyển sang các bài nâng cao."
              : isGood
              ? "Kết quả khá tốt! Bạn chỉ nhầm lẫn ở một số câu đặc biệt hoặc ngoại lệ. Hãy xem lại giải thích câu sai ở tab bên dưới."
              : "Chủ điểm này còn một số điểm bạn chưa nắm chắc. Hãy dành thời gian xem kỹ giải thích và luyện tập lại để nâng cao độ chính xác."}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 mt-5 border-t border-border/60">
          <div className="rounded-2xl bg-surface border border-border/80 p-3.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-secondary font-semibold">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Số câu đúng</span>
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {result.correct_count}
              <span className="text-xs font-normal text-text-tertiary"> / {result.total_questions}</span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border/80 p-3.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-secondary font-semibold">
              <XCircle size={15} className="text-rose-500" />
              <span>Chưa đúng</span>
            </div>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
              {wrongCount}
              <span className="text-xs font-normal text-text-tertiary"> câu</span>
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border/80 p-3.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-secondary font-semibold">
              <Clock size={15} className="text-indigo-500" />
              <span>Thời gian</span>
            </div>
            <div className="text-xl font-bold text-text-primary mt-1">
              {formattedTime}
            </div>
          </div>

          <div className="rounded-2xl bg-surface border border-border/80 p-3.5 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-text-secondary font-semibold">
              <Award size={15} className="text-amber-500" />
              <span>Độ chính xác</span>
            </div>
            <div className="text-xl font-bold text-text-primary mt-1">
              {score}%
            </div>
          </div>
        </div>
      </section>

      {/* SRS Mistake Sync Banner */}
      {wrongCount > 0 && (
        <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-warning/30 bg-warning/5 p-3.5 text-xs sm:text-sm">
          <div className="space-y-0.5">
            <p className="font-semibold text-text-primary flex items-center gap-1.5">
              <Award size={15} className="text-warning shrink-0" />
              Đã tự động lưu {wrongCount} câu sai vào Sổ tay lỗi sai SRS
            </p>
            <p className="text-text-secondary text-xs">
              Các câu này sẽ được hệ thống lên lịch ôn tập ngắt quãng (Spaced Repetition) để giúp bạn khắc sâu kiến thức lâu dài.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/practice/mistakes")}
            className="shrink-0 text-xs text-warning border-warning/40 hover:bg-warning/10"
          >
            Mở Sổ tay lỗi sai
          </Button>
        </section>
      )}

      {/* Main Tabbed Interactive Workspace */}
      <Tabs defaultValue={defaultTab} className="w-full space-y-4">
        {/* Tab Triggers */}
        <div className="overflow-x-auto pb-1">
          <TabsList className="inline-flex h-11 w-full sm:w-auto p-1 bg-surface border border-border rounded-xl">
            <TabsTrigger
              value="mistakes"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <AlertTriangle size={15} />
              <span>Câu sai & Giải thích</span>
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
              value="all_questions"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <FileText size={15} />
              <span>Toàn bộ câu hỏi</span>
              <span className="ml-1 rounded-full bg-surface-subtle px-1.5 py-0.2 text-[11px] text-text-secondary">
                {result.total_questions}
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="review_srs"
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition"
            >
              <Layers size={15} />
              <span>Củng cố & Lộ trình</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: Mistakes & Explanations */}
        <TabsContent value="mistakes" className="space-y-4 outline-none">
          {wrongCount === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-8 text-center">
              <CheckCircle2 size={42} className="text-emerald-500 mb-3" />
              <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                Xuất sắc! Bạn không làm sai câu nào 🎉
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-text-secondary max-w-md">
                Bạn đã làm đúng toàn bộ {result.total_questions} câu hỏi ngữ pháp. Bạn có thể xem lại toàn bộ câu hỏi ở tab bên cạnh hoặc chuyển sang chủ đề tiếp theo.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Hiển thị {mistakesList.length} câu cần lưu ý để cải thiện</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={expandAll}
                    className="hover:text-text-primary transition cursor-pointer"
                  >
                    Mở rộng tất cả
                  </button>
                  <span>·</span>
                  <button
                    type="button"
                    onClick={collapseAll}
                    className="hover:text-text-primary transition cursor-pointer"
                  >
                    Thu gọn tất cả
                  </button>
                </div>
              </div>

              {mistakesList.map((detail) => {
                const isExpanded = expandedIndices.has(detail.question_index);
                const qText = detail.question_text_en || session.questions[detail.question_index]?.question_text_en || "";
                const qKey = `gm_${detail.question_index}`;

                return (
                  <article
                    key={detail.question_index}
                    className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                      isExpanded
                        ? "border-rose-200/90 dark:border-rose-900/50 bg-surface"
                        : "border-border/80 bg-surface hover:border-border"
                    }`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(detail.question_index)}
                      className="flex cursor-pointer items-center justify-between px-5 py-3.5 bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/30"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-text-primary">
                          Câu {detail.question_index + 1}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200">
                          <XCircle size={13} strokeWidth={2.5} />
                          <span>Chưa đúng</span>
                        </span>
                        <span className="text-text-secondary ml-1">
                          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 space-y-4">
                      {/* Question Text + Speak Button */}
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                          {qText}
                        </h4>
                        <button
                          type="button"
                          onClick={() => speakText(qText, qKey)}
                          className="p-1.5 rounded-lg text-text-tertiary hover:text-primary hover:bg-surface-subtle transition-colors shrink-0 cursor-pointer"
                          title="Nghe phát âm câu hỏi"
                        >
                          <Volume2 size={16} className={playingKey === qKey ? "text-primary animate-pulse" : ""} />
                        </button>
                      </div>

                      {/* Answers Comparison - Old compact inline UI as requested */}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm">
                        <span className="text-text-secondary font-medium">Đáp án của bạn:</span>
                        <span className="line-through decoration-rose-400 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded font-medium">
                          {detail.user_answer || "(Bỏ qua)"}
                        </span>
                        <span className="text-text-secondary">➔</span>
                        <span className="text-text-secondary font-medium">Đáp án đúng:</span>
                        <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-bold">
                          {detail.correct_answer}
                        </span>
                      </div>

                      {/* Explanation Callout */}
                      {(detail.explanation_vi || detail.explanation) && (
                        <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 space-y-1">
                          <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                            <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />
                            <span>Quy tắc ngữ pháp & Giải thích chi tiết:</span>
                          </span>
                          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                            {detail.explanation_vi || detail.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: All Questions */}
        <TabsContent value="all_questions" className="space-y-4 outline-none">
          {/* Question Navigator Strip */}
          <div className="rounded-xl border border-border bg-surface p-3 space-y-2">
            <span className="text-xs font-semibold text-text-secondary">
              Danh sách câu hỏi:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {result.details.map((d) => (
                <button
                  key={d.question_index}
                  type="button"
                  onClick={() => toggleExpand(d.question_index)}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold transition cursor-pointer ${
                    d.is_correct
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-200"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 hover:bg-rose-200"
                  }`}
                >
                  {d.question_index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 border-b border-border/60 pb-3 text-xs">
            <button
              type="button"
              onClick={() => setActiveFilter("ALL")}
              className={`rounded-full px-3 py-1 font-semibold transition cursor-pointer ${
                activeFilter === "ALL"
                  ? "bg-primary text-white"
                  : "bg-surface-subtle text-text-secondary hover:text-text-primary"
              }`}
            >
              Tất cả ({result.total_questions})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("WRONG")}
              className={`rounded-full px-3 py-1 font-semibold transition cursor-pointer ${
                activeFilter === "WRONG"
                  ? "bg-rose-600 text-white"
                  : "bg-surface-subtle text-text-secondary hover:text-text-primary"
              }`}
            >
              Câu sai ({wrongCount})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter("CORRECT")}
              className={`rounded-full px-3 py-1 font-semibold transition cursor-pointer ${
                activeFilter === "CORRECT"
                  ? "bg-emerald-600 text-white"
                  : "bg-surface-subtle text-text-secondary hover:text-text-primary"
              }`}
            >
              Câu đúng ({result.correct_count})
            </button>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {filteredQuestions.map((detail) => {
              const isExpanded = expandedIndices.has(detail.question_index);
              const qText = detail.question_text_en || session.questions[detail.question_index]?.question_text_en || "";
              const qKey = `ga_${detail.question_index}`;

              return (
                <article
                  key={detail.question_index}
                  className={`rounded-2xl border transition-all duration-200 overflow-hidden shadow-2xs ${
                    detail.is_correct
                      ? "border-emerald-200/80 dark:border-emerald-900/40 bg-surface"
                      : "border-rose-200/90 dark:border-rose-900/50 bg-surface"
                  }`}
                >
                  <div
                    onClick={() => toggleExpand(detail.question_index)}
                    className={`flex cursor-pointer items-center justify-between px-5 py-3.5 border-b ${
                      detail.is_correct
                        ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
                        : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-text-primary">
                        Câu {detail.question_index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {detail.is_correct ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                          <Check size={13} strokeWidth={3} />
                          <span>Đúng</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-200">
                          <XCircle size={13} strokeWidth={2.5} />
                          <span>Chưa đúng</span>
                        </span>
                      )}
                      <span className="text-text-secondary ml-1">
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-4">
                    {/* Question Text + Speak Button */}
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-sm sm:text-base font-bold text-text-primary leading-snug">
                        {qText}
                      </h4>
                      <button
                        type="button"
                        onClick={() => speakText(qText, qKey)}
                        className="p-1.5 rounded-lg text-text-tertiary hover:text-primary hover:bg-surface-subtle transition-colors shrink-0 cursor-pointer"
                        title="Nghe phát âm câu hỏi"
                      >
                        <Volume2 size={16} className={playingKey === qKey ? "text-primary animate-pulse" : ""} />
                      </button>
                    </div>

                    {/* Answers Comparison - Old compact inline UI as requested */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm">
                      <span className="text-text-secondary font-medium">Đáp án của bạn:</span>
                      <span
                        className={`px-2 py-0.5 rounded font-medium ${
                          detail.is_correct
                            ? "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40"
                            : "line-through decoration-rose-400 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40"
                        }`}
                      >
                        {detail.user_answer || "(Bỏ qua)"}
                      </span>
                      {!detail.is_correct && (
                        <>
                          <span className="text-text-secondary">➔</span>
                          <span className="text-text-secondary font-medium">Đáp án đúng:</span>
                          <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-bold">
                            {detail.correct_answer}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Explanation */}
                    {(detail.explanation_vi || detail.explanation) && (
                      <div className="rounded-xl border border-blue-200/80 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 space-y-1">
                        <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                          <BookOpen size={14} className="text-blue-600 dark:text-blue-400" />
                          <span>Quy tắc ngữ pháp & Giải thích:</span>
                        </span>
                        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                          {detail.explanation_vi || detail.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </TabsContent>

        {/* Tab 3: Mastery & Roadmap */}
        <TabsContent value="review_srs" className="space-y-4 outline-none">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <Layers size={16} className="text-primary" />
                Mức độ thành thạo chủ đề
              </h3>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Tỷ lệ chính xác</span>
                  <span className="font-bold text-text-primary">{result.accuracy_rate}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPassed ? "bg-emerald-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${result.accuracy_rate}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                {isPassed
                  ? "Bạn đã đạt chuẩn hoàn thành chủ đề này. Các bài tập ôn tập ngắt quãng sẽ tiếp tục nhắc nhở để tránh quên."
                  : "Chủ đề này cần thêm thời gian củng cố. Hãy ôn tập lại các câu sai trong Sổ tay lỗi sai."}
              </p>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
                <BookOpen size={16} className="text-primary" />
                Hành động tiếp theo
              </h3>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li className="flex items-start gap-1.5">
                  <Check size={14} className="text-primary mt-0.5 shrink-0" />
                  <span>Ôn lại các câu sai trong Sổ tay với thuật toán lặp lại ngắt quãng (SRS).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <Check size={14} className="text-primary mt-0.5 shrink-0" />
                  <span>Xem lại bảng lý thuyết và ví dụ minh họa của chủ điểm ngữ pháp này.</span>
                </li>
              </ul>
              <div className="pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate("/practice/mistakes")}
                  className="w-full text-xs"
                >
                  Mở Sổ tay lỗi sai SRS
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky Action Footer */}
      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 pt-4">
        <Button variant="outline" size="sm" onClick={onClose}>
          {backLabel || "Về danh sách chủ đề"}
        </Button>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={onRetry} className="flex items-center gap-1.5">
            <RotateCcw size={14} />
            Luyện tập lại
          </Button>
          {wrongCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/practice/mistakes")}
              className="flex items-center gap-1.5 text-warning border-warning/40 hover:bg-warning/10"
            >
              <BookOpen size={14} />
              Ôn câu sai (SRS)
            </Button>
          )}
          <Button
            size="sm"
            onClick={onClose}
            className="flex items-center gap-1.5 bg-primary hover:bg-primary-hover text-white shadow-sm"
          >
            Hoàn tất & Quay về
            <ChevronRight size={15} />
          </Button>
        </div>
      </section>
    </main>
  );
}
