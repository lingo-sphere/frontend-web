// Trình phát video bài học phong cách YouTube cao cấp cho học viên LingoSphere.
'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Rewind, FastForward, Tv, Maximize2 } from 'lucide-react'
import type { Lesson } from '@/features/courses/types/course'
import { PlayerControlsBar } from '@/features/courses/components/player.controls.bar'
import { PlayerEndscreen } from '@/features/courses/components/player.endscreen'
import { PlayerShortcutsModal } from '@/features/courses/components/player.shortcuts.modal'
import { useCourseMiniPlayerStore, courseMiniPlayerStore } from '@/features/courses/store/course.mini.player.store'
import { useLessonVideoPlayer } from '@/features/courses/hooks/use.lesson.video.player'

interface LessonPlayerProps {
  lesson: Lesson
  courseId?: string
  courseTitle?: string
  courseThumbnail?: string
  isTrial?: boolean
  activeTab?: string
  activeSidebarTab?: string
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
  courseTitle,
  courseThumbnail,
  isTrial = false,
  activeTab,
  activeSidebarTab,
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
  const isMiniPlayer = useCourseMiniPlayerStore(
    (s) => s.isOpen && s.lesson?.id === lesson.id && s.courseId === (courseId || '')
  )

  useEffect(() => {
    const handleNext = () => onNextLesson?.()
    const handlePrev = () => onPrevLesson?.()
    window.addEventListener('lingosphere:course-next-lesson', handleNext)
    window.addEventListener('lingosphere:course-prev-lesson', handlePrev)
    return () => {
      window.removeEventListener('lingosphere:course-next-lesson', handleNext)
      window.removeEventListener('lingosphere:course-prev-lesson', handlePrev)
    }
  }, [onNextLesson, onPrevLesson])
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
    <>
      {isMiniPlayer && (
        <div className="relative w-full aspect-video rounded-3xl bg-slate-900/90 border border-border/80 flex flex-col items-center justify-center p-6 text-center shadow-xl">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary mb-3 shadow-inner">
            <Tv size={28} />
          </div>
          <h4 className="text-base font-bold text-white mb-1">
            Bài giảng đang phát ở chế độ thu nhỏ
          </h4>
          <p className="text-xs text-white/60 max-w-sm mb-4">
            Bạn có thể tự do đọc tài liệu, ghi chú hoặc làm bài tập trong khi video vẫn tiếp tục phát ở góc màn hình.
          </p>
          <button
            type="button"
            onClick={() => {
              const currentMiniTime = courseMiniPlayerStore.getState().currentTime
              const wasPlaying = courseMiniPlayerStore.getState().isPlaying
              courseMiniPlayerStore.getState().closeMiniPlayer()
              seekToTime(currentMiniTime)
              if (wasPlaying) {
                videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {})
              } else {
                videoRef.current?.pause()
                setIsPlaying(false)
              }
              if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-lg cursor-pointer transition-all active:scale-95"
          >
            <Maximize2 size={14} />
            <span>Phóng to bài giảng trở lại</span>
          </button>
        </div>
      )}

      <div
        ref={containerRef}
        onMouseMove={resetControlsTimeout}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className={
          isMiniPlayer
            ? 'absolute -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none overflow-hidden'
            : `relative w-full overflow-hidden bg-black select-none group font-sans ${
                isTheater
                  ? 'aspect-21/9 max-h-[85vh]'
                  : isFullscreen
                  ? 'w-screen h-screen'
                  : 'aspect-video rounded-3xl shadow-2xl border border-border/80'
              }`
        }
        onContextMenu={(e) => e.preventDefault()}
      >
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {isDirectVideo && effectiveVideoUrl ? (
          <video
            ref={videoRef}
            playsInline
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
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
        ) : effectiveVideoUrl ? (
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
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-full text-white/70 space-y-3 p-6 text-center select-none">
            <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white/50 backdrop-blur-sm border border-white/10">
              <Play size={24} className="ml-0.5 opacity-50" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h4 className="text-sm font-bold text-white">{lesson.title}</h4>
              <p className="text-xs text-white/60">
                Bài giảng đang chuẩn bị nội dung video hoặc sử dụng tài liệu lý thuyết đính kèm bên dưới.
              </p>
            </div>
          </div>
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

      {isDirectVideo && Boolean(effectiveVideoUrl) && (
        <PlayerControlsBar
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          bufferedPercent={bufferedPercent}
          volume={volume}
          isMuted={isMuted}
          playbackSpeed={playbackSpeed}
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
          onToggleAutoPlay={() => setAutoPlayNext(!autoPlayNext)}
          onToggleTheater={() => setIsTheater(!isTheater)}
          onToggleFullscreen={toggleFullscreen}
          onTogglePip={togglePip}
          onToggleMiniPlayer={() => {
            if (isMiniPlayer) {
              const currentMiniTime = courseMiniPlayerStore.getState().currentTime
              const wasPlaying = courseMiniPlayerStore.getState().isPlaying
              courseMiniPlayerStore.getState().closeMiniPlayer()
              seekToTime(currentMiniTime)
              if (wasPlaying) {
                videoRef.current?.play().then(() => setIsPlaying(true)).catch(() => {})
              } else {
                videoRef.current?.pause()
                setIsPlaying(false)
              }
            } else {
              const wasPlaying = Boolean(videoRef.current && !videoRef.current.paused && isPlaying)
              videoRef.current?.pause()
              setIsPlaying(false)
              courseMiniPlayerStore.getState().openMiniPlayer({
                lesson,
                courseId: courseId || '',
                courseTitle: courseTitle || '',
                courseThumbnail: courseThumbnail || '',
                effectiveVideoUrl: effectiveVideoUrl || '',
                currentTime,
                duration,
                isPlaying: wasPlaying,
                volume,
                isMuted,
                hasNextLesson,
                hasPrevLesson,
              })
            }
          }}
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
  </>
  )
}
