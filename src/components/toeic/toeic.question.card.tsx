// Component giao diện React ToeicQuestionCard hiển thị câu hỏi trắc nghiệm, bài viết và phần nói cho học viên.

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Flag, CheckCircle2, XCircle, ChevronLeft, ChevronRight, PenTool, Mic, Square, RotateCcw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSpeakingRecorder } from '@/hooks/use.speaking.recorder'
import type { ToeicQuestion } from '@/types/toeic'

interface ToeicQuestionCardProps {
  question: ToeicQuestion
  currentPart?: number | string
  partName?: string
  partTip?: string
  selectedOption?: string
  isFlagged: boolean
  showAnswer: boolean
  isSubmitted: boolean
  currentIndex: number
  totalQuestions: number
  onSelectAnswer: (key: string) => void
  onToggleFlag: () => void
  onPrev: () => void
  onNext: () => void
}

export function ToeicQuestionCard({
  question,
  currentPart,
  partName,
  partTip,
  selectedOption,
  isFlagged,
  showAnswer,
  isSubmitted,
  currentIndex,
  totalQuestions,
  onSelectAnswer,
  onToggleFlag,
  onPrev,
  onNext,
}: ToeicQuestionCardProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

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

  const isWriting =
    question.questionType === 'WRITING' ||
    question.questionType === 'ESSAY' ||
    question.skillType === 'WRITING' ||
    String(question.partNumber).toLowerCase().includes('writ')

  const isSpeaking =
    !isWriting &&
    (question.questionType === 'SPEAKING' ||
      question.skillType === 'SPEAKING' ||
      String(question.partNumber).toLowerCase().includes('speak'))

  const wordCount = (selectedOption || '').trim().split(/\s+/).filter(Boolean).length
  const minWords = question.minWords || 100

  const hasExplicitPart =
    typeof currentPart === 'number' &&
    currentPart >= 1 &&
    currentPart <= 7

  let badgeLabel = ''
  let badgeClass = 'bg-primary'
  if (isWriting) {
    badgeLabel = isVietnamese ? 'Kỹ năng Viết (Writing)' : 'Writing Task'
    badgeClass = 'bg-purple-600 text-white'
  } else if (isSpeaking) {
    badgeLabel = isVietnamese ? 'Kỹ năng Nói (Speaking)' : 'Speaking Task'
    badgeClass = 'bg-amber-600 text-white'
  } else if (hasExplicitPart) {
    if (question.skillType === 'LISTENING') {
      badgeLabel = isVietnamese ? `Part ${currentPart} (Nghe)` : `Part ${currentPart} (Listening)`
    } else {
      badgeLabel = isVietnamese ? `Part ${currentPart} (Đọc)` : `Part ${currentPart} (Reading)`
    }
  } else {
    if (question.skillType === 'LISTENING') {
      badgeLabel = isVietnamese ? 'Kỹ năng Nghe (Listening)' : 'Listening Section'
      badgeClass = 'bg-indigo-600 text-white'
    } else {
      badgeLabel = isVietnamese ? 'Kỹ năng Đọc (Reading)' : 'Reading Section'
      badgeClass = 'bg-emerald-600 text-white'
    }
  }

  const effectivePartTip =
    partTip ||
    (isWriting
      ? isVietnamese
        ? 'Đảm bảo cấu trúc rõ ràng, đủ luận điểm và đạt tối thiểu số từ yêu cầu.'
        : 'Ensure clear structure, coherence, and meet the minimum word count.'
      : isSpeaking
        ? isVietnamese
          ? 'Nói to rõ ràng, tự nhiên, bám sát các ý trọng tâm trong đề bài.'
          : 'Speak clearly, naturally, and cover all required prompt points.'
        : undefined)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="default" className={badgeClass}>
            {badgeLabel}
          </Badge>
          {hasExplicitPart && partName && partName !== badgeLabel && (
            <span className="text-[12px] text-text-secondary">{partName}</span>
          )}
        </div>
        {effectivePartTip && (
          <div className="max-w-md rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            💡 {effectivePartTip}
          </div>
        )}
      </div>

      <Card className="dashboard-card relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFlag}
          className={`absolute right-3 top-3 ${
            isFlagged ? 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400' : 'text-text-tertiary'
          }`}
          title={isVietnamese ? 'Đánh dấu câu hỏi' : 'Flag question'}
        >
          <Flag size={20} />
        </Button>
        <CardContent className="p-4">
          <p className="text-[14px] font-medium text-text-primary">
            {isVietnamese ? 'Câu' : 'Q'} {question.questionNumber}: {question.questionTextEn}
          </p>

          {question.imageMediaId && (
            <div className="my-3 max-w-md overflow-hidden rounded-xl border border-border">
              <img
                src={question.imageMediaId}
                alt={`Question ${question.questionNumber}`}
                className="w-full object-contain max-h-72"
              />
            </div>
          )}

          {question.audioMediaId && (
            <div className="my-3 max-w-md overflow-hidden rounded-xl border border-border bg-surface-subtle p-2">
              <audio controls src={question.audioMediaId} className="w-full h-10" />
            </div>
          )}

          {isWriting ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-text-secondary border-b border-border pb-2">
                <span className="font-semibold text-text-primary flex items-center gap-1.5">
                  <PenTool size={14} className="text-purple-600" />
                  {isVietnamese ? 'Bài làm của bạn:' : 'Your Written Response:'}
                </span>
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-full text-xs transition-colors ${
                    wordCount >= minWords
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}
                >
                  {isVietnamese ? 'Số từ: ' : 'Words: '}
                  {wordCount} / {minWords} {isVietnamese ? 'từ' : 'words'}
                </span>
              </div>

              <textarea
                value={selectedOption || ''}
                onChange={(e) => onSelectAnswer(e.target.value)}
                disabled={isSubmitted}
                rows={9}
                placeholder={
                  isVietnamese
                    ? 'Nhập bài viết của bạn tại đây (đáp ứng đúng yêu cầu của đề bài)...'
                    : 'Type your response here (satisfying prompt instructions)...'
                }
                className="w-full rounded-xl border border-border bg-surface p-3.5 text-sm text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors resize-y leading-relaxed disabled:opacity-80 disabled:bg-surface-subtle"
              />

              {wordCount > 0 && wordCount < minWords && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  {isVietnamese
                    ? `⚠️ Bài viết hiện có ${wordCount} từ, bạn cần viết thêm ít nhất ${minWords - wordCount} từ nữa để đạt yêu cầu.`
                    : `⚠️ Current length is ${wordCount} words, add at least ${minWords - wordCount} more words to reach target.`}
                </p>
              )}
            </div>
          ) : isSpeaking ? (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
                <Mic size={16} className="shrink-0 text-amber-600" />
                <span className="font-medium">
                  {isVietnamese
                    ? `Thời gian chuẩn bị: ${question.prepTimeSeconds || 45}s • Thời gian nói: ${question.responseTimeSeconds || 60}s`
                    : `Prep Time: ${question.prepTimeSeconds || 45}s • Speaking Time: ${question.responseTimeSeconds || 60}s`}
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
          ) : (
            <div className="mt-4 space-y-2">
              {question.options?.map((option) => {
                const isSelected = selectedOption === option.key
                const isCorrect = showAnswer && option.key === question.correctOption
                const isWrong = showAnswer && isSelected && option.key !== question.correctOption

                return (
                  <button
                    key={option.key}
                    onClick={() => onSelectAnswer(option.key)}
                    disabled={isSubmitted}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-50'
                        : isWrong
                          ? 'border-red-500 bg-red-50'
                          : isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[14px] font-medium ${
                        isCorrect
                          ? 'bg-emerald-500 text-white'
                          : isWrong
                            ? 'bg-red-500 text-white'
                            : isSelected
                              ? 'bg-primary text-white'
                              : 'bg-surface-subtle'
                      }`}
                    >
                      {option.key}
                    </span>
                    <span
                      className={`flex-1 text-[14px] ${
                        isCorrect
                          ? 'font-medium text-emerald-700'
                          : isWrong
                            ? 'text-red-700'
                            : 'text-text-primary'
                      }`}
                    >
                      {option.textEn}
                      {isCorrect && <CheckCircle2 size={14} className="ml-2 inline text-emerald-600" />}
                      {isWrong && <XCircle size={14} className="ml-2 inline text-red-600" />}
                    </span>
                  </button>
                )
              })}
            </div>
          )}

          {(showAnswer || isSubmitted) && question.explanationEn && (
            <div className="mt-4 rounded-xl bg-blue-500/10 border border-blue-500/20 p-3.5 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">
                {isWriting || isSpeaking
                  ? isVietnamese
                    ? 'Tiêu chí đánh giá & Bài mẫu: '
                    : 'Evaluation Criteria & Model Answer: '
                  : isVietnamese
                    ? 'Giải thích đáp án: '
                    : 'Explanation: '}
              </span>
              <span>{question.explanationEn}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onPrev} disabled={currentIndex === 0}>
          <ChevronLeft size={16} className="mr-1" />
          {isVietnamese ? 'Câu trước' : 'Previous'}
        </Button>
        <Button variant="outline" onClick={onNext} disabled={currentIndex === totalQuestions - 1}>
          {isVietnamese ? 'Câu sau' : 'Next'}
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </div>
    </div>
  )
}
