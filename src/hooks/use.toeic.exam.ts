// Hook quản lý trạng thái thi TOEIC, đồng hồ đếm ngược, chấm điểm và điều phối gợi ý lộ trình
'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { courseService } from '@/services/course.service'
import { examService, type BackendToeicExam } from '@/services/exam.service'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import { useNavigate } from '@/lib/navigation'
import type { Course } from '@/types/api.types'
import type { ToeicQuestion } from '@/types/toeic'
import type { ExamResultMetrics } from '@/components/toeic/toeic.exam.result'
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

function parseQuestionsFromExamData(examData: BackendToeicExam, parts: number[]): ToeicQuestion[] {
  if (examData.questions && Array.isArray(examData.questions) && examData.questions.length > 0) {
    const questions: ToeicQuestion[] = []
    let qIndex = 1

    const isSystemPlacement = Boolean(
      examData.is_system_placement ||
      examData.placement_type ||
      Boolean(examData.code && examData.code.includes('placement')) ||
      examData.title?.toLowerCase().includes('đầu vào') ||
      examData.title?.toLowerCase().includes('placement')
    )

    examData.questions.forEach((rawQ, idx) => {
      const q = rawQ as Record<string, unknown>
      const rawPart = q.part_number
      const isPartNumeric = typeof rawPart === 'number' || (typeof rawPart === 'string' && /^\d+$/.test(rawPart))
      const numericPartVal = isPartNumeric ? Number(rawPart) : undefined
      const hasGenuinePart =
        !isSystemPlacement &&
        numericPartVal !== undefined &&
        numericPartVal >= 1 &&
        numericPartVal <= 7

      const rawOptions = Array.isArray(q.options) ? q.options : []
      const areAllOptionsEmpty =
        rawOptions.length === 0 ||
        rawOptions.every((opt: unknown) => {
          if (typeof opt === 'string') return !opt.trim()
          if (typeof opt === 'object' && opt !== null) {
            const o = opt as Record<string, unknown>
            return !String(o.text || o.textEn || '').trim()
          }
          return true
        })

      const qText = String(q.question_text || '')
      const isWritingPrompt = /write\s+an?\s+(email|essay|letter|paragraph)|at\s+least\s+\d+\s+words/i.test(qText)
      const isSpeakingPrompt = /describe\s+a\s+time|speak\s+about|pronounce|recording/i.test(qText)

      const isWriting =
        q.question_type === 'WRITING' ||
        q.skill_type === 'WRITING' ||
        String(rawPart).toLowerCase().includes('writ') ||
        (areAllOptionsEmpty && isWritingPrompt)

      const isSpeaking =
        !isWriting &&
        (q.question_type === 'SPEAKING' ||
          q.skill_type === 'SPEAKING' ||
          String(rawPart).toLowerCase().includes('speak') ||
          (areAllOptionsEmpty && isSpeakingPrompt))

      const shouldInclude =
        parts.length === 0 ||
        parts.length >= 7 ||
        (isWriting && parts.includes(8)) ||
        (isSpeaking && parts.includes(7)) ||
        (!isWriting && !isSpeaking && (!hasGenuinePart || (numericPartVal !== undefined && parts.includes(numericPartVal))))

      if (shouldInclude) {
        const optionKeys = ['A', 'B', 'C', 'D']
        const mappedOptions = isWriting || isSpeaking
          ? []
          : rawOptions
              .map((opt: unknown, optIdx: number) => {
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
              .filter((opt) => Boolean(opt.textEn.trim()))

        const audioUrl = (q.media_url || q.audio_url || examData.audio_full_url || examData.audio_url) as string | undefined
        const imageUrl = (q.image_url || '') as string

        const finalSkillType: 'LISTENING' | 'READING' | 'SPEAKING' | 'WRITING' = isWriting
          ? 'WRITING'
          : isSpeaking
            ? 'SPEAKING'
            : q.skill_type === 'LISTENING' || (!isWriting && !isSpeaking && Boolean(audioUrl)) || (hasGenuinePart && numericPartVal !== undefined && numericPartVal <= 4)
              ? 'LISTENING'
              : 'READING'

        const finalQuestionType = isWriting
          ? 'WRITING'
          : isSpeaking
            ? 'SPEAKING'
            : 'MULTIPLE_CHOICE'

        questions.push({
          id: String(q.id || `q-${idx + 1}`),
          examId: examData._id,
          partId: hasGenuinePart && numericPartVal ? `part-${numericPartVal}` : `skill-${finalSkillType.toLowerCase()}`,
          partNumber: isWriting ? 'writing' : isSpeaking ? 'speaking' : hasGenuinePart && numericPartVal ? numericPartVal : undefined,
          questionNumber: Number(q.question_number) || qIndex,
          questionType: finalQuestionType,
          questionTextEn: qText || `Question ${qIndex}`,
          options: mappedOptions,
          correctOption: String(q.correct_answer || (mappedOptions[0]?.key || 'A')).trim().toUpperCase(),
          explanationEn: typeof q.explanation === 'string' ? q.explanation : undefined,
          imageMediaId: imageUrl || undefined,
          audioMediaId: audioUrl || undefined,
          hasImage: Boolean(imageUrl),
          hasAudio: Boolean(audioUrl),
          difficultyLevel: (q.difficulty_level as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM',
          skillType: finalSkillType,
          hasPassage: !isWriting && !isSpeaking && hasGenuinePart && numericPartVal !== undefined && numericPartVal >= 6,
          status: 'PUBLISHED',
          minWords: isWriting ? (Number(q.min_words) || 100) : undefined,
          prepTimeSeconds: isSpeaking ? (Number(q.prep_time_seconds) || 45) : undefined,
          responseTimeSeconds: isSpeaking ? (Number(q.response_time_seconds) || 60) : undefined,
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
  const [recommendedRoadmap, setRecommendedRoadmap] = useState<any | null>(null)
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
    let correct = 0
    let listeningCorrect = 0
    let listeningTotal = 0
    let readingCorrect = 0
    let readingTotal = 0
    let speakingTotal = 0
    let speakingCompleted = 0
    let speakingScoreSum = 0
    let writingTotal = 0
    let writingCompleted = 0
    let writingScoreSum = 0

    const partStats: Record<string, { correct: number; total: number }> = {}

    allQuestions.forEach((q) => {
      const isWriting =
        q.questionType === 'WRITING' ||
        q.skillType === 'WRITING' ||
        String(q.partNumber).toLowerCase().includes('writ')
      const isSpeaking =
        !isWriting &&
        (q.questionType === 'SPEAKING' ||
          q.skillType === 'SPEAKING' ||
          String(q.partNumber).toLowerCase().includes('speak'))

      const hasGenuinePart =
        typeof q.partNumber === 'number' &&
        q.partNumber >= 1 &&
        q.partNumber <= 7

      const partKey: string = isWriting
        ? 'writing'
        : isSpeaking
          ? 'speaking'
          : hasGenuinePart
            ? String(q.partNumber)
            : q.skillType === 'LISTENING'
              ? 'listening'
              : 'reading'

      if (!partStats[partKey]) {
        partStats[partKey] = { correct: 0, total: 0 }
      }
      partStats[partKey].total++

      if (isWriting) {
        writingTotal++
        const studentText = (state.answers[q.questionNumber] || '').trim()
        const wordCount = studentText.split(/\s+/).filter(Boolean).length
        const minWords = q.minWords || 60
        if (wordCount > 0) {
          writingCompleted++
          correct++
          partStats[partKey].correct++
          const completionRatio = Math.min(1, wordCount / minWords)
          const qScore = Math.round(completionRatio * 200)
          writingScoreSum += qScore
        }
      } else if (isSpeaking) {
        speakingTotal++
        const studentResponse = (state.answers[q.questionNumber] || '').trim()
        if (studentResponse.length > 0) {
          speakingCompleted++
          correct++
          partStats[partKey].correct++
          const wordCount = studentResponse.split(/\s+/).filter(Boolean).length
          const completionRatio =
            studentResponse.startsWith('data:audio') || studentResponse.startsWith('http')
              ? 0.85
              : Math.min(1, Math.max(0.3, wordCount / 30))
          const qScore = Math.round(completionRatio * 200)
          speakingScoreSum += qScore
        }
      } else {
        if (q.skillType === 'LISTENING') {
          listeningTotal++
        } else if (q.skillType === 'READING') {
          readingTotal++
        }

        const isCorrect = state.answers[q.questionNumber] === q.correctOption
        if (isCorrect) {
          correct++
          partStats[partKey].correct++
          if (q.skillType === 'LISTENING') {
            listeningCorrect++
          } else if (q.skillType === 'READING') {
            readingCorrect++
          }
        }
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

    const estimatedSpeaking =
      speakingTotal > 0 ? Math.min(200, Math.round(speakingScoreSum / speakingTotal)) : undefined

    const estimatedWriting =
      writingTotal > 0 ? Math.min(200, Math.round(writingScoreSum / writingTotal)) : undefined

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
      speakingTotal,
      speakingCompleted,
      estimatedSpeaking,
      writingTotal,
      writingCompleted,
      estimatedWriting,
    }
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
