'use client'

import type { CourseAnnouncement } from '@/types/course'

interface CourseAnnouncementsTabProps {
  announcements?: CourseAnnouncement[]
}

export function CourseAnnouncementsTab({ announcements = [] }: CourseAnnouncementsTabProps) {
  if (announcements.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center text-xs text-text-secondary">
        Hiện chưa có thông báo mới nào từ giảng viên khóa học.
      </div>
    )
  }

  return (
    <div className="space-y-4 pt-2">
      {announcements.map((ann) => (
        <div key={ann.id} className="rounded-2xl border border-border bg-surface p-6 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold text-text-primary">{ann.title}</div>
            <span className="text-xs text-text-tertiary">{ann.date}</span>
          </div>
          <div className="text-xs text-primary font-medium">{ann.author}</div>
          <p className="text-xs text-text-secondary leading-relaxed">{ann.content}</p>
        </div>
      ))}
    </div>
  )
}
