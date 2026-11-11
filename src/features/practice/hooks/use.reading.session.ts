import { useCallback, useEffect, useRef, useState } from 'react'
import { readingPracticeService } from '../services/reading-practice.service'
import { readSkillDraft, writeSkillDraft } from '../lib/skill-draft'
import { useAuthStore } from '@/features/auth/store/auth.store'
import type { AIReadingExplanation, ReadingAttemptResultEnhanced, ReadingPassage, ReadingSession, SubmitReadingAttemptPayload } from '../types/reading'

interface Draft { answers: Record<string, string>; revision: number; pending?: SubmitReadingAttemptPayload }
const message = (error: unknown) => error instanceof Error ? error.message : 'Không kết nối được máy chủ'

export function useReadingSession(passage: ReadingPassage, session?: ReadingSession, initialResult?: ReadingAttemptResultEnhanced) {
  const userId = useAuthStore(state => state.user?.user_id)
  const initial = initialResult || session?.result || null
  const [attemptResult, setAttemptResult] = useState(initial)
  const [isSubmitted, setIsSubmitted] = useState(Boolean(initial))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showResultModal, setShowResultModal] = useState(Boolean(initial))
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>(initial?.answers ? Object.fromEntries(initial.answers.map(a => [a.question_id, a.user_answer])) : session?.answers || {})
  const [ready, setReady] = useState(!session || Boolean(initial))
  const [error, setError] = useState('')
  const [saveError, setSaveError] = useState('')
  const [pending, setPending] = useState(false)
  const [deadline] = useState(() => Date.now() + (session ? Date.parse(session.deadline_at) - Date.parse(session.server_now) : 0))
  const [remaining, setRemaining] = useState(() => session && !initial ? Math.max(0, Math.ceil((Date.parse(session.deadline_at) - Date.parse(session.server_now)) / 1000)) : 0)
  const answersRef = useRef(session?.answers || {})
  const revisionRef = useRef(session?.revision || 0)
  const pendingRef = useRef<SubmitReadingAttemptPayload | undefined>(undefined)
  const frozenRef = useRef(Boolean(initial))
  const submittingRef = useRef(false)
  const dirtyRef = useRef(false)
  const queueRef = useRef<Promise<unknown>>(Promise.resolve())
  const localQueueRef = useRef<Promise<unknown>>(Promise.resolve())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const key = `reading:${userId}:${session?.session_id}`

  const persist = useCallback(() => {
    const value: Draft = { answers: answersRef.current, revision: revisionRef.current, pending: pendingRef.current }
    localQueueRef.current = localQueueRef.current.catch(() => {}).then(() => writeSkillDraft(key, value)).catch(() => { setSaveError('Chưa lưu được trên thiết bị. Hãy giữ trang mở đến khi đồng bộ xong.') })
    return localQueueRef.current
  }, [key])
  const save = useCallback(() => {
    queueRef.current = queueRef.current.catch(() => {}).then(async () => {
      if (!session || !dirtyRef.current || frozenRef.current || Date.now() >= deadline) return
      const answers = answersRef.current
      const result = await readingPracticeService.saveDraft(session.session_id, { expected_revision: revisionRef.current, answers })
      revisionRef.current = result.revision
      if (answers === answersRef.current) dirtyRef.current = false
      setSaveError('')
      await persist()
    }).catch(error => { setSaveError(`Chưa đồng bộ bản nháp: ${message(error)}. Đáp án vẫn được giữ trên thiết bị.`) })
    return queueRef.current
  }, [session, deadline, persist])

  useEffect(() => {
    if (!session || initial) return
    let active = true
    readSkillDraft<Draft>(key).then(local => {
      if (!active) return
      if (local && local.revision >= session.revision) {
        answersRef.current = local.answers; revisionRef.current = local.revision
        pendingRef.current = local.pending; frozenRef.current = Boolean(local.pending)
        setUserAnswers(local.answers); setPending(Boolean(local.pending)); dirtyRef.current = !local.pending
        if (local.pending) setError('Bản nộp trước chưa nhận được kết quả. Hãy thử gửi lại cùng lượt.')
      }
    }).catch(() => {}).finally(() => { if (active) { setReady(true); if (dirtyRef.current) void save() } })
    return () => { active = false }
  }, [key, session, initial, save])

  useEffect(() => {
    if (!session || isSubmitted) return
    const timer = setInterval(() => setRemaining(Math.max(0, Math.ceil((deadline - Date.now()) / 1000))), 1000)
    return () => clearInterval(timer)
  }, [session, deadline, isSubmitted])
  useEffect(() => {
    const leave = (event: BeforeUnloadEvent) => { if (dirtyRef.current && !frozenRef.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', leave)
    return () => { window.removeEventListener('beforeunload', leave); if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  const select = useCallback((id: string, answer: string) => {
    if (!session || frozenRef.current || Date.now() >= deadline || !ready) return
    answersRef.current = { ...answersRef.current, [id]: answer }; dirtyRef.current = true
    setUserAnswers(answersRef.current); void persist()
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { void save() }, 250)
  }, [session, deadline, ready, save, persist])

  const [aiExplanation, setAiExplanation] = useState<AIReadingExplanation | null>(null)
  const [aiExplanationStatus, setAiExplanationStatus] = useState<'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | null>(initial?.wrong_count ? initial.ai_explanation_status || 'PENDING' : null)
  const [canRetryAi, setCanRetryAi] = useState(true)
  const [pollVersion, setPollVersion] = useState(0)
  const submit = useCallback(async () => {
    if (!session || !ready || submittingRef.current || isSubmitted) return
    submittingRef.current = true; frozenRef.current = true
    setIsSubmitting(true); setError('')
    if (debounceRef.current) clearTimeout(debounceRef.current)
    try {
      await queueRef.current
      pendingRef.current ??= { passage_id: passage._id, session_id: session.session_id, expected_revision: revisionRef.current, answers: (passage.questions || []).map(q => ({ question_id: q._id || q.id || '', user_answer: answersRef.current[q._id || q.id || ''] || '', time_spent_seconds: 0 })) }
      await persist()
      const result = await readingPracticeService.submitAttempt(pendingRef.current)
      if (result.wrong_count) setAiExplanationStatus(result.ai_explanation_status || 'PENDING')
      setAttemptResult(result); setIsSubmitted(true); setShowResultModal(true); setPending(false)
      dirtyRef.current = false; pendingRef.current = undefined
      if (result.answers) { answersRef.current = Object.fromEntries(result.answers.map(a => [a.question_id, a.user_answer])); setUserAnswers(answersRef.current) }
      await localQueueRef.current; await writeSkillDraft(key, undefined).catch(() => {})
    } catch (error) { setPending(true); setError(`Chưa nhận được kết quả: ${message(error)}. Thử nộp lại sẽ không tạo thêm lượt.`); void persist() }
    finally { submittingRef.current = false; setIsSubmitting(false) }
  }, [session, ready, isSubmitted, passage, persist, key])
  useEffect(() => { if (session && ready && remaining === 0 && !pending && !isSubmitted) void submit() }, [session, ready, remaining, pending, isSubmitted, submit])

  useEffect(() => {
    if (!attemptResult?.wrong_count) return
    let active = true, timer: ReturnType<typeof setTimeout>, failures = 0
    const poll = async () => {
      try {
        const response = await readingPracticeService.getAIExplanation(attemptResult.attempt_id)
        if (!active) return
        setAiExplanationStatus(response.status); setAiExplanation(response.explanation || null); setCanRetryAi(response.can_retry ?? false)
        if (response.status === 'PENDING' || response.status === 'PROCESSING') timer = setTimeout(poll, Math.max(1000, (response.retry_after_seconds || 5) * 1000))
      } catch { if (!active) return; if (++failures < 3) timer = setTimeout(poll, 5000); else { setAiExplanationStatus('FAILED'); setCanRetryAi(true) } }
    }
    void poll()
    return () => { active = false; clearTimeout(timer) }
  }, [attemptResult, pollVersion])
  const retryAi = async () => {
    if (!attemptResult) return
    try { await readingPracticeService.retryAIExplanation(attemptResult.attempt_id); setPollVersion(v => v + 1) } catch (error) { setError(message(error)) }
  }
  return { remaining, elapsedTime: attemptResult?.time_spent_seconds ?? Math.max(0, (session?.time_limit_seconds || 0) - remaining), userAnswers, select, submit, save, persist, ready, pending, error, saveError, isSubmitted, isSubmitting, attemptResult, showResultModal, setShowResultModal, aiExplanation, aiExplanationStatus, canRetryAi, retryAi }
}
