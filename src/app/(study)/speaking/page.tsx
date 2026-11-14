// Trang luyện nói tiếng Anh với phòng thu âm và phản hồi đánh giá AI.
'use client'

import { useState } from 'react'
import { useSearchParams } from '@/lib/navigation'
import { SpeakingExerciseList } from '@/features/practice/components/speaking.exercise.list'
import { SpeakingWorkspace } from '@/features/practice/components/speaking.workspace'
import { SpeakingResult } from '@/features/practice/components/speaking.result'
import { SpeakingHistory } from '@/features/practice/components/speaking.history'
import { SpeakingTimeModeSelector } from '@/features/practice/components/speaking.time-mode-selector'
import { useSpeakingWorkspace } from '@/features/practice/hooks/use.speaking.workspace'
import type { SpeakingExercise } from '@/features/practice/types/speaking'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/button'

export default function SpeakingAppPage() {
  const {
    pendingSpeaking, retryPendingSpeaking,
    view,
    exerciseList,
    selectedExercise,
    selectedTier,
    currentSubmission,
    historyAttempts,
    recordingState,
    setRecordingState,
    handleGoList,
    handleGoHistory,
    handleSelectExercise,
    handleViewSubmission,
    handleSubmitRecording,
    handlePracticeAgain,
    handleNextExercise,
    isSubmitting,
    isLoadingExercises, exercisesError, refetchExercises,
    isLoadingHistory, historyError, refetchHistory,
  } = useSpeakingWorkspace()
  const { i18n } = useTranslation()
  const vi = i18n.language.toLowerCase().startsWith('vi')
  const [pendingExercise, setPendingExercise] = useState<SpeakingExercise | null>(null)
  const [practiceFocus, setPracticeFocus] = useState('')
  const searchParams = useSearchParams()
  const requestedExercise = searchParams?.get('exercise_id'), requestedFocus = searchParams?.get('focus')?.slice(0, 1500) || ''
  const [dismissedReview, setDismissedReview] = useState('')
  const reviewKey = `${requestedExercise}:${requestedFocus}`
  const choosingExercise = pendingExercise || (requestedExercise && dismissedReview !== reviewKey ? exerciseList.find(item => item.id === requestedExercise) : null)

  if (view === 'home' || view === 'list' || view === 'history') {
    const history = view === 'history'
    const loading = history ? isLoadingHistory : isLoadingExercises
    const error = history ? historyError : exercisesError
    return (
      <main className="w-full space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <header className="rounded-3xl bg-primary p-6 text-white">
          <h1 className="text-2xl font-bold">{vi ? 'Luyện nói Speaking' : 'Speaking practice'}</h1>
          <p className="mt-2 text-sm">{vi ? 'Luyện nói theo chủ đề, thu âm, nhận phản hồi AI và xem lại các bài đã làm.' : 'Practice speaking, record your response, get AI feedback and review your submissions.'}</p>
        </header>
        <nav aria-label={vi ? 'Điều hướng Speaking' : 'Speaking navigation'} className="flex flex-wrap gap-2">
          <Button variant={history ? 'outline' : 'default'} aria-current={!history ? 'page' : undefined} onClick={handleGoList}>{vi ? 'Danh sách bài nói' : 'Speaking exercises'}</Button>
          <Button variant={history ? 'default' : 'outline'} aria-current={history ? 'page' : undefined} onClick={handleGoHistory}>{vi ? 'Lịch sử làm bài' : 'Submission history'}</Button>
        </nav>
        <div aria-live="polite" aria-busy={loading}>
          {loading ? <p className="flex items-center gap-2 py-6 text-text-secondary"><Loader2 className="h-4 w-4 animate-spin" />{vi ? 'Đang tải…' : 'Loading…'}</p> : error ? (
            <div role="alert" className="space-y-3 rounded-xl border border-border p-4">
              <p>{error.message}</p>
              <Button variant="outline" onClick={() => void (history ? refetchHistory() : refetchExercises())}>{vi ? 'Thử lại' : 'Retry'}</Button>
            </div>
          ) : history ? (
            <SpeakingHistory embedded attempts={historyAttempts} exercises={exerciseList} onBack={handleGoList} onViewAttempt={handleViewSubmission} />
          ) : (
            <SpeakingExerciseList
              embedded
              exercises={exerciseList}
              onSelectExercise={(exercise) => setPendingExercise(exercise)}
              onBack={handleGoList}
            />
          )}
        </div>

        {choosingExercise && (
          <SpeakingTimeModeSelector
            exercise={choosingExercise}
            exerciseTitle={vi ? choosingExercise.title_vi || choosingExercise.title : choosingExercise.title}
            onSelect={(tier) => {
              const target = choosingExercise
              setPracticeFocus(pendingExercise ? '' : requestedFocus)
              setDismissedReview(reviewKey)
              setPendingExercise(null)
              handleSelectExercise(target, tier)
            }}
            onCancel={() => { setPendingExercise(null); setDismissedReview(reviewKey) }}
          />
        )}
      </main>
    )
  }

  switch (view) {
    case 'workspace':
      if (!selectedExercise) return null
      return (
        <div className="space-y-4">
        {practiceFocus && <aside className="mx-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm"><strong>{vi ? 'Trọng tâm ôn tập của bạn: ' : 'Your review focus: '}</strong>{practiceFocus}<p className="mt-2 text-text-secondary">{vi ? 'Luyện riêng phần này trước, sau đó thu lại bài theo đề để hệ thống kiểm tra tiến bộ.' : 'Practice this point first, then record the original task again to check progress.'}</p></aside>}
        {pendingSpeaking && <div role="status" aria-live="polite" className="rounded-xl border border-amber-500 p-4 text-sm"><p>{isSubmitting ? (vi ? 'Bài đã lưu và đang được chấm: phân tích audio, nội dung và lỗi ngôn ngữ. Hội thoại nhiều lượt có thể cần thêm thời gian.' : 'Your recording is saved. Audio, task completion and language errors are being assessed. Multi-turn dialogues may take longer.') : (vi ? 'Bạn có bản ghi chưa hoàn tất chấm điểm. Có thể kiểm tra/chấm lại bài đã lưu mà không cần thu âm lại.' : 'A saved recording is awaiting a result. Check or retry without recording again.')}</p><button type="button" disabled={isSubmitting} className="mt-2 font-semibold text-primary underline" onClick={retryPendingSpeaking}>{isSubmitting ? (vi ? 'Đang chấm…' : 'Assessing…') : (vi ? 'Kiểm tra / chấm lại bản ghi đã lưu' : 'Check / retry saved recording')}</button></div>}
        <SpeakingWorkspace
          exercise={selectedExercise}
          initialTier={selectedTier}
          recordingState={recordingState}
          onUpdateRecording={setRecordingState}
          onSubmit={handleSubmitRecording}
          onBack={handleGoList}
          isSubmitting={isSubmitting}
        />
        </div>
      )

    case 'result':
      if (!currentSubmission || !selectedExercise) return null
      return (
        <SpeakingResult
          submission={currentSubmission}
          exercise={selectedExercise}
          onBack={handleGoList}
          onPracticeAgain={handlePracticeAgain}
          onPracticeIssue={issue => { setPracticeFocus(issue.practice); handlePracticeAgain() }}
          onNextExercise={handleNextExercise}
        />
      )

    default:
      return null
  }
}
