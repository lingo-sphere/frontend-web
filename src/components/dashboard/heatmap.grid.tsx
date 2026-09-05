/**
 * @file heatmap.grid.tsx
 * @description Component giao diện React HeatmapGrid cho học viên
 */

import { Button } from '@/components/ui/button'
import { Icon } from '@/components/icons/icon.map'
import type { HeatmapDay } from '@/types/dashboard'

interface HeatmapGridProps {
  days: HeatmapDay[]
  selectedDayId: string
  onSelect: (day: HeatmapDay) => void
}

const monthLabels = ['Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8']
const weekdayLabels = ['', 'T3', '', 'T5', '', 'T7', '']
const intensityClass: Record<number, string> = {
  0: 'heatmap-cell-level-0',
  1: 'heatmap-cell-level-1',
  2: 'heatmap-cell-level-2',
  3: 'heatmap-cell-level-3',
  4: 'heatmap-cell-level-4',
}

export function HeatmapGrid({ days, selectedDayId, onSelect }: HeatmapGridProps) {
  return (
    <div className="min-w-0 overflow-x-auto pb-1">
      <div className="min-w-[430px]">
        <div className="grid grid-cols-4 gap-2 text-center text-[13px] font-semibold text-text-secondary">
          {monthLabels.map((month) => <span key={month}>{month}</span>)}
        </div>
        <div className="mt-3 grid grid-cols-[28px_minmax(0,1fr)] items-start gap-2">
          <div className="grid grid-rows-7 gap-1.5 text-right text-[12px] font-medium leading-6 text-text-tertiary">
            {weekdayLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
          </div>
          <div className="grid gap-1.5">
            {Array.from({ length: 7 }, (_, row) => (
              <div className="grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1.5" key={row}>
                {Array.from({ length: 13 }, (_, column) => {
                  const day = days[row * 13 + column]
                  if (!day) return <span aria-hidden="true" className="heatmap-cell-level-0 h-6 w-full rounded-md opacity-50" key={`${row}-${column}`} />
                  const selected = day.id === selectedDayId
                  return (
                    <Button
                      aria-label={`${day.date}, ${day.minutes} phút học`}
                      aria-pressed={selected}
                      className={`heatmap-cell ${intensityClass[day.intensity]} h-6 min-w-0 w-full rounded-md p-0 hover:brightness-95 ${selected ? 'heatmap-cell-selected' : ''}`}
                      key={day.id}
                      onClick={() => onSelect(day)}
                      size="icon"
                      variant="ghost"
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[12px] text-text-secondary">
          <span>Ít</span>
          {[0, 1, 2, 3, 4].map((level) => <span aria-hidden="true" className={`heatmap-cell ${intensityClass[level]} inline-block h-5 w-5 rounded-md`} key={level} />)}
          <span>Nhiều</span>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-5 text-[12px] text-text-secondary">
          <span className="flex items-center gap-2"><span className="h-6 w-6 rounded-md border-[3px] border-primary bg-success/30" />Đã điểm danh</span>
          <span className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-md border border-border bg-info-soft"><Icon className="text-info" name="snowflake" size={14} /></span>Đã dùng freeze</span>
        </div>
      </div>
    </div>
  )
}
