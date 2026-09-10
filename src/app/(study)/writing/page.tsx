// Trang luyện viết tiếng Anh với chủ đề đa dạng, lưu bản nháp và chấm điểm bài luận AI.
'use client'

import { WritingHome } from '@/features/practice/components/writing.home'
import { WritingExerciseList } from '@/features/practice/components/writing.exercise.list'
import { WritingExerciseDetail } from '@/features/practice/components/writing.exercise.detail'
import { WritingWorkspace } from '@/features/practice/components/writing.workspace'
import { WritingResult } from '@/features/practice/components/writing.result'
import { WritingHistory } from '@/features/practice/components/writing.history'
import { useWritingWorkspace } from '@/features/practice/hooks/use.writing.workspace'

export default function WritingAppPage() {
  const {
    currentView,
    exerciseList,
    selectedExercise,
    currentSubmission,
    historySubmissions,
    draftContent,
    draftVersion,
    stats,
    progress,
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
      if (!selectedExercise) return null
      return (
        <WritingExerciseDetail
          exercise={selectedExercise}
          onStart={() => handleStartWriting(selectedExercise)}
          onBack={handleGoExercises}
        />
      )

    case 'workspace':
      if (!selectedExercise) return null
      return (
        <WritingWorkspace
          exercise={selectedExercise}
          initialContent={draftContent}
          versionNumber={draftVersion}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmitWriting}
          onBack={handleGoExercises}
        />
      )

    case 'result':
      if (!currentSubmission || !selectedExercise) return null
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
        />
      )
  }
}
