'use client'

import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/button'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useNavigate } from '@/lib/navigation'
import { vocabularyService } from '../services/vocabulary.service'

export function VocabularyResumeSessions() {
  const userId = useAuthStore(state => state.user?.user_id)
  const { i18n } = useTranslation()
  const vi = i18n.language === 'vi'
  const navigate = useNavigate()
  const { data, isError, refetch } = useQuery({
    queryKey: ['vocabulary', 'active-sessions', userId],
    queryFn: () => vocabularyService.listLearningSessions(),
    enabled: Boolean(userId),
    staleTime: 0,
  })
  if (!userId) return null
  if (isError) return <div role="alert" className="mb-5 rounded-xl border border-border p-4">
    <p>{vi ? 'Chưa tải được các phiên đang học.' : 'Unable to load your sessions.'}</p>
    <Button variant="outline" onClick={() => refetch()}>{vi ? 'Thử lại' : 'Retry'}</Button>
  </div>
  const sessions = (data?.items || []).filter(item => item.source_type !== 'TOPIC')
  if (!sessions.length) return null
  return <section className="mb-6 space-y-3 rounded-xl border border-border bg-surface p-4">
    <h2 className="font-semibold">{vi ? 'Tiếp tục phiên đang học' : 'Continue learning'}</h2>
    {sessions.map(item => <div key={item.session_id} className="flex items-center justify-between gap-3">
      <p>{item.title || (item.source_type === 'WRONG_WORDS' ? (vi ? 'Ôn từ sai' : 'Wrong words') : item.source_type === 'DUE_SRS' ? 'SRS' : (vi ? 'Bộ thẻ' : 'Deck'))} · {item.resolved}/{item.total_items}</p>
      <Button variant="outline" onClick={() => {
        const source = item.source_type === 'DECK' ? item.source_id : item.source_type === 'WRONG_WORDS' ? 'wrong-words' : 'due-srs'
        if (source) navigate(`/vocabulary/learn/${encodeURIComponent(source)}?session=${encodeURIComponent(item.session_id)}`)
      }}>{vi ? 'Tiếp tục' : 'Continue'}</Button>
    </div>)}
  </section>
}
