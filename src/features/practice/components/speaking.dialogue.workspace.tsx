import { PracticeKeyboard, PracticeRecordKey } from './practice.keyboard'
import {
  useSpeakingSession,
  type RecordingSubmission,
} from "@/features/practice/hooks/use.speaking.session";
import { resolveSpeakingPolicy } from "@/features/practice/lib/speaking-policy";
import { toast } from "@/store/toast.store";
/**
 * @file speaking.dialogue.workspace.tsx
 * @description Không gian luyện nói đối thoại tương tác (Structured Role-play) chuẩn hóa:
 * - Chọn 3 mức độ thích ứng: Dễ (Read-along), Trung bình (Guided), Khó (Independent)
 * - Tự động phát âm thanh của Bot trước (R2 audio / SpeechSynthesis)
 * - VAD ngắt mic thông minh có Grace Period + Nút hoàn thành thủ công
 * - Nghe lại/thu lại và xác nhận từng bản thu trước khi chuyển lượt
 * - Bộ đếm giờ thực hành tăng dần (Elapsed Timer)
 * - Tách bạch audio và metrics từng lượt (Response Latency, Speaking Duration)
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  ArrowLeft,
  Volume2,
  Mic,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Play,
  Pause,
  HelpCircle,
  Users,
  Clock,
  Send,
  Check,
  X,
} from "lucide-react";
import type {
  SpeakingExercise,
  DifficultyLevel,
  DialogueTurn,
  DialogueTurnAttemptResult,
} from "@/features/practice/types/speaking";
import { resolveMediaUrlAsync } from "@/utils/media.utils";
import { PracticeExitConfirmModal } from "@/features/practice/components/practice.exit-confirm.modal";

interface SpeakingDialogueWorkspaceProps {
  exercise: SpeakingExercise;
  isVietnamese: boolean;
  initialTier?: DifficultyLevel;
  onBack: () => void;
  onSubmit: (
    transcription: string,
    duration: number,
    audioBlob?: Blob,
    difficultyChosen?: DifficultyLevel,
    dialogueTurnsResults?: DialogueTurnAttemptResult[],
    recordingSubmission?: RecordingSubmission
  ) => void | Promise<void>;
  isSubmitting?: boolean;
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

type VadState = "WAITING_FOR_SPEECH" | "SPEAKING" | "GRACE_PERIOD" | "IDLE";
type RecordingStopReason = "manual" | "silence" | "timeout";
type RecognitionEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};
type Recognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult?: (event: RecognitionEvent) => void;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
  SpeechRecognition?: new () => Recognition;
  webkitSpeechRecognition?: new () => Recognition;
};

export function SpeakingDialogueWorkspace({
  exercise,
  isVietnamese,
  initialTier,
  onBack,
  onSubmit,
  isSubmitting = false,
}: SpeakingDialogueWorkspaceProps) {
  const scenario = exercise.dialogue_scenario;
  const turns = useMemo(() => scenario?.turns || [], [scenario]);

  // 1. Cấu hình mức độ luyện tập (Scaffolding level)
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>(
    initialTier || exercise.difficulty_level || "MEDIUM"
  );
  const session = useSpeakingSession(exercise, selectedDifficulty);
  const policy = session.policy ?? resolveSpeakingPolicy(exercise, selectedDifficulty);
  const recordingSubmissionRef = useRef<RecordingSubmission | undefined>(
    undefined
  );
  const startingRef = useRef(false);
  const mountedRef = useRef(true);
  const [isStarting, setIsStarting] = useState(false);
  const recordingStartedAtRef = useRef(0);
  const stoppingRef = useRef(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isRetaking, setIsRetaking] = useState(false);
  const [returningToFinalReview, setReturningToFinalReview] = useState(false);
  const [isTurnReview, setIsTurnReview] = useState(false);
  const awaitingReviewRef = useRef(false);
  const [recordingStopReason, setRecordingStopReason] = useState<RecordingStopReason>("manual");
  const reviewConfirmRef = useRef<HTMLButtonElement | null>(null);
  const botRunRef = useRef(0);
  const botSpeakingRef = useRef(false);
  const botTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const submitLockRef = useRef(false);
  const [preparingSubmission, setPreparingSubmission] = useState(false);
  const recordingTurnRef = useRef<{ index: number; take?: RecordingSubmission; previousTranscript: string } | null>(null);
  const transcriptsRef = useRef<Record<number, string>>({});
  const retakingRef = useRef(false);
  const completeRef = useRef<(reason?: RecordingStopReason) => void>(() => {});
  const [prepLeft, setPrepLeft] = useState<number | null>(null);
  const [responseLeft, setResponseLeft] = useState<number | null>(null);
  const [turnError, setTurnError] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const exitOpenRef = useRef(false);
  const pausedAtRef = useRef(0);
  const deferredBotEndRef = useRef(false);
  const pendingBotRef = useRef<DialogueTurn | null>(null);

  // 2. State tiến trình hội thoại
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const currentTurnRef = useRef(0);
  useEffect(() => {
    currentTurnRef.current = currentTurnIndex;
  }, [currentTurnIndex]);
  const botFinishedRef = useRef<() => void>(() => {});
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [vadState, setVadState] = useState<VadState>("IDLE");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [turnAudioBlobs, setTurnAudioBlobs] = useState<Record<number, Blob>>(
    {}
  );
  const [turnAudioUrls, setTurnAudioUrls] = useState<Record<number, string>>(
    {}
  );
  const [turnTranscripts, setTurnTranscripts] = useState<
    Record<number, string>
  >({});
  const [turnsResults, setTurnsResults] = useState<DialogueTurnAttemptResult[]>(
    []
  );

  // 3. Audio & Web Speech Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const speechRecognitionRef = useRef<Recognition | null>(null);

  // 3.1 Audio Replay & Playback state & refs
  const [playingAudioKey, setPlayingAudioKey] = useState<string | null>(null);
  const replayAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlsRef = useRef<string[]>([]);

  // 4. Timing measurement refs
  const turnBotFinishedTimeRef = useRef<number>(0);
  const turnSpeechStartedTimeRef = useRef<number>(0);
  const turnSpeechDurationRef = useRef<number>(0);
  const graceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elapsedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [audioVolumeLevel, setAudioVolumeLevel] = useState(0);

  const activeTurn: DialogueTurn | undefined = turns[currentTurnIndex];

  useEffect(() => {
    if (isTurnReview && !showExitConfirm) reviewConfirmRef.current?.focus({ preventScroll: true });
  }, [isTurnReview, showExitConfirm]);

  // Đếm thời gian thực hành (Elapsed Timer)
  useEffect(() => {
    if (isStarted && !isFinished && !showExitConfirm) {
      elapsedTimerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    }
    return () => {
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
    };
  }, [isStarted, isFinished, showExitConfirm]);

  // Dọn dẹp âm thanh khi unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Invalidate the latest generation, including playback started after mounting.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      botRunRef.current++;
      botSpeakingRef.current = false;
      if (botTimerRef.current) clearTimeout(botTimerRef.current);
      utteranceRef.current = null;
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
      }
      if (replayAudioRef.current) {
        replayAudioRef.current.pause();
        replayAudioRef.current = null;
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.onerror = null;
        if (mediaRecorderRef.current.state !== "inactive")
          mediaRecorderRef.current.stop();
      }
      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
      if (speechRecognitionRef.current) {
        try {
          speechRecognitionRef.current.stop();
        } catch {}
      }
      // Thu hồi tất cả Object URLs đã sinh ra
      audioUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch {}
      });
    };
  }, []);

  // =========================================================================
  // AUDIO REPLAY HELPERS: Dừng và phát lại âm thanh của User và Bot
  // =========================================================================
  const stopAnyPlayback = useCallback(() => {
    if (replayAudioRef.current) {
      replayAudioRef.current.pause();
      replayAudioRef.current.currentTime = 0;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setPlayingAudioKey(null);
  }, []);

  const stopBotPlayback = useCallback(() => {
    botRunRef.current++;
    botSpeakingRef.current = false;
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    botTimerRef.current = null;
    if (audioPlayerRef.current) {
      audioPlayerRef.current.onended = null;
      audioPlayerRef.current.onerror = null;
      audioPlayerRef.current.pause();
    }
    window.speechSynthesis?.cancel();
    utteranceRef.current = null;
  }, []);
  const isCurrentBot = useCallback((run: number, number: number) =>
    mountedRef.current && run === botRunRef.current && turns[currentTurnRef.current]?.turn_number === number,
  [turns]);

  const replayUserAudio = useCallback(
    (turnIndex: number) => {
      if (isSubmitting || submitLockRef.current) return;
      if (botSpeakingRef.current || startingRef.current || mediaRecorderRef.current?.state === "recording") return;
      const audioKey = `user-${turnIndex}`;
      if (playingAudioKey === audioKey) {
        stopAnyPlayback();
        return;
      }

      stopAnyPlayback();
      let audioUrl = turnAudioUrls[turnIndex];
      if (!audioUrl && turnAudioBlobs[turnIndex]) {
        audioUrl = URL.createObjectURL(turnAudioBlobs[turnIndex]);
        audioUrlsRef.current.push(audioUrl);
        setTurnAudioUrls((prev) => ({ ...prev, [turnIndex]: audioUrl }));
      }

      if (!audioUrl) return;

      const audio = new Audio(audioUrl);
      replayAudioRef.current = audio;
      setPlayingAudioKey(audioKey);

      audio.onended = () => {
        setPlayingAudioKey(null);
      };
      audio.onerror = () => {
        setPlayingAudioKey(null);
      };
      audio.play().catch(() => setPlayingAudioKey(null));
    },
    [playingAudioKey, turnAudioUrls, turnAudioBlobs, stopAnyPlayback, isSubmitting]
  );

  const speakReplaySpeechSynthesis = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      setPlayingAudioKey(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.95;

    const voices = window.speechSynthesis.getVoices();
    const englishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith("en") &&
          (v.name.includes("Natural") ||
            v.name.includes("Google") ||
            v.name.includes("Samantha") ||
            v.name.includes("Jenny"))
      ) || voices.find((v) => v.lang.startsWith("en"));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => setPlayingAudioKey(null);
    utterance.onerror = () => setPlayingAudioKey(null);
    window.speechSynthesis.speak(utterance);
  }, []);

  const replayBotAudio = useCallback(
    async (turn: DialogueTurn, turnIndex: number) => {
      if (botSpeakingRef.current || startingRef.current || mediaRecorderRef.current?.state === "recording") return;
      const audioKey = `bot-${turnIndex}`;
      if (playingAudioKey === audioKey) {
        stopAnyPlayback();
        return;
      }

      stopAnyPlayback();
      setPlayingAudioKey(audioKey);

      // Ưu tiên 1: Audio file từ R2 nếu có
      if (turn.prompt_audio_id) {
        try {
          const resolvedUrl = await resolveMediaUrlAsync(turn.prompt_audio_id);
          if (resolvedUrl) {
            const audio = new Audio(resolvedUrl);
            replayAudioRef.current = audio;
            audio.onended = () => setPlayingAudioKey(null);
            audio.onerror = () => {
              speakReplaySpeechSynthesis(turn.text_en);
            };
            await audio.play();
            return;
          }
        } catch {
          // fallback
        }
      }

      // Ưu tiên 2: Fallback qua Web Speech API
      speakReplaySpeechSynthesis(turn.text_en);
    },
    [playingAudioKey, stopAnyPlayback, speakReplaySpeechSynthesis]
  );

  // Cho phép thu âm lại lượt thoại (Retake turn)
  const handleRetakeTurn = useCallback(
    (turnIndex: number) => {
      if ((!isFinished && !(awaitingReviewRef.current && turnIndex === currentTurnRef.current)) || isSubmitting || submitLockRef.current || stoppingRef.current) return;
      if (
        (session.counts["turn_" + turns[turnIndex]?.turn_number] || 0) >=
        policy.max_record_attempts
      )
        return;
      if (
        mediaRecorderRef.current?.state === "recording" ||
        startingRef.current
      )
        return;
      setPrepLeft(policy.preparation_time_seconds);
      setResponseLeft(null);
      setTurnError("");
      // A retake started from the final review returns there after confirmation.
      retakingRef.current = retakingRef.current || isFinished;
      if (isFinished) setReturningToFinalReview(true);
      awaitingReviewRef.current = false;
      setIsTurnReview(false);
      setIsRetaking(true);
      stopAnyPlayback();

      // Preserve the previous take until a valid replacement is available.
      stopBotPlayback();
      currentTurnRef.current = turnIndex;
      setCurrentTurnIndex(turnIndex);
      setVadState("IDLE");
      setIsFinished(false);
      setIsReviewModalOpen(false);
    },
    [
      stopAnyPlayback,
      stopBotPlayback,
      isFinished,
      isSubmitting,
      turns,
      session.counts,
      policy.max_record_attempts,
      policy.preparation_time_seconds,
    ]
  );

  // =========================================================================
  // BOT VOICE ENGINE: Phát âm thanh của Bot
  // =========================================================================
  const speakWithSpeechSynthesis = useCallback((text: string, run: number, turnNumber: number) => {
    if (!isCurrentBot(run, turnNumber)) return;
    if (!("speechSynthesis" in window)) {
      botSpeakingRef.current = false;
      setIsBotSpeaking(false);
      setTurnError(isVietnamese ? 'Không phát được lời bot. Hãy đọc ngữ cảnh hoặc bấm bỏ qua audio.' : 'Bot audio unavailable. Read the context or skip the audio.');
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    utterance.lang = 'en-US'; utterance.rate = 0.95;
    utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('en')) || null;
    utterance.onend = () => {
      if (!isCurrentBot(run, turnNumber)) return;
      utteranceRef.current = null;
      setIsBotSpeaking(false);
      turnBotFinishedTimeRef.current = Date.now();
      botFinishedRef.current();
    };
    utterance.onerror = () => {
      if (!isCurrentBot(run, turnNumber)) return;
      botSpeakingRef.current = false;
      setIsBotSpeaking(false);
      setTurnError(isVietnamese ? 'Không phát được lời bot. Bạn có thể bỏ qua audio để tiếp tục.' : 'Bot playback failed. You can skip its audio to continue.');
    };
    window.speechSynthesis.speak(utterance);
  }, [isCurrentBot, isVietnamese]);

  const playBotAudio = useCallback(async (turn: DialogueTurn) => {
    if (exitOpenRef.current) { pendingBotRef.current = turn; return; }
    if (!mountedRef.current || turns[currentTurnRef.current]?.turn_number !== turn.turn_number) return;
    stopBotPlayback();
    const run = botRunRef.current;
    botSpeakingRef.current = true;
    setIsBotSpeaking(true); setVadState('IDLE'); setTurnError('');
    let fallbackStarted = false;
    const fallback = () => {
      if (fallbackStarted || !isCurrentBot(run, turn.turn_number)) return;
      fallbackStarted = true;
      speakWithSpeechSynthesis(turn.text_en, run, turn.turn_number);
    };
    if (turn.prompt_audio_id) {
      try {
        const url = await resolveMediaUrlAsync(turn.prompt_audio_id);
        if (!isCurrentBot(run, turn.turn_number)) return;
        if (url) {
          const player = new Audio(url); audioPlayerRef.current = player;
          player.onended = () => {
            if (!isCurrentBot(run, turn.turn_number)) return;
            turnBotFinishedTimeRef.current = Date.now(); botFinishedRef.current();
          };
          player.onerror = fallback;
          await player.play();
          return;
        }
      } catch { /* Try TTS once when stored media cannot be played. */ }
    }
    fallback();
  }, [turns, stopBotPlayback, isCurrentBot, speakWithSpeechSynthesis]);

  const scheduleBotAudio = useCallback((turn: DialogueTurn, delay: number) => {
    if (botTimerRef.current) clearTimeout(botTimerRef.current);
    const generation = botRunRef.current;
    botTimerRef.current = setTimeout(() => {
      botTimerRef.current = null;
      if (mountedRef.current && generation === botRunRef.current) void playBotAudio(turn);
    }, delay);
  }, [playBotAudio]);

  // Khi Bot nói xong -> Chuyển sang lượt của User hoặc turn tiếp (CHỜ USER TỰ BẤM NÚT THU ÂM)
  const finishDialogue = useCallback(() => {
    stopBotPlayback();
    awaitingReviewRef.current = false;
    setIsTurnReview(false);
    setPrepLeft(null); setResponseLeft(null);
    setIsFinished(true);
    setIsReviewModalOpen(true);
    setIsBotSpeaking(false);
    setVadState("IDLE");
    if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
  }, [stopBotPlayback]);

  const confirmUserTurn = useCallback(() => {
    const index = currentTurnRef.current;
    if (!awaitingReviewRef.current || exitOpenRef.current || startingRef.current || stoppingRef.current || isSubmitting || submitLockRef.current || !turnAudioBlobs[index]) return;
    // Lock synchronously so double clicks cannot skip a turn or play bot twice.
    awaitingReviewRef.current = false;
    setIsTurnReview(false);
    setIsRetaking(false);
    setTurnError("");
    stopAnyPlayback();
    if (retakingRef.current) {
      retakingRef.current = false;
      setReturningToFinalReview(false);
      finishDialogue();
      return;
    }
    const nextIndex = index + 1;
    if (nextIndex >= turns.length) { finishDialogue(); return; }
    currentTurnRef.current = nextIndex;
    setCurrentTurnIndex(nextIndex);
    if (turns[nextIndex].speaker === "AI") scheduleBotAudio(turns[nextIndex], 300);
    else { setPrepLeft(policy.preparation_time_seconds); setVadState("IDLE"); }
  }, [isSubmitting, turnAudioBlobs, turns, stopAnyPlayback, finishDialogue, scheduleBotAudio, policy.preparation_time_seconds]);

  const handleBotFinished = useCallback(() => {
    if (exitOpenRef.current) { deferredBotEndRef.current = true; return; }
    const index = currentTurnRef.current;
    if (turns[index]?.speaker !== "AI") return;
    currentTurnRef.current = index + 1;
    setIsBotSpeaking(false);
    stopBotPlayback();
    const nextTurn = turns[index + 1];

    if (nextTurn && nextTurn.speaker === "USER") {
      setCurrentTurnIndex(index + 1);
      setPrepLeft(policy.preparation_time_seconds);
      setTurnError("");
      setVadState("IDLE");
    } else if (nextTurn && nextTurn.speaker === "AI") {
      setCurrentTurnIndex(index + 1);
      scheduleBotAudio(nextTurn, 600);
    } else {
      // Đã hết các turns
      finishDialogue();
    }
  }, [turns, scheduleBotAudio, stopBotPlayback, policy.preparation_time_seconds, finishDialogue]);
  useEffect(() => {
    botFinishedRef.current = handleBotFinished;
  }, [handleBotFinished]);

  // =========================================================================
  // USER VAD & RECORDING: Thu âm & Phát hiện khoảng lặng thông minh
  // =========================================================================
  const startUserTurnRecording = async () => {
    if (!mountedRef.current || activeTurn?.speaker !== "USER" || isFinished || awaitingReviewRef.current || exitOpenRef.current || isSubmitting || submitLockRef.current || botSpeakingRef.current || stoppingRef.current || startingRef.current || mediaRecorderRef.current?.state === "recording")
      return;
    startingRef.current = true;
    setIsStarting(true);
    setTurnError("");
    try {
      stopAnyPlayback();
      if (typeof MediaRecorder === "undefined") throw new Error("Trình duyệt chưa hỗ trợ ghi âm");
      recordedChunksRef.current = [];
      turnSpeechDurationRef.current = 0;
      turnSpeechStartedTimeRef.current = 0;

      // Khởi tạo Microphone Stream nếu chưa có
      if (!mediaStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
        if (!mountedRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
      }

      // Khởi tạo AudioContext cho VAD nếu chưa có
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        const AudioCtx =
          window.AudioContext || (window as SpeechWindow).webkitAudioContext;
        if (!AudioCtx) throw new Error("Trình duyệt chưa hỗ trợ ghi âm");
        audioContextRef.current = new AudioCtx();
      }
      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      recordingSubmissionRef.current = await session.reserve(
        activeTurn?.turn_number || 0
      );
      if (!mountedRef.current) {
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        return;
      }
      recordingTurnRef.current = { index: currentTurnRef.current, take: recordingSubmissionRef.current, previousTranscript: transcriptsRef.current[currentTurnRef.current] || "" };
      const audioCtx = audioContextRef.current;
      const source = audioCtx.createMediaStreamSource(mediaStreamRef.current);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Khởi tạo MediaRecorder
      const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'].find(type => MediaRecorder.isTypeSupported(type));
      const recorder = new MediaRecorder(mediaStreamRef.current, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstart = () => {
        recordingStartedAtRef.current = Date.now();
      };
      setPrepLeft(null);
      setResponseLeft(session.getPolicy()?.response_time_seconds ?? policy.response_time_seconds);
      recorder.onerror = () => {
        recorder.onstop = null;
        if (recorder.state !== 'inactive') recorder.stop();
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (graceTimerRef.current) clearTimeout(graceTimerRef.current);
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
        try { if (speechRecognitionRef.current) { speechRecognitionRef.current.onresult = undefined; speechRecognitionRef.current.stop(); } } catch {}
        stoppingRef.current = false; setIsStopping(false);
        const context = recordingTurnRef.current;
        if (context) { transcriptsRef.current[context.index] = context.previousTranscript; setTurnTranscripts(prev => ({ ...prev, [context.index]: context.previousTranscript })); }
        setVadState('IDLE'); setResponseLeft(null);
        if (turnAudioBlobs[currentTurnRef.current]) {
          awaitingReviewRef.current = true; setIsTurnReview(true); setIsRetaking(false);
        }
        setTurnError(isVietnamese ? 'Ghi âm bị gián đoạn. Bản thu trước vẫn được giữ nếu có.' : 'Recording interrupted. Any previous take is preserved.');
      };
      recorder.start(100);
      transcriptsRef.current[currentTurnRef.current] = "";
      setTurnTranscripts(prev => ({ ...prev, [currentTurnRef.current]: "" }));
      setVadState("WAITING_FOR_SPEECH");

      // Khởi động Web Speech Recognition (nếu browser hỗ trợ) để lấy text thô
      initSpeechRecognition();

      // Khởi động VAD Loop
      startVadLoop();
    } catch (err) {
      setPrepLeft(null);
      setTurnError(
        err instanceof Error ? err.message : "Không thể bắt đầu thu âm"
      );
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setVadState("IDLE");
      setResponseLeft(null);
      if (turnAudioBlobs[currentTurnRef.current]) {
        const previous = turnsResults.find(row => row.turn_number === activeTurn.turn_number)?.user_transcription || "";
        transcriptsRef.current[currentTurnRef.current] = previous;
        setTurnTranscripts(prev => ({ ...prev, [currentTurnRef.current]: previous }));
        awaitingReviewRef.current = true; setIsTurnReview(true); setIsRetaking(false);
      }
    } finally {
      startingRef.current = false;
      setIsStarting(false);
    }
  };

  const requestRetake = (turnIndex: number) => {
    const recordImmediately = awaitingReviewRef.current && turnIndex === currentTurnRef.current;
    handleRetakeTurn(turnIndex);
    if (recordImmediately) void startUserTurnRecording();
  };

  // Web Speech Recognition
  const initSpeechRecognition = () => {
    const SpeechRecognition =
      (window as SpeechWindow).SpeechRecognition ||
      (window as SpeechWindow).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";
        const index = recordingTurnRef.current?.index ?? currentTurnRef.current;
        rec.onresult = (e: RecognitionEvent) => {
          let text = "";
          for (let i = 0; i < e.results.length; i++) {
            text += e.results[i][0].transcript + " ";
          }
          transcriptsRef.current[index] = text.trim();
          setTurnTranscripts((prev) => ({
            ...prev,
            [index]: text.trim(),
          }));
        };
        speechRecognitionRef.current = rec;
        rec.start();
      } catch {}
    }
  };

  // VAD Loop: Giám sát âm lượng và Grace Period
  const startVadLoop = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const SILENCE_THRESHOLD = 18; // Ngưỡng âm lượng phát hiện tiếng nói
    const GRACE_PERIOD_MS = 2000; // 2.0s Grace Period sau khi đã cất tiếng nói

    const checkVolume = () => {
      if (exitOpenRef.current) { animationFrameRef.current = requestAnimationFrame(checkVolume); return; }
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      setAudioVolumeLevel(Math.min(100, Math.round((average / 128) * 100)));

      const isSpeakingNow = average > SILENCE_THRESHOLD;

      setVadState((currentVadState) => {
        if (currentVadState === "WAITING_FOR_SPEECH") {
          if (isSpeakingNow) {
            // Người học bắt đầu cất tiếng nói!
            turnSpeechStartedTimeRef.current = Date.now();
            return "SPEAKING";
          }
          return "WAITING_FOR_SPEECH";
        }

        if (currentVadState === "SPEAKING") {
          if (!isSpeakingNow) {
            // Bắt đầu khoảng lặng -> Chuyển sang GRACE_PERIOD và đếm ngược
            if (!graceTimerRef.current) {
              graceTimerRef.current = setTimeout(() => {
                // Hết grace period mà vẫn im lặng -> Tự động chốt lượt!
                completeRef.current("silence");
              }, GRACE_PERIOD_MS);
            }
            return "GRACE_PERIOD";
          }
          return "SPEAKING";
        }

        if (currentVadState === "GRACE_PERIOD") {
          if (isSpeakingNow) {
            // Người học nói tiếp -> Huỷ grace timer!
            if (graceTimerRef.current) {
              clearTimeout(graceTimerRef.current);
              graceTimerRef.current = null;
            }
            return "SPEAKING";
          }
          return "GRACE_PERIOD";
        }

        return currentVadState;
      });

      animationFrameRef.current = requestAnimationFrame(checkVolume);
    };

    animationFrameRef.current = requestAnimationFrame(checkVolume);
  };

  // Kết thúc lượt nói của User (tự động qua VAD hoặc bấm nút thủ công)
  const handleCompleteUserTurn = useCallback((reason: RecordingStopReason = "manual") => {
    if (stoppingRef.current) return;
    if (graceTimerRef.current) {
      clearTimeout(graceTimerRef.current);
      graceTimerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.onresult = undefined;
        speechRecognitionRef.current.stop();
      } catch {}
    }

    setResponseLeft(null);
    setPrepLeft(null);
    setVadState("IDLE");
    setAudioVolumeLevel(0);

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      stoppingRef.current = true;
      setIsStopping(true);
      const context = recordingTurnRef.current;
      const turnIndex = context?.index ?? currentTurnRef.current;
      recorder.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        recorder.onstop = null;
        recorder.onerror = null;
        recorder.ondataavailable = null;
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        stoppingRef.current = false;
        if (!mountedRef.current) return;
        setIsStopping(false);
        if (audioBlob.size < 100) {
          if (context) { transcriptsRef.current[turnIndex] = context.previousTranscript; setTurnTranscripts(prev => ({ ...prev, [turnIndex]: context.previousTranscript })); }
          setTurnError(isVietnamese ? 'Bản thu trống. Hãy thu lại; bản thu trước vẫn được giữ nếu có.' : 'Empty recording. Record again; any previous take is preserved.');
          if (turnAudioUrls[turnIndex]) {
            awaitingReviewRef.current = true; setIsTurnReview(true); setIsRetaking(false);
          }
          return;
        }
        const objectUrl = URL.createObjectURL(audioBlob);
        const oldUrl = turnAudioUrls[turnIndex];
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        audioUrlsRef.current.push(objectUrl);

        setTurnAudioBlobs((prev) => ({
          ...prev,
          [turnIndex]: audioBlob,
        }));
        setTurnAudioUrls((prev) => ({
          ...prev,
          [turnIndex]: objectUrl,
        }));

        const speakingDurationSeconds = Math.max(
          0,
          (Date.now() - recordingStartedAtRef.current) / 1000
        );
        const turnResult: DialogueTurnAttemptResult = {
          turn_number:
            turns[turnIndex]?.turn_number || turnIndex + 1,
          user_transcription: transcriptsRef.current[turnIndex] || "",
          audio_url: objectUrl,
          recording_take_id: context?.take?.recording_take_id,
          speaking_duration_seconds: speakingDurationSeconds,
        };

        setTurnsResults((prev) => [...prev.filter(row => row.turn_number !== turnResult.turn_number), turnResult]);
        // Recording completion never advances the conversation. The learner
        // can listen/retake and explicitly accept the audio, even on the last turn.
        setRecordingStopReason(reason);
        setIsRetaking(false);
        awaitingReviewRef.current = true;
        setIsTurnReview(true);
      };
      recorder.stop();
    }
  }, [turns, turnAudioUrls, isVietnamese]);

  // Hoàn thành toàn bài đối thoại
  // Bắt đầu phiên thực hành (User Gesture)
  const handleStartPractice = () => {
    if (isSubmitting || submitLockRef.current || startingRef.current || stoppingRef.current) return;
    stopBotPlayback();
    currentTurnRef.current = 0;
    recordingSubmissionRef.current = undefined;
    transcriptsRef.current = {};
    stopAnyPlayback();
    session.reset();
    retakingRef.current = false;
    setReturningToFinalReview(false);
    awaitingReviewRef.current = false;
    setIsTurnReview(false);
    setIsRetaking(false);
    audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    audioUrlsRef.current = [];
    setTurnAudioBlobs({});
    setTurnAudioUrls({});
    setTurnTranscripts({});
    setPrepLeft(null);
    setResponseLeft(null);
    setTurnError("");
    setIsStarted(true);
    setIsFinished(false);
    setIsReviewModalOpen(false);
    setCurrentTurnIndex(0);
    setElapsedSeconds(0);
    setTurnsResults([]);
    setVadState("IDLE");

    // Unlock AudioContext an toàn bằng User Gesture
    const AudioCtx =
      window.AudioContext || (window as SpeechWindow).webkitAudioContext;
    if (AudioCtx) {
      if (audioContextRef.current && audioContextRef.current.state !== "closed")
        void audioContextRef.current.close();
      audioContextRef.current = new AudioCtx();
      audioContextRef.current.resume();
    }

    // Bot bắt đầu lượt 1 nếu lượt 1 là AI
    if (turns.length > 0 && turns[0].speaker === "AI") {
      scheduleBotAudio(turns[0], 500);
    } else {
      // A learner-first dialogue uses the same preparation policy.
      setPrepLeft(policy.preparation_time_seconds);
      setVadState("IDLE");
    }
  };

  // Nộp bài lên hệ thống (Gửi kèm toàn bộ audio của các lượt đối thoại)
  const handleFinalSubmit = async () => {
    if (!isFinished || awaitingReviewRef.current || startingRef.current || stoppingRef.current || isSubmitting || submitLockRef.current) return;
    submitLockRef.current = true;
    setPreparingSubmission(true);
    try {
      const userTurns = turns.filter(t => t.speaker === 'USER');
      if (!userTurns.length) throw new Error('Hội thoại không có lượt của người học');
      const packed = await Promise.all(userTurns.map(async turn => {
        const index = turns.indexOf(turn), blob = turnAudioBlobs[index];
        const result = turnsResults.find(r => r.turn_number === turn.turn_number);
        if (!blob || blob.size < 100 || !result?.recording_take_id) throw new Error('Hãy thu âm đủ từng lượt trước khi nộp bài');
        return { ...result, audio_url: undefined, audio_data: await blobToBase64(blob), mime_type: blob.type || 'audio/webm' };
      }));
      const duration = packed.reduce((sum, r) => sum + (r.speaking_duration_seconds ?? 0), 0);
      const transcript = userTurns.map(turn => transcriptsRef.current[turns.indexOf(turn)] || '').filter(Boolean).join('. ');
      if (mountedRef.current) await onSubmit(transcript, duration, undefined, selectedDifficulty, packed, recordingSubmissionRef.current);
    } catch (error) {
      if (mountedRef.current) toast.error(error instanceof Error ? error.message : 'Không thể chuẩn bị bản thu để nộp');
    } finally {
      submitLockRef.current = false;
      if (mountedRef.current) setPreparingSubmission(false);
    }
  };

  useEffect(() => {
    completeRef.current = handleCompleteUserTurn;
  }, [handleCompleteUserTurn]);
  const startRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    startRef.current = startUserTurnRecording;
  });
  useEffect(() => {
    if (prepLeft === null || showExitConfirm) return;
    if (prepLeft === 0) {
      void startRef.current();
      return;
    }
    const timer = setTimeout(
      () =>
        setPrepLeft((value) =>
          value === null ? null : Math.max(0, value - 1)
        ),
      1000
    );
    return () => clearTimeout(timer);
  }, [prepLeft, showExitConfirm]);
  useEffect(() => {
    if (responseLeft === null || showExitConfirm) return;
    if (responseLeft === 0) {
      completeRef.current("timeout");
      return;
    }
    const timer = setTimeout(
      () =>
        setResponseLeft((value) =>
          value === null ? null : Math.max(0, value - 1)
        ),
      1000
    );
    return () => clearTimeout(timer);
  }, [responseLeft, showExitConfirm]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleBackClick = () => {
    if (isSubmitting || submitLockRef.current) return;
    if (startingRef.current || stoppingRef.current) return;
    if (isStarted && !isFinished) {
      stopAnyPlayback();
      exitOpenRef.current = true; pausedAtRef.current = Date.now();
      if (graceTimerRef.current) { clearTimeout(graceTimerRef.current); graceTimerRef.current = null; }
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.pause();
      audioPlayerRef.current?.pause(); window.speechSynthesis?.pause();
      setShowExitConfirm(true);
    } else {
      onBack();
    }
  };

  const handleConfirmExit = () => {
    stopBotPlayback();
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    if (replayAudioRef.current) {
      replayAudioRef.current.pause();
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setShowExitConfirm(false);
    onBack();
  };

  const handleResume = () => {
    const pausedMs = pausedAtRef.current ? Date.now() - pausedAtRef.current : 0;
    pausedAtRef.current = 0; exitOpenRef.current = false;
    if (mediaRecorderRef.current?.state === 'paused') {
      recordingStartedAtRef.current += pausedMs;
      mediaRecorderRef.current.resume();
      setVadState(state => state === 'GRACE_PERIOD' ? 'SPEAKING' : state);
    }
    window.speechSynthesis?.resume();
    if (deferredBotEndRef.current) { deferredBotEndRef.current = false; handleBotFinished(); }
    else if (pendingBotRef.current) { const turn = pendingBotRef.current; pendingBotRef.current = null; void playBotAudio(turn); }
    else if (botSpeakingRef.current && audioPlayerRef.current?.paused) void audioPlayerRef.current.play().catch(() => { void playBotAudio(turns[currentTurnRef.current]); });
    setShowExitConfirm(false);
  };

  // =========================================================================
  // GIAO DIỆN 1: MÀN HÌNH CHỌN MỨC ĐỘ & PREVIEW BỐI CẢNH (TRƯỚC KHI BẮT ĐẦU)
  // =========================================================================
  if (!isStarted) {
    return (
      <PracticeKeyboard as="main" features={['record','submit']} data-speaking-workspace className="w-full px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            data-practice-action="exit" onClick={onBack}
            className="flex items-center gap-2 text-[14px] text-text-secondary hover:text-primary cursor-pointer"
          >
            <ArrowLeft size={18} />
            {isVietnamese ? "Quay lại danh sách" : "Back to list"}
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          {/* Header & Badges */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
            <div>
              <span className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-[12px] font-semibold text-indigo-700">
                {isVietnamese ? "Hội thoại tương tác" : "Interactive Dialogue"}
              </span>
              <h1 className="mt-2 text-[22px] font-bold text-text-primary">
                {exercise.title}
              </h1>
              {exercise.title_vi && (
                <p className="text-[14px] text-text-secondary">
                  {exercise.title_vi}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-surface-subtle px-3 py-2 text-[12px] text-text-secondary">
              <Users size={16} className="text-primary" />
              <span>
                {turns.length} {isVietnamese ? "lượt thoại" : "turns"}
              </span>
            </div>
          </div>

          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <section aria-label={isVietnamese ? "Đề bài và hướng dẫn" : "Task and instructions"}>
          {/* Bối cảnh tình huống cụ thể (Setting & Roles) */}
          <div className="mb-6 rounded-xl border border-primary/20 bg-primary/[0.03] p-4">
            <h3 className="mb-2 flex items-center gap-2 text-[14px] font-bold text-text-primary">
              <Sparkles size={16} className="text-primary" />
              {isVietnamese ? "Tình huống giao tiếp" : "Scenario Setting"}
            </h3>
            <p className="text-[13px] leading-relaxed text-text-secondary">
              {scenario?.setting_vi ||
                scenario?.setting ||
                exercise.description}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 pt-2 text-[12px]">
              <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-blue-700 font-medium">
                <span>👤 {isVietnamese ? "Bạn thủ vai:" : "You play:"}</span>
                <span className="font-bold">
                  {scenario?.user_role || "Customer"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-emerald-700 font-medium">
                <span>🤖 {isVietnamese ? "AI Bot:" : "AI Bot:"}</span>
                <span className="font-bold">
                  {scenario?.ai_role || "Assistant"}
                </span>
              </div>
            </div>

            {scenario?.overall_goals_vi &&
              scenario.overall_goals_vi.length > 0 && (
                <div className="mt-3 border-t border-primary/10 pt-2 text-[12px] text-text-secondary">
                  <span className="font-semibold text-text-primary">
                    {isVietnamese
                      ? "Mục tiêu giao tiếp của bạn:"
                      : "Your Communication Goals:"}
                  </span>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-text-secondary">
                    {scenario.overall_goals_vi.map((goal, idx) => (
                      <li key={idx}>{goal}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          </section>
          <section aria-label={isVietnamese ? "Chuẩn bị hội thoại" : "Conversation preparation"} className="min-w-0">
          {/* Bộ chọn 3 mức độ thích ứng (Scaffolding Levels) */}
          <div className="mb-6">
            <label className="mb-2.5 block text-[13px] font-bold text-text-primary">
              {isVietnamese
                ? "Chọn mức độ hỗ trợ luyện tập:"
                : "Choose Practice Scaffolding Level:"}
            </label>
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-3">
              {/* Mức DỄ */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty("EASY")}
                className={`relative flex flex-col rounded-xl border p-3.5 text-left transition cursor-pointer ${
                  selectedDifficulty === "EASY"
                    ? "border-emerald-500 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20"
                    : "border-border bg-surface hover:bg-surface-subtle"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[13px] text-emerald-700">
                  <span>🟢 {isVietnamese ? "Dễ" : "Easy"}</span>
                  {selectedDifficulty === "EASY" && <Check size={16} />}
                </div>
                <p className="mt-1 text-[11px] font-medium text-emerald-900">
                  {isVietnamese
                    ? "Nhìn câu mẫu & Đọc theo"
                    : "Assisted Read-Along"}
                </p>
                <p className="mt-1 text-[11px] text-text-tertiary">
                  {isVietnamese
                    ? "Hiện đầy đủ câu tiếng Anh + dịch nghĩa. Thích hợp luyện ngữ điệu."
                    : "Shows full English script + translation. Focus on delivery."}
                </p>
              </button>

              {/* Mức TRUNG BÌNH */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty("MEDIUM")}
                className={`relative flex flex-col rounded-xl border p-3.5 text-left transition cursor-pointer ${
                  selectedDifficulty === "MEDIUM"
                    ? "border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-500/20"
                    : "border-border bg-surface hover:bg-surface-subtle"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[13px] text-amber-700">
                  <span>🟡 {isVietnamese ? "Trung bình" : "Medium"}</span>
                  {selectedDifficulty === "MEDIUM" && <Check size={16} />}
                </div>
                <p className="mt-1 text-[11px] font-medium text-amber-900">
                  {isVietnamese ? "Gợi ý từ khóa & Mẫu câu" : "Guided Speaking"}
                </p>
                <p className="mt-1 text-[11px] text-text-tertiary">
                  {isVietnamese
                    ? "Ẩn câu mẫu, chỉ hiện nhiệm vụ và cụm từ gợi ý. Bạn tự dựng câu."
                    : "Hides full script. Shows goal + suggested phrase hints."}
                </p>
              </button>

              {/* Mức KHÓ */}
              <button
                type="button"
                onClick={() => setSelectedDifficulty("HARD")}
                className={`relative flex flex-col rounded-xl border p-3.5 text-left transition cursor-pointer ${
                  selectedDifficulty === "HARD"
                    ? "border-red-500 bg-red-50/50 shadow-sm ring-2 ring-red-500/20"
                    : "border-border bg-surface hover:bg-surface-subtle"
                }`}
              >
                <div className="flex items-center justify-between font-bold text-[13px] text-red-700">
                  <span>🔴 {isVietnamese ? "Khó" : "Hard"}</span>
                  {selectedDifficulty === "HARD" && <Check size={16} />}
                </div>
                <p className="mt-1 text-[11px] font-medium text-red-900">
                  {isVietnamese
                    ? "Tự thoại 100% (Phản xạ)"
                    : "Independent Role-play"}
                </p>
                <p className="mt-1 text-[11px] text-text-tertiary">
                  {isVietnamese
                    ? "Ẩn toàn bộ câu mẫu & từ vựng. Tự nghe Bot và tự đối thoại."
                    : "Zero scaffolding. Listen to Bot and respond freely."}
                </p>
              </button>
            </div>
          </div>

          {/* Nút Khởi động (User Gesture) */}
          <button
            type="button"
            data-practice-action="record" onClick={handleStartPractice}
                disabled={isSubmitting || preparingSubmission}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-[15px] font-bold text-white shadow-md hover:bg-primary/90 transition cursor-pointer"
          >
            <Play size={18} fill="currentColor" />
            <span>
              {isVietnamese ? "Bắt đầu cuộc hội thoại" : "Start Conversation"}
            </span>
            <PracticeRecordKey/>
          </button>
          </section>
          </div>
        </div>
      </PracticeKeyboard>
    );
  }

  // =========================================================================
  // GIAO DIỆN 2: MÀN HÌNH HỘI THOẠI TRỰC TIẾP (ACTIVE CHAT & TURN INTERACTION)
  // =========================================================================
  return (
    <PracticeKeyboard as="main" features={['record','submit']} data-speaking-workspace className="flex min-h-[calc(100dvh-4rem)] flex-col lg:h-[calc(100dvh-4rem)]">
      {/* Top Bar: Back, Title & Elapsed Stopwatch */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            data-practice-action="exit" onClick={handleBackClick}
            className="flex items-center gap-1.5 text-[13px] text-text-secondary hover:text-primary cursor-pointer"
          >
            <ArrowLeft size={16} />
            {isVietnamese ? "Thoát" : "Exit"}
          </button>
          <div>
            <h2 className="text-[16px] font-bold text-text-primary">
              {exercise.title}
            </h2>
            <p className="text-[12px] text-text-secondary">
              {scenario?.setting_vi || scenario?.setting}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Level badge */}
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {selectedDifficulty === "EASY"
              ? isVietnamese
                ? "🟢 Dễ"
                : "🟢 Easy"
              : selectedDifficulty === "MEDIUM"
              ? isVietnamese
                ? "🟡 Trung bình"
                : "🟡 Medium"
              : isVietnamese
              ? "🔴 Khó"
              : "🔴 Hard"}
          </span>

          {/* Elapsed Timer (Đếm tiến, không đếm ngược) */}
          <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-3 py-1 text-[13px] font-semibold text-text-primary shadow-xs">
            <Clock size={14} className="text-primary" />
            <span>{formatTimer(elapsedSeconds)}</span>
          </div>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section aria-label={isVietnamese ? "Đề bài và hướng dẫn" : "Task and instructions"} className="min-w-0 space-y-5 bg-surface p-4 sm:p-6 lg:w-1/2 lg:overflow-y-auto lg:border-r lg:border-border">
          <h2 className="text-sm font-semibold text-text-primary">{isVietnamese ? "Đề bài và hướng dẫn" : "Task and instructions"}</h2>
          <div className="rounded-xl border border-border p-4">
            <h3 className="mb-2 font-semibold text-text-primary">{isVietnamese ? "Tình huống giao tiếp" : "Conversation scenario"}</h3>
            <p className="text-sm leading-relaxed text-text-secondary">{isVietnamese ? scenario?.setting_vi || scenario?.setting : scenario?.setting}</p>
            <dl className="mt-4 space-y-2 text-sm">
              <div><dt className="inline text-text-secondary">{isVietnamese ? "Vai của bạn: " : "Your role: "}</dt><dd className="inline font-medium">{scenario?.user_role}</dd></div>
              <div><dt className="inline text-text-secondary">{isVietnamese ? "Vai AI: " : "AI role: "}</dt><dd className="inline font-medium">{scenario?.ai_role}</dd></div>
            </dl>
          </div>
          {isVietnamese && !!scenario?.overall_goals_vi?.length && <div className="rounded-xl border border-border p-4"><h3 className="mb-2 font-semibold">Mục tiêu giao tiếp</h3><ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary">{scenario.overall_goals_vi.map((goal, index) => <li key={index}>{goal}</li>)}</ul></div>}
        </section>
        <section aria-label={isVietnamese ? "Hội thoại của bạn" : "Your conversation"} className="min-w-0 border-t border-border bg-surface-subtle/50 p-4 sm:p-6 lg:w-1/2 lg:overflow-y-auto lg:border-t-0">
          <h2 className="mb-4 text-sm font-semibold text-text-primary">{isVietnamese ? "Hội thoại của bạn" : "Your conversation"}</h2>
      {/* Main Chat Stream / Turns Timeline */}
      <div className="space-y-6 sm:space-y-7 rounded-2xl border border-border bg-surface-subtle/50 p-4 sm:p-6 mb-5 min-h-[380px] max-h-[540px] overflow-y-auto">
        {turns.map((turn, index) => {
          const isPassed = index < currentTurnIndex;
          const isCurrent = index === currentTurnIndex;
          const isUserTurn = turn.speaker === "USER";

          // Chỉ render các turns đã qua hoặc turn đang diễn ra
          if (index > currentTurnIndex) return null;

          return (
            <div
              key={turn.turn_number}
              className={`flex flex-col ${
                isUserTurn ? "items-end" : "items-start"
              } transition-all`}
            >
              {/* Speaker Label */}
              <div className="mb-2 flex items-center gap-2 text-[11.5px] font-semibold text-text-tertiary">
                <span>{turn.speaker_name}</span>
                <span>• Turn {turn.turn_number}</span>
                {isCurrent && isBotSpeaking && !isUserTurn && (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <Volume2 size={12} className="animate-pulse" />
                    {isVietnamese ? "Đang nói..." : "Speaking..."}
                  </span>
                )}
                {isCurrent && isUserTurn && vadState !== "IDLE" && (
                  <span className="flex items-center gap-1 text-red-600 font-bold">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                    {isVietnamese ? "Đang thu âm..." : "Recording..."}
                  </span>
                )}
                {isCurrent && isUserTurn && vadState === "IDLE" && (
                  <span className="flex items-center gap-1 text-primary font-semibold">
                    <span>👉</span>
                    {isTurnReview
                      ? (isVietnamese ? "Bản thu đã sẵn sàng — Chờ bạn xác nhận" : "Recording ready — Waiting for your confirmation")
                      : (isVietnamese ? "Lượt của bạn — Bấm micro bên dưới" : "Your turn — Click mic below")}
                  </span>
                )}
              </div>

              {/* Chat Bubble */}
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4.5 sm:p-5 text-[13.5px] leading-relaxed shadow-xs transition ${
                  isUserTurn
                    ? isCurrent
                      ? "border-2 border-primary bg-primary text-white"
                      : "border border-primary/30 bg-primary/10 text-text-primary"
                    : isCurrent && isBotSpeaking
                    ? "border-2 border-emerald-500 bg-emerald-50/90 text-text-primary"
                    : "border border-border/70 bg-surface text-text-primary"
                }`}
              >
                {/* Content logic: Tùy theo Speaker & Difficulty */}
                {!isUserTurn ? (
                  // Turn của BOT: Luôn hiện câu nói
                  <div>
                    <p className="font-medium">{turn.text_en}</p>
                    {turn.text_vi && (
                      <p
                        className={`mt-1 text-[11px] italic ${
                          isCurrent && isBotSpeaking
                            ? "text-emerald-800"
                            : "text-text-tertiary"
                        }`}
                      >
                        {turn.text_vi}
                      </p>
                    )}

                    {/* Nút nghe lại câu nói của Bot */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => replayBotAudio(turn, index)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface/90 hover:bg-surface px-2.5 py-1 text-[11px] font-medium text-text-secondary hover:text-primary transition cursor-pointer shadow-2xs"
                        title={
                          isVietnamese
                            ? "Nghe lại phát âm của Bot"
                            : "Replay bot speech"
                        }
                      >
                        {playingAudioKey === `bot-${index}` ? (
                          <>
                            <Pause
                              size={12}
                              className="text-primary animate-pulse"
                            />
                            <span className="text-primary font-semibold">
                              {isVietnamese ? "Đang phát..." : "Playing..."}
                            </span>
                          </>
                        ) : (
                          <>
                            <Volume2 size={12} />
                            <span>
                              {isVietnamese ? "Nghe Bot" : "Play Audio"}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  // Turn của USER: Phụ thuộc vào mức độ đã chọn
                  <div>
                    {policy.show_hints && selectedDifficulty === "EASY" ? (
                      // DỄ: Hiện đầy đủ câu mẫu + dịch
                      <div>
                        <p
                          className={
                            isCurrent
                              ? "text-white font-medium"
                              : "text-text-primary"
                          }
                        >
                          {turn.text_en}
                        </p>
                        {turn.text_vi && (
                          <p
                            className={`mt-1 text-[11px] italic ${
                              isCurrent ? "text-white/80" : "text-text-tertiary"
                            }`}
                          >
                            {turn.text_vi}
                          </p>
                        )}
                      </div>
                    ) : policy.show_hints ? (
                      // TRUNG BÌNH: Ẩn câu mẫu, chỉ hiện nhiệm vụ + gợi ý
                      <div>
                        <div className="flex items-center gap-1 font-semibold text-[12px] mb-1">
                          <HelpCircle size={13} />
                          <span>
                            {isVietnamese ? "Nhiệm vụ của bạn:" : "Your goal:"}
                          </span>
                        </div>
                        <p
                          className={
                            isCurrent ? "text-white" : "text-text-primary"
                          }
                        >
                          {turn.user_guidance?.turn_goal_vi ||
                            turn.user_guidance?.goal_vi ||
                            turn.text_vi}
                        </p>
                        {turn.user_guidance?.suggested_phrases &&
                          turn.user_guidance.suggested_phrases.length > 0 && (
                            <div
                              className={`mt-2 rounded-lg p-2 text-[11px] ${
                                isCurrent
                                  ? "bg-black/20 text-white/90"
                                  : "bg-surface text-text-secondary"
                              }`}
                            >
                              <span className="font-semibold">
                                {isVietnamese ? "Gợi ý: " : "Hints: "}
                              </span>
                              {turn.user_guidance.suggested_phrases.join(" | ")}
                            </div>
                          )}
                      </div>
                    ) : (
                      // KHÓ: Tự thoại độc lập
                      <div>
                        <div className="flex items-center gap-1 font-semibold text-[12px]">
                          <Sparkles size={13} />
                          <span>
                            {isVietnamese
                              ? "Lượt của bạn (Tự phản xạ tự do)"
                              : "Your turn (Free response)"}
                          </span>
                        </div>
                        <p
                          className={`mt-1 text-[12px] ${
                            isCurrent ? "text-white/90" : "text-text-secondary"
                          }`}
                        >
                          {turn.user_guidance?.turn_goal_vi ||
                            turn.user_guidance?.goal_vi}
                        </p>
                      </div>
                    )}

                    {/* Hiển thị transcript người học đã nói (nếu turn đã qua) */}
                    {isPassed && turnTranscripts[index] && (
                      <div className="mt-2 border-t border-primary/20 pt-1.5 text-[11px] text-text-secondary">
                        <span className="font-semibold">
                          {isVietnamese ? "Bạn đã nói: " : "You said: "}
                        </span>
                        <span>&quot;{turnTranscripts[index]}&quot;</span>
                      </div>
                    )}

                    {/* Thanh nghe lại giọng người học và nút thu âm lại */}
                    {(turnAudioUrls[index] || turnAudioBlobs[index]) && (
                      <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-primary/20 pt-2">
                        <button
                          type="button"
                          onClick={() => replayUserAudio(index)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-white/95 text-primary hover:bg-white px-2.5 py-1 text-[11px] font-semibold shadow-xs transition cursor-pointer"
                        >
                          {playingAudioKey === `user-${index}` ? (
                            <>
                              <Pause
                                size={12}
                                className="text-primary animate-pulse"
                              />
                              <span>{isVietnamese ? "Tạm dừng" : "Pause"}</span>
                            </>
                          ) : (
                            <>
                              <Play size={12} fill="currentColor" />
                              <span>
                                {isVietnamese
                                  ? "Nghe lại giọng bạn"
                                  : "Replay your voice"}
                              </span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => requestRetake(index)}
                          disabled={
                            isSubmitting || preparingSubmission || isStopping || (!isFinished && !(isTurnReview && index === currentTurnIndex)) ||
                            isStarting ||
                            (session.counts["turn_" + turn.turn_number] || 0) >=
                              policy.max_record_attempts
                          }
                          className="inline-flex items-center gap-1 rounded-lg bg-black/15 hover:bg-black/25 text-white px-2 py-1 text-[11px] font-medium transition cursor-pointer"
                          title={
                            isVietnamese
                              ? "Thu âm lại câu này"
                              : "Retake this turn"
                          }
                        >
                          <RotateCcw size={11} />
                          <span>{isVietnamese ? "Thu lại" : "Retake"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activeTurn?.speaker === "USER" && !isFinished && (
        <div role="status" className="my-3 text-sm">
          {prepLeft !== null
            ? (isVietnamese ? "Chuẩn bị: " : "Preparation: ") + prepLeft + "s"
            : responseLeft !== null
            ? (isVietnamese ? "Còn lại: " : "Remaining: ") + responseLeft + "s"
            : ""}
          {" · "}
          {isVietnamese ? "Lượt thu: " : "Takes: "}
          {session.counts["turn_" + activeTurn.turn_number] || 0}/
          {policy.max_record_attempts}
          {turnError && (
            <p role="alert" className="text-red-600">
              {turnError}
            </p>
          )}
        </div>
      )}
      {activeTurn?.speaker === 'AI' && turnError && <p role="alert" className="my-3 text-sm text-red-600">{turnError}</p>}
      {isRetaking && !isTurnReview && !isFinished && turnAudioBlobs[currentTurnIndex] && <button type="button" disabled={isStarting || isStopping || vadState !== 'IDLE'} onClick={() => { setPrepLeft(null); setTurnError(''); setIsRetaking(false); awaitingReviewRef.current = true; setIsTurnReview(true); }} className="my-3 min-h-11 rounded-lg border border-border px-4 py-2 text-sm">{isVietnamese ? 'Giữ bản thu trước' : 'Keep previous recording'}</button>}
      {/* Controller Panel ở đáy màn hình */}
      {!isFinished ? (
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm">
          {activeTurn?.speaker === "AI" ? (
            // Trạng thái: BOT ĐANG NÓI
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Volume2 size={20} className="animate-bounce" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-text-primary">
                    {activeTurn.speaker_name}{" "}
                    {isVietnamese ? "đang nói..." : "is speaking..."}
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    {isVietnamese
                      ? "Hãy lắng nghe kỹ để chuẩn bị phản hồi"
                      : "Listen carefully to prepare your response"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBotFinished()}
                className="rounded-lg bg-surface-subtle px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:bg-border/60 transition cursor-pointer"
              >
                {isVietnamese ? "Bỏ qua audio bot" : "Skip bot audio"}
              </button>
            </div>
          ) : isTurnReview ? (
            <section aria-labelledby="dialogue-turn-review-title" data-practice-media className="space-y-4 rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
              <div>
                <h3 id="dialogue-turn-review-title" className="text-base font-semibold text-text-primary">
                  {isVietnamese ? "Kiểm tra bản thu của bạn" : "Review your recording"}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {recordingStopReason === 'timeout'
                    ? (isVietnamese ? 'Đã hết thời gian ghi âm. Bạn vẫn có thể nghe lại và thu lại nếu còn lượt.' : 'Recording time is up. You can still listen and retake if you have attempts left.')
                    : recordingStopReason === 'silence'
                    ? (isVietnamese ? 'Đã dừng ghi âm sau khoảng lặng. Hãy kiểm tra xem bạn đã nói đủ ý chưa.' : 'Recording stopped after a pause. Check that your response is complete.')
                    : (isVietnamese ? 'Nghe lại để kiểm tra phát âm và ý trả lời. Hội thoại sẽ chờ bạn xác nhận.' : 'Listen to check your pronunciation and response. The conversation waits for your confirmation.')}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" data-practice-action="play" disabled={isSubmitting || preparingSubmission} onClick={() => replayUserAudio(currentTurnIndex)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary">
                  {playingAudioKey === `user-${currentTurnIndex}` ? <Pause size={16} /> : <Play size={16} />}
                  {playingAudioKey === `user-${currentTurnIndex}` ? (isVietnamese ? 'Tạm dừng nghe lại' : 'Pause replay') : (isVietnamese ? 'Nghe lại bản thu' : 'Listen to recording')}
                </button>
                <button type="button" data-practice-action="record" disabled={isSubmitting || preparingSubmission || isStarting || isStopping || (session.counts['turn_' + activeTurn?.turn_number] || 0) >= policy.max_record_attempts} onClick={() => requestRetake(currentTurnIndex)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary disabled:cursor-not-allowed disabled:opacity-50">
                  <RotateCcw size={16} />
                  {isVietnamese ? 'Thu lại' : 'Retake'}
                  <span className="text-text-secondary">· {isVietnamese ? 'còn' : 'left'} {Math.max(0, policy.max_record_attempts - (session.counts['turn_' + activeTurn?.turn_number] || 0))}</span>
                  <PracticeRecordKey />
                </button>
                <button ref={reviewConfirmRef} type="button" disabled={isSubmitting || preparingSubmission || isStarting || isStopping} onClick={confirmUserTurn} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 sm:ml-auto sm:w-auto">
                  <CheckCircle2 size={17} />
                  {returningToFinalReview || currentTurnIndex === turns.length - 1
                    ? (isVietnamese ? 'Dùng bản thu này & Xem lại bài' : 'Use recording & Review dialogue')
                    : (isVietnamese ? 'Dùng bản thu này & Tiếp tục' : 'Use recording & Continue')}
                </button>
              </div>
              {(session.counts['turn_' + activeTurn?.turn_number] || 0) >= policy.max_record_attempts && <p role="status" className="text-sm text-text-secondary">{isVietnamese ? 'Đã hết lượt thu câu này. Bạn có thể nghe lại và dùng bản thu hiện tại để tiếp tục.' : 'No retakes left for this turn. You can listen and continue with the current recording.'}</p>}
            </section>
          ) : vadState === "IDLE" ? (
            // Trạng thái 1: LƯỢT CỦA BẠN (CHƯA BẬT MICRO - CHỜ USER BẤM NÚT)
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Mic size={22} />
                </div>
                <div>
                  <p className="text-[14px] font-bold text-text-primary">
                    {isVietnamese
                      ? "Đến lượt bạn phản hồi!"
                      : "Your turn to speak!"}
                  </p>
                  <p className="text-[12px] text-text-secondary">
                    {isVietnamese
                      ? "Đọc gợi ý hoặc câu thoại bên trên, sau đó bấm nút để bắt đầu nói"
                      : "Review the prompt above, then click the button when ready to speak"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                data-practice-action="record" onClick={() => void startUserTurnRecording()}
                disabled={
                  isSubmitting || preparingSubmission || isStopping ||
                  isStarting ||
                  (session.counts["turn_" + activeTurn?.turn_number] || 0) >=
                    policy.max_record_attempts
                }
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 rounded-xl bg-red-600 hover:bg-red-700 px-6 py-3 text-[14px] font-bold text-white shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Mic size={18} />
                <span>
                  {isVietnamese
                    ? "Bắt đầu ghi âm lượt trả lời"
                    : "Record your response"}
                </span>
              <PracticeRecordKey/>
              </button>
            </div>
          ) : (
            // Trạng thái 2: ĐANG GHI ÂM (MIC ĐANG BẬT & VAD HOẠT ĐỘNG)
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white ring-4 ring-red-200 animate-pulse">
                  <Mic size={22} />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600"></span>
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-bold text-red-600 flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-red-600 animate-ping" />
                      {vadState === "SPEAKING"
                        ? isVietnamese
                          ? "Đang ghi âm giọng nói..."
                          : "Recording your voice..."
                        : vadState === "WAITING_FOR_SPEECH"
                        ? (isVietnamese ? "Micro đã sẵn sàng — Hãy bắt đầu nói" : "Microphone ready — Start speaking")
                        : (isVietnamese ? "Khoảng lặng: sắp dừng để bạn nghe lại..." : "Pause detected: stopping soon for your review...")}
                    </p>

                    {/* Sóng âm Visualizer trực quan để user nhận biết mic đang bắt tiếng */}
                    <div className="flex items-end gap-0.5 h-4 px-1.5 py-0.5 rounded bg-red-50 border border-red-200">
                      <span
                        className="w-1 rounded-full bg-red-500 transition-all duration-75"
                        style={{
                          height: `${Math.max(
                            4,
                            Math.min(16, audioVolumeLevel * 0.3)
                          )}px`,
                        }}
                      />
                      <span
                        className="w-1 rounded-full bg-red-500 transition-all duration-75"
                        style={{
                          height: `${Math.max(
                            6,
                            Math.min(16, audioVolumeLevel * 0.6)
                          )}px`,
                        }}
                      />
                      <span
                        className="w-1 rounded-full bg-red-500 transition-all duration-75"
                        style={{
                          height: `${Math.max(
                            8,
                            Math.min(16, audioVolumeLevel * 0.9)
                          )}px`,
                        }}
                      />
                      <span
                        className="w-1 rounded-full bg-red-500 transition-all duration-75"
                        style={{
                          height: `${Math.max(
                            5,
                            Math.min(16, audioVolumeLevel * 0.4)
                          )}px`,
                        }}
                      />
                      <span className="text-[9px] font-bold text-red-600 ml-1">
                        REC
                      </span>
                    </div>
                  </div>

                  <p className="text-[12px] text-text-secondary mt-0.5">
                    {vadState === "GRACE_PERIOD"
                      ? isVietnamese
                        ? 'Bạn có thể nói tiếp hoặc dừng ghi âm để nghe lại'
                        : 'Keep speaking or stop recording to listen back'
                      : isVietnamese
                      ? 'Nói xong, bấm "Dừng ghi âm". Bạn sẽ được nghe lại trước khi tiếp tục.'
                      : 'Click "Stop recording" when finished. You can listen before continuing.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons: Chốt câu */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {/* NÚT CHỐT CÂU (DONE / NEXT TURN) */}
                <button
                  type="button"
                  data-practice-action="record" onClick={() => handleCompleteUserTurn()}
                  disabled={isStopping}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-[14px] font-bold text-white shadow-md transition-all cursor-pointer active:scale-95"
                >
                  <CheckCircle2 size={18} />
                  <span>
                    {isVietnamese ? "Dừng ghi âm" : "Stop recording"}
                  <PracticeRecordKey/>
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Trạng thái: ĐÃ HOÀN THÀNH TẤT CẢ CÁC LƯỢT THOẠI -> THANH THÔNG BÁO TỔNG KẾT GỌN GÀNG DƯỚI ĐÁY
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-text-primary">
                {isVietnamese
                  ? "Cuộc hội thoại đã hoàn thành!"
                  : "Conversation Completed!"}
              </p>
              <p className="text-[12px] text-text-secondary">
                {isVietnamese
                  ? `Đã hoàn tất tất cả ${
                      turns.length
                    } lượt thoại (${formatTimer(elapsedSeconds)}).`
                  : `Completed all ${turns.length} turns in ${formatTimer(
                      elapsedSeconds
                    )}.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleStartPractice}
                disabled={isSubmitting || preparingSubmission}
              className="rounded-xl border border-border bg-surface px-3 py-2 text-[12px] font-semibold text-text-secondary hover:text-text-primary transition cursor-pointer"
            >
              <RotateCcw size={14} className="inline mr-1" />
              <span>{isVietnamese ? "Luyện lại" : "Practice Again"}</span>
            </button>
            <button
              type="button"
              data-practice-action="submit-review" onClick={() => setIsReviewModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[13px] font-bold text-white shadow-md hover:bg-primary/90 transition cursor-pointer"
            >
              <Volume2 size={15} />
              <span>
                {isVietnamese
                  ? "Kiểm tra lượt thoại & Nộp bài"
                  : "Review & Submit"}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL: NGHE LẠI & KIỂM TRA CÁC LƯỢT THOẠI RỒI NỘP BÀI */}
      {isReviewModalOpen && (
        <div role="dialog" aria-modal="true" aria-label={isVietnamese ? "Xem lại hội thoại" : "Review dialogue"} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-surface shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 px-5 py-4 bg-surface-subtle/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-text-primary">
                    {isVietnamese
                      ? "Nghe lại & Kiểm tra các lượt thoại"
                      : "Review & Replay Audio Turns"}
                  </h3>
                  <p className="text-[12px] text-text-secondary">
                    {isVietnamese
                      ? `Hoàn tất tất cả ${
                          turns.length
                        } lượt thoại • Thời gian: ${formatTimer(
                          elapsedSeconds
                        )}`
                      : `Completed all ${
                          turns.length
                        } turns • Time: ${formatTimer(elapsedSeconds)}`}
                  </p>
                </div>
              </div>

              <button
                type="button"
                data-practice-dismiss onClick={() => setIsReviewModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:bg-border/60 hover:text-text-primary transition cursor-pointer"
                title={isVietnamese ? "Đóng" : "Close"}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Danh sách cuộn các lượt thoại */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4.5">
              <div className="rounded-xl bg-primary/[0.04] border border-primary/20 p-3 text-[12px] text-text-secondary">
                💡{" "}
                {isVietnamese
                  ? "Hãy nghe lại từng câu để kiểm tra chất lượng thu âm hoặc đối chiếu với câu thoại của Bot trước khi nộp bài cho AI."
                  : "Listen to each turn to verify audio clarity or compare your voice with the bot before submitting."}
              </div>

              {turns.map((turn, index) => {
                const isUser = turn.speaker === "USER";
                const userTranscript =
                  turnTranscripts[index] ||
                  (isUser
                    ? isVietnamese
                      ? "Chưa có bản chép lời; AI sẽ nghe bản thu."
                      : "No transcript yet; AI will assess the audio."
                    : turn.text_en);
                const hasUserAudio = Boolean(
                  turnAudioUrls[index] || turnAudioBlobs[index]
                );
                const isThisPlaying = isUser
                  ? playingAudioKey === `user-${index}`
                  : playingAudioKey === `bot-${index}`;

                return (
                  <div
                    key={turn.turn_number}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border p-4 sm:p-4.5 transition ${
                      isUser
                        ? "border-primary/20 bg-primary/[0.02]"
                        : "border-border/70 bg-surface-subtle/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            isUser
                              ? "bg-primary/10 text-primary"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {turn.speaker_name}
                        </span>
                        <span className="text-[11px] text-text-tertiary">
                          Turn {turn.turn_number}
                        </span>
                      </div>

                      <p className="text-[13px] font-medium text-text-primary">
                        {isUser ? `"${userTranscript}"` : turn.text_en}
                      </p>
                      {turn.text_vi && (
                        <p className="text-[11px] text-text-tertiary italic mt-0.5">
                          {turn.text_vi}
                        </p>
                      )}
                    </div>

                    {/* Action Controls for Turn */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isUser ? (
                        <button
                          type="button"
                          onClick={() => replayBotAudio(turn, index)}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold text-text-secondary hover:text-primary hover:border-primary transition cursor-pointer shadow-2xs"
                        >
                          {isThisPlaying ? (
                            <>
                              <Pause
                                size={13}
                                className="text-primary animate-pulse"
                              />
                              <span className="text-primary">
                                {isVietnamese ? "Tạm dừng" : "Pause"}
                              </span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={13} />
                              <span>
                                {isVietnamese ? "Nghe Bot" : "Bot Voice"}
                              </span>
                            </>
                          )}
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            disabled={!hasUserAudio}
                            onClick={() => replayUserAudio(index)}
                            className="flex items-center gap-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 text-[12px] font-semibold transition cursor-pointer disabled:opacity-40"
                          >
                            {isThisPlaying ? (
                              <>
                                <Pause size={13} className="animate-pulse" />
                                <span>
                                  {isVietnamese ? "Tạm dừng" : "Pause"}
                                </span>
                              </>
                            ) : (
                              <>
                                <Play size={13} fill="currentColor" />
                                <span>
                                  {isVietnamese ? "Nghe lại" : "Play My Voice"}
                                </span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => requestRetake(index)}
                            disabled={
                              isSubmitting || preparingSubmission || !isFinished ||
                              isStarting ||
                              (session.counts["turn_" + turn.turn_number] ||
                                0) >= policy.max_record_attempts
                            }
                            className="flex items-center gap-1 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-text-secondary hover:text-red-600 hover:border-red-300 transition cursor-pointer"
                            title={
                              isVietnamese
                                ? "Thu âm lại lượt này"
                                : "Retake this turn"
                            }
                          >
                            <RotateCcw size={12} />
                            <span>{isVietnamese ? "Thu lại" : "Retake"}</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 bg-surface-subtle/50 px-5 py-3.5">
              <button
                type="button"
                onClick={handleStartPractice}
                disabled={isSubmitting || preparingSubmission}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition cursor-pointer"
              >
                <RotateCcw size={14} />
                <span>
                  {isVietnamese ? "Luyện tập lại từ đầu" : "Practice Again"}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  data-practice-dismiss onClick={() => setIsReviewModalOpen(false)}
                  className="rounded-xl border border-border bg-surface px-4 py-2 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition cursor-pointer"
                >
                  {isVietnamese ? "Đóng" : "Close"}
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting || preparingSubmission}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2 text-[14px] font-bold text-white shadow-md hover:bg-primary/90 transition cursor-pointer disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>
                    {isSubmitting
                      ? isVietnamese
                        ? "Đang chấm điểm..."
                        : "Scoring..."
                      : isVietnamese
                      ? "Nộp bài & Nhận đánh giá AI"
                      : "Submit & Get AI Feedback"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

        </section>
      </div>

      {/* Modal xác nhận thoát phòng hội thoại */}
      <PracticeExitConfirmModal
        isOpen={showExitConfirm}
        onClose={handleResume}
        onConfirmExit={handleConfirmExit}
        title={
          isVietnamese ? "Rời khỏi phòng hội thoại?" : "Exit Dialogue Session?"
        }
        description={
          isVietnamese
            ? "Phiên đối thoại với AI đang diễn ra. Nếu thoát bây giờ, các lượt thoại bạn đã thu âm sẽ bị hủy bỏ."
            : "Interactive dialogue is in progress. If you exit now, your dialogue turns will be discarded."
        }
        savedNotice={
          isVietnamese
            ? "Hãy hoàn thành toàn bộ các lượt thoại để AI chấm điểm phản xạ và lưu kết quả vào tiến trình."
            : "Complete all turns to get AI evaluation and update your practice history."
        }
        confirmText={isVietnamese ? "Thoát hội thoại" : "Exit Session"}
        cancelText={isVietnamese ? "Tiếp tục hội thoại" : "Resume Dialogue"}
      />
    </PracticeKeyboard>
  );
}
