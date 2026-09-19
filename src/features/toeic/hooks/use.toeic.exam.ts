/// Hook quản lý trạng thái thi TOEIC, đồng hồ đếm ngược, chấm điểm và gợi ý khóa học.
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/features/courses/services/course.service'
import { examService, type BackendToeicExam } from '@/features/toeic/services/exam.service'
import { useToeicExamDetailQuery } from '@/features/toeic/hooks/use.toeic.query'
import { toeicKeys } from '@/features/toeic/keys/toeic.keys'
import { userService } from '@/features/user/services/user.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useNavigate } from '@/lib/navigation'
import type { Course } from '@/types/api.types'
import type { ToeicQuestion } from '@/features/toeic/types/toeic'
import type { ExamResultMetrics } from '@/features/toeic/components/toeic.exam.result'
import { parseQuestionsFromExamData } from '@/features/toeic/helpers/toeic.question.parser'
import { calculateToeicExamResults } from '@/features/toeic/helpers/toeic.score.helper'
import { Analytics } from '@/lib/posthog'
import { toast } from '@/store/toast.store'

export type PracticeMode = 'FULL' | 'LISTENING' | 'READING' | 'PART'

export interface EvaluatedAnswerItem {
  whisper_transcript?: string
  ai_score?: number
  ai_feedback?: {
    pronunciation_score?: number
    fluency_score?: number
    grammar_score?: number
    vocabulary_score?: number
    detailed_comment?: string
    improvement_tips?: string[]
  }
  is_correct?: boolean
}

export interface ExamState {
  mode: PracticeMode
  selectedParts: number[]
  currentQuestionIndex: number
  answers: Record<number, string>
  flagged: number[]
  timeRemaining: number
  started: boolean
  submitted: boolean
  showAnswer: boolean
  timedMode: boolean
}

interface ToeicExamDraft {
  attemptId: string | null
  startedAt: number
  totalDurationSeconds: number
  answers: Record<number, string>
  flagged: number[]
  currentQuestionIndex: number
}

export function useToeicExam(examId?: string) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: examData = null, isLoading: isLoadingExam } = useToeicExamDetailQuery(
    examId || '',
    Boolean(examId)
  )
  const [allQuestions, setAllQuestions] = useState<ToeicQuestion[]>([])
  const [state, setState] = useState<ExamState>({
    mode: 'FULL',
    selectedParts: [1, 2, 3, 4, 5, 6, 7],
    currentQuestionIndex: 0,
    answers: {},
    flagged: [],
    timeRemaining: 120 * 60,
    started: false,
    submitted: false,
    showAnswer: false,
    timedMode: true,
  })

  const [evaluatedAnswers, setEvaluatedAnswers] = useState<Record<number, EvaluatedAnswerItem>>({})
  const [isSubmittingAttempt, setIsSubmittingAttempt] = useState<boolean>(false)

  const [recommendedCourses, setRecommendedCourses] = useState<
    (Course & { recommendation_reason?: string; match_score?: number })[]
  >([])
  const [targetBand, setTargetBand] = useState<string>('')
  const [levelLabel, setLevelLabel] = useState<string>('')
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const attemptIdRef = useRef<string | null>(null)
  const initializedExamIdRef = useRef<string | null>(null)
  const isSubmittingAttemptBackendRef = useRef(false)
  const hasCompletedBackendSubmissionRef = useRef(false)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const handleSubmitRef = useRef<() => void>(() => {})
  const storageKey = examId ? `lingo_toeic_draft_${examId}` : ''

  useEffect(() => {
    if (!examData || initializedExamIdRef.current === examData._id) return

    initializedExamIdRef.current = examData._id
    const allParts = [1, 2, 3, 4, 5, 6, 7]
    const questions = parseQuestionsFromExamData(examData, allParts)
    setAllQuestions(questions)
    const time =
      typeof examData.duration_minutes === 'number' && examData.duration_minutes > 0
        ? examData.duration_minutes * 60
        : 120 * 60

    let draftRestored = false
    let initialAnswers: Record<number, string> = {}
    let initialFlagged: number[] = []
    let initialQIndex = 0
    let effectiveTime = time
    let shouldAutoSubmit = false

    if (typeof window !== 'undefined' && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const draft: ToeicExamDraft = JSON.parse(saved)
          if (
            draft &&
            typeof draft.startedAt === 'number' &&
            typeof draft.totalDurationSeconds === 'number'
          ) {
            const elapsed = Math.floor((Date.now() - draft.startedAt) / 1000)
            const remaining = Math.max(0, draft.totalDurationSeconds - elapsed)

            draftRestored = true
            initialAnswers = draft.answers || {}
            initialFlagged = draft.flagged || []
            initialQIndex = typeof draft.currentQuestionIndex === 'number' ? draft.currentQuestionIndex : 0
            if (draft.attemptId) {
              attemptIdRef.current = draft.attemptId
            }

            if (remaining <= 0) {
              effectiveTime = 0
              shouldAutoSubmit = true
              toast.warning('Thời gian làm bài đã kết thúc! Hệ thống tự động thu bài.')
            } else {
              effectiveTime = remaining
              toast.info('Đã tự động khôi phục tiến trình bài thi TOEIC trước đó.')
            }
          }
        }
      } catch {}
    }

    setState((prev) => ({
      ...prev,
      mode: 'FULL',
      selectedParts: allParts,
      currentQuestionIndex: initialQIndex,
      answers: initialAnswers,
      flagged: initialFlagged,
      timeRemaining: effectiveTime,
      started: true,
      submitted: shouldAutoSubmit,
      showAnswer: shouldAutoSubmit,
      timedMode: true,
    }))

    if (!draftRestored && typeof window !== 'undefined' && storageKey) {
      try {
        const newDraft: ToeicExamDraft = {
          attemptId: attemptIdRef.current,
          startedAt: Date.now(),
          totalDurationSeconds: time,
          answers: {},
          flagged: [],
          currentQuestionIndex: 0,
        }
        localStorage.setItem(storageKey, JSON.stringify(newDraft))
      } catch {}
    }

    const isSystemPlacement = Boolean(
      examData.is_system_placement ||
      examData.placement_type ||
      Boolean(examData.code && examData.code.includes('placement')) ||
      examData.title?.toLowerCase().includes('đầu vào') ||
      examData.title?.toLowerCase().includes('placement') ||
      examId?.includes('placement')
    )

    const authUser = useAuthStore.getState().user
    if (authUser && examId && !attemptIdRef.current) {
      examService
        .startExamAttempt(examId, {
          attempt_type: isSystemPlacement ? 'PLACEMENT' : 'FULL_TEST',
        })
        .then((attemptRes) => {
          if (attemptRes && attemptRes.attempt_id) {
            attemptIdRef.current = attemptRes.attempt_id
            if (attemptRes.expires_at) {
              const serverRemaining = Math.max(
                0,
                Math.floor((new Date(attemptRes.expires_at).getTime() - Date.now()) / 1000)
              )
              if (serverRemaining <= 0) {
                handleSubmitRef.current()
                return
              }
              setState((prev) => ({ ...prev, timeRemaining: serverRemaining }))
            }

            if (Array.isArray(attemptRes.interim_answers) && attemptRes.interim_answers.length > 0) {
              setState((prev) => {
                const merged = { ...prev.answers }
                attemptRes.interim_answers?.forEach((ans) => {
                  if (ans.question_number && ans.selected_option && !merged[ans.question_number]) {
                    merged[ans.question_number] = ans.selected_option
                  }
                })
                return { ...prev, answers: merged }
              })
            }

            if (typeof window !== 'undefined' && storageKey) {
              try {
                const existing = localStorage.getItem(storageKey)
                if (existing) {
                  const parsed = JSON.parse(existing)
                  localStorage.setItem(
                    storageKey,
                    JSON.stringify({ ...parsed, attemptId: attemptRes.attempt_id })
                  )
                }
              } catch {}
            }
          }
        })
        .catch(() => {})
    }
  }, [examData, examId, storageKey])

  const calculateResults = useCallback((): ExamResultMetrics => {
    return calculateToeicExamResults(allQuestions, state.answers, evaluatedAnswers)
  }, [allQuestions, state.answers, evaluatedAnswers])

  const submitAttemptToBackend = useCallback(async () => {
    if (isSubmittingAttemptBackendRef.current || hasCompletedBackendSubmissionRef.current) return
    const { user } = useAuthStore.getState()
    if (!user) {
      toast.info('Kết quả làm bài đã được chấm điểm! Đăng nhập để lưu kết quả vào lịch sử thi.')
      return
    }

    const res = calculateResults()
    Analytics.examSubmitted({
      examId: examId || '',
      examTitle: examData?.title || '',
      totalScore: res.estimatedTotal,
      listeningScore: res.estimatedListening,
      readingScore: res.estimatedReading,
      mode: state.timedMode ? 'timed' : 'practice',
    })

    const is4Skills = Boolean(
      examId?.includes('4skills') ||
        examData?.skills_enabled === 'ALL' ||
        (res.speakingTotal && res.speakingTotal > 0) ||
        (res.writingTotal && res.writingTotal > 0)
    )

    const placementData = {
      placement_test_score: res.estimatedTotal,
      placement_listening_score: res.estimatedListening,
      placement_reading_score: res.estimatedReading,
      placement_speaking_score: is4Skills ? (res.estimatedSpeaking ?? 0) : undefined,
      placement_writing_score: is4Skills ? (res.estimatedWriting ?? 0) : undefined,
      placement_skills_type: is4Skills ? '4SKILLS' : '2SKILLS',
      target_toeic_score: Math.min(990, res.estimatedTotal + 150),
      current_estimated_score: res.estimatedTotal,
      is_score_manually_edited: false,
      placement_tested_at: new Date().toISOString(),
    }

    try {
      userService.updateProfile(placementData).catch(() => null)
      const { user: currentUser, setUser } = useAuthStore.getState()
      if (currentUser) {
        setUser({ ...currentUser, ...placementData })
      }
    } catch {}

    const isSystemPlacement = Boolean(
      examData?.is_system_placement ||
      examData?.placement_type ||
      Boolean(examData?.code && examData.code.includes('placement')) ||
      examData?.title?.toLowerCase().includes('đầu vào') ||
      examData?.title?.toLowerCase().includes('placement') ||
      examId?.includes('placement')
    )

    const formattedAnswers = allQuestions
      .filter((q) => state.answers[q.questionNumber])
      .map((q) => ({
        question_id: q.id,
        selected_option: state.answers[q.questionNumber],
      }))

    const totalSeconds = examData?.duration_minutes ? examData.duration_minutes * 60 : 7200
    const timeSpent = Math.max(1, totalSeconds - state.timeRemaining)

    try {
      isSubmittingAttemptBackendRef.current = true
      setIsSubmittingAttempt(true)
      let currentAttemptId = attemptIdRef.current
      if (!currentAttemptId && examId) {
        const newAttempt = await examService.startExamAttempt(examId, {
          attempt_type: isSystemPlacement ? 'PLACEMENT' : 'FULL_TEST',
        })
        if (newAttempt && newAttempt.attempt_id) {
          currentAttemptId = newAttempt.attempt_id
          attemptIdRef.current = currentAttemptId
        }
      }
      if (currentAttemptId) {
        const submitRes = await examService.submitExamAttempt(currentAttemptId, formattedAnswers, timeSpent)
        hasCompletedBackendSubmissionRef.current = true
        if (submitRes && Array.isArray((submitRes as Record<string, unknown>).answers)) {
          const rawAnswers = (submitRes as Record<string, unknown>).answers as Array<Record<string, unknown>>
          const evalMap: Record<number, EvaluatedAnswerItem> = {}
          rawAnswers.forEach((ans) => {
            const qNum = typeof ans.question_number === 'number' ? ans.question_number : Number(ans.question_number)
            if (qNum) {
              evalMap[qNum] = {
                whisper_transcript: typeof ans.whisper_transcript === 'string' ? ans.whisper_transcript : undefined,
                ai_score: typeof ans.ai_score === 'number' ? ans.ai_score : undefined,
                ai_feedback: ans.ai_feedback as EvaluatedAnswerItem['ai_feedback'],
                is_correct: typeof ans.is_correct === 'boolean' ? ans.is_correct : undefined,
              }
            }
          })
          setEvaluatedAnswers(evalMap)
          const updatedRes = calculateToeicExamResults(allQuestions, state.answers, evalMap)
          const is4SkillsUpdated = Boolean(
            examId?.includes('4skills') ||
              examData?.skills_enabled === 'ALL' ||
              (updatedRes.speakingTotal && updatedRes.speakingTotal > 0) ||
              (updatedRes.writingTotal && updatedRes.writingTotal > 0)
          )
          const updatedPlacementData = {
            placement_test_score: updatedRes.estimatedTotal,
            placement_listening_score: updatedRes.estimatedListening,
            placement_reading_score: updatedRes.estimatedReading,
            placement_speaking_score: is4SkillsUpdated ? (updatedRes.estimatedSpeaking ?? 0) : undefined,
            placement_writing_score: is4SkillsUpdated ? (updatedRes.estimatedWriting ?? 0) : undefined,
            placement_skills_type: is4SkillsUpdated ? '4SKILLS' : '2SKILLS',
            target_toeic_score: Math.min(990, updatedRes.estimatedTotal + 150),
            current_estimated_score: updatedRes.estimatedTotal,
            is_score_manually_edited: false,
            placement_tested_at: new Date().toISOString(),
          }
          try {
            userService.updateProfile(updatedPlacementData).catch(() => null)
            const { user: updatedUser, setUser } = useAuthStore.getState()
            if (updatedUser) {
              setUser({ ...updatedUser, ...updatedPlacementData })
            }
          } catch {}
        }
        queryClient.invalidateQueries({ queryKey: toeicKeys.history() })
        queryClient.invalidateQueries({ queryKey: toeicKeys.courseAttempts() })
      }
    } catch (err) {
      console.warn('Lỗi khi nộp bài lên hệ thống:', err)
    } finally {
      if (typeof window !== 'undefined' && storageKey) {
        try {
          localStorage.removeItem(storageKey)
        } catch {}
      }
      isSubmittingAttemptBackendRef.current = false
      setIsSubmittingAttempt(false)
    }

    setIsLoadingRecommendations(true)
    const weakSkills: string[] = []
    if (res.listeningTotal > 0 && res.listeningCorrect / res.listeningTotal < 0.6) weakSkills.push('LISTENING')
    if (res.readingTotal > 0 && res.readingCorrect / res.readingTotal < 0.6) weakSkills.push('READING')

    courseService
      .getRecommendedCourses({
        total_score: res.estimatedTotal,
        listening_score: res.estimatedListening,
        reading_score: res.estimatedReading,
        weak_skills: weakSkills,
      })
      .then((coursesRes) => {
        if (coursesRes?.recommendations) {
          setRecommendedCourses(coursesRes.recommendations)
          setTargetBand(coursesRes.target_band || '')
          setLevelLabel(coursesRes.level_label || '')
        }
      })
      .catch((err) => {
        console.warn('Cannot fetch recommendations:', err)
      })
      .finally(() => {
        setIsLoadingRecommendations(false)
      })
  }, [allQuestions, calculateResults, examData, examId, queryClient, state.answers, state.timeRemaining, state.timedMode])

  useEffect(() => {
    if (!state.submitted) return
    submitAttemptToBackend()
  }, [state.submitted, submitAttemptToBackend])

  useEffect(() => {
    if (!state.started || state.submitted || !state.timedMode) return

    timerRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.timeRemaining <= 1) {
          clearInterval(timerRef.current as NodeJS.Timeout)
          toast.warning('Hết thời gian làm bài! Hệ thống đã tự động thu bài và chấm điểm các câu bạn đã làm.')
          return { ...prev, timeRemaining: 0, submitted: true, showAnswer: true }
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 }
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.started, state.submitted, state.timedMode])

  const handleSelectAnswer = (optionKey: string) => {
    const currentQ = allQuestions[state.currentQuestionIndex]
    if (!currentQ || state.submitted) return
    setState((prev) => {
      const nextAnswers = { ...prev.answers, [currentQ.questionNumber]: optionKey }
      if (typeof window !== 'undefined' && storageKey) {
        try {
          const existing = localStorage.getItem(storageKey)
          const base: ToeicExamDraft = existing
            ? JSON.parse(existing)
            : {
                attemptId: attemptIdRef.current,
                startedAt: Date.now(),
                totalDurationSeconds: 120 * 60,
                answers: {},
                flagged: prev.flagged,
                currentQuestionIndex: prev.currentQuestionIndex,
              }
          localStorage.setItem(storageKey, JSON.stringify({ ...base, answers: nextAnswers }))
        } catch {}
      }

      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = setTimeout(() => {
        const currentAttemptId = attemptIdRef.current
        if (currentAttemptId) {
          const formatted = allQuestions
            .filter((q) => nextAnswers[q.questionNumber])
            .map((q) => ({
              question_id: q.id,
              selected_option: nextAnswers[q.questionNumber],
              question_number: q.questionNumber,
            }))
          examService.syncExamAnswers(currentAttemptId, formatted).catch(() => {})
        }
      }, 1500)

      return { ...prev, answers: nextAnswers }
    })
  }

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= allQuestions.length) return
    setState((prev) => {
      if (typeof window !== 'undefined' && storageKey) {
        try {
          const existing = localStorage.getItem(storageKey)
          if (existing) {
            const base = JSON.parse(existing)
            localStorage.setItem(storageKey, JSON.stringify({ ...base, currentQuestionIndex: index }))
          }
        } catch {}
      }
      return { ...prev, currentQuestionIndex: index }
    })
  }

  const toggleFlag = () => {
    const currentQ = allQuestions[state.currentQuestionIndex]
    if (!currentQ) return
    setState((prev) => {
      const nextFlagged = prev.flagged.includes(currentQ.questionNumber)
        ? prev.flagged.filter((q) => q !== currentQ.questionNumber)
        : [...prev.flagged, currentQ.questionNumber]
      if (typeof window !== 'undefined' && storageKey) {
        try {
          const existing = localStorage.getItem(storageKey)
          if (existing) {
            const base = JSON.parse(existing)
            localStorage.setItem(storageKey, JSON.stringify({ ...base, flagged: nextFlagged }))
          }
        } catch {}
      }
      return { ...prev, flagged: nextFlagged }
    })
  }

  const handleSubmit = useCallback(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        localStorage.removeItem(storageKey)
      } catch {}
    }
    setState((prev) => ({ ...prev, submitted: true, showAnswer: true }))
  }, [storageKey])

  useEffect(() => {
    handleSubmitRef.current = handleSubmit
  }, [handleSubmit])

  const handleRetry = () => {
    hasCompletedBackendSubmissionRef.current = false
    attemptIdRef.current = null
    if (typeof window !== 'undefined' && storageKey) {
      try {
        localStorage.removeItem(storageKey)
        const time =
          typeof examData?.duration_minutes === 'number' && examData.duration_minutes > 0
            ? examData.duration_minutes * 60
            : 120 * 60
        const newDraft: ToeicExamDraft = {
          attemptId: null,
          startedAt: Date.now(),
          totalDurationSeconds: time,
          answers: {},
          flagged: [],
          currentQuestionIndex: 0,
        }
        localStorage.setItem(storageKey, JSON.stringify(newDraft))
      } catch {}
    }
    setState((prev) => ({
      ...prev,
      answers: {},
      flagged: [],
      submitted: false,
      showAnswer: false,
      currentQuestionIndex: 0,
    }))
  }

  const handleChooseAnother = () => {
    navigate('/toeic')
  }

  const handleSubmitAttemptAsync = useCallback(async () => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        localStorage.removeItem(storageKey)
      } catch {}
    }
    setState((prev) => ({ ...prev, submitted: true, showAnswer: true }))
    await submitAttemptToBackend()
  }, [storageKey, submitAttemptToBackend])

  return {
    examData,
    isLoadingExam,
    allQuestions,
    state,
    recommendedCourses,
    targetBand,
    levelLabel,
    isLoadingRecommendations,
    handleSelectAnswer,
    goToQuestion,
    toggleFlag,
    handleSubmit,
    handleSubmitAttemptAsync,
    handleRetry,
    handleChooseAnother,
    calculateResults,
    evaluatedAnswers,
    isSubmittingAttempt,
  }
}
