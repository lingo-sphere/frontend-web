/**
 * @file course.test.runner.modal.tsx
 * @description Modal thi và đánh giá 4 kỹ năng (Trắc nghiệm, Luyện nói, Viết luận) cho khóa học
 */

'use client'

import {
  ArrowLeft,
  Clock,
  Send,
  BookOpen,
  Mic,
  PenTool,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Chapter } from '@/types/course'
import {
  CourseTestQuestion,
  TestAttemptItem,
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
import { useCourseTestRunner } from './test-runner/use.course.test.runner'

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
  const {
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
  } = useCourseTestRunner({
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
    highestScore,
    previousAttempts,
    onComplete,
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full h-full max-w-6xl max-h-[92vh] bg-surface rounded-2xl border border-border shadow-2xl flex flex-col overflow-hidden mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-surface-subtle/50 shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!isSubmitted) {
                  setShowExitConfirm(true)
                } else {
                  onClose()
                }
              }}
              className="rounded-xl gap-2 font-semibold cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Thoát</span>
            </Button>
            <div>
              <h2 className="font-bold text-lg text-text-primary flex items-center gap-2">
                <span>{testTitle}</span>
                {courseTitle && (
                  <span className="text-xs font-normal text-text-muted">
                    ({courseTitle})
                  </span>
                )}
              </h2>
              <p className="text-xs text-text-secondary">
                {rawQuestions.length} câu hỏi • Điểm đạt: {passingScore}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isSubmitted && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-sm">
                <Clock size={16} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            {!isSubmitted && (
              <Button
                onClick={() => setShowSubmitConfirm(true)}
                className="bg-primary text-white font-bold rounded-xl gap-2 cursor-pointer shadow-md"
              >
                <Send size={15} />
                <span>Nộp bài</span>
              </Button>
            )}
          </div>
        </div>

        {is4Skills && (
          <div className="flex items-center gap-2 px-6 py-2 border-b border-border/60 bg-surface shrink-0">
            <button
              type="button"
              onClick={() => setActiveSection('QUIZ')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'QUIZ'
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              <BookOpen size={14} />
              <span>Trắc nghiệm ({rawQuestions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('SPEAKING')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'SPEAKING'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
              }`}
            >
              <Mic size={14} />
              <span>Luyện Nói</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('WRITING')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSection === 'WRITING'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              }`}
            >
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
              document
                .getElementById(`question-card-${idx}`)
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
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
        unansweredCount={Math.max(
          0,
          rawQuestions.length - Object.keys(selectedAnswers).length
        )}
        timeLeftFormatted={formatTime(timeLeft)}
        isSaving={isSaving}
        onCancel={() => setShowSubmitConfirm(false)}
        onConfirmSubmit={() => handleSubmitTest(false)}
      />
    </div>
  )
}
