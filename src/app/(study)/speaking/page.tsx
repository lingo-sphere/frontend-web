// Trang luyện nói tiếng Anh với phòng thu âm và phản hồi đánh giá AI.
'use client'

import { SpeakingHome } from '@/features/practice/components/speaking.home'
import { SpeakingExerciseList } from '@/features/practice/components/speaking.exercise.list'
import { SpeakingWorkspace } from '@/features/practice/components/speaking.workspace'
import { SpeakingResult } from '@/features/practice/components/speaking.result'
import { SpeakingHistory } from '@/features/practice/components/speaking.history'
import { useSpeakingWorkspace } from '@/features/practice/hooks/use.speaking.workspace'

export default function SpeakingAppPage() {
  const {
    view,
    setView,
    exerciseList,
    selectedExercise,
    currentSubmission,
    historyAttempts,
    recordingState,
    setRecordingState,
    stats,
    progress,
    userSpeakingProfile,
    handleGoHome,
    handleGoList,
    handleGoHistory,
    handleSelectExercise,
    handleViewSubmission,
    handleStartPractice,
    handleSubmitRecording,
    handlePracticeAgain,
    handleNextExercise,
    isSubmitting,
  } = useSpeakingWorkspace()

  switch (view) {
    case 'list':
      return (
        <SpeakingExerciseList
          exercises={exerciseList}
          onSelectExercise={handleSelectExercise}
          onBack={handleGoHome}
        />
      )

    case 'workspace':
      if (!selectedExercise) return null
      return (
        <SpeakingWorkspace
          exercise={selectedExercise}
          recordingState={recordingState}
          onUpdateRecording={setRecordingState}
          onSubmit={handleSubmitRecording}
          onBack={handleGoList}
          isSubmitting={isSubmitting}
        />
      )

    case 'result':
      if (!currentSubmission || !selectedExercise) return null
      return (
        <SpeakingResult
          submission={currentSubmission}
          exercise={selectedExercise}
          onBack={handleGoList}
          onPracticeAgain={handlePracticeAgain}
          onNextExercise={handleNextExercise}
        />
      )

    case 'history':
      return (
        <SpeakingHistory
          attempts={historyAttempts}
          exercises={exerciseList}
          onBack={handleGoHome}
          onViewAttempt={handleViewSubmission}
        />
      )

    case 'home':
    default:
      return (
        <SpeakingHome
          stats={stats}
          progress={progress}
          userSpeakingProfile={userSpeakingProfile}
          recentAttempts={historyAttempts.slice(0, 5)}
          exercises={exerciseList}
          onStartPractice={handleStartPractice}
          onViewAll={() => setView('list')}
          onViewHistory={handleGoHistory}
        />
      )
  }
}
