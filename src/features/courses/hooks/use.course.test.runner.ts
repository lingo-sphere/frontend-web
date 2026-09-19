/// Quản lý trạng thái bài kiểm tra khóa học, đếm ngược thời gian, chấm điểm và AI giải thích.

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import type { Chapter } from '@/features/courses/types/course'
import { courseService } from '@/features/courses/services/course.service'
import { mistakeService } from '@/features/practice/services/mistake.service'
import { toast } from '@/store/toast.store'
import {
  CourseTestQuestion,
  GradedQuestionItem,
  TestAttemptItem,
  WrongQuestionItem,
  AiExplanationsData,
  getCorrectOptionIndex,
} from '@/features/courses/types/test.runner.types'

interface CourseTestDraft {
  startedAt: number
  totalDurationSeconds: number
  selectedAnswers: Record<number, number>
}

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
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

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
  const [revealedQuestions, setRevealedQuestions] = useState<CourseTestQuestion[] | null>(null)
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
    if (testType === 'final-test') {
      return (
        finalTestAudioUrl ||
        rawQuestions.find((q) => q.media_url?.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i))
          ?.media_url ||
        ''
      )
    }
    return (
      chapter?.challenge_audio_url ||
      chapter?.test_audio_url ||
      chapter?.audio_url ||
      rawQuestions.find((q) => q.media_url?.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i))
        ?.media_url ||
      ''
    )
  }, [testType, finalTestAudioUrl, chapter, rawQuestions])

  const passingScore =
    testType === 'challenge'
      ? chapter?.challengeTest?.passingScore ||
        chapter?.challenge_passing_score ||
        80
      : 80

  const testTitle =
    testType === 'challenge'
      ? (isVietnamese ? `Bài test thử thách cuối chương - ${chapter?.title || ''}` : `Chapter Challenge Test - ${chapter?.title || ''}`)
      : testType === 'post-mini'
      ? (isVietnamese ? `Bài kiểm tra cuối chương - ${chapter?.title || ''}` : `Chapter End Test - ${chapter?.title || ''}`)
      : testType === 'final-test'
      ? (isVietnamese ? 'Bài thi tốt nghiệp khóa học (Exit Test)' : 'Course Final Graduation Test (Exit Test)')
      : (isVietnamese ? `Bài luyện tập trắc nghiệm (${chapter?.title || ''})` : `Multiple Choice Practice (${chapter?.title || ''})`)

  const effectiveDurationMinutes = useMemo(() => {
    if (typeof durationMinutes === 'number' && durationMinutes > 0) return durationMinutes
    const chDur =
      chapter?.challenge_duration_minutes
    if (typeof chDur === 'number' && chDur > 0) return chDur
    return testType === 'final-test' ? 60 : 15
  }, [durationMinutes, chapter, testType])

  const storageKey = useMemo(() => {
    return `lingo_course_test_draft_${courseId}_${testType}_${chapter?.id || 'final'}`
  }, [courseId, testType, chapter?.id])

  const hasRestoredDraftRef = useRef(false)
  const handleSubmitTestRef = useRef<(isTimeout?: boolean) => Promise<void>>(async () => {})
  const sessionIdRef = useRef<string | null>(null)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [timeLeft, setTimeLeft] = useState<number>(effectiveDurationMinutes * 60)
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false)

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
    setSelectedAnswers((prev) => {
      const next = { ...prev, [qIdx]: optIdx }
      if (typeof window !== 'undefined') {
        try {
          const totalSecs = effectiveDurationMinutes * 60
          let startedAt = Date.now()
          const existing = localStorage.getItem(storageKey)
          if (existing) {
            const parsed = JSON.parse(existing)
            if (parsed && typeof parsed.startedAt === 'number') {
              startedAt = parsed.startedAt
            }
          }
          const draft: CourseTestDraft = {
            startedAt,
            totalDurationSeconds: totalSecs,
            selectedAnswers: next,
          }
          localStorage.setItem(storageKey, JSON.stringify(draft))
        } catch {}
      }

      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = setTimeout(() => {
        const currentSessionId = sessionIdRef.current
        if (currentSessionId) {
          const answersToSync = Object.entries(next).map(([idxStr, oIdx]) => {
            const numIdx = Number(idxStr)
            const q = rawQuestions[numIdx]
            return {
              question_index: numIdx,
              question_id: q?._id || q?.id,
              selected_index: oIdx,
              selected_option: q?.options?.[oIdx] ?? '',
            }
          })
          courseService.syncCourseTestAnswers(currentSessionId, answersToSync).catch(() => {})
        }
      }, 1500)

      return next
    })
  }

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey)
        const newDraft: CourseTestDraft = {
          startedAt: Date.now(),
          totalDurationSeconds: effectiveDurationMinutes * 60,
          selectedAnswers: {},
        }
        localStorage.setItem(storageKey, JSON.stringify(newDraft))
      } catch {}
    }
    sessionIdRef.current = null
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    setSelectedAnswers({})
    setIsSubmitted(false)
    setScoreResult(null)
    setAiExplanations(null)
    setWrongQuestionsList([])
    setRevealedQuestions(null)
    setShowAiDetails(false)
    setTimeLeft(effectiveDurationMinutes * 60)
    setHasAutoSubmitted(false)
  }

  const handleSubmitTest = useCallback(
    async (isTimeout = false) => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(storageKey)
        } catch {}
      }
      const answersPayload = rawQuestions.map((q, idx) => {
        const chosen = selectedAnswers[idx]
        const options = q.options ?? []
        return {
          question_index: idx,
          question_id: q._id || q.id || String(idx),
          selected_index: chosen !== undefined ? chosen : -1,
          selected_option: chosen !== undefined && options[chosen] !== undefined ? options[chosen] : '',
        }
      })

      let fallbackCorrect = 0
      const fallbackWrongs: WrongQuestionItem[] = []
      rawQuestions.forEach((q, idx) => {
        const chosen = selectedAnswers[idx]
        const options = q.options ?? []
        const correctIdx = getCorrectOptionIndex(q, options)
        if (chosen !== undefined && chosen === correctIdx) {
          fallbackCorrect++
        } else {
          fallbackWrongs.push({
            question_number: idx + 1,
            question_text: q.question_text,
            user_selected_answer:
              chosen !== undefined
                ? options[chosen] ?? String.fromCharCode(65 + chosen)
                : (isVietnamese ? 'Chưa làm' : 'Unanswered'),
            correct_answer: typeof correctIdx === 'number' && correctIdx >= 0 && options[correctIdx] ? options[correctIdx] : (isVietnamese ? 'Chưa cập nhật' : 'Not updated'),
            category: chapter?.title ?? (isVietnamese ? 'Kiến thức chung' : 'General Knowledge'),
          })
        }
      })
      const fallbackScore = rawQuestions.length > 0 ? Math.round((fallbackCorrect / rawQuestions.length) * 100) : 100

      setIsSaving(true)
      try {
        let finalScore = fallbackScore
        let finalCorrect = fallbackCorrect
        let finalTotal = rawQuestions.length
        let finalPassed = fallbackScore >= passingScore
        let finalWrongs: WrongQuestionItem[] = fallbackWrongs
        let completeRes: unknown = null

        const applyGradedResult = (
          gradedList?: GradedQuestionItem[],
          wrongs?: WrongQuestionItem[]
        ) => {
          if (Array.isArray(gradedList) && gradedList.length > 0) {
            const updated = rawQuestions.map((q, idx) => {
              const graded = gradedList.find(
                (g) => g.question_index === idx || (g.question_id && g.question_id === (q._id || q.id))
              )
              if (graded) {
                return {
                  ...q,
                  correct_index: graded.correct_index,
                  correct_answer: graded.correct_answer,
                  explanation: graded.explanation || q.explanation,
                }
              }
              return q
            })
            setRevealedQuestions(updated)
          } else if (Array.isArray(wrongs)) {
            const updated = rawQuestions.map((q, idx) => {
              const wrongItem = wrongs.find((w) => w.question_number === idx + 1)
              if (wrongItem) {
                let wCorrectIdx = -1
                const opts = q.options ?? []
                const wUpper = String(wrongItem.correct_answer || '').trim().toUpperCase()
                if (wUpper === 'A') wCorrectIdx = 0
                else if (wUpper === 'B') wCorrectIdx = 1
                else if (wUpper === 'C') wCorrectIdx = 2
                else if (wUpper === 'D') wCorrectIdx = 3
                else {
                  wCorrectIdx = opts.findIndex((opt) => opt.toLowerCase() === wrongItem.correct_answer.toLowerCase())
                }
                return {
                  ...q,
                  correct_index: wCorrectIdx,
                  correct_answer: wrongItem.correct_answer,
                  explanation: wrongItem.explanation || q.explanation,
                }
              } else {
                const chosen = selectedAnswers[idx]
                return {
                  ...q,
                  correct_index: chosen !== undefined ? chosen : 0,
                  correct_answer: chosen !== undefined && q.options?.[chosen] ? q.options[chosen] : '',
                }
              }
            })
            setRevealedQuestions(updated)
          }
        }

        if (testType === 'challenge' && chapter?.id) {
          const saveRes = await courseService.submitModuleChallenge(courseId, chapter.id, {
            score: fallbackScore,
            correct_count: fallbackCorrect,
            total_questions: rawQuestions.length,
            passing_score: passingScore,
            order_index: Number(chapter.order || 1),
            answers: answersPayload,
          })
          completeRes = saveRes
          finalScore = saveRes.score
          finalPassed = saveRes.is_passed
          if (typeof saveRes.correct_count === 'number') finalCorrect = saveRes.correct_count
          if (typeof saveRes.total_questions === 'number') finalTotal = saveRes.total_questions
          if (Array.isArray(saveRes.wrong_questions)) finalWrongs = saveRes.wrong_questions
          if (saveRes.highest_score) setBestScore(saveRes.highest_score)
          if (Array.isArray(saveRes.attempts)) setAttemptsList(saveRes.attempts)
          applyGradedResult(saveRes.graded_questions, saveRes.wrong_questions)
        } else if (testType === 'post-mini' && chapter?.id) {
          const saveRes = await courseService.submitModulePostMini(courseId, chapter.id, {
            score: fallbackScore,
            correct_count: fallbackCorrect,
            total_questions: rawQuestions.length,
            order_index: Number(chapter.order || 1),
            answers: answersPayload,
          })
          completeRes = saveRes
          finalScore = saveRes.score
          if (typeof saveRes.is_passed === 'boolean') finalPassed = saveRes.is_passed
          if (typeof saveRes.correct_count === 'number') finalCorrect = saveRes.correct_count
          if (typeof saveRes.total_questions === 'number') finalTotal = saveRes.total_questions
          if (Array.isArray(saveRes.wrong_questions)) finalWrongs = saveRes.wrong_questions
          if (saveRes.progression_comparison) {
            setGrowthDiff({
              scoreDiff: saveRes.progression_comparison.score_diff,
              percent: saveRes.progression_comparison.percentage_improvement,
            })
            setProgressionNote(saveRes.progression_comparison.comparison_note)
          }
          if (saveRes.is_new_high_score) setIsNewHighScore(true)
          if (saveRes.highest_score) setBestScore(saveRes.highest_score)
          if (Array.isArray(saveRes.attempts)) setAttemptsList(saveRes.attempts)
          applyGradedResult(saveRes.graded_questions, saveRes.wrong_questions)
        } else if (testType === 'final-test') {
          const saveRes = await courseService.submitCourseFinalTest(courseId, {
            score: fallbackScore,
            correct_count: fallbackCorrect,
            total_questions: rawQuestions.length,
            answers: answersPayload,
          })
          completeRes = saveRes
          finalScore = saveRes.final_test_score
          if (typeof saveRes.is_passed === 'boolean') finalPassed = saveRes.is_passed
          if (typeof saveRes.correct_count === 'number') finalCorrect = saveRes.correct_count
          if (typeof saveRes.total_questions === 'number') finalTotal = saveRes.total_questions
          if (Array.isArray(saveRes.wrong_questions)) finalWrongs = saveRes.wrong_questions
          if (saveRes.is_new_high_score) setIsNewHighScore(true)
          if (saveRes.highest_score) setBestScore(saveRes.highest_score)
          if (Array.isArray(saveRes.final_test_attempts)) setAttemptsList(saveRes.final_test_attempts)
          applyGradedResult(saveRes.graded_questions, saveRes.wrong_questions)
        }

        setWrongQuestionsList(finalWrongs)
        setScoreResult({
          correctCount: finalCorrect,
          totalQuestions: finalTotal,
          score: finalScore,
          isPassed: finalPassed,
        })
        setIsSubmitted(true)
        setShowSubmitConfirm(false)

        if (isTimeout) toast.warning(isVietnamese ? 'Hết thời gian làm bài! Đã tự động nộp bài.' : 'Time is up! Exam auto-submitted.')
        else toast.success(isVietnamese ? `Nộp bài thành công! Điểm: ${finalScore}%` : `Submitted successfully! Score: ${finalScore}%`)

        if (finalWrongs.length > 0) {
          setIsLoadingAi(true)
          setShowAiDetails(true)
          courseService
            .explainTestMistakes(courseId, {
              test_title: testTitle,
              test_type: testType,
              wrong_questions: finalWrongs,
            })
            .then((res: { data?: AiExplanationsData } | AiExplanationsData) => {
              const data = 'data' in res && res.data ? res.data : (res as AiExplanationsData)
              setAiExplanations(data)

              const explanationMap = new Map<number, { topic?: string; focus?: string; why_wrong?: string }>()
              if (Array.isArray(data?.explanations)) {
                data.explanations.forEach((item) => {
                  explanationMap.set(item.question_number, {
                    topic: item.recommended_topic,
                    focus: item.study_focus,
                    why_wrong: item.why_wrong,
                  })
                })
              }

              const mistakePayloads = finalWrongs.map((w, idx) => {
                const ex = explanationMap.get(w.question_number || idx + 1)
                const qIdx = (w.question_number || idx + 1) - 1
                const rawQ = rawQuestions[qIdx]
                const stableId =
                  rawQ?.id ||
                  rawQ?._id ||
                  `${courseId}_${chapter?.id || testType}_q${qIdx + 1}`
                return {
                  question_id: stableId,
                  question_text: w.question_text,
                  options: rawQ?.options || [],
                  user_answer: w.user_selected_answer,
                  correct_answer: w.correct_answer,
                  explanation: ex?.why_wrong || w.explanation || '',
                  topic_tags: ex?.topic ? [ex.topic] : (w.category ? [w.category] : []),
                  topic_name_vi: ex?.topic || w.category || '',
                  source_context: `${testTitle} (${testType})`,
                  source_type: testType === 'final-test' ? 'COURSE_FINAL_TEST' : 'COURSE_CHAPTER_TEST',
                  source_id: courseId,
                  source_title: testTitle,
                }
              })

              mistakeService.recordBatchMistakes({ mistakes: mistakePayloads }).catch(() => {})
            })
            .catch(() => {
              const fallbackMistakes = finalWrongs.map((w, idx) => {
                const qIdx = (w.question_number || idx + 1) - 1
                const rawQ = rawQuestions[qIdx]
                const stableId =
                  rawQ?.id ||
                  rawQ?._id ||
                  `${courseId}_${chapter?.id || testType}_q${qIdx + 1}`
                return {
                  question_id: stableId,
                  question_text: w.question_text,
                  options: rawQ?.options || [],
                  user_answer: w.user_selected_answer,
                  correct_answer: w.correct_answer,
                  source_context: `${testTitle} (${testType})`,
                  source_type: testType === 'final-test' ? 'COURSE_FINAL_TEST' : 'COURSE_CHAPTER_TEST',
                  source_id: courseId,
                  source_title: testTitle,
                }
              })
              mistakeService.recordBatchMistakes({ mistakes: fallbackMistakes }).catch(() => {})
            })
            .finally(() => setIsLoadingAi(false))
        }

        onComplete?.(finalScore, finalPassed, completeRes)
      } catch {
        setWrongQuestionsList(fallbackWrongs)
        setScoreResult({
          correctCount: fallbackCorrect,
          totalQuestions: rawQuestions.length,
          score: fallbackScore,
          isPassed: fallbackScore >= passingScore,
        })
        setIsSubmitted(true)
        setShowSubmitConfirm(false)
        if (fallbackWrongs.length > 0) {
          const fallbackMistakes = fallbackWrongs.map((w, idx) => {
            const qIdx = (w.question_number || idx + 1) - 1
            const rawQ = rawQuestions[qIdx]
            const stableId =
              rawQ?.id ||
              rawQ?._id ||
              `${courseId}_${chapter?.id || testType}_q${qIdx + 1}`
            return {
              question_id: stableId,
              question_text: w.question_text,
              options: rawQ?.options || [],
              user_answer: w.user_selected_answer,
              correct_answer: w.correct_answer,
              source_context: `${testTitle} (${testType})`,
              source_type: testType === 'final-test' ? 'COURSE_FINAL_TEST' : 'COURSE_CHAPTER_TEST',
              source_id: courseId,
              source_title: testTitle,
            }
          })
          mistakeService.recordBatchMistakes({ mistakes: fallbackMistakes }).catch(() => {})
        }
        onComplete?.(fallbackScore, fallbackScore >= passingScore)
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
    handleSubmitTestRef.current = handleSubmitTest
  }, [handleSubmitTest])

  useEffect(() => {
    if (!isOpen) {
      hasRestoredDraftRef.current = false
      return
    }
    if (hasRestoredDraftRef.current) return
    hasRestoredDraftRef.current = true

    const totalSecs = effectiveDurationMinutes * 60
    let hasLocalDraft = false
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey)
        if (saved) {
          const draft: CourseTestDraft = JSON.parse(saved)
          if (
            draft &&
            typeof draft.startedAt === 'number' &&
            typeof draft.totalDurationSeconds === 'number' &&
            draft.selectedAnswers &&
            typeof draft.selectedAnswers === 'object'
          ) {
            const elapsed = Math.floor((Date.now() - draft.startedAt) / 1000)
            const remaining = Math.max(0, draft.totalDurationSeconds - elapsed)

            setSelectedAnswers(draft.selectedAnswers)
            if (remaining <= 0) {
              setTimeLeft(0)
              setHasAutoSubmitted(true)
              try {
                localStorage.removeItem(storageKey)
              } catch {}
              handleSubmitTestRef.current(true)
              return
            } else {
              hasLocalDraft = true
              setTimeLeft(remaining)
              setHasAutoSubmitted(false)
              toast.info(
                isVietnamese
                  ? 'Đã tự động khôi phục tiến trình bài làm trước đó của bạn.'
                  : 'Restored previous test draft.'
              )
            }
          }
        } else {
          const newDraft: CourseTestDraft = {
            startedAt: Date.now(),
            totalDurationSeconds: totalSecs,
            selectedAnswers: {},
          }
          localStorage.setItem(storageKey, JSON.stringify(newDraft))
        }
      } catch {}
    }

    if (!hasLocalDraft) {
      setTimeLeft(totalSecs)
      setHasAutoSubmitted(false)
    }

    courseService
      .startCourseTestSession(courseId, chapter?.id || 'final', {
        test_type: testType,
        duration_minutes: effectiveDurationMinutes,
        passing_score: passingScore,
        order_index: Number(chapter?.order || 1),
        raw_questions: rawQuestions,
      })
      .then((sessionRes) => {
        if (sessionRes && sessionRes.session_id) {
          sessionIdRef.current = sessionRes.session_id
          if (sessionRes.expires_at) {
            const serverRemaining = Math.max(
              0,
              Math.floor((new Date(sessionRes.expires_at).getTime() - Date.now()) / 1000)
            )
            if (serverRemaining <= 0) {
              setTimeLeft(0)
              handleSubmitTestRef.current(true)
              return
            }
            setTimeLeft(serverRemaining)
          }

          if (
            !hasLocalDraft &&
            Array.isArray(sessionRes.interim_answers) &&
            sessionRes.interim_answers.length > 0
          ) {
            const restoredMap: Record<number, number> = {}
            sessionRes.interim_answers.forEach((ans) => {
              if (
                typeof ans.question_index === 'number' &&
                typeof ans.selected_index === 'number' &&
                ans.selected_index >= 0
              ) {
                restoredMap[ans.question_index] = ans.selected_index
              }
            })
            if (Object.keys(restoredMap).length > 0) {
              setSelectedAnswers(restoredMap)
            }
          }
        }
      })
      .catch(() => {})
  }, [
    effectiveDurationMinutes,
    isOpen,
    storageKey,
    isVietnamese,
    courseId,
    chapter?.id,
    chapter?.order,
    testType,
    passingScore,
    rawQuestions,
  ])

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
    rawQuestions: revealedQuestions || rawQuestions,
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
