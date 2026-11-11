'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { listeningLifecycleService as service } from '../services/listening-lifecycle.service'
import type {
  ListeningDraft,
  ListeningKind,
  ListeningPracticeSession,
  ListeningResult,
} from '../types/listening-lifecycle'

const emptyDraft = (): ListeningDraft => ({
  revision: 0,
  answers: {},
  current_index: 0,
  elapsed_seconds: 0,
  audio_position: 0,
  playback_speed: 1,
  group_elapsed: {},
})
export function useListeningLifecycle(
  kind: ListeningKind,
  resumeId?: string,
  onStarted?: (id: string) => void,
) {
  const user = useAuthStore((state) => state.user)
  const [session, setSession] = useState<ListeningPracticeSession | null>(null)
  const [draft, setDraft] = useState<ListeningDraft>(emptyDraft)
  const [result, setResult] = useState<ListeningResult | null>(null)
  const [busy, setBusy] = useState(Boolean(resumeId))
  const [error, setError] = useState('')
  const [saveStatus, setSaveStatus] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle')
  const [remaining, setRemaining] = useState(0)
  const sessionRef = useRef<ListeningPracticeSession | null>(null)
  const draftRef = useRef<ListeningDraft>(emptyDraft())
  const started = useRef(0),
    generation = useRef(0),
    mutationLock = useRef(false)
  const savedGeneration = useRef(-1),
    finished = useRef(false),
    queue = useRef<Promise<unknown>>(Promise.resolve())
  const mounted = useRef(true)
  const finalizing = useRef(false)
  const backupKey = useCallback(
    (id: string) => `listening-draft:${user?.user_id}:${kind}:${id}`,
    [user?.user_id, kind],
  )
  const backup = useCallback(() => {
    const target = sessionRef.current
    if (!target || finished.current) return
    try {
      sessionStorage.setItem(
        backupKey(target.id),
        JSON.stringify(draftRef.current),
      )
    } catch {
      /* Server persistence remains authoritative. */
    }
  }, [backupKey])
  const elapsed = useCallback(() => {
    const target = sessionRef.current
    if (!target || finished.current) return draftRef.current.elapsed_seconds
    const now = Date.now(),
      delta = Math.max(0, (now - started.current) / 1000)
    started.current = now
    const index = draftRef.current.current_index,
      group = target.groups[index]
    const times = { ...(draftRef.current.group_elapsed || {}) }
    const keys = [
      ...(group?.questions || []).map((question) => question.key),
      ...(group?.blanks || []).map((blank) => blank.key),
    ]
    const answering =
      group?.hasListened ||
      (times[index] || 0) > 0 ||
      keys.some((key) =>
        Object.prototype.hasOwnProperty.call(draftRef.current.answers, key),
      )
    // Do not consume the response budget while the first audio is loading/playing.
    if (!group?.completed && answering)
      times[index] = Math.min(
        group?.timeSeconds || target.totalSeconds,
        (times[index] || 0) + delta,
      )
    const total = Math.floor(
      Object.values(times).reduce((sum, value) => sum + value, 0),
    )
    draftRef.current = {
      ...draftRef.current,
      group_elapsed: times,
      elapsed_seconds: total,
    }
    return total
  }, [])
  const groupRemaining = useCallback(() => {
    const current = draftRef.current,
      target = sessionRef.current
    return Math.max(
      0,
      Math.ceil(
        (target?.groups[current.current_index]?.timeSeconds ||
          target?.totalSeconds ||
          0) - (current.group_elapsed?.[current.current_index] || 0),
      ),
    )
  }, [])

  const save = useCallback(
    async (force = false) => {
      const task = queue.current
        .catch(() => undefined)
        .then(async () => {
          const target = sessionRef.current
          if (!target || finished.current || (finalizing.current && !force))
            return
          const version = generation.current
          const seconds = elapsed()
          const payload = { ...draftRef.current, elapsed_seconds: seconds }
          if (mounted.current) setSaveStatus('saving')
          try {
            const next = await service.save(kind, target.id, payload)
            draftRef.current = {
              ...draftRef.current,
              revision: next.revision,
              elapsed_seconds: next.elapsed_seconds,
            }
            savedGeneration.current = version
            if (mounted.current) {
              setDraft((previous) => ({ ...previous, revision: next.revision }))
              setSaveStatus(generation.current === version ? 'saved' : 'idle')
              setError('')
            }
            backup()
          } catch (failure) {
            if (mounted.current) {
              setSaveStatus('error')
              setError(
                failure instanceof Error
                  ? failure.message
                  : 'Không lưu được tiến độ',
              )
            }
            backup()
            throw failure
          }
        })
      queue.current = task
      return task
    },
    [backup, elapsed, kind],
  )

  const install = useCallback(
    (next: ListeningPracticeSession, progress: ListeningDraft) => {
      let restored = progress
      try {
        const local = JSON.parse(
          sessionStorage.getItem(backupKey(next.id)) || 'null',
        ) as ListeningDraft | null
        if (
          progress.status !== 'COMPLETED' &&
          local &&
          local.revision === progress.revision &&
          local.answers &&
          typeof local.answers === 'object' &&
          !Array.isArray(local.answers) &&
          Object.values(local.answers).every(
            (value) => typeof value === 'string' && value.length <= 3000,
          ) &&
          Number.isInteger(local.current_index) &&
          local.current_index >= 0 &&
          Number.isFinite(local.elapsed_seconds) &&
          local.elapsed_seconds >= 0 &&
          local.elapsed_seconds <= next.totalSeconds &&
          Number.isFinite(local.audio_position) &&
          local.audio_position >= 0 &&
          [0.5, 0.75, 1, 1.25, 1.5].includes(local.playback_speed)
        )
          restored = {
            ...progress,
            ...local,
            elapsed_seconds: Math.max(
              local.elapsed_seconds,
              progress.elapsed_seconds,
            ),
          }
      } catch {
        /* Ignore malformed local backups. */
      }
      const index = Math.min(
        Math.max(0, restored.current_index),
        next.groups.length - 1,
      )
      const groupTimes = { ...(progress.group_elapsed || {}) }
      for (const [key, value] of Object.entries(restored.group_elapsed || {})) {
        if (
          /^\d+$/.test(key) &&
          Number(key) < next.groups.length &&
          Number.isFinite(value) &&
          value >= 0
        )
          groupTimes[key] = Math.max(groupTimes[key] || 0, value)
      }
      // Distribute legacy total elapsed time once; new sessions persist each group's budget.
      if (!Object.keys(groupTimes).length && restored.elapsed_seconds)
        groupTimes[index] = restored.elapsed_seconds
      restored = {
        ...restored,
        group_elapsed: groupTimes,
        current_index: index,
      }
      sessionRef.current = next
      draftRef.current = restored
      started.current = Date.now()
      finished.current = progress.status === 'COMPLETED'
      savedGeneration.current = -1
      setSession(next)
      setDraft(restored)
      setResult(progress.result || null)
      setRemaining(
        Math.max(
          0,
          Math.ceil(
            (next.groups[index].timeSeconds || next.totalSeconds) -
              (restored.group_elapsed?.[index] || 0),
          ),
        ),
      )
      setSaveStatus('idle')
    },
    [backupKey],
  )

  const flushUnsaved = useCallback(() => {
    if (!finished.current && savedGeneration.current !== generation.current) {
      backup()
      void save().catch(() => undefined)
    }
  }, [backup, save])

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  useEffect(() => {
    if (!resumeId || sessionRef.current?.id === resumeId) return
    let cancelled = false
    void Promise.all([
      service.get(kind, resumeId),
      service.progress(kind, resumeId),
    ])
      .then(([next, progress]) => {
        if (!cancelled) install(next, progress)
      })
      .catch((failure) => {
        if (!cancelled)
          setError(
            failure instanceof Error ? failure.message : 'Không tải được phiên',
          )
      })
      .finally(() => {
        if (!cancelled) setBusy(false)
      })
    return () => {
      cancelled = true
    }
  }, [kind, resumeId, install])

  useEffect(() => {
    if (!session || result) return
    const timer = window.setInterval(() => {
      elapsed()
      setRemaining(groupRemaining())
      setDraft((previous) => ({
        ...previous,
        group_elapsed: draftRef.current.group_elapsed,
        elapsed_seconds: draftRef.current.elapsed_seconds,
      }))
      backup()
    }, 1000)
    const autosave = window.setInterval(() => {
      void save().catch(() => undefined)
    }, 5000)
    const unload = (event: BeforeUnloadEvent) => {
      backup()
      if (savedGeneration.current !== generation.current) event.preventDefault()
    }
    window.addEventListener('beforeunload', unload)
    return () => {
      clearInterval(timer)
      clearInterval(autosave)
      window.removeEventListener('beforeunload', unload)
      flushUnsaved()
    }
  }, [session, result, save, elapsed, backup, flushUnsaved, groupRemaining])
  useEffect(() => {
    if (!session || result) return
    const timer = window.setTimeout(() => {
      void save().catch(() => undefined)
    }, 650)
    return () => clearTimeout(timer)
  }, [
    session,
    result,
    draft.answers,
    draft.current_index,
    draft.playback_speed,
    save,
  ])

  const update = (patch: Partial<ListeningDraft>) => {
    elapsed()
    const next = { ...draftRef.current, ...patch }
    generation.current++
    draftRef.current = next
    setDraft(next)
    setRemaining(groupRemaining())
    setSaveStatus('idle')
    backup()
  }
  const start = async (
    exerciseId: string | undefined,
    filters: Parameters<typeof service.create>[2],
    preset: string,
    difficulty: string,
  ) => {
    if (mutationLock.current) return
    if (!user?.user_id) {
      window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
      return
    }
    mutationLock.current = true
    setBusy(true)
    setError('')
    try {
      const next = await service.create(
        kind,
        exerciseId,
        filters,
        preset,
        difficulty,
      )
      if (!mounted.current) return
      install(next, emptyDraft())
      backup()
      onStarted?.(next.id)
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Không tạo được phiên',
      )
    } finally {
      mutationLock.current = false
      setBusy(false)
    }
  }
  const submit = async () => {
    if (mutationLock.current || !sessionRef.current) return
    mutationLock.current = true
    setBusy(true)
    setError('')
    try {
      finalizing.current = true
      const target = sessionRef.current
      const current = await service.progress(kind, target.id)
      if (current.status === 'COMPLETED' && current.result) {
        finished.current = true
        setResult(current.result)
        setSaveStatus('saved')
        sessionStorage.removeItem(backupKey(target.id))
        return
      }
      await save(true)
      const answer = await service.submit(
        kind,
        target.id,
        draftRef.current.answers,
        elapsed(),
        draftRef.current.revision,
      )
      finished.current = true
      setResult(answer)
      setSaveStatus('saved')
      try {
        sessionStorage.removeItem(backupKey(target.id))
      } catch {
        /* No backup remains necessary. */
      }
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Không nộp được bài',
      )
    } finally {
      finalizing.current = false
      mutationLock.current = false
      setBusy(false)
    }
  }
  const reload = async () => {
    if (!sessionRef.current || mutationLock.current) return
    mutationLock.current = true
    setBusy(true)
    try {
      finalizing.current = true
      await queue.current.catch(() => undefined)
      const id = sessionRef.current.id
      const [next, progress] = await Promise.all([
        service.get(kind, id),
        service.progress(kind, id),
      ])
      sessionStorage.removeItem(backupKey(id))
      install(next, progress)
      setError('')
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Không tải lại được phiên',
      )
    } finally {
      finalizing.current = false
      mutationLock.current = false
      setBusy(false)
    }
  }
  const refreshSession = async () => {
    const target = sessionRef.current
    if (!target) return
    const next = await service.get(kind, target.id)
    sessionRef.current = next
    setSession(next)
  }
  const check = async () => {
    const target = sessionRef.current
    if (!target || mutationLock.current) return
    mutationLock.current = true
    setBusy(true)
    setError('')
    try {
      await save(true)
      await service.check(
        target.id,
        target.groups[draftRef.current.current_index],
        draftRef.current.answers,
      )
      await refreshSession()
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : 'Không kiểm tra được đoạn',
      )
    } finally {
      mutationLock.current = false
      setBusy(false)
    }
  }
  const position = (seconds: number) => {
    draftRef.current = { ...draftRef.current, audio_position: seconds }
  }
  return {
    session,
    draft,
    result,
    busy,
    error,
    saveStatus,
    remaining,
    start,
    submit,
    save,
    reload,
    update,
    position,
    refreshSession,
    check,
  }
}
