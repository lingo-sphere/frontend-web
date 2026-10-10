/**
 * @file speaking.recorder.panel.tsx
 * @description Bảng điều khiển ghi âm, đồng hồ đếm ngược và nghe lại bài nói của học viên
 */

import { Loader2, Mic, Pause, Play, RotateCcw, Square } from 'lucide-react'
import { Button } from '@/components/button'
import { Card, CardContent } from '@/components/card'
import type { SpeakingExercise, RecordingPhase } from '@/features/practice/types/speaking'

interface SpeakingRecorderPanelProps {
  phase: RecordingPhase
  exercise: SpeakingExercise
  preparationTimeLeft: number
  speakingTimeLeft: number
  duration: number
  audioUrl: string | null
  isPlaying: boolean
  isVietnamese: boolean
  needsPreparation: boolean
  selectedTier: 'EASY' | 'MEDIUM' | 'HARD'
  onSelectTier: (tier: 'EASY' | 'MEDIUM' | 'HARD') => void
  onSkipPreparation: () => void
  audioRef: React.RefObject<HTMLAudioElement | null>
  formatTime: (seconds: number) => string
  onStartPractice: () => void
  onStopRecording: () => void
  onPlayPause: () => void
  onReset: () => void
  onSubmit: () => void
  isSubmitting?: boolean
}

export function SpeakingRecorderPanel({
  phase,
  exercise,
  preparationTimeLeft,
  speakingTimeLeft,
  duration,
  audioUrl,
  isPlaying,
  isVietnamese,
  needsPreparation,
  selectedTier,
  onSelectTier,
  onSkipPreparation,
  audioRef,
  formatTime,
  onStartPractice,
  onStopRecording,
  onPlayPause,
  onReset,
  onSubmit,
  isSubmitting = false,
}: SpeakingRecorderPanelProps) {
  // Lấy các mốc thời gian theo tier
  const easyPrep = exercise.tiered_time_limits?.easy?.preparation_time_seconds || 60
  const medPrep = exercise.tiered_time_limits?.medium?.preparation_time_seconds || 45
  const hardPrep = exercise.tiered_time_limits?.hard?.preparation_time_seconds || 20

  const easySpeak = exercise.tiered_time_limits?.easy?.response_time_seconds || 45
  const medSpeak = exercise.tiered_time_limits?.medium?.response_time_seconds || 45
  const hardSpeak = exercise.tiered_time_limits?.hard?.response_time_seconds || 30

  return (
    <Card className="dashboard-card">
      <CardContent className="p-6">
        {phase === 'idle' && (
          <div className="text-center">
            {/* Bộ chọn 3 mức độ thời gian chuẩn bị (Dễ - Trung bình - Nhanh) */}
            {needsPreparation && (
              <div className="mb-6 rounded-2xl border border-border/80 bg-surface-subtle p-4 text-left">
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-text-primary">
                    {isVietnamese ? 'Chọn mức thời gian chuẩn bị:' : 'Choose preparation pace:'}
                  </span>
                  <span className="text-[11px] text-text-tertiary">
                    {isVietnamese ? 'Tùy chỉnh theo trình độ của bạn' : 'Adjust to your level'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {/* Mức 1: Dễ */}
                  <button
                    type="button"
                    onClick={() => onSelectTier('EASY')}
                    className={`flex flex-col rounded-xl border p-3 text-left transition cursor-pointer ${
                      selectedTier === 'EASY'
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-xs ring-1 ring-emerald-500'
                        : 'border-border/80 bg-surface hover:border-emerald-400/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">
                        {isVietnamese ? 'Dễ (Thư thả)' : 'Relaxed (Easy)'}
                      </span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {easyPrep}s
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      {isVietnamese
                        ? `Chuẩn bị ${easyPrep}s • Nói ${easySpeak}s. Đọc kỹ tranh & từ vựng.`
                        : `Prep ${easyPrep}s • Speak ${easySpeak}s. Ideal for beginners.`}
                    </p>
                  </button>

                  {/* Mức 2: Trung bình */}
                  <button
                    type="button"
                    onClick={() => onSelectTier('MEDIUM')}
                    className={`flex flex-col rounded-xl border p-3 text-left transition cursor-pointer ${
                      selectedTier === 'MEDIUM'
                        ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                        : 'border-border/80 bg-surface hover:border-primary/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold text-primary">
                        {isVietnamese ? 'Trung bình (Chuẩn)' : 'Standard (Medium)'}
                      </span>
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
                        {medPrep}s
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      {isVietnamese
                        ? `Chuẩn bị ${medPrep}s • Nói ${medSpeak}s. Tiêu chuẩn thi TOEIC/IELTS.`
                        : `Prep ${medPrep}s • Speak ${medSpeak}s. Standard exam pace.`}
                    </p>
                  </button>

                  {/* Mức 3: Nhanh */}
                  <button
                    type="button"
                    onClick={() => onSelectTier('HARD')}
                    className={`flex flex-col rounded-xl border p-3 text-left transition cursor-pointer ${
                      selectedTier === 'HARD'
                        ? 'border-amber-600 bg-amber-500/10 shadow-xs ring-1 ring-amber-600'
                        : 'border-border/80 bg-surface hover:border-amber-400/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold text-amber-700 dark:text-amber-400">
                        {isVietnamese ? 'Nhanh (Phản xạ)' : 'Fast (Challenge)'}
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        {hardPrep}s
                      </span>
                    </div>
                    <p className="text-[11px] text-text-secondary">
                      {isVietnamese
                        ? `Chuẩn bị ${hardPrep}s • Nói ${hardSpeak}s. Rèn phản xạ tức thì.`
                        : `Prep ${hardPrep}s • Speak ${hardSpeak}s. Quick reaction mode.`}
                    </p>
                  </button>
                </div>
              </div>
            )}

            <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Mic className="h-14 w-14 text-primary" />
            </div>

            <h2 className="mb-1.5 text-[18px] font-semibold text-text-primary">
              {isVietnamese ? 'Sẵn sàng để luyện?' : 'Ready to practice?'}
            </h2>
            <p className="mb-6 text-[13px] text-text-secondary">
              {needsPreparation
                ? isVietnamese
                  ? `Chế độ đã chọn: ${selectedTier === 'EASY' ? 'Dễ (60s)' : selectedTier === 'MEDIUM' ? 'Trung bình (45s)' : 'Nhanh (20s)'}. Bạn có thời gian chuẩn bị trước khi micro bật.`
                  : `Selected pace: ${selectedTier}. You will have time to prepare before microphone activates.`
                : isVietnamese
                  ? 'Nhấn nút bên dưới để bắt đầu ghi âm.'
                  : 'Press the button below to start recording.'}
            </p>

            <Button
              size="lg"
              className="h-13 gap-2 bg-primary px-8 text-base font-semibold hover:bg-primary-hover shadow-md cursor-pointer"
              onClick={onStartPractice}
            >
              <Mic size={20} />
              {needsPreparation
                ? isVietnamese ? 'Bắt đầu chuẩn bị' : 'Start Preparation'
                : isVietnamese ? 'Bắt đầu luyện' : 'Start Practice'}
            </Button>
          </div>
        )}

        {phase === 'preparing' && (
          <div className="text-center">
            {/* Countdown Badge & Circular Display */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[12px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
              <span>
                {selectedTier === 'EASY'
                  ? (isVietnamese ? '🟢 Chế độ Dễ (Thư thả)' : '🟢 Relaxed Pace')
                  : selectedTier === 'MEDIUM'
                    ? (isVietnamese ? '🟡 Chế độ Trung bình (Tiêu chuẩn)' : '🟡 Standard Pace')
                    : (isVietnamese ? '🔴 Chế độ Nhanh (Thử thách)' : '🔴 Fast Pace')}
              </span>
            </div>

            <div className="mx-auto mb-5 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-amber-50 shadow-inner dark:from-amber-950/50 dark:to-amber-900/20">
              <span className="text-5xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight animate-pulse">
                {preparationTimeLeft}
              </span>
            </div>

            <h2 className="mb-1 text-[18px] font-bold text-text-primary">
              {isVietnamese ? 'Thời gian quan sát & chuẩn bị' : 'Preparation Time'}
            </h2>
            <p className="mb-4 text-[13px] text-text-secondary max-w-md mx-auto">
              {isVietnamese
                ? 'Hãy nhìn kỹ tranh, tham khảo dàn ý 4 bước và nhặt các từ vựng cần thiết. Micro sẽ tự động bật khi hết giờ.'
                : 'Observe the picture carefully and review guided steps. Recording begins automatically.'}
            </p>

            {/* Skip Button: Cho phép nói ngay không cần chờ */}
            <Button
              variant="outline"
              size="default"
              className="gap-2 border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
              onClick={onSkipPreparation}
            >
              <Mic size={16} />
              <span>{isVietnamese ? 'Tôi đã sẵn sàng — Bắt đầu nói ngay' : 'I am ready — Start speaking now'}</span>
            </Button>
          </div>
        )}

        {phase === 'recording' && (
          <div className="text-center">
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="relative">
                <div className="h-32 w-32 animate-pulse rounded-full bg-red-500/20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Mic className="h-16 w-16 text-red-500" />
                </div>
              </div>
              <div className="h-32 w-32 animate-pulse rounded-full bg-red-500/10" />
            </div>

            <div className="mb-4">
              <span className="text-4xl font-bold text-red-500">
                {formatTime(speakingTimeLeft)}
              </span>
            </div>

            <h2 className="mb-2 text-[18px] font-semibold text-red-500">
              {isVietnamese ? 'Đang ghi âm...' : 'Recording...'}
            </h2>
            <p className="mb-6 text-[14px] text-text-secondary">
              {isVietnamese
                ? 'Nói câu trả lời của bạn. Nhấn Stop khi xong.'
                : 'Speak your response. Press Stop when done.'}
            </p>

            <Button
              size="lg"
              variant="outline"
              className="h-14 gap-2 border-red-500 text-red-500 hover:bg-red-50"
              onClick={onStopRecording}
            >
              <Square size={20} />
              {isVietnamese ? 'Dừng ghi' : 'Stop Recording'}
            </Button>
          </div>
        )}

        {phase === 'reviewing' && audioUrl && (
          <div className="text-center">
            <div className="mb-6">
              <audio ref={audioRef} src={audioUrl} />
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                <Play className="h-12 w-12 text-emerald-600" />
              </div>

              <div className="mb-4 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  onClick={onPlayPause}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                </Button>
              </div>

              <p className="text-[14px] text-text-secondary">
                {isVietnamese ? 'Thời gian ghi âm:' : 'Recording time:'}{' '}
                {formatTime(duration)}
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="outline" className="gap-2" onClick={onReset} disabled={isSubmitting}>
                <RotateCcw size={18} />
                {isVietnamese ? 'Làm lại' : 'Try Again'}
              </Button>
              <Button
                className="gap-2 bg-primary hover:bg-primary-hover min-w-[130px]"
                onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isVietnamese ? 'AI đang phân tích...' : 'Evaluating...'}
                  </>
                ) : (
                  isVietnamese ? 'Gửi kết quả' : 'Submit'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
