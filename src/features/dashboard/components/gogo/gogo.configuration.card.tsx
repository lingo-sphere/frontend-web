// Component thẻ mục tiêu cá nhân hóa dạng đồng hồ đo tiến độ theo phong cách thiết kế Cuba Monthly Target Widget.
'use client'

import React from 'react'
import { Rocket, BookOpen, Target, Sparkles, CheckCircle2, Flame, Award } from 'lucide-react'

interface GogoConfigurationCardProps {
  targetScore?: number
  currentScore?: number
  baselineScore?: number
  currentStreak?: number
  xp?: number
  onPractice?: () => void
  onVocab?: () => void
}

function SemiCircleTargetGauge({
  percent,
  size = 200,
  strokeWidth = 12,
}: {
  percent: number
  size?: number
  strokeWidth?: number
}) {
  const width = size
  const height = size / 2 + strokeWidth + 8
  const cx = size / 2
  const cy = size / 2 + 2
  const radius = (size - strokeWidth) / 2 - 4

  const clamped = Math.min(100, Math.max(0, percent))
  const circumference = Math.PI * radius
  const strokeDashoffset = circumference - (clamped / 100) * circumference

  const polarToCartesian = (angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180
    return {
      x: cx + radius * Math.cos(angleRad),
      y: cy - radius * Math.sin(angleRad),
    }
  }

  const startPt = polarToCartesian(180)
  const endPt = polarToCartesian(0)
  const bgPath = `M ${startPt.x} ${startPt.y} A ${radius} ${radius} 0 0 1 ${endPt.x} ${endPt.y}`

  const angle = 180 - (clamped / 100) * 180
  const needleEnd = polarToCartesian(angle)

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id="cubaTargetGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
        </defs>

        <path
          d={bgPath}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-border/40"
        />

        {clamped > 0 && (
          <path
            d={bgPath}
            fill="none"
            stroke="url(#cubaTargetGrad)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        )}

        <circle cx={cx} cy={cy} r={7} fill="#10b981" />
        <circle cx={cx} cy={cy} r={3} fill="#ffffff" />
        <line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="#10b981"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>

      <div className="text-center -mt-2">
        <span className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
          {clamped}%
        </span>
        <span className="text-[11px] font-bold text-text-tertiary block">
          Tiến độ chạm đích
        </span>
      </div>
    </div>
  )
}

export function GogoConfigurationCard({
  targetScore = 0,
  currentScore = 0,
  baselineScore = 0,
  currentStreak = 0,
  xp = 0,
  onPractice,
  onVocab,
}: GogoConfigurationCardProps) {
  const percent = targetScore > 0 ? Math.min(100, Math.round((currentScore / targetScore) * 100)) : 0

  return (
    <div className="rounded-3xl bg-surface border border-border p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-primary/10 text-primary">
            <Target className="w-4 h-4" />
          </span>
          <div>
            <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
              Mục Tiêu Cá Nhân Hóa
            </h3>
            <p className="text-[11px] text-text-tertiary">
              Tiến trình cán đích điểm số TOEIC chuẩn
            </p>
          </div>
        </div>

        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
          {targetScore > 0 ? `Target: ${targetScore}đ` : 'Chưa đặt mục tiêu'}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-2">
        <SemiCircleTargetGauge percent={percent} />
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-surface-subtle/60 border border-border/80 text-center">
        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold text-text-tertiary uppercase">Khởi điểm</span>
          <span className="text-sm font-black text-text-secondary block">
            {baselineScore > 0 ? `${baselineScore}đ` : '--'}
          </span>
        </div>

        <div className="space-y-0.5 border-x border-border/60">
          <span className="text-[10px] font-semibold text-text-tertiary uppercase">Hiện tại</span>
          <span className="text-sm font-black text-primary block">
            {currentScore > 0 ? `${currentScore}đ` : '--'}
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] font-semibold text-text-tertiary uppercase">Mục tiêu</span>
          <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
            {targetScore > 0 ? `${targetScore}đ` : '--'}
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs text-text-secondary px-1">
          <span className="flex items-center gap-1.5 font-medium">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>Chuỗi học: {currentStreak} ngày</span>
          </span>
          <span className="flex items-center gap-1 font-semibold text-text-primary">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            <span>{xp.toLocaleString('vi-VN')} XP</span>
          </span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          {onPractice && (
            <button
              type="button"
              onClick={onPractice}
              className="flex-1 px-3 py-2 rounded-2xl bg-primary text-white hover:bg-primary-hover text-xs font-bold shadow-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 hover:scale-[1.02]"
            >
              <Rocket className="w-3.5 h-3.5" />
              <span>Luyện Đề</span>
            </button>
          )}

          {onVocab && (
            <button
              type="button"
              onClick={onVocab}
              className="flex-1 px-3 py-2 rounded-2xl bg-surface hover:bg-surface-subtle text-text-secondary hover:text-text-primary border border-border text-xs font-bold transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Ôn Từ Vựng</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
