// Widget trình phát bài giảng thu nhỏ góc màn hình phong cách SoundCloud với thanh trượt ElasticSlider.
'use client'

import { useMemo } from 'react'
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize2,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { HugeiconsIcon } from '@hugeicons/react'
import { VolumeHighIcon, VolumeLowIcon } from '@hugeicons/core-free-icons'
import { ElasticSlider } from '@/components/elastic.slider'
import { formatTime } from '@/features/courses/types/player.types'
import { resolveMediaUrl } from '@/utils/media.utils'
import type { Lesson } from '@/features/courses/types/course'

export interface CourseMiniPlayerProps {
  lesson: Lesson
  courseTitle?: string
  courseThumbnail?: string
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  hasNextLesson?: boolean
  hasPrevLesson?: boolean
  onTogglePlay: () => void
  onToggleMute: () => void
  onVolumeChange: (vol: number) => void
  onSeek: (seconds: number) => void
  onNextLesson?: () => void
  onPrevLesson?: () => void
  onMaximize: () => void
  onClose: () => void
}

export function CourseMiniPlayer({
  lesson,
  courseTitle = 'LingoSphere Course',
  courseThumbnail,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  hasNextLesson = false,
  hasPrevLesson = false,
  onTogglePlay,
  onToggleMute,
  onVolumeChange,
  onSeek,
  onNextLesson,
  onPrevLesson,
  onMaximize,
  onClose,
}: CourseMiniPlayerProps) {
  const thumbnail = useMemo(() => {
    const raw = courseThumbnail || ''
    if (!raw) return '/images/course-default.jpg'
    return resolveMediaUrl(raw)
  }, [courseThumbnail])

  const remaining = Math.max(0, duration - currentTime)

  return (
    <div
      role="region"
      aria-label="Mini course audio player"
      className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] rounded-3xl bg-[#14121a]/95 text-white p-4 sm:p-5 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl select-none animate-in fade-in slide-in-from-bottom-8 duration-300 transition-all font-sans"
    >
      <div className="flex items-stretch gap-3.5">
        <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/10 bg-black/60">
          <img
            src={thumbnail}
            alt={lesson.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          {isPlaying && (
            <div className="absolute bottom-1 right-1 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[9px] font-bold text-emerald-400 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 pr-2">
              <h4 className="text-sm font-bold text-white truncate leading-snug">
                {lesson.title}
              </h4>
              <p className="text-[11px] text-white/60 truncate mt-0.5 font-medium">
                {courseTitle}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onMaximize}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Phóng to trình phát"
              >
                <Maximize2 size={15} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng mini player"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full my-1.5">
            <span className="text-[10px] font-mono text-white/60 w-8 shrink-0 text-left tabular-nums">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 min-w-0">
              <ElasticSlider
                value={currentTime}
                defaultValue={0}
                maxValue={duration || 100}
                startingValue={0}
                onChange={(val) => onSeek(val)}
                formatValue={(val) => formatTime(val)}
                valuePosition="none"
                thickness={4}
                activeThickness={8}
                radius={20}
                trackColor="rgba(255,255,255,0.2)"
                rangeColor="#ffffff"
                growOnHover
                wheel={false}
                className="w-full"
              />
            </div>
            <span className="text-[10px] font-mono text-white/60 w-9 shrink-0 text-right tabular-nums">
              {duration > 0 ? `-${formatTime(remaining)}` : '0:00'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1">
              {hasPrevLesson && (
                <button
                  type="button"
                  onClick={onPrevLesson}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Bài trước"
                >
                  <SkipBack size={16} />
                </button>
              )}

              <button
                type="button"
                onClick={onTogglePlay}
                className="h-9 w-11 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 text-white"
                title={isPlaying ? 'Tạm dừng' : 'Phát bài học'}
              >
                {isPlaying ? (
                  <Pause size={18} className="fill-white" />
                ) : (
                  <Play size={18} className="fill-white ml-0.5" />
                )}
              </button>

              {hasNextLesson && (
                <button
                  type="button"
                  onClick={onNextLesson}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Bài tiếp theo"
                >
                  <SkipForward size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onToggleMute}
                className="p-1 text-white/70 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
              >
                {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              </button>
              <ElasticSlider
                value={isMuted ? 0 : Math.round(volume * 100)}
                defaultValue={100}
                maxValue={100}
                startingValue={0}
                leftIcon={<HugeiconsIcon icon={VolumeLowIcon} size={15} strokeWidth={2} />}
                rightIcon={<HugeiconsIcon icon={VolumeHighIcon} size={15} strokeWidth={2} />}
                onChange={(val) => onVolumeChange(val / 100)}
                maxStretch={24}
                bounce={0.5}
                growOnHover
                wheel={false}
                orientation="horizontal"
                iconPlacement="outside"
                valuePosition="none"
                thickness={3.5}
                activeThickness={7}
                radius={20}
                trackColor="rgba(255,255,255,0.22)"
                rangeColor="#ffffff"
                iconColor="rgba(255,255,255,0.7)"
                thumbColor="#ffffff"
                className="w-24 sm:w-28"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
