/**
 * @file toeic.question.card.tsx
 * @description Component giao diện React ToeicQuestionCard cho học viên
 */

import { useTranslation } from 'react-i18next'
import { Flag, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ToeicQuestion } from '@/types/toeic'

interface ToeicQuestionCardProps {
  question: ToeicQuestion
  currentPart: number
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-primary">
            Part {currentPart}
          </Badge>
          {partName && <span className="text-[12px] text-text-secondary">{partName}</span>}
        </div>
        {partTip && (
          <div className="max-w-md rounded-lg bg-amber-50 px-3 py-1.5 text-[11px] text-amber-800">
            💡 {partTip}
          </div>
        )}
      </div>

      <Card className="dashboard-card relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFlag}
          className={`absolute right-3 top-3 ${
            isFlagged ? 'bg-amber-100 text-amber-600' : 'text-text-tertiary'
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

          {(showAnswer || isSubmitted) && question.explanationEn && (
            <div className="mt-4 rounded-xl bg-blue-500/10 border border-blue-500/20 p-3.5 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              <span className="font-bold">{isVietnamese ? 'Giải thích đáp án: ' : 'Explanation: '}</span>
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
