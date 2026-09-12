// Trang làm bài thi TOEIC trực tuyến và hiển thị kết quả đánh giá năng lực
'use client'

import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useNavigate, useParams } from '@/lib/navigation'
import { RotateCcw, Sparkles } from 'lucide-react'
import { ToeicExamEmptyState } from '@/features/toeic/components/toeic.exam.empty.state'
import { Button } from '@/components/button'
import { useToeicExam } from '@/features/toeic/hooks/use.toeic.exam'
import { ToeicExamResult } from '@/features/toeic/components/toeic.exam.result'
import { ToeicQuestionCard } from '@/features/toeic/components/toeic.question.card'
import { ToeicQuestionNav } from '@/features/toeic/components/toeic.question.nav'
import { ToeicExamHeader } from '@/features/toeic/components/toeic.exam.header'
import { PART_TIMINGS, PART_TIPS } from '@/features/toeic/components/toeic.constants'

export default function ToeicExamAppPage() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const { examId } = useParams<{ examId?: string }>()
  const isVietnamese = i18n.language === 'vi'

  const {
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
  } = useToeicExam(examId)

  if (isLoadingExam) {
    return (
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <RotateCcw className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
            </div>
            <Sparkles className="w-5 h-5 text-amber-500 absolute -top-1 -right-1 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              {isVietnamese ? 'Đang chuẩn bị đề thi...' : 'Preparing exam...'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isVietnamese
                ? 'Hệ thống đang tải câu hỏi và cấu trúc bài thi, vui lòng đợi trong giây lát.'
                : 'Loading questions and exam structure, please wait a moment.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!examData || allQuestions.length === 0) {
    return (
      <ToeicExamEmptyState
        examId={examId}
        isVietnamese={isVietnamese}
        hasExamData={Boolean(examData)}
        onNavigate={navigate}
      />
    )
  }

  if (state.submitted) {
    const results = calculateResults()
    return (
      <ToeicExamResult
        results={results}
        questions={allQuestions}
        userAnswers={state.answers}
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

  const isWriting =
    currentQuestion?.questionType === 'WRITING' ||
    currentQuestion?.skillType === 'WRITING' ||
    String(currentQuestion?.partNumber).toLowerCase().includes('writ')

  const isSpeaking =
    !isWriting &&
    (currentQuestion?.questionType === 'SPEAKING' ||
      currentQuestion?.skillType === 'SPEAKING' ||
      String(currentQuestion?.partNumber).toLowerCase().includes('speak'))

  const isSystemPlacement = Boolean(
    examData?.is_system_placement ||
    examData?.placement_type ||
    Boolean(examData?.code && examData.code.includes('placement')) ||
    examData?.title?.toLowerCase().includes('đầu vào') ||
    examData?.title?.toLowerCase().includes('placement')
  )

  const hasExplicitPart =
    !isSystemPlacement &&
    !isWriting &&
    !isSpeaking &&
    typeof currentQuestion?.partNumber === 'number' &&
    currentQuestion.partNumber >= 1 &&
    currentQuestion.partNumber <= 7

  const currentPart = hasExplicitPart ? (currentQuestion.partNumber as number) : undefined
  const partName = hasExplicitPart && currentPart ? `Part ${currentPart}` : undefined

  const partTip = isWriting
    ? isVietnamese
      ? 'Đảm bảo cấu trúc bài viết rõ ràng, đủ luận điểm và đạt tối thiểu số từ yêu cầu.'
      : 'Ensure clear structure, coherence, and meet the minimum word count.'
    : isSpeaking
      ? isVietnamese
        ? 'Nói to rõ ràng, tự nhiên, bám sát các ý trọng tâm trong đề bài.'
        : 'Speak clearly, naturally, and cover all required prompt points.'
      : hasExplicitPart && currentPart
        ? PART_TIPS[currentPart]
        : undefined

  const partTiming = hasExplicitPart && currentPart ? PART_TIMINGS[currentPart] : undefined

  return (
    <div className="min-h-screen bg-surface-secondary">
      <ToeicExamHeader
        title={examData?.title || 'TOEIC Exam'}
        currentQuestionIndex={state.currentQuestionIndex}
        totalQuestions={allQuestions.length}
        timedMode={state.timedMode}
        timeRemaining={state.timeRemaining}
        isVietnamese={isVietnamese}
        onBackToModeSelect={() => navigate(-1)}
        onSubmit={handleSubmit}
      />

      <div className="w-full grid gap-6 p-4 sm:p-6 lg:p-8 lg:grid-cols-[1fr_320px]">
        {currentQuestion && (
          <ToeicQuestionCard
            question={currentQuestion}
            currentPart={currentPart}
            partName={partName}
            partTip={partTip}
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
          partTiming={partTiming}
          onGoToQuestion={goToQuestion}
        />
      </div>
    </div>
  )
}
