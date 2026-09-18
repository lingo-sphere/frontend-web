// Trinh phat video tuy chinh hien dai danh cho bai giang mau voi thanh dieu khien rieng biet.
'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  RotateCcw,
  RotateCw,
  Maximize,
  Minimize,
  PictureInPicture2,
  Gauge,
  Check,
} from 'lucide-react'

interface CoursePreviewVideoPlayerProps {
  videoSrc: string
  title: string
  poster?: string
  autoPlay?: boolean
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]

function formatVideoTime(sec: number): string {
  if (isNaN(sec) || sec < 0) return '0:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`
    : null
}

export function CoursePreviewVideoPlayer({
  videoSrc,
  title,
  poster,
  autoPlay = true,
}: CoursePreviewVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const speedMenuRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [bufferedPercent, setBufferedPercent] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isScrubbing, setIsScrubbing] = useState(false)
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPositionPercent, setHoverPositionPercent] = useState(0)

  const youtubeEmbedUrl = getYouTubeEmbedUrl(videoSrc)

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying && !showSpeedMenu && !isScrubbing) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 2800)
    }
  }, [isPlaying, showSpeedMenu, isScrubbing])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.pause()
    }
    resetControlsTimeout()
  }

  const seekBy = (seconds: number) => {
    if (!videoRef.current) return
    const newTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, duration))
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
    resetControlsTimeout()
  }

  const toggleMute = () => {
    if (!videoRef.current) return
    if (isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
      if (volume === 0) {
        setVolume(0.5)
        videoRef.current.volume = 0.5
      }
    } else {
      videoRef.current.muted = true
      setIsMuted(true)
    }
    resetControlsTimeout()
  }

  const handleVolumeChange = (newVol: number) => {
    if (!videoRef.current) return
    videoRef.current.volume = newVol
    setVolume(newVol)
    if (newVol > 0 && isMuted) {
      videoRef.current.muted = false
      setIsMuted(false)
    } else if (newVol === 0) {
      setIsMuted(true)
    }
    resetControlsTimeout()
  }

  const handleSpeedSelect = (speed: number) => {
    if (!videoRef.current) return
    videoRef.current.playbackRate = speed
    setPlaybackSpeed(speed)
    setShowSpeedMenu(false)
    resetControlsTimeout()
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const togglePip = async () => {
    if (!videoRef.current) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture()
      }
    } catch {
      // Ignored
    }
  }

  const handleTimelineMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !videoRef.current || duration <= 0) return
    setIsScrubbing(true)
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percent = clickX / rect.width
    const targetTime = percent * duration
    videoRef.current.currentTime = targetTime
    setCurrentTime(targetTime)
    resetControlsTimeout()
  }

  const handleTimelineMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration <= 0) return
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    const percent = (clickX / rect.width) * 100
    setHoverPositionPercent(percent)
    setHoverTime((clickX / rect.width) * duration)
  }

  const handleTimelineMouseLeave = () => {
    setHoverTime(null)
  }

  useEffect(() => {
    if (!isScrubbing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineRef.current || !videoRef.current || duration <= 0) return
      const rect = timelineRef.current.getBoundingClientRect()
      const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
      const percent = clickX / rect.width
      const targetTime = percent * duration
      videoRef.current.currentTime = targetTime
      setCurrentTime(targetTime)
    }

    const handleMouseUp = () => {
      setIsScrubbing(false)
      resetControlsTimeout()
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isScrubbing, duration, resetControlsTimeout])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false)
      }
    }
    if (showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSpeedMenu])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement
      const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement
      if (isInput) return

      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault()
        togglePlay()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        seekBy(-5)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        seekBy(5)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        handleVolumeChange(Math.min(1, volume + 0.1))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleVolumeChange(Math.max(0, volume - 0.1))
      } else if (e.key === 'm') {
        e.preventDefault()
        toggleMute()
      } else if (e.key === 'f') {
        e.preventDefault()
        toggleFullscreen()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, volume, isMuted, duration])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (!isScrubbing) {
        setCurrentTime(video.currentTime)
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0)
    }

    const handleProgress = () => {
      if (video.buffered.length > 0 && video.duration > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1)
        setBufferedPercent((bufferedEnd / video.duration) * 100)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('progress', handleProgress)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('progress', handleProgress)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
    }
  }, [isScrubbing])

  useEffect(() => {
    if (!autoPlay || !videoRef.current) return
    const timer = setTimeout(() => {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {})
      }
    }, 280)
    return () => clearTimeout(timer)
  }, [autoPlay, videoSrc])

  if (youtubeEmbedUrl) {
    return (
      <div className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 flex items-center justify-center">
        <iframe
          key={youtubeEmbedUrl}
          src={youtubeEmbedUrl}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => {
        if (isPlaying && !showSpeedMenu && !isScrubbing) {
          setShowControls(false)
        }
      }}
      className="relative aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group select-none flex items-center justify-center"
    >
      <video
        ref={videoRef}
        key={videoSrc}
        src={videoSrc}
        poster={poster}
        playsInline
        onClick={togglePlay}
        className="w-full h-full object-contain cursor-pointer"
      />

      {!isPlaying && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-colors"
        >
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/40 hover:scale-110 hover:bg-indigo-500 transition-all cursor-pointer">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
          </div>
        </div>
      )}

      <div
        className={`absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/95 via-black/60 to-transparent pt-10 pb-3 px-4 sm:px-5 transition-opacity duration-200 ${
          showControls || !isPlaying || showSpeedMenu || isScrubbing
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          ref={timelineRef}
          onMouseDown={handleTimelineMouseDown}
          onMouseMove={handleTimelineMouseMove}
          onMouseLeave={handleTimelineMouseLeave}
          className="relative w-full h-4 group/scrubber cursor-pointer flex items-center mb-2"
        >
          <div className="relative w-full h-1.5 group-hover/scrubber:h-2.5 rounded-full bg-white/20 transition-all overflow-visible">
            <div
              className="absolute top-0 bottom-0 left-0 bg-white/35 rounded-full transition-all"
              style={{ width: `${bufferedPercent}%` }}
            />
            <div
              className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-xs"
              style={{ width: `${playedPercent}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg ring-2 ring-indigo-500 scale-0 group-hover/scrubber:scale-100 transition-transform duration-100 pointer-events-none"
              style={{ left: `${playedPercent}%` }}
            />
          </div>

          {hoverTime !== null && (
            <div
              className="pointer-events-none absolute -top-8 -translate-x-1/2 px-2 py-1 rounded-md bg-slate-900/95 text-white font-mono text-[11px] font-bold shadow-xl border border-slate-700/80"
              style={{ left: `${hoverPositionPercent}%` }}
            >
              {formatVideoTime(hoverTime)}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-white">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={togglePlay}
              className="p-2 rounded-xl text-white hover:bg-white/15 transition-colors cursor-pointer"
              title={isPlaying ? 'Tạm dừng (k hoặc Space)' : 'Phát (k hoặc Space)'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current" />
              ) : (
                <Play className="w-5 h-5 fill-current ml-0.5" />
              )}
            </button>

            <button
              type="button"
              onClick={() => seekBy(-10)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer hidden sm:flex items-center gap-0.5"
              title="Lùi 10 giây (←)"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-[10px] font-bold">10</span>
            </button>

            <button
              type="button"
              onClick={() => seekBy(10)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer hidden sm:flex items-center gap-0.5"
              title="Tiến 10 giây (→)"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-[10px] font-bold">10</span>
            </button>

            <div className="group/vol flex items-center">
              <button
                type="button"
                onClick={toggleMute}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                title={isMuted ? 'Bật âm thanh (m)' : 'Tắt tiếng (m)'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>

              <div className="w-0 overflow-hidden group-hover/vol:w-16 transition-all duration-200 ease-out flex items-center">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full h-1 bg-white/30 rounded-full appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            <div className="text-xs font-mono font-semibold text-slate-300 pl-1">
              <span>{formatVideoTime(currentTime)}</span>
              <span className="text-slate-500 mx-1">/</span>
              <span className="text-slate-400">{formatVideoTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div ref={speedMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer flex items-center gap-1"
                title="Tốc độ phát video"
              >
                <Gauge className="w-3.5 h-3.5 text-indigo-400" />
                <span>{playbackSpeed}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-36 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl shadow-2xl p-1.5 z-40 space-y-0.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    Tốc độ phát
                  </div>
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => handleSpeedSelect(speed)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        playbackSpeed === speed
                          ? 'bg-indigo-600 text-white font-extrabold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{speed === 1 ? '1.0x (Chuẩn)' : `${speed}x`}</span>
                      {playbackSpeed === speed && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={togglePip}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer hidden sm:block"
              title="Hình trong hình (Picture-in-Picture)"
            >
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title={isFullscreen ? 'Thu nhỏ màn hình (f)' : 'Toàn màn hình (f)'}
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
