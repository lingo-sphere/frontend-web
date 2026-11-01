// Component thanh tiêu đề và điều hướng phân tích học tập theo phong cách Gogo Analytics Header.
'use client'

import React from 'react'
import { Calendar, ChevronRight } from 'lucide-react'
import type { User } from '@/types/api.types'

interface GogoWelcomeHeroProps {
  user?: User | null
  targetScore?: number
  currentStreak?: number
  level?: string | number
  selectedPeriod?: string
  onPeriodChange?: (period: string) => void
  onRefresh?: () => void
  onExplore?: () => void
}

export function GogoWelcomeHero({
  user,
  selectedPeriod = '7d',
  onPeriodChange,
}: GogoWelcomeHeroProps) {
  const displayName = user?.full_name || 'Học viên LingoSphere'

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
          Chào mừng {displayName}!
        </h1>
        <p className="text-xs text-text-secondary mt-1 flex items-center gap-1.5">
          <span>Trang chủ</span>
          <ChevronRight className="w-3 h-3" />
          <span>Bảng điều khiển</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-primary">Phân tích học tập</span>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-surface border border-border shadow-2xs text-xs font-semibold text-text-secondary">
          <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => onPeriodChange?.(e.target.value)}
            className="bg-transparent text-text-primary outline-none cursor-pointer text-xs font-medium"
            aria-label="Chọn khoảng thời gian phân tích"
          >
            <option value="7d">Tuần này (7 ngày)</option>
            <option value="30d">Tháng này (30 ngày)</option>
            <option value="90d">90 ngày qua</option>
            <option value="all">Toàn thời gian</option>
          </select>
        </div>
      </div>
    </div>
  )
}
