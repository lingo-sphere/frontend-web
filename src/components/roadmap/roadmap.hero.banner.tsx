/**
 * @file roadmap.hero.banner.tsx
 * @description Banner giới thiệu lộ trình học tập được cá nhân hóa theo từng trình độ học viên
 */

'use client'

import { Compass, Sparkles, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoadmapHeroBannerProps {
  onNavigatePlacement2Skills: () => void
  onNavigatePlacement4Skills: () => void
}

export function RoadmapHeroBanner({
  onNavigatePlacement2Skills,
  onNavigatePlacement4Skills,
}: RoadmapHeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 p-8 sm:p-12 text-white shadow-2xl">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
      <div className="relative z-10 max-w-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200 border border-white/10">
          <Compass className="w-3.5 h-3.5" />
          <span>Hệ Thống Lộ Trình Học Tập Cá Nhân Hóa</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
          Xác Định Trình Độ & Chinh Phục Lộ Trình TOEIC Riêng Cho Bạn
        </h1>
        <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed">
          Làm bài kiểm tra đánh giá năng lực rút gọn để hệ thống AI định vị chính xác điểm mạnh, điểm
          yếu và xây dựng lộ trình đo lường sự tăng trưởng qua từng chặng học.
        </p>

        <div className="pt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={onNavigatePlacement2Skills}
            className="px-6 py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            <Sparkles className="w-4 h-4" />
            <span>Test Đầu Vào 2 Kỹ Năng (LR)</span>
          </Button>
          <Button
            onClick={onNavigatePlacement4Skills}
            className="px-6 py-6 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-bold text-sm border border-white/20 flex items-center gap-2 cursor-pointer"
          >
            <Target className="w-4 h-4" />
            <span>Test Toàn Diện 4 Kỹ Năng (LRSW)</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
