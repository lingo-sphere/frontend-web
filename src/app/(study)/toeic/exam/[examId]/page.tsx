// Trang làm bài thi TOEIC trực tuyến.

'use client'

import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from '@/lib/navigation'
import { RotateCcw, AlertCircle } from 'lucide-react'
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

  if (!examData || allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center p-4">
        <div className="max-w-md rounded-2xl bg-surface p-6 text-center border border-border shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">
            {!examData
              ? isVietnamese
                ? 'Không tìm thấy đề thi'
                : 'Exam Not Found'
              : isVietnamese
                ? 'Đề thi chưa có câu hỏi'
                : 'No questions in this exam'}
          </h2>
          <p className="text-xs text-text-secondary">
            {!examData
              ? isVietnamese
                ? 'Bài thi này hiện chưa được khởi tạo hoặc chưa được xuất bản trên hệ thống. Vui lòng quay lại sau.'
                : 'This exam does not exist or has not been published yet.'
              : isVietnamese
                ? 'Bài thi này hiện chưa được cập nhật nội dung câu hỏi trên hệ thống. Vui lòng quay lại sau hoặc liên hệ ban quản trị.'
                : 'This exam currently has no questions. Please check back later.'}
          </p>
          <Button onClick={() => navigate(-1)} variant="outline" className="mt-2">
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
