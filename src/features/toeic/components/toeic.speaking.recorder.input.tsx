// Giao diện ghi âm bài nói TOEIC Speaking chuyên nghiệp với sóng âm trực quan và đồng hồ đếm giờ.

import { useEffect } from 'react'
import { Mic, Square, RotateCcw, CheckCircle2, Clock, Volume2 } from 'lucide-react'
import { Button } from '@/components/button'
import { CustomAudioPlayer } from '@/components/custom.audio.player'
import { useSpeakingRecorder } from '@/features/practice/hooks/use.speaking.recorder'

interface ToeicSpeakingRecorderInputProps {
  prepTimeSeconds?: number
  responseTimeSeconds?: number
  selectedOption?: string
  isSubmitted: boolean
  isVietnamese: boolean
  onSelectAnswer: (answer: string) => void
}

export function ToeicSpeakingRecorderInput({
  prepTimeSeconds,
  responseTimeSeconds,
  selectedOption,
  isSubmitted,
  isVietnamese,
  onSelectAnswer,
}: ToeicSpeakingRecorderInputProps) {
  const {
    isRecording,
    recordingSeconds,
    recordedBlob,
    recordedUrl,
    micVolume,
    startRecording,
    stopRecording,
    resetRecording,
  } = useSpeakingRecorder()

  const maxSpeakingTime = responseTimeSeconds || 60

  useEffect(() => {
    if (isRecording && recordingSeconds >= maxSpeakingTime) {
      stopRecording()
    }
  }, [isRecording, recordingSeconds, maxSpeakingTime, stopRecording])

  useEffect(() => {
    if (recordedBlob && !selectedOption?.startsWith('data:audio')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onSelectAnswer(reader.result)
        }
      }
      reader.readAsDataURL(recordedBlob)
    }
  }, [recordedBlob, selectedOption, onSelectAnswer])

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const rem = secs % 60
    return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`
  }

  const hasRecordedAudio = Boolean(recordedUrl || selectedOption?.startsWith('data:audio'))
  const waveformHeights = [18, 32, 52, 74, 92, 64, 86, 100, 78, 96, 68, 48, 82, 58, 38, 22]

  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
          <Clock size={15} className="shrink-0 text-amber-600 dark:text-amber-400" />
          <span className="font-semibold">
            {isVietnamese ? 'Thời gian chuẩn bị:' : 'Preparation Time:'}{' '}
            <span className="font-bold">{prepTimeSeconds || 45}s</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
          <Volume2 size={15} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">
            {isVietnamese ? 'Thời gian trả lời tối đa:' : 'Max Response Time:'}{' '}
            <span className="font-bold">{maxSpeakingTime}s</span>
          </span>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface shadow-xs overflow-hidden">
        {isRecording ? (
          <div className="relative p-6 sm:p-7 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 text-white overflow-hidden">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-32 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-5">
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-bold tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block" />
                  <span>{isVietnamese ? 'REC • ĐANG THU ÂM' : 'REC • RECORDING'}</span>
                </div>

                <div className="font-mono text-base sm:text-lg font-bold tracking-wider text-red-400 flex items-center gap-1.5">
                  <span>{formatTime(recordingSeconds)}</span>
                  <span className="text-neutral-500 text-xs sm:text-sm font-normal">/ {formatTime(maxSpeakingTime)}</span>
                </div>
              </div>

              <div className="w-full flex items-center justify-center gap-1.5 sm:gap-2 h-16 my-2 px-2">
                {waveformHeights.map((base, idx) => {
                  const dynamicHeight = Math.max(
                    15,
                    Math.min(100, Math.round(base * 0.35 + (micVolume / 100) * base * 0.8))
                  )
                  return (
                    <span
                      key={idx}
                      style={{ height: `${dynamicHeight}%` }}
                      className="w-1.5 sm:w-2 rounded-full bg-gradient-to-t from-red-500 via-amber-400 to-amber-200 transition-all duration-75 ease-out shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                    />
                  )
                })}
              </div>

              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, (recordingSeconds / maxSpeakingTime) * 100)}%` }}
                />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-1">
                <Button
                  type="button"
                  onClick={stopRecording}
                  className="h-11 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold gap-2 text-xs shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer border-0"
                >
                  <Square size={14} className="fill-white" />
                  {isVietnamese ? 'Dừng & Lưu bản thu âm' : 'Stop & Save Recording'}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    resetRecording()
                    onSelectAnswer('')
                  }}
                  className="h-11 px-4 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800/80 font-medium text-xs gap-1.5 cursor-pointer transition-colors"
                >
                  <RotateCcw size={13} />
                  {isVietnamese ? 'Hủy bản ghi' : 'Discard'}
                </Button>
              </div>
            </div>
          </div>
        ) : hasRecordedAudio ? (
          <div className="p-5 sm:p-6 space-y-4 bg-surface">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                <CheckCircle2 size={14} />
                {isVietnamese ? 'Bản thu âm đã sẵn sàng' : 'Audio recording ready'}
              </span>

              {!isSubmitted && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetRecording()
                    onSelectAnswer('')
                  }}
                  className="gap-1.5 text-xs text-text-secondary hover:text-destructive hover:border-destructive/40 cursor-pointer rounded-lg"
                >
                  <RotateCcw size={13} />
                  {isVietnamese ? 'Thu âm lại' : 'Re-record'}
                </Button>
              )}
            </div>

            <CustomAudioPlayer
              src={recordedUrl || selectedOption}
              title={isVietnamese ? 'Nghe lại bản thu âm của bạn' : 'Review your recording'}
            />
          </div>
        ) : (
          <div className="p-7 sm:p-8 flex flex-col items-center justify-center text-center gap-4 bg-surface">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-xs">
              <Mic size={28} />
            </div>

            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-text-primary">
                {isVietnamese ? 'Sẵn sàng ghi âm câu trả lời' : 'Ready to record your answer'}
              </h4>
              <p className="text-xs text-text-tertiary">
                {isVietnamese
                  ? `Nhấn nút bên dưới để bắt đầu nói. Thời gian tối đa ${maxSpeakingTime} giây.`
                  : `Tap button below to start speaking. Max time is ${maxSpeakingTime} seconds.`}
              </p>
            </div>

            <Button
              type="button"
              disabled={isSubmitted}
              onClick={startRecording}
              className="h-11 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 text-xs shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Mic size={15} />
              {isVietnamese ? 'Bắt đầu thu âm bài nói' : 'Start Voice Recording'}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-text-secondary">
          {isVietnamese ? 'Dàn ý hoặc ghi chú bài nói (tùy chọn):' : 'Speaking outline or notes (optional):'}
        </label>
        <textarea
          value={selectedOption?.startsWith('data:audio') ? '' : selectedOption || ''}
          onChange={(e) => onSelectAnswer(e.target.value)}
          disabled={isSubmitted || hasRecordedAudio}
          rows={3}
          placeholder={
            hasRecordedAudio
              ? (isVietnamese ? 'Đã lưu tệp ghi âm giọng nói thành công.' : 'Voice recording saved.')
              : (isVietnamese
                  ? 'Ghi chú dàn ý hoặc các ý tưởng câu trả lời của bạn tại đây...'
                  : 'Enter your speaking outline or response notes here...')
          }
          className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors resize-y leading-relaxed disabled:opacity-80 disabled:bg-surface-subtle"
        />
      </div>
    </div>
  )
}
