/**
 * @file lesson.player.tsx
 * @description Trình phát video bài học phong cách YouTube cao cấp cho học viên LingoSphere
 */

'use client'

import { Play, Pause, Rewind, FastForward } from 'lucide-react'
import type { Lesson } from '@/features/courses/types/course'
import { PlayerControlsBar } from '@/features/courses/components/player.controls.bar'
import { PlayerEndscreen } from '@/features/courses/components/player.endscreen'
import { PlayerShortcutsModal } from '@/features/courses/components/player.shortcuts.modal'
import { useLessonVideoPlayer } from '@/features/courses/hooks/use.lesson.video.player'

interface LessonPlayerProps {
  lesson: Lesson
  courseId?: string
  isTrial?: boolean
  onOpenCheckout?: () => void
  onProgress?: (lessonId: string, progress: number) => void
  onLessonComplete?: (lessonId: string) => void
  onTimeUpdate?: (currentTime: number) => void
  onNextLesson?: () => void
  onPrevLesson?: () => void
  hasNextLesson?: boolean
  hasPrevLesson?: boolean
  onAddNoteAtTimestamp?: (seconds: number) => void
  onDurationChange?: (lessonId: string, durationSec: number) => void
}

export function LessonPlayer({
  lesson,
  courseId,
  isTrial = false,
  onOpenCheckout,
  onProgress,
  onLessonComplete,
  onTimeUpdate,
  onNextLesson,
  onPrevLesson,
  hasNextLesson = false,
  hasPrevLesson = false,
  onAddNoteAtTimestamp,
  onDurationChange,
}: LessonPlayerProps) {
  const {
    containerRef,
    videoRef,
    progressBarRef,
    countdownIntervalRef,
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    setDuration,
    bufferedPercent,
    volume,
    isMuted,
    playbackSpeed,
    selectedQuality,
    autoResolvedQuality,
    effectiveQualityKey,
    isTheater,
    setIsTheater,
    isFullscreen,
    showControls,
    setShowControls,
    isBuffering,
    setIsBuffering,
    autoPlayNext,
    setAutoPlayNext,
    hoverTime,
    setHoverTime,
    hoverPosition,
    setHoverPosition,
    showSettingsMenu,
    setShowSettingsMenu,
    showShortcutsModal,
    setShowShortcutsModal,
    actionFeedback,
    showEndedScreen,
    setShowEndedScreen,
    countdownSeconds,
    isDirectVideo,
    effectiveVideoUrl,
    resetControlsTimeout,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    seekRelative,
    seekToTime,
    handleSpeedChange,
    handleQualityChange,
    toggleFullscreen,
    togglePip,
    handleTimeUpdate,
    handleEnded,
    handleTimelineClick,
    handleTimelineMouseMove,
  } = useLessonVideoPlayer({
    lesson,
    courseId,
    hasNextLesson,
    onProgress,
    onLessonComplete,
    onTimeUpdate,
    onNextLesson,
    onDurationChange,
  })

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full overflow-hidden bg-black select-none group font-sans ${
        isTheater
          ? 'aspect-21/9 max-h-[85vh]'
          : isFullscreen
          ? 'w-screen h-screen'
          : 'aspect-video rounded-3xl shadow-2xl border border-border/80'
      }`}
    >
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {isDirectVideo ? (
          <video
            ref={videoRef}
            playsInline
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={() => {
              if (videoRef.current?.duration) {
                const dur = videoRef.current.duration
                setDuration(dur)
                onDurationChange?.(lesson.id, Math.round(dur))
              }
            }}
            onEnded={handleEnded}
            onWaiting={() => setIsBuffering(true)}
            onPlaying={() => setIsBuffering(false)}
          />
        ) : (
          <iframe
            src={
              effectiveVideoUrl.includes('watch?v=')
                ? effectiveVideoUrl.replace('watch?v=', 'embed/')
                : effectiveVideoUrl
            }
            title={lesson.title}
            className="w-full h-full aspect-video"
            allowFullScreen
          />
        )}

        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-white/20 border-t-[#ff0000]" />
          </div>
        )}

        {actionFeedback && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
            <div className="flex items-center gap-2 rounded-full bg-black/75 px-5 py-2.5 text-white shadow-2xl backdrop-blur-md animate-in zoom-in-75 duration-100">
              {actionFeedback.type === 'play' && (
                <Play size={20} className="fill-white" />
              )}
              {actionFeedback.type === 'pause' && (
                <Pause size={20} className="fill-white" />
              )}
              {actionFeedback.type === 'forward' && <FastForward size={20} />}
              {actionFeedback.type === 'rewind' && <Rewind size={20} />}
              <span className="text-sm font-bold">{actionFeedback.text}</span>
            </div>
          </div>
        )}

        {showEndedScreen && (
          <PlayerEndscreen
            hasNextLesson={hasNextLesson}
            autoPlayNext={autoPlayNext}
            countdownSeconds={countdownSeconds}
            onReplay={() => {
              setShowEndedScreen(false)
              seekToTime(0)
              videoRef.current?.play()
              setIsPlaying(true)
            }}
            onCancelAutoPlay={() => {
              if (countdownIntervalRef.current)
                clearInterval(countdownIntervalRef.current)
              setAutoPlayNext(false)
            }}
            onNextLesson={() => {
              if (countdownIntervalRef.current)
                clearInterval(countdownIntervalRef.current)
              setShowEndedScreen(false)
              onNextLesson?.()
            }}
          />
        )}
      </div>

      {isDirectVideo && (
        <PlayerControlsBar
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          bufferedPercent={bufferedPercent}
          volume={volume}
          isMuted={isMuted}
          playbackSpeed={playbackSpeed}
          selectedQuality={selectedQuality}
          autoResolvedQuality={autoResolvedQuality}
          effectiveQualityKey={effectiveQualityKey}
          isTheater={isTheater}
          isFullscreen={isFullscreen}
          autoPlayNext={autoPlayNext}
          showControls={showControls}
          showSettingsMenu={showSettingsMenu}
          hoverTime={hoverTime}
          hoverPosition={hoverPosition}
          isTrial={isTrial}
          hasNextLesson={hasNextLesson}
          hasPrevLesson={hasPrevLesson}
          progressBarRef={progressBarRef}
          onTogglePlay={togglePlay}
          onToggleMute={toggleMute}
          onVolumeChange={handleVolumeChange}
          onSeekRelative={seekRelative}
          onTimelineClick={handleTimelineClick}
          onTimelineMouseMove={handleTimelineMouseMove}
          onTimelineMouseLeave={() => {
            setHoverPosition(0)
            setHoverTime(null)
          }}
          onToggleSettings={() => setShowSettingsMenu(!showSettingsMenu)}
          onSpeedChange={handleSpeedChange}
          onQualityChange={handleQualityChange}
          onToggleAutoPlay={() => setAutoPlayNext(!autoPlayNext)}
          onToggleTheater={() => setIsTheater(!isTheater)}
          onToggleFullscreen={toggleFullscreen}
          onTogglePip={togglePip}
          onNextLesson={onNextLesson}
          onPrevLesson={onPrevLesson}
          onOpenShortcutsModal={() => setShowShortcutsModal(true)}
          onAddNoteAtTimestamp={() => onAddNoteAtTimestamp?.(currentTime)}
          onOpenCheckout={onOpenCheckout}
        />
      )}

      <PlayerShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  )
}
