'use client'

import { Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function CourseToolsTab() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm text-xs text-text-secondary">
      <h3 className="text-sm font-bold text-text-primary">Công cụ học tập & Lịch nhắc nhở</h3>
      <p>Kích hoạt tính năng đồng bộ lịch học với Google Calendar hoặc Apple Calendar để không bỏ lỡ buổi học.</p>
      <Button className="bg-primary text-white hover:bg-primary-hover gap-2 rounded-xl text-xs">
        <Calendar size={14} />
        Kết nối lịch học Google Calendar
      </Button>
    </div>
  )
}
