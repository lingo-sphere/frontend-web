// Hook quản lý trạng thái thi TOEIC, đồng hồ đếm ngược, chấm điểm và điều phối gợi ý lộ trình.
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { courseService } from '@/features/courses/services/course.service'
import { examService, type BackendToeicExam } from '@/features/toeic/services/exam.service'
import { userService } from '@/features/user/services/user.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { useNavigate } from '@/lib/navigation'
import type { Course, LearningRoadmap } from '@/types/api.types'
import type { ToeicQuestion } from '@/features/toeic/types/toeic'
import type { ExamResultMetrics } from '@/features/toeic/components/toeic.exam.result'
import { parseQuestionsFromExamData } from '@/features/toeic/helpers/toeic.question.parser'
import { calculateToeicExamResults } from '@/features/toeic/helpers/toeic.score.helper'
import { Analytics } from '@/lib/posthog'
import { toast } from '@/store/toast.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'

export type PracticeMode = 'FULL' | 'LISTENING' | 'READING' | 'PART'

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
  const [examData, setExamData] = useState<BackendToeicExam | null>(null)
  const [isLoadingExam, setIsLoadingExam] = useState<boolean>(true)
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

  const [recommendedCourses, setRecommendedCourses] = useState<
    (Course & { recommendation_reason?: string; match_score?: number })[]
  >([])
  const [recommendedRoadmap, setRecommendedRoadmap] = useState<
    (LearningRoadmap & { stages?: unknown[] }) | null
  >(null)
  const [targetBand, setTargetBand] = useState<string>('')
  const [levelLabel, setLevelLabel] = useState<string>('')
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const attemptIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!examId) {
      setIsLoadingExam(false)
      return
    }

    setIsLoadingExam(true)
    examService
      .getExamById(examId)
      .then((data) => {
        if (data) {
          setExamData(data)
          const allParts = [1, 2, 3, 4, 5, 6, 7]
          const questions = parseQuestionsFromExamData(data, allParts)
          setAllQuestions(questions)
          const time =
            typeof data.duration_minutes === 'number' && data.duration_minutes > 0
              ? data.duration_minutes * 60
              : 120 * 60

          setState((prev) => ({
            ...prev,
            mode: 'FULL',
            selectedParts: allParts,
            currentQuestionIndex: 0,
            answers: {},
            flagged: [],
            timeRemaining: time,
            started: true,
            submitted: false,
            showAnswer: false,
            timedMode: true,
          }))

          const isSystemPlacement = Boolean(
            data.is_system_placement ||
            data.placement_type ||
            Boolean(data.code && data.code.includes('placement')) ||
            data.title?.toLowerCase().includes('đầu vào') ||
            data.title?.toLowerCase().includes('placement') ||
            examId?.includes('placement')
          )

          const authUser = useAuthStore.getState().user
          if (authUser) {
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
        }
      })
      .catch((err) => {
        console.warn('Lỗi khi tải dữ liệu đề thi:', err?.message || err)
      })
      .finally(() => {
        setIsLoadingExam(false)
      })
  }, [examId])

  const calculateResults = useCallback((): ExamResultMetrics => {
    return calculateToeicExamResults(allQuestions, state.answers)
  }, [allQuestions, state.answers])

  useEffect(() => {
    if (!state.submitted) return

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
      storage.set(STORAGE_KEYS.PLACEMENT_SCORE, placementData)
      userService.updateProfile(placementData).catch(() => null)
      const { user, setUser } = useAuthStore.getState()
      if (user) {
        setUser({ ...user, ...placementData })
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

    const submitAttemptToBackend = async () => {
      try {
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
          await examService.submitExamAttempt(currentAttemptId, formattedAnswers, timeSpent)
        }
      } catch (err) {
        console.warn('Lỗi khi nộp bài lên hệ thống:', err)
      }
    }
    submitAttemptToBackend()

    setIsLoadingRecommendations(true)

    const weakSkills: string[] = []
    if (res.listeningTotal > 0 && res.listeningCorrect / res.listeningTotal < 0.6) weakSkills.push('LISTENING')
    if (res.readingTotal > 0 && res.readingCorrect / res.readingTotal < 0.6) weakSkills.push('READING')

    const skillsType =
      examData?.skills_enabled === 'ALL' || examData?.placement_type === '4SKILLS' ? '4SKILLS' : '2SKILLS'

    Promise.allSettled([
      courseService.getRecommendedCourses({
        total_score: res.estimatedTotal,
        listening_score: res.estimatedListening,
        reading_score: res.estimatedReading,
        weak_skills: weakSkills,
      }),
      courseService.getRecommendedRoadmap({
        total_score: res.estimatedTotal,
        listening_score: res.estimatedListening,
        reading_score: res.estimatedReading,
        skills_type: skillsType,
      }),
    ])
      .then(([coursesRes, roadmapRes]) => {
        if (coursesRes.status === 'fulfilled' && coursesRes.value?.recommendations) {
          setRecommendedCourses(coursesRes.value.recommendations)
          setTargetBand(coursesRes.value.target_band || '')
          setLevelLabel(coursesRes.value.level_label || '')
        }

        if (roadmapRes.status === 'fulfilled' && roadmapRes.value) {
          setRecommendedRoadmap(roadmapRes.value.recommended_roadmap)
        }
      })
      .catch((err) => {
        console.warn('Cannot fetch recommendations:', err)
      })
      .finally(() => {
        setIsLoadingRecommendations(false)
      })
  }, [state.submitted, calculateResults, examId, examData, state.timedMode])

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
    setState((prev) => ({
      ...prev,
      flagged: prev.flagged.includes(currentQ.questionNumber)
        ? prev.flagged.filter((q) => q !== currentQ.questionNumber)
        : [...prev.flagged, currentQ.questionNumber],
    }))
  }

  const handleSubmit = () => {
    setState((prev) => ({ ...prev, submitted: true, showAnswer: true }))
  }

  const handleRetry = () => {
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
    navigate('/roadmap')
  }

  return {
    examData,
    isLoadingExam,
    allQuestions,
    state,
    recommendedCourses,
    recommendedRoadmap,
    targetBand,
    levelLabel,
    isLoadingRecommendations,
    handleSelectAnswer,
    goToQuestion,
    toggleFlag,
    handleSubmit,
    handleRetry,
    handleChooseAnother,
    calculateResults,
  }
}
