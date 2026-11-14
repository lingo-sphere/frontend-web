'use client'

import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { useNavigate } from '@/lib/navigation'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { grammarPracticeService } from '@/features/practice/services/grammar-practice.service'
import { handbookReturnUrl } from '../lib/grammar-handbook'
import { toast } from '@/store/toast.store'
import { speakingGrammarService } from '@/features/practice/services/speaking-grammar.service'

export function useGrammarTheoryPractice(slug: string, hasLinks: boolean, vi: boolean) {
  const userId = useAuthStore(state => state.user?.user_id)
  const params = useSearchParams()
  const sourceKind = params.has('writing_submission') || params.has('writing_issue') ? 'WRITING' as const : 'SPEAKING' as const
  const speakingAttempt = params.get(sourceKind === 'WRITING' ? 'writing_submission' : 'speaking_attempt'), speakingIssueId = params.get(sourceKind === 'WRITING' ? 'writing_issue' : 'speaking_issue')
  const sourceRequested = Boolean(speakingAttempt || speakingIssueId)
  const sourceValid = Boolean(speakingAttempt && speakingIssueId && /^[a-f\d]{24}$/i.test(speakingAttempt) && /^[a-f\d]{24}$/i.test(speakingIssueId))
  const navigate = useNavigate()
  const client = useQueryClient()
  const [starting, setStarting] = useState<string | null>(null)
  const guard = useRef(false)
  const keys = useRef<Record<string, string>>({})
  const query = useQuery({
    queryKey: ['grammar-theory-targets', slug, userId],
    queryFn: () => grammarPracticeService.getTheoryTargets(slug),
    enabled: Boolean(userId && hasLinks),
    staleTime: 30_000,
    retry: 1,
  })
  const sourceQuery = useQuery({ queryKey: [sourceKind === 'WRITING' ? 'writing-grammar' : 'speaking-grammar', userId, speakingAttempt],
    queryFn: () => speakingGrammarService.source(speakingAttempt!, sourceKind), enabled: Boolean(userId && sourceValid), staleTime: 30_000, retry: 1 })
  const sourceIssue = sourceQuery.data?.issues.find(i => i.issue_id === speakingIssueId && i.target?.theory_slug === slug && i.theory_available)
  const sourceError = sourceRequested && (!sourceValid || sourceQuery.isError || (sourceQuery.isSuccess && !sourceIssue))
  const sourceLoading = sourceRequested && sourceValid && sourceQuery.isPending

  const login = () => navigate(`/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`)
  async function start(code: string) {
    if (!userId) { login(); return }
    if (sourceRequested && (!sourceIssue || sourceIssue.target?.topic_code !== code || sourceIssue.availability !== 'READY')) {
      toast.error(vi ? 'Nguồn lỗi hoặc bài luyện hiện chưa sẵn sàng.' : 'The source or practice is not currently ready.')
      return
    }
    const link = query.data?.links.find(item => item.topic_code === code)
    if (!link?.topic || !link.topic.is_unlocked || link.topic.total_questions < 6 || guard.current) return
    guard.current = true
    setStarting(code)
    const requestKey = sourceRequested ? `${sourceKind}:${userId}:${speakingAttempt}:${speakingIssueId}:${code}` : `${userId}:${slug}:${code}`
    keys.current[requestKey] ||= crypto.randomUUID()
    let navigating = false
    try {
      // The server re-resolves the stored link and chooses the topic ID itself.
      const session = sourceRequested
        ? await speakingGrammarService.start(speakingAttempt!, speakingIssueId!, keys.current[requestKey], sourceKind)
        : await grammarPracticeService.startFromTheory(slug, code, keys.current[requestKey])
      client.setQueryData(['grammar-session', userId, session.session_id], session)
      const next = new URLSearchParams(handbookReturnUrl(new URLSearchParams(params)).split('?')[1])
      next.set('view', 'practice')
      next.set('session', session.session_id)
      next.set('theory', slug)
      next.set('level', session.cefr_level)
      navigate(`/grammar?${next}`)
      navigating = true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : vi ? 'Chưa mở được bài luyện' : 'Could not open the exercise')
      void query.refetch()
    } finally {
      // Keep both CTA locations disabled while Next is loading the destination.
      // Re-enabling after the response permits a second session before unmount.
      if (!navigating) { guard.current = false; setStarting(null) }
    }
  }
  return { query, starting, start, userId, login, sourceRequested, sourceIssue, sourceQuery, sourceError, sourceLoading }
}

export type TheoryPracticeState = ReturnType<typeof useGrammarTheoryPractice>
