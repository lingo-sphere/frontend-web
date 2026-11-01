// Component biểu ngữ chào mừng người học theo phong cách Gogo Analytics Dashboard.
'use client'

import React from 'react'
import { Sparkles, Trophy, Calendar, RefreshCw, Compass } from 'lucide-react'
import type { User } from '@/types/api.types'

interface GogoWelcomeHeroProps {
  user?: User | null
  targetScore?: number
  currentStreak?: number
  level?: string | number
  onRefresh?: () => void
  onExplore?: () => void
}

export function GogoWelcomeHero({
  user,
  targetScore = 650,
  currentStreak = 0,
  level = 1,
  onRefresh,
  onExplore,
}: GogoWelcomeHeroProps) {
  const displayName = user?.full_name || 'Học viên LingoSphere'
  const currentDate = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white p-6 sm:p-8 shadow-lg shadow-teal-500/15">
      <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute right-24 top-0 w-44 h-44 rounded-full bg-cyan-300/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/25">
              Hệ Sinh Thái Học Tập Thông Minh
            </span>
            <div className="flex items-center gap-1.5 text-xs text-teal-100 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>{currentDate}</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Chào mừng trở lại, {displayName}! 👋
          </h1>

          <p className="text-xs sm:text-sm text-teal-50/90 font-normal leading-relaxed">
            Hôm nay bạn đang duy trì chuỗi học tập {currentStreak} ngày liên tiếp. Hãy tiếp tục bám sát lộ trình cá nhân hóa để chinh phục mục tiêu {targetScore} điểm TOEIC!
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold">
              <Trophy className="w-3.5 h-3.5 text-amber-300" />
              <span>Mục tiêu: {targetScore} TOEIC</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Cấp độ: {level}</span>
            </div>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                title="Làm mới dữ liệu"
                className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 flex items-center justify-center text-white transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
            {onExplore && (
              <button
                type="button"
                onClick={onExplore}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-teal-800 hover:bg-teal-50 font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Compass className="w-4 h-4 text-teal-600" />
                <span>Luyện Đề Ngay</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
