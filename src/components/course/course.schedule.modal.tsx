'use client'

/**
 * @file course.schedule.modal.tsx
 * @description Modal cài đặt lịch nhắc nhở học tập hàng ngày tích hợp bộ chọn giờ custom đẹp mắt và đa ngôn ngữ
 */

import { useState, useEffect, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Calendar,
  X,
  Mail,
  Check,
  Trash2,
  Loader2,
  Sparkles,
  BellRing,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import type { UserScheduleData } from '@/components/course/course.schedule.banner'
import {
  DAYS_OF_WEEK,
  formatTimeDisplay,
} from './schedule/schedule.types'
import { ScheduleDaysSelector } from './schedule/schedule.days.selector'
import { ScheduleTimePicker } from './schedule/schedule.time.picker'

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

        <ScheduleDaysSelector
          selectedDays={selectedDays}
          isVi={isVi}
          onToggleDay={toggleDay}
          onSelectAllDays={selectAllDays}
        />

        <ScheduleTimePicker
          reminderTime={reminderTime}
          isTimePickerOpen={isTimePickerOpen}
          isVi={isVi}
          timeDisplayInfo={timeDisplayInfo}
          timePickerRef={timePickerRef}
          hoursScrollRef={hoursScrollRef}
          minutesScrollRef={minutesScrollRef}
          onToggleTimePicker={() => setIsTimePickerOpen((prev) => !prev)}
          onCloseTimePicker={() => setIsTimePickerOpen(false)}
          onSelectHour={handleSelectHour}
          onSelectMinute={handleSelectMinute}
          onSetCurrentTime={handleSetCurrentTime}
          onSelectPreset={(time) => {
            setReminderTime(time)
            setIsTimePickerOpen(false)
          }}
        />

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
