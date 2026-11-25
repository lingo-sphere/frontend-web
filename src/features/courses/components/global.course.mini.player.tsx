// Trinh phat bai giang thu nho toan cuc luu trang thai khi quay lai danh sach khoa hoc.
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
    if (video.src !== resolvedUrl) {
      video.src = resolvedUrl
      video.currentTime = currentTime
    }
  }, [resolvedUrl, isDirect, currentTime])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false))
    } else {
      video.pause()
    }
  }, [isPlaying, setIsPlaying])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.volume = volume
    video.muted = isMuted
  }, [volume, isMuted])

  const handleTogglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    } else {
      video.pause()
      setIsPlaying(false)
    }
  }, [setIsPlaying])

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current
    if (!video) return
    const target = Math.max(0, Math.min(duration || 1000, time))
    video.currentTime = target
    setCurrentTime(target)
  }, [duration, setCurrentTime])

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
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lingosphere:course-next-lesson'))
    }
  }, [])

  const handlePrevLesson = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lingosphere:course-prev-lesson'))
    }
  }, [])

  if (!isOpen || !lesson) return null

  return (
    <>
      {isDirect && resolvedUrl && (
        <video
          ref={videoRef}
          playsInline
          className="absolute -top-[9999px] -left-[9999px] w-1 h-1 opacity-0 pointer-events-none"
          onTimeUpdate={() => {
            if (videoRef.current) {
              setCurrentTime(videoRef.current.currentTime)
            }
          }}
          onDurationChange={() => {
            if (videoRef.current?.duration) {
              setDuration(videoRef.current.duration)
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
        onToggleMute={() => {
          setIsMuted(!isMuted)
        }}
        onVolumeChange={(val) => {
          setVolume(val)
        }}
        onSeek={handleSeek}
        onNextLesson={handleNextLesson}
        onPrevLesson={handlePrevLesson}
        onMaximize={handleMaximize}
        onClose={closeMiniPlayer}
      />
    </>
  )
}
