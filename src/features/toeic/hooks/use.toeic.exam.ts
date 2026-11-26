// Hook quản lý trạng thái thi TOEIC, đồng hồ đếm ngược, chấm điểm và gợi ý khóa học.
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/features/courses/services/course.service'
import { examService } from '@/features/toeic/services/exam.service'
import { useToeicExamDetailQuery } from '@/features/toeic/hooks/use.toeic.query'
import { toeicKeys } from '@/features/toeic/keys/toeic.keys'
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
  const handleSubmitRef = useRef<() => void>(() => {})

  useEffect(() => {
    if (!examData || initializedExamIdRef.current === examData._id) return

    initializedExamIdRef.current = examData._id
    const allParts = [1, 2, 3, 4, 5, 6, 7]
    const questions = parseQuestionsFromExamData(examData, allParts)
    setAllQuestions(questions)

    const is4SkillsPlacement = Boolean(
      examData.skills_enabled === 'ALL' ||
      examData.placement_type === '4SKILLS' ||
      (typeof examId === 'string' && (examId.includes('4skills') || examId.includes('full')))
    )
    const is2SkillsPlacement = Boolean(
      examData.skills_enabled === 'LR' ||
      examData.placement_type === '2SKILLS' ||
      (typeof examId === 'string' && (examId.includes('2skills') || examId.includes('lr')))
    )

    const expectedPlacementMinutes = is4SkillsPlacement ? 60 : is2SkillsPlacement ? 40 : 120
    const time =
      typeof examData.duration_minutes === 'number' && examData.duration_minutes > 0
        ? examData.duration_minutes * 60
        : expectedPlacementMinutes * 60

    if (typeof window !== 'undefined' && examId) {
      try {
        localStorage.removeItem(`lingo_toeic_draft_${examId}`)
      } catch {}
    }

    setState({
      mode: 'FULL',
      selectedParts: allParts,
      currentQuestionIndex: 0,
      answers: {},
      flagged: [],
      timeRemaining: time,
      started: false,
      submitted: false,
      showAnswer: false,
      timedMode: true,
    })
  }, [examData, examId])

  const startExam = useCallback(() => {
    setState((prev) => {
      if (prev.started) return prev
      return { ...prev, started: true }
    })

    if (!examData || !examId) return

    const isSystemPlacement = Boolean(
      examData.is_system_placement ||
      examData.placement_type ||
      Boolean(examData.code && examData.code.includes('placement')) ||
      examData.title?.toLowerCase().includes('đầu vào') ||
      examData.title?.toLowerCase().includes('placement') ||
      examId.includes('placement')
    )

    const authUser = useAuthStore.getState().user
    if (authUser && !attemptIdRef.current) {
      examService
        .startExamAttempt(examId, {
          attempt_type: isSystemPlacement ? 'PLACEMENT' : 'FULL_TEST',
        })
        .then((attemptRes) => {
          if (attemptRes && attemptRes.attempt_id) {
            attemptIdRef.current = attemptRes.attempt_id
          }
        })
        .catch(() => {})
    }
  }, [examData, examId])

  const calculateResults = useCallback((): ExamResultMetrics => {
    return calculateToeicExamResults(allQuestions, state.answers, evaluatedAnswers)
  }, [allQuestions, state.answers, evaluatedAnswers])

  const submitAttemptToBackend = useCallback(async () => {
    if (isSubmittingAttemptBackendRef.current || hasCompletedBackendSubmissionRef.current) return
    const { user } = useAuthStore.getState()
    if (!user) {
      toast.error('Vui lòng đăng nhập để nộp bài thi và lưu kết quả vào hệ thống!')
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
        }
        queryClient.invalidateQueries({ queryKey: toeicKeys.history() })
        queryClient.invalidateQueries({ queryKey: toeicKeys.courseAttempts() })
      }
    } catch (err) {
      console.warn('Lỗi khi nộp bài lên hệ thống:', err)
    } finally {
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

    const res = calculateResults()
    const isSystemPlacement = Boolean(
      examData?.is_system_placement ||
      examData?.placement_type ||
      Boolean(examData?.code && examData.code.includes('placement')) ||
      examData?.title?.toLowerCase().includes('đầu vào') ||
      examData?.title?.toLowerCase().includes('placement') ||
      examId?.includes('placement')
    )

    if (isSystemPlacement) {
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['activePlacementExams'] })
    }
  }, [state.submitted, calculateResults, examData, examId, queryClient])

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

  const handleSubmitAttemptAsync = useCallback(async () => {
    setState((prev) => ({ ...prev, submitted: true, showAnswer: true }))
    await submitAttemptToBackend()
  }, [submitAttemptToBackend])

  const wasKickedOutRef = useRef(false)
  useEffect(() => {
    const unsubscribe = useAuthStore.subscribe(() => {
      const isKickedOut = useAuthStore.getState().isKickedOut
      if (isKickedOut && !wasKickedOutRef.current && state.started && !state.submitted) {
        wasKickedOutRef.current = true
        toast.warning(
          'Tài khoản của bạn vừa đăng nhập ở thiết bị khác. Hệ thống đã tự động thu bài và chấm điểm các câu đã làm!'
        )
        void handleSubmitAttemptAsync()
      }
    })
    return unsubscribe
  }, [state.started, state.submitted, handleSubmitAttemptAsync])

  const handleSelectAnswer = (optionKey: string) => {
    const currentQ = allQuestions[state.currentQuestionIndex]
    if (!currentQ || state.submitted) return
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [currentQ.questionNumber]: optionKey },
    }))
  }

  const goToQuestion = (index: number) => {
    if (index < 0 || index >= allQuestions.length) return
    setState((prev) => ({ ...prev, currentQuestionIndex: index }))
  }

  const toggleFlag = () => {
    const currentQ = allQuestions[state.currentQuestionIndex]
    if (!currentQ) return
    setState((prev) => {
      const nextFlagged = prev.flagged.includes(currentQ.questionNumber)
        ? prev.flagged.filter((q) => q !== currentQ.questionNumber)
        : [...prev.flagged, currentQ.questionNumber]
      return { ...prev, flagged: nextFlagged }
    })
  }

  const handleSubmit = useCallback(() => {
    setState((prev) => ({ ...prev, submitted: true, showAnswer: true }))
  }, [])

  useEffect(() => {
    handleSubmitRef.current = handleSubmit
  }, [handleSubmit])

  const handleRetry = () => {
    hasCompletedBackendSubmissionRef.current = false
    attemptIdRef.current = null
    const time =
      typeof examData?.duration_minutes === 'number' && examData.duration_minutes > 0
        ? examData.duration_minutes * 60
        : 120 * 60

    setState({
      mode: 'FULL',
      selectedParts: [1, 2, 3, 4, 5, 6, 7],
      currentQuestionIndex: 0,
      answers: {},
      flagged: [],
      timeRemaining: time,
      started: false,
      submitted: false,
      showAnswer: false,
      timedMode: true,
    })
  }

  const handleChooseAnother = () => {
    navigate('/placement-test')
  }

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
    startExam,
    handleSubmit,
    handleSubmitAttemptAsync,
    handleRetry,
    handleChooseAnother,
    calculateResults,
    evaluatedAnswers,
    isSubmittingAttempt,
  }
}
