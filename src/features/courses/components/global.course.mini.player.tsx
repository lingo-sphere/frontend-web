// Trình phát bài giảng thu nhỏ toàn cục lưu trạng thái khi chuyển trang hoặc quay lại.
'use client'

import { useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CourseMiniPlayer } from '@/features/courses/components/course.mini.player'
import { useCourseMiniPlayerStore } from '@/features/courses/store/course.mini.player.store'
import { isDirectVideoUrl } from '@/features/courses/types/player.types'
import { resolveMediaUrl } from '@/utils/media.utils'

export function GlobalCourseMiniPlayer() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const currentUrlRef = useRef<string>('')
  const pendingSeekRef = useRef<number>(0)
  const isSeekingRef = useRef<boolean>(false)
  const seekDebounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    isOpen,
    lesson,
    courseId,
    courseTitle,
    courseThumbnail,
    effectiveVideoUrl,
    currentTime,
    duration,
    isPlaying,
    volume,
    isMuted,
    hasNextLesson,
    hasPrevLesson,
    closeMiniPlayer,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setVolume,
    setIsMuted,
    nextLesson,
    prevLesson,
  } = useCourseMiniPlayerStore()

  const resolvedUrl = useMemo(() => {
    if (!effectiveVideoUrl) return ''
    if (
      effectiveVideoUrl.includes('youtube.com') ||
      effectiveVideoUrl.includes('youtu.be') ||
      effectiveVideoUrl.includes('vimeo.com')
    ) {
      return effectiveVideoUrl
    }
    return resolveMediaUrl(effectiveVideoUrl)
  }, [effectiveVideoUrl])

  const isDirect = useMemo(() => isDirectVideoUrl(resolvedUrl), [resolvedUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !resolvedUrl || !isDirect) return
    if (currentUrlRef.current !== resolvedUrl) {
      currentUrlRef.current = resolvedUrl
      pendingSeekRef.current = currentTime
      video.src = resolvedUrl
      video.load()
    }
  }, [resolvedUrl, isDirect])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      if (video.paused) {
        video.play().catch(() => {})
      }
    } else {
      if (!video.paused) {
        video.pause()
      }
    }
  }, [isPlaying])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = volume
    video.muted = isMuted
  }, [volume, isMuted])

  const handleTogglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) {
      setIsPlaying(!isPlaying)
      return
    }
    if (video.paused) {
      setIsPlaying(true)
      video.play().catch(() => {})
    } else {
      video.pause()
      setIsPlaying(false)
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lingosphere:toggle-play'))
    }
  }, [isPlaying, setIsPlaying])

  const handleSeek = useCallback((time: number) => {
    const target = Math.max(0, Math.min(duration || 1000, time))
    isSeekingRef.current = true
    if (seekDebounceTimerRef.current) {
      clearTimeout(seekDebounceTimerRef.current)
    }
    seekDebounceTimerRef.current = setTimeout(() => {
      isSeekingRef.current = false
    }, 400)

    setCurrentTime(target)
    const video = videoRef.current
    if (video) {
      if (video.readyState >= 1) {
        video.currentTime = target
      } else {
        pendingSeekRef.current = target
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lingosphere:seek-video', { detail: { time: target } }))
    }
  }, [duration, setCurrentTime])

  const handleVolumeChange = useCallback((newVol: number) => {
    const clamped = Math.max(0, Math.min(1, newVol))
    setVolume(clamped)
    setIsMuted(clamped === 0)
    const video = videoRef.current
    if (video) {
      video.volume = clamped
      video.muted = clamped === 0
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lingosphere:set-volume', { detail: { volume: clamped } }))
    }
  }, [setVolume, setIsMuted])

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    const video = videoRef.current
    if (video) {
      video.muted = nextMuted
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lingosphere:set-volume', { detail: { volume: nextMuted ? 0 : volume || 1 } }))
    }
  }, [isMuted, volume, setIsMuted])

  const handleMaximize = useCallback(() => {
    if (!lesson || !courseId) return
    closeMiniPlayer()
    const targetUrl = `/course/${courseId}?lesson=${lesson.id}&t=${Math.round(currentTime)}`
    router.push(targetUrl)
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [lesson, courseId, currentTime, closeMiniPlayer, router])

  const handleNextLesson = useCallback(() => {
    if (hasNextLesson) {
      nextLesson()
    } else {
      handleSeek(Math.min(duration || 1000, currentTime + 10))
    }
  }, [hasNextLesson, nextLesson, handleSeek, duration, currentTime])

  const handlePrevLesson = useCallback(() => {
    if (hasPrevLesson) {
      prevLesson()
    } else {
      handleSeek(Math.max(0, currentTime - 10))
    }
  }, [hasPrevLesson, prevLesson, handleSeek, currentTime])

  if (!isOpen || !lesson) return null

  return (
    <>
      {isDirect && resolvedUrl && (
        <video
          ref={videoRef}
          playsInline
          className="absolute -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none"
          onLoadedMetadata={() => {
            const video = videoRef.current
            if (video?.duration && !isNaN(video.duration)) {
              setDuration(video.duration)
            }
            if (pendingSeekRef.current > 0 && video) {
              video.currentTime = pendingSeekRef.current
              pendingSeekRef.current = 0
            }
          }}
          onCanPlay={() => {
            const video = videoRef.current
            if (pendingSeekRef.current > 0 && video) {
              video.currentTime = pendingSeekRef.current
              pendingSeekRef.current = 0
            }
            if (isPlaying && video && video.paused) {
              video.play().catch(() => {})
            }
          }}
          onDurationChange={() => {
            const video = videoRef.current
            if (video?.duration && !isNaN(video.duration)) {
              setDuration(video.duration)
            }
          }}
          onSeeking={() => {
            isSeekingRef.current = true
          }}
          onSeeked={() => {
            isSeekingRef.current = false
          }}
          onTimeUpdate={() => {
            const video = videoRef.current
            if (video && !video.seeking && !isSeekingRef.current && !isNaN(video.currentTime)) {
              setCurrentTime(video.currentTime)
            }
          }}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}

      <CourseMiniPlayer
        lesson={lesson}
        courseTitle={courseTitle}
        courseThumbnail={courseThumbnail}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        hasNextLesson={hasNextLesson}
        hasPrevLesson={hasPrevLesson}
        onTogglePlay={handleTogglePlay}
        onToggleMute={handleToggleMute}
        onVolumeChange={handleVolumeChange}
        onSeek={handleSeek}
        onNextLesson={handleNextLesson}
        onPrevLesson={handlePrevLesson}
        onMaximize={handleMaximize}
        onClose={closeMiniPlayer}
      />
    </>
  )
}
