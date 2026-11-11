import { useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { practiceKeys } from '../keys/practice.keys'
import { grammarPracticeService } from '../services/grammar-practice.service'
import { readSkillDraft, writeSkillDraft } from '../lib/skill-draft'
import type { GrammarFeedback, GrammarSession, SubmitGrammarSessionParams } from '../types/grammar-practice'

interface LocalDraft { answers: Record<string, string>; index: number; seconds: number; revision: number; pending?: SubmitGrammarSessionParams }
const errorText = (e: unknown) => e instanceof Error ? e.message : 'Không kết nối được máy chủ'

export function useGrammarSession(session: GrammarSession, userId?: string) {
  const queryClient = useQueryClient()
  const [index, setIndex] = useState(session.current_index || 0)
  const [answers, setAnswers] = useState(session.answers || {})
  const [checked, setChecked] = useState(session.checked || {})
  const [seconds, setSeconds] = useState(session.time_spent_seconds || 0)
  const [result, setResult] = useState(session.result || null)
  const [ready, setReady] = useState(Boolean(session.result))
  const [checking, setChecking] = useState(false), [submitting, setSubmitting] = useState(false)
  const [pending, setPending] = useState(false), [error, setError] = useState(''), [saveError, setSaveError] = useState('')
  const [paused, setPaused] = useState(false)
  const data = useRef<LocalDraft>({ answers: session.answers || {}, index: session.current_index || 0, seconds: session.time_spent_seconds || 0, revision: session.revision || 0 })
  const checkedRef = useRef(session.checked || {}), busy = useRef(false), complete = useRef(Boolean(session.result)), dirty = useRef(false)
  const queue = useRef<Promise<unknown>>(Promise.resolve()), localQueue = useRef<Promise<unknown>>(Promise.resolve())
  const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const key = `grammar:${userId}:${session.session_id}`
  const persist = useCallback(() => {
    const value = structuredClone(data.current)
    localQueue.current = localQueue.current.catch(() => {}).then(() => writeSkillDraft(key, value)).catch(() => { setSaveError('Chưa lưu được trên thiết bị. Hãy giữ trang mở đến khi đồng bộ xong.') })
    return localQueue.current
  }, [key])
  const save = useCallback(() => {
    queue.current = queue.current.catch(() => {}).then(async () => {
      if (complete.current || data.current.pending || !dirty.current) return
      const value = structuredClone(data.current)
      const response = await grammarPracticeService.saveDraft(session.session_id, { expected_revision: value.revision, answers: value.answers, current_index: value.index, time_spent_seconds: value.seconds })
      data.current.revision = response.revision
      if (JSON.stringify(value.answers) === JSON.stringify(data.current.answers) && value.index === data.current.index && value.seconds === data.current.seconds) dirty.current = false
      setSaveError(''); await persist()
    })
    return queue.current
  }, [session.session_id, persist])
  const scheduleSave = useCallback(() => {
    void persist()
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(() => { void save().catch(e => setSaveError(`Chưa đồng bộ bản nháp: ${errorText(e)}. Bản sao vẫn giữ trên thiết bị.`)) }, 350)
  }, [save, persist])
  useEffect(() => {
    if (session.result) return
    let active = true
    readSkillDraft<LocalDraft>(key).then(local => {
      if (!active || !local || local.revision < (session.revision || 0)) return
      const valid = Object.fromEntries(Object.entries(local.answers).filter(([k]) => Number(k) < session.total_questions))
      for (const [k, value] of Object.entries(session.checked || {})) valid[k] = value.user_answer
      data.current = { ...local, answers: valid, index: Math.min(session.total_questions - 1, Math.max(0, local.index)) }
      setAnswers(valid); setIndex(data.current.index); setSeconds(local.seconds); setPending(Boolean(local.pending)); dirty.current = !local.pending
      if (local.pending) setError('Bản nộp trước chưa nhận được kết quả. Hãy thử nộp lại.')
    }).catch(() => {}).finally(() => { if (active) { setReady(true); if (dirty.current) void save().catch(e => setSaveError(errorText(e))) } })
    return () => { active = false }
  }, [key, session, save])
  useEffect(() => {
    if (!ready || paused || result || pending || submitting) return
    const timer = setInterval(() => { data.current.seconds++; setSeconds(data.current.seconds); dirty.current = true; if (data.current.seconds % 5 === 0) scheduleSave() }, 1000)
    return () => clearInterval(timer)
  }, [ready, paused, result, pending, submitting, scheduleSave])
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty.current && !complete.current) { event.preventDefault(); event.returnValue = '' } }
    window.addEventListener('beforeunload', warn)
    return () => { window.removeEventListener('beforeunload', warn); if (debounce.current) clearTimeout(debounce.current) }
  }, [])
  const change = (answer: string) => {
    if (!ready || busy.current || data.current.pending || complete.current || checkedRef.current[String(data.current.index)]) return
    data.current.answers = { ...data.current.answers, [String(data.current.index)]: answer }; dirty.current = true
    setAnswers(data.current.answers); scheduleSave()
  }
  const check = async () => {
    const index = data.current.index, answer = (data.current.answers[String(index)] || '').trim()
    if (!ready || busy.current || complete.current || data.current.pending || !answer || checkedRef.current[String(index)]) return
    busy.current = true; setChecking(true); setError('')
    if (debounce.current) clearTimeout(debounce.current)
    try {
      await save()
      const feedback: GrammarFeedback = await grammarPracticeService.submitAnswer({ session_id: session.session_id, question_index: index, answer })
      data.current.revision = feedback.revision; data.current.answers[String(index)] = feedback.user_answer
      checkedRef.current = { ...checkedRef.current, [String(index)]: feedback }; setChecked(checkedRef.current); setAnswers({ ...data.current.answers }); await persist()
    } catch (e) { setError(`Chưa kiểm tra được đáp án: ${errorText(e)}. Hãy thử lại.`) }
    finally { busy.current = false; setChecking(false) }
  }
  const next = () => {
    if (busy.current || data.current.pending || data.current.index >= session.total_questions - 1) return
    data.current.index++; dirty.current = true; setIndex(data.current.index); setError(''); scheduleSave()
  }
  const submit = async () => {
    if (!ready || busy.current || complete.current) return
    busy.current = true; setSubmitting(true); setError('')
    if (debounce.current) clearTimeout(debounce.current)
    try {
      await queue.current.catch(() => {})
      data.current.pending ??= { session_id: session.session_id, answers: structuredClone(data.current.answers), total_time_seconds: data.current.seconds }
      await persist()
      const response = await grammarPracticeService.submitSession(data.current.pending)
      complete.current = true; dirty.current = false; setResult(response); setPending(false)
      // Invalidate every filtered vault query, not just the unfiltered {} key.
      void queryClient.invalidateQueries({ queryKey: [...practiceKeys.all, 'mistakes'] })
      await localQueue.current; await writeSkillDraft(key, undefined).catch(() => {})
    } catch (e) { setPending(true); setError(`Chưa nhận được kết quả: ${errorText(e)}. Thử nộp lại sẽ dùng cùng lượt.`); void persist() }
    finally { busy.current = false; setSubmitting(false) }
  }
  const exit = async () => { await persist(); await save() }
  return { index, answers, currentAnswer: answers[String(index)] || '', checked: checked[String(index)], seconds: result?.total_time_seconds ?? seconds, result, ready, checking, submitting, pending, error, saveError, paused, setPaused, change, check, next, submit, save, persist, exit }
}
