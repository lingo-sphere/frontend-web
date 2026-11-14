import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/button'
import { Pagination } from '@/components/pagination'
import type { SpeakingAttempt, SpeakingExercise } from '@/features/practice/types/speaking'

interface SpeakingHistoryProps {
  embedded?: boolean
  attempts: SpeakingAttempt[]
  exercises: SpeakingExercise[]
  onBack: () => void
  onViewAttempt: (attempt: SpeakingAttempt) => void
}

export function SpeakingHistory({ embedded = false, attempts, exercises, onBack, onViewAttempt }: SpeakingHistoryProps) {
  const { i18n } = useTranslation()
  const vi = i18n.language.toLowerCase().startsWith('vi')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  const sorted = useMemo(() => [...attempts].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [attempts])
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const page = Math.min(currentPage, totalPages)
  const visible = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <section className={embedded ? 'space-y-6' : 'w-full space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-8'}>
      {!embedded && <Button variant="ghost" onClick={onBack}><ArrowLeft size={18} />{vi ? 'Quay lại' : 'Back'}</Button>}
      <div>
        <h2 className="text-2xl font-bold text-text-primary">{vi ? 'Lịch sử làm bài' : 'Submission history'}</h2>
        <p className="mt-1 text-sm text-text-secondary">{vi ? 'Xem lại bài nói đã nộp và phản hồi chấm điểm. Hiển thị tối đa 50 lần gần nhất.' : 'Review your recordings and grading feedback. Showing up to 50 recent attempts.'}</p>
      </div>
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface px-4 py-12 text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 text-text-tertiary" aria-hidden="true" />
          <p className="text-sm text-text-secondary">{vi ? 'Chưa có bài nói nào được nộp.' : 'No speaking submissions yet.'}</p>
          <Button className="mt-4" onClick={onBack}>{vi ? 'Chọn bài luyện nói' : 'Choose a speaking exercise'}</Button>
        </div>
      ) : (
        <>
          <p className="text-sm text-text-secondary">{sorted.length} {vi ? 'lần luyện' : 'attempts'}</p>
          <div className="space-y-3">
            {visible.map(attempt => {
              const exercise = attempt.exercise || exercises.find(item => item.id === String(attempt.exercise_id))
              const title = vi ? exercise?.title_vi || exercise?.title : exercise?.title
              const score = attempt.overall_score
              const graded = typeof score === 'number' && Number.isFinite(score)
              const scoreColor = !graded || attempt.grading_version !== 'speaking-v2' ? 'bg-surface-subtle text-text-secondary' : score >= 80 ? 'bg-primary/10 text-primary' : score >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-700'
              const date = new Date(attempt.created_at)
              const duration = attempt.recording_duration_seconds ?? attempt.speaking_time_seconds
              return (
                <article key={attempt.id} className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 basis-48">
                      <h3 className="break-words font-semibold text-text-primary">{title || (vi ? 'Bài luyện nói đã lưu' : 'Saved speaking task')}</h3>
                      <p className="mt-1 text-xs text-text-secondary">{Number.isNaN(date.getTime()) ? '—' : date.toLocaleString(vi ? 'vi-VN' : 'en-US')} · {vi ? 'Lần' : 'Attempt'} {attempt.attempt_number ?? '—'}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-text-secondary">
                        {typeof duration === 'number' && <span>{vi ? 'Thu âm' : 'Recording'}: {Math.round(duration)}s</span>}
                        {attempt.is_best_attempt && <span className="text-primary">{vi ? 'Kết quả tốt nhất' : 'Best attempt'}</span>}
                      </div>
                    </div>
                    <span className={`shrink-0 rounded-xl px-3 py-2 text-sm font-semibold ${scoreColor}`}>{graded ? `${score.toFixed(1)}${attempt.grading_version === 'speaking-v2' ? ' / 100' : (vi ? ' · thang điểm cũ' : ' · legacy scale')}` : (vi ? 'Chưa có điểm' : 'Not graded')}</span>
                  </div>
                  <div className="mt-4 flex justify-end border-t border-border pt-3">
                    <Button variant="outline" size="sm" aria-label={`${vi ? 'Xem chi tiết' : 'View details'}: ${title || attempt.id}`} onClick={() => onViewAttempt(attempt)}>{vi ? 'Xem chi tiết' : 'View details'}<ChevronRight size={16} /></Button>
                  </div>
                </article>
              )
            })}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={pageSize} totalItems={sorted.length} />
        </>
      )}
    </section>
  )
}
