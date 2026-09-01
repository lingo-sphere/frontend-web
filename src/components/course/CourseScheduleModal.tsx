'use client'

/**
 * @file CourseScheduleModal.tsx
 * @description Modal cài đặt lịch nhắc nhở học tập hàng ngày và gửi email cho học viên
 */

import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Clock, X, Mail, Check, Trash2, Loader2, Sparkles, BellRing } from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { userService } from '@/services/user.service'
import { toast } from '@/store/toast-store'
import type { UserScheduleData } from '@/components/course/CourseScheduleBanner'

const DAYS_OF_WEEK = [
  { id: 'T2', labelVi: 'Thứ 2', labelEn: 'Mon' },
  { id: 'T3', labelVi: 'Thứ 3', labelEn: 'Tue' },
  { id: 'T4', labelVi: 'Thứ 4', labelEn: 'Wed' },
  { id: 'T5', labelVi: 'Thứ 5', labelEn: 'Thu' },
  { id: 'T6', labelVi: 'Thứ 6', labelEn: 'Fri' },
  { id: 'T7', labelVi: 'Thứ 7', labelEn: 'Sat' },
  { id: 'CN', labelVi: 'Chủ nhật', labelEn: 'Sun' },
]

const TIME_PRESETS = [
  { time: '07:00', labelVi: '07:00 (Sáng)', labelEn: '07:00 AM' },
  { time: '12:30', labelVi: '12:30 (Trưa)', labelEn: '12:30 PM' },
  { time: '20:00', labelVi: '20:00 (Tối)', labelEn: '08:00 PM' },
  { time: '21:30', labelVi: '21:30 (Đêm)', labelEn: '09:30 PM' },
]

const DURATION_PRESETS = [15, 30, 45, 60]

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

  const toggleDay = (dayId: string) => {
    setSelectedDays((prev) => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev // Keep at least one day
        return prev.filter((d) => d !== dayId)
      } else {
        return [...prev, dayId]
      }
    })
  }

  const selectAllDays = () => {
    if (selectedDays.length === DAYS_OF_WEEK.length) {
      setSelectedDays(['T2', 'T3', 'T4', 'T5', 'T6']) // Default weekdays
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
          ? `Đã lưu lịch nhắc học vào lúc ${reminderTime} (${selectedDays.join(', ')})!`
          : `Saved study reminder at ${reminderTime} (${selectedDays.join(', ')})!`,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg rounded-3xl border border-border bg-surface p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Calendar size={20} />
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

        {/* User Email Banner */}
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

        {/* Days Picker */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
              {isVi ? '1. Chọn ngày học trong tuần' : '1. Select Days of Week'}
            </label>
            <button
              type="button"
              onClick={selectAllDays}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              {selectedDays.length === DAYS_OF_WEEK.length
                ? (isVi ? 'Bỏ chọn cuối tuần' : 'Weekdays only')
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
                  <span>{day.id}</span>
                  <span className="text-[10px] font-normal opacity-80">{isVi ? day.labelVi : day.labelEn}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Picker */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
            {isVi ? '2. Chọn khung giờ nhắc nhở' : '2. Select Reminder Time'}
          </label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full rounded-2xl border border-border bg-surface px-4 py-3 text-base font-bold text-text-primary focus:border-primary focus:outline-hidden transition-colors"
              />
              <Clock size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
            </div>
          </div>
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2 pt-1">
            {TIME_PRESETS.map((p) => (
              <button
                key={p.time}
                type="button"
                onClick={() => setReminderTime(p.time)}
                className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  reminderTime === p.time
                    ? 'border-primary bg-primary/10 text-primary font-bold'
                    : 'border-border bg-surface text-text-secondary hover:border-border-hover'
                }`}
              >
                {isVi ? p.labelVi : p.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Target Duration */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-text-primary uppercase tracking-wider">
            {isVi ? '3. Mục tiêu thời lượng mỗi ngày' : '3. Daily Learning Goal'}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DURATION_PRESETS.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => setDuration(min)}
                className={`rounded-2xl border py-2.5 text-xs font-bold transition-all cursor-pointer ${
                  duration === min
                    ? 'border-primary bg-primary/10 text-primary shadow-xs'
                    : 'border-border bg-surface text-text-secondary hover:border-primary/40'
                }`}
              >
                {min} {isVi ? 'phút' : 'mins'}
              </button>
            ))}
          </div>
        </div>

        {/* Email toggle */}
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
                : 'Receive daily emails with quick study links and high-impact TOEIC tips'}
            </div>
          </div>
        </label>

        {/* Motivation footnote */}
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-3 flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300">
          <Sparkles size={16} className="shrink-0 text-amber-500" />
          <span>
            {isVi
              ? 'Học viên duy trì lịch học ngắt quãng đạt điểm TOEIC trung bình cao hơn 68%.'
              : 'Students with consistent spaced study schedules achieve 68% higher TOEIC scores.'}
          </span>
        </div>

        {/* Modal Actions */}
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
                  <span>{hasActiveSchedule ? (isVi ? 'Cập nhật lịch' : 'Update Schedule') : (isVi ? 'Lưu lịch nhắc học' : 'Save Schedule')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
