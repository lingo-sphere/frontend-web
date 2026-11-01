// Component hiển thị danh sách tiến độ điểm yếu kỹ năng theo phong cách Gogo Application Status Card.
'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'
import type { WeaknessAnalysis } from '@/features/progress/services/progress.service'

interface GogoWeaknessStatusCardProps {
  weaknesses?: WeaknessAnalysis[]
  onViewAll?: () => void
}

export function GogoWeaknessStatusCard({
  weaknesses = [],
  onViewAll,
}: GogoWeaknessStatusCardProps) {
  const defaultItems = [
    { name: 'Mệnh đề quan hệ & Thì (Ngữ pháp)', current: 2, total: 12 },
    { name: 'Từ vựng Hợp đồng & Thương mại', current: 5, total: 12 },
    { name: 'Part 3 - Nghe suy luận hội thoại', current: 4, total: 12 },
    { name: 'Đọc hiểu văn bản kép Part 7', current: 8, total: 12 },
    { name: 'Trọng âm & Phát âm nối âm AI', current: 4, total: 12 },
  ]

  const items = weaknesses.length > 0
    ? weaknesses.slice(0, 5).map((w) => ({
        name: w.dimension_name || w.skill,
        current: Math.round(w.questions * (w.accuracy / 100)),
        total: Math.max(w.questions, 10),
      }))
    : defaultItems

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
          Application Status
        </h2>
        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-text-tertiary hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>Xem chi tiết tab Kỹ năng</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex-1 flex flex-col justify-between space-y-4">
        {items.map((item, idx) => {
          const pct = Math.min(100, Math.max(5, Math.round((item.current / item.total) * 100)))
          return (
            <div key={`${item.name}-${idx}`} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-text-primary truncate pr-2" title={item.name}>
                  {item.name}
                </span>
                <span className="text-text-tertiary font-medium shrink-0">
                  {item.current}/{item.total}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-subtle overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

