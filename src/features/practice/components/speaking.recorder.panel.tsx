import { PracticeRecordKey } from './practice.keyboard'
import { resolveSpeakingPolicy } from '@/features/practice/lib/speaking-policy'
/**
 * @file speaking.recorder.panel.tsx
 * @description Bảng điều khiển ghi âm, đồng hồ đếm ngược và nghe lại bài nói của học viên
 */

import { Loader2, Mic, Pause, Play, RotateCcw, Square, Zap, Target, Trophy, Check } from 'lucide-react'
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
  canRetake: boolean
  takesUsed: number
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
  canRetake, takesUsed,
  isSubmitting = false,
}: SpeakingRecorderPanelProps) {
  // Lấy các mốc thời gian theo tier
  const easyPrep = resolveSpeakingPolicy(exercise, 'EASY').preparation_time_seconds
  const medPrep = resolveSpeakingPolicy(exercise, 'MEDIUM').preparation_time_seconds
  const hardPrep = resolveSpeakingPolicy(exercise, 'HARD').preparation_time_seconds

  const easySpeak = resolveSpeakingPolicy(exercise, 'EASY').response_time_seconds
  const medSpeak = resolveSpeakingPolicy(exercise, 'MEDIUM').response_time_seconds
  const hardSpeak = resolveSpeakingPolicy(exercise, 'HARD').response_time_seconds

  return (
    <Card className="dashboard-card">
      <CardContent className="p-6">
        <ol aria-label={isVietnamese ? 'Các bước làm bài nói' : 'Speaking steps'} className="mb-5 grid grid-cols-3 gap-2 border-b border-border pb-4 text-center text-xs">
          {(isVietnamese ? ['Chuẩn bị', 'Thu âm', 'Nghe lại & nộp'] : ['Prepare', 'Record', 'Review & submit']).map((label, index) => {
            const step = phase === 'reviewing' ? 2 : phase === 'recording' ? 1 : 0
            return <li key={label} aria-current={index === step ? 'step' : undefined} className={index === step ? 'font-semibold text-primary' : 'text-text-secondary'}><span className="mb-1 block">{index + 1}</span>{label}</li>
          })}
        </ol>
        <p className="mb-3 text-center text-sm text-text-secondary">{isVietnamese ? 'Lượt thu âm' : 'Takes'}: {takesUsed}/{resolveSpeakingPolicy(exercise, selectedTier).max_record_attempts}</p>
        {phase === 'idle' && (
          <div className="text-center">
            {/* Bộ chọn 3 mức độ thời gian (Phản xạ - Tiêu chuẩn - Thư thả) đồng bộ Writing & Reading */}
            {needsPreparation && (
              <div className="mb-6 rounded-2xl border border-border/80 bg-surface-subtle p-4 text-left">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[13px] font-semibold text-text-primary">
                    {isVietnamese ? 'Chế độ thời gian chuẩn bị & nói:' : 'Time Mode & Pace:'}
                  </span>
                  <span className="text-[11px] text-text-tertiary">
                    {isVietnamese ? 'Tùy chỉnh theo phong cách luyện tập của bạn' : 'Adjust to your training pace'}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                  {/* Mức 1: Phản xạ (Hard) */}
                  <button
                    type="button"
                    disabled={takesUsed > 0}
                    onClick={() => onSelectTier('HARD')}
                    className={`relative flex flex-col rounded-xl border-2 p-3 text-left transition cursor-pointer ${
                      selectedTier === 'HARD'
                        ? 'border-transparent bg-orange-500 text-white shadow-md'
                        : 'border-orange-200 bg-orange-50 text-orange-950 hover:scale-[1.02] hover:shadow-xs dark:bg-orange-950/20 dark:border-orange-900/40 dark:text-orange-200'
                    }`}
                  >
                    {selectedTier === 'HARD' && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-xs">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-orange-500 text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`rounded-full p-1.5 ${selectedTier === 'HARD' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600 dark:bg-orange-900/40'}`}>
                        <Zap className="h-4 w-4" />
                      </div>
                      <span className={`text-[13px] font-bold ${selectedTier === 'HARD' ? 'text-white' : 'text-orange-900 dark:text-orange-300'}`}>
                        {isVietnamese ? 'Phản xạ' : 'Reflex'}
                      </span>
                    </div>
                    <div className={`text-[14px] font-bold tracking-tight mb-1 ${selectedTier === 'HARD' ? 'text-white' : 'text-text-primary'}`}>
                      {hardPrep}s / {hardSpeak}s
                    </div>
                    <p className={`text-[11px] leading-tight ${selectedTier === 'HARD' ? 'text-white/80' : 'text-text-tertiary'}`}>
                      {isVietnamese
                        ? `Chuẩn bị ${hardPrep}s · Nói ${hardSpeak}s`
                        : `Prep ${hardPrep}s · Speak ${hardSpeak}s`}
                    </p>
                  </button>

                  {/* Mức 2: Tiêu chuẩn (Medium) */}
                  <button
                    type="button"
                    disabled={takesUsed > 0}
                    onClick={() => onSelectTier('MEDIUM')}
                    className={`relative flex flex-col rounded-xl border-2 p-3 text-left transition cursor-pointer ${
                      selectedTier === 'MEDIUM'
                        ? 'border-transparent bg-blue-500 text-white shadow-md'
                        : 'border-blue-200 bg-blue-50 text-blue-950 hover:scale-[1.02] hover:shadow-xs dark:bg-blue-950/20 dark:border-blue-900/40 dark:text-blue-200'
                    }`}
                  >
                    {selectedTier === 'MEDIUM' && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-xs">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-500 text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`rounded-full p-1.5 ${selectedTier === 'MEDIUM' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/40'}`}>
                        <Target className="h-4 w-4" />
                      </div>
                      <span className={`text-[13px] font-bold ${selectedTier === 'MEDIUM' ? 'text-white' : 'text-blue-900 dark:text-blue-300'}`}>
                        {isVietnamese ? 'Tiêu chuẩn' : 'Standard'}
                      </span>
                    </div>
                    <div className={`text-[14px] font-bold tracking-tight mb-1 ${selectedTier === 'MEDIUM' ? 'text-white' : 'text-text-primary'}`}>
                      {medPrep}s / {medSpeak}s
                    </div>
                    <p className={`text-[11px] leading-tight ${selectedTier === 'MEDIUM' ? 'text-white/80' : 'text-text-tertiary'}`}>
                      {isVietnamese
                        ? `Chuẩn bị ${medPrep}s · Nói ${medSpeak}s`
                        : `Prep ${medPrep}s · Speak ${medSpeak}s`}
                    </p>
                  </button>

                  {/* Mức 3: Thư thả (Easy) */}
                  <button
                    type="button"
                    disabled={takesUsed > 0}
                    onClick={() => onSelectTier('EASY')}
                    className={`relative flex flex-col rounded-xl border-2 p-3 text-left transition cursor-pointer ${
                      selectedTier === 'EASY'
                        ? 'border-transparent bg-green-500 text-white shadow-md'
                        : 'border-green-200 bg-green-50 text-green-950 hover:scale-[1.02] hover:shadow-xs dark:bg-green-950/20 dark:border-green-900/40 dark:text-green-200'
                    }`}
                  >
                    {selectedTier === 'EASY' && (
                      <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-xs">
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-green-500 text-white">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`rounded-full p-1.5 ${selectedTier === 'EASY' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-600 dark:bg-green-900/40'}`}>
                        <Trophy className="h-4 w-4" />
                      </div>
                      <span className={`text-[13px] font-bold ${selectedTier === 'EASY' ? 'text-white' : 'text-green-900 dark:text-green-300'}`}>
                        {isVietnamese ? 'Thư thả' : 'Relaxed'}
                      </span>
                    </div>
                    <div className={`text-[14px] font-bold tracking-tight mb-1 ${selectedTier === 'EASY' ? 'text-white' : 'text-text-primary'}`}>
                      {easyPrep}s / {easySpeak}s
                    </div>
                    <p className={`text-[11px] leading-tight ${selectedTier === 'EASY' ? 'text-white/80' : 'text-text-tertiary'}`}>
                      {isVietnamese
                        ? `Chuẩn bị ${easyPrep}s · Nói ${easySpeak}s`
                        : `Prep ${easyPrep}s · Speak ${easySpeak}s`}
                    </p>
                  </button>
                </div>
              </div>
            )}

            <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-primary/10">
              <Mic className="h-14 w-14 text-primary" />
            </div>

            <h2 className="mb-1.5 text-[18px] font-semibold text-text-primary">
              {isVietnamese ? 'Sẵn sàng để luyện?' : 'Ready to practice?'}
            </h2>
            <p className="mb-6 text-[13px] text-text-secondary">
              {needsPreparation
                ? isVietnamese
                  ? `Chuẩn bị ${resolveSpeakingPolicy(exercise, selectedTier).preparation_time_seconds}s · Nói ${resolveSpeakingPolicy(exercise, selectedTier).response_time_seconds}s.`
                  : `Selected pace: ${selectedTier}. You will have time to prepare before microphone activates.`
                : isVietnamese
                  ? 'Nhấn nút bên dưới để bắt đầu ghi âm.'
                  : 'Press the button below to start recording.'}
            </p>

            <Button
              size="lg"
              className="h-13 gap-2 bg-primary px-8 text-base font-semibold hover:bg-primary-hover cursor-pointer"
              data-practice-action="record" onClick={onStartPractice} disabled={!canRetake || isSubmitting}
            >
              <Mic size={20} />
              {needsPreparation
                ? isVietnamese ? 'Bắt đầu chuẩn bị' : 'Start Preparation'
                : isVietnamese ? 'Bắt đầu ghi âm' : 'Start recording'}
              <PracticeRecordKey/>
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
                    : (isVietnamese ? '🔴 Chế độ Khó (Thử thách)' : '🔴 Fast Pace')}
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
                ? 'Đọc kỹ đề bài và chuẩn bị ý chính. Micro sẽ tự động bật khi hết giờ.'
                : 'Review the task and prepare your main ideas. Recording begins automatically.'}
            </p>

            {/* Skip Button: Cho phép nói ngay không cần chờ */}
            <Button
              variant="outline"
              size="default"
              className="gap-2 border-primary/40 text-primary hover:bg-primary/10 cursor-pointer"
              data-practice-action="record" onClick={onSkipPreparation}
            >
              <Mic size={16} />
              <span>{isVietnamese ? 'Bắt đầu ghi âm ngay · bỏ qua chuẩn bị' : 'Record now · skip preparation'}</span>
              <PracticeRecordKey/>
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
                ? 'Nói câu trả lời của bạn. Dùng nút Dừng ghi âm khi xong.'
                : 'Speak your response. Press Stop when done.'}
            </p>

            <Button
              size="lg"
              variant="outline"
              className="h-14 gap-2 border-red-500 text-red-500 hover:bg-red-50"
              data-practice-action="record" onClick={onStopRecording}
            >
              <Square size={20} />
              {isVietnamese ? 'Dừng ghi âm' : 'Stop Recording'}
              <PracticeRecordKey/>
            </Button>
          </div>
        )}

        {phase === 'reviewing' && audioUrl && (
          <div className="text-center">
            <div data-practice-media tabIndex={0} aria-label={isVietnamese ? "Nghe lại bản ghi · Space để phát/tạm dừng" : "Recording player · Space to play/pause"} className="mb-6 rounded-lg focus-visible:outline-2 focus-visible:outline-primary">
              <audio ref={audioRef} src={audioUrl} />
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100">
                <Play className="h-12 w-12 text-emerald-600" />
              </div>

              <div className="mb-4 flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-full"
                  aria-label={isPlaying ? (isVietnamese ? 'Tạm dừng nghe lại' : 'Pause recording') : (isVietnamese ? 'Nghe lại bản ghi' : 'Play recording')}
                  data-practice-action="play" onClick={onPlayPause}
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
              <Button variant="outline" className="gap-2" onClick={onReset} disabled={!canRetake || isSubmitting}>
                <RotateCcw size={18} />
                {isVietnamese ? 'Làm lại' : 'Try Again'}
              </Button>
              <Button
                className="gap-2 bg-primary hover:bg-primary-hover min-w-[130px]"
                data-practice-action="submit" onClick={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isVietnamese ? 'AI đang phân tích...' : 'Evaluating...'}
                  </>
                ) : (
                  isVietnamese ? 'Nộp bài' : 'Submit'
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
