'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/button'
import { AppSelect } from '@/components/select'
import { Pagination } from '@/components/pagination'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { grammarPracticeService } from '../services/grammar-practice.service'

const PAGE_SIZE = 20
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const STATUSES = ['COMPLETED', 'IN_PROGRESS', 'ABANDONED'] as const

export function GrammarHistory({ navigate, onOpenSession }: {
  navigate: (patch: Record<string, string | null>) => void
  onOpenSession: (id: string) => void
}) {
  const { i18n } = useTranslation()
  const vi = i18n.language.toLowerCase().startsWith('vi')
  const userId = useAuthStore(state => state.user?.user_id)
  const params = useSearchParams()
  const requestedPage = Number(params.get('history_page') || 1)
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1
  const requestedStatus = params.get('history_status')
  const status = STATUSES.find(value => value === requestedStatus) || 'COMPLETED'
  const requestedLevel = params.get('history_level') || ''
  const level = LEVELS.includes(requestedLevel) ? requestedLevel : undefined
  const query = useQuery({
    queryKey: ['grammar-sessions', userId, 'history', page, status, level],
    queryFn: () => grammarPracticeService.getSessions(page, { limit: PAGE_SIZE, status, level }),
    enabled: Boolean(userId),
    staleTime: 0,
  })
  const totalPages = Math.max(1, Math.ceil((query.data?.total || 0) / PAGE_SIZE))
  useEffect(() => {
    if (query.data && !query.isFetching && page > totalPages) {
      navigate({ history_page: totalPages > 1 ? String(totalPages) : null })
    }
  }, [query.data, query.isFetching, page, totalPages, navigate])
  const statusLabel = {
    COMPLETED: vi ? 'Đã hoàn thành' : 'Completed',
    IN_PROGRESS: vi ? 'Đang làm' : 'In progress',
    ABANDONED: vi ? 'Đã dừng' : 'Abandoned',
  }

  if (!userId) return <p>{vi ? 'Đăng nhập để xem lịch sử làm bài của bạn.' : 'Sign in to see your practice history.'}</p>
  return (
    <section aria-label={vi ? 'Lịch sử Ngữ pháp' : 'Grammar history'} className="mt-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{vi ? 'Lịch sử Ngữ pháp' : 'Grammar history'}</h2>
        <div className="flex flex-wrap gap-2">
          <AppSelect ariaLabel={vi ? 'Lọc cấp độ ngữ pháp' : 'Filter grammar level'} value={level || 'all'}
            onChange={value => navigate({ history_level: value === 'all' ? null : value, history_page: null })}
            options={[{ value: 'all', label: vi ? 'Tất cả cấp độ' : 'All levels' }, ...LEVELS.map(value => ({ value, label: value }))]} />
          <AppSelect ariaLabel={vi ? 'Lọc trạng thái bài làm' : 'Filter session status'} value={status}
            onChange={value => navigate({ history_status: value === 'COMPLETED' ? null : value, history_page: null })}
            options={STATUSES.map(value => ({ value, label: statusLabel[value] }))} />
        </div>
      </div>
      {query.isPending ? <p role="status">{vi ? 'Đang tải lịch sử…' : 'Loading history…'}</p>
        : query.error ? <div role="alert" className="space-y-3 rounded-xl border border-border p-4"><p>{query.error.message}</p><Button variant="outline" onClick={() => void query.refetch()}>{vi ? 'Thử lại' : 'Retry'}</Button></div>
        : !query.data?.items.length ? <p className="py-6 text-text-secondary">{vi ? 'Chưa có bài ngữ pháp phù hợp bộ lọc.' : 'No grammar sessions match these filters.'}</p>
        : <>
          <p className="text-sm text-text-secondary">{query.data.total} {vi ? 'bài làm' : 'sessions'}</p>
          <div className="space-y-3">
            {query.data.items.map(row => {
              const completed = row.status === 'COMPLETED'
              const date = completed ? row.completed_at : row.started_at
              const seconds = row.total_time_seconds || 0
              return (
                <article key={row.session_id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-semibold">{vi ? row.topic_name_vi : row.topic_name_en || row.topic_name_vi}</h3>
                    <p className="text-sm text-text-secondary">{row.cefr_level} · {statusLabel[row.status as typeof status] || row.status}{date && ` · ${new Date(date).toLocaleString(vi ? 'vi-VN' : 'en-US')}`}</p>
                    <p className="text-sm text-text-secondary">{completed ? `${row.correct_count ?? 0}/${row.total_questions} ${vi ? 'câu đúng' : 'correct'}` : `${row.answered_questions}/${row.total_questions} ${vi ? 'câu đã trả lời' : 'answered'}`} · {Math.floor(seconds / 60)}:{String(Math.floor(seconds % 60)).padStart(2, '0')}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    {completed && <strong className="text-lg text-primary">{row.score_percent}%</strong>}
                    <Button variant="outline" disabled={row.status === 'ABANDONED'} onClick={() => onOpenSession(row.session_id)}>{completed ? (vi ? 'Xem kết quả' : 'View result') : (vi ? 'Tiếp tục' : 'Continue')}</Button>
                  </div>
                </article>
              )
            })}
          </div>
          <nav aria-label={vi ? 'Phân trang lịch sử ngữ pháp' : 'Grammar history pagination'} className="pt-4">
            <Pagination currentPage={page} totalPages={totalPages} totalItems={query.data.total} itemsPerPage={PAGE_SIZE} onPageChange={next => {
              navigate({ history_page: next > 1 ? String(next) : null })
              window.scrollTo({ top: 120, behavior: 'smooth' })
            }} />
          </nav>
        </>}
    </section>
  )
}
