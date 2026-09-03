'use client'

/**
 * @file LessonPlayer.tsx
 * @description Trình phát video bài học phong cách YouTube cao cấp cho học viên LingoSphere
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Tv,
  PictureInPicture2,
  Settings,
  Check,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  SkipBack,
  RotateCcw as ReplayIcon,
  Sparkles,
  Keyboard,
  X,
  SlidersHorizontal,
  FastForward,
  Rewind,
} from 'lucide-react'
import type { Lesson } from '@/types/course'

interface LessonPlayerProps {
  lesson: Lesson
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

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

const QUALITIES = [
  { id: 'auto', label: 'Tự động (Auto)', badge: 'Thích ứng' },
  { id: '1080p', label: '1080p (Full HD)', badge: 'HD' },
  { id: '720p', label: '720p (HD)', badge: 'HD' },
  { id: '480p', label: '480p (Tiêu chuẩn)' },
  { id: '360p', label: '360p (Tiết kiệm)' },
]

function detectNetworkQuality(): '1080p' | '720p' | '480p' | '360p' {
  if (typeof window === 'undefined') return '1080p'
  const nav = navigator as unknown as {
    connection?: {
      effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
      downlink?: number
      saveData?: boolean
    }
  }

  const conn = nav.connection
  if (!conn) return '1080p'
  if (conn.saveData) return '480p'
  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') return '360p'
  if (conn.effectiveType === '3g') return conn.downlink && conn.downlink < 0.4 ? '360p' : '720p'
  return '1080p'
}

function isDirectVideoUrl(url?: string): boolean {
  if (!url || !url.trim()) return false
  const clean = url.toLowerCase().trim()
  if (
    clean.endsWith('.jpg') ||
    clean.endsWith('.jpeg') ||
    clean.endsWith('.png') ||
    clean.endsWith('.webp') ||
    clean.endsWith('.svg') ||
    clean.endsWith('.gif') ||
    clean.includes('/course-thumbnails/')
  ) {
    return false
  }
  return true
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00'
  const totalSec = Math.floor(seconds)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`
  }
  return `${m}:${pad(s)}`
}

export function LessonPlayer({
  lesson,
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
  const [autoResolvedQuality, setAutoResolvedQuality] = useState<'1080p' | '720p' | '480p' | '360p'>('1080p')
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
  const [settingsSubmenu, setSettingsSubmenu] = useState<'main' | 'quality' | 'speed'>('main')
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

  const effectiveQualityKey = selectedQuality === 'auto' ? autoResolvedQuality : selectedQuality
  const isDirectVideo = useMemo(() => isDirectVideoUrl(baseVideoSource), [baseVideoSource])

  const effectiveVideoUrl = useMemo(() => {
    if (!baseVideoSource) return ''
    if (baseVideoSource.includes('.m3u8') || baseVideoSource.includes('manifest')) {
      return baseVideoSource
    }
    if (baseVideoSource.includes('r2.cloudflarestorage.com') || baseVideoSource.includes('pub-')) {
      if (effectiveQualityKey === '720p' && baseVideoSource.includes('/1080p/')) {
        return baseVideoSource.replace('/1080p/', '/720p/')
      }
      if (effectiveQualityKey === '480p' && baseVideoSource.includes('/1080p/')) {
        return baseVideoSource.replace('/1080p/', '/480p/')
      }
      if (effectiveQualityKey === '360p' && baseVideoSource.includes('/1080p/')) {
        return baseVideoSource.replace('/1080p/', '/360p/')
      }
    }
    return baseVideoSource
  }, [baseVideoSource, effectiveQualityKey])

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

  // 1. Play / Pause Toggle
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

  // 2. Seek Relative (+/- 5s)
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

  // 3. Volume & Mute control
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

  // 4. Playback Speed Change
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

  // 5. Resolution / Quality Change
  const handleQualityChange = useCallback(
    (qualityId: string) => {
      if (videoRef.current) {
        lastTimeBeforeSwitchRef.current = videoRef.current.currentTime
        wasPlayingBeforeSwitchRef.current = !videoRef.current.paused
      }
      setSelectedQuality(qualityId)
      setSettingsSubmenu('main')
      setShowSettingsMenu(false)
      const qObj = QUALITIES.find((q) => q.id === qualityId)
      const label = qualityId === 'auto' ? `Tự động (${autoResolvedQuality})` : (qObj?.label || qualityId.toUpperCase())
      triggerFeedback('speed', `Độ phân giải: ${label}`)
      if (qualityId === 'auto') {
        const detected = detectNetworkQuality()
        setAutoResolvedQuality(detected)
      }
    },
    [autoResolvedQuality, triggerFeedback]
  )

  // 6. Fullscreen & Native Event Listeners
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
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  // 7. Picture-in-Picture Toggle
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

  // 8. Auto-hide controls timer
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

  // 9. Interactive YouTube Scrubber (Click & Drag)
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

  // 10. Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.isContentEditable
      ) {
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

  // 11. End of Video & Auto-Next Countdown
  useEffect(() => {
    if (showEndedScreen && autoPlayNext && onNextLesson && hasNextLesson) {
      setCountdownSeconds(5)
      countdownIntervalRef.current = setInterval(() => {
        setCountdownSeconds((prev) => Math.max(0, prev - 1))
      }, 1000)
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [showEndedScreen, autoPlayNext, onNextLesson, hasNextLesson])

  useEffect(() => {
    if (showEndedScreen && autoPlayNext && countdownSeconds === 0 && onNextLesson && hasNextLesson) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      setShowEndedScreen(false)
      onNextLesson()
    }
  }, [showEndedScreen, autoPlayNext, countdownSeconds, onNextLesson, hasNextLesson])

  useEffect(() => {
    setShowEndedScreen(false)
    setCurrentTime(0)
    setShowSettingsMenu(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      const playPromise = videoRef.current.play()
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => setIsPlaying(false))
      }
    }
  }, [lesson?.id, baseVideoSource])

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0

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
          src={effectiveVideoUrl}
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
            onLessonComplete?.(lesson.id)
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

      {/* ⚡ 3. YouTube Center Ripple Feedback */}
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

      {/* 🏁 4. Next Lesson Countdown Screen */}
      {showEndedScreen && isDirectVideo && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/85 p-6 text-center text-white backdrop-blur-sm animate-in fade-in duration-200">
          <div className="space-y-4 max-w-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              <Sparkles size={14} />
              Đã hoàn thành bài học!
            </span>
            <h3 className="text-base font-bold text-white truncate">{lesson.title}</h3>

            {hasNextLesson && autoPlayNext ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-zinc-300">
                  Tự động chuyển bài tiếp theo sau{' '}
                  <span className="font-mono font-bold text-[#ff0000] text-sm">{countdownSeconds}s</span>...
                </p>
                <div className="flex items-center justify-center gap-2.5">
                  <button
                    onClick={() => {
                      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
                      setShowEndedScreen(false)
                      onNextLesson?.()
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-[#ff0000] hover:bg-[#cc0000] px-4 py-2 text-xs font-bold text-white shadow-lg transition-colors cursor-pointer"
                  >
                    <span>Bài tiếp theo</span>
                    <ChevronRight size={15} />
                  </button>
                  <button
                    onClick={() => {
                      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
                      setShowEndedScreen(false)
                      if (videoRef.current) {
                        videoRef.current.currentTime = 0
                        videoRef.current.play()
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-white/15 hover:bg-white/25 px-3.5 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    <ReplayIcon size={14} />
                    <span>Xem lại</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowEndedScreen(false)
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0
                    videoRef.current.play()
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-[#ff0000] hover:bg-[#cc0000] px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-colors cursor-pointer mx-auto"
              >
                <ReplayIcon size={15} />
                <span>Xem lại bài học</span>
              </button>
            )}
          </div>
        </div>
      )}

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
          {/* Quick Note Button */}
          {onAddNoteAtTimestamp && isDirectVideo && (
            <button
              onClick={() => onAddNoteAtTimestamp(currentTime)}
              className="flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-medium text-white transition-colors cursor-pointer"
              title="Thêm ghi chú tại thời điểm này (Phím N)"
            >
              <span>+ Ghi chú ({formatTime(currentTime)})</span>
            </button>
          )}

          {/* Keyboard Shortcuts Button */}
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
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-2 px-3 sm:px-4 transition-opacity duration-200 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* 6.1 YouTube Scrubber Progress Bar */}
          <div
            ref={progressBarRef}
            onMouseDown={handleTimelineMouseDown}
            onMouseMove={handleTimelineMouseMove}
            onMouseLeave={() => setHoverTime(null)}
            className="group/timeline relative w-full h-4 cursor-pointer flex items-center mb-1"
          >
            {/* Scrubber Track */}
            <div className="relative w-full h-[3px] group-hover/timeline:h-[5px] rounded-full bg-white/25 transition-all overflow-visible">
              {/* Buffer Progress */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-white/40 rounded-full transition-all"
                style={{ width: `${bufferedPercent}%` }}
              />

              {/* Played Progress (YouTube Red) */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-[#ff0000] rounded-full"
                style={{ width: `${playedPercent}%` }}
              />

              {/* Red Thumb Scrubber Ball */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-[#ff0000] shadow-md scale-0 group-hover/timeline:scale-100 transition-transform duration-100 pointer-events-none"
                style={{ left: `${playedPercent}%` }}
              />
            </div>

            {/* Hover Tooltip Timestamp */}
            {hoverTime !== null && (
              <div
                className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded bg-[#0f0f0f]/90 text-white font-mono text-[11px] font-semibold px-1.5 py-0.5 shadow-xl border border-white/10"
                style={{ left: `${hoverPosition}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* 6.2 YouTube Action Buttons Row */}
          <div className="flex items-center justify-between gap-3 text-white">
            {/* Left Controls: Prev, Play/Pause, Next, Volume, Time */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Prev Lesson */}
              {hasPrevLesson && (
                <button
                  onClick={onPrevLesson}
                  className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Bài học trước"
                >
                  <SkipBack size={18} />
                </button>
              )}

              {/* Play / Pause Toggle */}
              <button
                onClick={togglePlay}
                className="p-1.5 text-white hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                title={isPlaying ? 'Tạm dừng (k)' : 'Phát (k)'}
              >
                {isPlaying ? <Pause size={22} className="fill-white" /> : <Play size={22} className="fill-white ml-0.5" />}
              </button>

              {/* Next Lesson */}
              {hasNextLesson && (
                <button
                  onClick={onNextLesson}
                  className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title="Bài học tiếp theo"
                >
                  <SkipForward size={18} />
                </button>
              )}

              {/* YouTube-style Expanding Volume Bar */}
              <div className="group/vol flex items-center">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title={isMuted ? 'Bật âm thanh (m)' : 'Tắt tiếng (m)'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={20} />
                  ) : volume < 0.5 ? (
                    <Volume1 size={20} />
                  ) : (
                    <Volume2 size={20} />
                  )}
                </button>

                <div className="w-0 overflow-hidden group-hover/vol:w-16 transition-all duration-200 ease-out flex items-center ml-1">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/40 rounded-full appearance-none cursor-pointer accent-[#ff0000]"
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="text-[12px] font-normal text-white/90 select-none ml-2 tracking-normal">
                <span>{formatTime(currentTime)}</span>
                <span className="text-white/50 mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Autoplay, Settings, PiP, Theater, Fullscreen */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Autoplay Toggle Switch */}
              <button
                onClick={() => setAutoPlayNext(!autoPlayNext)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-xs"
                title={`Tự động chuyển bài: ${autoPlayNext ? 'Đang bật' : 'Đang tắt'}`}
              >
                <span className="text-[11px] font-medium text-white/80 hidden md:inline">Tự động phát</span>
                <div
                  className={`w-7 h-3.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                    autoPlayNext ? 'bg-[#ff0000]' : 'bg-white/30'
                  }`}
                >
                  <div
                    className={`w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                      autoPlayNext ? 'translate-x-3.5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>

              {/* Settings Gear & Popover */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettingsMenu(!showSettingsMenu)
                    setSettingsSubmenu('main')
                  }}
                  className={`p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative ${
                    showSettingsMenu ? 'rotate-45' : ''
                  }`}
                  title="Cài đặt (Tốc độ & Chất lượng)"
                >
                  <Settings size={18} />
                  {(effectiveQualityKey === '1080p' || effectiveQualityKey === '720p') && (
                    <span className="absolute -top-0.5 -right-0.5 bg-[#ff0000] text-white text-[8px] font-black px-1 rounded-sm leading-tight tracking-tighter shadow-sm pointer-events-none">
                      HD
                    </span>
                  )}
                </button>

                {showSettingsMenu && (
                  <div className="absolute bottom-full right-0 mb-3 min-w-[270px] w-max max-w-xs rounded-2xl bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
                    {settingsSubmenu === 'main' && (
                      <div className="space-y-1">
                        <button
                          onClick={() => setSettingsSubmenu('quality')}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer gap-4"
                        >
                          <span className="flex items-center gap-2.5 text-white/90 shrink-0 whitespace-nowrap">
                            <SlidersHorizontal size={15} className="text-[#ff0000]" />
                            <span className="font-semibold whitespace-nowrap">Chất lượng</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-white/60 shrink-0 whitespace-nowrap">
                            <span className="whitespace-nowrap">
                              {selectedQuality === 'auto'
                                ? `Tự động (${autoResolvedQuality})`
                                : selectedQuality.toUpperCase()}
                            </span>
                            <ChevronRight size={13} />
                          </span>
                        </button>

                        <button
                          onClick={() => setSettingsSubmenu('speed')}
                          className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer gap-4"
                        >
                          <span className="flex items-center gap-2.5 text-white/90 shrink-0 whitespace-nowrap">
                            <FastForward size={15} className="text-[#ff0000]" />
                            <span className="font-semibold whitespace-nowrap">Tốc độ phát</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-white/60 shrink-0 whitespace-nowrap">
                            <span className="whitespace-nowrap">{playbackSpeed === 1.0 ? 'Chuẩn' : `${playbackSpeed}x`}</span>
                            <ChevronRight size={13} />
                          </span>
                        </button>
                      </div>
                    )}

                    {settingsSubmenu === 'quality' && (
                      <div className="space-y-0.5">
                        <button
                          onClick={() => setSettingsSubmenu('main')}
                          className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white/70 hover:text-white border-b border-white/10 cursor-pointer mb-1 whitespace-nowrap"
                        >
                          <ChevronLeft size={14} />
                          <span className="whitespace-nowrap">Chất lượng video</span>
                        </button>
                        {QUALITIES.map((q) => {
                          const isSelected = selectedQuality === q.id
                          return (
                            <button
                              key={q.id}
                              onClick={() => handleQualityChange(q.id)}
                              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                                isSelected ? 'bg-white/15 text-white font-bold' : 'text-white/80 hover:bg-white/10'
                              }`}
                            >
                              <span className="flex items-center gap-2 whitespace-nowrap">
                                <span className="whitespace-nowrap">{q.id === 'auto' ? `Tự động (${autoResolvedQuality})` : q.label}</span>
                                {q.badge && (
                                  <span className="rounded bg-[#ff0000]/20 text-[#ff0000] px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap">
                                    {q.badge}
                                  </span>
                                )}
                              </span>
                              {isSelected && <Check size={13} className="text-[#ff0000] ml-3 shrink-0" />}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {settingsSubmenu === 'speed' && (
                      <div className="space-y-0.5">
                        <button
                          onClick={() => setSettingsSubmenu('main')}
                          className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white/70 hover:text-white border-b border-white/10 cursor-pointer mb-1 whitespace-nowrap"
                        >
                          <ChevronLeft size={14} />
                          <span className="whitespace-nowrap">Tốc độ phát lại</span>
                        </button>
                        {PLAYBACK_SPEEDS.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                              playbackSpeed === speed
                                ? 'bg-white/15 text-white font-bold'
                                : 'text-white/80 hover:bg-white/10'
                            }`}
                          >
                            <span className="whitespace-nowrap">{speed === 1.0 ? '1.0x (Chuẩn)' : `${speed}x`}</span>
                            {playbackSpeed === speed && <Check size={13} className="text-[#ff0000] ml-3 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PiP Button */}
              <button
                onClick={togglePip}
                className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Hình trong hình (p)"
              >
                <PictureInPicture2 size={18} />
              </button>

              {/* Theater Mode Toggle */}
              <button
                onClick={() => setIsTheater(!isTheater)}
                className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
                title="Chế độ rạp chiếu (t)"
              >
                <Tv size={18} />
              </button>

              {/* Fullscreen Toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title={isFullscreen ? 'Thoát toàn màn hình (f)' : 'Toàn màn hình (f)'}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⌨️ 7. Keyboard Shortcuts Modal */}
      {showShortcutsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-[#0f0f0f] border border-white/10 p-5 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Keyboard className="text-[#ff0000]" size={18} />
                <span>Phím tắt điều khiển Video</span>
              </h4>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { key: 'Space / K', desc: 'Phát / Tạm dừng' },
                { key: 'Mũi tên Trái / J', desc: 'Lùi 5 giây' },
                { key: 'Mũi tên Phải / L', desc: 'Tiến 5 giây' },
                { key: 'Mũi tên Lên / Xuống', desc: 'Tăng / Giảm âm lượng' },
                { key: 'M', desc: 'Tắt / Bật tiếng' },
                { key: 'F', desc: 'Toàn màn hình' },
                { key: 'T', desc: 'Chế độ rạp chiếu' },
                { key: 'P', desc: 'Hình trong hình (PiP)' },
                { key: 'N', desc: 'Tạo ghi chú nhanh' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5"
                >
                  <span className="text-zinc-300">{item.desc}</span>
                  <span className="font-mono font-bold text-[#ff0000] bg-[#ff0000]/10 px-1.5 py-0.5 rounded text-[11px]">
                    {item.key}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
