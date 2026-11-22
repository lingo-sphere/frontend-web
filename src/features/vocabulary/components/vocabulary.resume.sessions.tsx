'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { ArrowRight, BookOpen, Layers3, RotateCcw, Clock3 } from 'lucide-react'
import { Button } from '@/components/button'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useNavigate } from '@/lib/navigation'
import { vocabularyService } from '../services/vocabulary.service'

export function VocabularyResumeSessions() {
  const userId = useAuthStore(state => state.user?.user_id)
  const { i18n } = useTranslation()
  const vi = i18n.language === 'vi'
  const navigate = useNavigate()
  const [showAll, setShowAll] = useState(false)
  const { data, isError, refetch } = useQuery({
    queryKey: ['vocabulary', 'active-sessions', userId],
    queryFn: () => vocabularyService.listLearningSessions(),
    enabled: Boolean(userId),
    staleTime: 0,
    refetchOnMount: 'always',
  })
  if (!userId) return null
  if (isError) return <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 text-sm text-text-secondary">
    <p>{vi ? 'Chưa tải được các phiên đang học.' : 'Unable to load your sessions.'}</p>
    <Button size="sm" variant="outline" onClick={() => void refetch()}>{vi ? 'Thử lại' : 'Retry'}</Button>
  </div>
  const sessions = (data?.items || []).filter(item =>
    (item.source_type === 'DECK' && Boolean(item.source_id)) || item.source_type === 'WRONG_WORDS' || item.source_type === 'DUE_SRS',
  )
  if (!sessions.length) return null
  const visible = showAll ? sessions : sessions.slice(0, 3)
  return <section aria-labelledby="vocabulary-resume-heading" className="mb-6 rounded-2xl border border-border bg-surface p-4 sm:p-5">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 id="vocabulary-resume-heading" className="text-base font-bold text-text-primary">{vi ? 'Tiếp tục học từ vựng' : 'Continue learning vocabulary'}</h2>
        <p className="mt-1 text-xs text-text-secondary">{vi ? 'Tiến độ đã lưu, sẵn sàng để bạn học tiếp.' : 'Your progress is saved and ready to continue.'}</p>
      </div>
      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{sessions.length} {vi ? 'phiên' : 'sessions'}</span>
    </div>
    <div className="space-y-2">
      {visible.map(item => {
        const isReview = item.source_type !== 'DECK'
        const source = item.source_type === 'DECK' ? item.source_id! : item.source_type === 'WRONG_WORDS' ? 'wrong-words' : 'due-srs'
        const fallback = item.source_type === 'WRONG_WORDS' ? (vi ? 'Ôn từ sai' : 'Review missed words') : item.source_type === 'DUE_SRS' ? (vi ? 'Ôn tập từ đến hạn' : 'Review due words') : (vi ? 'Bộ thẻ từ vựng' : 'Vocabulary deck')
        const title = item.title && /<\/?[a-z][^>]*>/i.test(item.title) ? (vi ? 'Tên bộ thẻ không hợp lệ' : 'Invalid deck title') : item.title?.trim() || fallback
        const total = Math.max(0, item.total_items || 0)
        const resolved = Math.min(total, Math.max(0, item.resolved || 0))
        const percent = total ? Math.round(resolved / total * 100) : 0
        const Icon = item.source_type === 'DUE_SRS' ? Clock3 : isReview ? RotateCcw : BookOpen
        return <div key={item.session_id} className="flex flex-col gap-3 rounded-xl border border-border/70 bg-surface-subtle/40 p-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon size={18} aria-hidden="true" /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1"><h3 className="min-w-0 break-words text-sm font-semibold text-text-primary">{title}</h3><span className="text-xs text-text-tertiary">{isReview ? (vi ? 'Ôn tập' : 'Review') : (vi ? 'Bộ thẻ' : 'Deck')}</span></div>
              <div className="mt-1 flex items-center gap-2 text-xs text-text-secondary"><span>{resolved}/{total} {vi ? 'từ hoàn thành' : 'words completed'}</span><span aria-hidden="true">·</span><span>{item.status === 'PAUSED' ? (vi ? 'Đã tạm dừng' : 'Paused') : (vi ? 'Đang học' : 'In progress')}</span></div>
              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-border/70" role="progressbar" aria-label={vi ? 'Tiến độ phiên học' : 'Session progress'} aria-valuemin={0} aria-valuemax={total || 1} aria-valuenow={resolved}><div className="h-full rounded-full bg-primary" style={{ width: `${percent}%` }} /></div>
            </div>
          </div>
          <Button variant="outline" size="sm" aria-label={`${vi ? "Tiếp tục" : "Continue"}: ${title}`} className="w-full gap-2 sm:w-auto" onClick={() => navigate(`/vocabulary/learn/${encodeURIComponent(source)}?session=${encodeURIComponent(item.session_id)}`)}>{vi ? 'Tiếp tục' : 'Continue'} <ArrowRight size={14} aria-hidden="true" /></Button>
        </div>
      })}
    </div>
    {sessions.length > 3 && <Button variant="ghost" size="sm" className="mt-3 gap-2" onClick={() => setShowAll(!showAll)}><Layers3 size={14} />{showAll ? (vi ? 'Thu gọn' : 'Show less') : (vi ? `Xem thêm ${sessions.length - 3} phiên` : `Show ${sessions.length - 3} more`)}</Button>}
  </section>
}
