/**
 * @file use.lesson.video.player.ts
 * @description Custom hook quản lý toàn bộ logic playback video, HLS stream, phím tắt, timeline và điều khiển player
 */

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import Hls from 'hls.js'
import type { Lesson } from '@/features/courses/types/course'
import { isDirectVideoUrl } from '@/features/courses/types/player.types'
import { API_CONFIG } from '@/config/api.config'
import { courseService } from '@/features/courses/services/course.service'

interface UseLessonVideoPlayerProps {
  lesson: Lesson
  courseId?: string
  hasNextLesson?: boolean
  onProgress?: (lessonId: string, progress: number) => void
  onLessonComplete?: (lessonId: string) => void
  onTimeUpdate?: (currentTime: number) => void
  onNextLesson?: () => void
  onDurationChange?: (lessonId: string, durationSec: number) => void
}

export function useLessonVideoPlayer({
  lesson,
  courseId,
  hasNextLesson = false,
  onProgress,
  onLessonComplete,
  onTimeUpdate,
  onNextLesson,
  onDurationChange,
}: UseLessonVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const hlsRef = useRef<Hls | null>(null)
  const progressBarRef = useRef<HTMLDivElement | null>(null)
  const hideControlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastHeartbeatRef = useRef<number>(0)

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
    return Boolean(
      baseVideoSource &&
        (baseVideoSource.includes('.m3u8') || baseVideoSource.includes('manifest'))
    )
  }, [baseVideoSource])

  const effectiveQualityKey =
    selectedQuality === 'auto' ? autoResolvedQuality : selectedQuality
  const isDirectVideo = useMemo(
    () => isDirectVideoUrl(baseVideoSource),
    [baseVideoSource]
  )

  const effectiveVideoUrl = useMemo(() => {
    if (!baseVideoSource) return ''
    let source = baseVideoSource
    const apiBase = (API_CONFIG.BASE_URL ?? '').replace(
      /\/+$/,
      ''
    )
    if (
      source.includes('pub-') ||
      source.includes('r2.cloudflarestorage.com') ||
      source.includes('.r2.dev')
    ) {
      try {
        const parsed = new URL(source)
        source = `${apiBase}/media/stream${parsed.pathname}`
      } catch {}
    }
    if (isHlsStream) return source
    if (source.includes('/1080p/')) {
      if (effectiveQualityKey === '720p')
        return source.replace('/1080p/', '/720p/')
      if (effectiveQualityKey === '360p')
        return source.replace('/1080p/', '/360p/')
    }
    return source
  }, [baseVideoSource, effectiveQualityKey, isHlsStream])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !effectiveVideoUrl) return

    if (isHlsStream) {
      if (Hls.isSupported()) {
        if (hlsRef.current) hlsRef.current.destroy()
        const hls = new Hls({
          capLevelToPlayerSize: false,
          autoStartLoad: true,
          startLevel: -1,
        })
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

  const triggerFeedback = useCallback(
    (
      type: 'forward' | 'rewind' | 'play' | 'pause' | 'speed' | 'volume',
      text?: string
    ) => {
      if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current)
      setActionFeedback({ type, text })
      feedbackTimeoutRef.current = setTimeout(() => setActionFeedback(null), 800)
    },
    []
  )

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (hideControlsTimeoutRef.current)
      clearTimeout(hideControlsTimeoutRef.current)
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
      video
        .play()
        .then(() => {
          setIsPlaying(true)
          if (courseId && Date.now() - lastHeartbeatRef.current > 30000) {
            lastHeartbeatRef.current = Date.now()
            courseService.recordVideoWatchHeartbeat(courseId).catch(() => {})
          }
        })
        .catch(() => {})
      triggerFeedback('play')
    } else {
      video.pause()
      setIsPlaying(false)
      triggerFeedback('pause')
    }
    resetControlsTimeout()
  }, [triggerFeedback, resetControlsTimeout, courseId])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
    resetControlsTimeout()
  }, [resetControlsTimeout])

  const handleVolumeChange = useCallback(
    (newVol: number) => {
      const video = videoRef.current
      if (!video) return
      const vol = Math.max(0, Math.min(1, newVol))
      video.volume = vol
      setVolume(vol)
      video.muted = vol === 0
      setIsMuted(vol === 0)
      resetControlsTimeout()
    },
    [resetControlsTimeout]
  )

  const seekRelative = useCallback(
    (seconds: number) => {
      const video = videoRef.current
      if (!video) return
      const next = Math.max(0, Math.min(duration, video.currentTime + seconds))
      video.currentTime = next
      setCurrentTime(next)
      triggerFeedback(
        seconds > 0 ? 'forward' : 'rewind',
        `${seconds > 0 ? '+' : ''}${seconds}s`
      )
      resetControlsTimeout()
    },
    [duration, triggerFeedback, resetControlsTimeout]
  )

  const seekToTime = useCallback(
    (time: number) => {
      const video = videoRef.current
      if (!video) return
      const next = Math.max(0, Math.min(duration, time))
      video.currentTime = next
      setCurrentTime(next)
      resetControlsTimeout()
    },
    [duration, resetControlsTimeout]
  )

  const handleSpeedChange = useCallback(
    (speed: number) => {
      const video = videoRef.current
      if (!video) return
      video.playbackRate = speed
      setPlaybackSpeed(speed)
      setShowSettingsMenu(false)
      triggerFeedback('speed', `${speed}x`)
    },
    [triggerFeedback]
  )

  const handleQualityChange = useCallback((qKey: string) => {
    setSelectedQuality(qKey)
    setShowSettingsMenu(false)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container
        .requestFullscreen()
        .then(() => setIsFullscreen(true))
        .catch(() => {})
    } else {
      document
        .exitFullscreen()
        .then(() => setIsFullscreen(false))
        .catch(() => {})
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

  const handleTimeUpdate = useCallback(() => {
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

    if (courseId) {
      const now = Date.now()
      if (now - lastHeartbeatRef.current > 60000) {
        lastHeartbeatRef.current = now
        courseService.recordVideoWatchHeartbeat(courseId).catch(() => {})
      }
    }
  }, [duration, lesson.id, onLessonComplete, onProgress, onTimeUpdate, courseId])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    setShowEndedScreen(true)
    setCountdownSeconds(5)
    if (hasNextLesson && autoPlayNext) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            if (countdownIntervalRef.current)
              clearInterval(countdownIntervalRef.current)
            setShowEndedScreen(false)
            onNextLesson?.()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [autoPlayNext, hasNextLesson, onNextLesson])

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || !duration) return
      const rect = progressBarRef.current.getBoundingClientRect()
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const ratio = clickX / rect.width
      seekToTime(ratio * duration)
    },
    [duration, seekToTime]
  )

  const handleTimelineMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressBarRef.current || !duration) return
      const rect = progressBarRef.current.getBoundingClientRect()
      const moveX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const ratio = moveX / rect.width
      setHoverPosition(ratio * 100)
      setHoverTime(ratio * duration)
    },
    [duration]
  )

  return {
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
    isTheater,
    setIsTheater,
    isFullscreen,
    isPipActive,
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
  }
}
