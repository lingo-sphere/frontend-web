/**
 * @file use.toeic.exam.ts
 * @description Hook quản lý trạng thái thi TOEIC, đồng hồ đếm ngược, chấm điểm và điều phối gợi ý lộ trình
 */

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { courseService } from '@/services/course.service'
import { examService, type BackendToeicExam } from '@/services/exam.service'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import type { Course } from '@/types/api.types'
import type { ToeicQuestion } from '@/types/toeic'
import type { PracticeMode } from '@/components/toeic/toeic.mode.selector'
import type { ExamResultMetrics } from '@/components/toeic/toeic.exam.result'
import { PART_TIMINGS } from '@/components/toeic/toeic.constants'
import { Analytics } from '@/lib/posthog'
import { toast } from '@/store/toast.store'

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
  const [examData, setExamData] = useState<BackendToeicExam | null>(null)
  const [isLoadingExam, setIsLoadingExam] = useState<boolean>(true)
  const [showModeSelector, setShowModeSelector] = useState<boolean>(true)
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
  const [recommendedRoadmap, setRecommendedRoadmap] = useState<any | null>(null)
  const [targetBand, setTargetBand] = useState<string>('')
  const [levelLabel, setLevelLabel] = useState<string>('')
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState<boolean>(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)

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
        }
      })
      .catch((err) => {
        console.warn('Lỗi khi tải dữ liệu đề thi:', err?.message || err)
      })
      .finally(() => {
        setIsLoadingExam(false)
      })
  }, [examId])

  const generateQuestionsForParts = useCallback((parts: number[]): ToeicQuestion[] => {
    if (!examData) return []

    if (examData.questions && Array.isArray(examData.questions) && examData.questions.length > 0) {
      const questions: ToeicQuestion[] = []
      let qIndex = 1

      examData.questions.forEach((rawQ, idx) => {
        const q = rawQ as Record<string, unknown>
        const partNum = Number(q.part_number) || 1

        if (parts.includes(partNum) || parts.length === 0) {
          const rawOptions = Array.isArray(q.options) ? q.options : []
          const optionKeys = ['A', 'B', 'C', 'D']
          const mappedOptions = rawOptions.map((opt: unknown, optIdx: number) => {
            if (typeof opt === 'string') {
              return { key: optionKeys[optIdx] || String.fromCharCode(65 + optIdx), textEn: opt }
            }
            if (typeof opt === 'object' && opt !== null) {
              const o = opt as Record<string, unknown>
              return {
                key: String(o.key || optionKeys[optIdx] || 'A'),
                textEn: String(o.text || o.textEn || ''),
              }
            }
            return { key: optionKeys[optIdx] || 'A', textEn: String(opt) }
          })

          const audioUrl = (q.media_url || q.audio_url || examData.audio_full_url || examData.audio_url) as string | undefined
          const imageUrl = (q.image_url || '') as string

          questions.push({
            id: String(q.id || `q-${idx + 1}`),
            examId: examData._id,
            partId: `part-${partNum}`,
            partNumber: partNum,
            questionNumber: Number(q.question_number) || qIndex,
            questionType: 'MULTIPLE_CHOICE',
            questionTextEn: String(q.question_text || `Question ${qIndex}`),
            options: mappedOptions,
            correctOption: String(q.correct_answer || 'A').trim().toUpperCase(),
            explanationEn: typeof q.explanation === 'string' ? q.explanation : undefined,
            imageMediaId: imageUrl || undefined,
            audioMediaId: audioUrl || undefined,
            hasImage: Boolean(imageUrl),
            hasAudio: Boolean(audioUrl),
            difficultyLevel: (q.difficulty_level as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM',
            skillType: (q.skill_type as 'LISTENING' | 'READING') || (partNum <= 4 ? 'LISTENING' : 'READING'),
            hasPassage: partNum >= 6,
            status: 'PUBLISHED',
          })
          qIndex++
        }
      })

      if (questions.length > 0) {
        return questions
      }
    }

    if (examData.parts && Array.isArray(examData.parts)) {
      const questions: ToeicQuestion[] = []
      examData.parts.forEach((p) => {
        if (parts.includes(p.part_number) || parts.length === 0) {
          p.questions.forEach((q) => {
            questions.push({
              id: `p${p.part_number}-q${q.question_number}`,
              examId: examData._id,
              partId: `part-${p.part_number}`,
              partNumber: p.part_number,
              questionNumber: q.question_number,
              questionType: 'MULTIPLE_CHOICE',
              questionTextEn: q.question_text || `Question ${q.question_number}`,
              options: q.options.map((opt) => ({ key: opt.key, textEn: opt.text })),
              correctOption: q.correct_answer || 'A',
              explanationEn: q.explanation,
              imageMediaId: q.image_url,
              audioMediaId: q.audio_url,
              hasImage: Boolean(q.image_url),
              hasAudio: Boolean(q.audio_url),
              difficultyLevel: 'MEDIUM',
              skillType: p.part_number <= 4 ? 'LISTENING' : 'READING',
              hasPassage: p.part_number >= 6,
              status: 'PUBLISHED',
            })
          })
        }
      })
      return questions
    }

    return []
  }, [examData])

  const calculateResults = useCallback((): ExamResultMetrics => {
    let correct = 0
    let listeningCorrect = 0
    let listeningTotal = 0
    let readingCorrect = 0
    let readingTotal = 0

    const partStats: Record<number, { correct: number; total: number }> = {}

    allQuestions.forEach((q) => {
      const part = q.partNumber || 1
      if (!partStats[part]) {
        partStats[part] = { correct: 0, total: 0 }
      }
      partStats[part].total++

      const isCorrect = state.answers[q.questionNumber] === q.correctOption
      if (isCorrect) {
        correct++
        partStats[part].correct++
        if (part <= 4) {
          listeningCorrect++
        } else {
          readingCorrect++
        }
      }

      if (part <= 4) {
        listeningTotal++
      } else {
        readingTotal++
      }
    })

    const total = allQuestions.length || 1
    const percentage = Math.round((correct / total) * 100)

    const estimatedListening =
      listeningTotal > 0
        ? Math.min(495, Math.max(5, Math.round(((listeningCorrect / listeningTotal) * 495) / 5) * 5))
        : 0
    const estimatedReading =
      readingTotal > 0
        ? Math.min(495, Math.max(5, Math.round(((readingCorrect / readingTotal) * 495) / 5) * 5))
        : 0
    const estimatedTotal =
      estimatedListening > 0 || estimatedReading > 0
        ? estimatedListening + estimatedReading
        : Math.min(990, Math.max(10, Math.round(((percentage / 100) * 990) / 5) * 5))

    return {
      correct,
      total,
      percentage,
      listeningCorrect,
      listeningTotal,
      readingCorrect,
      readingTotal,
      estimatedListening,
      estimatedReading,
      estimatedTotal,
      partStats,
    }
  }, [allQuestions, state.answers])

  useEffect(() => {
    if (!state.submitted) return

    const res = calculateResults()
    Analytics.examSubmitted({
      examId: (examId as string) || 'toeic-full-test',
      examTitle: examData?.title || 'TOEIC Practice Test',
      totalScore: res.estimatedTotal,
      listeningScore: res.estimatedListening,
      readingScore: res.estimatedReading,
      mode: state.timedMode ? 'timed' : 'practice',
    })

    const is4Skills = Boolean(examId?.includes('4skills') || examData?.skills_enabled === 'ALL')

    const placementData = {
      placement_test_score: res.estimatedTotal,
      placement_listening_score: res.estimatedListening,
      placement_reading_score: res.estimatedReading,
      placement_speaking_score: is4Skills ? 140 : undefined,
      placement_writing_score: is4Skills ? 150 : undefined,
      placement_skills_type: is4Skills ? '4SKILLS' : '2SKILLS',
      target_toeic_score: Math.min(990, res.estimatedTotal + 150),
      current_estimated_score: res.estimatedTotal,
      is_score_manually_edited: false,
      placement_tested_at: new Date().toISOString(),
    }

    try {
      localStorage.setItem('lingo_user_placement_score', JSON.stringify(placementData))
      userService.updateProfile(placementData as any).catch(() => null)
      const { user, setUser } = useAuthStore.getState()
      if (user) {
        setUser({ ...user, ...placementData } as any)
      }
    } catch {}

    setIsLoadingRecommendations(true)

    const weakSkills: string[] = []
    if (res.listeningTotal > 0 && res.listeningCorrect / res.listeningTotal < 0.6) weakSkills.push('LISTENING')
    if (res.readingTotal > 0 && res.readingCorrect / res.readingTotal < 0.6) weakSkills.push('READING')

    const skillsType =
      examData?.skills_enabled === 'ALL' || (examData as any)?.placement_type === '4SKILLS' ? '4SKILLS' : '2SKILLS'

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
          if (
            (!recommendedCourses || recommendedCourses.length === 0) &&
            roadmapRes.value.individual_courses &&
            roadmapRes.value.individual_courses.length > 0
          ) {
            setRecommendedCourses(roadmapRes.value.individual_courses as any)
          }
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

  const handleSelectMode = (mode: PracticeMode, parts: number[], timed: boolean) => {
    const questions = generateQuestionsForParts(parts)
    setAllQuestions(questions)

    let time = 0
    if (timed) {
      if (typeof examData?.duration_minutes === 'number' && examData.duration_minutes > 0) {
        time = examData.duration_minutes * 60
      } else if (mode === 'FULL') time = 120 * 60
      else if (mode === 'LISTENING') time = 45 * 60
      else if (mode === 'READING') time = 75 * 60
      else {
        time = parts.reduce((acc, p) => acc + (PART_TIMINGS[p]?.timeMinutes || 10) * 60, 0)
      }
    }

    setState({
      mode,
      selectedParts: parts,
      currentQuestionIndex: 0,
      answers: {},
      flagged: [],
      timeRemaining: time,
      started: true,
      submitted: false,
      showAnswer: false,
      timedMode: timed,
    })
    setShowModeSelector(false)
  }

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
    setShowModeSelector(true)
    setAllQuestions([])
  }

  return {
    examData,
    isLoadingExam,
    showModeSelector,
    setShowModeSelector,
    allQuestions,
    state,
    recommendedCourses,
    recommendedRoadmap,
    targetBand,
    levelLabel,
    isLoadingRecommendations,
    handleSelectMode,
    handleSelectAnswer,
    goToQuestion,
    toggleFlag,
    handleSubmit,
    handleRetry,
    handleChooseAnother,
    calculateResults,
  }
}
