// Trình phát âm thanh hiện đại với thanh điều khiển tùy chỉnh, tốc độ và âm lượng.

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  RotateCcw,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { resolveAudioUrl } from '@/utils/media.utils'

export interface CustomAudioPlayerProps {
  src?: string | null
  title?: string
  variant?: 'default' | 'compact' | 'minimal'
  className?: string
  preload?: 'none' | 'metadata' | 'auto'
  autoPlay?: boolean
  loop?: boolean
  showSpeed?: boolean
  showVolume?: boolean
  showSkip?: boolean
  startTime?: number
  endTime?: number
  onPlay?: () => void
  onPause?: () => void
  onEnded?: () => void
  onError?: () => void
}

const SPEED_OPTIONS = [1, 1.25, 1.5, 0.75]

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function CustomAudioPlayer({
  src,
  title,
  variant = 'default',
  className = '',
  preload = 'metadata',
  autoPlay = false,
  loop = false,
  showSpeed = true,
  showVolume = true,
  showSkip = true,
  startTime,
  endTime,
  onPlay,
  onPause,
  onEnded,
  onError,
}: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(0)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  const resolvedSrc = src ? resolveAudioUrl(src) : ''

  const syncDuration = useCallback(() => {
    if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
      const boundDuration = endTime && endTime > 0 ? endTime : audioRef.current.duration
      setDuration(boundDuration)
      setIsLoading(false)
    }
  }, [endTime])

  useEffect(() => {
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setIsError(false)
    setIsLoading(Boolean(resolvedSrc))
  }, [resolvedSrc])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      syncDuration()
      if (startTime && startTime > 0) {
        audio.currentTime = startTime
        setCurrentTime(startTime)
      }
    }

    const handleTimeUpdate = () => {
      const current = audio.currentTime
      if (endTime && endTime > 0 && current >= endTime) {
        audio.pause()
        setIsPlaying(false)
        onEnded?.()
        return
      }
      setCurrentTime(current)
    }

    const handleWaiting = () => setIsLoading(true)
    const handleCanPlay = () => setIsLoading(false)

    const handleEnded = () => {
      setIsPlaying(false)
      if (startTime && startTime > 0) {
        audio.currentTime = startTime
        setCurrentTime(startTime)
      }
      onEnded?.()
    }

    const handleError = () => {
      setIsLoading(false)
      setIsPlaying(false)
      setIsError(true)
      onError?.()
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('waiting', handleWaiting)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('waiting', handleWaiting)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [endTime, startTime, syncDuration, onEnded, onError])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !resolvedSrc) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      onPause?.()
    } else {
      if (endTime && endTime > 0 && audio.currentTime >= endTime) {
        audio.currentTime = startTime || 0
      }
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          onPlay?.()
        })
        .catch(() => {
          setIsPlaying(false)
        })
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const targetTime = Number(e.target.value)
    audio.currentTime = targetTime
    setCurrentTime(targetTime)
  }

  const handleReplay = () => {
    const audio = audioRef.current
    if (!audio) return
    const restartPoint = startTime || 0
    audio.currentTime = restartPoint
    setCurrentTime(restartPoint)
    if (!isPlaying) {
      audio
        .play()
        .then(() => {
          setIsPlaying(true)
          onPlay?.()
        })
        .catch(() => {})
    }
  }

  const cycleSpeed = () => {
    const audio = audioRef.current
    if (!audio) return
    const nextIndex = (speedIndex + 1) % SPEED_OPTIONS.length
    const nextSpeed = SPEED_OPTIONS[nextIndex]
    setSpeedIndex(nextIndex)
    audio.playbackRate = nextSpeed
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    audio.muted = nextMuted
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    const nextVol = Number(e.target.value)
    setVolume(nextVol)
    audio.volume = nextVol
    if (nextVol === 0) {
      setIsMuted(true)
      audio.muted = true
    } else if (isMuted) {
      setIsMuted(false)
      audio.muted = false
    }
  }

  const currentSpeed = SPEED_OPTIONS[speedIndex]
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0

  if (!resolvedSrc) {
    return (
      <div className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-surface-subtle border border-border text-xs text-text-tertiary ${className}`}>
        <VolumeX size={16} className="text-text-muted shrink-0" />
        <span>Chưa có tệp âm thanh.</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 ${className}`}>
        <div className="flex items-center gap-2 min-w-0">
          <AlertCircle size={16} className="text-rose-500 shrink-0" />
          <span className="truncate">Không thể tải tệp âm thanh.</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsError(false)
            setIsLoading(true)
            if (audioRef.current) {
              audioRef.current.load()
            }
          }}
          className="shrink-0 font-bold hover:underline cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    )
  }

  if (variant === 'minimal') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border shadow-xs ${className}`}>
        <audio
          ref={audioRef}
          src={resolvedSrc}
          preload={preload}
          autoPlay={autoPlay}
          loop={loop}
        />
        <button
          type="button"
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát audio'}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover active:scale-95 transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={13} className="fill-current" />
          ) : (
            <Play size={13} className="fill-current ml-0.5" />
          )}
        </button>
        <span className="text-[11px] font-mono font-medium text-text-secondary select-none">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-surface border border-border shadow-xs hover:border-border-strong transition-all ${className}`}>
        <audio
          ref={audioRef}
          src={resolvedSrc}
          preload={preload}
          autoPlay={autoPlay}
          loop={loop}
        />

        <button
          type="button"
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát audio'}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white hover:bg-primary-hover active:scale-95 transition-all shadow-xs cursor-pointer shrink-0 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={14} className="fill-current" />
          ) : (
            <Play size={14} className="fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-text-tertiary select-none shrink-0 w-8 text-right">
            {formatTime(currentTime)}
          </span>

          <div className="relative flex-1 flex items-center h-4 group">
            <div className="w-full h-1.5 bg-surface-subtle dark:bg-border/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={startTime || 0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Thanh tiến trình audio"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <span className="text-[11px] font-mono font-medium text-text-tertiary select-none shrink-0 w-8">
            {formatTime(duration)}
          </span>
        </div>

        {showVolume && (
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors cursor-pointer shrink-0"
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={15} />
            ) : volume < 0.5 ? (
              <Volume1 size={15} />
            ) : (
              <Volume2 size={15} />
            )}
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`p-3.5 sm:p-4 rounded-2xl bg-surface/90 dark:bg-surface-subtle/80 backdrop-blur-xs border border-border shadow-xs hover:border-border-strong transition-all space-y-2.5 ${className}`}>
      <audio
        ref={audioRef}
        src={resolvedSrc}
        preload={preload}
        autoPlay={autoPlay}
        loop={loop}
      />

      {title && (
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
              <Volume2 size={13} />
            </div>
            <span className="text-xs font-bold text-text-primary truncate">
              {title}
            </span>
          </div>

          {isPlaying && (
            <div className="flex items-end gap-0.5 h-3 shrink-0 px-2 py-0.5 rounded-full bg-primary/10">
              <span className="w-0.5 bg-primary rounded-full animate-pulse h-full" />
              <span className="w-0.5 bg-primary rounded-full animate-pulse delay-75 h-2" />
              <span className="w-0.5 bg-primary rounded-full animate-pulse delay-150 h-2.5" />
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          disabled={isLoading}
          aria-label={isPlaying ? 'Tạm dừng' : 'Phát audio'}
          className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover active:scale-95 transition-all shadow-sm hover:shadow cursor-pointer shrink-0 disabled:opacity-60"
        >
          {isLoading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : isPlaying ? (
            <Pause size={18} className="fill-current" />
          ) : (
            <Play size={18} className="fill-current ml-0.5" />
          )}
        </button>

        {showSkip && (
          <button
            type="button"
            onClick={handleReplay}
            aria-label="Phát lại từ đầu"
            title="Phát lại từ đầu"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-all cursor-pointer shrink-0"
          >
            <RotateCcw size={15} />
          </button>
        )}

        <div className="flex-1 min-w-0 space-y-1">
          <div className="relative flex items-center h-5 group">
            <div className="w-full h-2 bg-surface-subtle dark:bg-border/60 rounded-full overflow-hidden transition-all group-hover:h-2.5">
              <div
                className="h-full bg-primary rounded-full transition-all duration-75"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={startTime || 0}
              max={duration || 1}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              aria-label="Thanh tiến trình audio"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono font-medium text-text-tertiary select-none px-0.5">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {showSpeed && (
            <button
              type="button"
              onClick={cycleSpeed}
              title="Đổi tốc độ phát"
              className="px-2 py-1 rounded-lg text-[11px] font-bold text-text-secondary hover:text-text-primary hover:bg-surface-subtle border border-border/60 transition-all cursor-pointer"
            >
              {currentSpeed}x
            </button>
          )}

          {showVolume && (
            <div
              className="relative flex items-center"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                type="button"
                onClick={toggleMute}
                aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-all cursor-pointer"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={16} />
                ) : volume < 0.5 ? (
                  <Volume1 size={16} />
                ) : (
                  <Volume2 size={16} />
                )}
              </button>

              {showVolumeSlider && (
                <div className="absolute right-0 bottom-full mb-2 p-2 rounded-xl bg-surface border border-border shadow-md flex items-center z-20">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    aria-label="Thanh âm lượng"
                    className="w-18 h-1.5 accent-primary cursor-pointer"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
