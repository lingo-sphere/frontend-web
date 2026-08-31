'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
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
  FastForward,
  Rewind,
  Sparkles,
  Keyboard,
  X,
  RotateCcw as ReplayIcon,
  Sliders,
  SlidersHorizontal,
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
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0]

const QUALITIES = [
  { id: 'auto', label: 'Tự động (Auto)', badge: 'Thích ứng' },
  { id: '1080p', label: '1080p (Full HD)', badge: 'HD' },
  { id: '720p', label: '720p (HD)', badge: 'HD' },
  { id: '480p', label: '480p (Tiêu chuẩn - Tiết kiệm 3G)' },
  { id: '360p', label: '360p (Mạng yếu 2G/3G)' },
]

function detectNetworkQuality(): '1080p' | '720p' | '480p' | '360p' {
  if (typeof window === 'undefined') return '720p'
  const nav = navigator as unknown as {
    connection?: {
      effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
      downlink?: number
      saveData?: boolean
      addEventListener?: (type: string, listener: () => void) => void
      removeEventListener?: (type: string, listener: () => void) => void
    }
  }

  const conn = nav.connection
  if (!conn) return '720p'

  if (conn.saveData) return '360p'

  if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
    return '360p'
  }
  if (conn.effectiveType === '3g') {
    return conn.downlink && conn.downlink < 0.8 ? '360p' : '480p'
  }
  if (conn.downlink && conn.downlink < 1.5) {
    return '480p'
  }
  if (conn.downlink && conn.downlink < 4.0) {
    return '720p'
  }
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
}: LessonPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const bufferStallCountRef = useRef<number>(0)

  // Player States
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedPercent, setBufferedPercent] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [selectedQuality, setSelectedQuality] = useState<string>('auto')
  const [autoResolvedQuality, setAutoResolvedQuality] = useState<'1080p' | '720p' | '480p' | '360p'>('720p')
  const [isTheater, setIsTheater] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPipActive, setIsPipActive] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isBuffering, setIsBuffering] = useState(false)

  // Auto detect network quality (3G, 4G, WiFi, Data Saver)
  useEffect(() => {
    const updateNetworkQuality = () => {
      const detected = detectNetworkQuality()
      setAutoResolvedQuality(detected)
    }
    updateNetworkQuality()

    const nav = navigator as unknown as {
      connection?: {
        addEventListener?: (type: string, listener: () => void) => void
        removeEventListener?: (type: string, listener: () => void) => void
      }
    }
    const conn = nav.connection
    if (conn?.addEventListener) {
      conn.addEventListener('change', updateNetworkQuality)
      return () => {
        conn.removeEventListener?.('change', updateNetworkQuality)
      }
    }
  }, [])

  // Hover Scrubber Tooltip
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState<number>(0)

  // Popups & Overlays
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showSettingsMenu, setShowSettingsMenu] = useState(false)
  const [settingsSubmenu, setSettingsSubmenu] = useState<'main' | 'quality' | 'speed'>('main')
  const [showShortcutsModal, setShowShortcutsModal] = useState(false)
  const [autoPlayNext, setAutoPlayNext] = useState(true)

  // Ripple feedback animations
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'forward' | 'rewind' | 'play' | 'pause' | 'speed' | 'volume' | 'quality'
    text?: string
  } | null>(null)

  // End Screen State
  const [showEndedScreen, setShowEndedScreen] = useState(false)
  const [countdownSeconds, setCountdownSeconds] = useState(5)

  const lastTimeBeforeSwitchRef = useRef<number>(0)
  const wasPlayingBeforeSwitchRef = useRef<boolean>(false)

  const baseVideoSource = useMemo(() => {
    return (lesson?.videoUrl || lesson?.content?.videoUrl || '').trim()
  }, [lesson])

  const effectiveQualityKey = selectedQuality === 'auto' ? autoResolvedQuality : selectedQuality

  const effectiveVideoUrl = useMemo(() => {
    if (!baseVideoSource) return ''
    if (lesson?.qualities && lesson.qualities[effectiveQualityKey]) {
      return lesson.qualities[effectiveQualityKey]
    }
    if (
      effectiveQualityKey !== '1080p' &&
      isDirectVideoUrl(baseVideoSource) &&
      baseVideoSource.includes('.r2.dev')
    ) {
      const base = baseVideoSource.replace(/\.[^/.]+$/, '')
      return `${base}_${effectiveQualityKey}.mp4`
    }
    return baseVideoSource
  }, [baseVideoSource, lesson?.qualities, effectiveQualityKey])

  const isDirectVideo = isDirectVideoUrl(effectiveVideoUrl || baseVideoSource)

  const triggerFeedback = useCallback(
    (type: 'forward' | 'rewind' | 'play' | 'pause' | 'speed' | 'volume' | 'quality', text?: string) => {
      setActionFeedback({ type, text })
      setTimeout(() => {
        setActionFeedback(null)
      }, 700)
    },
    []
  )

  // 1. Play / Pause Toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return
    if (showEndedScreen) {
      setShowEndedScreen(false)
      videoRef.current.currentTime = 0
      videoRef.current.play()
      return
    }

    if (videoRef.current.paused || videoRef.current.ended) {
      videoRef.current.play()
      triggerFeedback('play')
    } else {
      videoRef.current.pause()
      triggerFeedback('pause')
    }
  }, [showEndedScreen, triggerFeedback])

  // 2. Seek forwards / backwards by seconds
  const seekRelative = useCallback(
    (seconds: number) => {
      if (!videoRef.current) return
      const newTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds))
      videoRef.current.currentTime = newTime
      triggerFeedback(seconds > 0 ? 'forward' : 'rewind', `${Math.abs(seconds)}s`)
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
      setShowSpeedMenu(false)
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
      if (qualityId === 'auto') {
        const detected = detectNetworkQuality()
        setAutoResolvedQuality(detected)
        triggerFeedback('quality', `Tự động (${detected})`)
      } else {
        const match = QUALITIES.find((q) => q.id === qualityId)
        triggerFeedback('quality', match ? match.id.toUpperCase() : qualityId)
      }
    },
    [triggerFeedback]
  )

  // 6. Fullscreen Toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
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
    } catch {
      // Browser does not support PiP or blocked
    }
  }, [])

  // 8. Auto-hide controls timer on inactivity
  const handleUserActivity = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeoutRef.current) {
      clearTimeout(hideControlsTimeoutRef.current)
    }
    if (isPlaying && !showSpeedMenu && !showSettingsMenu) {
      hideControlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2600)
    }
  }, [isPlaying, showSpeedMenu, showSettingsMenu])

  // 9. Timeline Drag & Click Scrubbing
  const handleTimelineScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = percent * (videoRef.current.duration || 0)
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }, [])

  const handleTimelineMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current) return
    const rect = progressBarRef.current.getBoundingClientRect()
    const hoverX = e.clientX - rect.left
    const percent = Math.max(0, Math.min(1, hoverX / rect.width))
    const time = percent * (videoRef.current.duration || 0)
    setHoverTime(time)
    setHoverPosition(percent * 100)
  }, [])

  // 10. Keyboard Shortcuts Listener
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
          triggerFeedback('volume', `${Math.round((volume + 0.05) * 100)}%`)
          break
        case 'arrowdown':
          e.preventDefault()
          handleVolumeChange(volume - 0.05)
          triggerFeedback('volume', `${Math.round((volume - 0.05) * 100)}%`)
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
        case '>':
        case '.':
          if (e.shiftKey) {
            e.preventDefault()
            const currIdx = PLAYBACK_SPEEDS.indexOf(playbackSpeed)
            if (currIdx < PLAYBACK_SPEEDS.length - 1) {
              handleSpeedChange(PLAYBACK_SPEEDS[currIdx + 1])
            }
          }
          break
        case '<':
        case ',':
          if (e.shiftKey) {
            e.preventDefault()
            const currIdx = PLAYBACK_SPEEDS.indexOf(playbackSpeed)
            if (currIdx > 0) {
              handleSpeedChange(PLAYBACK_SPEEDS[currIdx - 1])
            }
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
    playbackSpeed,
    handleSpeedChange,
    triggerFeedback,
  ])

  // 11. Handle End of Video & Countdown
  useEffect(() => {
    if (showEndedScreen && autoPlayNext && onNextLesson && hasNextLesson) {
      setCountdownSeconds(5)
      countdownIntervalRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
            setShowEndedScreen(false)
            onNextLesson()
            return 5
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [showEndedScreen, autoPlayNext, onNextLesson, hasNextLesson])

  // Reset states when lesson changes
  useEffect(() => {
    setShowEndedScreen(false)
    setIsPlaying(false)
    setCurrentTime(0)
    setShowSettingsMenu(false)
    setShowSpeedMenu(false)
    if (videoRef.current) {
      videoRef.current.currentTime = 0
    }
  }, [lesson?.id, baseVideoSource])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleUserActivity}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && !showSettingsMenu && !showSpeedMenu && setShowControls(false)}
      className={`group relative w-full shrink-0 bg-black overflow-hidden shadow-2xl transition-all select-none ${
        isFullscreen
          ? 'h-screen w-screen'
          : isTheater
          ? 'h-[560px] lg:h-[680px]'
          : 'h-[320px] sm:h-[400px] md:h-[480px] lg:h-[520px] xl:h-[560px]'
      }`}
    >
      {/* 🎬 1. Video Render Layer */}
      {isDirectVideo ? (
        <video
          ref={videoRef}
          src={effectiveVideoUrl}
          playsInline
          className="w-full h-full object-contain bg-black cursor-pointer"
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
          onWaiting={() => {
            setIsBuffering(true)
            if (selectedQuality === 'auto') {
              bufferStallCountRef.current += 1
              if (bufferStallCountRef.current >= 2) {
                setAutoResolvedQuality((prev) => {
                  if (prev === '1080p') return '720p'
                  if (prev === '720p') return '480p'
                  if (prev === '480p') return '360p'
                  return prev
                })
                bufferStallCountRef.current = 0
              }
            }
          }}
          onPlaying={() => {
            setIsBuffering(false)
            bufferStallCountRef.current = 0
          }}
          onError={() => {
            // If a specific quality rendition fails or is not available, fallback to 1080p
            if (selectedQuality !== '1080p' && selectedQuality !== 'auto') {
              setSelectedQuality('1080p')
            }
          }}
          onTimeUpdate={(e) => {
            const current = e.currentTarget.currentTime
            const dur = e.currentTarget.duration || 1
            setCurrentTime(current)
            setDuration(dur)
            onTimeUpdate?.(current)

            // Buffer percentage calculation
            if (e.currentTarget.buffered.length > 0) {
              const bufferedEnd = e.currentTarget.buffered.end(e.currentTarget.buffered.length - 1)
              setBufferedPercent(Math.min(100, (bufferedEnd / dur) * 100))
            }

            // Report progress to parent
            if (dur > 0 && onProgress) {
              const progress = Math.min(100, Math.round((current / dur) * 100))
              onProgress(lesson.id, progress)
            }
          }}
          onLoadedMetadata={(e) => {
            setDuration(e.currentTarget.duration || 0)
            if (lastTimeBeforeSwitchRef.current > 0) {
              e.currentTarget.currentTime = lastTimeBeforeSwitchRef.current
              lastTimeBeforeSwitchRef.current = 0
              if (wasPlayingBeforeSwitchRef.current) {
                e.currentTarget.play().catch(() => {})
              }
            }
          }}
          onEnded={() => {
            setIsPlaying(false)
            setShowEndedScreen(true)
            onLessonComplete?.(lesson.id)
          }}
        />
      ) : (
        /* Empty / Placeholder State */
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center space-y-4">
          <div className="h-16 w-16 rounded-3xl bg-primary/20 text-primary flex items-center justify-center shadow-lg ring-1 ring-primary/30 animate-pulse">
            <Play size={32} className="ml-1" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base font-bold text-white/95">
              {lesson?.title || 'Bài giảng Video'}
            </h3>
            <p className="text-xs text-white/60">
              Bài học này chưa có link video hoặc video đang được xử lý trên hệ thống Cloudflare R2.
            </p>
          </div>
        </div>
      )}

      {/* 🌀 2. Buffering Spinner Overlay */}
      {isBuffering && isDirectVideo && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs">
          <div className="h-14 w-14 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-2xl" />
        </div>
      )}

      {/* ⚡ 3. Ripple & Gesture Feedback Overlay */}
      {actionFeedback && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-black/80 px-6 py-4 backdrop-blur-md shadow-2xl animate-in zoom-in-75 fade-in duration-200 border border-white/10 text-white">
            {actionFeedback.type === 'play' && <Play className="w-8 h-8 fill-white" />}
            {actionFeedback.type === 'pause' && <Pause className="w-8 h-8 fill-white" />}
            {actionFeedback.type === 'forward' && <FastForward className="w-8 h-8 text-primary" />}
            {actionFeedback.type === 'rewind' && <Rewind className="w-8 h-8 text-primary" />}
            {actionFeedback.text && (
              <span className="text-xs font-mono font-bold tracking-wider">{actionFeedback.text}</span>
            )}
          </div>
        </div>
      )}

      {/* 🏁 4. Udemy-Style End Screen (Countdown to Next Lesson) */}
      {showEndedScreen && isDirectVideo && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/90 p-6 text-center text-white backdrop-blur-md animate-in fade-in duration-300">
          <div className="space-y-4 max-w-md">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              <Sparkles size={14} />
              Đã hoàn thành bài học!
            </span>

            <h3 className="text-lg font-bold text-white truncate">{lesson.title}</h3>

            {hasNextLesson && autoPlayNext ? (
              <div className="space-y-3 pt-2">
                <p className="text-xs text-white/70">
                  Tự động chuyển bài học tiếp theo sau{' '}
                  <span className="font-mono font-bold text-primary text-sm">{countdownSeconds}s</span>...
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
                      setShowEndedScreen(false)
                      onNextLesson?.()
                    }}
                    className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-primary-hover transition-all cursor-pointer"
                  >
                    <span>Phát bài tiếp theo ngay</span>
                    <ChevronRight size={16} />
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
                    className="flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-bold text-white/90 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <ReplayIcon size={14} />
                    <span>Xem lại</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setShowEndedScreen(false)
                    if (videoRef.current) {
                      videoRef.current.currentTime = 0
                      videoRef.current.play()
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-primary-hover transition-all cursor-pointer mx-auto"
                >
                  <ReplayIcon size={16} />
                  <span>Xem lại bài học</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🎛️ 5. Top Bar Controls (Title + Theater + Shortcuts button) */}
      <div
        className={`absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 truncate max-w-lg">
          <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-bold text-white/90 truncate drop-shadow-md">
            {lesson?.title || 'LingoSphere Learning'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Resolution Pill */}
          {isDirectVideo && (
            <span className="rounded-md bg-white/15 px-2 py-0.5 text-[10px] font-mono font-bold text-white/90 border border-white/20">
              {selectedQuality.toUpperCase()}
            </span>
          )}

          {/* Quick Note at Timestamp Button */}
          {onAddNoteAtTimestamp && isDirectVideo && (
            <button
              onClick={() => onAddNoteAtTimestamp(currentTime)}
              className="flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white shadow-lg hover:bg-primary transition-colors border border-white/15 cursor-pointer"
              title="Thêm ghi chú tại thời điểm này"
            >
              <span>+ Ghi chú ({formatTime(currentTime)})</span>
            </button>
          )}

          {/* Keyboard Shortcuts Help */}
          <button
            onClick={() => setShowShortcutsModal(true)}
            className="p-2 rounded-lg bg-black/60 backdrop-blur-md text-white/80 hover:text-white hover:bg-white/20 transition-colors border border-white/15 cursor-pointer"
            title="Phím tắt điều khiển"
          >
            <Keyboard size={14} />
          </button>

          {/* Theater Mode Toggle */}
          <button
            onClick={() => setIsTheater(!isTheater)}
            className="flex items-center gap-1.5 rounded-lg bg-black/60 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold text-white shadow-lg hover:bg-primary transition-colors border border-white/15 cursor-pointer"
            title="Chế độ rạp chiếu"
          >
            <Tv size={14} />
            <span className="hidden sm:inline">{isTheater ? 'Thu nhỏ' : 'Rạp chiếu'}</span>
          </button>
        </div>
      </div>

      {/* 🎛️ 6. Bottom Udemy Control Bar (Custom HTML5 Player Engine) */}
      {isDirectVideo && (
        <div
          className={`absolute bottom-0 left-0 right-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/70 to-transparent pt-8 pb-3 px-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* 6.1 Interactive Custom Timeline Scrubber */}
          <div
            ref={progressBarRef}
            onClick={handleTimelineScrub}
            onMouseMove={handleTimelineMouseMove}
            onMouseLeave={() => setHoverTime(null)}
            className="group/timeline relative w-full h-3 cursor-pointer flex items-center"
          >
            {/* Scrubber Track Background */}
            <div className="relative w-full h-1 group-hover/timeline:h-2 rounded-full bg-white/20 transition-all overflow-hidden">
              {/* Buffered Progress */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-white/30 transition-all"
                style={{ width: `${bufferedPercent}%` }}
              />
              {/* Played Progress Gradient */}
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-primary to-indigo-400"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Scrubber Thumb Glow Circle */}
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-lg ring-2 ring-primary scale-0 group-hover/timeline:scale-100 transition-transform pointer-events-none"
              style={{ left: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />

            {/* Hover Timestamp Tooltip */}
            {hoverTime !== null && (
              <div
                className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded-md bg-slate-900 border border-white/20 px-2 py-0.5 text-[10px] font-mono font-bold text-white shadow-xl"
                style={{ left: `${hoverPosition}%` }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* 6.2 Control Buttons Bar */}
          <div className="flex items-center justify-between gap-4 mt-2">
            {/* Left Controls (Play, Tua, Prev/Next, Clock) */}
            <div className="flex items-center gap-3">
              {/* Prev Lesson Button */}
              {hasPrevLesson && (
                <button
                  onClick={onPrevLesson}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Bài học trước"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {/* Play / Pause Toggle Button */}
              <button
                onClick={togglePlay}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black hover:scale-105 hover:bg-white/90 transition-all shadow-md cursor-pointer"
                title={isPlaying ? 'Tạm dừng (Space / K)' : 'Phát (Space / K)'}
              >
                {isPlaying ? <Pause size={18} className="fill-black" /> : <Play size={18} className="fill-black ml-0.5" />}
              </button>

              {/* Rewind 5s */}
              <button
                onClick={() => seekRelative(-5)}
                className="flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer relative"
                title="Lùi 5 giây (J / Mũi tên trái)"
              >
                <RotateCcw size={19} />
                <span className="absolute text-[8px] font-bold top-[6px]">5</span>
              </button>

              {/* Fast Forward 5s */}
              <button
                onClick={() => seekRelative(5)}
                className="flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer relative"
                title="Tua tới 5 giây (L / Mũi tên phải)"
              >
                <RotateCw size={19} />
                <span className="absolute text-[8px] font-bold top-[6px]">5</span>
              </button>

              {/* Next Lesson Button */}
              {hasNextLesson && (
                <button
                  onClick={onNextLesson}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                  title="Bài học tiếp theo"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              {/* Volume Controller with Hover Slider */}
              <div className="group/volume flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Bật âm thanh (M)' : 'Tắt tiếng (M)'}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={20} />
                  ) : volume < 0.5 ? (
                    <Volume1 size={20} />
                  ) : (
                    <Volume2 size={20} />
                  )}
                </button>

                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="text-xs font-mono font-medium text-white/80 select-none">
                <span>{formatTime(currentTime)}</span>
                <span className="text-white/40 mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls (Speed, Resolution Settings, AutoNext, PiP, Fullscreen) */}
            <div className="flex items-center gap-3">
              {/* Playback Speed Quick Button */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu)
                    setShowSettingsMenu(false)
                  }}
                  className="px-2 py-1 rounded-md text-xs font-bold font-mono text-white/90 hover:bg-white/10 transition-colors border border-white/20 cursor-pointer"
                  title="Tốc độ phát"
                >
                  {playbackSpeed}x
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-32 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 p-1.5 shadow-2xl space-y-0.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1 text-[10px] font-bold text-white/50 border-b border-white/10 uppercase tracking-wider">
                      Tốc độ phát
                    </div>
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => handleSpeedChange(speed)}
                        className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          playbackSpeed === speed
                            ? 'bg-primary text-white font-bold'
                            : 'text-white/80 hover:bg-white/10'
                        }`}
                      >
                        <span>{speed === 1.0 ? '1.0x (Chuẩn)' : `${speed}x`}</span>
                        {playbackSpeed === speed && <Check size={13} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ⚙️ Settings Gear Icon (Resolution + Speed + Auto Next) */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettingsMenu(!showSettingsMenu)
                    setShowSpeedMenu(false)
                    setSettingsSubmenu('main')
                  }}
                  className={`p-1.5 rounded-md text-white/90 hover:bg-white/10 transition-colors cursor-pointer ${
                    showSettingsMenu ? 'bg-white/20 text-white rotate-45 transition-transform duration-200' : ''
                  }`}
                  title="Cài đặt độ phân giải & Tùy chọn"
                >
                  <Settings size={19} />
                </button>

                {showSettingsMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-56 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
                    {/* Main Settings Menu */}
                    {settingsSubmenu === 'main' && (
                      <div className="space-y-1">
                        <div className="px-2.5 py-1 text-[10px] font-bold text-white/50 border-b border-white/10 uppercase tracking-wider">
                          Cài đặt Video
                        </div>

                        {/* Quality Menu Option */}
                        <button
                          onClick={() => setSettingsSubmenu('quality')}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <span className="text-white/80 flex items-center gap-2">
                            <SlidersHorizontal size={14} className="text-primary" />
                            <span>Chất lượng</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-mono text-white/60">
                            <span>
                              {selectedQuality === 'auto'
                                ? `Tự động (${autoResolvedQuality})`
                                : selectedQuality.toUpperCase()}
                            </span>
                            <ChevronRight size={14} />
                          </span>
                        </button>

                        {/* Speed Menu Option */}
                        <button
                          onClick={() => setSettingsSubmenu('speed')}
                          className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <span className="text-white/80 flex items-center gap-2">
                            <FastForward size={14} className="text-primary" />
                            <span>Tốc độ phát</span>
                          </span>
                          <span className="flex items-center gap-1 text-[11px] font-mono text-white/60">
                            <span>{playbackSpeed}x</span>
                            <ChevronRight size={14} />
                          </span>
                        </button>

                        {/* Auto Next Lesson Toggle */}
                        <div className="flex items-center justify-between p-2 border-t border-white/10 text-xs font-semibold">
                          <span className="text-white/80">Tự động chuyển bài</span>
                          <button
                            type="button"
                            onClick={() => setAutoPlayNext(!autoPlayNext)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              autoPlayNext ? 'bg-primary' : 'bg-white/20'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                autoPlayNext ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quality Submenu */}
                    {settingsSubmenu === 'quality' && (
                      <div className="space-y-1">
                        <button
                          onClick={() => setSettingsSubmenu('main')}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold text-white/70 hover:text-white border-b border-white/10 cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                          <span>Độ phân giải Video</span>
                        </button>
                        {QUALITIES.map((q) => {
                          const isSelected = selectedQuality === q.id
                          return (
                            <button
                              key={q.id}
                              onClick={() => handleQualityChange(q.id)}
                              className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-primary text-white font-bold'
                                  : 'text-white/80 hover:bg-white/10'
                              }`}
                            >
                              <span className="flex items-center gap-1.5">
                                <span>
                                  {q.id === 'auto'
                                    ? `Tự động (Auto) • ${autoResolvedQuality}`
                                    : q.label}
                                </span>
                                {q.badge && (
                                  <span className="rounded bg-indigo-500/30 px-1 py-0.2 text-[9px] font-bold text-indigo-300">
                                    {q.badge}
                                  </span>
                                )}
                              </span>
                              {isSelected && <Check size={14} />}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Speed Submenu */}
                    {settingsSubmenu === 'speed' && (
                      <div className="space-y-1">
                        <button
                          onClick={() => setSettingsSubmenu('main')}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-bold text-white/70 hover:text-white border-b border-white/10 cursor-pointer"
                        >
                          <ChevronLeft size={14} />
                          <span>Tốc độ phát</span>
                        </button>
                        {PLAYBACK_SPEEDS.map((speed) => (
                          <button
                            key={speed}
                            onClick={() => handleSpeedChange(speed)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                              playbackSpeed === speed
                                ? 'bg-primary text-white font-bold'
                                : 'text-white/80 hover:bg-white/10'
                            }`}
                          >
                            <span>{speed === 1.0 ? '1.0x (Chuẩn)' : `${speed}x`}</span>
                            {playbackSpeed === speed && <Check size={14} />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Picture-in-Picture Button */}
              <button
                onClick={togglePip}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Hình trong hình (P)"
              >
                <PictureInPicture2 size={18} />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                className="text-white/80 hover:text-white transition-colors cursor-pointer"
                title={isFullscreen ? 'Thoát toàn màn hình (F)' : 'Toàn màn hình (F)'}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setShowShortcutsModal(false)}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Keyboard className="text-primary" size={18} />
                <span>Phím tắt điều khiển Video</span>
              </h4>
              <button
                onClick={() => setShowShortcutsModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {[
                { key: 'Space / K', desc: 'Phát / Tạm dừng' },
                { key: 'Mũi tên Trái / J', desc: 'Lùi 5 giây' },
                { key: 'Mũi tên Phải / L', desc: 'Tiến 5 giây' },
                { key: 'Mũi tên Lên / Xuống', desc: 'Tăng / Giảm âm lượng' },
                { key: 'M', desc: 'Tắt / Bật tiếng' },
                { key: 'F', desc: 'Toàn màn hình' },
                { key: 'T', desc: 'Chế độ rạp chiếu' },
                { key: 'P', desc: 'Hình trong hình (PiP)' },
                { key: 'Shift + > / <', desc: 'Tăng / Giảm tốc độ' },
                { key: 'Click đúp Trái/Phải', desc: 'Tua nhanh 5 giây' },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/50 border border-slate-700/50"
                >
                  <span className="text-white/70">{item.desc}</span>
                  <span className="font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[11px]">
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
