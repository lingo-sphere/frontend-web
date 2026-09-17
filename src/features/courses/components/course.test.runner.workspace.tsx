// Giao diện không gian làm bài thi khóa học toàn màn hình (Course Test Runner Workspace)

'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, Send, BookOpen, Mic, PenTool } from 'lucide-react'
import { Button } from '@/components/button'
import { useNavigate } from '@/lib/navigation'
import { courseService } from '@/features/courses/services/course.service'
import type { Course } from '@/types/api.types'
import type { Chapter } from '@/features/courses/types/course'
import { TestRunnerAudioPlayer } from '@/features/courses/components/test.runner.audio.player'
import { TestRunnerQuestionItem } from '@/features/courses/components/test.runner.question.item'
import { TestRunnerSidebar } from '@/features/courses/components/test.runner.sidebar'
import { TestRunnerResultView } from '@/features/courses/components/test.runner.result.view'
import { TestRunnerSpeakingSection } from '@/features/courses/components/test.runner.speaking.section'
import { TestRunnerWritingSection } from '@/features/courses/components/test.runner.writing.section'
import { TestRunnerHistoryModal } from '@/features/courses/components/test.runner.history.modal'
import {
  TestRunnerExitConfirmModal,
  TestRunnerSubmitConfirmModal,
} from '@/features/courses/components/test.runner.confirm.modal'
import { TopicDrillModal } from '@/features/practice/components/topic.drill.modal'
import { useCourseTestRunner } from '@/features/courses/hooks/use.course.test.runner'
import type { CourseTestQuestion, TestAttemptItem } from '@/features/courses/types/test.runner.types'

export type { CourseTestQuestion, TestAttemptItem }

export interface CourseTestRunnerWorkspaceProps {
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

export function CourseTestRunnerWorkspace({
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
}: CourseTestRunnerWorkspaceProps) {
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
    isOpen: true,
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

  const navigate = useNavigate()
  const [drillTopic, setDrillTopic] = useState<string | null>(null)
  const [nextCourses, setNextCourses] = useState<
    (Course & { recommendation_reason?: string; match_score?: number })[]
  >([])

  useEffect(() => {
    if (testType === 'final-test' && isSubmitted && scoreResult?.isPassed) {
      let isMounted = true
      courseService
        .getRecommendedCourses({
          current_course_id: courseId,
          category,
        })
        .then((res) => {
          if (isMounted && res?.recommendations) {
            setNextCourses(res.recommendations)
          }
        })
        .catch(() => {
          if (isMounted) setNextCourses([])
        })
      return () => {
        isMounted = false
      }
    } else {
      setNextCourses([])
    }
  }, [testType, isSubmitted, scoreResult?.isPassed, courseId, category])

  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary flex flex-col antialiased">
      <header className="sticky top-0 z-40 w-full flex items-center justify-between px-4 sm:px-8 py-3.5 border-b border-border bg-surface/95 backdrop-blur-md shrink-0 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
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
            className="rounded-xl gap-2 font-semibold cursor-pointer hover:bg-surface-subtle"
          >
            <ArrowLeft size={16} />
            <span>Thoát</span>
          </Button>
          <div>
            <h1 className="font-bold text-base sm:text-lg text-text-primary flex items-center gap-2">
              <span>{testTitle}</span>
              {courseTitle && (
                <span className="text-xs font-normal text-text-muted hidden md:inline">
                  • {courseTitle}
                </span>
              )}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              {rawQuestions.length} câu hỏi • Điểm đạt yêu cầu: <span className="font-bold text-text-primary">{passingScore}%</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isSubmitted && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-sm shadow-2xs">
              <Clock size={16} className="animate-pulse" />
              <span>{formatTime(timeLeft)}</span>
            </div>
          )}
          {!isSubmitted && (
            <Button
              onClick={() => setShowSubmitConfirm(true)}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl gap-2 cursor-pointer shadow-md transition-all active:scale-98"
            >
              <Send size={15} />
              <span>Nộp bài</span>
            </Button>
          )}
          {isSubmitted && (
            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl gap-2 cursor-pointer shadow-md"
            >
              <ArrowLeft size={15} />
              <span>Quay lại khóa học</span>
            </Button>
          )}
        </div>
      </header>

      {is4Skills && (
        <div className="flex items-center gap-2 px-4 sm:px-8 py-2.5 border-b border-border/80 bg-surface shrink-0 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveSection('QUIZ')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'SPEAKING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
            }`}
          >
            <Mic size={14} />
            <span>Luyện Nói (Speaking)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSection('WRITING')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSection === 'WRITING'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
            }`}
          >
            <PenTool size={14} />
            <span>Viết luận (Writing)</span>
          </button>
        </div>
      )}

      <main className="flex-1 flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 gap-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6 pr-0 lg:pr-2">
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
                  recommendedNextCourses={nextCourses}
                  onShowHistory={() => setShowHistoryModal(true)}
                  onRetry={handleRetry}
                  onExplainMistakes={() => {}}
                  onToggleAiDetails={() => setShowAiDetails(!showAiDetails)}
                  onBackToLessons={onClose}
                  onNavigateCourse={(slugOrId) =>
                    navigate(slugOrId.startsWith('/') ? slugOrId : `/course/${slugOrId}`)
                  }
                  onDrillTopic={(topic) => setDrillTopic(topic)}
                  onOpenMistakeVault={() => navigate('/practice/mistakes')}
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

        <div className="w-full lg:w-80 shrink-0">
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
      </main>

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
      {drillTopic && (
        <TopicDrillModal
          open={Boolean(drillTopic)}
          onClose={() => setDrillTopic(null)}
          topicTag={drillTopic}
        />
      )}
    </div>
  )
}
