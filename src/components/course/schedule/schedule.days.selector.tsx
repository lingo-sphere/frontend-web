/**
 * @file schedule.days.selector.tsx
 * @description Component chọn các ngày trong tuần để gửi thông báo nhắc học
 */

'use client'

import { DAYS_OF_WEEK } from './schedule.types'

interface ScheduleDaysSelectorProps {
  selectedDays: string[]
  isVi: boolean
  onToggleDay: (dayId: string) => void
  onSelectAllDays: () => void
}

export function ScheduleDaysSelector({
  selectedDays,
  isVi,
  onToggleDay,
  onSelectAllDays,
}: ScheduleDaysSelectorProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
          {isVi ? '1. Chọn ngày học trong tuần' : '1. Select Study Days'}
        </label>
        <button
          type="button"
          onClick={onSelectAllDays}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer"
        >
          {selectedDays.length === DAYS_OF_WEEK.length
            ? (isVi ? 'Chỉ ngày trong tuần (T2-T6)' : 'Weekdays only (Mon-Fri)')
            : (isVi ? 'Chọn tất cả (Hàng ngày)' : 'Select all (Daily)')}
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {DAYS_OF_WEEK.map((day) => {
          const isSelected = selectedDays.includes(day.id)
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onToggleDay(day.id)}
              className={`flex flex-col items-center justify-center py-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]'
                  : 'border-border bg-surface text-text-secondary hover:border-primary/50 hover:bg-surface-hover'
              }`}
            >
              <span className="text-xs font-black">{isVi ? day.shortVi : day.shortEn}</span>
              <span className="text-[10px] font-medium opacity-80">{isVi ? day.labelVi : day.labelEn}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
