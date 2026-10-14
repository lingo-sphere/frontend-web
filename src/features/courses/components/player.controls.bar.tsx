// Thanh điều khiển video bài học bao gồm play/pause, timeline, âm lượng, tốc độ phát và toàn màn hình.

'use client'

import { RefObject } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  Tv,
  PictureInPicture2,
  SkipForward,
  SkipBack,
} from 'lucide-react'
import { formatTime } from '@/features/courses/types/player.types'
import { PlayerSettingsMenu } from '@/features/courses/components/player.settings.menu'

interface PlayerControlsBarProps {
  showControls: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  bufferedPercent: number
  volume: number
  isMuted: boolean
  playbackSpeed: number
  showSettingsMenu: boolean
  isTheater: boolean
  isFullscreen: boolean
  autoPlayNext: boolean
  hasPrevLesson: boolean
  hasNextLesson: boolean
  hoverTime: number | null
  hoverPosition: number
  isTrial?: boolean
  progressBarRef: RefObject<HTMLDivElement | null>
  onTimelineMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void
  onTimelineClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  onTimelineMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void
  onTimelineMouseLeave: () => void
  onTogglePlay: () => void
  onPrevLesson?: () => void
  onNextLesson?: () => void
  onToggleMute: () => void
  onVolumeChange: (vol: number) => void
  onToggleAutoPlay: () => void
  onToggleSettingsMenu?: () => void
  onToggleSettings?: () => void
  onSpeedChange: (speed: number) => void
  onTogglePip: () => void
  onToggleTheater: () => void
  onToggleFullscreen: () => void
  onSeekRelative?: (seconds: number) => void
  onOpenShortcutsModal?: () => void
  onAddNoteAtTimestamp?: () => void
  onOpenCheckout?: () => void
}

export function PlayerControlsBar({
  showControls,
  isPlaying,
  currentTime,
  duration,
  bufferedPercent,
  volume,
  isMuted,
  playbackSpeed,
  showSettingsMenu,
  isTheater,
  isFullscreen,
  autoPlayNext,
  hasPrevLesson,
  hasNextLesson,
  hoverTime,
  hoverPosition,
  progressBarRef,
  onTimelineMouseDown,
  onTimelineClick,
  onTimelineMouseMove,
  onTimelineMouseLeave,
  onTogglePlay,
  onPrevLesson,
  onNextLesson,
  onToggleMute,
  onVolumeChange,
  onToggleAutoPlay,
  onToggleSettingsMenu,
  onToggleSettings,
  onSpeedChange,
  onTogglePip,
  onToggleTheater,
  onToggleFullscreen,
}: PlayerControlsBarProps) {
  const playedPercent = duration > 0 ? (currentTime / duration) * 100 : 0
  const handleTimelineMouseDown = onTimelineMouseDown || onTimelineClick || (() => {})
  const handleToggleSettingsMenu = onToggleSettingsMenu || onToggleSettings || (() => {})

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-30 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-2 px-3 sm:px-4 transition-opacity duration-200 ${
        showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        ref={progressBarRef}
        onMouseDown={handleTimelineMouseDown}
        onMouseMove={onTimelineMouseMove}
        onMouseLeave={onTimelineMouseLeave}
        className="group/timeline relative w-full h-4 cursor-pointer flex items-center mb-1"
      >
        
        <div className="relative w-full h-[3px] group-hover/timeline:h-[5px] rounded-full bg-white/25 transition-all overflow-visible">
          
          <div
            className="absolute top-0 bottom-0 left-0 bg-white/40 rounded-full transition-all"
            style={{ width: `${bufferedPercent}%` }}
          />

          
          <div
            className="absolute top-0 bottom-0 left-0 bg-[#ff0000] rounded-full"
            style={{ width: `${playedPercent}%` }}
          />

          
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-[#ff0000] shadow-md scale-0 group-hover/timeline:scale-100 transition-transform duration-100 pointer-events-none"
            style={{ left: `${playedPercent}%` }}
          />
        </div>

        
        {hoverTime !== null && (
          <div
            className="pointer-events-none absolute -top-8 -translate-x-1/2 rounded bg-[#0f0f0f]/90 text-white font-mono text-[11px] font-semibold px-1.5 py-0.5 shadow-xl border border-white/10"
            style={{ left: `${hoverPosition}%` }}
          >
            {formatTime(hoverTime)}
          </div>
        )}
      </div>

      
      <div className="flex items-center justify-between gap-3 text-white">
        
        <div className="flex items-center gap-1 sm:gap-2">
          {hasPrevLesson && (
            <button
              onClick={onPrevLesson}
              className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Bài học trước"
            >
              <SkipBack size={18} />
            </button>
          )}

          <button
            onClick={onTogglePlay}
            className="p-1.5 text-white hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            title={isPlaying ? 'Tạm dừng (k)' : 'Phát (k)'}
          >
            {isPlaying ? (
              <Pause size={22} className="fill-white" />
            ) : (
              <Play size={22} className="fill-white ml-0.5" />
            )}
          </button>

          {hasNextLesson && (
            <button
              onClick={onNextLesson}
              className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Bài học tiếp theo"
            >
              <SkipForward size={18} />
            </button>
          )}

          
          <div className="group/vol flex items-center">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title={isMuted ? 'Bật âm thanh (m)' : 'Tắt tiếng (m)'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX size={20} />
              ) : volume < 0.5 ? (
                <Volume1 size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>

            <div className="w-0 overflow-hidden group-hover/vol:w-16 transition-all duration-200 ease-out flex items-center ml-1">
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/40 rounded-full appearance-none cursor-pointer accent-[#ff0000]"
              />
            </div>
          </div>

          
          <div className="text-[12px] font-normal text-white/90 select-none ml-2 tracking-normal">
            <span>{formatTime(currentTime)}</span>
            <span className="text-white/50 mx-1">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        
        <div className="flex items-center gap-1 sm:gap-2">
          
          <button
            onClick={onToggleAutoPlay}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer text-xs"
            title={`Tự động chuyển bài: ${autoPlayNext ? 'Đang bật' : 'Đang tắt'}`}
          >
            <span className="text-[11px] font-medium text-white/80 hidden md:inline">
              Tự động phát
            </span>
            <div
              className={`w-7 h-3.5 rounded-full p-0.5 transition-colors duration-200 ease-in-out ${
                autoPlayNext ? 'bg-[#ff0000]' : 'bg-white/30'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full bg-white transition-transform duration-200 ease-in-out ${
                  autoPlayNext ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </div>
          </button>

          
          <PlayerSettingsMenu
            showSettingsMenu={showSettingsMenu}
            playbackSpeed={playbackSpeed}
            onToggleMenu={handleToggleSettingsMenu}
            onSpeedChange={onSpeedChange}
          />

          
          <button
            onClick={onTogglePip}
            className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Hình trong hình (p)"
          >
            <PictureInPicture2 size={18} />
          </button>

          
          <button
            onClick={onToggleTheater}
            className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer hidden sm:block"
            title="Chế độ rạp chiếu (t)"
          >
            <Tv size={18} />
          </button>

          
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={isFullscreen ? 'Thoát toàn màn hình (f)' : 'Toàn màn hình (f)'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      </div>
    </div>
  )
}
