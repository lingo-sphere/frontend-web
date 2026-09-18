// Component hiển thị trạng thái và thông báo lịch học định kỳ của học viên
'use client'

import { useTranslation } from 'react-i18next'
import { Clock, X, CalendarCheck2, Settings2, BellRing, Lock, AlertTriangle, RotateCcw } from 'lucide-react'
import { useMounted } from '@/hooks/use.mounted'
import type { CourseChapterLockState } from '@/features/courses/types/schedule.types'

export interface UserScheduleData {
  reminder_time?: string
  reminder_days?: string[]
  is_reminder_enabled?: boolean
  study_duration_minutes?: number
  is_email_notification_enabled?: boolean
}

export function formatReminderDays(days?: string[], isVi: boolean = true): string {
  if (!days || days.length === 0 || days.length === 7) {
    return isVi ? 'Hàng ngày' : 'Every day'
  }
  const weekdays = ['T2', 'T3', 'T4', 'T5', 'T6']
  const weekends = ['T7', 'CN']
  if (days.length === 5 && weekdays.every((d) => days.includes(d))) {
    return isVi ? 'Các ngày trong tuần (T2 - T6)' : 'Weekdays (Mon - Fri)'
  }
  if (days.length === 2 && weekends.every((d) => days.includes(d))) {
    return isVi ? 'Cuối tuần (T7, CN)' : 'Weekends (Sat, Sun)'
  }
  const labelMapVi: Record<string, string> = {
    T2: 'Thứ 2',
    T3: 'Thứ 3',
    T4: 'Thứ 4',
    T5: 'Thứ 5',
    T6: 'Thứ 6',
    T7: 'Thứ 7',
    CN: 'Chủ nhật',
  }
  const labelMapEn: Record<string, string> = {
    T2: 'Mon',
    T3: 'Tue',
    T4: 'Wed',
    T5: 'Thu',
    T6: 'Fri',
    T7: 'Sat',
    CN: 'Sun',
  }
  return days.map((d) => (isVi ? labelMapVi[d] || d : labelMapEn[d] || d)).join(', ')
}

export function formatReminderTime(time?: string, isVi: boolean = true): string {
  if (!time) return ''
  const [hStr, mStr] = time.split(':')
  const h = parseInt(hStr || '20', 10)
  const m = parseInt(mStr || '00', 10)
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  const h12 = h % 12 === 0 ? 12 : h % 12
  const isPM = h >= 12
  if (isVi) {
    const period = isPM ? 'CH' : 'SA'
    return `${pad(h)}:${pad(m)} (${pad(h12)}:${pad(m)} ${period})`
  } else {
    const period = isPM ? 'PM' : 'AM'
    return `${pad(h12)}:${pad(m)} ${period}`
  }
}

interface CourseScheduleBannerProps {
  schedule?: UserScheduleData | null
  lockState?: CourseChapterLockState | null
  onOpenModal: () => void
  onDismiss: () => void
  onCancelSchedule?: () => void
  onRetest?: () => void
}

export function CourseScheduleBanner({
  schedule,
  lockState,
  onOpenModal,
  onDismiss,
  onCancelSchedule,
  onRetest,
}: CourseScheduleBannerProps) {
  const { i18n } = useTranslation()
  const mounted = useMounted()
  const isVi = mounted ? i18n.language === 'vi' : true

  if (lockState?.is_locked) {
    const lockedOrder = lockState.locked_chapter_order || 2
    const retestOrder = lockState.retest_chapter_order || (lockedOrder - 1)
    return (
      <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative transition-all">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-600/20">
            <Lock size={22} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-rose-700 dark:text-rose-300">
                {isVi
                  ? `Chương ${lockedOrder} đang bị khóa do vắng học 5 lần nhắc nhở`
                  : `Chapter ${lockedOrder} is locked due to 5 missed study reminders`}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/20 border border-rose-500/30 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-700 dark:text-rose-300">
                <AlertTriangle size={12} />
                5/5 lần vắng
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-3xl">
              {isVi
                ? `Để đảm bảo chuẩn đầu ra của khóa học, bạn cần làm lại bài kiểm tra Chương ${retestOrder} và đạt điểm tiêu chuẩn để mở khóa học tiếp tục Chương ${lockedOrder}.`
                : `To ensure course quality, please retake the Chapter ${retestOrder} test and achieve the passing score to unlock Chapter ${lockedOrder}.`}
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {onRetest && (
                <button
                  type="button"
                  onClick={onRetest}
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-extrabold text-white hover:bg-rose-700 transition-all cursor-pointer shadow-md shadow-rose-600/25"
                >
                  <RotateCcw size={14} />
                  {isVi ? `Làm lại bài kiểm tra Chương ${retestOrder}` : `Retake Chapter ${retestOrder} Test`}
                </button>
              )}
              <button
                type="button"
                onClick={onOpenModal}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-text-primary hover:bg-surface-hover transition-all cursor-pointer shadow-sm"
              >
                <Settings2 size={14} />
                {isVi ? 'Đổi lịch nhắc học' : 'Change Schedule'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const hasActiveSchedule = Boolean(schedule?.is_reminder_enabled && schedule?.reminder_time)
  const formattedDays = formatReminderDays(schedule?.reminder_days, isVi)
  const formattedTime = formatReminderTime(schedule?.reminder_time, isVi)

  return (
    <div className="rounded-2xl border border-border bg-surface px-4 py-3 sm:py-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative transition-all">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
            hasActiveSchedule
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-primary-soft text-primary'
          }`}
        >
          {hasActiveSchedule ? <CalendarCheck2 size={16} /> : <Clock size={16} />}
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs sm:text-sm font-bold text-text-primary">
              {hasActiveSchedule
                ? (isVi ? 'Lịch nhắc học đang hoạt động' : 'Study Schedule Active')
                : (isVi ? 'Lên lịch học tập hàng ngày' : 'Daily Study Schedule')}
            </h3>
            {hasActiveSchedule && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                <BellRing size={10} className="animate-pulse" />
                {formattedTime}
              </span>
            )}
            {Boolean(lockState && lockState.violation_count > 0) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-extrabold text-amber-700 dark:text-amber-300">
                <AlertTriangle size={10} className="text-amber-500" />
                {isVi
                  ? `Vắng học: ${lockState?.violation_count}/5`
                  : `Absence: ${lockState?.violation_count}/5`}
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-text-secondary line-clamp-1 sm:line-clamp-none max-w-2xl">
            {hasActiveSchedule ? (
              isVi ? (
                <>Email nhắc học lúc <strong className="text-text-primary font-bold">{formattedTime}</strong> ({formattedDays}).</>
              ) : (
                <>Email reminders at <strong className="text-text-primary font-bold">{formattedTime}</strong> ({formattedDays}).</>
              )
            ) : isVi ? (
              'Duy trì thói quen học ngắt quãng mỗi ngày giúp tăng 68% điểm số TOEIC của bạn.'
            ) : (
              'Learning a little each day builds consistency and increases your TOEIC score.'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end md:self-center pr-6">
        {hasActiveSchedule ? (
          <>
            <button
              onClick={onOpenModal}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer shadow-xs"
            >
              <Settings2 size={13} />
              <span>{isVi ? 'Đổi lịch' : 'Edit'}</span>
            </button>
            {onCancelSchedule && (
              <button
                onClick={onCancelSchedule}
                className="rounded-xl border border-border bg-surface px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:border-rose-300 transition-all cursor-pointer shadow-xs"
              >
                {isVi ? 'Hủy' : 'Cancel'}
              </button>
            )}
          </>
        ) : (
          <button
            onClick={onOpenModal}
            className="rounded-xl border border-border bg-surface px-3.5 py-1.5 text-xs font-bold text-text-primary hover:bg-surface-hover hover:border-primary transition-all cursor-pointer shadow-xs"
          >
            {isVi ? 'Lên lịch học' : 'Get started'}
          </button>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer p-1"
        title={isVi ? 'Đóng' : 'Close'}
      >
        <X size={14} />
      </button>
    </div>
  )
}
