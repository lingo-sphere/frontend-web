// Component biểu ngữ chào mừng học viên và bộ lọc thời gian theo phong cách thiết kế Cuba Dashboard.
'use client'

import React from 'react'
import { Calendar, ChevronRight, Flame, Target, Sparkles, Rocket, BookOpen } from 'lucide-react'
import { AppSelect } from '@/components/select'
import type { User } from '@/types/api.types'

interface GogoWelcomeHeroProps {
  user?: User | null
  targetScore?: number
  currentStreak?: number
  xp?: number
  selectedPeriod?: string
  onPeriodChange?: (period: string) => void
  onPractice?: () => void
  onVocab?: () => void
}

export function GogoWelcomeHero({
  user,
  targetScore = 0,
  currentStreak = 0,
  xp = 0,
  selectedPeriod = '7d',
  onPeriodChange,
  onPractice,
  onVocab,
}: GogoWelcomeHeroProps) {
  const displayName = user?.full_name || 'Học viên LingoSphere'

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-text-primary">
            Bảng Phân Tích Năng Lực Học Tập
          </h1>
          <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5">
            <span>Trang chủ</span>
            <ChevronRight className="w-3 h-3 text-text-tertiary" />
            <span>Học tập</span>
            <ChevronRight className="w-3 h-3 text-text-tertiary" />
            <span className="font-semibold text-primary">Phân tích học viên</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <AppSelect
            value={selectedPeriod}
            onChange={(val) => onPeriodChange?.(val)}
            options={[
              { value: '7d', label: 'Tuần này (7 ngày)' },
              { value: '30d', label: 'Tháng này (30 ngày)' },
              { value: '90d', label: '90 ngày qua' },
              { value: 'all', label: 'Toàn thời gian' },
            ]}
            size="sm"
            ariaLabel="Chọn khoảng thời gian phân tích"
            triggerClassName="rounded-2xl border-border bg-surface px-3.5 py-1.5 shadow-2xs font-semibold"
          />
        </div>
      </div>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-teal-700 text-white p-6 sm:p-7 shadow-sm">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-20 top-4 w-32 h-32 rounded-full bg-emerald-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-bold border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Chào mừng trở lại!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Xin chào, {displayName}!
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
              Theo dõi chi tiết các cột mốc bứt phá điểm số, độ chuẩn xác 4 kỹ năng và chuỗi phong độ luyện thi tiếng Anh của bạn.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 backdrop-blur-xs text-white text-xs font-bold border border-white/20">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>Chuỗi {currentStreak} ngày</span>
              </span>

              {targetScore > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 backdrop-blur-xs text-white text-xs font-bold border border-white/20">
                  <Target className="w-3.5 h-3.5 text-sky-300" />
                  <span>Mục tiêu: {targetScore}đ TOEIC</span>
                </span>
              )}

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 backdrop-blur-xs text-white text-xs font-bold border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{xp.toLocaleString('vi-VN')} XP</span>
              </span>
            </div>
          </div>

          <div className="flex flex-row lg:flex-col items-center gap-3 shrink-0">
            {onPractice && (
              <button
                type="button"
                onClick={onPractice}
                className="w-full sm:w-auto lg:w-44 px-4 py-2.5 rounded-2xl bg-white text-emerald-700 hover:bg-emerald-50 text-xs font-extrabold shadow-md transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <Rocket className="w-4 h-4 text-emerald-600" />
                <span>Luyện Đề Ngay</span>
              </button>
            )}

            {onVocab && (
              <button
                type="button"
                onClick={onVocab}
                className="w-full sm:w-auto lg:w-44 px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-extrabold backdrop-blur-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                <BookOpen className="w-4 h-4 text-white" />
                <span>Ôn Từ Vựng SRS</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
