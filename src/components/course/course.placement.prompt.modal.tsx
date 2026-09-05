'use client'

/**
 * @file CoursePlacementPromptModal.tsx
 * @description Modal tư vấn học viên làm bài test đầu vào (2 kỹ năng / 4 kỹ năng) hoặc cập nhật hồ sơ trước khi mua khóa học
 */

import React from 'react'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Headphones,
  Mic,
  FileEdit,
  X,
  ShieldAlert,
} from 'lucide-react'

interface CoursePlacementPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProceedPurchase: () => void
  courseTitle?: string
}

export function CoursePlacementPromptModal({
  open,
  onOpenChange,
  onProceedPurchase,
  courseTitle,
}: CoursePlacementPromptModalProps) {
  const router = useRouter()

  if (!open) return null

  const handleGoToPlacementTest = (type: '2skills' | '4skills') => {
    onOpenChange(false)
    if (type === '2skills') {
      router.push('/toeic/exam/exam_placement_2skills_lr')
    } else {
      router.push('/toeic/exam/exam_placement_4skills_full')
    }
  }

  const handleGoToProfile = () => {
    onOpenChange(false)
    router.push('/profile')
  }

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false)
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/25 dark:bg-black/35 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                Gợi Ý Đánh Giá Năng Lực Đầu Vào
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tối ưu hóa lộ trình học sát với trình độ thực tế của bạn
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Advisory Message */}
        <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start gap-2.5">
          <ShieldAlert className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
            Hệ thống nhận thấy bạn chưa có kết quả kiểm tra trình độ đầu vào. Để đảm bảo khóa học {courseTitle ? <strong className="font-semibold text-indigo-700 dark:text-indigo-300">"{courseTitle}"</strong> : 'này'} hoàn toàn phù hợp với năng lực hiện tại của bạn, chúng tôi khuyên bạn:
          </p>
        </div>

        {/* Recommendation Cards */}
        <div className="space-y-3">
          {/* Card 1: Khuyên làm test đầu vào hệ thống */}
          <div className="rounded-2xl border border-indigo-200 dark:border-indigo-800/80 bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 dark:from-slate-800/80 dark:via-slate-900 dark:to-indigo-950/40 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                  Khuyên Dùng
                </span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Làm Bài Test Đầu Vào Toàn Hệ Thống
                </span>
              </div>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                Miễn phí 100%
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Bài thi chuẩn format do Hội đồng chuyên môn Admin thiết kế giúp xác định chính xác trình độ và tự động mở khóa các gợi ý khóa học tối ưu.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleGoToPlacementTest('2skills')}
                className="flex items-center justify-between p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-slate-700/50 transition-all text-left group cursor-pointer shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <Headphones className="w-3.5 h-3.5 text-indigo-500" />
                    <span>TOEIC 2 Kỹ Năng</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Nghe & Đọc • 60 phút
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleGoToPlacementTest('4skills')}
                className="flex items-center justify-between p-3 rounded-xl border border-teal-200 dark:border-teal-800 bg-white dark:bg-slate-800 hover:border-teal-500 hover:bg-teal-50/30 dark:hover:bg-slate-700/50 transition-all text-left group cursor-pointer shadow-xs"
              >
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400">
                    <Mic className="w-3.5 h-3.5 text-teal-500" />
                    <span>TOEIC 4 Kỹ Năng</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    LR + Nói & Viết • 90 phút
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          {/* Card 2: Cập nhật điểm đã có trong Profile */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-800/80 transition-all">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                <FileEdit className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Bạn đã có chứng chỉ hoặc điểm thi trước đó?
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Tự cập nhật điểm số vào Hồ sơ cá nhân để nhận gợi ý
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleGoToProfile}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all whitespace-nowrap cursor-pointer"
            >
              Vào Hồ Sơ
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium transition-colors cursor-pointer"
          >
            Đóng hộp thoại
          </button>

          <button
            type="button"
            onClick={() => {
              onOpenChange(false)
              onProceedPurchase()
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-100 dark:to-slate-200 text-white dark:text-slate-900 text-xs font-bold hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Tôi hiểu rồi, tiếp tục mua khóa học này</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
