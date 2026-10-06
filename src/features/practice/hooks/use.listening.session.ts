// Hook quản lý phiên luyện nghe và nộp bài đánh giá.

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/store/toast.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { listeningSessionService } from '@/features/practice/services/listening-session.service'
import type {
  ListeningSession,
  ListeningSessionResult,
  CreateSessionParams,
} from '@/features/practice/types/listening-session'

interface UseListeningSessionOptions {
  onComplete?: (result: ListeningSessionResult) => void
  onError?: (error: Error) => void
}

export function useListeningSession(options: UseListeningSessionOptions = {}) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const user = useAuthStore((s) => s.user)
  const userId = user?.user_id

  const [session, setSession] = useState<ListeningSession | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [result, setResult] = useState<ListeningSessionResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showResult, setShowResult] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  const currentExercise = session?.exercises?.[currentIndex]

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimerForSession = useCallback((targetSession?: ListeningSession | null) => {
    const activeSession = targetSession || session
    if (!activeSession) return

    const timePerQuestion = activeSession.time_per_question_seconds || 20
    setTimeLeft(timePerQuestion)
    startTimeRef.current = new Date()

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return activeSession.time_per_question_seconds || 20
        }
        return prev - 1
      })
    }, 1000)
  }, [session])

  const startTimer = useCallback(() => {
    startTimerForSession(session)
  }, [session, startTimerForSession])

  const handleSubmitSession = useCallback(async (finalAnswers?: Record<string, string>) => {
    if (!session) return

    setIsSubmitting(true)
    stopTimer()

    try {
      const answersToSubmit = finalAnswers || answers
      const totalTime = startTimeRef.current
        ? Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000)
        : session.total_time_seconds

      const skippedIndices: number[] = []
      for (let i = 0; i < session.total_questions; i++) {
        const ans = answersToSubmit[i.toString()] || answersToSubmit[i]
        if (!ans || ans === '__SKIPPED__') {
          skippedIndices.push(i)
        }
      }

      const sessionResult = await listeningSessionService.submitSession({
        session_id: session.session_id,
        userId: userId || '',
        total_time_seconds: totalTime,
        skipped_indices: skippedIndices,
        answers: answersToSubmit,
      })

      setResult(sessionResult)
      setIsCompleted(true)
      setShowResult(true)
      options.onComplete?.(sessionResult)
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string | string[]; error?: string } } }
      const rawMsg = errorObj?.response?.data?.message || errorObj?.response?.data?.error
      const errorMessage = Array.isArray(rawMsg) ? rawMsg.join(', ') : (rawMsg || (isVietnamese ? 'Không thể nộp bài' : 'Failed to submit session'))
      const err = error instanceof Error ? error : new Error(errorMessage)
      options.onError?.(err)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [session, answers, isVietnamese, options, stopTimer, userId])

  const createSession = useCallback(async (params: CreateSessionParams) => {
    const activeUserId = userId || user?.user_id
    if (!activeUserId) {
      toast.warning(isVietnamese ? 'Vui lòng đăng nhập để bắt đầu phiên luyện nghe!' : 'Please log in to start a listening session!')
      window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
      return null
    }

    setIsLoading(true)
    try {
      const payload: CreateSessionParams = {
        ...params,
        user_id: activeUserId,
        userId: activeUserId,
      }
      const newSession = await listeningSessionService.createSession(payload)
      setSession(newSession)
      setCurrentIndex(0)
      setAnswers({})
      setSelectedAnswer(null)
      setIsCompleted(false)
      setResult(null)
      setShowResult(false)
      startTimerForSession(newSession)
      return newSession
    } catch (error: unknown) {
      const errorObj = error as { response?: { data?: { message?: string | string[]; error?: string } } }
      const rawMsg = errorObj?.response?.data?.message || errorObj?.response?.data?.error
      const errorMessage = Array.isArray(rawMsg) ? rawMsg.join(', ') : (rawMsg || (isVietnamese ? 'Không thể tạo phiên luyện tập' : 'Failed to create session'))
      const err = error instanceof Error ? error : new Error(errorMessage)
      options.onError?.(err)
      toast.error(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [isVietnamese, options, startTimerForSession, user?.user_id, userId])

  const handleSetSelectedAnswer = useCallback((answerKey: string | null) => {
    setSelectedAnswer(answerKey)
    if (!session || answerKey === null) return

    setAnswers((prev) => ({
      ...prev,
      [currentIndex.toString()]: answerKey,
      [currentIndex]: answerKey,
    }))

    listeningSessionService.submitAnswer({
      session_id: session.session_id,
      question_index: currentIndex,
      answer: answerKey,
    }).catch(() => {})
  }, [session, currentIndex])

  const submitAnswer = useCallback(async () => {
    if (!session) return

    try {
      const currentAns = selectedAnswer || answers[currentIndex.toString()] || answers[currentIndex]
      const newAnswers = currentAns ? { ...answers, [currentIndex.toString()]: currentAns, [currentIndex]: currentAns } : answers
      setAnswers(newAnswers)

      if (currentIndex >= session.total_questions - 1) {
        await handleSubmitSession(newAnswers)
      } else {
        const nextIdx = currentIndex + 1
        setCurrentIndex(nextIdx)
        const nextAns = newAnswers[nextIdx.toString()] || newAnswers[nextIdx] || null
        setSelectedAnswer(nextAns)
        startTimer()
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error('Failed to submit answer')
      options.onError?.(err)
    }
  }, [session, currentIndex, selectedAnswer, answers, startTimer, handleSubmitSession, options])

  const goToQuestion = useCallback((index: number) => {
    if (!session || index < 0 || index >= session.total_questions) return
    setCurrentIndex(index)
    setSelectedAnswer(answers[index.toString()] || answers[index] || null)
    startTimer()
  }, [session, answers, startTimer])

  const goNext = useCallback(() => {
    if (!session || currentIndex >= session.total_questions - 1) return
    goToQuestion(currentIndex + 1)
  }, [session, currentIndex, goToQuestion])

  const goPrev = useCallback(() => {
    if (!session || currentIndex <= 0) return
    goToQuestion(currentIndex - 1)
  }, [session, currentIndex, goToQuestion])

  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [stopTimer])

  const getResult = useCallback(async (sessionId: string) => {
    try {
      const sessionResult = await listeningSessionService.getResult(sessionId)
      setResult(sessionResult)
      setShowResult(true)
      return sessionResult
    } catch {
      return null
    }
  }, [])

  return {
    session,
    currentIndex,
    currentExercise,
    answers,
    selectedAnswer,
    setSelectedAnswer: handleSetSelectedAnswer,
    isLoading,
    isSubmitting,
    isCompleted,
    result,
    showResult,
    timeLeft,
    totalQuestions: session?.total_questions || 0,
    createSession,
    submitAnswer,
    handleSubmitSession,
    goNext,
    goPrev,
    goToQuestion,
    getResult,
    setShowResult,
  }
}
