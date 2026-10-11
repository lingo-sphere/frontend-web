// Custom hook quản lý phát video bài giảng và điều khiển trình phát media.

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { Lesson } from '@/features/courses/types/course'
import { isDirectVideoUrl } from '@/features/courses/types/player.types'
import { courseService } from '@/features/courses/services/course.service'
import { resolveMediaUrl } from '@/utils/media.utils'

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
}: UseLessonVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
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


  const isDirectVideo = useMemo(
    () => isDirectVideoUrl(baseVideoSource),
    [baseVideoSource]
  )

  const effectiveVideoUrl = useMemo(() => {
    if (!baseVideoSource) return ''
    if (
      baseVideoSource.includes('youtube.com') ||
      baseVideoSource.includes('youtu.be') ||
      baseVideoSource.includes('vimeo.com')
    ) {
      return baseVideoSource
    }
    return resolveMediaUrl(baseVideoSource)
  }, [baseVideoSource])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !effectiveVideoUrl) return
    video.src = effectiveVideoUrl
  }, [effectiveVideoUrl])

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

  useEffect(() => {
    const handleSeekEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ time: number }>
      if (typeof customEvent.detail?.time === 'number') {
        seekToTime(customEvent.detail.time)
      }
    }
    window.addEventListener('lingosphere:seek-video', handleSeekEvent)
    return () => {
      window.removeEventListener('lingosphere:seek-video', handleSeekEvent)
    }
  }, [seekToTime])

  const initialSeekDoneRef = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const urlParams = new URLSearchParams(window.location.search)
    const tParam = urlParams.get('t')
    if (tParam && duration > 0 && initialSeekDoneRef.current !== `${lesson.id}-${tParam}`) {
      const targetTime = Number(tParam)
      if (!isNaN(targetTime) && targetTime >= 0) {
        initialSeekDoneRef.current = `${lesson.id}-${tParam}`
        seekToTime(targetTime)
      }
    }
  }, [duration, lesson.id, seekToTime])

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
    toggleFullscreen,
    togglePip,
    handleTimeUpdate,
    handleEnded,
    handleTimelineClick,
    handleTimelineMouseMove,
  }
}
