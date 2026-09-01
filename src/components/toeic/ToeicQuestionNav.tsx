/**
 * @file ToeicQuestionNav.tsx
 * @description Component giao diện React ToeicQuestionNav cho học viên
 */

import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { ToeicQuestion } from '@/types/toeic'

interface ToeicQuestionNavProps {
  questions: ToeicQuestion[]
  answers: Record<number, string>
  flagged: number[]
  currentIndex: number
  currentPart?: number
  partTiming?: { questions: number; description: string }
  onGoToQuestion: (index: number) => void
}

export function ToeicQuestionNav({
  questions,
  answers,
  flagged,
  currentIndex,
  currentPart,
  partTiming,
  onGoToQuestion,
}: ToeicQuestionNavProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'
  const answeredCount = Object.keys(answers).length
  const totalCount = questions.length || 1

  return (
    <div className="space-y-4">
      <Card className="dashboard-card">
        <CardContent className="p-4">
          <h3 className="mb-3 text-[13px] font-semibold text-text-primary">
            {isVietnamese ? 'Câu hỏi' : 'Questions'}
          </h3>
          <div className="grid grid-cols-6 gap-1.5">
            {questions.map((q, index) => {
              const isAnswered = !!answers[q.questionNumber]
              const isFlagged = flagged.includes(q.questionNumber)
              const isCurrent = index === currentIndex

              return (
                <button
                  key={q.id}
                  onClick={() => onGoToQuestion(index)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-medium transition-colors ${
                    isCurrent
                      ? 'bg-primary text-white'
                      : isFlagged
                        ? 'bg-amber-100 text-amber-700'
                        : isAnswered
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-surface-subtle text-text-secondary hover:bg-surface-hover'
                  }`}
                >
                  {q.questionNumber}
                </button>
              )
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-emerald-100" />
              <span>{isVietnamese ? 'Đã trả lời' : 'Answered'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-surface-subtle" />
              <span>{isVietnamese ? 'Chưa trả lời' : 'Unanswered'}</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded bg-amber-100" />
              <span>{isVietnamese ? 'Đánh dấu' : 'Flagged'}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="dashboard-card">
        <CardContent className="p-4">
          <h3 className="mb-3 text-[13px] font-semibold text-text-primary">
            {isVietnamese ? 'Tiến độ' : 'Progress'}
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-[12px]">
              <span className="text-text-secondary">{isVietnamese ? 'Đã trả lời' : 'Answered'}</span>
              <span className="font-medium text-emerald-600">
                {answeredCount}/{totalCount}
              </span>
            </div>
            <Progress value={(answeredCount / totalCount) * 100} />
          </div>
        </CardContent>
      </Card>

      {currentPart && partTiming && (
        <Card className="dashboard-card">
          <CardContent className="p-4">
            <h3 className="mb-3 text-[13px] font-semibold text-text-primary">Part {currentPart} Info</h3>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between">
                <span className="text-text-secondary">{isVietnamese ? 'Số câu' : 'Questions'}</span>
                <span className="font-medium">{partTiming.questions || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">{isVietnamese ? 'Thời gian' : 'Time'}</span>
                <span className="font-medium">{partTiming.description || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
