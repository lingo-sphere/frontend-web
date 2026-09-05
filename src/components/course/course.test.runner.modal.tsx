/**
 * @file course.test.runner.modal.tsx
 * @description Thành phần Course Test Runner Modal phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file course.test.runner.modal.tsx
 * @description Modal thi và đánh giá 4 kỹ năng (Trắc nghiệm, Luyện nói, Viết luận) cho khóa học
 */

import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Send,
  BookOpen,
  Mic,
  PenTool,
  FileQuestion,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Chapter } from '@/types/course'
import { courseService } from '@/services/course.service'
import { toast } from '@/store/toast.store'
import {
  CourseTestQuestion,
  TestAttemptItem,
  WrongQuestionItem,
  AiExplanationsData,
  getCorrectOptionIndex,
} from './test-runner/test.runner.types'
import { TestRunnerAudioPlayer } from './test-runner/test.runner.audio.player'
import { TestRunnerSpeakingSection } from './test-runner/test.runner.speaking.section'
import { TestRunnerWritingSection } from './test-runner/test.runner.writing.section'
import { TestRunnerSidebar } from './test-runner/test.runner.sidebar'
import { TestRunnerResultView } from './test-runner/test.runner.result.view'
import { TestRunnerQuestionItem } from './test-runner/test.runner.question.item'
import { TestRunnerHistoryModal } from './test-runner/test.runner.history.modal'
import {
  TestRunnerExitConfirmModal,
  TestRunnerSubmitConfirmModal,
} from './test-runner/test.runner.confirm.modal'

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
    if (category === 'TOEIC_2_SKILLS' && Array.isArray(skills) && !skills.includes('SPEAKING') && !skills.includes('WRITING')) return false
    return true
  }, [category, skills])

  const effectiveSpeakingPrompt = useMemo(() => {
    return speakingPrompt || (chapter as any)?.speaking_prompt || 'Please introduce yourself and discuss your daily English study plan.'
  }, [speakingPrompt, chapter])

  const effectiveSpeakingFileUrl = useMemo(() => {
    return speakingFileUrl || (chapter as any)?.speaking_file_url || (chapter as any)?.speaking_prompt_file_url
  }, [speakingFileUrl, chapter])

  const effectiveWritingPrompt = useMemo(() => {
    return writingPrompt || (chapter as any)?.writing_prompt || 'Write a short response answering the essay prompt.'
  }, [writingPrompt, chapter])

  const effectiveWritingFileUrl = useMemo(() => {
    return writingFileUrl || (chapter as any)?.writing_file_url || (chapter as any)?.writing_prompt_file_url
  }, [writingFileUrl, chapter])

  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [attemptsList, setAttemptsList] = useState<TestAttemptItem[]>(previousAttempts || [])
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
  const [growthDiff, setGrowthDiff] = useState<{ scoreDiff: number; percent: number } | null>(null)
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
    if (testType === 'final-test' && Array.isArray(finalTestQuestions) && finalTestQuestions.length > 0) {
      return finalTestQuestions as CourseTestQuestion[]
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
    return (
      finalTestAudioUrl ||
      chapter?.test_audio_url ||
      chapter?.challenge_audio_url ||
      chapter?.audio_url ||
      rawQuestions.find((q) => q.media_url?.match(/\.(mp3|wav|ogg|m4a|aac)(\?.*)?$/i))?.media_url ||
      ''
    )
  }, [finalTestAudioUrl, chapter, rawQuestions])

  const passingScore = testType === 'challenge' ? chapter?.challengeTest?.passingScore || (chapter as any)?.challenge_passing_score || 80 : 80
  const testTitle = testType === 'challenge' ? `Bài test thử thách cuối chương - ${chapter?.title || ''}` : testType === 'post-mini' ? `Bài kiểm tra cuối chương - ${chapter?.title || ''}` : testType === 'final-test' ? `Bài thi tốt nghiệp khóa học (Exit Test)` : `Bài luyện tập trắc nghiệm (${chapter?.title || ''})`

  const effectiveDurationMinutes = useMemo(() => {
    if (typeof durationMinutes === 'number' && durationMinutes > 0) return durationMinutes
    const chDur = (chapter as any)?.challenge_duration_minutes || (chapter as any)?.duration_minutes
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
    if (hrs > 0) return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
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
        const options = q.options || q.answers || ['A', 'B', 'C', 'D']
        const correctIdx = getCorrectOptionIndex(q, options)

        if (chosen !== undefined && chosen === correctIdx) {
          correct++
        } else {
          wrongs.push({
            question_number: idx + 1,
            question_text: q.question_text || q.question || `Câu hỏi số ${idx + 1}`,
            user_selected_answer: chosen !== undefined ? options[chosen] || String.fromCharCode(65 + chosen) : 'Chưa làm',
            correct_answer: options[correctIdx] || String.fromCharCode(65 + correctIdx),
            category: chapter?.title || 'Kiến thức chung',
          })
        }
      })

      const total = rawQuestions.length
      const scorePercent = total > 0 ? Math.round((correct / total) * 100) : 100
      const isPassed = scorePercent >= passingScore

      setWrongQuestionsList(wrongs)
      setScoreResult({ correctCount: correct, totalQuestions: total, score: scorePercent, isPassed })
      setIsSubmitted(true)
      setShowSubmitConfirm(false)

      if (isTimeout) toast.warning('Hết thời gian làm bài! Đã tự động nộp bài.')
      else toast.success(`Nộp bài thành công! Điểm: ${scorePercent}%`)

      if (wrongs.length > 0) {
        setIsLoadingAi(true)
        setShowAiDetails(true)
        courseService
          .explainTestMistakes(courseId, { test_title: testTitle, test_type: testType, wrong_questions: wrongs })
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
    [rawQuestions, selectedAnswers, passingScore, courseId, chapter, testType, testTitle, onComplete]
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex flex-col w-full max-w-6xl h-[94vh] bg-surface border border-border rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-surface-subtle/50 shrink-0">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setShowExitConfirm(true)} className="rounded-xl gap-2 font-bold cursor-pointer">
              <ArrowLeft size={16} />
              <span>Rời phòng thi</span>
            </Button>
            <div className="hidden sm:block h-5 w-px bg-border" />
            <div>
              <h2 className="text-base font-extrabold text-text-primary line-clamp-1">{testTitle}</h2>
              <p className="text-xs text-text-secondary">{courseTitle || 'Khóa học LingoSphere'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${timeLeft < 300 ? 'bg-danger/10 border-danger/30 text-danger animate-pulse' : 'bg-surface border-border text-text-primary'}`}>
                <Clock size={15} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            {!isSubmitted && (
              <Button onClick={() => setShowSubmitConfirm(true)} className="bg-primary text-white font-bold rounded-xl gap-2 cursor-pointer shadow-md">
                <Send size={15} />
                <span>Nộp bài</span>
              </Button>
            )}
          </div>
        </div>

        {is4Skills && (
          <div className="flex items-center gap-2 px-6 py-2 border-b border-border/60 bg-surface shrink-0">
            <button type="button" onClick={() => setActiveSection('QUIZ')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === 'QUIZ' ? 'bg-primary text-white shadow-xs' : 'bg-surface-subtle text-text-secondary hover:text-text-primary'}`}>
              <BookOpen size={14} />
              <span>Trắc nghiệm ({rawQuestions.length})</span>
            </button>
            <button type="button" onClick={() => setActiveSection('SPEAKING')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === 'SPEAKING' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'}`}>
              <Mic size={14} />
              <span>Luyện Nói</span>
            </button>
            <button type="button" onClick={() => setActiveSection('WRITING')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeSection === 'WRITING' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'}`}>
              <PenTool size={14} />
              <span>Viết luận</span>
            </button>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeSection === 'QUIZ' && (
              <>
                {testAudioUrl && <TestRunnerAudioPlayer audioUrl={testAudioUrl} />}
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
                    onExplainMistakes={() => {}}
                    onToggleAiDetails={() => setShowAiDetails(!showAiDetails)}
                  />
                )}
                {rawQuestions.map((q, idx) => (
                  <TestRunnerQuestionItem
                    key={q.id || idx}
                    question={q}
                    index={idx}
                    chosenIdx={selectedAnswers[idx]}
                    isSubmitted={isSubmitted}
                    isLoadingAi={isLoadingAi}
                    onSelectOption={handleSelectOption}
                  />
                ))}
              </>
            )}

            {activeSection === 'SPEAKING' && (
              <TestRunnerSpeakingSection
                courseId={courseId}
                moduleId={chapter?.id}
                testType={testType}
                prompt={effectiveSpeakingPrompt}
                fileUrl={effectiveSpeakingFileUrl}
              />
            )}

            {activeSection === 'WRITING' && (
              <TestRunnerWritingSection
                courseId={courseId}
                moduleId={chapter?.id}
                testType={testType}
                prompt={effectiveWritingPrompt}
                fileUrl={effectiveWritingFileUrl}
              />
            )}
          </div>

          <TestRunnerSidebar
            questions={rawQuestions}
            selectedAnswers={selectedAnswers}
            isSubmitted={isSubmitted}
            isSaving={isSaving}
            correctCount={scoreResult?.correctCount || 0}
            wrongCount={wrongQuestionsList.length}
            onQuestionClick={(idx: number) => {
              document.getElementById(`question-card-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}
            onSubmitClick={() => setShowSubmitConfirm(true)}
            onRetryClick={handleRetry}
          />
        </div>
      </div>

      <TestRunnerHistoryModal
        isOpen={showHistoryModal}
        testTitle={testTitle}
        attemptsList={attemptsList}
        bestScore={bestScore}
        passingScore={passingScore}
        totalQuestionsCount={rawQuestions.length}
        onClose={() => setShowHistoryModal(false)}
      />
      <TestRunnerExitConfirmModal
        isOpen={showExitConfirm}
        onCancel={() => setShowExitConfirm(false)}
        onConfirmExit={onClose}
      />
      <TestRunnerSubmitConfirmModal
        isOpen={showSubmitConfirm}
        totalQuestions={rawQuestions.length}
        answeredCount={Object.keys(selectedAnswers).length}
        unansweredCount={Math.max(0, rawQuestions.length - Object.keys(selectedAnswers).length)}
        timeLeftFormatted={formatTime(timeLeft)}
        isSaving={isSaving}
        onCancel={() => setShowSubmitConfirm(false)}
        onConfirmSubmit={() => handleSubmitTest(false)}
      />
    </div>
  )
}
