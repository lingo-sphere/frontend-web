/**
 * @file dictation.result.card.tsx
 * @description Component hiển thị kết quả kiểm tra, gợi ý và nút điều hướng tiếp tục bài dictation
 */

'use client'

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon.map'
import type { TranscriptSegment } from '@/types/listening'
import type { CheckedResults } from './dictation.input.box'

interface DictationResultCardProps {
  currentSegment: TranscriptSegment | undefined
  checkedResults: CheckedResults
  hasViewedCurrentResult: boolean
  isCurrentSegmentCompleted: boolean
  allSegmentsCompleted: boolean
  canSubmitCurrentSegment: boolean
  hasMoreHints: boolean
  currentSegmentHintsUsed: number
  isVietnamese: boolean
  onHint: () => void
  onNext: () => void
}

export function DictationResultCard({
  currentSegment,
  checkedResults,
  hasViewedCurrentResult,
  isCurrentSegmentCompleted,
  allSegmentsCompleted,
  canSubmitCurrentSegment,
  hasMoreHints,
  currentSegmentHintsUsed,
  isVietnamese,
  onHint,
  onNext,
}: DictationResultCardProps) {
  return (
    <>
      {hasViewedCurrentResult && !isCurrentSegmentCompleted && currentSegment && (
        <div className="mb-4 p-3 bg-surface-subtle rounded-lg">
          <h4 className="text-sm font-medium text-text-secondary mb-2">
            {isVietnamese ? 'Kết quả kiểm tra:' : 'Check results:'}
          </h4>
          {currentSegment.blanks.map((blank) => {
            const result = checkedResults[blank.id]
            if (!result) return null
            return (
              <div key={blank.id} className="flex items-center gap-2 mb-2">
                <Icon
                  name={result.isCorrect ? 'check' : 'x'}
                  size={16}
                  className={result.isCorrect ? 'text-success' : 'text-error'}
                />
                <span className="text-sm">
                  {result.isCorrect ? (
                    <span className="text-success">
                      {isVietnamese ? 'Đúng' : 'Correct'}: {result.userAnswer}
                    </span>
                  ) : (
                    <span>
                      <span className="text-error line-through">
                        {isVietnamese ? 'Sai' : 'Wrong'}: {result.userAnswer}
                      </span>
                      <span className="text-warning ml-2">
                        → {isVietnamese ? 'Đáp án' : 'Answer'}: {result.correctAnswer}
                      </span>
                    </span>
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <Button
          variant="outline"
          onClick={onHint}
          disabled={!hasMoreHints || isCurrentSegmentCompleted}
          className="border-primary text-primary cursor-pointer"
        >
          <Icon name="lightbulb" size={16} />
          <span className="ml-1">{isVietnamese ? 'Gợi ý' : 'Hint'}</span>
          {currentSegmentHintsUsed > 0 && (
            <span className="ml-1 text-xs opacity-70">
              ({currentSegmentHintsUsed})
            </span>
          )}
        </Button>
      </div>

      <Button
        onClick={onNext}
        disabled={!hasViewedCurrentResult && !canSubmitCurrentSegment}
        className="w-full bg-primary hover:bg-primary-hover cursor-pointer"
      >
        {!hasViewedCurrentResult ? (
          <>{isVietnamese ? 'Kiểm tra' : 'Check'}</>
        ) : isCurrentSegmentCompleted || allSegmentsCompleted ? (
          <>{isVietnamese ? 'Hoàn thành' : 'Complete'}</>
        ) : (
          <>{isVietnamese ? 'Tiếp tục' : 'Next'}</>
        )}
        <Icon
          name={!hasViewedCurrentResult ? 'check' : 'chevron-right'}
          size={16}
        />
      </Button>
    </>
  )
}
