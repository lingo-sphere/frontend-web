'use client'

/**
 * @file player.settings.menu.tsx
 * @description Thành phần mã nguồn player.settings.menu.tsx
 */

import { useState } from 'react'
import {
  Settings,
  SlidersHorizontal,
  FastForward,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react'
import { PLAYBACK_SPEEDS, QUALITIES } from './player.types'

interface PlayerSettingsMenuProps {
  showSettingsMenu: boolean
  playbackSpeed: number
  selectedQuality: string
  autoResolvedQuality: '1080p' | '720p' | '360p'
  effectiveQualityKey: string
  onToggleMenu: () => void
  onSpeedChange: (speed: number) => void
  onQualityChange: (qualityId: string) => void
}

export function PlayerSettingsMenu({
  showSettingsMenu,
  playbackSpeed,
  selectedQuality,
  autoResolvedQuality,
  effectiveQualityKey,
  onToggleMenu,
  onSpeedChange,
  onQualityChange,
}: PlayerSettingsMenuProps) {
  const [settingsSubmenu, setSettingsSubmenu] = useState<'main' | 'quality' | 'speed'>('main')

  return (
    <div className="relative">
      <button
        onClick={() => {
          onToggleMenu()
          setSettingsSubmenu('main')
        }}
        className={`p-1.5 rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative ${
          showSettingsMenu ? 'rotate-45' : ''
        }`}
        title="Cài đặt (Tốc độ & Chất lượng)"
      >
        <Settings size={18} />
        {(effectiveQualityKey === '1080p' || effectiveQualityKey === '720p') && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#ff0000] text-white text-[8px] font-black px-1 rounded-sm leading-tight tracking-tighter shadow-sm pointer-events-none">
            HD
          </span>
        )}
      </button>

      {showSettingsMenu && (
        <div className="absolute bottom-full right-0 mb-3 min-w-[270px] w-max max-w-xs rounded-2xl bg-[#0f0f0f]/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 text-white">
          {settingsSubmenu === 'main' && (
            <div className="space-y-1">
              <button
                onClick={() => setSettingsSubmenu('quality')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer gap-4"
              >
                <span className="flex items-center gap-2.5 text-white/90 shrink-0 whitespace-nowrap">
                  <SlidersHorizontal size={15} className="text-[#ff0000]" />
                  <span className="font-semibold whitespace-nowrap">Chất lượng</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-white/60 shrink-0 whitespace-nowrap">
                  <span className="whitespace-nowrap">
                    {selectedQuality === 'auto'
                      ? `Tự động (${autoResolvedQuality})`
                      : selectedQuality.toUpperCase()}
                  </span>
                  <ChevronRight size={13} />
                </span>
              </button>

              <button
                onClick={() => setSettingsSubmenu('speed')}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer gap-4"
              >
                <span className="flex items-center gap-2.5 text-white/90 shrink-0 whitespace-nowrap">
                  <FastForward size={15} className="text-[#ff0000]" />
                  <span className="font-semibold whitespace-nowrap">Tốc độ phát</span>
                </span>
                <span className="flex items-center gap-1 text-[11px] text-white/60 shrink-0 whitespace-nowrap">
                  <span className="whitespace-nowrap">
                    {playbackSpeed === 1.0 ? 'Chuẩn' : `${playbackSpeed}x`}
                  </span>
                  <ChevronRight size={13} />
                </span>
              </button>
            </div>
          )}

          {settingsSubmenu === 'quality' && (
            <div className="space-y-0.5">
              <button
                onClick={() => setSettingsSubmenu('main')}
                className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white/70 hover:text-white border-b border-white/10 cursor-pointer mb-1 whitespace-nowrap"
              >
                <ChevronLeft size={14} />
                <span className="whitespace-nowrap">Chất lượng video</span>
              </button>
              {QUALITIES.map((q) => {
                const isSelected = selectedQuality === q.id
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      onQualityChange(q.id)
                      setSettingsSubmenu('main')
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected ? 'bg-white/15 text-white font-bold' : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span className="whitespace-nowrap">
                        {q.id === 'auto' ? `Tự động (${autoResolvedQuality})` : q.label}
                      </span>
                      {q.badge && (
                        <span className="rounded bg-[#ff0000]/20 text-[#ff0000] px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap">
                          {q.badge}
                        </span>
                      )}
                    </span>
                    {isSelected && <Check size={13} className="text-[#ff0000] ml-3 shrink-0" />}
                  </button>
                )
              })}
            </div>
          )}

          {settingsSubmenu === 'speed' && (
            <div className="space-y-0.5">
              <button
                onClick={() => setSettingsSubmenu('main')}
                className="w-full flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white/70 hover:text-white border-b border-white/10 cursor-pointer mb-1 whitespace-nowrap"
              >
                <ChevronLeft size={14} />
                <span className="whitespace-nowrap">Tốc độ phát lại</span>
              </button>
              {PLAYBACK_SPEEDS.map((speed) => (
                <button
                  key={speed}
                  onClick={() => {
                    onSpeedChange(speed)
                    setSettingsSubmenu('main')
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
          )}
        </div>
      )}
    </div>
  )
}
