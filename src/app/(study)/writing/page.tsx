// Trang luyện viết tiếng Anh với chủ đề đa dạng, lưu bản nháp và chấm điểm bài luận AI.
'use client'

import { WritingHome } from '@/features/practice/components/writing.home'
import { WritingExerciseList } from '@/features/practice/components/writing.exercise.list'
import { WritingExerciseDetail } from '@/features/practice/components/writing.exercise.detail'
import { WritingWorkspace } from '@/features/practice/components/writing.workspace'
import { WritingResult } from '@/features/practice/components/writing.result'
import { WritingHistory } from '@/features/practice/components/writing.history'
import { useWritingWorkspace } from '@/features/practice/hooks/use.writing.workspace'
import { useTranslation } from 'react-i18next'
import { Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/button'

function LoadingState() {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-[14px] text-text-secondary">
          {isVietnamese ? 'Đang tải...' : 'Loading...'}
        </p>
      </div>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  return (
    <div className="flex h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-red-500" />
        <p className="text-[14px] text-text-secondary">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} className="bg-primary hover:bg-primary-hover">
            {isVietnamese ? 'Thử lại' : 'Retry'}
          </Button>
        )}
      </div>
    </div>
  )
}

export default function WritingAppPage() {
  const {
    reviewSessionId,
    currentView,
    exerciseList,
    selectedExercise,
    currentSubmission,
    historySubmissions,
    draftContent,
    draftVersion,
    timeSeconds,
    stats,
    progress,
    isLoading,
    error,
    handleGoHome,
    handleGoExercises,
    handleGoHistory,
    handleSelectExercise,
    handleStartWriting,
    handleSaveDraft,
    handleSubmitWriting,
    handleViewSubmission,
    handlePracticeAgain,
    handleNextExercise,
  } = useWritingWorkspace()

  // Show loading state while initializing
  if (isLoading) {
    return <LoadingState />
  }

  // Show error state if there's an error
  if (error) {
    return <ErrorState message={error} onRetry={handleGoHome} />
  }

  switch (currentView) {
    case 'exercises':
      return (
        <WritingExerciseList
          exercises={exerciseList}
          onSelectExercise={handleSelectExercise}
          onBack={handleGoHome}
        />
      )

    case 'detail':
      // Nếu selectedExercise null (direct URL access), hiển thị loading hoặc redirect
      if (!selectedExercise) {
        return <LoadingState />
      }
      return (
        <WritingExerciseDetail
          exercise={selectedExercise}
          onStart={(timeSecs) => handleStartWriting(selectedExercise, timeSecs)}
          onBack={handleGoExercises}
        />
      )

    case 'workspace':
      // Nếu selectedExercise null (direct URL access), hiển thị loading hoặc redirect
      if (!selectedExercise) {
        return <LoadingState />
      }
      return (
        <WritingWorkspace
          exercise={selectedExercise}
          reviewSessionId={reviewSessionId}
          initialContent={draftContent}
          versionNumber={draftVersion}
          timeLimitSeconds={timeSeconds}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitWriting}
          onBack={handleGoExercises}
        />
      )

    case 'result':
      if (!currentSubmission || !selectedExercise) {
        return <LoadingState />
      }
      return (
        <WritingResult
          submission={currentSubmission}
          exercise={selectedExercise}
          onBack={handleGoExercises}
          onTryAgain={handlePracticeAgain}
          onNextExercise={handleNextExercise}
          onViewHistory={handleGoHistory}
        />
      )

    case 'history':
      return (
        <WritingHistory
          submissions={historySubmissions}
          exercises={exerciseList}
          onBack={handleGoHome}
          onViewSubmission={handleViewSubmission}
        />
      )

    case 'home':
    default:
      return (
        <WritingHome
          stats={stats}
          progress={progress}
          recentSubmissions={historySubmissions.slice(0, 5)}
          continueWriting={null}
          exercises={exerciseList}
          onStartNew={handleGoExercises}
          onContinue={() => {}}
          onViewSubmission={handleViewSubmission}
          onViewHistory={handleGoHistory}
          onSelectExercise={(exerciseId) => {
            const ex = exerciseList.find((e) => e.id === exerciseId)
            if (ex) handleSelectExercise(ex)
          }}
        />
      )
  }
}
