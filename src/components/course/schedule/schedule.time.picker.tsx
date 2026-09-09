// Component bộ chọn giờ tuỳ chỉnh cuộn mượt và danh sách khung giờ nhanh (presets)
'use client'

import { RefObject } from 'react'
import { Clock, ChevronDown, RotateCcw, Sun, Moon, Sunrise, Sunset } from 'lucide-react'
import {
  HOURS_LIST,
  MINUTES_LIST,
  TIME_PRESETS,
  type formatTimeDisplay,
} from './schedule.types'

interface ScheduleTimePickerProps {
  reminderTime: string
  isTimePickerOpen: boolean
  isVi: boolean
  timeDisplayInfo: ReturnType<typeof formatTimeDisplay>
  timePickerRef: RefObject<HTMLDivElement | null>
  hoursScrollRef: RefObject<HTMLDivElement | null>
  minutesScrollRef: RefObject<HTMLDivElement | null>
  onToggleTimePicker: () => void
  onCloseTimePicker: () => void
  onSelectHour: (hour: string) => void
  onSelectMinute: (minute: string) => void
  onSetCurrentTime: () => void
  onSelectPreset: (time: string) => void
}

function PeriodIconBadge({ icon, size = 13 }: { icon: string; size?: number }) {
  switch (icon) {
    case 'moon':
      return <Moon size={size} className="text-indigo-400 shrink-0" />
    case 'sunrise':
      return <Sunrise size={size} className="text-amber-500 shrink-0" />
    case 'sunset':
      return <Sunset size={size} className="text-rose-500 shrink-0" />
    default:
      return <Sun size={size} className="text-amber-500 shrink-0" />
  }
}

export function ScheduleTimePicker({
  reminderTime,
  isTimePickerOpen,
  isVi,
  timeDisplayInfo,
  timePickerRef,
  hoursScrollRef,
  minutesScrollRef,
  onToggleTimePicker,
  onCloseTimePicker,
  onSelectHour,
  onSelectMinute,
  onSetCurrentTime,
  onSelectPreset,
}: ScheduleTimePickerProps) {
  const currentHourStr = (reminderTime || '20:00').split(':')[0] || '20'
  const currentMinuteStr = (reminderTime || '20:00').split(':')[1] || '00'

  return (
    <div className="space-y-2.5 relative" ref={timePickerRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
          {isVi ? '2. Chọn khung giờ nhắc nhở' : '2. Select Reminder Time'}
        </label>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
          <PeriodIconBadge icon={timeDisplayInfo.periodIcon} />
          <span>{timeDisplayInfo.periodDesc}</span>
        </span>
      </div>

      <button
        type="button"
        onClick={onToggleTimePicker}
        className={`w-full rounded-2xl border px-4 py-3 text-left transition-all duration-250 cursor-pointer flex items-center justify-between gap-3 shadow-2xs ${
          isTimePickerOpen
            ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.03]'
            : 'border-border hover:border-primary/50 bg-surface hover:bg-surface-hover/40'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-250 ${
              isTimePickerOpen ? 'bg-primary text-white shadow-xs' : 'bg-primary/10 text-primary'
            }`}
          >
            <Clock size={18} />
          </div>
          <div className="min-w-0">
            <div className="text-base font-extrabold text-text-primary tracking-wide">
              {timeDisplayInfo.time24}
            </div>
            <div className="text-xs text-text-secondary truncate">
              {timeDisplayInfo.time12} • {timeDisplayInfo.periodDesc}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border transition-colors duration-250 ${
              isTimePickerOpen
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-surface-hover border-border text-text-secondary'
            }`}
          >
            {isVi ? 'Tùy chỉnh' : 'Custom'}
          </span>
          <div className="text-text-tertiary">
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ease-out ${
                isTimePickerOpen ? 'rotate-180 text-primary' : 'text-text-tertiary'
              }`}
            />
          </div>
        </div>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isTimePickerOpen
            ? 'grid-rows-[1fr] opacity-100 pointer-events-auto'
            : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-2">
            <div className="rounded-3xl border border-border bg-surface p-4 shadow-xl space-y-3.5 transition-all duration-300">
              <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-extrabold text-text-primary">
                  <Clock size={14} className="text-primary" />
                  <span>{isVi ? 'Bộ chọn giờ nhắc học' : 'Time Selector'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                  <PeriodIconBadge icon={timeDisplayInfo.periodIcon} />
                  <span>{timeDisplayInfo.periodDesc}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="text-center text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                    {isVi ? 'Giờ (00 - 23)' : 'Hour (00 - 23)'}
                  </div>
                  <div
                    ref={hoursScrollRef}
                    className="h-44 overflow-y-auto space-y-1 pr-1 scrollbar-thin border border-border/60 rounded-2xl p-1.5 bg-surface-subtle/30 scroll-smooth"
                  >
                    {HOURS_LIST.map((h) => {
                      const isSelected = h === currentHourStr
                      const hNum = parseInt(h, 10)
                      const isPM = hNum >= 12
                      const h12 = hNum % 12 === 0 ? 12 : hNum % 12
                      const h12Pad = h12 < 10 ? `0${h12}` : `${h12}`
                      const periodText = isVi ? (isPM ? 'CH' : 'SA') : (isPM ? 'PM' : 'AM')

                      return (
                        <button
                          key={h}
                          type="button"
                          onClick={() => onSelectHour(h)}
                          className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-primary text-white shadow-sm shadow-primary/30 font-black scale-[1.01]'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                          }`}
                        >
                          <span className="text-sm tracking-wide">{h}:00</span>
                          <span className="text-[10px] opacity-75">
                            {h12Pad} {periodText}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="text-center text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                    {isVi ? 'Phút (00 - 55)' : 'Minute (00 - 55)'}
                  </div>
                  <div
                    ref={minutesScrollRef}
                    className="h-44 overflow-y-auto space-y-1 pr-1 scrollbar-thin border border-border/60 rounded-2xl p-1.5 bg-surface-subtle/30 scroll-smooth"
                  >
                    {MINUTES_LIST.map((m) => {
                      const isSelected = m === currentMinuteStr
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => onSelectMinute(m)}
                          className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-primary text-white shadow-sm shadow-primary/30 font-black scale-[1.01]'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                          }`}
                        >
                          <span className="text-sm tracking-wide">:{m}</span>
                          <span className="text-[10px] opacity-75">
                            {m} {isVi ? 'phút' : 'min'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/80 pt-2.5">
                <button
                  type="button"
                  onClick={onSetCurrentTime}
                  className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-primary transition-colors cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>{isVi ? 'Giờ hiện tại' : 'Current Time'}</span>
                </button>

                <button
                  type="button"
                  onClick={onCloseTimePicker}
                  className="rounded-xl bg-primary text-white px-4 py-1.5 text-xs font-bold hover:bg-primary-hover transition-colors cursor-pointer shadow-xs"
                >
                  {isVi ? 'Xác nhận' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-semibold text-text-tertiary">
          {isVi ? 'Hoặc chọn nhanh khung giờ gợi ý:' : 'Or choose a preset time:'}
        </span>
        <div className="flex flex-wrap gap-2">
          {TIME_PRESETS.map((p) => (
            <button
              key={p.time}
              type="button"
              onClick={() => onSelectPreset(p.time)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                reminderTime === p.time
                  ? 'border-primary bg-primary/10 text-primary shadow-xs'
                  : 'border-border bg-surface text-text-secondary hover:border-primary/40 hover:bg-surface-hover'
              }`}
            >
              {isVi ? p.labelVi : p.labelEn}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
