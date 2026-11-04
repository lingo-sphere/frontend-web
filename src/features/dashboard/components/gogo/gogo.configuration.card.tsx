// Component thẻ cấu hình lộ trình học tập cá nhân hóa theo phong cách Gogo Configuration Card.
'use client'

import React from 'react'
import { Rocket, BookOpen, Sparkles, CheckCircle2 } from 'lucide-react'

interface GogoConfigurationCardProps {
  targetScore?: number
  currentStreak?: number
  xp?: number
  onPractice?: () => void
  onVocab?: () => void
}

export function GogoConfigurationCard({
  targetScore = 0,
  currentStreak = 0,
  xp = 0,
  onPractice,
  onVocab,
}: GogoConfigurationCardProps) {
  const targetLabel = targetScore > 0 ? `mục tiêu ${targetScore} điểm TOEIC` : 'mục tiêu đề ra'

  return (
    <div className="space-y-3 h-full flex flex-col">
      <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider">
        Lộ Trình & Mục Tiêu
      </h2>
      <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 shadow-xs flex-1 flex flex-col items-center justify-between text-center">
        <div className="w-full flex items-center justify-center py-4">
          <div className="relative w-44 h-40 flex items-center justify-center">
            <svg
              viewBox="0 0 200 180"
              className="w-full h-full text-emerald-500/80 stroke-current"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="100" cy="90" r="70" className="stroke-emerald-500/20" strokeDasharray="4 4" />
              <circle cx="100" cy="90" r="45" className="stroke-emerald-500/30" />
              <path d="M45 130 Q 75 70, 100 90 T 155 50" className="stroke-emerald-500/70" strokeWidth="2.5" />
              <circle cx="45" cy="130" r="5" className="fill-emerald-400 stroke-emerald-600" />
              <circle cx="100" cy="90" r="6" className="fill-emerald-500 stroke-emerald-700" />
              <circle cx="155" cy="50" r="7" className="fill-emerald-300 stroke-emerald-600" />
              <rect x="80" y="30" width="40" height="20" rx="6" className="stroke-emerald-500/50 fill-emerald-50/50 dark:fill-emerald-950/40" />
              <path d="M90 40 L 110 40" className="stroke-emerald-500/60" />
              <path d="M145 110 L 175 110 L 160 135 Z" className="stroke-emerald-500/50 fill-emerald-50/30 dark:fill-emerald-950/30" />
              <path d="M25 70 L 45 70 L 35 90 Z" className="stroke-emerald-500/50 fill-emerald-50/30 dark:fill-emerald-950/30" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800/40">
                <Sparkles className="w-5 h-5" />
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-w-xs">
          <h3 className="text-base sm:text-lg font-bold text-text-primary">
            Lộ Trình Cá Nhân Hóa
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed">
            Bám sát {targetLabel}. Duy trì chuỗi {currentStreak} ngày học liên tiếp để bứt phá năng lực!
          </p>
          <div className="flex items-center justify-center gap-2 pt-1 text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Tích lũy {xp.toLocaleString('vi-VN')} XP kinh nghiệm</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-5 w-full">
          <button
            type="button"
            onClick={onPractice}
            className="flex-1 max-w-[140px] px-4 py-2 rounded-2xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Luyện đề</span>
          </button>
          <button
            type="button"
            onClick={onVocab}
            className="flex-1 max-w-[140px] px-4 py-2 rounded-2xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-500/10 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ôn từ vựng</span>
          </button>
        </div>
      </div>
    </div>
  )
}
