// Thẻ hiển thị bài đọc Reading Practice theo phong cách thiết kế card hình học cao cấp dải xanh ngọc đồng bộ với hệ thống.
'use client'

import { BookOpen, HelpCircle, Clock, Play, ArrowRight } from 'lucide-react'
import type { ReadingPassage } from '@/features/practice/types/reading'

interface ReadingPassageCardProps {
  passage: ReadingPassage
  index?: number
  onStartPractice: (passage: ReadingPassage) => void
}

function MiniQrCode({ className = 'w-10 h-10 text-slate-900 dark:text-slate-100' }: { className?: string }) {
  return (
    <svg viewBox="0 0 42 42" fill="currentColor" className={className} aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2.5" />
      <rect x="4.5" y="4.5" width="7" height="7" rx="1" fill="white" className="dark:fill-slate-900" />
      <rect x="6.5" y="6.5" width="3" height="3" rx="0.5" />

      <rect x="28" y="2" width="12" height="12" rx="2.5" />
      <rect x="30.5" y="4.5" width="7" height="7" rx="1" fill="white" className="dark:fill-slate-900" />
      <rect x="32.5" y="6.5" width="3" height="3" rx="0.5" />

      <rect x="2" y="28" width="12" height="12" rx="2.5" />
      <rect x="4.5" y="30.5" width="7" height="7" rx="1" fill="white" className="dark:fill-slate-900" />
      <rect x="6.5" y="32.5" width="3" height="3" rx="0.5" />

      <rect x="17" y="3" width="2" height="2" rx="0.3" />
      <rect x="21" y="3" width="2" height="2" rx="0.3" />
      <rect x="19" y="7" width="2" height="2" rx="0.3" />
      <rect x="23" y="7" width="2" height="2" rx="0.3" />
      <rect x="17" y="11" width="3" height="2" rx="0.3" />
      <rect x="22" y="11" width="3" height="2" rx="0.3" />

      <rect x="3" y="17" width="2" height="2" rx="0.3" />
      <rect x="7" y="17" width="2" height="2" rx="0.3" />
      <rect x="11" y="17" width="2" height="2" rx="0.3" />
      <rect x="17" y="17" width="2" height="2" rx="0.3" />
      <rect x="21" y="17" width="2" height="2" rx="0.3" />
      <rect x="25" y="17" width="2" height="2" rx="0.3" />
      <rect x="29" y="17" width="2" height="2" rx="0.3" />
      <rect x="33" y="17" width="2" height="2" rx="0.3" />
      <rect x="37" y="17" width="2" height="2" rx="0.3" />

      <rect x="17" y="21" width="4" height="2" rx="0.3" />
      <rect x="23" y="21" width="2" height="2" rx="0.3" />
      <rect x="27" y="21" width="3" height="2" rx="0.3" />
      <rect x="32" y="21" width="2" height="2" rx="0.3" />
      <rect x="36" y="21" width="3" height="2" rx="0.3" />

      <rect x="17" y="25" width="2" height="2" rx="0.3" />
      <rect x="21" y="25" width="3" height="2" rx="0.3" />
      <rect x="26" y="25" width="2" height="2" rx="0.3" />
      <rect x="30" y="25" width="3" height="2" rx="0.3" />
      <rect x="35" y="25" width="2" height="2" rx="0.3" />

      <rect x="17" y="29" width="3" height="2" rx="0.3" />
      <rect x="22" y="29" width="2" height="2" rx="0.3" />
      <rect x="26" y="29" width="3" height="2" rx="0.3" />
      <rect x="31" y="29" width="2" height="2" rx="0.3" />
      <rect x="35" y="29" width="3" height="2" rx="0.3" />

      <rect x="17" y="33" width="2" height="2" rx="0.3" />
      <rect x="21" y="33" width="3" height="2" rx="0.3" />
      <rect x="26" y="33" width="2" height="2" rx="0.3" />
      <rect x="30" y="33" width="3" height="2" rx="0.3" />
      <rect x="35" y="33" width="4" height="2" rx="0.3" />

      <rect x="17" y="37" width="3" height="2" rx="0.3" />
      <rect x="22" y="37" width="3" height="2" rx="0.3" />
      <rect x="27" y="37" width="2" height="2" rx="0.3" />
      <rect x="31" y="37" width="3" height="2" rx="0.3" />
      <rect x="36" y="37" width="3" height="2" rx="0.3" />
    </svg>
  )
}

function resolveReadingTypeLabel(type?: string): { badge: string; tag: string } {
  switch (type) {
    case 'PART_6':
      return { badge: 'TOEIC Part 6', tag: 'PART 6' }
    case 'PART_7':
      return { badge: 'TOEIC Part 7', tag: 'PART 7' }
    case 'REAL_WORLD_TASK':
      return { badge: 'Real-World Task', tag: 'THỰC TẾ' }
    case 'INFO_MATCHING':
      return { badge: 'Info Matching', tag: 'GHÉP CẶP' }
    default:
      return { badge: 'TOEIC Reading', tag: 'ĐỌC HIỂU' }
  }
}

export function ReadingPassageCard({ passage, onStartPractice }: ReadingPassageCardProps) {
  const typeInfo = resolveReadingTypeLabel(passage.reading_type)
  const questionCount = passage.questions?.length || 4
  const readingTime = passage.estimated_reading_time_minutes || 3
  const wordCount = passage.word_count || 150
  const cefrLevel = passage.cefr_level || 'B1'
  const passageTitle = passage.title_vi || passage.title
  const passageSnippet =
    passage.content_summary ||
    (passage.content ? passage.content.substring(0, 95).replace(/\s+/g, ' ').trim() + '...' : '')
  const passageCode = `#RD-${(passage._id || passage.id || '001').slice(-3).toUpperCase()}`

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onStartPractice(passage)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onStartPractice(passage)
        }
      }}
      className="group relative h-[270px] w-full cursor-pointer select-none overflow-hidden rounded-[26px] border border-border/80 bg-surface dark:bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-amber-400/60 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-amber-400/50"
    >
      <div className="absolute top-0 left-0 z-20 flex flex-col justify-center rounded-br-[36px] bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 px-4 py-2.5 pr-7 shadow-xs">
        <span className="text-xs font-black tracking-wider uppercase text-slate-950 sm:text-sm">
          BÀI ĐỌC {cefrLevel}
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-900/80 sm:text-[11px]">
          {typeInfo.badge}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1">
        <div className="rounded-xl bg-white/90 p-1.5 shadow-xs backdrop-blur-xs transition-transform duration-300 group-hover:scale-105 dark:bg-slate-900/90 dark:border dark:border-border/60">
          <MiniQrCode className="h-9 w-9 text-slate-900 dark:text-slate-100 sm:h-10 sm:w-10" />
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface-subtle/80 px-2 py-0.5 text-[10px] font-bold text-text-secondary backdrop-blur-xs">
          <Clock size={10} className="text-amber-500" />
          <span>{readingTime} phút</span>
        </span>
      </div>

      <div className="relative z-10 space-y-1.5 pt-16 pr-16 pl-4 sm:pt-17 sm:pr-20 sm:pl-4.5">
        <h3 className="line-clamp-2 text-sm font-black leading-snug text-text-primary transition-colors duration-200 group-hover:text-amber-500 dark:group-hover:text-amber-400 sm:text-[15px]">
          {passageTitle}
        </h3>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-text-tertiary">
          {passageSnippet}
        </p>
      </div>

      <svg
        className="pointer-events-none absolute right-0 bottom-0 z-10 h-[125px] w-[80%]"
        viewBox="0 0 300 120"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 0 120 C 35 120 45 75 90 48 C 135 22 185 0 300 0 L 300 120 Z"
          className="fill-[#0c192c] dark:fill-[#07111e]"
        />
      </svg>

      <div className="absolute right-3.5 bottom-9 z-20 flex max-w-[70%] items-center justify-end gap-2.5">
        <div className="space-y-0.5 text-right text-[10px] font-semibold leading-tight text-slate-200/95 sm:text-[11px]">
          <div className="flex items-center justify-end gap-1.5">
            <span>{wordCount} từ vựng</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span>{questionCount} câu hỏi</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span>{readingTime} phút đọc</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-amber-300">
            <span>Chuẩn CEFR {cefrLevel}</span>
          </div>
        </div>

        <div className="my-auto flex w-7 shrink-0 flex-col items-center justify-between gap-1.5 rounded-full bg-white py-2 shadow-md transition-all duration-300 group-hover:shadow-amber-500/20 sm:w-7.5 dark:bg-slate-100">
          <BookOpen size={11} className="text-slate-900" />
          <HelpCircle size={11} className="text-slate-900" />
          <Clock size={11} className="text-slate-900" />
          <Play size={11} className="fill-slate-900 text-slate-900 transition-transform duration-200 group-hover:scale-115" />
        </div>
      </div>

      <div className="absolute bottom-2 left-4 z-10">
        <span className="font-mono text-[10px] font-bold text-text-tertiary">
          {passageCode}
        </span>
      </div>

      <div className="absolute right-0 bottom-0 left-[20%] z-30 flex h-7 items-center justify-between rounded-tl-2xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 px-3.5 shadow-xs">
        <div className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-950 sm:text-[11px]">
          <span>{typeInfo.tag}</span>
          <span className="opacity-40">|</span>
          <span>THỰC TẾ</span>
          <span className="opacity-40">|</span>
          <span className="flex items-center gap-1 font-black">
            <span>LUYỆN TẬP</span>
            <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  )
}

