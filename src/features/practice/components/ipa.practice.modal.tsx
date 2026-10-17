"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  pronunciationService,
  type PronunciationExerciseItem,
} from "@/features/practice/services/pronunciation.service";
import { resolveAudioUrl } from "@/utils/media.utils";
import { speakWord } from "@/features/practice/lib/audio.utils";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  X,
  Sparkles,
  Award,
} from "lucide-react";
import { Button } from "@/components/button";
import { useQueryClient } from "@tanstack/react-query";
import { progressKeys } from "@/features/progress/keys/progress.keys";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { PracticeExitConfirmModal } from "./practice.exit-confirm.modal";

interface IpaPracticeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  targetPhoneme?: string;
  mode?: "TARGETED" | "FREE_PRACTICE";
  onPracticeComplete?: () => void;
}

export function IpaPracticeModal({
  isOpen,
  onClose,
  userId,
  targetPhoneme,
  mode = "FREE_PRACTICE",
  onPracticeComplete,
}: IpaPracticeModalProps) {
  const { t, i18n } = useTranslation();
  const isVietnamese = i18n.language === "vi";
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<PronunciationExerciseItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioReplaysCount, setAudioReplaysCount] = useState(1);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const questionStartTimeRef = useRef<number>(Date.now());
  const pauseStartRef = useRef<number | null>(null);

  // Xử lý tạm ngưng thời gian và mở modal xác nhận thoát
  const handleInitiateExit = () => {
    if (isCompleted) {
      onClose();
      return;
    }
    pauseStartRef.current = Date.now();
    setShowExitConfirm(true);
  };

  // Tiếp tục làm bài - bù trừ chính xác thời gian đã dừng
  const handleResume = () => {
    if (pauseStartRef.current) {
      const pausedDuration = Date.now() - pauseStartRef.current;
      questionStartTimeRef.current += pausedDuration;
      pauseStartRef.current = null;
    }
    setShowExitConfirm(false);
  };

  // Chấp nhận thoát bài tập
  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    pauseStartRef.current = null;
    onClose();
  };

  // Hàm tải danh sách bài tập mới ngẫu nhiên từ server
  const loadExercises = useCallback(() => {
    if (!userId) return;

    setLoading(true);
    setIsCompleted(false);
    setCurrentIndex(0);
    setCorrectCount(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setAudioReplaysCount(1);
    questionStartTimeRef.current = Date.now();

    pronunciationService
      .getPracticeSession(userId, {
        phoneme: targetPhoneme,
        mode: mode === "FREE_PRACTICE" ? "FREE_PRACTICE" : undefined,
        size: 10,
      })
      .then((data) => {
        setExercises(data || []);
        setAudioReplaysCount(1);
        questionStartTimeRef.current = Date.now();
      })
      .catch((err) => {
        console.error("Failed to load pronunciation session:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [userId, targetPhoneme, mode]);

  // Fetch bài tập khi mở modal
  useEffect(() => {
    if (isOpen) {
      loadExercises();
    }
  }, [isOpen, loadExercises]);

  const currentEx = exercises[currentIndex];

  // Xáo trộn ngẫu nhiên vị trí các lựa chọn theo từng câu hỏi (tránh đáp án luôn ở vị trí cố định)
  const randomizedOptions = useMemo(() => {
    if (!currentEx) return { minimalPair: [], multipleChoice: [] };

    if (currentEx.minimal_pair) {
      const list = [
        {
          word: currentEx.minimal_pair.word_a,
          ipa: currentEx.minimal_pair.ipa_a,
          audio: currentEx.minimal_pair.audio_a,
        },
        {
          word: currentEx.minimal_pair.word_b,
          ipa: currentEx.minimal_pair.ipa_b,
          audio: currentEx.minimal_pair.audio_b,
        },
      ];
      // Hash ổn định theo ID câu hỏi để không bị nhảy khi re-render
      const seed = (currentEx._id || currentEx.id || `${currentIndex}`)
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0);
      return {
        minimalPair: seed % 2 === 0 ? list : [list[1], list[0]],
        multipleChoice: [],
      };
    }

    if (currentEx.options && currentEx.options.length > 0) {
      const opts = [...currentEx.options];
      const seed = (currentEx._id || currentEx.id || `${currentIndex}`)
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0);
      for (let i = opts.length - 1; i > 0; i--) {
        const j = (seed * (i + 1) + i) % (i + 1);
        const temp = opts[i];
        opts[i] = opts[j];
        opts[j] = temp;
      }
      return {
        minimalPair: [],
        multipleChoice: opts,
      };
    }

    return { minimalPair: [], multipleChoice: [] };
  }, [currentEx, currentIndex]);

  // Phát audio câu hỏi (phát chính xác từ mục tiêu cần kiểm tra)
  const handlePlayPromptAudio = (
    customWord?: string,
    customAudioUrl?: string,
    isUserClick: boolean = false
  ) => {
    if (isUserClick) {
      setAudioReplaysCount((prev) => prev + 1);
    }

    setIsPlayingAudio(true);

    const isCorrectB =
      (currentEx?.correct_answer || "").trim().toLowerCase() ===
      (currentEx?.minimal_pair?.word_b || "").trim().toLowerCase();
    const defaultAudio = isCorrectB
      ? currentEx?.minimal_pair?.audio_b
      : currentEx?.minimal_pair?.audio_a;
    const defaultWord = isCorrectB
      ? currentEx?.minimal_pair?.word_b
      : currentEx?.target_words?.[0] || currentEx?.minimal_pair?.word_a;

    const audioUrl = customAudioUrl || defaultAudio;
    const wordText = customWord || defaultWord;

    if (audioUrl) {
      const resolved = resolveAudioUrl(audioUrl);
      if (resolved) {
        const audio = new Audio(resolved);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => {
          if (wordText) speakWord(wordText, 0.9, "en-US");
          setIsPlayingAudio(false);
        };
        audio.play().catch(() => {
          if (wordText) speakWord(wordText, 0.9, "en-US");
          setIsPlayingAudio(false);
        });
        return;
      }
    }

    if (wordText) {
      speakWord(wordText, 0.9, "en-US");
    }
    setTimeout(() => setIsPlayingAudio(false), 1000);
  };

  // Tự động phát âm thanh khi chuyển câu
  useEffect(() => {
    if (!isOpen || !currentEx || isCompleted) return;
    const timer = setTimeout(() => {
      handlePlayPromptAudio();
    }, 300);
    return () => clearTimeout(timer);
  }, [isOpen, currentIndex, currentEx, isCompleted]);

  // Xử lý chọn đáp án
  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const cleanOpt = option.trim().toLowerCase();
    const cleanCorrect = (currentEx.correct_answer || "").trim().toLowerCase();
    const cleanIpa = (currentEx.target_ipa || "").trim().toLowerCase();
    const correct = cleanOpt === cleanCorrect || cleanOpt === cleanIpa;
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }

    const timeSpent = Math.max(
      1,
      Math.round((Date.now() - questionStartTimeRef.current) / 1000)
    );

    // Nộp kết quả ngay về backend kèm số lần nghe lại và thời gian
    pronunciationService
      .submitAttempt(userId, {
        exercise_id: currentEx._id || currentEx.id || "",
        user_selected_option: option,
        user_guess: option,
        audio_replays_count: audioReplaysCount,
        time_spent_seconds: timeSpent,
        actual_phoneme: option,
        preparation_time_seconds: timeSpent,
        recording_time_seconds: 0,
      })
      .catch((err) => {
        console.warn("Failed to record attempt:", err);
      });
  };

  // Chuyển sang câu tiếp theo
  const handleNextQuestion = () => {
    if (currentIndex + 1 < exercises.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setAudioReplaysCount(1);
      questionStartTimeRef.current = Date.now();
    } else {
      setIsCompleted(true);
      // Cập nhật ngay Gamification & Progress cache để Header, Dashboard và Progress page có Streak mới
      queryClient.invalidateQueries({ queryKey: progressKeys.gamification() });
      queryClient.invalidateQueries({ queryKey: progressKeys.all });
      if (onPracticeComplete) {
        onPracticeComplete();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border/80 bg-surface px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-primary">
                {targetPhoneme
                  ? isVietnamese
                    ? `Luyện tập chuyên sâu âm ${targetPhoneme}`
                    : `Targeted Practice: ${targetPhoneme}`
                  : isVietnamese
                  ? "Luyện phát âm thích ứng (Adaptive Practice)"
                  : "Adaptive Phoneme Practice"}
              </h3>
              <p className="text-xs text-text-tertiary">
                {isVietnamese
                  ? "Củng cố khả năng nhận biết và phân biệt âm"
                  : "Strengthen sound perception and discrimination"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleInitiateExit}
            className="rounded-lg p-1.5 text-text-tertiary transition hover:bg-surface-hover hover:text-text-primary cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 bg-surface">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <div className="h-9 w-9 animate-spin rounded-full border-3 border-primary border-t-transparent" />
              <p className="text-xs text-text-tertiary">
                {isVietnamese
                  ? "Đang chuẩn bị các bài tập phù hợp với bạn..."
                  : "Preparing personalized practice items..."}
              </p>
            </div>
          ) : isCompleted ? (
            /* Màn hình hoàn thành */
            <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in-95 duration-200">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                <Award size={36} />
              </div>
              <h4 className="text-xl font-bold text-text-primary">
                {isVietnamese
                  ? "Hoàn thành phiên luyện tập! 🎉"
                  : "Session Completed! 🎉"}
              </h4>
              <p className="mt-1 text-sm text-text-secondary">
                {isVietnamese
                  ? `Bạn đã trả lời đúng ${correctCount}/${exercises.length} câu hỏi.`
                  : `You answered ${correctCount}/${exercises.length} questions correctly.`}
              </p>

              <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-surface-subtle p-3.5">
                  <span className="text-[11px] font-medium text-text-tertiary">
                    {isVietnamese ? "Điểm chính xác" : "Accuracy"}
                  </span>
                  <p className="mt-0.5 text-xl font-extrabold text-primary">
                    {Math.round((correctCount / (exercises.length || 1)) * 100)}
                    %
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface-subtle p-3.5">
                  <span className="text-[11px] font-medium text-text-tertiary">
                    {isVietnamese ? "Kinh nghiệm" : "XP Earned"}
                  </span>
                  <p className="mt-0.5 text-xl font-extrabold text-amber-500">
                    +{correctCount * 10} XP
                  </p>
                </div>
              </div>

              <div className="mt-8 flex w-full max-w-sm gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={loadExercises}
                >
                  <RotateCcw size={16} className="mr-1.5" />
                  {isVietnamese ? "Luyện lại" : "Practice Again"}
                </Button>
                <Button
                  className="flex-1 bg-primary text-white hover:bg-primary-hover"
                  onClick={onClose}
                >
                  {isVietnamese ? "Hoàn tất" : "Done"}
                </Button>
              </div>
            </div>
          ) : exercises.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <p className="text-sm text-text-secondary">
                {isVietnamese
                  ? "Hiện chưa có bài tập cho âm vị này."
                  : "No exercises found for this phoneme."}
              </p>
              <Button variant="outline" className="mt-4" onClick={onClose}>
                {isVietnamese ? "Đóng" : "Close"}
              </Button>
            </div>
          ) : (
            /* Giao diện câu hỏi */
            <div>
              {/* Progress Bar & Header */}
              <div className="mb-6 flex items-center justify-between">
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                  {isVietnamese
                    ? `Câu ${currentIndex + 1} / ${exercises.length}`
                    : `Question ${currentIndex + 1} / ${exercises.length}`}
                </span>
                <span className="text-xs font-semibold text-text-tertiary">
                  {currentEx.exercise_type === "MINIMAL_PAIR_LISTEN"
                    ? isVietnamese
                      ? "Cặp âm tối thiểu (Minimal Pair)"
                      : "Minimal Pair"
                    : currentEx.exercise_type === "WORD_TRANSCRIPTION"
                    ? isVietnamese
                      ? "Liên kết chữ & Âm vị"
                      : "Word to Sound"
                    : isVietnamese
                    ? "Nhận diện âm IPA"
                    : "Sound Perception"}
                </span>
              </div>

              {/* Audio Prompt Player */}
              <div className="mb-6 flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-surface-subtle p-6 text-center">
                <p className="mb-3 text-sm font-medium text-text-secondary">
                  {currentEx.prompt_text ||
                    (isVietnamese
                      ? "Nghe âm thanh và chọn câu trả lời đúng:"
                      : "Listen and choose the correct answer:")}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    handlePlayPromptAudio(undefined, undefined, true)
                  }
                  className={`group flex h-16 w-16 items-center justify-center rounded-2xl transition transform active:scale-95 cursor-pointer shadow-md ${
                    isPlayingAudio
                      ? "bg-primary text-white ring-4 ring-primary/20 scale-105"
                      : "bg-primary text-white hover:bg-primary-hover"
                  }`}
                  title="Nghe lại phát âm"
                >
                  <Volume2
                    size={30}
                    className={isPlayingAudio ? "animate-bounce" : ""}
                  />
                </button>
                <span className="mt-2 text-xs font-medium text-text-tertiary">
                  {isVietnamese ? "Bấm để nghe phát âm" : "Click to listen"}
                </span>
              </div>

              {/* Options Section */}
              {currentEx.minimal_pair ? (
                /* Giao diện cặp âm Minimal Pair */
                <div className="grid grid-cols-2 gap-3.5">
                  {(randomizedOptions.minimalPair || []).map((pairItem) => {
                    const isSelected = selectedOption === pairItem.word;
                    const isTheCorrect =
                      pairItem.word.toLowerCase() ===
                      (currentEx.correct_answer || "").toLowerCase();

                    let btnClass =
                      "border-border bg-surface hover:border-primary/60 hover:bg-surface-hover/80";
                    if (isAnswered) {
                      if (isTheCorrect) {
                        btnClass =
                          "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20";
                      } else if (isSelected && !isTheCorrect) {
                        btnClass =
                          "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20";
                      } else {
                        btnClass = "border-border/60 opacity-60";
                      }
                    }

                    return (
                      <div
                        key={pairItem.word}
                        role="button"
                        tabIndex={isAnswered ? -1 : 0}
                        onClick={() => {
                          if (!isAnswered) handleSelectOption(pairItem.word);
                        }}
                        onKeyDown={(e) => {
                          if (
                            !isAnswered &&
                            (e.key === "Enter" || e.key === " ")
                          ) {
                            e.preventDefault();
                            handleSelectOption(pairItem.word);
                          }
                        }}
                        className={`flex flex-col items-center justify-center rounded-xl border p-4 text-center transition ${
                          isAnswered ? "" : "cursor-pointer"
                        } ${btnClass}`}
                      >
                        <span className="text-xl font-bold text-text-primary">
                          {pairItem.word}
                        </span>
                        <span className="mt-0.5 font-mono text-sm font-semibold text-primary">
                          {pairItem.ipa}
                        </span>
                        {isAnswered && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayPromptAudio(
                                pairItem.word,
                                pairItem.audio
                              );
                            }}
                            className="mt-2 inline-flex items-center gap-1 rounded-md bg-surface-subtle px-2.5 py-1 text-[11px] font-semibold text-text-secondary hover:text-primary hover:bg-surface-hover transition cursor-pointer"
                          >
                            <Volume2 size={12} />
                            <span>
                              {isVietnamese ? "Nghe từ này" : "Listen"}
                            </span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Giao diện 4 lựa chọn trắc nghiệm IPA */
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(randomizedOptions.multipleChoice || []).map((opt) => {
                    const isSelected = selectedOption === opt;
                    const cleanOpt = opt.trim().toLowerCase();
                    const cleanCorrect = (currentEx.correct_answer || "")
                      .trim()
                      .toLowerCase();
                    const cleanIpa = (currentEx.target_ipa || "")
                      .trim()
                      .toLowerCase();
                    const isTheCorrect =
                      cleanOpt === cleanCorrect || cleanOpt === cleanIpa;

                    let btnClass =
                      "border-border bg-surface hover:border-primary/60 hover:bg-surface-hover";
                    if (isAnswered) {
                      if (isTheCorrect) {
                        btnClass =
                          "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 font-bold";
                      } else if (isSelected && !isTheCorrect) {
                        btnClass =
                          "border-rose-500 bg-rose-500/10 ring-2 ring-rose-500/20";
                      } else {
                        btnClass = "border-border/60 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={isAnswered}
                        onClick={() => handleSelectOption(opt)}
                        className={`flex h-14 items-center justify-center rounded-xl border font-mono text-lg font-bold text-text-primary transition cursor-pointer ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Feedback Bar */}
              {isAnswered && (
                <div
                  className={`mt-5 flex items-center justify-between rounded-xl border p-3.5 animate-in slide-in-from-bottom-2 duration-150 ${
                    isCorrect
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400"
                  }`}
                >
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 size={18} className="text-emerald-500" />
                        <span>
                          {isVietnamese
                            ? "Chính xác! Làm tốt lắm 🎉"
                            : "Correct! Well done 🎉"}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle size={18} className="text-rose-500" />
                        <span>
                          {isVietnamese
                            ? `Chưa đúng! Đáp án đúng là: ${currentEx.correct_answer}`
                            : `Incorrect! The correct answer was: ${currentEx.correct_answer}`}
                        </span>
                      </>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="gap-1.5 bg-primary text-white hover:bg-primary-hover shadow-xs"
                    onClick={handleNextQuestion}
                  >
                    <span>{isVietnamese ? "Tiếp tục" : "Next"}</span>
                    <ArrowRight size={14} />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hộp thoại xác nhận tạm dừng & thoát phiên */}
      <PracticeExitConfirmModal
        isOpen={showExitConfirm}
        onClose={handleResume}
        onConfirmExit={handleConfirmExit}
        title={isVietnamese ? "Tạm dừng luyện tập IPA?" : "Pause IPA Practice?"}
        description={
          isVietnamese
            ? "Đồng hồ tính tốc độ phản xạ đang được tạm ngưng. Bạn có chắc muốn dừng bài tập?"
            : "Perception response timer is paused. Are you sure you want to stop?"
        }
        savedNotice={
          isVietnamese
            ? "Các câu bạn đã chọn đáp án trước đó đã được lưu vào hệ thống và tính vào bảng ngữ âm."
            : "Questions you already answered have been saved to your pronunciation profile."
        }
      />
    </div>
  );
}
