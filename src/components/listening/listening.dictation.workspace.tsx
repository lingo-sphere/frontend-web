/**
 * @file listening.dictation.workspace.tsx
 * @description Không gian làm việc luyện nghe chép chính tả tương tác theo phân đoạn (Video/Audio Dictation Workspace)
 */

'use client'

import { useTranslation } from 'react-i18next'
import { Card, CardContent } from '@/components/ui/card'
import type { ListeningExercise, ListeningAttempt } from '@/types/listening'
import { DictationPlayerPanel } from './dictation.player.panel'
import { DictationInputBox } from './dictation.input.box'
import { DictationResultCard } from './dictation.result.card'
import { DictationWorkspaceHeader } from './dictation.workspace.header'
import {
  useDictationWorkspace,
  formatDuration,
} from './use.dictation.workspace'

interface VideoDictationViewProps {
  exercise: ListeningExercise
  existingAttempt: ListeningAttempt | null
  onBack: () => void
  onComplete: (attempt: ListeningAttempt) => void
}

export function VideoDictationView({
  exercise,
  existingAttempt,
  onBack,
  onComplete,
}: VideoDictationViewProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  const {
    isPlaying,
    currentTime,
    playbackSpeed,
    activeSegmentIndex,
    completedSegments,
    answers,
    hintRevealedCount,
    replayCount,
    totalHintsUsed,
    checkedResults,
    correctedAnswers,
    currentSegment,
    isCurrentSegmentCompleted,
    canSubmitCurrentSegment,
    hasViewedCurrentResult,
    allSegmentsCompleted,
    currentSegmentHintsUsed,
    hasMoreHints,
    setCurrentTime,
    setPlaybackSpeed,
    togglePlayback,
    replaySegment,
    replayPreviousSegment,
    handleHint,
    handleNext,
    goToSegment,
    handleAnswerChange,
  } = useDictationWorkspace({
    exercise,
    existingAttempt,
    onComplete,
  })

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-4 lg:px-6">
      <DictationWorkspaceHeader
        exerciseTitle={exercise.title}
        isVietnamese={isVietnamese}
        onBack={onBack}
      />

      <div className="flex gap-4 h-[calc(100vh-140px)]">
        <DictationPlayerPanel
          exercise={exercise}
          isPlaying={isPlaying}
          currentTime={currentTime}
          playbackSpeed={playbackSpeed}
          activeSegmentIndex={activeSegmentIndex}
          completedSegments={completedSegments}
          totalHintsUsed={totalHintsUsed}
          replayCount={replayCount}
          isVietnamese={isVietnamese}
          onTogglePlayback={togglePlayback}
          onSeekTime={setCurrentTime}
          onReplaySegment={replaySegment}
          onReplayPreviousSegment={replayPreviousSegment}
          onSetPlaybackSpeed={setPlaybackSpeed}
          onGoToSegment={goToSegment}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <CardContent className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center gap-2 mb-4 sticky top-0 bg-white pb-2">
                <span className="text-xs px-2 py-1 bg-primary-soft text-primary rounded-full font-medium">
                  {isVietnamese ? 'Câu' : 'Question'} {activeSegmentIndex + 1}
                </span>
                <span className="text-xs text-text-tertiary">
                  {formatDuration(currentSegment?.startTime || 0)} -{' '}
                  {formatDuration(currentSegment?.endTime || 0)}
                </span>
              </div>

              {currentSegment && (
                <DictationInputBox
                  currentSegment={currentSegment}
                  answers={answers}
                  hintRevealedCount={hintRevealedCount}
                  checkedResults={checkedResults}
                  completedSegments={completedSegments}
                  correctedAnswers={correctedAnswers}
                  onAnswerChange={handleAnswerChange}
                />
              )}

              <DictationResultCard
                currentSegment={currentSegment}
                checkedResults={checkedResults}
                hasViewedCurrentResult={hasViewedCurrentResult}
                isCurrentSegmentCompleted={isCurrentSegmentCompleted}
                allSegmentsCompleted={allSegmentsCompleted}
                canSubmitCurrentSegment={canSubmitCurrentSegment}
                hasMoreHints={hasMoreHints}
                currentSegmentHintsUsed={currentSegmentHintsUsed}
                isVietnamese={isVietnamese}
                onHint={handleHint}
                onNext={handleNext}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
