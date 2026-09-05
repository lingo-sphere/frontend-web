'use client'

/**
 * @file CourseTestRunnerModal.tsx
 * @description Modal thi và đánh giá 4 kỹ năng: Trắc nghiệm nghe hiểu có audio player, Luyện nói thu âm micro tích hợp Whisper STT và Viết luận có bộ đếm từ tự động.
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Trophy,
  Clock,
  CheckCircle2,
  Crown,
  History,
  Send,
  Loader2,
  BookOpen,
  Mic,
  PenTool,
  FileQuestion,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Chapter } from '@/types/course'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast-store'
import {
  CourseTestQuestion,
  TestAttemptItem,
  WrongQuestionItem,
  AiExplanationsData,
  getCorrectOptionIndex,
  TestRunnerAudioPlayer,
  TestRunnerSpeakingSection,
  TestRunnerWritingSection,
  TestRunnerSidebar,
  TestRunnerResultView,
  TestRunnerQuestionItem,
  TestRunnerHistoryModal,
  TestRunnerExitConfirmModal,
  TestRunnerSubmitConfirmModal,
} from './test-runner'

export type { CourseTestQuestion, TestAttemptItem }

interface CourseTestRunnerModalProps {
  isOpen: boolean
  courseId: string
  courseTitle?: string
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
  onClose: () => void
  onComplete?: (score: number, isPassed: boolean, resultData?: unknown) => void
}

export function CourseTestRunnerModal({
  isOpen,
  courseId,
  courseTitle,
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
  onClose,
  onComplete,
}: CourseTestRunnerModalProps) {
  const is4Skills = useMemo(() => {
    if (category === 'TOEIC_4_SKILLS' || category === 'IELTS_4_SKILLS' || category === '4_SKILLS') return true
    if (Array.isArray(skills) && (skills.includes('SPEAKING') || skills.includes('WRITING') || skills.length >= 4)) return true
    if (category === 'TOEIC_2_SKILLS' && Array.isArray(skills) && !skills.includes('SPEAKING') && !skills.includes('WRITING')) {
      return false
    }
    return true
  }, [category, skills])

  const effectiveSpeakingPrompt = useMemo(() => {
    return (
      speakingPrompt ||
      (chapter as any)?.speaking_prompt ||
      'Please introduce yourself and explain why learning English is important for your personal and professional future. Speak clearly for about 30 seconds to 2 minutes.'
    )
  }, [speakingPrompt, chapter])

  const effectiveSpeakingFileUrl = useMemo(() => {
    return speakingFileUrl || (chapter as any)?.speaking_file_url || (chapter as any)?.speaking_prompt_file_url
  }, [speakingFileUrl, chapter])

  const effectiveWritingPrompt = useMemo(() => {
    return (
      writingPrompt ||
      (chapter as any)?.writing_prompt ||
      'Write a short essay (between 80 and 150 words) describing an effective habit or strategy you use to improve your daily English learning. Support your answer with specific examples.'
    )
  }, [writingPrompt, chapter])

  const effectiveWritingFileUrl = useMemo(() => {
    return writingFileUrl || (chapter as any)?.writing_file_url || (chapter as any)?.writing_prompt_file_url
  }, [writingFileUrl, chapter])

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [attemptsList, setAttemptsList] = useState<TestAttemptItem[]>(previousAttempts || [])
  const [bestScore, setBestScore] = useState<number>(highestScore || 0)
  const [isNewHighScore, setIsNewHighScore] = useState(false)

  useEffect(() => {
    if (previousAttempts) {
      setAttemptsList(previousAttempts)
    }
  }, [previousAttempts])

  useEffect(() => {
    if (highestScore !== undefined) {
      setBestScore(highestScore)
    }
  }, [highestScore])

  const [activeSection, setActiveSection] = useState<'QUIZ' | 'SPEAKING' | 'WRITING'>('QUIZ')

  useEffect(() => {
    if (!is4Skills && activeSection !== 'QUIZ') {
      setActiveSection('QUIZ')
    }
  }, [is4Skills, activeSection])

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
  const [growthDiff, setGrowthDiff] = useState<{ scoreDiff: number; percent: number } | null>(null)

  const [isLoadingAi, setIsLoadingAi] = useState(false)
  const [showAiDetails, setShowAiDetails] = useState(false)
  const [aiExplanations, setAiExplanations] = useState<AiExplanationsData | null>(null)
  const [wrongQuestionsList, setWrongQuestionsList] = useState<WrongQuestionItem[]>([])

  const rawQuestions: CourseTestQuestion[] = useMemo(() => {
    if (testType === 'final-test') {
      if (Array.isArray(finalTestQuestions) && finalTestQuestions.length > 0) {
        return finalTestQuestions as CourseTestQuestion[]
      }
    }
    if (testType === 'challenge' || testType === 'post-mini' || testType === 'exercise') {
      const qList =
        (Array.isArray(chapter?.challenge_questions) && chapter.challenge_questions.length > 0 ? chapter.challenge_questions : null) ||
        (Array.isArray(chapter?.test_questions) && chapter.test_questions.length > 0 ? chapter.test_questions : null) ||
        (Array.isArray(chapter?.post_mini_questions) && chapter.post_mini_questions.length > 0 ? chapter.post_mini_questions : null) ||
        []
      return qList as CourseTestQuestion[]
    }
    return []
  }, [chapter, testType, finalTestQuestions])

  const testAudioUrl = useMemo(() => {
    if (testType === 'final-test') {
      if (finalTestAudioUrl) return finalTestAudioUrl
      return (
        chapter?.test_audio_url ||
        chapter?.challenge_audio_url ||
        chapter?.audio_url ||
        rawQuestions.find(
          (q) =>
            q.media_url &&
            (q.media_url.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i) ||
              q.media_url.includes('audio') ||
              q.media_url.includes('quiz-audio'))
        )?.media_url ||
        ''
      )
    }
    return (
      chapter?.test_audio_url ||
      chapter?.challenge_audio_url ||
      chapter?.audio_url ||
      finalTestAudioUrl ||
      rawQuestions.find(
        (q) =>
          q.media_url &&
          (q.media_url.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i) ||
            q.media_url.includes('audio') ||
            q.media_url.includes('quiz-audio'))
      )?.media_url ||
      ''
    )
  }, [testType, finalTestAudioUrl, chapter, rawQuestions])

  const passingScore =
    testType === 'challenge'
      ? chapter?.challengeTest?.passingScore || (chapter as any)?.challenge_passing_score || 80
      : testType === 'final-test'
      ? 70
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
    if (typeof durationMinutes === 'number' && durationMinutes > 0) {
      return durationMinutes
    }
    const chapterDuration =
      (chapter as any)?.challenge_duration_minutes ||
      (chapter as any)?.challengeTest?.durationMinutes ||
      (chapter as any)?.duration_minutes
    if (typeof chapterDuration === 'number' && chapterDuration > 0) {
      return chapterDuration
    }
    if (testType === 'final-test') {
      return 60
    }
    return 15
  }, [durationMinutes, chapter, testType])

  const [timeLeft, setTimeLeft] = useState<number>(effectiveDurationMinutes * 60)
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)

  useEffect(() => {
    setTimeLeft(effectiveDurationMinutes * 60)
    setHasAutoSubmitted(false)
  }, [effectiveDurationMinutes, isOpen])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const scrollToQuestion = (index: number) => {
    const el = document.getElementById(`question-card-${index}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
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
        const options = q.options || q.answers || ['A', 'B', 'C', 'D']
        const correctIdx = getCorrectOptionIndex(q, options)

        if (chosen !== undefined && chosen === correctIdx) {
          correct++
        } else {
          const userSelectedText =
            chosen !== undefined
              ? options[chosen] || String.fromCharCode(65 + chosen)
              : isTimeout
              ? 'Chưa làm (Sai do hết thời gian)'
              : 'Chưa làm (0 điểm)'

          wrongs.push({
            question_number: idx + 1,
            question_text: q.question_text || q.question || `Câu hỏi số ${idx + 1}`,
            user_selected_answer: userSelectedText,
            correct_answer: options[correctIdx] || String.fromCharCode(65 + correctIdx),
            category: chapter?.title || 'Kiến thức chung',
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

      if (isTimeout) {
        toast.warning('Hết thời gian làm bài! Hệ thống đã tự động thu bài và chấm điểm các câu bạn đã làm.')
      } else {
        toast.success(`Nộp bài thành công! Điểm số: ${scorePercent}%`)
      }

      if (wrongs.length > 0) {
        setIsLoadingAi(true)
        setShowAiDetails(true)
        courseService
          .explainTestMistakes(courseId, {
            test_title: chapter?.title || 'Bài kiểm tra',
            test_type: testType,
            wrong_questions: wrongs,
          })
          .then((res) => {
            if (res) {
              setAiExplanations(res)
            }
          })
          .catch((err) => {
            console.error('Lỗi khi tự động giải thích câu sai bằng AI:', err)
          })
          .finally(() => {
            setIsLoadingAi(false)
          })
      }

      if (scorePercent > bestScore) {
        setIsNewHighScore(true)
        setBestScore(scorePercent)
      }

      const optimisticAttempt: TestAttemptItem = {
        attempt_id: `att_${Date.now()}`,
        test_type: testType,
        score: scorePercent,
        correct_count: correct,
        total_questions: total,
        is_passed: isPassed,
        submitted_at: new Date(),
      }
      setAttemptsList((prev) => [optimisticAttempt, ...prev])

      setIsSaving(true)
      let backendResult: any = null
      try {
        if (testType === 'challenge' && chapter?.id) {
          backendResult = await courseService.submitModuleChallenge(courseId, String(chapter.id), {
            score: scorePercent,
            correct_count: correct,
            total_questions: total,
            passing_score: passingScore,
            challenge_attempt_id: `att_ch_${Date.now()}`,
            order_index: chapter?.order || 1,
          })
          if (backendResult?.message) setProgressionNote(backendResult.message)
          if (Array.isArray(backendResult?.attempts)) setAttemptsList(backendResult.attempts)
          if (typeof backendResult?.highest_score === 'number') setBestScore(backendResult.highest_score)
        } else if ((testType === 'post-mini' || testType === 'exercise') && chapter?.id) {
          backendResult = await courseService.submitModulePostMini(courseId, String(chapter.id), {
            score: scorePercent,
            correct_count: correct,
            total_questions: total,
            post_mini_attempt_id: `att_pm_${Date.now()}`,
            order_index: chapter?.order || 1,
          })
          if (backendResult?.progression_comparison) {
            const comp = backendResult.progression_comparison
            setProgressionNote(comp.comparison_note)
            setGrowthDiff({
              scoreDiff: comp.score_diff,
              percent: comp.percentage_improvement,
            })
          }
          if (Array.isArray(backendResult?.attempts)) setAttemptsList(backendResult.attempts)
          if (typeof backendResult?.highest_score === 'number') setBestScore(backendResult.highest_score)
          if (backendResult?.is_new_high_score) setIsNewHighScore(true)
        } else if (testType === 'final-test') {
          backendResult = await courseService.submitCourseFinalTest(courseId, {
            score: scorePercent,
            correct_count: correct,
            total_questions: total,
            final_test_attempt_id: `att_fin_${Date.now()}`,
          })
          if (backendResult?.total_score_growth !== undefined) {
            setGrowthDiff({
              scoreDiff: backendResult.total_score_growth,
              percent: backendResult.total_growth_percentage,
            })
            setProgressionNote(
              backendResult.baseline_score > 0
                ? `Tốt nghiệp khóa học! Tiến bộ tổng thể ${backendResult.total_score_growth >= 0 ? '+' : ''}${backendResult.total_score_growth} điểm (+${backendResult.total_growth_percentage}%) so với Baseline ban đầu.`
                : 'Chúc mừng bạn đã hoàn thành bài thi tốt nghiệp cuối khóa!'
            )
          }
          if (Array.isArray(backendResult?.final_test_attempts)) setAttemptsList(backendResult.final_test_attempts)
          if (typeof backendResult?.highest_score === 'number') setBestScore(backendResult.highest_score)
          if (backendResult?.is_new_high_score) setIsNewHighScore(true)
        }
      } catch (err) {
        console.warn('Could not save test to backend:', err)
      } finally {
        setIsSaving(false)
        onComplete?.(scorePercent, isPassed, backendResult)
      }
    },
    [rawQuestions, selectedAnswers, passingScore, bestScore, testType, chapter, courseId, onComplete]
  )

  // Ticking countdown timer
  useEffect(() => {
    if (!isOpen || isSubmitted || hasAutoSubmitted) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isOpen, isSubmitted, hasAutoSubmitted])

  // Trigger auto submit on timeout
  useEffect(() => {
    if (timeLeft === 0 && !isSubmitted && !hasAutoSubmitted && isOpen && rawQuestions.length > 0) {
      setHasAutoSubmitted(true)
      handleSubmitTest(true)
    }
  }, [timeLeft, isSubmitted, hasAutoSubmitted, isOpen, rawQuestions.length, handleSubmitTest])

  const handleExplainMistakes = async (overrideWrongs?: WrongQuestionItem[]) => {
    const list = overrideWrongs || wrongQuestionsList
    if (list.length === 0) return
    setIsLoadingAi(true)
    setShowAiDetails(true)
    try {
      const res = await courseService.explainTestMistakes(courseId, {
        test_title: chapter?.title || 'Bài kiểm tra',
        test_type: testType,
        wrong_questions: list,
      })
      if (res) setAiExplanations(res)
    } catch (err) {
      console.error('Lỗi khi gọi Gia sư AI giải thích câu sai:', err)
    } finally {
      setIsLoadingAi(false)
    }
  }

  const answeredCount = Object.keys(selectedAnswers).length
  const unansweredCount = Math.max(0, rawQuestions.length - answeredCount)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex flex-col h-screen w-screen bg-slate-50 dark:bg-slate-950 text-text-primary overflow-hidden antialiased animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <header className="h-16 px-4 sm:px-6 bg-surface/95 backdrop-blur-md border-b border-border flex items-center justify-between shrink-0 z-30 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isSubmitted) {
                onClose()
              } else {
                setShowExitConfirm(true)
              }
            }}
            className="rounded-xl hover:bg-surface-subtle text-text-secondary hover:text-text-primary text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Rời bài thi</span>
          </Button>

          <div className="h-6 w-px bg-border hidden sm:block" />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                {testType === 'final-test' ? <Trophy size={14} /> : <Sparkles size={14} />}
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-text-primary truncate">
                {testTitle}
              </h1>
            </div>
            <p className="text-[11px] text-text-secondary truncate">
              {chapter ? `${chapter.title} • ` : courseTitle ? `${courseTitle} • ` : ''}
              Điểm đạt: <span className="font-bold text-primary">{passingScore}%</span>
              {' • '}Thời lượng: <span className="font-bold text-text-primary">{effectiveDurationMinutes} phút</span>
            </p>
          </div>
        </div>

        {/* Center: Live Countdown Timer */}
        <div className="flex items-center gap-2">
          {!isSubmitted ? (
            <div
              className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-1.5 rounded-2xl border transition-all shadow-xs ${
                timeLeft <= 180
                  ? 'bg-rose-500/15 border-rose-500/50 text-rose-600 dark:text-rose-400 animate-pulse ring-2 ring-rose-500/20'
                  : timeLeft <= 300
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                  : 'bg-primary/10 border-primary/25 text-primary'
              }`}
            >
              <Clock
                size={16}
                className={timeLeft <= 180 ? 'text-rose-600 dark:text-rose-400 animate-bounce' : 'text-primary'}
              />
              <div className="flex flex-col items-center">
                <span className="font-mono text-base sm:text-lg font-black tracking-wider leading-tight">
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[9px] font-bold tracking-tight uppercase opacity-80 leading-none">
                  {timeLeft <= 180 ? 'Sắp hết giờ!' : 'Thời gian còn lại'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold shadow-xs">
              <CheckCircle2 size={16} />
              <span>Đã hoàn thành bài thi</span>
            </div>
          )}
        </div>

        {/* Right: Record, History, and Submit button */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-700 dark:text-amber-300 text-xs font-black shadow-2xs">
            <Crown size={14} className="text-amber-500 shrink-0" />
            <span>Kỷ lục: {bestScore > 0 ? `${bestScore}%` : '--'}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border hover:border-primary/40 text-text-secondary hover:text-text-primary text-xs font-bold transition-all shadow-2xs cursor-pointer"
            title="Xem lại lịch sử các lần làm bài"
          >
            <History size={14} className="text-primary shrink-0" />
            <span className="hidden sm:inline">Lịch sử</span>
            <span className="px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px] font-black">
              {attemptsList.length}
            </span>
          </button>

          {!isSubmitted ? (
            <Button
              type="button"
              onClick={() => setShowSubmitConfirm(true)}
              disabled={isSaving}
              className="rounded-xl bg-primary text-white hover:bg-primary-hover px-4 sm:px-5 py-2 text-xs sm:text-sm font-extrabold shadow-md shadow-primary/25 transition-all cursor-pointer flex items-center gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Đang nộp...</span>
                </>
              ) : (
                <>
                  <Send size={15} />
                  <span>Nộp bài</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-primary text-white hover:bg-primary-hover px-4 sm:px-5 py-2 text-xs sm:text-sm font-extrabold shadow-md shadow-primary/25 cursor-pointer flex items-center gap-1.5"
            >
              <span>Quay lại bài học</span>
              <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </header>

      {/* 4 Skills Navigation Bar */}
      {is4Skills && (
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-border/70 bg-surface-subtle/30 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSection('QUIZ')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'QUIZ'
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <BookOpen size={13} />
            <span>Trắc nghiệm & Nghe hiểu ({rawQuestions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('SPEAKING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'SPEAKING'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <Mic size={13} />
            <span>Luyện Nói (Whisper AI)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('WRITING')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeSection === 'WRITING'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface'
            }`}
          >
            <PenTool size={13} />
            <span>Viết Luận (Writing)</span>
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {activeSection === 'QUIZ' && (
            <>
              {rawQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-subtle text-text-tertiary">
                    <FileQuestion size={32} />
                  </div>
                  <h4 className="text-sm font-bold text-text-primary">Chưa có dữ liệu câu hỏi trắc nghiệm</h4>
                  <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                    Giáo viên chưa cập nhật danh sách câu hỏi cho phần này của khóa học. Bạn có thể làm bài phần Speaking hoặc Writing ở các tab phía trên.
                  </p>
                </div>
              ) : (
                <>
                  {isSubmitted && scoreResult && (
                    <TestRunnerResultView
                      scoreResult={scoreResult}
                      testType={testType}
                      passingScore={passingScore}
                      bestScore={bestScore}
                      isNewHighScore={isNewHighScore}
                      progressionNote={progressionNote}
                      growthDiff={growthDiff}
                      wrongQuestionsList={wrongQuestionsList}
                      isLoadingAi={isLoadingAi}
                      showAiDetails={showAiDetails}
                      aiExplanations={aiExplanations}
                      attemptsCount={attemptsList.length}
                      onShowHistory={() => setShowHistoryModal(true)}
                      onRetry={handleRetry}
                      onExplainMistakes={handleExplainMistakes}
                      onToggleAiDetails={() => setShowAiDetails(!showAiDetails)}
                    />
                  )}

                  <TestRunnerAudioPlayer audioUrl={testAudioUrl} />

                  {rawQuestions.map((q, qIdx) => (
                    <TestRunnerQuestionItem
                      key={q.id || `q-${qIdx}`}
                      question={q}
                      index={qIdx}
                      chosenIdx={selectedAnswers[qIdx]}
                      isSubmitted={isSubmitted}
                      testAudioUrl={testAudioUrl}
                      chapterTitle={chapter?.title}
                      matchingAiExp={aiExplanations?.explanations?.find((e) => e.question_number === qIdx + 1)}
                      isLoadingAi={isLoadingAi}
                      onSelectOption={handleSelectOption}
                    />
                  ))}
                </>
              )}
            </>
          )}

          {activeSection === 'SPEAKING' && (
            <TestRunnerSpeakingSection
              courseId={courseId}
              moduleId={chapter?.id ? String(chapter.id) : undefined}
              testType={testType}
              prompt={effectiveSpeakingPrompt}
              fileUrl={effectiveSpeakingFileUrl}
            />
          )}

          {activeSection === 'WRITING' && (
            <TestRunnerWritingSection
              courseId={courseId}
              moduleId={chapter?.id ? String(chapter.id) : undefined}
              testType={testType}
              prompt={effectiveWritingPrompt}
              fileUrl={effectiveWritingFileUrl}
            />
          )}
        </div>

        {/* Right Palette Sidebar */}
        {activeSection === 'QUIZ' && rawQuestions.length > 0 && (
          <TestRunnerSidebar
            questions={rawQuestions}
            selectedAnswers={selectedAnswers}
            isSubmitted={isSubmitted}
            isSaving={isSaving}
            correctCount={scoreResult?.correctCount}
            wrongCount={wrongQuestionsList.length}
            onQuestionClick={scrollToQuestion}
            onSubmitClick={() => setShowSubmitConfirm(true)}
            onRetryClick={handleRetry}
          />
        )}
      </div>

      {/* Confirmation & History Modals */}
      <TestRunnerExitConfirmModal
        isOpen={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirmExit={() => {
          setShowExitConfirm(false)
          onClose()
        }}
      />

      <TestRunnerSubmitConfirmModal
        isOpen={showSubmitConfirm}
        totalQuestions={rawQuestions.length}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        timeLeftFormatted={formatTime(timeLeft)}
        isSaving={isSaving}
        onCancel={() => setShowSubmitConfirm(false)}
        onConfirmSubmit={() => handleSubmitTest(false)}
      />

      <TestRunnerHistoryModal
        isOpen={showHistoryModal}
        testTitle={testTitle}
        attemptsList={attemptsList}
        bestScore={bestScore}
        passingScore={passingScore}
        totalQuestionsCount={rawQuestions.length}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  )
}
