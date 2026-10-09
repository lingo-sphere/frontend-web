/**
 * @file use.listening.session.ts
 * @description Hook quản lý Listening Practice Session
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from '@/store/toast.store'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { listeningSessionService } from '../services/listening-session.service'
import type {
  ListeningSession,
  ListeningSessionResult,
  CreateSessionParams,
  TimePreset,
} from '../types/listening-session'

interface UseListeningSessionOptions {
  onComplete?: (result: ListeningSessionResult) => void
  onError?: (error: Error) => void
}

export function useListeningSession(options: UseListeningSessionOptions = {}) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  // Get userId from auth store
  const user = useAuthStore((s) => s.user)
  const userId = user?.user_id

  // State
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

  // Timer ref
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  // Get current exercise
  const currentExercise = session?.exercises?.[currentIndex]

  // ============================================================================
  // TIMER
  // ============================================================================

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const resumeTimer = useCallback(() => {
    if (timerRef.current || !session) return
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return session.time_per_question_seconds || 20
        }
        return prev - 1
      })
    }, 1000)
  }, [session])

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

  const handleAutoNext = useCallback(() => {
    if (!session || !selectedAnswer) return

    // Save answer
    const newAnswers = { ...answers, [currentIndex]: selectedAnswer }
    setAnswers(newAnswers)

    // Check if this is the last question
    if (currentIndex >= session.total_questions - 1) {
      // Submit session
      handleSubmitSession(newAnswers)
    } else {
      // Move to next question
      setCurrentIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      // Restart timer
      startTimer()
    }
  }, [session, currentIndex, selectedAnswer, answers, startTimer])

  // ============================================================================
  // CREATE SESSION
  // ============================================================================

  const createSession = useCallback(async (params: CreateSessionParams) => {
    setIsLoading(true)
    try {
      const activeUserId = userId || user?.user_id
      const payload: CreateSessionParams = {
        ...params,
        ...(activeUserId ? { user_id: activeUserId, userId: activeUserId } : {}),
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
    } catch (error: any) {
      const err = error instanceof Error ? error : new Error('Failed to create session')
      // Extract error message from backend response
      const errorMessage = error?.response?.data?.message ||
                          error?.response?.data?.error ||
                          (isVietnamese ? 'Không thể tạo phiên luyện tập' : 'Failed to create session')
      options.onError?.(err)
      toast.error(errorMessage)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [isVietnamese, options, startTimer])

  // Save selected answer immediately to answers state and sync to backend
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

      // Check if this is the last question
      if (currentIndex >= session.total_questions - 1) {
        await handleSubmitSession(newAnswers)
      } else {
        // Move to next question
        const nextIdx = currentIndex + 1
        setCurrentIndex(nextIdx)
        const nextAns = newAnswers[nextIdx.toString()] || newAnswers[nextIdx] || null
        setSelectedAnswer(nextAns)
        startTimer()
      }
    } catch (error) {
      console.error('Failed to submit answer:', error)
    }
  }, [session, currentIndex, selectedAnswer, answers, startTimer])

  // ============================================================================
  // SUBMIT SESSION
  // ============================================================================

  const handleSubmitSession = useCallback(async (finalAnswers?: Record<string, string>) => {
    if (!session) return

    setIsSubmitting(true)
    stopTimer()

    try {
      const answersToSubmit = finalAnswers || answers
      const totalTime = startTimeRef.current
        ? Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000)
        : session.total_time_seconds

      // Find skipped questions (unanswered)
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
    } catch (error: any) {
      console.error('[handleSubmitSession] Error:', error)
      const rawMsg = error?.response?.data?.message || error?.response?.data?.error
      const errorMessage = Array.isArray(rawMsg) ? rawMsg.join(', ') : (rawMsg || (isVietnamese ? 'Không thể nộp bài' : 'Failed to submit session'))
      const err = error instanceof Error ? error : new Error(errorMessage)
      options.onError?.(err)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [session, answers, isVietnamese, options, stopTimer, userId])

  // ============================================================================
  // NAVIGATION
  // ============================================================================

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

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [stopTimer])

  // ============================================================================
  // GET RESULT
  // ============================================================================

  const getResult = useCallback(async (sessionId: string) => {
    try {
      const sessionResult = await listeningSessionService.getResult(sessionId)
      setResult(sessionResult)
      setShowResult(true)
      return sessionResult
    } catch (error) {
      console.error('Failed to get result:', error)
      return null
    }
  }, [])

  return {
    // State
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

    // Actions
    createSession,
    submitAnswer,
    handleSubmitSession,
    goNext,
    goPrev,
    goToQuestion,
    getResult,
    setShowResult,
    pauseTimer,
    resumeTimer,

    // Helpers
    isCorrectAnswer: (key: string) => {
      if (!currentExercise?.options) return false
      const opt = currentExercise.options.find(o => o.key === key)
      return opt?.key === currentExercise.options?.find(o => {
        // Find correct answer from the original options
        return true // We'll need to track this differently
      })?.key
    },
  }
}
