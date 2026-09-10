/**
 * @file listening.result.modal.tsx
 * @description Component giao diện React ListeningResultModal cho học viên
 */

import { Card, CardContent } from '@/components/card'
import { Button } from '@/components/button'
import { Icon } from '@/components/icon.map'
import type { ListeningExercise, ListeningAttempt } from '@/features/practice/types/listening'

interface ResultViewProps {
  exercise: ListeningExercise
  attempt: ListeningAttempt
  onBack: () => void
  onReview: () => void
  onRetry: () => void
}

export function ResultView({
  exercise,
  attempt,
  onBack,
  onReview,
  onRetry,
}: ResultViewProps) {
  const scoreColor =
    (attempt.accuracy || 0) >= 80
      ? 'text-success'
      : (attempt.accuracy || 0) >= 50
        ? 'text-warning'
        : 'text-error'

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          Kết quả luyện nghe
        </h2>
        <p className="text-text-secondary">{exercise.title}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-8 text-center">
          <div className={`text-6xl font-bold mb-2 ${scoreColor}`}>
            {attempt.accuracy}%
          </div>
          <p className="text-text-secondary mb-6">
            {attempt.totalCorrectBlanks} / {attempt.totalBlanks} từ đúng
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-surface-subtle rounded-xl">
              <div className="text-2xl font-bold text-text-primary">
                {Math.floor(attempt.totalTimeSeconds / 60)}:
                {String(attempt.totalTimeSeconds % 60).padStart(2, '0')}
              </div>
              <div className="text-xs text-text-tertiary">Thời gian</div>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl">
              <div className="text-2xl font-bold text-text-primary">
                {attempt.totalHintsUsed}
              </div>
              <div className="text-xs text-text-tertiary">Gợi ý đã dùng</div>
            </div>
            <div className="p-3 bg-surface-subtle rounded-xl">
              <div className="text-2xl font-bold text-text-primary">
                {attempt.totalReplays}
              </div>
              <div className="text-xs text-text-tertiary">Lần nghe lại</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {attempt.aiAnalysis && (
        <Card className="mb-6 bg-primary-5 border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="sparkles" className="text-primary" size={18} />
              <span className="font-semibold text-text-primary">
                Phân tích AI
              </span>
            </div>
            <p className="text-sm text-text-secondary mb-3">
              {attempt.aiAnalysis.suggestions[0]}
            </p>
            {attempt.aiAnalysis.weakAreas.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {attempt.aiAnalysis.weakAreas.map((area) => (
                  <span
                    key={area}
                    className="text-xs px-2 py-1 bg-primary-10 text-primary rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-3">
        <Button
          onClick={onReview}
          className="w-full bg-primary hover:bg-primary-hover"
        >
          <Icon name="clipboard-check" size={16} />
          Xem lại lỗi sai
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRetry}
            className="flex-1 border-border"
          >
            <Icon name="rotate-ccw" size={16} />
            Luyện lại
          </Button>
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 border-border"
          >
            <Icon name="home" size={16} />
            Quay về
          </Button>
        </div>
      </div>
    </main>
  )
}

interface ReviewViewProps {
  exercise: ListeningExercise
  attempt: ListeningAttempt
  onBack: () => void
  onContinue: () => void
}

export function ReviewView({
  exercise,
  attempt,
  onBack,
  onContinue,
}: ReviewViewProps) {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
        >
          <Icon name="arrow-left" size={20} />
          <span className="font-medium">Quay lại</span>
        </button>
        <h2 className="text-lg font-semibold text-text-primary">
          Xem lại lỗi sai
        </h2>
        <div />
      </div>

      <div className="space-y-4">
        {exercise.segments.map((segment, index) => {
          const segmentAnswer = attempt.segmentAnswers.find(
            (a) => a.segmentId === segment.id
          )
          const hasErrors = segmentAnswer?.blankResults.some(
            (r) => !r.isCorrect
          )

          return (
            <Card
              key={segment.id}
              className={
                hasErrors
                  ? 'border-error bg-error-5'
                  : 'border-success bg-success-5'
              }
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-sm font-medium text-text-primary">
                    Câu {index + 1}
                  </div>
                  {hasErrors ? (
                    <span className="text-xs px-2 py-1 bg-error-soft text-error rounded-full">
                      Cần ôn tập
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-success-soft text-success rounded-full">
                      Tốt
                    </span>
                  )}
                </div>

                <p className="text-text-primary mb-2">{segment.textEn}</p>
                {segment.textVi && (
                  <p className="text-sm text-text-tertiary mb-3">
                    {segment.textVi}
                  </p>
                )}

                {segmentAnswer?.blankResults.map((blankRes) => {
                  const blank = segment.blanks.find(
                    (b) => b.id === blankRes.blankId
                  )
                  if (!blank) return null

                  return (
                    <div
                      key={blankRes.blankId}
                      className={`p-2 rounded-lg mb-2 ${
                        blankRes.isCorrect ? 'bg-success-10' : 'bg-error-10'
                      }`}
                    >
                      <div className="text-xs text-text-tertiary mb-1">
                        {blank.answer}
                      </div>
                      {!blankRes.isCorrect && (
                        <div className="text-sm">
                          <span className="text-error line-through">
                            {blankRes.userAnswer || '(trống)'}
                          </span>
                          <span className="text-success ml-2">
                            → {blank.answer}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Button
        onClick={onContinue}
        className="w-full mt-6 bg-primary hover:bg-primary-hover"
      >
        Tiếp tục học
        <Icon name="arrow-right" size={16} />
      </Button>
    </main>
  )
}
