'use client'

import { useTranslation } from 'react-i18next'
import { Calendar, X } from 'lucide-react'

interface CourseScheduleModalProps {
  onClose: () => void
  onSave: () => void
}

export function CourseScheduleModal({
  onClose,
  onSave,
}: CourseScheduleModalProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-soft text-primary">
              <Calendar size={18} />
            </div>
            <h3 className="text-base font-bold text-text-primary">
              {isVi ? 'Lên lịch nhắc học tập' : 'Learning Reminder Schedule'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 text-xs text-text-secondary">
          <p>
            {isVi
              ? 'Chọn khung giờ và những ngày bạn muốn LingoSphere gửi thông báo nhắc nhở:'
              : 'Choose the days and time you want LingoSphere to send study reminders:'}
          </p>
          <div className="grid grid-cols-4 gap-2 text-center font-bold">
            {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
              <button
                key={day}
                className="rounded-xl border border-border p-2.5 hover:border-primary hover:text-primary transition-colors"
              >
                {day}
              </button>
            ))}
          </div>
          <div className="pt-2">
            <label className="block font-bold text-text-primary mb-1">
              {isVi ? 'Khung giờ nhắc nhở:' : 'Reminder Time:'}
            </label>
            <input
              type="time"
              defaultValue="20:00"
              className="w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-text-primary"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-bold text-text-secondary hover:bg-surface-hover transition-colors"
          >
            {isVi ? 'Hủy' : 'Cancel'}
          </button>
          <button
            onClick={onSave}
            className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-white hover:bg-primary-hover transition-colors shadow-sm"
          >
            {isVi ? 'Lưu lịch nhắc học' : 'Save Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}
