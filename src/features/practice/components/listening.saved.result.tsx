'use client'

import { Button } from '@/components/button'
import { DictationWordDiff } from './dictation.word.diff'
import type { ListeningResult } from '../types/listening-lifecycle'

export function ListeningSavedResult({ result, vi, onBack, backLabel }: {
  result: ListeningResult
  vi: boolean
  onBack: () => void
  backLabel?: string
}) {
  return (
<>
            <h2 className="text-lg font-semibold text-text-primary">
              {vi ? 'Kết quả đã lưu' : 'Results saved'}: {result.score_percent}%
            </h2>
            <p className="text-sm text-text-secondary">
              {result.correct_count}/
              {result.total_questions ?? result.total_blanks}{' '}
              {vi ? 'câu/ô đúng' : 'correct'}
            </p>
            {result.details?.map((detail, index) => (
              <article
                key={`${detail.question_id}-${index}`}
                className="rounded-xl border border-border p-4 text-sm space-y-2"
              >
                <p className="font-semibold text-text-primary">
                  {vi ? 'Câu' : 'Question'} {index + 1} ·{' '}
                  {detail.is_correct
                    ? vi
                      ? 'Đúng'
                      : 'Correct'
                    : vi
                    ? 'Chưa đúng'
                    : 'Incorrect'}
                </p>
                <p>{detail.question_text}</p>
                <p>
                  {vi ? 'Bạn chọn:' : 'Your answer:'}{' '}
                  {detail.user_answer || (vi ? 'Bỏ qua' : 'Skipped')}
                </p>
                <p>
                  {vi ? 'Đáp án:' : 'Answer:'} {detail.correct_answer}
                </p>
                <p className="text-text-secondary">
                  {vi
                    ? detail.explanation_vi || detail.explanation
                    : detail.explanation}
                </p>
                {(detail.distractor_reason || detail.distractor_reason_vi) && (
                  <p className="text-text-secondary">
                    {vi
                      ? detail.distractor_reason_vi || detail.distractor_reason
                      : detail.distractor_reason}
                  </p>
                )}
              </article>
            ))}
            {result.segment_results?.map((segment) => (
              <article
                key={segment.segment_index}
                className="rounded-xl border border-border p-4 text-sm space-y-2"
              >
                <h3 className="font-semibold">
                  {vi ? 'Đoạn' : 'Segment'} {segment.segment_index + 1}
                </h3>
                <p>{segment.text}</p>
                {segment.answers.map((blank) => (
                  <div key={blank.blank_index} className="space-y-2">
                  <p>
                    {blank.blank_index + 1}. {blank.user_answer || '—'} →{' '}
                    {blank.correct_answer} ·{' '}
                    {blank.is_correct
                      ? vi
                        ? 'Đúng'
                        : 'Correct'
                      : vi
                      ? 'Chưa đúng'
                      : 'Incorrect'}
                  </p>
                  {!blank.is_correct && <DictationWordDiff answer={blank.user_answer || ''} expected={blank.correct_answer} vi={vi} />}
                  </div>
                ))}
              </article>
            ))}
            <Button onClick={onBack}>
              {backLabel || (vi ? 'Về danh sách' : 'Back to exercises')}
            </Button>
          </>
  )
}
