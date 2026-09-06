/**
 * @file page.tsx
 * @description Trang làm bài thi TOEIC trực tuyến (TOEIC Exam Workspace)
 */

'use client'

import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from '@/lib/navigation'
import { RotateCcw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  } = useToeicExam(examId)

  if (isLoadingExam) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3 text-text-secondary">
          <RotateCcw className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-semibold">
            {isVietnamese ? 'Đang tải thông tin đề thi...' : 'Loading exam data...'}
          </p>
        </div>
      </div>
    )
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

  if (!showModeSelector && allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <div className="max-w-md rounded-2xl bg-surface p-6 text-center border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">
            {isVietnamese ? 'Đề thi chưa có câu hỏi' : 'No questions in this exam'}
          </h2>
          <p className="text-xs text-text-secondary">
            {isVietnamese
              ? 'Bài thi này hiện chưa được cập nhật nội dung câu hỏi trên hệ thống. Vui lòng quay lại sau hoặc liên hệ ban quản trị.'
              : 'This exam currently has no questions. Please check back later.'}
          </p>
          <Button onClick={() => setShowModeSelector(true)} variant="outline" className="mt-2">
            {isVietnamese ? 'Quay lại' : 'Go back'}
          </Button>
        </div>
      </div>
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
