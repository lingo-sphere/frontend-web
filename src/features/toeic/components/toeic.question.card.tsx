// Component giao diện React ToeicQuestionCard hiển thị câu hỏi trắc nghiệm, bài viết và phần nói cho học viên.

import { useTranslation } from 'react-i18next'
import { Flag, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Badge } from '@/components/badge'
import { ToeicWritingEssayInput } from '@/features/toeic/components/toeic.writing.essay.input'
import { ToeicSpeakingRecorderInput } from '@/features/toeic/components/toeic.speaking.recorder.input'
import { ToeicMultipleChoiceOptions } from '@/features/toeic/components/toeic.multiple.choice.options'
import type { ToeicQuestion } from '@/features/toeic/types/toeic'

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
          <div className="flex items-center gap-1.5 max-w-md rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
            <span>{effectivePartTip}</span>
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
            <ToeicWritingEssayInput
              value={selectedOption}
              minWords={question.minWords}
              isSubmitted={isSubmitted}
              isVietnamese={isVietnamese}
              onChange={onSelectAnswer}
            />
          ) : isSpeaking ? (
            <ToeicSpeakingRecorderInput
              prepTimeSeconds={question.prepTimeSeconds}
              responseTimeSeconds={question.responseTimeSeconds}
              selectedOption={selectedOption}
              isSubmitted={isSubmitted}
              isVietnamese={isVietnamese}
              onSelectAnswer={onSelectAnswer}
            />
          ) : (
            <ToeicMultipleChoiceOptions
              options={question.options}
              selectedOption={selectedOption}
              correctOption={question.correctOption}
              showAnswer={showAnswer}
              isSubmitted={isSubmitted}
              onSelectAnswer={onSelectAnswer}
            />
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
