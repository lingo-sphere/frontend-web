'use client'

/**
 * @file CourseScheduleModal.tsx
 * @description Modal cài đặt lịch nhắc nhở học tập hàng ngày tích hợp bộ chọn giờ custom đẹp mắt và đa ngôn ngữ
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  Clock,
  X,
  Mail,
  Check,
  Trash2,
  Loader2,
  Sparkles,
  BellRing,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import type { UserScheduleData } from '@/components/course/course.schedule.banner'

const DAYS_OF_WEEK = [
  { id: 'T2', shortVi: 'T2', shortEn: 'Mon', labelVi: 'Thứ 2', labelEn: 'Monday' },
  { id: 'T3', shortVi: 'T3', shortEn: 'Tue', labelVi: 'Thứ 3', labelEn: 'Tuesday' },
  { id: 'T4', shortVi: 'T4', shortEn: 'Wed', labelVi: 'Thứ 4', labelEn: 'Wednesday' },
  { id: 'T5', shortVi: 'T5', shortEn: 'Thu', labelVi: 'Thứ 5', labelEn: 'Thursday' },
  { id: 'T6', shortVi: 'T6', shortEn: 'Fri', labelVi: 'Thứ 6', labelEn: 'Friday' },
  { id: 'T7', shortVi: 'T7', shortEn: 'Sat', labelVi: 'Thứ 7', labelEn: 'Saturday' },
  { id: 'CN', shortVi: 'CN', shortEn: 'Sun', labelVi: 'Chủ nhật', labelEn: 'Sunday' },
]

const TIME_PRESETS = [
  { time: '07:00', labelVi: '07:00 (Sáng)', labelEn: '07:00 AM (Morning)' },
  { time: '12:30', labelVi: '12:30 (Trưa)', labelEn: '12:30 PM (Noon)' },
  { time: '20:00', labelVi: '20:00 (Tối)', labelEn: '08:00 PM (Evening)' },
  { time: '21:30', labelVi: '21:30 (Đêm)', labelEn: '09:30 PM (Night)' },
]

const HOURS_LIST = Array.from({ length: 24 }, (_, i) => (i < 10 ? `0${i}` : `${i}`))
const MINUTES_LIST = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']

function formatTimeDisplay(timeStr: string, isVi: boolean) {
  const [hStr, mStr] = (timeStr || '20:00').split(':')
  const h = parseInt(hStr || '20', 10)
  const m = parseInt(mStr || '00', 10)
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  const time24 = `${pad(h)}:${pad(m)}`
  const h12 = h % 12 === 0 ? 12 : h % 12
  const isPM = h >= 12
  const period12 = isVi ? (isPM ? 'CH' : 'SA') : (isPM ? 'PM' : 'AM')

  let periodDesc = ''
  let periodEmoji = '🌅'
  if (h >= 0 && h < 5) {
    periodDesc = isVi ? 'Đêm muộn' : 'Late night'
    periodEmoji = '🌙'
  } else if (h >= 5 && h < 11) {
    periodDesc = isVi ? 'Buổi sáng' : 'Morning'
    periodEmoji = '🌅'
  } else if (h >= 11 && h < 14) {
    periodDesc = isVi ? 'Buổi trưa' : 'Noon'
    periodEmoji = '☀️'
  } else if (h >= 14 && h < 18) {
    periodDesc = isVi ? 'Buổi chiều' : 'Afternoon'
    periodEmoji = '🌤️'
  } else if (h >= 18 && h < 22) {
    periodDesc = isVi ? 'Buổi tối' : 'Evening'
    periodEmoji = '🌆'
  } else {
    periodDesc = isVi ? 'Ban đêm' : 'Night'
    periodEmoji = '🌃'
  }

  return {
    time24,
    time12: `${pad(h12)}:${pad(m)} ${period12}`,
    periodDesc,
    periodEmoji,
    label: isVi
      ? `${time24} • ${pad(h12)}:${pad(m)} ${period12} (${periodDesc})`
      : `${pad(h12)}:${pad(m)} ${period12} • ${time24} (${periodDesc})`,
  }
}

interface CourseScheduleModalProps {
  initialSchedule?: UserScheduleData | null
  onClose: () => void
  onSaved: (newSchedule: UserScheduleData) => void
  onCancelled: () => void
}

export function CourseScheduleModal({
  initialSchedule,
  onClose,
  onSaved,
  onCancelled,
}: CourseScheduleModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'
  const { user } = useAuthStore()

  const [reminderTime, setReminderTime] = useState(initialSchedule?.reminder_time || '20:00')
  const [selectedDays, setSelectedDays] = useState<string[]>(
    initialSchedule?.reminder_days && initialSchedule.reminder_days.length > 0
      ? initialSchedule.reminder_days
      : ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  )
  const [duration, setDuration] = useState<number>(initialSchedule?.study_duration_minutes || 30)
  const [enableEmail, setEnableEmail] = useState<boolean>(
    initialSchedule?.is_email_notification_enabled !== undefined
      ? initialSchedule.is_email_notification_enabled
      : true
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  const timePickerRef = useRef<HTMLDivElement>(null)
  const hoursScrollRef = useRef<HTMLDivElement>(null)
  const minutesScrollRef = useRef<HTMLDivElement>(null)

  const hasActiveSchedule = Boolean(initialSchedule?.is_reminder_enabled && initialSchedule?.reminder_time)

  useEffect(() => {
    if (initialSchedule) {
      if (initialSchedule.reminder_time) setReminderTime(initialSchedule.reminder_time)
      if (initialSchedule.reminder_days && initialSchedule.reminder_days.length > 0) {
        setSelectedDays(initialSchedule.reminder_days)
      }
      if (initialSchedule.study_duration_minutes) setDuration(initialSchedule.study_duration_minutes)
      if (initialSchedule.is_email_notification_enabled !== undefined) {
        setEnableEmail(initialSchedule.is_email_notification_enabled)
      }
    }
  }, [initialSchedule])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (timePickerRef.current && !timePickerRef.current.contains(e.target as Node)) {
        setIsTimePickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const currentHourStr = useMemo(() => {
    return (reminderTime || '20:00').split(':')[0] || '20'
  }, [reminderTime])

  const currentMinuteStr = useMemo(() => {
    return (reminderTime || '20:00').split(':')[1] || '00'
  }, [reminderTime])

  const timeDisplayInfo = useMemo(() => {
    return formatTimeDisplay(reminderTime, isVi)
  }, [reminderTime, isVi])

  const handleSelectHour = (hour: string) => {
    setReminderTime(`${hour}:${currentMinuteStr}`)
  }

  const handleSelectMinute = (minute: string) => {
    setReminderTime(`${currentHourStr}:${minute}`)
  }

  const handleSetCurrentTime = () => {
    const now = new Date()
    const h = now.getHours()
    const m = Math.round(now.getMinutes() / 5) * 5
    const normalizedH = h < 10 ? `0${h}` : `${h}`
    const normalizedM = m >= 60 ? '55' : m < 10 ? `0${m}` : `${m}`
    setReminderTime(`${normalizedH}:${normalizedM}`)
  }

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev
        return prev.filter((d) => d !== dayId)
      } else {
        return [...prev, dayId]
      }
    })
  }

  const selectAllDays = () => {
    if (selectedDays.length === DAYS_OF_WEEK.length) {
      setSelectedDays(['T2', 'T3', 'T4', 'T5', 'T6'])
    } else {
      setSelectedDays(DAYS_OF_WEEK.map((d) => d.id))
    }
  }

  const handleSave = async () => {
    if (!reminderTime.trim()) {
      toast.warning(isVi ? 'Vui lòng chọn khung giờ nhắc nhở' : 'Please select reminder time')
      return
    }

    if (selectedDays.length === 0) {
      toast.warning(isVi ? 'Vui lòng chọn ít nhất 1 ngày trong tuần' : 'Please select at least one day')
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        reminder_time: reminderTime,
        reminder_days: selectedDays,
        study_duration_minutes: duration,
        is_reminder_enabled: true,
        is_email_notification_enabled: enableEmail,
      }

      await userService.updateMySettings(payload)

      toast.success(
        isVi
          ? `Đã lưu lịch nhắc học vào lúc ${timeDisplayInfo.time24}!`
          : `Saved study reminder at ${timeDisplayInfo.time12}!`,
        isVi ? 'Lên lịch thành công' : 'Schedule Saved'
      )

      onSaved(payload)
      onClose()
    } catch {
      toast.error(
        isVi ? 'Không thể lưu lịch học. Vui lòng thử lại sau.' : 'Failed to save schedule. Please try again.',
        isVi ? 'Lỗi' : 'Error'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancelSchedule = async () => {
    setIsDeleting(true)
    try {
      const payload = {
        is_reminder_enabled: false,
      }

      await userService.updateMySettings(payload)

      toast.info(
        isVi ? 'Đã hủy lịch nhắc nhở học tập hàng ngày.' : 'Cancelled daily study reminder schedule.',
        isVi ? 'Đã hủy lịch' : 'Schedule Cancelled'
      )

      onCancelled()
      onClose()
    } catch {
      toast.error(
        isVi ? 'Không thể hủy lịch học. Vui lòng thử lại.' : 'Failed to cancel schedule.',
        isVi ? 'Lỗi' : 'Error'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-7 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-xs">
              <Calendar size={22} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-text-primary">
                {hasActiveSchedule
                  ? (isVi ? 'Chỉnh sửa lịch nhắc học' : 'Edit Study Reminder Schedule')
                  : (isVi ? 'Lên lịch học tập hàng ngày' : 'Set Daily Study Schedule')}
              </h3>
              <p className="text-xs text-text-secondary">
                {isVi
                  ? 'Nhận email nhắc nhở tự động đúng khung giờ bạn chọn'
                  : 'Automated email notifications sent at your chosen time'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 flex items-center gap-3 text-xs">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-text-primary">
              {isVi ? 'Hòm thư nhận thông báo:' : 'Notification inbox:'}
            </div>
            <div className="truncate font-mono text-primary font-bold">{user?.email || 'user@example.com'}</div>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <Check size={14} />
            <span>{isVi ? 'Đã xác thực' : 'Verified'}</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
              {isVi ? '1. Chọn ngày học trong tuần' : '1. Select Study Days'}
            </label>
            <button
              type="button"
              onClick={selectAllDays}
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
                  onClick={() => toggleDay(day.id)}
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

        <div className="space-y-2.5 relative" ref={timePickerRef}>
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
              {isVi ? '2. Chọn khung giờ nhắc nhở' : '2. Select Reminder Time'}
            </label>
            <span className="text-xs font-medium text-text-tertiary">
              {timeDisplayInfo.periodEmoji} {timeDisplayInfo.periodDesc}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsTimePickerOpen((prev) => !prev)}
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
                      <span>{timeDisplayInfo.periodEmoji}</span>
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
                              onClick={() => handleSelectHour(h)}
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
                              onClick={() => handleSelectMinute(m)}
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
                      onClick={handleSetCurrentTime}
                      className="inline-flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-primary transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>{isVi ? 'Giờ hiện tại' : 'Current Time'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsTimePickerOpen(false)}
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
                  onClick={() => {
                    setReminderTime(p.time)
                    setIsTimePickerOpen(false)
                  }}
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


        <label className="flex items-start gap-3 rounded-2xl border border-border bg-surface-hover/40 p-3.5 cursor-pointer hover:border-border-hover transition-colors">
          <input
            type="checkbox"
            checked={enableEmail}
            onChange={(e) => setEnableEmail(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded-md border-border text-primary focus:ring-primary accent-primary cursor-pointer"
          />
          <div className="text-xs space-y-0.5">
            <div className="font-bold text-text-primary">
              {isVi ? 'Gửi email nhắc nhở học tập' : 'Send study reminder email'}
            </div>
            <div className="text-text-secondary">
              {isVi
                ? 'Nhận email chứa liên kết vào bài học nhanh và mẹo ôn tập hữu ích mỗi ngày'
                : 'Receive daily emails with direct study links and high-impact study tips'}
            </div>
          </div>
        </label>

        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300">
          <Sparkles size={16} className="shrink-0 text-amber-500" />
          <span>
            {isVi
              ? 'Học viên duy trì lịch học ngắt quãng đạt điểm TOEIC trung bình cao hơn 68%.'
              : 'Students with consistent spaced study schedules achieve 68% higher TOEIC scores.'}
          </span>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2.5 border-t border-border pt-4">
          <div>
            {hasActiveSchedule && (
              <button
                type="button"
                onClick={handleCancelSchedule}
                disabled={isDeleting || isSubmitting}
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>{isVi ? 'Hủy lịch nhắc học' : 'Cancel Schedule'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-5 py-2.5 text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors cursor-pointer"
            >
              {isVi ? 'Đóng' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSubmitting || isDeleting}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-2.5 text-xs font-bold text-white hover:bg-primary-hover transition-all cursor-pointer shadow-md shadow-primary/25 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{isVi ? 'Đang lưu...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <BellRing size={14} />
                  <span>
                    {hasActiveSchedule
                      ? (isVi ? 'Cập nhật lịch' : 'Update Schedule')
                      : (isVi ? 'Lưu lịch nhắc học' : 'Save Schedule')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
