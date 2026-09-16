// Component ghi âm và nhập dàn ý cho câu hỏi TOEIC Speaking.

import { useEffect } from 'react'
import { Mic, Square, RotateCcw } from 'lucide-react'
import { Button } from '@/components/button'
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

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
        <Mic size={16} className="shrink-0 text-amber-600" />
        <span className="font-medium">
          {isVietnamese
            ? `Thời gian chuẩn bị: ${prepTimeSeconds || 45}s • Thời gian nói: ${responseTimeSeconds || 60}s`
            : `Prep Time: ${prepTimeSeconds || 45}s • Speaking Time: ${responseTimeSeconds || 60}s`}
        </span>
      </div>

      <div className="p-4 rounded-2xl border border-border bg-surface-subtle space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
            <Mic size={14} className="text-amber-600" />
            {isVietnamese ? 'Thu âm giọng nói của bạn:' : 'Voice Recording:'}
          </span>
          {isRecording && (
            <div className="flex items-center gap-2 text-xs font-bold text-red-600 animate-pulse">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600 inline-block" />
              <span>{Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}s</span>
            </div>
          )}
        </div>

        {isRecording && (
          <div className="space-y-1">
            <div className="w-full bg-surface-hover h-2 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full transition-all duration-75"
                style={{ width: `${Math.min(100, Math.max(5, micVolume * 100))}%` }}
              />
            </div>
            <p className="text-[10px] text-text-tertiary text-right">
              {isVietnamese ? 'Đang nhận tín hiệu micro...' : 'Detecting microphone audio...'}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!isRecording && !recordedUrl && !selectedOption?.startsWith('data:audio') && (
            <Button
              type="button"
              disabled={isSubmitted}
              onClick={startRecording}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-2 text-xs cursor-pointer"
            >
              <Mic size={14} />
              {isVietnamese ? 'Bắt đầu thu âm bài nói' : 'Start Voice Recording'}
            </Button>
          )}

          {isRecording && (
            <Button
              type="button"
              onClick={stopRecording}
              variant="destructive"
              className="font-bold gap-2 text-xs animate-pulse cursor-pointer"
            >
              <Square size={14} />
              {isVietnamese ? 'Dừng & Lưu bản thu âm' : 'Stop & Save Recording'}
            </Button>
          )}

          {(recordedUrl || selectedOption?.startsWith('data:audio')) && !isRecording && (
            <div className="flex flex-wrap items-center gap-3 w-full">
              <audio
                controls
                src={recordedUrl || selectedOption}
                className="h-9 max-w-xs flex-1"
              />
              {!isSubmitted && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetRecording()
                    onSelectAnswer('')
                  }}
                  className="gap-1.5 text-xs text-text-secondary cursor-pointer"
                >
                  <RotateCcw size={13} />
                  {isVietnamese ? 'Thu âm lại' : 'Re-record'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <textarea
        value={selectedOption?.startsWith('data:audio') ? '' : selectedOption || ''}
        onChange={(e) => onSelectAnswer(e.target.value)}
        disabled={isSubmitted || Boolean(recordedUrl || selectedOption?.startsWith('data:audio'))}
        rows={4}
        placeholder={
          selectedOption?.startsWith('data:audio')
            ? (isVietnamese ? 'Đã lưu tệp ghi âm giọng nói thành công.' : 'Voice recording saved.')
            : (isVietnamese
                ? 'Ghi chú dàn ý hoặc câu trả lời nói của bạn tại đây...'
                : 'Enter your speaking outline or response notes here...')
        }
        className="w-full rounded-xl border border-border bg-surface p-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors resize-y leading-relaxed disabled:opacity-80 disabled:bg-surface-subtle"
      />
    </div>
  )
}
