/**
 * @file page.tsx
 * @description Thành phần Page phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file page.tsx
 * @description Trang làm bài thi TOEIC trực tuyến (TOEIC Exam Workspace)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from '@/lib/navigation'
import { courseService } from '@/services/course.service'
import { examService, type BackendToeicExam } from '@/services/exam.service'
import { userService } from '@/services/user.service'
import { useAuthStore } from '@/store/auth.store'
import type { Course } from '@/types/api.types'
import type { ToeicQuestion } from '@/types/toeic'
import { ToeicModeSelector, type PracticeMode } from '@/components/toeic/toeic.mode.selector'
import { ToeicExamResult, type ExamResultMetrics } from '@/components/toeic/toeic.exam.result'
import { ToeicQuestionCard } from '@/components/toeic/toeic.question.card'
import { ToeicQuestionNav } from '@/components/toeic/toeic.question.nav'
import { ToeicExamHeader } from '@/components/toeic/toeic.exam.header'
import { PART_TIMINGS, PART_TIPS } from '@/components/toeic/toeic.constants'
import { Analytics } from '@/lib/posthog'
import { toast } from '@/store/toast.store'

interface ExamState {
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

export default function ToeicExamAppPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { examId } = useParams<{ examId?: string }>()
  const isVietnamese = i18n.language === 'vi'

  const [examData, setExamData] = useState<BackendToeicExam | null>(null)
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
    if (!examId) return
    const isPlacement2Skills = examId.includes('placement_2skills')
    const isPlacement4Skills = examId.includes('placement_4skills')
    if (isPlacement2Skills || isPlacement4Skills) {
      setExamData({
        _id: examId,
        title: isPlacement4Skills
          ? 'Bài Test Năng Lực Đầu Vào Toàn Hệ Thống (TOEIC 4 Kỹ Năng)'
          : 'Bài Test Năng Lực Đầu Vào Toàn Hệ Thống (TOEIC 2 Kỹ Năng LR)',
        slug: examId,
        description: isPlacement4Skills
          ? 'Đánh giá toàn diện 4 kỹ năng Listening, Reading, Speaking & Writing chuẩn quốc tế'
          : 'Đánh giá năng lực trình độ Listening & Reading từ 10 - 990 điểm chuẩn cấu trúc ETS mới nhất',
        exam_type: 'DIAGNOSTIC_TEST',
        duration_minutes: isPlacement4Skills ? 90 : 60,
        total_questions: isPlacement4Skills ? 120 : 100,
        is_published: true,
        is_system_placement: true,
        skills_enabled: isPlacement4Skills ? 'ALL' : 'LR',
      })
    }

    examService
      .getExamById(examId)
      .then((data) => {
        if (data) setExamData(data)
      })
      .catch((err) => {
        console.warn('Exam not yet in backend DB, using dynamic test generator:', err?.message || err)
      })
  }, [examId])

  const generateQuestionsForParts = useCallback((parts: number[]): ToeicQuestion[] => {
    if (!examData || !examData.parts) {
      const qs: ToeicQuestion[] = []
      let qIndex = 1
      parts.forEach((partNum) => {
        const count = PART_TIMINGS[partNum]?.questions || 10
        for (let i = 0; i < count; i++) {
          qs.push({
            id: `p${partNum}-q${qIndex}`,
            examId: examId || 'toeic-test',
            partId: `p${partNum}`,
            partNumber: partNum,
            questionNumber: qIndex,
            questionType: 'MULTIPLE_CHOICE',
            questionTextEn: `Question ${qIndex}: Select the best answer.`,
            options: [
              { key: 'A', textEn: 'Option A' },
              { key: 'B', textEn: 'Option B' },
              { key: 'C', textEn: 'Option C' },
              { key: 'D', textEn: 'Option D' },
            ],
            correctOption: 'A',
            difficultyLevel: 'MEDIUM',
            skillType: partNum <= 4 ? 'LISTENING' : 'READING',
            hasPassage: partNum >= 6,
            status: 'PUBLISHED',
          })
          qIndex++
        }
      })
      return qs
    }

    const questions: ToeicQuestion[] = []
    examData.parts.forEach((p) => {
      if (parts.includes(p.part_number)) {
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
  }, [examData, examId])

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

    const skillsType = examData?.skills_enabled === 'ALL' || (examData as any)?.placement_type === '4SKILLS' ? '4SKILLS' : '2SKILLS'

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

  if (showModeSelector) {
    return (
      <ToeicModeSelector
        title={examData?.title || 'ETS TOEIC Practice Test'}
        description={examData?.description || 'Official ETS format with 7 Parts'}
        onSelectMode={handleSelectMode}
        onBack={() => navigate('/toeic')}
      />
    )
  }

  if (state.submitted) {
    const results = calculateResults()
    return (
      <ToeicExamResult
        results={results}
        recommendedCourses={recommendedCourses}
        recommendedRoadmap={recommendedRoadmap}
        targetBand={targetBand}
        levelLabel={levelLabel}
        isLoadingRecommendations={isLoadingRecommendations}
        onRetry={() => {
          setState((prev) => ({
            ...prev,
            answers: {},
            flagged: [],
            submitted: false,
            showAnswer: false,
            currentQuestionIndex: 0,
          }))
        }}
        onChooseAnother={() => {
          setShowModeSelector(true)
          setAllQuestions([])
        }}
      />
    )
  }

  const currentQuestion = allQuestions[state.currentQuestionIndex]
  const currentPart = currentQuestion?.partNumber || 1

  return (
    <div className="min-h-screen bg-surface-secondary">
      <ToeicExamHeader
        title={examData?.title || 'TOEIC Exam'}
        currentQuestionIndex={state.currentQuestionIndex}
        totalQuestions={allQuestions.length}
        timedMode={state.timedMode}
        timeRemaining={state.timeRemaining}
        isVietnamese={isVietnamese}
        onBackToModeSelect={() => setShowModeSelector(true)}
        onSubmit={handleSubmit}
      />

      <div className="w-full grid gap-6 p-4 sm:p-6 lg:p-8 lg:grid-cols-[1fr_320px]">
        {currentQuestion && (
          <ToeicQuestionCard
            question={currentQuestion}
            currentPart={currentPart}
            partName={`Part ${currentPart}`}
            partTip={PART_TIPS[currentPart]}
            selectedOption={state.answers[currentQuestion.questionNumber]}
            isFlagged={state.flagged.includes(currentQuestion.questionNumber)}
            showAnswer={state.showAnswer}
            isSubmitted={state.submitted}
            currentIndex={state.currentQuestionIndex}
            totalQuestions={allQuestions.length}
            onSelectAnswer={handleSelectAnswer}
            onToggleFlag={toggleFlag}
            onPrev={() => goToQuestion(state.currentQuestionIndex - 1)}
            onNext={() => goToQuestion(state.currentQuestionIndex + 1)}
          />
        )}

        <ToeicQuestionNav
          questions={allQuestions}
          answers={state.answers}
          flagged={state.flagged}
          currentIndex={state.currentQuestionIndex}
          currentPart={currentPart}
          partTiming={PART_TIMINGS[currentPart]}
          onGoToQuestion={goToQuestion}
        />
      </div>
    </div>
  )
}
