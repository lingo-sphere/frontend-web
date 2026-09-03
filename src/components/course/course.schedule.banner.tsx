'use client'

/**
 * @file CourseScheduleBanner.tsx
 * @description Component giao diện React CourseScheduleBanner hiển thị trạng thái lịch học kèm định dạng đa ngôn ngữ
 */

import { useTranslation } from 'react-i18next'
import { Clock, X, CalendarCheck2, Settings2, BellRing } from 'lucide-react'

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
  onOpenModal: () => void
  onDismiss: () => void
  onCancelSchedule?: () => void
}

export function CourseScheduleBanner({
  schedule,
  onOpenModal,
  onDismiss,
  onCancelSchedule,
}: CourseScheduleBannerProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  const hasActiveSchedule = Boolean(schedule?.is_reminder_enabled && schedule?.reminder_time)
  const formattedDays = formatReminderDays(schedule?.reminder_days, isVi)
  const formattedTime = formatReminderTime(schedule?.reminder_time, isVi)

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative transition-all">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl mt-0.5 ${
            hasActiveSchedule
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'bg-primary-soft text-primary'
          }`}
        >
          {hasActiveSchedule ? <CalendarCheck2 size={22} /> : <Clock size={22} />}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-text-primary">
              {hasActiveSchedule
                ? (isVi ? 'Lịch nhắc học tập của bạn đang hoạt động' : 'Your Learning Schedule is Active')
                : (isVi ? 'Lên lịch học tập hàng ngày' : 'Schedule learning time')}
            </h3>
            {hasActiveSchedule && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <BellRing size={12} className="animate-pulse" />
                {formattedTime}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-3xl">
            {hasActiveSchedule ? (
              isVi ? (
                <>
                  Hệ thống sẽ gửi email nhắc học vào lúc{' '}
                  <strong className="text-text-primary font-bold">{formattedTime}</strong> các ngày (
                  <span className="text-primary font-bold">{formattedDays}</span>
                  ) để giúp bạn duy trì thói quen học ngắt quãng và đạt điểm TOEIC cao hơn 68%.
                </>
              ) : (
                <>
                  Reminders will be sent to your email at{' '}
                  <strong className="text-text-primary font-bold">{formattedTime}</strong> on (
                  <span className="text-primary font-bold">{formattedDays}</span>
                  ) to help maintain your study streak.
                </>
              )
            ) : isVi ? (
              'Học một chút mỗi ngày tạo nên sự khác biệt lớn. Nghiên cứu não bộ chỉ ra rằng học viên duy trì thói quen học ngắt quãng đạt điểm TOEIC cao hơn 68%. Hãy đặt lịch và nhận thông báo nhắc học thông minh.'
            ) : (
              'Learning a little each day adds up. Research shows that students who make learning a habit are more likely to reach their goals. Set time aside to learn and get reminders using your learning scheduler.'
            )}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {hasActiveSchedule ? (
              <>
                <button
                  onClick={onOpenModal}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer shadow-sm"
                >
                  <Settings2 size={14} />
                  {isVi ? 'Chỉnh sửa lịch học' : 'Edit Schedule'}
                </button>
                {onCancelSchedule && (
                  <button
                    onClick={onCancelSchedule}
                    className="rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 hover:border-rose-300 transition-all cursor-pointer shadow-sm"
                  >
                    {isVi ? 'Hủy lịch nhắc' : 'Cancel Schedule'}
                  </button>
                )}
                <button
                  onClick={onDismiss}
                  className="text-xs font-semibold text-text-tertiary hover:text-text-primary transition-colors cursor-pointer px-2 py-1"
                >
                  {isVi ? 'Bỏ qua' : 'Dismiss'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onOpenModal}
                  className="rounded-xl border border-border bg-surface px-5 py-2 text-xs font-bold text-text-primary hover:bg-surface-hover hover:border-primary transition-all cursor-pointer shadow-sm"
                >
                  {isVi ? 'Bắt đầu lên lịch' : 'Get started'}
                </button>
                <button
                  onClick={onDismiss}
                  className="text-xs font-semibold text-text-tertiary hover:text-text-primary transition-colors cursor-pointer px-2 py-1"
                >
                  {isVi ? 'Bỏ qua' : 'Dismiss'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
        title={isVi ? 'Đóng' : 'Close'}
      >
        <X size={16} />
      </button>
    </div>
  )
}
