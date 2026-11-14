// Trang luyện viết tiếng Anh với chủ đề đa dạng, lưu bản nháp và chấm điểm bài luận AI.
'use client'

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
    historyPage,
    historyTotal,
    historyTotalPages,
    isLoadingHistory,
    historyError,
    refetchHistory,
    draftContent,
    draftVersion,
    timeSeconds,
    isLoading,
    error,
    handleGoHome,
    handleGoExercises,
    handleGoHistory,
    handleHistoryPage,
    handleBackFromResult,
    handleSelectExercise,
    handleStartWriting,
    handleSaveDraft,
    handleSubmitWriting,
    handleViewSubmission,
    handlePracticeAgain,
    handleNextExercise,
  } = useWritingWorkspace()
  const { i18n } = useTranslation()
  const vi = i18n.language.toLowerCase().startsWith('vi')

  // Show error state if there's an error
  if (error) {
    return <ErrorState message={error} onRetry={handleGoHome} />
  }

  if (isLoading) {
    return <LoadingState />
  }

  if (currentView === 'exercises' || currentView === 'history' || currentView === 'home') {
    const history = currentView === 'history'
    return (
      <main className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <header className="rounded-3xl bg-primary p-6 text-white">
          <h1 className="text-2xl font-bold">{vi ? 'Luyện viết Writing' : 'Writing practice'}</h1>
          <p className="mt-2 text-sm">
            {vi ? 'Luyện viết theo chủ đề, nhận phản hồi AI và xem lại các bài đã làm.' : 'Practice writing, get AI feedback and review your submissions.'}
          </p>
        </header>
        <nav aria-label={vi ? 'Điều hướng Writing' : 'Writing navigation'} className="flex flex-wrap gap-2">
          <Button variant={history ? 'outline' : 'default'} aria-current={!history ? 'page' : undefined} onClick={handleGoExercises}>
            {vi ? 'Danh sách bài viết' : 'Writing exercises'}
          </Button>
          <Button variant={history ? 'default' : 'outline'} aria-current={history ? 'page' : undefined} onClick={handleGoHistory}>
            {vi ? 'Lịch sử làm bài' : 'Submission history'}
          </Button>
        </nav>
        {history ? (
          <div aria-live="polite" aria-busy={isLoadingHistory}>
            {isLoadingHistory ? (
              <p className="flex items-center gap-2 py-6 text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />{vi ? 'Đang tải lịch sử…' : 'Loading history…'}</p>
            ) : historyError ? (
              <div role="alert" className="space-y-3 rounded-xl border border-border p-4">
                <p>{historyError}</p>
                <Button variant="outline" onClick={() => void refetchHistory()}>{vi ? 'Thử lại' : 'Retry'}</Button>
              </div>
            ) : (
              <>
                <WritingHistory embedded submissions={historySubmissions} exercises={exerciseList} onBack={handleGoExercises} onViewSubmission={handleViewSubmission} />
                {historyTotal > 0 && (
                  <nav aria-label={vi ? 'Phân trang lịch sử' : 'History pagination'} className="mt-6 flex flex-wrap items-center gap-3">
                    <Button variant="outline" disabled={historyPage <= 1} onClick={() => handleHistoryPage(historyPage - 1)}>{vi ? 'Trang trước' : 'Previous page'}</Button>
                    <span className="text-sm text-text-secondary">{vi ? 'Trang' : 'Page'} {historyPage} / {Math.max(1, historyTotalPages)} · {historyTotal} {vi ? 'bài đã nộp' : 'submissions'}</span>
                    <Button variant="outline" disabled={historyPage >= historyTotalPages} onClick={() => handleHistoryPage(historyPage + 1)}>{vi ? 'Trang sau' : 'Next page'}</Button>
                  </nav>
                )}
              </>
            )}
          </div>
        ) : <WritingExerciseList embedded exercises={exerciseList} onSelectExercise={handleSelectExercise} onBack={handleGoHome} />}
      </main>
    )
  }

  switch (currentView) {

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
          onBack={handleBackFromResult}
          onTryAgain={handlePracticeAgain}
          onNextExercise={handleNextExercise}
          onViewHistory={handleGoHistory}
        />
      )

    default:
      return null
  }
}
