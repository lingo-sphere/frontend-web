import { useCallback, useRef, useState } from 'react'
import { practiceService } from '@/features/practice/services/practice.service'
import type { DifficultyLevel, SpeakingExercise } from '@/features/practice/types/speaking'

export interface RecordingSubmission { recording_session_id: string; recording_take_id?: string }

export function useSpeakingSession(exercise: SpeakingExercise, difficulty: DifficultyLevel) {
  const sessionRef = useRef<{ key: string; id: string; pending?: Promise<void>; ready?: boolean; policy?: { preparation_time_seconds: number; response_time_seconds: number; show_hints: boolean; max_record_attempts: number } } | null>(null)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [serverPolicy, setServerPolicy] = useState<{ key: string; value: { preparation_time_seconds: number; response_time_seconds: number; show_hints: boolean; max_record_attempts: number } } | null>(null)
  const ensure = useCallback(async () => {
    const key = `${exercise.id}:${difficulty}`
    if (sessionRef.current?.key !== key) { sessionRef.current = { key, id: crypto.randomUUID() }; setCounts({}) }
    const session = sessionRef.current!
    if (!session.ready) {
      session.pending ??= practiceService.startSpeakingSession({ exercise_id: exercise.id, difficulty_chosen: difficulty, recording_session_id: session.id }).then(result => {
        session.ready = true
        session.policy = result.policy
        if (sessionRef.current === session) { setCounts(result.counts); setServerPolicy({ key: session.key, value: result.policy }) }
      }).finally(() => { session.pending = undefined })
      await session.pending
    }
    return session.id
  }, [exercise.id, difficulty])
  const reserve = useCallback(async (turn = 0) => {
    const id = await ensure()
    const take = crypto.randomUUID()
    const result = await practiceService.reserveSpeakingTake(id, { recording_take_id: take, turn_number: turn })
    setCounts(prev => ({ ...prev, [`turn_${turn}`]: result.count }))
    return { recording_session_id: id, recording_take_id: take }
  }, [ensure])
  const reset = useCallback(() => { sessionRef.current = null; setCounts({}); setServerPolicy(null) }, [])
  const getPolicy = useCallback(() => sessionRef.current?.policy, [])
  return { ensure, reserve, reset, counts, getPolicy, policy: serverPolicy?.key === `${exercise.id}:${difficulty}` ? serverPolicy.value : null }
}
