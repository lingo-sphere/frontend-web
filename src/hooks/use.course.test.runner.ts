// Quản lý trạng thái bài kiểm tra khóa học, đếm ngược thời gian, chấm điểm và AI giải thích.

import { useState, useMemo, useEffect, useCallback } from 'react'
import type { Chapter } from '@/types/course'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast.store'
import {
  CourseTestQuestion,
  TestAttemptItem,
  WrongQuestionItem,
  AiExplanationsData,
  getCorrectOptionIndex,
} from '@/components/course/test-runner/test.runner.types'

interface UseCourseTestRunnerOptions {
  isOpen: boolean
  courseId: string
  chapter: Chapter | null
  testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
  durationMinutes?: number
  finalTestQuestions?: CourseTestQuestion[]
  finalTestAudioUrl?: string
  speakingPrompt?: string
  speakingFileUrl?: string
  writingPrompt?: string
  writingFileUrl?: string
  category?: string
  skills?: string[]
  highestScore?: number
  previousAttempts?: TestAttemptItem[]
  onComplete?: (score: number, isPassed: boolean, resultData?: unknown) => void
}

export function useCourseTestRunner({
  isOpen,
  courseId,
  chapter,
  testType,
  durationMinutes,
  finalTestQuestions,
  finalTestAudioUrl,
  speakingPrompt,
  speakingFileUrl,
  writingPrompt,
  writingFileUrl,
  category,
  skills,
  highestScore = 0,
  previousAttempts = [],
  onComplete,
}: UseCourseTestRunnerOptions) {
  const hasSpeaking = Boolean(speakingPrompt || chapter?.speaking_prompt)
  const hasWriting = Boolean(writingPrompt || chapter?.writing_prompt)

  const is4Skills = useMemo(() => {
    if (
      category === 'TOEIC_4_SKILLS' ||
      category === 'IELTS_4_SKILLS' ||
      category === '4_SKILLS'
    )
      return true
    if (
      Array.isArray(skills) &&
      (skills.includes('SPEAKING') || skills.includes('WRITING') || skills.length >= 4)
    )
      return true
    if (hasSpeaking || hasWriting) return true
    return false
  }, [category, skills, hasSpeaking, hasWriting])

  const effectiveSpeakingPrompt = useMemo(() => {
    return (
      speakingPrompt ||
      chapter?.speaking_prompt ||
      ''
    )
  }, [speakingPrompt, chapter])

  const effectiveSpeakingFileUrl = useMemo(() => {
    return (
      speakingFileUrl ||
      chapter?.speaking_file_url ||
      chapter?.speaking_prompt_file_url ||
      ''
    )
  }, [speakingFileUrl, chapter])

  const effectiveWritingPrompt = useMemo(() => {
    return (
      writingPrompt ||
      chapter?.writing_prompt ||
      ''
    )
  }, [writingPrompt, chapter])

  const effectiveWritingFileUrl = useMemo(() => {
    return (
      writingFileUrl ||
      chapter?.writing_file_url ||
      chapter?.writing_prompt_file_url ||
      ''
    )
  }, [writingFileUrl, chapter])

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [attemptsList, setAttemptsList] = useState<TestAttemptItem[]>(
    previousAttempts || []
  )
  const [bestScore, setBestScore] = useState<number>(highestScore || 0)
  const [isNewHighScore, setIsNewHighScore] = useState(false)
  const [activeSection, setActiveSection] = useState<'QUIZ' | 'SPEAKING' | 'WRITING'>('QUIZ')
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [scoreResult, setScoreResult] = useState<{
    correctCount: number
    totalQuestions: number
    score: number
    isPassed: boolean
  } | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [progressionNote, setProgressionNote] = useState<string | null>(null)
  const [growthDiff, setGrowthDiff] = useState<{
    scoreDiff: number
    percent: number
  } | null>(null)
  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [showAiDetails, setShowAiDetails] = useState(false)
  const [aiExplanations, setAiExplanations] = useState<AiExplanationsData | null>(null)
  const [wrongQuestionsList, setWrongQuestionsList] = useState<WrongQuestionItem[]>([])
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  useEffect(() => {
    if (previousAttempts) setAttemptsList(previousAttempts)
  }, [previousAttempts])

  useEffect(() => {
    if (highestScore !== undefined) setBestScore(highestScore)
  }, [highestScore])

  useEffect(() => {
    if (!is4Skills && activeSection !== 'QUIZ') setActiveSection('QUIZ')
  }, [is4Skills, activeSection])

  const rawQuestions: CourseTestQuestion[] = useMemo(() => {
    if (
      testType === 'final-test' &&
      Array.isArray(finalTestQuestions) &&
      finalTestQuestions.length > 0
    ) {
      return finalTestQuestions
    }
    if (testType === 'challenge') {
      return (chapter?.challenge_questions ?? []) as unknown as CourseTestQuestion[]
    }
    if (testType === 'post-mini') {
      return (chapter?.post_mini_questions ?? []) as unknown as CourseTestQuestion[]
    }
    if (testType === 'exercise') {
      return (chapter?.test_questions ?? []) as unknown as CourseTestQuestion[]
    }
    return []
  }, [chapter, testType, finalTestQuestions])

  const testAudioUrl = useMemo(() => {
    return (
      finalTestAudioUrl ||
      chapter?.test_audio_url ||
      chapter?.challenge_audio_url ||
      chapter?.audio_url ||
      rawQuestions.find((q) => q.media_url?.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i))
        ?.media_url ||
      ''
    )
  }, [finalTestAudioUrl, chapter, rawQuestions])

  const passingScore =
    testType === 'challenge'
      ? chapter?.challengeTest?.passingScore ||
        chapter?.challenge_passing_score ||
        80
      : 80

  const testTitle =
    testType === 'challenge'
      ? `Bài test thử thách cuối chương - ${chapter?.title || ''}`
      : testType === 'post-mini'
      ? `Bài kiểm tra cuối chương - ${chapter?.title || ''}`
      : testType === 'final-test'
      ? `Bài thi tốt nghiệp khóa học (Exit Test)`
      : `Bài luyện tập trắc nghiệm (${chapter?.title || ''})`

  const effectiveDurationMinutes = useMemo(() => {
    if (typeof durationMinutes === 'number' && durationMinutes > 0) return durationMinutes
    const chDur =
      chapter?.challenge_duration_minutes
    if (typeof chDur === 'number' && chDur > 0) return chDur
    return testType === 'final-test' ? 60 : 15
  }, [durationMinutes, chapter, testType])

  const [timeLeft, setTimeLeft] = useState<number>(effectiveDurationMinutes * 60)
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false)

  useEffect(() => {
    setTimeLeft(effectiveDurationMinutes * 60)
    setHasAutoSubmitted(false)
  }, [effectiveDurationMinutes, isOpen])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0)
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(
        secs
      ).padStart(2, '0')}`
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (isSubmitted) return
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))
  }

  const handleRetry = () => {
    setSelectedAnswers({})
    setIsSubmitted(false)
    setScoreResult(null)
    setAiExplanations(null)
    setWrongQuestionsList([])
    setShowAiDetails(false)
    setTimeLeft(effectiveDurationMinutes * 60)
    setHasAutoSubmitted(false)
  }

  const handleSubmitTest = useCallback(
    async (isTimeout = false) => {
      let correct = 0
      const wrongs: WrongQuestionItem[] = []

      rawQuestions.forEach((q, idx) => {
        const chosen = selectedAnswers[idx]
        const options = q.options ?? []
        const correctIdx = getCorrectOptionIndex(q, options)

        if (chosen !== undefined && chosen === correctIdx) {
          correct++
        } else {
          wrongs.push({
            question_number: idx + 1,
            question_text: q.question_text,
            user_selected_answer:
              chosen !== undefined
                ? options[chosen] ?? String.fromCharCode(65 + chosen)
                : 'Chưa làm',
            correct_answer: options[correctIdx] ?? String.fromCharCode(65 + correctIdx),
            category: chapter?.title ?? 'Kiến thức chung',
          })
        }
      })

      const total = rawQuestions.length
      const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 100
      const isPassed = scorePercent >= passingScore

      setWrongQuestionsList(wrongs)
      setScoreResult({
        correctCount: correct,
        totalQuestions: total,
        score: scorePercent,
        isPassed,
      })
      setIsSubmitted(true)
      setShowSubmitConfirm(false)

      if (isTimeout) toast.warning('Hết thời gian làm bài! Đã tự động nộp bài.')
      else toast.success(`Nộp bài thành công! Điểm: ${scorePercent}%`)

      if (wrongs.length > 0) {
        setIsLoadingAi(true)
        setShowAiDetails(true)
        courseService
          .explainTestMistakes(courseId, {
            test_title: testTitle,
            test_type: testType,
            wrong_questions: wrongs,
          })
          .then((res: any) => setAiExplanations(res?.data || res))
          .catch(() => {})
          .finally(() => setIsLoadingAi(false))
      }

      setIsSaving(true)
      try {
        let saveRes: any = null
        if (testType === 'challenge' && chapter?.id) {
          saveRes = await courseService.submitModuleChallenge(courseId, chapter.id, {
            score: scorePercent,
            correct_count: correct,
            total_questions: total,
            passing_score: passingScore,
            order_index: Number(chapter.order || 1),
          })
        } else if (testType === 'post-mini' && chapter?.id) {
          saveRes = await courseService.submitModulePostMini(courseId, chapter.id, {
            score: scorePercent,
            correct_count: correct,
            total_questions: total,
            order_index: Number(chapter.order || 1),
          })
        } else if (testType === 'final-test') {
          saveRes = await courseService.submitCourseFinalTest(courseId, {
            score: scorePercent,
            correct_count: correct,
            total_questions: total,
          })
        }

        if (saveRes?.progression_comparison?.score_diff !== undefined) {
          setGrowthDiff({
            scoreDiff: saveRes.progression_comparison.score_diff,
            percent: saveRes.progression_comparison.percentage_improvement,
          })
        }
        if (saveRes?.progression_comparison?.comparison_note) {
          setProgressionNote(saveRes.progression_comparison.comparison_note)
        }
        if (saveRes?.is_new_high_score) setIsNewHighScore(true)
        if (saveRes?.highest_score) setBestScore(saveRes.highest_score)
        if (Array.isArray(saveRes?.attempts)) setAttemptsList(saveRes.attempts)
        onComplete?.(scorePercent, isPassed, saveRes)
      } catch {
        onComplete?.(scorePercent, isPassed)
      } finally {
        setIsSaving(false)
      }
    },
    [
      rawQuestions,
      selectedAnswers,
      passingScore,
      courseId,
      chapter,
      testType,
      testTitle,
      onComplete,
    ]
  )

  useEffect(() => {
    if (!isOpen || isSubmitted || timeLeft <= 0) return
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (!hasAutoSubmitted) {
            setHasAutoSubmitted(true)
            handleSubmitTest(true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen, isSubmitted, timeLeft, hasAutoSubmitted, handleSubmitTest])

  return {
    is4Skills,
    effectiveSpeakingPrompt,
    effectiveSpeakingFileUrl,
    effectiveWritingPrompt,
    effectiveWritingFileUrl,
    showHistoryModal,
    setShowHistoryModal,
    attemptsList,
    bestScore,
    isNewHighScore,
    activeSection,
    setActiveSection,
    selectedAnswers,
    isSubmitted,
    scoreResult,
    isSaving,
    progressionNote,
    growthDiff,
    isLoadingAi,
    showAiDetails,
    setShowAiDetails,
    aiExplanations,
    wrongQuestionsList,
    showExitConfirm,
    setShowExitConfirm,
    showSubmitConfirm,
    setShowSubmitConfirm,
    rawQuestions,
    testAudioUrl,
    passingScore,
    testTitle,
    timeLeft,
    formatTime,
    handleSelectOption,
    handleRetry,
    handleSubmitTest,
  }
}
