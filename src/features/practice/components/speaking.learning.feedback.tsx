'use client'

import { useTranslation } from 'react-i18next'
import { useState, type ReactNode } from 'react'
import type { SpeakingLearningIssue, AIEvaluationResult } from '../types/speaking'
import { SpeakingGrammarActions } from './speaking.grammar.actions'
import { Volume2, RotateCcw, Sparkles } from 'lucide-react'

export function SpeakingLearningFeedback({
  issues,
  assessments,
  onPlay,
  onPractice,
  renderSaveAction,
  attemptId,
  className,
}: {
  issues: SpeakingLearningIssue[]
  assessments?: AIEvaluationResult['azure_assessments']
  onPlay?: (issue: SpeakingLearningIssue) => void
  onPractice?: (issue: SpeakingLearningIssue) => void
  renderSaveAction?: (issue: SpeakingLearningIssue) => ReactNode
  attemptId?: string
  className?: string
}) {
  const { i18n } = useTranslation()
  const vi = i18n.language.startsWith('vi')
  const [kind, setKind] = useState('ALL')
  const labels: Record<string, string> = {
    ALL: vi ? 'Tất cả' : 'All',
    PRONUNCIATION: vi ? 'Phát âm' : 'Pronunciation',
    GRAMMAR: vi ? 'Ngữ pháp' : 'Grammar',
    VOCABULARY: vi ? 'Từ vựng' : 'Vocabulary',
  }

  const categoryBadges: Record<string, string> = {
    PRONUNCIATION: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
    GRAMMAR: 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border-purple-200 dark:border-purple-900/60',
    VOCABULARY: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
  }

  return (
    <section
      className={className || "my-6 rounded-2xl border border-border bg-surface p-4 sm:p-6"}
      aria-labelledby="speaking-learning-feedback"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Sparkles size={18} />
        </div>
        <div>
          <h2 id="speaking-learning-feedback" className="text-base font-bold text-text-primary sm:text-lg">
            {vi ? 'Sửa lỗi & ôn tập cá nhân hóa' : 'Corrections & Personalized Review'}
          </h2>
          <p className="text-xs text-text-secondary">
            {vi
              ? 'Phát âm được đo trực tiếp từ audio bằng Azure. Lỗi ngôn ngữ do AI phân tích từ lời nhận dạng.'
              : 'Pronunciation measured via Azure Speech. AI analyzes syntax and lexical phrasing.'}
          </p>
        </div>
      </div>

      {assessments?.some((a) =>
        a.assessment.words.some((w) => w.accuracy != null && w.accuracy < 40),
      ) && (
        <p
          role="note"
          className="mt-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-text-primary"
        >
          {vi
            ? 'Một số từ có tín hiệu phát âm rất yếu nên bản nhận dạng có thể chưa đúng. Hệ thống không dùng các cụm chứa từ này để tự kết luận lỗi ngữ pháp/từ vựng. Hãy nghe lại để kiểm chứng.'
            : 'Some words have very weak pronunciation evidence and may be misrecognized. Replay your recording to verify.'}
        </p>
      )}

      {/* Filter Tabs */}
      <div
        className="my-3 flex flex-wrap gap-1.5 border-b border-border/60 pb-3"
        aria-label={vi ? 'Lọc loại lỗi' : 'Filter error types'}
      >
        {Object.entries(labels).map(([value, label]) => {
          const count = issues.filter((i) => value === 'ALL' || i.kind === value).length
          const active = kind === value
          return (
            <button
              type="button"
              key={value}
              aria-pressed={active}
              onClick={() => setKind(value)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                active
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-text-secondary hover:bg-surface hover:text-text-primary'
              }`}
            >
              <span>{label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                  active ? 'bg-white/20 text-white' : 'bg-border text-text-secondary'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {!issues.length && (
        <p className="text-sm text-text-secondary italic py-4 text-center">
          {vi
            ? 'Chưa ghi nhận lỗi cụ thể có đủ minh chứng. Xem thêm các tiêu chí đánh giá.'
            : 'No specific errors recorded. Review the subskill rubric.'}
        </p>
      )}

      <div className="space-y-3">
        {issues
          .filter((i) => kind === 'ALL' || i.kind === kind)
          .map((issue, index) => {
            const badgeClass = categoryBadges[issue.kind] || 'bg-surface-subtle text-text-secondary border-border'
            return (
              <article
                key={`${issue.exercise_id || ''}:${issue.turn_number}:${issue.kind}:${index}`}
                className="rounded-xl border border-border bg-surface p-4 transition hover:border-border/80 shadow-xs"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary mb-2">
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
                    {labels[issue.kind]}
                  </span>
                  <span>
                    {issue.turn_number
                      ? `${vi ? 'Lượt' : 'Turn'} ${issue.turn_number}`
                      : vi
                      ? 'Bản thu'
                      : 'Recording'}
                  </span>
                  <span>·</span>
                  <span>{issue.source === 'AZURE_SPEECH' ? 'Azure Speech' : 'AI Analysis'}</span>
                  {issue.accuracy != null && (
                    <span className="font-semibold text-text-primary">
                      · {issue.accuracy}/100
                    </span>
                  )}
                  {issue.occurrences && issue.occurrences > 1 ? (
                    <span className="text-amber-600 font-medium">
                      ({vi ? `Lặp lại ${issue.occurrences} lần` : `${issue.occurrences} times`})
                    </span>
                  ) : null}
                </div>

                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 break-words text-sm font-medium text-text-primary">
                    <span className="line-through decoration-red-400 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded font-medium text-xs sm:text-sm">
                      “{issue.original}”
                    </span>
                    {issue.kind !== 'PRONUNCIATION' && issue.corrected && (
                      <>
                        {' '}→{' '}
                        <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded font-semibold text-xs sm:text-sm">
                          “{issue.corrected}”
                        </span>
                      </>
                    )}
                  </div>
                  {issue.kind === 'PRONUNCIATION' && renderSaveAction?.(issue)}
                </div>

                {issue.explanation && (
                  <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    💡 {issue.explanation}
                  </p>
                )}

                {issue.kind === 'GRAMMAR' && (
                  <div className="mt-2">
                    <SpeakingGrammarActions attemptId={attemptId || issue.attempt_id} issue={issue} />
                  </div>
                )}

                {issue.practice && (
                  <div className="mt-2.5 rounded-lg bg-primary/5 border border-primary/15 p-2.5 text-xs text-text-primary">
                    <strong className="text-primary">{vi ? 'Luyện tập đúng lỗi: ' : 'Focused practice: '}</strong>
                    {issue.practice}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2 pt-2 border-t border-border/50">
                  {onPlay && issue.offset_seconds != null && (
                    <button
                      type="button"
                      onClick={() => onPlay(issue)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface hover:bg-surface-subtle px-2.5 py-1 text-xs text-text-primary transition cursor-pointer"
                    >
                      <Volume2 size={13} className="text-primary" />
                      {vi
                        ? `Nghe tại ${issue.offset_seconds.toFixed(1)}s`
                        : `Replay at ${issue.offset_seconds.toFixed(1)}s`}
                    </button>
                  )}
                  {onPractice && (
                    <button
                      type="button"
                      onClick={() => onPractice(issue)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary hover:bg-primary-hover px-2.5 py-1 text-xs font-medium text-white transition cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      {vi ? 'Thu lại lỗi này' : 'Re-record'}
                    </button>
                  )}
                </div>
              </article>
            )
          })}
      </div>

      {!!assessments?.length && (
        <details className="mt-4 rounded-xl border border-border p-3 text-xs text-text-secondary">
          <summary className="cursor-pointer text-xs font-semibold text-text-primary hover:text-primary transition">
            {vi ? 'Xem chi tiết đo lường phát âm từng âm tiết (Azure Phonemes)' : 'View detailed Azure phoneme analysis'}
          </summary>
          <p className="mt-2 text-text-secondary">
            {vi
              ? 'Điểm âm thấp chỉ ra phần cần cải thiện phát âm.'
              : 'Low phoneme scores indicate pronunciation targets.'}
          </p>
          {assessments.map(({ turn_number, assessment: a }) => (
            <div key={turn_number} className="mt-3 border-t border-border/60 pt-2">
              <p className="font-semibold text-text-primary">
                {turn_number
                  ? `${vi ? 'Lượt' : 'Turn'} ${turn_number}`
                  : vi
                  ? 'Bản thu'
                  : 'Recording'}{' '}
                · Accuracy {a.accuracy}/100 · Fluency {a.fluency}/100
              </p>
              <div className="mt-2 max-h-60 space-y-1.5 overflow-y-auto">
                {a.words.map((w, n) => (
                  <p key={n} className="break-words text-text-secondary">
                    <strong className="text-text-primary">{w.word}</strong>: {w.accuracy ?? '—'}/100
                    <span className="ml-2 text-[11px] text-text-tertiary">
                      ({w.phonemes.map((p) => `${p.phoneme}: ${p.accuracy ?? '—'}`).join(' · ')})
                    </span>
                  </p>
                ))}
              </div>
            </div>
          ))}
        </details>
      )}
    </section>
  )
}
