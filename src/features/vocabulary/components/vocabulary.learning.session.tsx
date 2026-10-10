"use client";

/**
 * @file vocabulary.learning.session.tsx
 * @description Interactive Adaptive Learning Engine Runner (Hỗ trợ 6 chế độ học, Server-side Grading, Typo Feedback)
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  X,
  ChevronDown,
  Brain,
  Check,
  Layers,
  CheckSquare,
  RotateCcw,
  Keyboard,
  Headphones,
  FileText,
  Volume2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Timer,
  Bookmark,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/card";
import { Button } from "@/components/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import type {
  VocabularyDeck,
  ExerciseMode,
  LearningResult,
} from "@/features/vocabulary/types/vocabulary.learn";
import { vocabularyService } from "@/features/vocabulary/services/vocabulary.service";
import { speakWord } from "@/features/practice/lib/audio.utils";
import { resolveAudioUrl } from "@/utils/media.utils";
import { PracticeExitConfirmModal } from "@/features/practice/components/practice.exit-confirm.modal";

interface VocabularyLearningSessionProps {
  deck?: VocabularyDeck;
  sourceType?: "DECK" | "TOPIC" | "WRONG_WORDS" | "DUE_SRS";
  sourceId?: string;
  sessionMode?: string;
  sessionType?: "LEARN_NEW" | "REVIEW";
  onComplete: (result: LearningResult) => void;
  onExit: () => void;
  onAction?: (message: string) => void;
}

interface QuestionPrompt {
  word?: string;
  part_of_speech?: string;
  ipa?: string;
  meaning_vi?: string;
  audio_url?: string;
  audio_url_us?: string;
  audio_url_uk?: string;
  examples?: Array<{ e: string; v: string }>;
  first_letter_hint?: string;
  word_length?: number;
  context_sentence_en?: string;
  context_sentence_vi?: string;
}

interface QuestionOption {
  id: string;
  text: string;
  word?: string;
  meaning_vi?: string;
}

interface FeedbackState {
  result: "CORRECT" | "NEAR_CORRECT" | "INCORRECT";
  is_correct: boolean;
  is_near_correct: boolean;
  correct_answer: string;
  meaning_vi?: string;
  message?: string;
}

export function VocabularyLearningSession({
  deck,
  sourceType = "DECK",
  sourceId,
  sessionMode = "SMART_ADAPTIVE",
  sessionType,
  onComplete,
  onExit,
  onAction,
}: VocabularyLearningSessionProps) {
  const { i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>(sessionMode);
  const [showModeMenu, setShowModeMenu] = useState(false);

  // Current Question Data
  const [currentQuestion, setCurrentQuestion] = useState<{
    lexical_item_id: string;
    mode: string;
    prompt: QuestionPrompt;
    options?: QuestionOption[];
    progress?: {
      resolved: number;
      total: number;
      current_index?: number;
      is_relearning?: boolean;
      unresolved_count?: number;
    };
  } | null>(null);

  // Input states
  const [userInput, setUserInput] = useState("");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  // Session Statistics tracking
  const [resolvedCount, setResolvedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(deck?.cardCount || 10);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isRelearning, setIsRelearning] = useState(false);
  const [wrongItems, setWrongItems] = useState<any[]>([]);
  const [correctStreak, setCorrectStreak] = useState(0);

  const user = useAuthStore((state) => state.user);
  const userId = user?.user_id || (user as any)?._id || (user as any)?.id || "";

  // Saved word tracking
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<"us" | "uk" | null>(null);

  // Bộ đếm thời gian học Flashcard theo thời gian thực (Stopwatch)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const pauseStartRef = useRef<number | null>(null);

  useEffect(() => {
    if (showExitConfirm) return;
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [showExitConfirm]);

  const handleInitiateExit = () => {
    pauseStartRef.current = Date.now();
    setShowExitConfirm(true);
  };

  const handleResume = () => {
    if (pauseStartRef.current) {
      const pausedDuration = Date.now() - pauseStartRef.current;
      startTimeRef.current += pausedDuration;
      pauseStartRef.current = null;
    }
    setShowExitConfirm(false);
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    pauseStartRef.current = null;
    onExit();
  };

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // 1. Khởi tạo phiên học từ Backend Learning Engine
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      setIsLoading(true);
      try {
        const resolvedSourceId = sourceId || (deck ? deck.id : undefined);
        const res = await vocabularyService.startLearningSession({
          source_type: sourceType,
          source_id: resolvedSourceId,
          session_mode: selectedMode,
          session_type: sessionType,
        });

        if (!isMounted) return;
        setSessionId(res.session_id);
        setTotalCount(res.total_items);

        // Tải câu hỏi đầu tiên
        await fetchNextQuestion(res.session_id);
      } catch (err: unknown) {
        console.error("Không thể khởi tạo phiên học:", err);
        onAction?.(
          isVietnamese
            ? "Không thể bắt đầu phiên học, vui lòng thử lại sau."
            : "Failed to start session."
        );
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, [sourceType, sourceId, deck?.id]);

  // 2. Kéo câu hỏi tiếp theo từ Adaptive Engine
  const fetchNextQuestion = async (
    activeSessionId: string,
    requestedMode?: string,
    targetVocabId?: string
  ) => {
    setIsLoading(true);
    setFeedback(null);
    setUserInput("");
    setSelectedOptionId(null);
    setIsFlipped(false);
    startTimeRef.current = Date.now();

    try {
      const modeParam =
        requestedMode !== undefined
          ? requestedMode !== "SMART_ADAPTIVE"
            ? requestedMode
            : undefined
          : selectedMode !== "SMART_ADAPTIVE"
          ? selectedMode
          : undefined;

      const q = await vocabularyService.getNextLearningQuestion(
        activeSessionId,
        modeParam,
        targetVocabId
      );

      if (q.is_completed) {
        // Đã hoàn thành toàn bộ câu hỏi trong phiên
        await handleFinishSession(activeSessionId);
        return;
      }

      setCurrentQuestion({
        lexical_item_id: q.lexical_item_id || "",
        mode: q.mode || "FLASHCARD",
        prompt: q.prompt || {},
        options: q.options || [],
        progress: q.progress,
      });

      if (q.progress) {
        setResolvedCount(q.progress.resolved);
        setTotalCount(q.progress.total);
        if (q.progress.current_index !== undefined) {
          setCurrentIndex(q.progress.current_index);
        }
        if (q.progress.is_relearning !== undefined) {
          setIsRelearning(Boolean(q.progress.is_relearning));
        }
      }
    } catch (err: unknown) {
      console.error("Lỗi khi tải câu hỏi kế tiếp:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Hoàn thành phiên và chốt dữ liệu
  const handleFinishSession = async (activeSessionId: string) => {
    try {
      const summary = await vocabularyService.completeLearningSession(
        activeSessionId
      );

      const totalWords = Math.max(1, summary.total_words || 1);
      const correctAnswers = Math.min(totalWords, Math.max(0, summary.correct_count ?? 0));
      const accuracy = Math.min(100, Math.max(0, summary.accuracy_percent ?? 0));

      const learningResult: LearningResult = {
        totalWords,
        correctAnswers,
        accuracy,
        skillBreakdown: {
          meaning: accuracy,
          spelling: Math.max(60, accuracy - 5),
          listening: Math.max(65, accuracy - 3),
          context: accuracy,
        },
        weakWords: wrongItems,
      };

      onAction?.(
        isVietnamese
          ? `Hoàn thành! Bạn đạt ${summary.accuracy_percent}% độ chính xác (+${summary.xp_earned} XP).`
          : `Session completed! (+${summary.xp_earned} XP)`
      );

      onComplete(learningResult);
    } catch (err: unknown) {
      console.error("Lỗi khi chốt phiên học:", err);
      onExit();
    }
  };

  // 4. Nộp câu trả lời để Server tự đánh giá
  const handleSubmitAnswer = async (answerRaw: string) => {
    if (!sessionId || !currentQuestion || isSubmitting || feedback) return;

    setIsSubmitting(true);
    const timeSpent = Math.max(
      1,
      Math.round((Date.now() - startTimeRef.current) / 1000)
    );

    try {
      const result = await vocabularyService.submitLearningAnswer(sessionId, {
        lexical_item_id: currentQuestion.lexical_item_id,
        mode: currentQuestion.mode,
        answer_raw: answerRaw,
        time_spent_seconds: timeSpent,
      });

      setFeedback(result);

      if (result.is_correct) {
        setCorrectStreak((prev) => prev + 1);
        setWrongItems((prev) =>
          prev.filter((item) => item.id !== currentQuestion.lexical_item_id)
        );
      } else {
        setCorrectStreak(0);
        // Ghi nhận vào danh sách từ yếu của phiên (tránh trùng lặp từ)
        setWrongItems((prev) => {
          if (prev.some((item) => item.id === currentQuestion.lexical_item_id)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: currentQuestion.lexical_item_id,
              word: (result as any).word || currentQuestion.prompt.word || result.correct_answer,
              meaningVi: result.meaning_vi || "",
            },
          ];
        });
      }

      if (result.progress) {
        setResolvedCount(result.progress.resolved);
      }
    } catch (err: unknown) {
      console.error("Lỗi khi nộp câu trả lời:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kiểm tra từ hiện tại đã được lưu vào sổ tay hay chưa
  useEffect(() => {
    let isMounted = true;
    async function checkSaved() {
      if (!currentQuestion?.lexical_item_id || !userId) {
        setIsSaved(false);
        return;
      }
      try {
        const saved = await vocabularyService.checkVocabularySaved(
          currentQuestion.lexical_item_id,
          0
        );
        if (isMounted) {
          setIsSaved(Boolean(saved));
        }
      } catch {
        if (isMounted) setIsSaved(false);
      }
    }
    checkSaved();
    return () => {
      isMounted = false;
    };
  }, [currentQuestion?.lexical_item_id, userId]);

  // Xử lý lưu / bỏ lưu từ vào kho từ vựng đã lưu (Sổ tay)
  const handleToggleSave = async () => {
    if (!currentQuestion?.lexical_item_id || !userId || isSaving) return;
    setIsSaving(true);
    const wordText = currentQuestion.prompt.word || "";
    try {
      if (isSaved) {
        await vocabularyService.unsaveVocabulary(
          userId,
          currentQuestion.lexical_item_id,
          0
        );
        setIsSaved(false);
        onAction?.(
          isVietnamese
            ? `Đã bỏ lưu từ "${wordText}"`
            : `Removed "${wordText}" from notebook`
        );
      } else {
        await vocabularyService.saveVocabulary(
          userId,
          currentQuestion.lexical_item_id,
          0
        );
        setIsSaved(true);
        onAction?.(
          isVietnamese
            ? `Đã lưu từ "${wordText}" vào kho từ vựng`
            : `Saved "${wordText}" to notebook`
        );
      }
    } catch (err: unknown) {
      console.error("Lỗi khi cập nhật kho từ đã lưu:", err);
      onAction?.(
        isVietnamese
          ? "Không thể cập nhật sổ tay lúc này."
          : "Failed to update saved vocabulary."
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý đánh dấu Thành thạo (Master) trực tiếp
  const handleMarkMastered = () => {
    handleSubmitAnswer("master");
  };

  // Lấy nhãn hiển thị cho từng chế độ học
  const getModeLabel = (m: string) => {
    switch (m) {
      case "SMART_ADAPTIVE":
        return isVietnamese ? "Thích ứng thông minh" : "Smart Adaptive";
      case "FLASHCARD_ONLY":
      case "FLASHCARD":
        return isVietnamese ? "Flashcard" : "Flashcard";
      case "QUIZ_ONLY":
      case "MULTIPLE_CHOICE":
        return isVietnamese ? "Trắc nghiệm" : "Multiple Choice";
      case "TYPE_ONLY":
      case "TYPE_WORD":
        return isVietnamese ? "Gõ từ" : "Type Word";
      case "LISTEN_ONLY":
      case "LISTEN_TYPE":
        return isVietnamese ? "Nghe & Gõ" : "Listen & Type";
      case "CONTEXT_ONLY":
      case "CONTEXT":
        return isVietnamese ? "Điền ngữ cảnh" : "Context Cloze";
      case "REVERSE":
        return isVietnamese ? "Đảo chiều" : "Reverse MC";
      default:
        return m;
    }
  };

  // Chuyển đổi linh hoạt chế độ học trong phiên
  const handleSelectMode = async (newMode: string) => {
    setSelectedMode(newMode);
    setShowModeMenu(false);

    // Nếu đang ở câu hỏi hiện tại chưa nộp đáp án, lập tức chuyển đổi câu hỏi hiện tại sang mode mới
    if (sessionId && currentQuestion && !feedback) {
      await fetchNextQuestion(sessionId, newMode, currentQuestion.lexical_item_id);
    }

    onAction?.(
      isVietnamese
        ? `Đã chuyển sang: ${getModeLabel(newMode)}`
        : `Switched to: ${getModeLabel(newMode)}`
    );
  };

  // Chuyển sang câu hỏi kế tiếp
  const handleNext = () => {
    if (sessionId) {
      fetchNextQuestion(sessionId);
    }
  };

  // Phát âm thanh hỗ trợ 2 giọng US và UK (Cơ chế Hybrid: R2 First + Web Speech Fallback + Tự động sinh bù file bằng Piper TTS)
  const handlePlayAudio = (type: "us" | "uk" = "us") => {
    setIsPlayingAudio(type);
    const wordText = currentQuestion?.prompt?.word || "";
    const rawAudioUrl =
      type === "us"
        ? (currentQuestion?.prompt?.audio_url_us || currentQuestion?.prompt?.audio_url)
        : (currentQuestion?.prompt?.audio_url_uk || (currentQuestion?.prompt?.audio_url?.includes('/uk/') || currentQuestion?.prompt?.audio_url?.includes('en-UK') ? currentQuestion?.prompt?.audio_url : undefined));

    const fallbackAndAutoGenerate = () => {
      // 1. Phát âm thanh ngay lập tức bằng Web Speech TTS để học viên không bị trễ
      if (wordText) {
        speakWord(wordText, 0.9, type === "uk" ? "en-GB" : "en-US");
      }

      // 2. Tự động gọi backend Edge TTS sinh file MP3 và upload bù lên Cloudflare R2
      if (wordText) {
        const levelMatch = rawAudioUrl?.match(/\/(A1|A2|B1|B2|C1|C2)\//i);
        const cefrLevel = levelMatch ? levelMatch[1].toUpperCase() : ((currentQuestion?.prompt as any)?.cefr_level || "B1");

        vocabularyService
          .autoGenerateAudio({
            lexical_item_id: currentQuestion?.lexical_item_id,
            word: wordText,
            accent: type,
            cefr_level: cefrLevel,
          })
          .then((res) => {
            if (res.success && currentQuestion?.prompt) {
              if (res.audio_url_us) {
                currentQuestion.prompt.audio_url_us = res.audio_url_us;
              }
              if (res.audio_url_uk) {
                currentQuestion.prompt.audio_url_uk = res.audio_url_uk;
              }
              const targetUrl = type === "us" ? res.audio_url_us : res.audio_url_uk;
              if (targetUrl) {
                if (type === "us") {
                  currentQuestion.prompt.audio_url = res.audio_url_us;
                } else {
                  currentQuestion.prompt.audio_url = res.audio_url_uk;
                }
                // Tự động phát ngay âm thanh vừa sinh thành công trên R2
                setIsPlayingAudio(type);
                const genAudio = new Audio(resolveAudioUrl(targetUrl));
                genAudio.onended = () => setIsPlayingAudio(null);
                genAudio.play().catch(() => {});
              }
            }
          })
          .catch(() => {});
      }
    };

    if (rawAudioUrl) {
      const resolved = resolveAudioUrl(rawAudioUrl);
      if (resolved) {
        const audio = new Audio(resolved);
        let hasFailed = false;
        audio.onerror = () => {
          if (!hasFailed) {
            hasFailed = true;
            fallbackAndAutoGenerate();
          }
        };
        audio.play().catch(() => {
          if (!hasFailed) {
            hasFailed = true;
            fallbackAndAutoGenerate();
          }
        });
      } else {
        fallbackAndAutoGenerate();
      }
    } else {
      fallbackAndAutoGenerate();
    }

    setTimeout(() => setIsPlayingAudio(null), 1200);
  };

  const getInputFeedbackClass = () => {
    if (!feedback) return "border-border focus:border-primary text-text-primary";
    if (feedback.result === "CORRECT")
      return "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200";
    if (feedback.result === "NEAR_CORRECT")
      return "border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-200";
    return "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-200";
  };

  const displayCardNumber = Math.min(Math.max(1, currentIndex), totalCount);
  const progressPercent =
    totalCount > 0
      ? Math.min(100, Math.round((displayCardNumber / totalCount) * 100))
      : 0;

  if (isLoading && !currentQuestion) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-[14px] font-semibold text-text-secondary">
          {isVietnamese
            ? "Đang chuẩn bị câu hỏi thích ứng..."
            : "Preparing adaptive question..."}
        </p>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const { mode, prompt, options = [] } = currentQuestion;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7">
      {/* HEADER: Thoát, Tiến độ, Chế độ */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={handleInitiateExit}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary hover:bg-surface-hover cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-extrabold text-text-primary tracking-tight">
              {mode === "FLASHCARD"
                ? isVietnamese
                  ? `Thẻ ${displayCardNumber} / ${totalCount}`
                  : `Card ${displayCardNumber} / ${totalCount}`
                : isVietnamese
                ? `Câu ${displayCardNumber} / ${totalCount}`
                : `Question ${displayCardNumber} / ${totalCount}`}
            </span>

            {/* Huy hiệu số từ đã thuộc trong phiên */}
            <span
              className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
              title={isVietnamese ? "Số từ đã thuộc trong phiên" : "Mastered in session"}
            >
              <Check size={12} className="stroke-[2.5]" />
              <span>{resolvedCount}</span>
            </span>

            {/* Huy hiệu vòng ôn lại thẻ chưa thuộc */}
            {isRelearning && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 border border-amber-500/20"
                title={isVietnamese ? "Đang ôn lại thẻ chưa thuộc" : "Relearning weak cards"}
              >
                <RotateCcw size={11} className="stroke-[2.5]" />
                <span>{isVietnamese ? "Ôn lại" : "Review"}</span>
              </span>
            )}
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModeMenu(!showModeMenu)}
              className="flex items-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition px-3 py-1 text-[12px] font-bold text-primary cursor-pointer border border-primary/20"
              title={isVietnamese ? "Nhấn để đổi chế độ học" : "Click to switch learning mode"}
            >
              <Brain size={14} />
              <span>{getModeLabel(mode)}</span>
              <ChevronDown
                size={13}
                className={`transition-transform duration-200 ${
                  showModeMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showModeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowModeMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-border bg-surface p-2 shadow-xl z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1.5 text-[11px] font-extrabold text-text-tertiary uppercase tracking-wider">
                    {isVietnamese ? "Chọn chế độ học" : "Select Mode"}
                  </div>
                  <div className="space-y-1">
                    {[
                      {
                        id: "SMART_ADAPTIVE",
                        icon: "🧠",
                        vi: "Thích ứng thông minh",
                        en: "Smart Adaptive",
                      },
                      {
                        id: "FLASHCARD_ONLY",
                        icon: "🗂️",
                        vi: "Học thẻ (Flashcard)",
                        en: "Flashcard Only",
                      },
                      {
                        id: "QUIZ_ONLY",
                        icon: "📝",
                        vi: "Trắc nghiệm",
                        en: "Multiple Choice",
                      },
                      {
                        id: "TYPE_ONLY",
                        icon: "⌨️",
                        vi: "Gõ từ vựng",
                        en: "Type Word",
                      },
                      {
                        id: "LISTEN_ONLY",
                        icon: "🎧",
                        vi: "Nghe & Gõ",
                        en: "Listen & Type",
                      },
                      {
                        id: "CONTEXT_ONLY",
                        icon: "📖",
                        vi: "Điền ngữ cảnh",
                        en: "Context Cloze",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectMode(opt.id)}
                        className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[13px] font-semibold transition ${
                          selectedMode === opt.id
                            ? "bg-primary text-white font-bold"
                            : "text-text-primary hover:bg-surface-hover"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{isVietnamese ? opt.vi : opt.en}</span>
                        </span>
                        {selectedMode === opt.id && (
                          <Check size={14} className="stroke-[3]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* BỘ ĐẾM THỜI GIAN HỌC FLASHCARD */}
        <div
          title={isVietnamese ? "Thời gian học phiên này" : "Session study timer"}
          className="flex items-center gap-1.5 rounded-xl bg-primary/10 px-3 py-1.5 font-mono text-[13px] font-bold text-primary shadow-sm"
        >
          <Timer size={14} className="animate-pulse" />
          <span>{formatTimer(elapsedSeconds)}</span>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* CARD MAIN WORKSPACE */}
      <Card className="dashboard-card border-border/80 shadow-md">
        <CardContent className="p-6 sm:p-8">
          {/* ==================== 1. MODE: FLASHCARD ==================== */}
          {mode === "FLASHCARD" && (
            <div className="flex flex-col items-center">
              <div
                className="relative mb-6 h-[260px] w-full cursor-pointer perspective-1000 sm:h-[300px]"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div
                  className={`relative h-full w-full transition-transform duration-500 ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front Side */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <span className="mb-2 rounded-full bg-primary/15 px-3 py-1 text-[12px] font-bold text-primary">
                      {prompt.part_of_speech}
                    </span>
                    <h2 className="text-[36px] font-extrabold text-text-primary sm:text-[42px]">
                      {prompt.word}
                    </h2>
                    {prompt.ipa && (
                      <p className="mt-2 font-mono text-[16px] text-text-secondary">
                        {prompt.ipa}
                      </p>
                    )}

                    {/* US & UK Pronunciation Buttons */}
                    <div className="mt-4 flex items-center gap-2.5 sm:gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio("us");
                        }}
                        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-[13px] font-semibold transition active:scale-95 cursor-pointer ${
                          isPlayingAudio === "us"
                            ? "border-primary bg-primary text-white shadow-xs"
                            : "border-border bg-surface-subtle text-text-primary hover:bg-surface-hover hover:border-text-tertiary"
                        }`}
                        title={isVietnamese ? "Phát âm tiếng Anh - Mỹ (en-US)" : "Play en-US pronunciation"}
                      >
                        <Volume2 size={16} className={isPlayingAudio === "us" ? "animate-pulse" : ""} />
                        <span>en-US</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayAudio("uk");
                        }}
                        className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-[13px] font-semibold transition active:scale-95 cursor-pointer ${
                          isPlayingAudio === "uk"
                            ? "border-primary bg-primary text-white shadow-xs"
                            : "border-border bg-surface-subtle text-text-primary hover:bg-surface-hover hover:border-text-tertiary"
                        }`}
                        title={isVietnamese ? "Phát âm tiếng Anh - Anh (en-UK)" : "Play en-UK pronunciation"}
                      >
                        <Volume2 size={16} className={isPlayingAudio === "uk" ? "animate-pulse" : ""} />
                        <span>en-UK</span>
                      </button>
                    </div>
                    <p className="mt-5 text-[11px] font-medium text-text-tertiary">
                      {isVietnamese ? "Nhấn để lật xem nghĩa" : "Tap to flip"}
                    </p>
                  </div>

                  {/* Back Side */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 border-primary bg-surface p-6 shadow-sm"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    <span className="mb-2 text-[12px] font-semibold text-text-tertiary">
                      {isVietnamese ? "Nghĩa tiếng Việt" : "Vietnamese Meaning"}
                    </span>
                    <h2 className="text-[26px] font-extrabold text-primary sm:text-[30px] text-center">
                      {prompt.meaning_vi}
                    </h2>
                    {prompt.examples && prompt.examples.length > 0 && (
                      <div className="mt-4 max-w-full text-center rounded-xl bg-surface-subtle p-3">
                        <p className="text-[13px] italic text-text-primary">
                          {prompt.examples[0].e}
                        </p>
                        <p className="mt-1 text-[12px] text-text-secondary">
                          {prompt.examples[0].v}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Flashcard 4 Self-Rating Buttons & Master/Save */}
              {!feedback ? (
                <div className="w-full flex flex-col gap-3.5">
                  <div className="grid w-full grid-cols-4 gap-2.5 sm:gap-3">
                    {/* 1. HỌC LẠI */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitAnswer("again")}
                      className="flex h-[68px] sm:h-[72px] flex-col items-center justify-center rounded-2xl border-2 border-rose-300 bg-rose-50/90 text-rose-800 shadow-xs transition hover:bg-rose-100 hover:border-rose-400 active:scale-95 disabled:opacity-50 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
                    >
                      <span className="text-[14px] sm:text-[15px] font-extrabold uppercase tracking-wide">
                        {isVietnamese ? "Học lại" : "Again"}
                      </span>
                      <span className="mt-0.5 text-[11px] sm:text-[12px] font-semibold text-rose-600/90 dark:text-rose-300/80">
                        {isVietnamese ? "10 phút" : "10 mins"}
                      </span>
                    </button>

                    {/* 2. KHÓ */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitAnswer("hard")}
                      className="flex h-[68px] sm:h-[72px] flex-col items-center justify-center rounded-2xl border-2 border-amber-300 bg-amber-50/90 text-amber-800 shadow-xs transition hover:bg-amber-100 hover:border-amber-400 active:scale-95 disabled:opacity-50 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200"
                    >
                      <span className="text-[14px] sm:text-[15px] font-extrabold uppercase tracking-wide">
                        {isVietnamese ? "Khó" : "Hard"}
                      </span>
                      <span className="mt-0.5 text-[11px] sm:text-[12px] font-semibold text-amber-600/90 dark:text-amber-300/80">
                        {isVietnamese ? "1-3 ngày" : "1-3 days"}
                      </span>
                    </button>

                    {/* 3. TỐT */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitAnswer("good")}
                      className="flex h-[68px] sm:h-[72px] flex-col items-center justify-center rounded-2xl border-2 border-emerald-300 bg-emerald-50/90 text-emerald-800 shadow-xs transition hover:bg-emerald-100 hover:border-emerald-400 active:scale-95 disabled:opacity-50 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-200"
                    >
                      <span className="text-[14px] sm:text-[15px] font-extrabold uppercase tracking-wide">
                        {isVietnamese ? "Tốt" : "Good"}
                      </span>
                      <span className="mt-0.5 text-[11px] sm:text-[12px] font-semibold text-emerald-600/90 dark:text-emerald-300/80">
                        {isVietnamese ? "1-4 ngày" : "1-4 days"}
                      </span>
                    </button>

                    {/* 4. DỄ */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleSubmitAnswer("easy")}
                      className="flex h-[68px] sm:h-[72px] flex-col items-center justify-center rounded-2xl border-2 border-blue-300 bg-blue-50/90 text-blue-800 shadow-xs transition hover:bg-blue-100 hover:border-blue-400 active:scale-95 disabled:opacity-50 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200"
                    >
                      <span className="text-[14px] sm:text-[15px] font-extrabold uppercase tracking-wide">
                        {isVietnamese ? "Dễ" : "Easy"}
                      </span>
                      <span className="mt-0.5 text-[11px] sm:text-[12px] font-semibold text-blue-600/90 dark:text-blue-300/80">
                        {isVietnamese ? "1-7 ngày" : "1-7 days"}
                      </span>
                    </button>
                  </div>

                  {/* Hàng phụ: Thành thạo & Lưu từ vựng */}
                  <div className="flex items-center justify-center gap-3 sm:gap-5 pt-1">
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={handleMarkMastered}
                      className="inline-flex items-center gap-2 rounded-xl border border-violet-300/80 bg-violet-50 px-4 py-2 text-[14px] font-bold text-violet-700 shadow-xs transition hover:bg-violet-100 hover:border-violet-400 active:scale-95 disabled:opacity-50 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-300 cursor-pointer"
                    >
                      <CheckCircle2 size={18} className="text-violet-600 dark:text-violet-400" />
                      <span>{isVietnamese ? "Thành thạo" : "Mastered"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={handleToggleSave}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[14px] font-bold shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer ${
                        isSaved
                          ? "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                          : "border-border bg-surface text-text-secondary hover:bg-surface-hover hover:text-text-primary"
                      }`}
                    >
                      <Bookmark
                        size={18}
                        className={isSaved ? "fill-amber-500 text-amber-500" : "text-text-tertiary"}
                      />
                      <span>
                        {isSaved
                          ? isVietnamese
                            ? "Đã lưu"
                            : "Saved"
                          : isVietnamese
                          ? "Lưu từ vựng"
                          : "Save word"}
                      </span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* ==================== 2. MODE: MULTIPLE CHOICE & REVERSE ==================== */}
          {(mode === "MULTIPLE_CHOICE" || mode === "REVERSE") && (
            <div className="flex flex-col items-center">
              <div className="mb-6 text-center">
                <span className="rounded-full bg-surface-subtle px-3 py-1 text-[11px] font-bold text-text-secondary uppercase">
                  {mode === "REVERSE"
                    ? isVietnamese
                      ? "Chọn từ tiếng Anh phù hợp"
                      : "Select matching English word"
                    : isVietnamese
                    ? "Chọn nghĩa tiếng Việt chính xác"
                    : "Select correct Vietnamese meaning"}
                </span>
                <h2 className="mt-3 text-[30px] font-extrabold text-text-primary">
                  {mode === "REVERSE" ? prompt.meaning_vi : prompt.word}
                </h2>
                {prompt.ipa && mode !== "REVERSE" && (
                  <p className="mt-1 font-mono text-[14px] text-text-secondary">
                    {prompt.ipa}
                  </p>
                )}
                <div className="mt-2.5 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handlePlayAudio("us")}
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-semibold transition-all cursor-pointer ${
                      isPlayingAudio === "us"
                        ? "border-primary bg-primary text-white shadow-xs"
                        : "border-border bg-surface-subtle text-text-primary hover:bg-surface-hover hover:border-text-tertiary"
                    }`}
                    title={isVietnamese ? "Phát âm en-US" : "Play en-US pronunciation"}
                  >
                    <Volume2 size={14} className={isPlayingAudio === "us" ? "animate-pulse" : ""} />
                    <span>en-US</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePlayAudio("uk")}
                    className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[12px] font-semibold transition-all cursor-pointer ${
                      isPlayingAudio === "uk"
                        ? "border-primary bg-primary text-white shadow-xs"
                        : "border-border bg-surface-subtle text-text-primary hover:bg-surface-hover hover:border-text-tertiary"
                    }`}
                    title={isVietnamese ? "Phát âm en-UK" : "Play en-UK pronunciation"}
                  >
                    <Volume2 size={14} className={isPlayingAudio === "uk" ? "animate-pulse" : ""} />
                    <span>en-UK</span>
                  </button>
                </div>
              </div>

              <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isCorrectOption = opt.id === currentQuestion.lexical_item_id;
                  const isWrongPick = isSelected && feedback && !feedback.is_correct;

                  let buttonStyle = "border-border bg-surface hover:border-primary/50 text-text-primary";
                  if (feedback) {
                    if (isCorrectOption) {
                      buttonStyle = "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold";
                    } else if (isWrongPick) {
                      buttonStyle = "border-rose-500 bg-rose-500/15 text-rose-700 dark:text-rose-300 font-bold";
                    } else {
                      buttonStyle = "border-border/60 bg-surface/50 text-text-tertiary opacity-40";
                    }
                  } else if (isSelected) {
                    buttonStyle = "border-primary bg-primary/10 text-primary";
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (!feedback && !isSubmitting) {
                          setSelectedOptionId(opt.id);
                          handleSubmitAnswer(opt.id);
                        }
                      }}
                      disabled={Boolean(feedback) || isSubmitting}
                      className={`flex items-center justify-between rounded-2xl border-2 p-4 text-left font-semibold transition-all shadow-sm ${buttonStyle}`}
                    >
                      <span className="text-[15px]">{opt.text}</span>
                      {feedback && isCorrectOption && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check size={14} />
                        </div>
                      )}
                      {feedback && isWrongPick && (
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white">
                          <X size={14} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ==================== 3. MODE: TYPE WORD ==================== */}
          {mode === "TYPE_WORD" && (
            <div className="flex flex-col items-center">
              <div className="mb-5 text-center">
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase">
                  {isVietnamese ? "Đánh từ tiếng Anh" : "Type the English word"}
                </span>
                <h2 className="mt-3 text-[26px] font-extrabold text-text-primary">
                  {prompt.meaning_vi}
                </h2>
                <div className="mt-2 flex items-center justify-center gap-2 text-[12px] text-text-tertiary">
                  <span>
                    {isVietnamese ? "Từ loại:" : "POS:"} {prompt.part_of_speech}
                  </span>
                  {prompt.first_letter_hint && (
                    <span>
                      • {isVietnamese ? "Bắt đầu bằng:" : "Starts with:"}{" "}
                      <strong>
                        {prompt.first_letter_hint.toUpperCase()}...
                      </strong>{" "}
                      ({prompt.word_length} {isVietnamese ? "ký tự" : "chars"})
                    </span>
                  )}
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (userInput.trim() && !feedback) {
                    handleSubmitAnswer(userInput);
                  }
                }}
                className="w-full max-w-md"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={Boolean(feedback) || isSubmitting}
                  autoFocus
                  placeholder={
                    isVietnamese
                      ? "Gõ từ tiếng Anh vào đây..."
                      : "Type English word here..."
                  }
                  className={`w-full rounded-2xl border-2 bg-surface p-4 text-center text-[22px] font-extrabold tracking-wider focus:outline-none transition shadow-inner ${getInputFeedbackClass()}`}
                />

                {!feedback && (
                  <Button
                    type="submit"
                    className="mt-4 w-full py-3 font-bold bg-primary hover:bg-primary-hover shadow-md rounded-xl"
                    disabled={!userInput.trim() || isSubmitting}
                  >
                    {isVietnamese ? "Kiểm tra" : "Check"}
                  </Button>
                )}
              </form>
            </div>
          )}

          {/* ==================== 4. MODE: LISTEN & TYPE ==================== */}
          {mode === "LISTEN_TYPE" && (
            <div className="flex flex-col items-center">
              <div className="mb-6 text-center">
                <span className="rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                  {isVietnamese ? "Nghe và chép chính tả" : "Listen & Type"}
                </span>
                <p className="mt-2 text-[13px] text-text-secondary">
                  {isVietnamese
                    ? "Nghe phát âm chuẩn và gõ lại từ bạn nghe được"
                    : "Listen carefully and type what you hear"}
                </p>

                <div className="mt-4 flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => handlePlayAudio("us")}
                    className={`flex flex-col items-center justify-center gap-1.5 h-16 w-24 rounded-2xl border transition transform active:scale-95 shadow-xs cursor-pointer ${
                      isPlayingAudio === "us"
                        ? "border-primary bg-primary text-white shadow-sm scale-105"
                        : "border-border bg-surface-subtle text-text-primary hover:bg-surface-hover hover:border-text-tertiary"
                    }`}
                    title={isVietnamese ? "Phát âm tiếng Anh - Mỹ (en-US)" : "Play en-US pronunciation"}
                  >
                    <Volume2 size={22} className={isPlayingAudio === "us" ? "animate-pulse" : ""} />
                    <span className="text-[12px] font-semibold">en-US</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlayAudio("uk")}
                    className={`flex flex-col items-center justify-center gap-1.5 h-16 w-24 rounded-2xl border transition transform active:scale-95 shadow-xs cursor-pointer ${
                      isPlayingAudio === "uk"
                        ? "border-primary bg-primary text-white shadow-sm scale-105"
                        : "border-border bg-surface-subtle text-text-primary hover:bg-surface-hover hover:border-text-tertiary"
                    }`}
                    title={isVietnamese ? "Phát âm tiếng Anh - Anh (en-UK)" : "Play en-UK pronunciation"}
                  >
                    <Volume2 size={22} className={isPlayingAudio === "uk" ? "animate-pulse" : ""} />
                    <span className="text-[12px] font-semibold">en-UK</span>
                  </button>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (userInput.trim() && !feedback) {
                    handleSubmitAnswer(userInput);
                  }
                }}
                className="w-full max-w-md"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={Boolean(feedback) || isSubmitting}
                  autoFocus
                  placeholder={
                    isVietnamese
                      ? "Nhập từ nghe được..."
                      : "Type what you hear..."
                  }
                  className={`w-full rounded-2xl border-2 bg-surface p-4 text-center text-[22px] font-extrabold tracking-wider focus:outline-none transition shadow-inner ${getInputFeedbackClass()}`}
                />

                {!feedback && (
                  <Button
                    type="submit"
                    className="mt-4 w-full py-3 font-bold bg-primary hover:bg-primary-hover shadow-md rounded-xl"
                    disabled={!userInput.trim() || isSubmitting}
                  >
                    {isVietnamese ? "Kiểm tra" : "Check"}
                  </Button>
                )}
              </form>
            </div>
          )}

          {/* ==================== 5. MODE: CONTEXT CLOZE ==================== */}
          {mode === "CONTEXT" && (
            <div className="flex flex-col items-center">
              <div className="mb-6 text-center">
                <span className="rounded-full bg-info/10 px-3 py-1 text-[11px] font-bold text-info uppercase">
                  {isVietnamese
                    ? "Điền từ vào ngữ cảnh câu"
                    : "Context Sentence Cloze"}
                </span>

                <div className="mt-4 rounded-2xl border border-border/80 bg-surface-subtle p-5 text-center">
                  <p className="text-[18px] font-semibold leading-relaxed text-text-primary">
                    {prompt.context_sentence_en}
                  </p>
                  {prompt.context_sentence_vi && (
                    <p className="mt-2 text-[13px] text-text-secondary">
                      {prompt.context_sentence_vi}
                    </p>
                  )}
                </div>

                <p className="mt-3 text-[12px] text-text-tertiary">
                  {isVietnamese ? "Gợi ý nghĩa:" : "Meaning clue:"}{" "}
                  <strong className="text-text-primary">
                    {prompt.meaning_vi}
                  </strong>
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (userInput.trim() && !feedback) {
                    handleSubmitAnswer(userInput);
                  }
                }}
                className="w-full max-w-md"
              >
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  disabled={Boolean(feedback) || isSubmitting}
                  autoFocus
                  placeholder={
                    isVietnamese
                      ? "Điền từ thích hợp vào chỗ trống..."
                      : "Fill in the blank..."
                  }
                  className={`w-full rounded-2xl border-2 bg-surface p-4 text-center text-[20px] font-bold focus:outline-none transition shadow-inner ${getInputFeedbackClass()}`}
                />

                {!feedback && (
                  <Button
                    type="submit"
                    className="mt-4 w-full py-3 font-bold bg-primary hover:bg-primary-hover shadow-md rounded-xl"
                    disabled={!userInput.trim() || isSubmitting}
                  >
                    {isVietnamese ? "Kiểm tra" : "Check"}
                  </Button>
                )}
              </form>
            </div>
          )}

          {/* ==================== SERVER EVALUATION FEEDBACK BOX ==================== */}
          {feedback && (
            <div
              className={`mt-6 rounded-2xl p-4 sm:p-5 border transition-all ${
                mode === "FLASHCARD"
                  ? feedback.is_correct
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                    : "border-primary/40 bg-primary/10 text-primary dark:text-primary-foreground"
                  : feedback.result === "CORRECT"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200"
                  : feedback.result === "NEAR_CORRECT"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-200"
                  : "border-rose-500/40 bg-rose-500/10 text-rose-800 dark:text-rose-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold ${
                      mode === "FLASHCARD"
                        ? feedback.is_correct
                          ? "bg-emerald-500 text-white"
                          : "bg-primary text-white"
                        : feedback.result === "CORRECT"
                        ? "bg-emerald-500 text-white"
                        : feedback.result === "NEAR_CORRECT"
                        ? "bg-amber-500 text-white"
                        : "bg-rose-500 text-white"
                    }`}
                  >
                    {mode === "FLASHCARD" ? (
                      feedback.is_correct ? (
                        <Check size={18} />
                      ) : (
                        <RotateCcw size={18} />
                      )
                    ) : feedback.result === "CORRECT" ? (
                      <Check size={18} />
                    ) : feedback.result === "NEAR_CORRECT" ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <X size={18} />
                    )}
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold">
                      {mode === "FLASHCARD"
                        ? feedback.is_correct
                          ? isVietnamese
                            ? "Đã ghi nhận! 👍"
                            : "Recorded!"
                          : isVietnamese
                          ? "Sẽ ôn lại thẻ này ở cuối phiên! 🔁"
                          : "Will review this card again!"
                        : feedback.result === "CORRECT"
                        ? isVietnamese
                          ? "Chính xác! Xuất sắc 🎉"
                          : "Correct!"
                        : feedback.result === "NEAR_CORRECT"
                        ? isVietnamese
                          ? "Suýt đúng rồi!"
                          : "Almost Correct!"
                        : isVietnamese
                        ? "Chưa chính xác!"
                        : "Incorrect"}
                    </h4>
                    <p className="mt-1 text-[13px]">
                      {feedback.message ||
                        (mode !== "FLASHCARD" && feedback.result !== "CORRECT" && (
                          <span>
                            {isVietnamese
                              ? "Đáp án đúng là:"
                              : "Correct answer:"}{" "}
                            <strong className="underline">
                              {feedback.correct_answer}
                            </strong>
                          </span>
                        ))}
                    </p>
                    {feedback.meaning_vi && (
                      <p className="mt-0.5 text-[12px] opacity-80">
                        {isVietnamese ? "Nghĩa:" : "Meaning:"}{" "}
                        {feedback.meaning_vi}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="shrink-0 gap-1.5 font-bold bg-primary hover:bg-primary-hover text-white rounded-xl px-5 py-2.5 shadow disabled:opacity-50"
                >
                  <span>{isVietnamese ? "Tiếp tục" : "Next"}</span>
                  <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hộp thoại xác nhận tạm dừng & thoát phiên */}
      <PracticeExitConfirmModal
        isOpen={showExitConfirm}
        onClose={handleResume}
        onConfirmExit={handleConfirmExit}
        title={isVietnamese ? 'Tạm dừng phiên học từ vựng?' : 'Pause Vocabulary Session?'}
        description={
          isVietnamese
            ? 'Đồng hồ đếm thời gian đang được tạm ngưng. Bạn có chắc muốn dừng bài học này?'
            : 'Study timer is paused. Are you sure you want to stop?'
        }
        savedNotice={
          isVietnamese
            ? 'Các từ bạn đã trả lời trước đó đã được hệ thống lưu lại và cập nhật vào lịch ôn Spaced Repetition.'
            : 'Words you already practiced have been safely saved to your Spaced Repetition schedule.'
        }
      />
    </div>
  );
}
