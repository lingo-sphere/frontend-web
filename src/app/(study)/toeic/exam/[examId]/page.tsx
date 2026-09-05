/**
 * @file page.tsx
 * @description Trang làm bài thi TOEIC trực tuyến (TOEIC Exam Workspace)
 */

'use client'

import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from '@/lib/navigation'
import { useToeicExam } from '@/hooks/use.toeic.exam'
import { ToeicModeSelector } from '@/components/toeic/toeic.mode.selector'
import { ToeicExamResult } from '@/components/toeic/toeic.exam.result'
import { ToeicQuestionCard } from '@/components/toeic/toeic.question.card'
import { ToeicQuestionNav } from '@/components/toeic/toeic.question.nav'
import { ToeicExamHeader } from '@/components/toeic/toeic.exam.header'
import { PART_TIMINGS, PART_TIPS } from '@/components/toeic/toeic.constants'

export default function ToeicExamAppPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { examId } = useParams<{ examId?: string }>()
  const isVietnamese = i18n.language === 'vi'

  const {
    examData,
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
  } = useToeicExam(examId)

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
        onRetry={handleRetry}
        onChooseAnother={handleChooseAnother}
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
