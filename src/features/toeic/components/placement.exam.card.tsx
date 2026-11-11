// Thẻ hiển thị đề thi đánh giá năng lực đầu vào theo phong cách card lượn sóng xanh ngọc và viền vàng kim hoàng gia.
'use client'

import { useId } from 'react'
import {
  Headphones,
  Clock,
  ClipboardCheck,
  Trophy,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react'
import type { BackendToeicExam } from '@/features/toeic/services/exam.service'

interface PlacementExamCardProps {
  exam: BackendToeicExam
  onStartExam: (examId: string) => void
  isVietnamese?: boolean
}

export function PlacementExamCard({
  exam,
  onStartExam,
  isVietnamese = true,
}: PlacementExamCardProps) {
  const rawId = useId()
  const uniqueId = rawId.replace(/[^a-zA-Z0-9]/g, '')

  const skillsText =
    exam.skills_enabled === 'LRSW'
      ? isVietnamese
        ? '4 Kỹ năng (Nghe, Đọc, Nói, Viết)'
        : '4 Skills (L, R, S, W)'
      : isVietnamese
      ? '2 Kỹ năng (Nghe & Đọc)'
      : '2 Skills (Listening & Reading)'

  const durationText = `${exam.duration_minutes || 120} ${isVietnamese ? 'phút làm bài' : 'minutes'}`
  const questionsText = `${exam.total_questions || 40} ${
    isVietnamese ? 'câu hỏi trắc nghiệm' : 'multiple-choice questions'
  }`
  const targetScoreText = isVietnamese ? 'Thang điểm 10 - 990 TOEIC chuẩn ETS' : 'Score Scale 10 - 990 ETS standard'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onStartExam(exam._id)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onStartExam(exam._id)
        }
      }}
      className="group relative w-full overflow-hidden rounded-[32px] border border-emerald-500/30 bg-surface dark:bg-card shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/60 hover:shadow-2xl hover:shadow-emerald-950/20 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
    >
      <div className="relative h-[190px] sm:h-[210px] w-full overflow-hidden bg-[#094936]">
        <svg
          className="absolute inset-0 h-full w-full pointer-events-none"
          viewBox="0 0 900 450"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={`greenGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#063e2e" />
              <stop offset="45%" stopColor="#08543f" />
              <stop offset="100%" stopColor="#0a634a" />
            </linearGradient>
            <linearGradient id={`goldGrad-${uniqueId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#eab308" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="70%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <filter id={`ribbonShadow-${uniqueId}`} x="-10%" y="-10%" width="130%" height="160%">
              <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          <rect width="900" height="450" fill={`url(#greenGrad-${uniqueId})`} />

          <path
            d="M 0 250 C 100 270, 260 280, 420 230 C 600 170, 740 60, 780 0 L 900 0 L 900 450 L 0 450 Z"
            fill="currentColor"
            className="text-surface dark:text-card"
          />

          <path
            d="M 780 0 C 740 60, 600 170, 420 230 C 260 280, 100 270, 0 250 L 0 275 C 100 295, 260 305, 430 255 C 610 195, 755 80, 804 0 Z"
            fill={`url(#goldGrad-${uniqueId})`}
            filter={`url(#ribbonShadow-${uniqueId})`}
          />

          <path
            d="M 0 275 C 40 275, 170 305, 210 450 L 0 450 Z"
            fill="currentColor"
            className="text-surface-subtle/70 dark:text-surface-subtle/30"
          />
        </svg>

        <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-200 border border-emerald-400/30 backdrop-blur-xs">
                  <ShieldCheck size={12} className="text-emerald-300" />
                  <span>{isVietnamese ? 'ĐỀ THI ĐẦU VÀO' : 'PLACEMENT TEST'}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-amber-300 border border-amber-400/30 backdrop-blur-xs">
                  <Sparkles size={11} className="text-amber-300" />
                  <span>{isVietnamese ? 'MIỄN PHÍ' : 'FREE ACCESS'}</span>
                </span>
              </div>

              <h3 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] line-clamp-1">
                {exam.title}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-emerald-100/90 line-clamp-1 leading-relaxed">
                {exam.description ||
                  (isVietnamese
                    ? 'Bộ đề thi chuẩn hóa ETS định vị chính xác năng lực và đề xuất lộ trình học tập AI'
                    : 'Standardized ETS exam for comprehensive skill evaluation and AI learning pathway')}
              </p>
            </div>

            <div className="hidden sm:flex shrink-0 items-center gap-1 rounded-2xl bg-white/10 px-3 py-1.5 text-xs font-bold text-white border border-white/20 backdrop-blur-md">
              <Award size={14} className="text-amber-300" />
              <span>ETS 990</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 p-6 sm:p-7 pt-4 sm:pt-5 bg-surface dark:bg-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5 sm:gap-6 shrink-0">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="relative flex h-16 w-16 sm:h-18 sm:w-18 items-center justify-center rounded-full border-2 border-amber-400/80 bg-gradient-to-b from-surface to-surface-subtle shadow-md dark:border-amber-400/60">
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-800 text-amber-400 shadow-inner">
                  <Trophy size={24} className="animate-pulse" />
                </div>
              </div>
              <span className="mt-2 text-[11px] font-black tracking-wider uppercase text-slate-800 dark:text-slate-100">
                LINGOSPHERE
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">
                ETS ASSESSMENT
              </span>
            </div>

            <div className="hidden sm:block h-28 w-[1.5px] bg-slate-200 dark:bg-slate-700/80 shrink-0" />
          </div>

          <div className="flex-1 space-y-2.5 min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-800 text-white shadow-xs">
                <Headphones size={15} />
              </div>
              <div className="flex items-baseline gap-1.5 text-xs truncate">
                <span className="font-semibold text-text-secondary whitespace-nowrap">
                  {isVietnamese ? 'Kỹ năng:' : 'Skills:'}
                </span>
                <span className="font-extrabold text-text-primary truncate">{skillsText}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                <Clock size={15} />
              </div>
              <div className="flex items-baseline gap-1.5 text-xs truncate">
                <span className="font-semibold text-text-secondary whitespace-nowrap">
                  {isVietnamese ? 'Thời lượng:' : 'Duration:'}
                </span>
                <span className="font-extrabold text-text-primary truncate">{durationText}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-800 text-white shadow-xs">
                <ClipboardCheck size={15} />
              </div>
              <div className="flex items-baseline gap-1.5 text-xs truncate">
                <span className="font-semibold text-text-secondary whitespace-nowrap">
                  {isVietnamese ? 'Cấu trúc:' : 'Structure:'}
                </span>
                <span className="font-extrabold text-text-primary truncate">{questionsText}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
                <Trophy size={15} />
              </div>
              <div className="flex items-baseline gap-1.5 text-xs truncate">
                <span className="font-semibold text-text-secondary whitespace-nowrap">
                  {isVietnamese ? 'Thang điểm:' : 'Scale:'}
                </span>
                <span className="font-extrabold text-text-primary truncate">{targetScoreText}</span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col justify-end items-end shrink-0 pt-2 md:pt-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onStartExam(exam._id)
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-emerald-900/25 transition-all cursor-pointer group-hover:scale-105 active:scale-95"
            >
              <span>{isVietnamese ? 'Bắt đầu làm bài thi' : 'Start Placement Exam'}</span>
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

