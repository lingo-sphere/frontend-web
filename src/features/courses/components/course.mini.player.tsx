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

  const handlePrev = () => {
    if (hasPrevLesson && onPrevLesson) {
      onPrevLesson()
    } else {
      onSeek(Math.max(0, currentTime - 10))
    }
  }

  const handleNext = () => {
    if (hasNextLesson && onNextLesson) {
      onNextLesson()
    } else {
      onSeek(Math.min(duration || 1000, currentTime + 10))
    }
  }

  return (
    <div
      role="region"
      aria-label="Mini course audio player"
      className="fixed bottom-6 right-6 z-50 w-[470px] max-w-[calc(100vw-2rem)] rounded-[28px] bg-[#14121c]/95 text-white p-5 border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl select-none animate-in fade-in slide-in-from-bottom-8 duration-300 transition-all font-sans"
    >
      <div className="flex items-stretch gap-4">
        <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 shadow-lg border border-white/10 bg-black/60">
          <img
            src={thumbnail}
            alt={lesson.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
          {isPlaying && (
            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[9px] font-bold text-emerald-400 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 pr-2">
              <h4 className="text-base font-bold text-white truncate leading-snug tracking-tight">
                {lesson.title}
              </h4>
              <p className="text-xs text-neutral-400 truncate mt-0.5 font-normal">
                {courseTitle}
              </p>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onMaximize}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Phóng to trình phát"
              >
                <Maximize2 size={15} />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Đóng mini player"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          <div className="w-full my-1">
            <ElasticSlider
              value={currentTime}
              defaultValue={0}
              maxValue={duration > 0 ? duration : 100}
              startingValue={0}
              leftIcon={null}
              rightIcon={null}
              onChange={(val) => onSeek(val)}
              formatValue={(val) => formatTime(val)}
              valuePosition="none"
              thickness={4.5}
              activeThickness={8}
              radius={999}
              trackColor="rgba(255,255,255,0.18)"
              rangeColor="#ffffff"
              thumb={false}
              growOnHover
              wheel={false}
              jumpToClick
              className="w-full"
            />
            <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono tabular-nums mt-1 px-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? `-${formatTime(remaining)}` : '0:00'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                title="Bài trước / Lùi 10 giây"
              >
                <SkipBack size={18} strokeWidth={2} />
              </button>

              <button
                type="button"
                onClick={onTogglePlay}
                className="h-11 w-13 rounded-2xl bg-[#282438] hover:bg-[#342f47] border border-white/10 flex items-center justify-center transition-all cursor-pointer shadow-md active:scale-95 text-white"
                title={isPlaying ? 'Tạm dừng' : 'Phát bài học'}
              >
                {isPlaying ? (
                  <Pause size={19} className="fill-white text-white" strokeWidth={2.5} />
                ) : (
                  <Play size={19} className="fill-white text-white ml-0.5" strokeWidth={2.5} />
                )}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
                title="Bài tiếp theo / Tiến 10 giây"
              >
                <SkipForward size={18} strokeWidth={2} />
              </button>
            </div>

            <div className="flex items-center">
              <ElasticSlider
                value={isMuted ? 0 : Math.round(volume * 100)}
                defaultValue={100}
                maxValue={100}
                startingValue={0}
                leftIcon={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggleMute()
                    }}
                    className="grid place-items-center cursor-pointer text-neutral-400 hover:text-white transition-colors"
                    title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                  >
                    <HugeiconsIcon
                      icon={VolumeLowIcon}
                      size={16}
                      strokeWidth={1.75}
                      className={isMuted ? 'opacity-30' : 'opacity-80'}
                    />
                  </button>
                }
                rightIcon={
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onVolumeChange(1)
                    }}
                    className="grid place-items-center cursor-pointer text-neutral-400 hover:text-white transition-colors"
                    title="Âm lượng tối đa"
                  >
                    <HugeiconsIcon
                      icon={VolumeHighIcon}
                      size={16}
                      strokeWidth={1.75}
                      className={isMuted ? 'opacity-30' : 'opacity-80'}
                    />
                  </button>
                }
                onChange={(val) => onVolumeChange(val / 100)}
                maxStretch={20}
                bounce={0.5}
                growOnHover
                wheel={false}
                orientation="horizontal"
                iconPlacement="outside"
                valuePosition="none"
                thickness={3.5}
                activeThickness={7}
                radius={999}
                trackColor="rgba(255,255,255,0.18)"
                rangeColor="#ffffff"
                iconColor="rgba(255,255,255,0.7)"
                thumbColor="#ffffff"
                jumpToClick
                className="w-24 sm:w-28"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
