/**
 * @file lesson.player.tsx
 * @description Thành phần Lesson Player phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file lesson.player.tsx
 * @description Trình phát video bài học phong cách YouTube cao cấp cho học viên LingoSphere
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Hls from 'hls.js'
import { Play, Pause, Rewind, FastForward } from 'lucide-react'
import type { Lesson } from '@/types/course'
import { isDirectVideoUrl } from './player/player.types'
import { PlayerControlsBar } from './player/player.controls.bar'
import { PlayerEndscreen } from './player/player.endscreen'
import { PlayerShortcutsModal } from './player/player.shortcuts.modal'

interface LessonPlayerProps {
  lesson: Lesson
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
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedPercent, setBufferedPercent] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [selectedQuality, setSelectedQuality] = useState<string>('auto')
  const [autoResolvedQuality] = useState<'1080p' | '720p' | '360p'>('1080p')
  const [isTheater, setIsTheater] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPipActive, setIsPipActive] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [autoPlayNext, setAutoPlayNext] = useState(true)

  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState<number>(0)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'forward' | 'rewind' | 'play' | 'pause' | 'speed' | 'volume'
    text?: string
  } | null>(null)
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [showEndedScreen, setShowEndedScreen] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(5)

  const baseVideoSource = useMemo(() => {
    return (lesson?.videoUrl || lesson?.content?.videoUrl || '').trim()
  }, [lesson])

  const isHlsStream = useMemo(() => {
    return Boolean(baseVideoSource && (baseVideoSource.includes('.m3u8') || baseVideoSource.includes('manifest')))
  }, [baseVideoSource])

  const effectiveQualityKey = selectedQuality === 'auto' ? autoResolvedQuality : selectedQuality
  const isDirectVideo = useMemo(() => isDirectVideoUrl(baseVideoSource), [baseVideoSource])

  const effectiveVideoUrl = useMemo(() => {
    if (!baseVideoSource) return ''
    let source = baseVideoSource
    const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/+$/, '')
    if (source.includes('pub-') || source.includes('r2.cloudflarestorage.com') || source.includes('.r2.dev')) {
      try {
        const parsed = new URL(source)
        source = `${apiBase}/media/stream${parsed.pathname}`
      } catch {}
    }
    if (isHlsStream) return source
    if (source.includes('/1080p/')) {
      if (effectiveQualityKey === '720p') return source.replace('/1080p/', '/720p/')
      if (effectiveQualityKey === '360p') return source.replace('/1080p/', '/360p/')
    }
    return source
  }, [baseVideoSource, effectiveQualityKey, isHlsStream])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !effectiveVideoUrl) return

    if (isHlsStream) {
      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy()
        const hls = new Hls({ capLevelToPlayerSize: false, autoStartLoad: true, startLevel: -1 })
        hlsRef.current = hls
        hls.loadSource(effectiveVideoUrl)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false)
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = effectiveVideoUrl
      }
    } else {
      video.src = effectiveVideoUrl
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [effectiveVideoUrl, isHlsStream])

  const triggerFeedback = useCallback((type: 'forward' | 'rewind' | 'play' | 'pause' | 'speed' | 'volume', text?: string) => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
    setActionFeedback({ type, text })
    feedbackTimeoutRef.current = setTimeout(() => setActionFeedback(null), 800)
  }, [])

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeoutRef.current) clearTimeout(hideControlsTimeoutRef.current)
    if (isPlaying) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        if (!showSettingsMenu) setShowControls(false)
      }, 3000)
    }
  }, [isPlaying, showSettingsMenu])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {})
      triggerFeedback('play')
    } else {
      video.pause()
      setIsPlaying(false)
      triggerFeedback('pause')
    }
    resetControlsTimeout()
  }, [triggerFeedback, resetControlsTimeout])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
    resetControlsTimeout()
  }, [resetControlsTimeout])

  const handleVolumeChange = useCallback((newVol: number) => {
    const video = videoRef.current
    if (!video) return
    const vol = Math.max(0, Math.min(1, newVol))
    video.volume = vol
    setVolume(vol)
    video.muted = vol === 0
    setIsMuted(vol === 0)
    resetControlsTimeout()
  }, [resetControlsTimeout])

  const seekRelative = useCallback((seconds: number) => {
    const video = videoRef.current
    if (!video) return
    const next = Math.max(0, Math.min(duration, video.currentTime + seconds))
    video.currentTime = next
    setCurrentTime(next)
    triggerFeedback(seconds > 0 ? 'forward' : 'rewind', `${seconds > 0 ? '+' : ''}${seconds}s`)
    resetControlsTimeout()
  }, [duration, triggerFeedback, resetControlsTimeout])

  const seekToTime = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    const next = Math.max(0, Math.min(duration, time))
    video.currentTime = next
    setCurrentTime(next)
    resetControlsTimeout()
  }, [duration, resetControlsTimeout])

  const handleSpeedChange = useCallback((speed: number) => {
    const video = videoRef.current
    if (!video) return
    video.playbackRate = speed
    setPlaybackSpeed(speed)
    setShowSettingsMenu(false)
    triggerFeedback('speed', `${speed}x`)
  }, [triggerFeedback])

  const handleQualityChange = useCallback((qKey: string) => {
    setSelectedQuality(qKey)
    setShowSettingsMenu(false)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }, [])

  const togglePip = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPipActive(false)
      } else if (document.pictureInPictureEnabled) {
        await video.requestPictureInPicture()
        setIsPipActive(true)
      }
    } catch {}
  }, [])

  const handleTimeUpdate = () => {
    const video = videoRef.current
    if (!video) return
    const cur = video.currentTime
    setCurrentTime(cur)
    onTimeUpdate?.(cur)

    if (duration > 0) {
      const prog = Math.round((cur / duration) * 100)
      onProgress?.(lesson.id, prog)
      if (prog >= 90) onLessonComplete?.(lesson.id)
    }

    if (video.buffered.length > 0 && duration > 0) {
      const end = video.buffered.end(video.buffered.length - 1)
      setBufferedPercent(Math.min(100, (end / duration) * 100))
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setShowEndedScreen(true)
    setCountdownSeconds(5)
    if (hasNextLesson && autoPlayNext) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
            setShowEndedScreen(false)
            onNextLesson?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const ratio = clickX / rect.width
    seekToTime(ratio * duration)
  }

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !duration) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const moveX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const ratio = moveX / rect.width
    setHoverPosition(ratio * 100)
    setHoverTime(ratio * duration)
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative w-full overflow-hidden bg-black select-none group font-sans ${
        isTheater ? 'aspect-21/9 max-h-[85vh]' : isFullscreen ? 'w-screen h-screen' : 'aspect-video rounded-3xl shadow-2xl border border-border/80'
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
            src={effectiveVideoUrl.includes('watch?v=') ? effectiveVideoUrl.replace('watch?v=', 'embed/') : effectiveVideoUrl}
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
              {actionFeedback.type === 'play' && <Play size={20} className="fill-white" />}
              {actionFeedback.type === 'pause' && <Pause size={20} className="fill-white" />}
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
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
              setAutoPlayNext(false)
            }}
            onNextLesson={() => {
              if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
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

      <PlayerShortcutsModal isOpen={showShortcutsModal} onClose={() => setShowShortcutsModal(false)} />
    </div>
  )
}
