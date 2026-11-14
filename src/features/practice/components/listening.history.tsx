'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/button'
import { AppSelect } from '@/components/select'
import { Pagination } from '@/components/pagination'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { listeningLifecycleService } from '../services/listening-lifecycle.service'
import type { ListeningKind } from '../types/listening-lifecycle'
import { ListeningSavedResult } from './listening.saved.result'

const KINDS: ListeningKind[] = ['part1', 'part2', 'part3', 'part4', 'dictation']
const PAGE_SIZE = 20

export function ListeningHistory({ navigate }: {
  navigate: (patch: Record<string, string | null>) => void
}) {
  const { i18n } = useTranslation()
  const vi = i18n.language.toLowerCase().startsWith('vi')
  const userId = useAuthStore(state => state.user?.user_id)
  const params = useSearchParams()
  const pageValue = Number(params.get('history_page') || 1)
  const page = Number.isSafeInteger(pageValue) && pageValue > 0 ? pageValue : 1
  const requestedKind = params.get('history_kind') as ListeningKind | null
  const kind = requestedKind && KINDS.includes(requestedKind) ? requestedKind : undefined
  const resultId = params.get('result_id')
  const resultKind = params.get('result_kind') as ListeningKind | null
  const validResultKind = resultKind && KINDS.includes(resultKind) ? resultKind : null
  const back = () => navigate({ result_id: null, result_kind: null })
  const history = useQuery({
    queryKey: ['listening-history', userId, page, kind],
    queryFn: () => listeningLifecycleService.history(page, PAGE_SIZE, kind),
    enabled: Boolean(userId) && !resultId,
    staleTime: 0,
  })
  const review = useQuery({
    queryKey: ['listening-history-result', userId, resultKind, resultId],
    queryFn: async () => {
      const progress = await listeningLifecycleService.progress(validResultKind!, resultId!)
      if (progress.status !== 'COMPLETED' || !progress.result) {
        throw new Error(vi ? 'Phiên này chưa có kết quả hoàn tất để xem lại.' : 'This session has no completed result to review.')
      }
      return progress.result
    },
    enabled: Boolean(userId && resultId && validResultKind),
    retry: false,
  })
  useEffect(() => {
    if (!history.data || history.isFetching || resultId) return
    const lastPage = Math.max(1, history.data.total_pages)
    if (page > lastPage) navigate({ history_page: lastPage > 1 ? String(lastPage) : null })
  }, [history.data, history.isFetching, page, resultId, navigate])

  if (!userId) return <p>{vi ? 'Đăng nhập để xem lịch sử làm bài của bạn.' : 'Sign in to see your practice history.'}</p>
  if (resultId) return (
    <section className="space-y-4" aria-label={vi ? 'Kết quả bài nghe' : 'Listening result'}>
      <Button variant="outline" onClick={back}>{vi ? 'Về lịch sử làm bài' : 'Back to history'}</Button>
      {!validResultKind ? <p role="alert">{vi ? 'Đường dẫn kết quả không hợp lệ.' : 'Invalid result link.'}</p>
        : review.isPending ? <p role="status">{vi ? 'Đang tải kết quả…' : 'Loading result…'}</p>
        : review.error ? <div role="alert" className="space-y-3"><p>{review.error.message}</p><Button variant="outline" onClick={() => void review.refetch()}>{vi ? 'Thử lại' : 'Retry'}</Button></div>
        : review.data && <ListeningSavedResult result={review.data} vi={vi} onBack={back} backLabel={vi ? 'Về lịch sử làm bài' : 'Back to history'} />}
    </section>
  )

  return (
    <section className="space-y-4" aria-label={vi ? 'Lịch sử Listening' : 'Listening history'}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{vi ? 'Lịch sử Listening' : 'Listening history'}</h2>
        <AppSelect ariaLabel={vi ? 'Lọc dạng bài nghe' : 'Filter listening type'} value={kind || 'all'}
          onChange={value => navigate({ history_kind: value === 'all' ? null : value, history_page: null })}
          options={[{ value: 'all', label: vi ? 'Tất cả dạng bài' : 'All practice types' }, ...KINDS.map(value => ({ value, label: value === 'dictation' ? (vi ? 'Nghe chép chính tả' : 'Dictation') : value.replace('part', 'TOEIC Part ') }))]} />
      </div>
      {history.isPending ? <p role="status">{vi ? 'Đang tải lịch sử…' : 'Loading history…'}</p>
        : history.error ? <div role="alert" className="space-y-3 rounded-xl border border-border p-4"><p>{history.error.message}</p><Button variant="outline" onClick={() => void history.refetch()}>{vi ? 'Thử lại' : 'Retry'}</Button></div>
        : !history.data?.items.length ? <p className="py-6 text-text-secondary">{vi ? 'Chưa có bài nghe đã hoàn thành phù hợp.' : 'No completed listening sessions match this filter.'}</p>
        : <>
          <p className="text-sm text-text-secondary">{history.data.total} {vi ? 'bài đã hoàn thành' : 'completed sessions'}</p>
          <div className="space-y-3">
            {history.data.items.map(row => (
              <article key={`${row.kind}:${row.session_id}`} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4">
                <div className="min-w-0 space-y-1">
                  <h3 className="font-semibold">{row.title === 'Dictation' && vi ? 'Nghe chép chính tả' : row.title}</h3>
                  <p className="text-sm text-text-secondary">{new Date(row.completed_at).toLocaleString(vi ? 'vi-VN' : 'en-US')}</p>
                  <p className="text-sm text-text-secondary">{row.correct_count}/{row.total} {vi ? 'câu/ô đúng' : 'correct'} · {Math.floor(row.total_time_seconds / 60)}:{String(Math.floor(row.total_time_seconds % 60)).padStart(2, '0')}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <strong className="text-lg text-primary">{row.score_percent}%</strong>
                  <Button variant="outline" disabled={!row.result_available} onClick={() => navigate({ result_id: row.session_id, result_kind: row.kind })}>{vi ? 'Xem kết quả' : 'View result'}</Button>
                </div>
                {!row.result_available && <p className="w-full text-xs text-text-secondary">{vi ? 'Bài cũ chưa lưu chi tiết đáp án để xem lại.' : 'Answer details were not saved for this older session.'}</p>}
              </article>
            ))}
          </div>
          <nav aria-label={vi ? 'Phân trang lịch sử nghe' : 'Listening history pagination'} className="pt-4">
            <Pagination currentPage={page} totalPages={history.data.total_pages} totalItems={history.data.total} itemsPerPage={PAGE_SIZE} onPageChange={next => {
              navigate({ history_page: next > 1 ? String(next) : null })
              window.scrollTo({ top: 120, behavior: 'smooth' })
            }} />
          </nav>
        </>}
    </section>
  )
}
