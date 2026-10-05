// Trang làm bài thi TOEIC trực tuyến và hiển thị kết quả đánh giá năng lực.
'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from '@/lib/navigation'
import { RotateCcw, Sparkles } from 'lucide-react'
import { ToeicExamEmptyState } from '@/features/toeic/components/toeic.exam.empty.state'
import { useToeicExam } from '@/features/toeic/hooks/use.toeic.exam'
import { ToeicExamResult } from '@/features/toeic/components/toeic.exam.result'
import { ToeicQuestionCard } from '@/features/toeic/components/toeic.question.card'
import { ToeicQuestionNav } from '@/features/toeic/components/toeic.question.nav'
import { ToeicExamHeader } from '@/features/toeic/components/toeic.exam.header'
import { PART_TIMINGS, PART_TIPS } from '@/features/toeic/components/toeic.constants'
import { TestRunnerExitConfirmModal } from '@/features/courses/components/test.runner.confirm.modal'
import { UserScoreUpgradeModal } from '@/features/user/components/user.score.upgrade.modal'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { userService } from '@/features/user/services/user.service'
import { toast } from '@/store/toast.store'

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
    targetBand,
    levelLabel,
    isLoadingRecommendations,
    handleSelectAnswer,
    goToQuestion,
    toggleFlag,
    handleSubmit,
    handleSubmitAttemptAsync,
    handleRetry,
    handleChooseAnother,
    calculateResults,
    evaluatedAnswers,
    isSubmittingAttempt,
  } = useToeicExam(examId)

  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  const [hasDismissedUpgrade, setHasDismissedUpgrade] = useState(false)

  const user = useAuthStore((s) => s.user)

  const is4SkillsExam = Boolean(
    examId?.includes('4skills') ||
    examData?.skills_enabled === 'ALL' ||
    allQuestions.some((q) => q.questionType === 'SPEAKING' || q.questionType === 'WRITING')
  )

  const currentListening = Number(user?.placement_listening_score || 0)
  const currentReading = Number(user?.placement_reading_score || 0)
  const currentSpeaking = Number(user?.placement_speaking_score || 0)
  const currentWriting = Number(user?.placement_writing_score || 0)
  const currentTotal = Number(
    user?.placement_test_score ??
    (user?.placement_skills_type === '4SKILLS'
      ? currentListening + currentReading + currentSpeaking + currentWriting
      : currentListening + currentReading)
  )

  const handleConfirmUpgrade = async () => {
    const results = calculateResults()
    const newListening = Number(results.estimatedListening || 0)
    const newReading = Number(results.estimatedReading || 0)
    const newSpeaking = Number(results.estimatedSpeaking || 0)
    const newWriting = Number(results.estimatedWriting || 0)
    const newTotal = Number(results.estimatedTotal || 0)

    const payload = {
      placement_test_score: newTotal,
      placement_listening_score: newListening,
      placement_reading_score: newReading,
      placement_speaking_score: is4SkillsExam ? newSpeaking : undefined,
      placement_writing_score: is4SkillsExam ? newWriting : undefined,
      placement_skills_type: is4SkillsExam ? '4SKILLS' : '2SKILLS',
      target_toeic_score:
        user?.target_toeic_score && user.target_toeic_score > newTotal
          ? user.target_toeic_score
          : Math.min(is4SkillsExam ? 1390 : 990, Math.ceil((newTotal + 50) / 10) * 10),
      current_estimated_score: newTotal,
      is_score_manually_edited: false,
      placement_tested_at: new Date().toISOString(),
    }

    const updatedUser = await userService.updateProfile(payload)
    const { user: currentUser, setUser } = useAuthStore.getState()
    if (currentUser) {
      setUser({ ...currentUser, ...payload, ...(updatedUser || {}) })
    }
    toast.success('Đã cập nhật điểm kỷ lục mới vào hồ sơ học tập của bạn!')
  }

  const handleBackClick = () => {
    if (!state.submitted) {
      setShowExitConfirm(true)
    } else {
      navigate(-1)
    }
  }

  const handleConfirmExit = async () => {
    if (isExiting) return
    setIsExiting(true)
    try {
      await handleSubmitAttemptAsync()
      setShowExitConfirm(false)
      navigate('/toeic')
    } catch {
      setIsExiting(false)
    }
  }

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
    const newTotal = results.estimatedTotal || 0
    const newListening = results.estimatedListening || 0
    const newReading = results.estimatedReading || 0
    const newSpeaking = results.estimatedSpeaking || 0
    const newWriting = results.estimatedWriting || 0

    const isHigher =
      newTotal > currentTotal ||
      newListening > currentListening ||
      newReading > currentReading ||
      (is4SkillsExam && newSpeaking > currentSpeaking) ||
      (is4SkillsExam && newWriting > currentWriting)

    const shouldShowUpgradeModal = !hasDismissedUpgrade && Boolean(user) && isHigher && newTotal > 0

    return (
      <>
        <ToeicExamResult
          results={results}
          questions={allQuestions}
          userAnswers={state.answers}
          evaluatedAnswers={evaluatedAnswers}
          isEvaluatingAI={isSubmittingAttempt}
          recommendedCourses={recommendedCourses}
          targetBand={targetBand}
          levelLabel={levelLabel}
          isLoadingRecommendations={isLoadingRecommendations}
          onRetry={handleRetry}
          onChooseAnother={handleChooseAnother}
        />
        {shouldShowUpgradeModal && (
          <UserScoreUpgradeModal
            open={shouldShowUpgradeModal}
            onClose={() => setHasDismissedUpgrade(true)}
            examTitle={examData?.title || 'Đề thi TOEIC'}
            currentScores={{
              total: currentTotal,
              listening: currentListening,
              reading: currentReading,
              speaking: currentSpeaking,
              writing: currentWriting,
              skillsType: user?.placement_skills_type === '4SKILLS' ? '4SKILLS' : '2SKILLS',
            }}
            newScores={{
              total: newTotal,
              listening: newListening,
              reading: newReading,
              speaking: newSpeaking,
              writing: newWriting,
              skillsType: is4SkillsExam ? '4SKILLS' : '2SKILLS',
            }}
            currentTargetScore={Number(user?.target_toeic_score) || undefined}
            onConfirm={handleConfirmUpgrade}
          />
        )}
      </>
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
        onBackToModeSelect={handleBackClick}
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

      <TestRunnerExitConfirmModal
        isOpen={showExitConfirm}
        isSaving={isExiting}
        onCancel={() => {
          if (!isExiting) setShowExitConfirm(false)
        }}
        onConfirmExit={handleConfirmExit}
      />
    </div>
  )
}
