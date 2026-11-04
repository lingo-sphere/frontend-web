// Thẻ hiển thị chủ đề luyện ngữ pháp theo phong cách thiết kế card hình học dải sóng xanh cao cấp.
'use client'

import React from 'react'
import { BookOpen, Target, Compass, Play, ArrowRight, CheckCircle2 } from 'lucide-react'
import type { GrammarTopicItem } from '@/features/practice/types/grammar-practice'

interface GrammarTopicCardProps {
  topic: GrammarTopicItem
  isStarting?: boolean
  onStartPractice: (topic: GrammarTopicItem) => void
}

export function GrammarTopicCard({
  topic,
  isStarting = false,
  onStartPractice,
}: GrammarTopicCardProps) {
  const categoryLabel = topic.category?.replace(/_/g, ' ') || 'NGỮ PHÁP'
  const title = topic.name_vi || topic.name_en
  const subtitle = topic.name_en
  const cefr = topic.cefr_level || 'A1'
  const questionCount = topic.total_questions || 6

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onStartPractice(topic)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onStartPractice(topic)
        }
      }}
      className="group relative min-h-[255px] w-full cursor-pointer select-none overflow-hidden rounded-[26px] border border-border/80 bg-surface dark:bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 flex flex-col justify-between"
    >
      <svg
        className="pointer-events-none absolute top-0 left-0 z-10 h-[56px] w-[52%] max-w-[210px]"
        viewBox="0 0 210 56"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`greenGrad-${topic._id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="55%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id={`ribbonShadow-${topic._id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.18" />
          </filter>
        </defs>
        <path
          d="M 0 0 L 200 0 C 165 4 125 18 85 38 C 50 48 25 54 0 56 Z"
          fill={`url(#greenGrad-${topic._id})`}
        />
        <path
          d="M 0 56 C 25 54 50 48 85 38 C 125 18 165 4 200 0"
          stroke="#86efac"
          strokeWidth="5"
          strokeOpacity="0.45"
          fill="none"
        />
        <path
          d="M 0 56 C 25 54 50 48 85 38 C 125 18 165 4 200 0"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter={`url(#ribbonShadow-${topic._id})`}
          fill="none"
        />
      </svg>

      <svg
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-[40px] w-[28%] max-w-[120px]"
        viewBox="0 0 140 40"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 0 20 C 20 20 45 28 80 38 C 100 40 120 40 140 40 L 0 40 Z"
          fill={`url(#greenGrad-${topic._id})`}
        />
        <path
          d="M 0 20 C 20 20 45 28 80 38 C 100 40 120 40 140 40"
          stroke="#86efac"
          strokeWidth="4"
          strokeOpacity="0.45"
          fill="none"
        />
        <path
          d="M 0 20 C 20 20 45 28 80 38 C 100 40 120 40 140 40"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          filter={`url(#ribbonShadow-${topic._id})`}
          fill="none"
        />
      </svg>

      <div className="relative z-20 flex items-start justify-between px-3.5 pt-2.5 pb-0">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md border border-white/35 text-white shadow-xs">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 fill-white/15 stroke-white" strokeWidth="2">
              <path d="M12 2l7.5 4.5v9L12 20l-7.5-4.5v-9L12 2z" strokeLinejoin="round" />
              <path d="M12 11l7.5-4.5M12 11v9M12 11L4.5 6.5" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-white drop-shadow-xs max-w-[115px]">
            <span className="block text-[10px] font-black uppercase tracking-wider leading-none truncate">
              {categoryLabel}
            </span>
            <span className="block text-[9px] font-bold text-white/85 mt-0.5">
              CEFR {cefr}
            </span>
          </div>
        </div>

        {topic.is_completed ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 backdrop-blur-xs">
            <CheckCircle2 size={11} />
            <span>Đã hoàn thành</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-[10px] font-bold text-text-tertiary border border-border/60">
            <span>{questionCount} bài tập</span>
          </span>
        )}
      </div>

      <div className="relative z-20 pl-8 sm:pl-9 pr-5 pt-3 space-y-2">
        <div>
          <h4 className="text-[15px] sm:text-base font-black tracking-tight text-slate-900 dark:text-white line-clamp-1">
            {title}
          </h4>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="h-[2px] w-8 rounded-full bg-emerald-500/50 group-hover:w-14 group-hover:bg-emerald-500 transition-all duration-300" />
            <p className="text-xs font-medium text-text-tertiary line-clamp-1">
              {subtitle}
            </p>
          </div>
        </div>

        {topic.structure_pattern ? (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 px-3 py-1.5 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">
              Cấu trúc:
            </span>
            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 block line-clamp-1 mt-0.5">
              {topic.structure_pattern}
            </span>
          </div>
        ) : topic.description_vi ? (
          <p className="text-xs text-text-secondary line-clamp-2">
            {topic.description_vi}
          </p>
        ) : null}
      </div>

      <div className="relative z-20 flex items-center justify-between border-t border-border/40 px-5 sm:px-6 py-3 bg-surface/40 dark:bg-card/40 backdrop-blur-xs">
        <div className="flex items-center gap-3 pl-6 sm:pl-7">
          <div className="flex items-center gap-1.5 text-xs text-text-secondary" title="Số câu hỏi">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 dark:bg-emerald-600 text-white shadow-2xs">
              <BookOpen size={10} strokeWidth={2.4} />
            </div>
            <span className="text-[11px] font-bold">{questionCount} câu</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary" title="Cấp độ">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 dark:bg-emerald-600 text-white shadow-2xs">
              <Target size={10} strokeWidth={2.4} />
            </div>
            <span className="text-[11px] font-bold">{cefr}</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-text-secondary" title="Chủ điểm">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 dark:bg-emerald-600 text-white shadow-2xs">
              <Compass size={10} strokeWidth={2.4} />
            </div>
            <span className="text-[11px] font-bold truncate max-w-[80px]">{categoryLabel}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={isStarting}
          onClick={(e) => {
            e.stopPropagation()
            onStartPractice(topic)
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3.5 py-1.5 text-xs font-extrabold shadow-md hover:shadow-emerald-500/25 transition-all"
        >
          <Play size={10} className="fill-current" />
          <span>{isStarting ? 'Đang vào...' : 'Luyện tập'}</span>
          <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  )
}
