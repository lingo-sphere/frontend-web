/**
 * @file dictation.player.panel.tsx
 * @description Thành phần Dictation Player Panel phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file dictation.player.panel.tsx
 * @description Component điều khiển phát audio/video và tiến trình các câu dictation
 */

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon.map'
import type { ListeningExercise } from '@/types/listening'

function formatDuration(seconds?: number): string {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

interface DictationPlayerPanelProps {
  exercise: ListeningExercise
  isPlaying: boolean
  currentTime: number
  playbackSpeed: number
  activeSegmentIndex: number
  completedSegments: Set<string>
  totalHintsUsed: number
  replayCount: number
  isVietnamese: boolean
  onTogglePlayback: () => void
  onSeekTime: (time: number) => void
  onReplaySegment: () => void
  onReplayPreviousSegment: () => void
  onSetPlaybackSpeed: (speed: number) => void
  onGoToSegment: (index: number) => void
}

export function DictationPlayerPanel({
  exercise,
  isPlaying,
  currentTime,
  playbackSpeed,
  activeSegmentIndex,
  completedSegments,
  totalHintsUsed,
  replayCount,
  isVietnamese,
  onTogglePlayback,
  onSeekTime,
  onReplaySegment,
  onReplayPreviousSegment,
  onSetPlaybackSpeed,
  onGoToSegment,
}: DictationPlayerPanelProps) {
  return (
    <div className="w-180 shrink-0 flex flex-col gap-4">
      <Card className="overflow-hidden">
        <div
          className={`relative ${
            exercise.mediaType === 'VIDEO'
              ? 'aspect-video bg-black'
              : 'h-32 bg-linear-to-br from-primary-20 to-primary-5'
          }`}
        >
          {exercise.mediaType === 'VIDEO' ? (
            <div className="absolute inset-0 flex items-center justify-center bg-surface-subtle">
              <div className="text-center">
                <Icon
                  name="video"
                  size={36}
                  className="text-text-tertiary mx-auto mb-1"
                />
                <p className="text-xs text-text-secondary">Video Player</p>
              </div>
            </div>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-end gap-0.5 h-16">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-all ${
                      currentTime >= (i / 20) * exercise.durationSeconds
                        ? 'bg-primary'
                        : 'bg-primary-20'
                    }`}
                    style={{ height: `${20 + Math.sin(i * 0.5) * 15}%` }}
                  />
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onTogglePlayback}
            className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
              <Icon name={isPlaying ? 'pause' : 'play'} size={24} />
            </div>
          </button>
        </div>

        <CardContent className="p-3">
          <div className="mb-2">
            <input
              type="range"
              min="0"
              max={exercise.durationSeconds}
              step="0.1"
              value={currentTime}
              onChange={(e) => onSeekTime(Number(e.target.value))}
              className="w-full h-1.5 bg-surface-subtle rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-text-tertiary mt-0.5">
              <span>{formatDuration(currentTime)}</span>
              <span>{formatDuration(exercise.durationSeconds)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={onReplayPreviousSegment}
                disabled={activeSegmentIndex === 0}
                className="h-7 w-7 p-0 cursor-pointer"
              >
                <Icon name="chevron-left" size={14} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onReplaySegment}
                className="h-7 px-1.5 cursor-pointer"
              >
                <Icon name="rotate-ccw" size={12} />
              </Button>
            </div>

            <div className="flex items-center gap-0.5 bg-surface-subtle rounded-md p-0.5">
              {[0.75, 1, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => onSetPlaybackSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded text-xs cursor-pointer ${
                    playbackSpeed === speed
                      ? 'bg-primary text-white'
                      : 'text-text-secondary'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {exercise.segments.map((seg, i) => {
          const isCompleted = completedSegments.has(seg.id)
          const isActive = i === activeSegmentIndex && !isCompleted

          return (
            <button
              key={seg.id}
              onClick={() => onGoToSegment(i)}
              className={`
                flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all
                ${
                  isCompleted
                    ? 'bg-success text-white cursor-pointer'
                    : isActive
                      ? 'bg-primary text-white cursor-pointer'
                      : 'bg-surface-subtle text-text-tertiary cursor-not-allowed'
                }
              `}
            >
              {isCompleted ? <Icon name="check" size={12} /> : i + 1}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-text-tertiary">
        <span>{isVietnamese ? 'Gợi ý' : 'Hints'}: {totalHintsUsed}</span>
        <span>{isVietnamese ? 'Nghe lại' : 'Replay'}: {replayCount}</span>
        <span>
          {completedSegments.size}/{exercise.segments.length}
        </span>
      </div>
    </div>
  )
}
