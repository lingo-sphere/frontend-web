/**
 * @file speaking.recorder.panel.tsx
 * @description Bảng điều khiển ghi âm, đồng hồ đếm ngược và nghe lại bài nói của học viên
 */

import { Mic, Pause, Play, RotateCcw, Square } from 'lucide-react'
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
  audioRef: React.RefObject<HTMLAudioElement | null>
  formatTime: (seconds: number) => string
  onStartPractice: () => void
  onStopRecording: () => void
  onPlayPause: () => void
  onReset: () => void
  onSubmit: () => void
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
  audioRef,
  formatTime,
  onStartPractice,
  onStopRecording,
  onPlayPause,
  onReset,
  onSubmit,
}: SpeakingRecorderPanelProps) {
  return (
    <Card className="dashboard-card">
      <CardContent className="p-6">
        {phase === 'idle' && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
              <Mic className="h-16 w-16 text-primary" />
            </div>

            <h2 className="mb-2 text-[18px] font-semibold text-text-primary">
              {isVietnamese ? 'Sẵn sàng để luyện?' : 'Ready to practice?'}
            </h2>
            <p className="mb-6 text-[14px] text-text-secondary">
              {needsPreparation
                ? `${isVietnamese ? 'Bạn có' : 'You have'} ${exercise.preparation_time_seconds || 30} ${isVietnamese ? 'giây để chuẩn bị.' : 'seconds to prepare.'}`
                : isVietnamese
                  ? 'Nhấn nút bên dưới để bắt đầu ghi âm.'
                  : 'Press the button below to start recording.'}
            </p>

            <Button
              size="lg"
              className="h-14 gap-2 bg-primary px-8 text-base font-semibold hover:bg-primary-hover"
              onClick={onStartPractice}
            >
              <Mic size={20} />
              {isVietnamese ? 'Bắt đầu luyện' : 'Start Practice'}
            </Button>
          </div>
        )}

        {phase === 'preparing' && (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-32 w-32 items-center justify-center rounded-full bg-amber-100">
              <span className="text-5xl font-bold text-amber-600">
                {preparationTimeLeft}
              </span>
            </div>

            <h2 className="mb-2 text-[18px] font-semibold text-text-primary">
              {isVietnamese ? 'Thời gian chuẩn bị' : 'Preparation Time'}
            </h2>
            <p className="text-[14px] text-text-secondary">
              {isVietnamese
                ? 'Hãy đọc kỹ nội dung và chuẩn bị câu trả lời.'
                : 'Read the content carefully and prepare your response.'}
            </p>
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
              <Button variant="outline" className="gap-2" onClick={onReset}>
                <RotateCcw size={18} />
                {isVietnamese ? 'Làm lại' : 'Try Again'}
              </Button>
              <Button
                className="gap-2 bg-primary hover:bg-primary-hover"
                onClick={onSubmit}
              >
                {isVietnamese ? 'Gửi kết quả' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
