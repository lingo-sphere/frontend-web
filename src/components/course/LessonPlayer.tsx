// Updated: 2026-08-17
// Lesson Player với video progress:
// - Video player với progress bar
// - Fullscreen mode
// - Progress cập nhật theo thời gian xem
// - 80% progress = unlock bài tiếp theo

import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Check, ChevronLeft, ChevronRight, Lock, Maximize2, Minimize2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { Lesson } from '@/types/course'

interface LessonPlayerProps {
  lesson: Lesson
  onClose: () => void
  onProgress: (lessonId: string, progress: number) => void
}

export function LessonPlayer({ lesson, onClose, onProgress }: LessonPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(lesson.progress)
  const [currentTime, setCurrentTime] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const totalDuration = lesson.duration // seconds
  const progressPercent = Math.round((currentTime / totalDuration) * 100)

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev)
  }, [])

  // Handle Escape key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isFullscreen])

  // Auto-play effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying && currentTime < totalDuration) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1
          if (newTime >= totalDuration) {
            setIsPlaying(false)
            return totalDuration
          }
          // Update progress every 5 seconds
          if (newTime % 5 === 0) {
            const newProgress = Math.round((newTime / totalDuration) * 100)
            setProgress(newProgress)
            onProgress(lesson.id, newProgress)
          }
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentTime, totalDuration, lesson.id, onProgress])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = Math.round((x / rect.width) * 100)
    const newTime = Math.round((percentage / 100) * totalDuration)
    setCurrentTime(Math.min(newTime, totalDuration))
    const newProgress = Math.round((newTime / totalDuration) * 100)
    setProgress(newProgress)
    onProgress(lesson.id, newProgress)
  }

  // Find chapter order from lesson id
  const chapterNum = lesson.chapterId.split('-')[1]
  const lessonNum = lesson.order

  // Fullscreen video player
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black">
        {/* Close fullscreen button */}
        <button
          className="absolute right-4 top-4 z-10 rounded-lg bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          onClick={() => setIsFullscreen(false)}
        >
          <Minimize2 className="h-6 w-6" />
        </button>

        {/* Video area */}
        <div className="relative flex h-full w-full items-center justify-center">
          {/* Video frame placeholder */}
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div
                className="mx-auto mb-6 flex h-24 w-24 cursor-pointer items-center justify-center rounded-full bg-primary/30 transition-colors hover:bg-primary/40"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-12 w-12 text-primary" />
                ) : (
                  <Play className="h-12 w-12 translate-x-1 text-primary" />
                )}
              </div>
              <p className="text-[16px] text-white/80">Video Player</p>
              <p className="text-[14px] text-white/50">Click to {isPlaying ? 'pause' : 'play'}</p>
            </div>
          </div>

          {/* Progress bar overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-6">
            {/* Time display */}
            <div className="mb-3 flex items-center justify-between text-[14px] text-white">
              <span>{formatTime(currentTime)}</span>
              <span className="rounded-full bg-primary/30 px-3 py-1 font-semibold">{progressPercent}%</span>
              <span>{formatTime(totalDuration)}</span>
            </div>

            {/* Progress bar */}
            <div
              className="h-3 w-full cursor-pointer overflow-hidden rounded-full bg-white/30"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-center gap-6">
              <button
                className="rounded-full p-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => {
                  const newTime = Math.max(0, currentTime - 10)
                  setCurrentTime(newTime)
                  setProgress(Math.round((newTime / totalDuration) * 100))
                }}
              >
                <SkipBack className="h-6 w-6" />
              </button>
              <button
                className="rounded-full bg-primary p-4 text-white transition-colors hover:bg-primary-hover"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 translate-x-0.5" />}
              </button>
              <button
                className="rounded-full p-3 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => {
                  const newTime = Math.min(totalDuration, currentTime + 10)
                  setCurrentTime(newTime)
                  setProgress(Math.round((newTime / totalDuration) * 100))
                }}
              >
                <SkipForward className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Normal player
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden bg-surface">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <Button
            variant="ghost"
            className="h-auto p-0 text-[13px] text-text-secondary hover:bg-transparent hover:text-primary"
            onClick={onClose}
          >
            ← Back to Course
          </Button>
          <div className="text-center">
            <p className="text-[12px] text-text-secondary">Chapter {chapterNum}</p>
            <h2 className="text-[16px] font-bold text-text-primary">Lesson {lessonNum}: {lesson.title}</h2>
          </div>
          <Button
            variant="ghost"
            className="h-auto w-auto p-2 text-text-secondary hover:bg-transparent hover:text-primary"
            onClick={toggleFullscreen}
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        </div>

        {/* Video Player Area */}
        <div className="relative flex-1 bg-black">
          {/* Video placeholder */}
          <div className="flex h-full w-full items-center justify-center">
            <div className="relative">
              {/* Video frame placeholder */}
              <div className="flex h-[300px] w-[533px] items-center justify-center rounded-lg bg-gradient-to-br from-surface-subtle to-surface">
                <div className="text-center">
                  <div
                    className="mx-auto mb-4 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full bg-primary/20 transition-colors hover:bg-primary/30"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? (
                      <Pause className="h-10 w-10 text-primary" />
                    ) : (
                      <Play className="h-10 w-10 translate-x-1 text-primary" />
                    )}
                  </div>
                  <p className="text-[14px] text-text-secondary">Video Player</p>
                  <p className="text-[12px] text-text-tertiary">Click to {isPlaying ? 'pause' : 'play'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            {/* Time display */}
            <div className="mb-2 flex items-center justify-between text-[12px] text-white">
              <span>{formatTime(currentTime)}</span>
              <span className="text-warning">{progressPercent}%</span>
              <span>{formatTime(totalDuration)}</span>
            </div>

            {/* Progress bar */}
            <div
              className="h-2 w-full cursor-pointer overflow-hidden rounded-full bg-white/30"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Controls */}
            <div className="mt-3 flex items-center justify-center gap-4">
              <button
                className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => {
                  const newTime = Math.max(0, currentTime - 10)
                  setCurrentTime(newTime)
                  setProgress(Math.round((newTime / totalDuration) * 100))
                }}
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                className="rounded-full bg-primary p-3 text-white transition-colors hover:bg-primary-hover"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 translate-x-0.5" />}
              </button>
              <button
                className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                onClick={() => {
                  const newTime = Math.min(totalDuration, currentTime + 10)
                  setCurrentTime(newTime)
                  setProgress(Math.round((newTime / totalDuration) * 100))
                }}
              >
                <SkipForward className="h-5 w-5" />
              </button>
              <button
                className="rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                onClick={toggleFullscreen}
              >
                <Maximize2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="border-t border-border p-4">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold text-text-primary">Lesson Content</h3>
              <p className="text-[12px] text-text-secondary">Chapter {chapterNum} - Lesson {lessonNum}</p>
            </div>
            <div className="text-right">
              <p className="text-[14px] font-bold text-primary">{progress}%</p>
              <p className="text-[11px] text-text-secondary">
                {progress >= 80 ? '✓ Next lesson unlocked' : `Need ${80 - progress}% more to unlock next`}
              </p>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
            <div
              className={`h-full transition-all ${progress >= 80 ? 'bg-success' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-border p-4">
          <Button variant="outline" disabled>
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous Lesson
          </Button>

          <div className="flex items-center gap-2">
            {progress >= 100 ? (
              <Button className="bg-success hover:bg-success/90" onClick={onClose}>
                <Check className="mr-1 h-4 w-4" />
                Completed
              </Button>
            ) : (
              <Button
                className="bg-primary hover:bg-primary-hover"
                onClick={() => {
                  onProgress(lesson.id, 100)
                  setProgress(100)
                  setCurrentTime(totalDuration)
                  onClose()
                }}
              >
                Mark Complete
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            disabled={progress < 80}
            className={progress < 80 ? 'opacity-50' : ''}
            onClick={onClose}
          >
            Next Lesson
            <ChevronRight className="ml-1 h-4 w-4" />
            {progress < 80 && <Lock className="ml-1 h-3 w-3" />}
          </Button>
        </div>
      </Card>
    </div>
  )
}
