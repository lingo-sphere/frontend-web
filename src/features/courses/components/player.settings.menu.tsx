// Menu cài đặt trình phát video cho phép điều chỉnh tốc độ phát lại bài học.

'use client'

import {
  Settings,
  FastForward,
  Check,
} from 'lucide-react'
import { PLAYBACK_SPEEDS } from '@/features/courses/types/player.types'

interface PlayerSettingsMenuProps {
  showSettingsMenu: boolean
  playbackSpeed: number
  onToggleMenu: () => void
  onSpeedChange: (speed: number) => void
}

export function PlayerSettingsMenu({
  showSettingsMenu,
  playbackSpeed,
  onToggleMenu,
  onSpeedChange,
}: PlayerSettingsMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggleMenu}
        className={`p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative ${
          showSettingsMenu ? 'rotate-45' : ''
        }`}
        title="Cài đặt tốc độ phát"
      >
        <Settings size={18} />
      </button>

      {showSettingsMenu && (
        <div className="absolute bottom-full right-0 mb-3 min-w-[220px] w-max max-w-xs rounded-2xl bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
          <div className="px-3 py-2 text-xs font-bold text-white/70 border-b border-white/10 mb-1 flex items-center gap-2">
            <FastForward size={14} className="text-[#ff0000]" />
            <span className="whitespace-nowrap">Tốc độ phát lại</span>
          </div>
          <div className="space-y-0.5">
            {PLAYBACK_SPEEDS.map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => {
                  onSpeedChange(speed)
                  onToggleMenu()
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  playbackSpeed === speed
                    ? 'bg-white/15 text-white font-bold'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <span className="whitespace-nowrap">
                  {speed === 1.0 ? '1.0x (Chuẩn)' : `${speed}x`}
                </span>
                {playbackSpeed === speed && <Check size={13} className="text-[#ff0000] ml-3 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
