'use client'

/**
 * @file LessonPlayer.tsx
 * @description Trình phát video bài học phong cách YouTube cao cấp cho học viên LingoSphere
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Hls from 'hls.js'
import {
  Play,
  Pause,
  Sparkles,
  Keyboard,
  FastForward,
  Rewind,
} from 'lucide-react'
import type { Lesson } from '@/types/course'
import {
  PLAYBACK_SPEEDS,
  QUALITIES,
  detectNetworkQuality,
  isDirectVideoUrl,
  formatTime,
  PlayerControlsBar,
  PlayerEndscreen,
  PlayerShortcutsModal,
} from './player'

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
  const isDraggingTimelineRef = useRef<boolean>(false)

  // Player States
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedPercent, setBufferedPercent] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [selectedQuality, setSelectedQuality] = useState<string>('auto')
  const [autoResolvedQuality, setAutoResolvedQuality] = useState<'1080p' | '720p' | '360p'>('1080p')
  const [isTheater, setIsTheater] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [, setIsPipActive] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)
  const [autoPlayNext, setAutoPlayNext] = useState(true)

  // Hover Scrubber Tooltip
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState<number>(0)

  // Menus & Modals
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)

  // Center feedback indicator (YouTube play/pause/seek animation)
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'forward' | 'rewind' | 'play' | 'pause' | 'speed' | 'volume'
    text?: string
  } | null>(null)
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // End Screen State
  const [showEndedScreen, setShowEndedScreen] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(5)

  const lastTimeBeforeSwitchRef = useRef<number>(0)
  const wasPlayingBeforeSwitchRef = useRef<boolean>(false)

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
    if (isHlsStream) {
      return source
    }
    if (source.includes('/1080p/')) {
      if (effectiveQualityKey === '720p') {
        return source.replace('/1080p/', '/720p/')
      }
      if (effectiveQualityKey === '360p') {
        return source.replace('/1080p/', '/360p/')
      }
    }
    return source
  }, [baseVideoSource, effectiveQualityKey, isHlsStream])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !effectiveVideoUrl) return

    if (isHlsStream) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy()
        }
        const hls = new Hls({
          capLevelToPlayerSize: false,
          autoStartLoad: true,
          startLevel: -1,
        })
        hlsRef.current = hls

        hls.loadSource(effectiveVideoUrl)
        hls.attachMedia(video)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (selectedQuality === 'auto') {
            hls.currentLevel = -1
          } else {
            const targetIdx = hls.levels.findIndex((lvl) => `${lvl.height}p` === selectedQuality)
            if (targetIdx !== -1) {
              hls.currentLevel = targetIdx
            }
          }
          if (lastTimeBeforeSwitchRef.current > 0) {
            video.currentTime = lastTimeBeforeSwitchRef.current
            lastTimeBeforeSwitchRef.current = 0
          }
          video.play().catch(() => {})
        })

        hls.on(Hls.Events.LEVEL_SWITCHED, (_, data) => {
          const lvl = hls.levels[data.level]
          if (lvl) {
            setAutoResolvedQuality(`${lvl.height}p` as any)
          }
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = effectiveVideoUrl
        if (lastTimeBeforeSwitchRef.current > 0) {
          video.currentTime = lastTimeBeforeSwitchRef.current
          lastTimeBeforeSwitchRef.current = 0
        }
        video.play().catch(() => {})
      }
    } else {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      video.src = effectiveVideoUrl
      if (lastTimeBeforeSwitchRef.current > 0) {
        video.currentTime = lastTimeBeforeSwitchRef.current
        lastTimeBeforeSwitchRef.current = 0
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [effectiveVideoUrl, isHlsStream, selectedQuality])

  const triggerFeedback = useCallback(
    (type: 'forward' | 'rewind' | 'play' | 'pause' | 'speed' | 'volume', text?: string) => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      setActionFeedback({ type, text })
      feedbackTimeoutRef.current = setTimeout(() => {
        setActionFeedback(null)
      }, 550)
    },
    []
  )

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {})
      setIsPlaying(true)
      setShowEndedScreen(false)
      triggerFeedback('play')
    } else {
      videoRef.current.pause()
      setIsPlaying(false)
      triggerFeedback('pause')
    }
  }, [triggerFeedback])

  const seekRelative = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return
      const current = videoRef.current.currentTime
      const dur = videoRef.current.duration || 1
      const newTime = Math.max(0, Math.min(dur, current + seconds))
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
      if (seconds > 0) {
        triggerFeedback('forward', `+${seconds}s`)
      } else {
        triggerFeedback('rewind', `${seconds}s`)
      }
    },
    [triggerFeedback]
  )

  const handleVolumeChange = useCallback((newVolume: number) => {
    if (!videoRef.current) return
    const vol = Math.max(0, Math.min(1, newVolume))
    videoRef.current.volume = vol
    setVolume(vol)
    if (vol === 0) {
      videoRef.current.muted = true
      setIsMuted(true)
    } else {
      videoRef.current.muted = false
      setIsMuted(false)
    }
  }, [])

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return
    if (isMuted || volume === 0) {
      videoRef.current.muted = false
      setIsMuted(false)
      if (volume === 0) {
        videoRef.current.volume = 0.5
        setVolume(0.5)
      }
    } else {
      videoRef.current.muted = true
      setIsMuted(true)
    }
  }, [isMuted, volume])

  const handleSpeedChange = useCallback(
    (speed: number) => {
      if (!videoRef.current) return
      videoRef.current.playbackRate = speed
      setPlaybackSpeed(speed)
      setShowSettingsMenu(false)
      triggerFeedback('speed', `${speed}x`)
    },
    [triggerFeedback]
  )

  const handleQualityChange = useCallback(
    (qualityId: string) => {
      if (videoRef.current) {
        lastTimeBeforeSwitchRef.current = videoRef.current.currentTime
        wasPlayingBeforeSwitchRef.current = !videoRef.current.paused
      }
      setSelectedQuality(qualityId)
      setShowSettingsMenu(false)
      const qObj = QUALITIES.find((q) => q.id === qualityId)
      const label = qualityId === 'auto' ? `Tự động (${autoResolvedQuality})` : (qObj?.label || qualityId.toUpperCase())
      triggerFeedback('speed', `Độ phân giải: ${label}`)

      const hls = hlsRef.current
      if (hls && hls.levels && hls.levels.length > 0) {
        if (qualityId === 'auto') {
          hls.currentLevel = -1
        } else {
          const targetIdx = hls.levels.findIndex((lvl) => `${lvl.height}p` === qualityId)
          if (targetIdx !== -1) {
            hls.currentLevel = targetIdx
          }
        }
      } else if (qualityId === 'auto') {
        const detected = detectNetworkQuality()
        setAutoResolvedQuality(detected)
      }
    },
    [autoResolvedQuality, triggerFeedback]
  )

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const togglePip = useCallback(async () => {
    if (!videoRef.current) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPipActive(false)
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture()
        setIsPipActive(true)
      }
    } catch {}
  }, [])

  const handleUserActivity = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    if (isPlaying && !showSettingsMenu) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2500)
    }
  }, [isPlaying, showSettingsMenu])

  const seekToPosition = useCallback((clientX: number) => {
    if (!progressBarRef.current || !videoRef.current) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = percent * (videoRef.current.duration || 0)
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }, [])

  const handleTimelineMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      isDraggingTimelineRef.current = true
      seekToPosition(e.clientX)

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (isDraggingTimelineRef.current) {
          seekToPosition(moveEvent.clientX)
        }
      }

      const handleMouseUp = () => {
        isDraggingTimelineRef.current = false
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [seekToPosition]
  )

  const handleTimelineMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const hoverX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, hoverX / rect.width))
    const time = percent * (videoRef.current.duration || 0)
    setHoverTime(time)
    setHoverPosition(percent * 100)
  }, [])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
        return
      }

      if (/^[0-9]$/.test(e.key)) {
        if (!videoRef.current) return
        e.preventDefault()
        const digit = parseInt(e.key, 10)
        const percent = digit * 10
        const duration = videoRef.current.duration || 0
        if (duration > 0) {
          const targetTime = (percent / 100) * duration
          videoRef.current.currentTime = targetTime
          setCurrentTime(targetTime)
          triggerFeedback('forward', `${percent}%`)
        }
        return
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault()
          togglePlay()
          break
        case 'arrowleft':
        case 'j':
          e.preventDefault()
          seekRelative(-5)
          break
        case 'arrowright':
        case 'l':
          e.preventDefault()
          seekRelative(5)
          break
        case 'home':
          if (videoRef.current) {
            e.preventDefault()
            videoRef.current.currentTime = 0
            setCurrentTime(0)
            triggerFeedback('forward', '0%')
          }
          break
        case 'end':
          if (videoRef.current && videoRef.current.duration) {
            e.preventDefault()
            const endTarget = Math.max(0, videoRef.current.duration - 1)
            videoRef.current.currentTime = endTarget
            setCurrentTime(endTarget)
            triggerFeedback('forward', '100%')
          }
          break
        case 'arrowup':
          e.preventDefault()
          handleVolumeChange(volume + 0.05)
          triggerFeedback('volume', `${Math.round(Math.min(1, volume + 0.05) * 100)}%`)
          break
        case 'arrowdown':
          e.preventDefault()
          handleVolumeChange(volume - 0.05)
          triggerFeedback('volume', `${Math.round(Math.max(0, volume - 0.05) * 100)}%`)
          break
        case 'm':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
          e.preventDefault()
          toggleFullscreen()
          break
        case 't':
          e.preventDefault()
          setIsTheater((prev) => !prev)
          break
        case 'p':
          e.preventDefault()
          togglePip()
          break
        case 'n':
          if (onAddNoteAtTimestamp) {
            e.preventDefault()
            onAddNoteAtTimestamp(currentTime)
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [
    togglePlay,
    seekRelative,
    handleVolumeChange,
    volume,
    toggleMute,
    toggleFullscreen,
    togglePip,
    onAddNoteAtTimestamp,
    currentTime,
    triggerFeedback,
  ])

  useEffect(() => {
    if (!isTrial && showEndedScreen && autoPlayNext && onNextLesson && hasNextLesson) {
      setCountdownSeconds(5)
      countdownIntervalRef.current = setInterval(() => {
        setCountdownSeconds((prev) => Math.max(0, prev - 1))
      }, 1000)
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [isTrial, showEndedScreen, autoPlayNext, onNextLesson, hasNextLesson])

  useEffect(() => {
    if (!isTrial && showEndedScreen && autoPlayNext && countdownSeconds === 0 && onNextLesson && hasNextLesson) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      setShowEndedScreen(false)
      onNextLesson()
    }
  }, [isTrial, showEndedScreen, autoPlayNext, countdownSeconds, onNextLesson, hasNextLesson])

  useEffect(() => {
    setShowEndedScreen(false)
    setCurrentTime(0)
    setShowSettingsMenu(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
      }
    }
  }, [lesson?.id, baseVideoSource])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && !showSettingsMenu && setShowControls(false)}
      className={`group/player relative w-full shrink-0 bg-black overflow-hidden shadow-2xl transition-all select-none ${
        isFullscreen
          ? 'h-full w-full'
          : isTheater
          ? 'h-[540px] lg:h-[660px]'
          : 'aspect-video max-h-[calc(100vh-14rem)] min-h-[480px] sm:min-h-[540px] lg:min-h-[580px]'
      }`}
    >
      {/* 🎬 1. Video Layer */}
      {isDirectVideo ? (
        <video
          ref={videoRef}
          src={isHlsStream ? undefined : effectiveVideoUrl}
          autoPlay
          playsInline
          style={{
            filter:
              effectiveQualityKey === '1080p'
                ? 'contrast(1.02) saturate(1.04)'
                : effectiveQualityKey === '720p'
                ? 'none'
                : effectiveQualityKey === '480p'
                ? 'blur(0.35px) contrast(0.98)'
                : effectiveQualityKey === '360p'
                ? 'blur(0.7px) contrast(0.95)'
                : 'none',
          }}
          className="w-full h-full object-contain bg-black cursor-pointer transition-all duration-300"
          onClick={togglePlay}
          onDoubleClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const ratio = clickX / rect.width
            if (ratio < 0.35) {
              seekRelative(-5)
            } else if (ratio > 0.65) {
              seekRelative(5)
            } else {
              toggleFullscreen()
            }
          }}
          onPlay={() => {
            setIsPlaying(true)
            setShowEndedScreen(false)
          }}
          onPause={() => setIsPlaying(false)}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
          onCanPlay={(e) => {
            const playPromise = e.currentTarget.play()
            if (playPromise !== undefined) {
              playPromise.then(() => setIsPlaying(true)).catch(() => {})
            }
          }}
          onTimeUpdate={(e) => {
            const current = e.currentTarget.currentTime
            const dur = e.currentTarget.duration || 1
            setCurrentTime(current)
            setDuration(dur)
            onTimeUpdate?.(current)

            if (e.currentTarget.buffered.length > 0) {
              const bufferedEnd = e.currentTarget.buffered.end(e.currentTarget.buffered.length - 1)
              setBufferedPercent(Math.min(100, (bufferedEnd / dur) * 100))
            }

            if (dur > 0 && onProgress) {
              const progress = Math.min(100, Math.round((current / dur) * 100))
              onProgress(lesson.id, progress)
            }
          }}
          onLoadedMetadata={(e) => {
            const dur = e.currentTarget.duration || 0
            setDuration(dur)
            if (dur > 0 && onDurationChange) {
              onDurationChange(lesson.id, Math.round(dur))
            }
            if (lastTimeBeforeSwitchRef.current > 0) {
              e.currentTarget.currentTime = lastTimeBeforeSwitchRef.current
              lastTimeBeforeSwitchRef.current = 0
              if (wasPlayingBeforeSwitchRef.current) {
                e.currentTarget.play().catch(() => {})
              }
            } else {
              e.currentTarget.play().catch(() => {})
            }
          }}
          onEnded={() => {
            setIsPlaying(false)
            setShowEndedScreen(true)
            if (!isTrial) {
              onLessonComplete?.(lesson.id)
            }
          }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center space-y-3">
          <div className="h-16 w-16 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shadow-lg ring-1 ring-primary/30">
            <Play size={30} className="ml-1" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="text-sm font-bold text-white/90">{lesson?.title || 'Bài giảng Video'}</h3>
            <p className="text-xs text-zinc-400">
              Bài học này chưa có link video hoặc video đang được xử lý trên hệ thống.
            </p>
          </div>
        </div>
      )}

      {/* 🌀 2. Buffering Spinner */}
      {isBuffering && isDirectVideo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-white/20 border-t-[#ff0000]" />
        </div>
      )}

      {/* ⚡ 3. YouTube Center Feedback */}
      {actionFeedback && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
          <div className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-black/80 text-white backdrop-blur-md shadow-2xl animate-out fade-out zoom-out duration-500 font-semibold text-xs sm:text-sm border border-white/10">
            {actionFeedback.type === 'play' && <Play className="w-7 h-7 fill-white ml-0.5" />}
            {actionFeedback.type === 'pause' && <Pause className="w-7 h-7 fill-white" />}
            {actionFeedback.type === 'forward' && <FastForward className="w-7 h-7 text-white" />}
            {actionFeedback.type === 'rewind' && <Rewind className="w-7 h-7 text-white" />}
            {actionFeedback.text && <span>{actionFeedback.text}</span>}
          </div>
        </div>
      )}

      {/* 4. End Screen Overlay */}
      <PlayerEndscreen
        showEndedScreen={showEndedScreen && isDirectVideo}
        isTrial={isTrial}
        lessonTitle={lesson?.title || ''}
        hasNextLesson={hasNextLesson}
        autoPlayNext={autoPlayNext}
        countdownSeconds={countdownSeconds}
        onOpenCheckout={onOpenCheckout}
        onNextLesson={onNextLesson}
        onReplay={() => {
          setShowEndedScreen(false)
          if (videoRef.current) {
            videoRef.current.currentTime = 0
            videoRef.current.play()
          }
        }}
        onStopAutoPlay={() => {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
          setAutoPlayNext(false)
        }}
        onDismissScreen={() => setShowEndedScreen(false)}
      />

      {/* 🎛️ 5. Top Bar (Title + Quick Actions) */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 via-black/30 to-transparent transition-opacity duration-200 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate max-w-lg">
          <span className="text-xs sm:text-sm font-semibold text-white/95 truncate drop-shadow-md">
            {lesson?.title || 'LingoSphere Learning'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onAddNoteAtTimestamp && isDirectVideo && (
            <button
              onClick={() => onAddNoteAtTimestamp(currentTime)}
              className="flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-medium text-white transition-colors cursor-pointer"
              title="Thêm ghi chú tại thời điểm này (Phím N)"
            >
              <span>+ Ghi chú ({formatTime(currentTime)})</span>
            </button>
          )}

          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Phím tắt điều khiển"
          >
            <Keyboard size={15} />
          </button>
        </div>
      </div>

      {/* 🎛️ 6. YouTube Bottom Controls Bar */}
      {isDirectVideo && (
        <PlayerControlsBar
          showControls={showControls}
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
          showSettingsMenu={showSettingsMenu}
          isTheater={isTheater}
          isFullscreen={isFullscreen}
          autoPlayNext={autoPlayNext}
          hasPrevLesson={hasPrevLesson}
          hasNextLesson={hasNextLesson}
          hoverTime={hoverTime}
          hoverPosition={hoverPosition}
          progressBarRef={progressBarRef}
          onTimelineMouseDown={handleTimelineMouseDown}
          onTimelineMouseMove={handleTimelineMouseMove}
          onTimelineMouseLeave={() => setHoverTime(null)}
          onTogglePlay={togglePlay}
          onPrevLesson={onPrevLesson}
          onNextLesson={onNextLesson}
          onToggleMute={toggleMute}
          onVolumeChange={handleVolumeChange}
          onToggleAutoPlay={() => setAutoPlayNext(!autoPlayNext)}
          onToggleSettingsMenu={() => setShowSettingsMenu(!showSettingsMenu)}
          onSpeedChange={handleSpeedChange}
          onQualityChange={handleQualityChange}
          onTogglePip={togglePip}
          onToggleTheater={() => setIsTheater((prev) => !prev)}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {/* ⌨️ 7. Keyboard Shortcuts Modal */}
      <PlayerShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </div>
  )
}
