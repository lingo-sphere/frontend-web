// Banner giới thiệu lộ trình học tập và kiểm tra đánh giá năng lực đầu vào.

'use client'

import {
  Compass,
  Sparkles,
  Target,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/button'

interface RoadmapHeroBannerProps {
  onNavigatePlacement2Skills: () => void
  onNavigatePlacement4Skills: () => void
}

export function RoadmapHeroBanner({
  onNavigatePlacement2Skills,
  onNavigatePlacement4Skills,
}: RoadmapHeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 p-6 sm:p-10 lg:p-12 text-white shadow-2xl border border-indigo-800/60">
      <div className="absolute top-0 right-0 -mr-24 -mt-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-indigo-200 border border-white/15 shadow-xs">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Hệ Thống Lộ Trình Học Tập & Khóa Học Cá Nhân Hóa</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Xác Định Trình Độ & Chinh Phục Lộ Trình TOEIC Riêng Cho Bạn
            </h1>
            <p className="text-sm sm:text-base text-indigo-200/90 leading-relaxed">
              Làm bài kiểm tra đánh giá năng lực rút gọn để hệ thống AI định vị chính xác điểm mạnh, điểm
              yếu và gợi ý khóa học tối ưu, đo lường sự tăng trưởng qua từng chặng học.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <Button
              onClick={onNavigatePlacement2Skills}
              className="px-6 py-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <div className="text-left">
                <div className="font-bold leading-none">Test Đầu Vào 2 Kỹ Năng (LR)</div>
                <div className="text-[10px] text-emerald-100 font-normal mt-1">40 câu hỏi · ~45 phút · Nghe & Đọc</div>
              </div>
            </Button>

            <Button
              onClick={onNavigatePlacement4Skills}
              className="px-6 py-6 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-black text-sm border border-white/20 flex items-center justify-center gap-2.5 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Target className="w-4 h-4 text-indigo-300 shrink-0" />
              <div className="text-left">
                <div className="font-bold leading-none">Test Toàn Diện 4 Kỹ Năng (LRSW)</div>
                <div className="text-[10px] text-indigo-200 font-normal mt-1">60 câu hỏi · Đánh giá Nói & Viết AI</div>
              </div>
            </Button>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/10 text-xs text-indigo-200/90 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Thang điểm chuẩn ETS (10 - 990)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Gợi ý khóa học sát trình độ</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đo lường sau từng bài test</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="rounded-2xl bg-white/10 dark:bg-slate-900/40 border border-white/15 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-300" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Thang Nấc Thang Cấp Độ TOEIC
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                AI Ladder
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Chặng 1: Nền Tảng Cơ Bản</span>
                  <span className="text-xs font-extrabold text-emerald-400">TOEIC 450+</span>
                </div>
                <p className="text-[11px] text-indigo-200/80 mt-1">
                  Luyện nghe tranh Part 1, hỏi đáp Part 2 và 12 chủ điểm ngữ pháp cốt lõi.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Chặng 2: Bứt Phá Trung Cấp</span>
                  <span className="text-xs font-extrabold text-amber-400">TOEIC 650+</span>
                </div>
                <p className="text-[11px] text-indigo-200/80 mt-1">
                  Làm chủ hội thoại Part 3-4, kỹ năng đọc lướt Skimming & Scanning Part 7.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Chặng 3: Chinh Phục Điểm Cao</span>
                  <span className="text-xs font-extrabold text-purple-400">TOEIC 800+</span>
                </div>
                <p className="text-[11px] text-indigo-200/80 mt-1">
                  Phản xạ bẫy đề thi nâng cao, từ vựng học thuật và diễn đạt tự nhiên.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
              <p className="text-[11px] text-indigo-100 leading-relaxed">
                Sau khi thi đánh giá, hệ thống sẽ tự động xếp bạn vào đúng chặng và gợi ý khóa học phù hợp nhất!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
