// Thẻ hiển thị bài luyện nghe Part 2, Part 3, Part 4 và Chép chính tả theo phong cách thiết kế hình học sóng xanh cao cấp.
'use client'

import React from 'react'
import {
  Play,
  ArrowRight,
  Headphones,
  Users,
  Mic,
  FileEdit,
  ListOrdered,
  HelpCircle,
  Target,
  Clock,
} from 'lucide-react'
import type {
  Part2Item,
  Part3Item,
  Part4Item,
  DictationItem,
} from '@/features/practice/types/listening-practice'

export type ListeningPracticeCardType = 'PART_2' | 'PART_3' | 'PART_4' | 'DICTATION'

interface ListeningPracticeCardProps {
  type: ListeningPracticeCardType
  item: Part2Item | Part3Item | Part4Item | DictationItem
  categoryName: string
  isVietnamese: boolean
  onStartPractice: () => void
}

export function ListeningPracticeCard({
  type,
  item,
  categoryName,
  isVietnamese,
  onStartPractice,
}: ListeningPracticeCardProps) {
  const partLabel =
    type === 'PART_2'
      ? 'TOEIC PART 2'
      : type === 'PART_3'
        ? 'TOEIC PART 3'
        : type === 'PART_4'
          ? 'TOEIC PART 4'
          : 'DICTATION'

  const title =
    isVietnamese && item.title_vi
      ? item.title_vi
      : item.title ||
        (type === 'PART_2'
          ? isVietnamese
            ? 'Hỏi & Đáp nhanh'
            : 'Quick Q & A'
          : isVietnamese
            ? 'Bài luyện nghe'
            : 'Listening Exercise')

  const subtitle =
    type === 'PART_2'
      ? isVietnamese
        ? 'Nghe 1 câu hỏi và chọn phản hồi đúng'
        : 'Listen and select the best response'
      : type === 'PART_3'
        ? (item as Part3Item).title || (isVietnamese ? 'Hội thoại ngắn' : 'Short Conversation')
        : type === 'PART_4'
          ? (item as Part4Item).title || (isVietnamese ? 'Bài nói ngắn' : 'Short Talk')
          : (item as DictationItem).description_vi ||
            (item as DictationItem).description ||
            (isVietnamese ? 'Nghe chép chính tả từng câu' : 'Sentence-by-sentence Dictation')

  const cefr = item.cefr_level || (type === 'PART_2' ? 'A2' : 'B1')
  const difficulty = item.difficulty_level || (type === 'PART_2' ? 'EASY' : 'MEDIUM')

  let durationSeconds = 45
  if (type === 'PART_2') {
    durationSeconds = (item as Part2Item).audio_duration_seconds || 15
  } else if (type === 'PART_3' || type === 'PART_4' || type === 'DICTATION') {
    durationSeconds = (item as Part3Item | Part4Item | DictationItem).duration_seconds || 45
  }

  const p3Item = type === 'PART_3' ? (item as Part3Item) : null
  const p4Item = type === 'PART_4' ? (item as Part4Item) : null
  const dictItem = type === 'DICTATION' ? (item as DictationItem) : null

  const p3Speakers = p3Item
    ? `${p3Item.speaker_1_name || 'Speaker 1'} & ${p3Item.speaker_2_name || 'Speaker 2'}`
    : '2 người đối thoại'

  const p4Speaker = p4Item
    ? `${p4Item.speaker_name || 'Speaker'}${p4Item.speaker_role ? ` (${p4Item.speaker_role})` : ''}`
    : '1 người thuyết trình'

  const dictSegments = dictItem
    ? dictItem.total_segments || dictItem.segments?.length || 0
    : 0

  const questionCount =
    type === 'PART_3'
      ? p3Item?.questions?.length || 3
      : type === 'PART_4'
        ? p4Item?.questions?.length || 3
        : 1

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onStartPractice}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onStartPractice()
        }
      }}
      className="group relative min-h-[255px] w-full cursor-pointer select-none overflow-hidden rounded-[26px] border border-border/80 bg-surface dark:bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 flex flex-col justify-between"
    >
      <svg
        className="pointer-events-none absolute top-0 left-0 z-10 h-[62px] w-[66%] min-w-[185px] max-w-[235px]"
        viewBox="0 0 220 62"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`greenGrad-${item._id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="55%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id={`ribbonShadow-${item._id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.2" />
          </filter>
        </defs>
        <path
          d="M 0 0 L 215 0 C 195 4 175 16 155 32 C 135 48 90 62 0 62 Z"
          fill={`url(#greenGrad-${item._id})`}
        />
        <path
          d="M 0 62 C 90 62 135 48 155 32 C 175 16 195 4 215 0"
          stroke="#86efac"
          strokeWidth="5"
          strokeOpacity="0.5"
          fill="none"
        />
        <path
          d="M 0 62 C 90 62 135 48 155 32 C 175 16 195 4 215 0"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter={`url(#ribbonShadow-${item._id})`}
          fill="none"
        />
      </svg>

      <svg
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-[38px] w-[26%] max-w-[110px]"
        viewBox="0 0 140 40"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M 0 20 C 20 20 45 28 80 38 C 100 40 120 40 140 40 L 0 40 Z"
          fill={`url(#greenGrad-${item._id})`}
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
          filter={`url(#ribbonShadow-${item._id})`}
          fill="none"
        />
      </svg>

      <div className="relative z-20 flex items-start justify-between px-3 pt-2 pb-0">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="flex h-7.5 w-7.5 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md border border-white/40 text-white shadow-xs flex-shrink-0">
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white/20 stroke-white" strokeWidth="2">
              <path d="M12 2l7.5 4.5v9L12 20l-7.5-4.5v-9L12 2z" strokeLinejoin="round" />
              <path d="M12 11l7.5-4.5M12 11v9M12 11L4.5 6.5" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
            <span className="block text-[10.5px] font-black uppercase tracking-wider leading-none text-white whitespace-nowrap">
              {partLabel}
            </span>
            <span
              title={categoryName}
              className="block text-[9px] font-bold text-emerald-100 mt-0.5 whitespace-nowrap max-w-[75px] truncate"
            >
              {categoryName}
            </span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 rounded-full bg-surface-subtle px-2 py-0.5 text-[9.5px] font-extrabold text-text-secondary border border-border/60 flex-shrink-0 whitespace-nowrap shadow-2xs">
          <span>{cefr}</span>
          <span className="opacity-40">•</span>
          <span>{difficulty}</span>
        </span>
      </div>

      <div className="relative z-20 px-5 sm:px-6 pt-3 space-y-2">
        <div>
          <h4 className="text-[15px] sm:text-base font-black tracking-tight text-slate-900 dark:text-white line-clamp-1">
            {title}
          </h4>
          <div className="h-[2px] w-8 rounded-full bg-emerald-500/50 group-hover:w-14 group-hover:bg-emerald-500 transition-all duration-300 mt-1 mb-1" />
          <p className="text-xs font-medium text-text-tertiary line-clamp-1">
            {subtitle}
          </p>
        </div>

        {type === 'PART_2' && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 px-3 py-1.5 flex items-center justify-between text-xs shadow-2xs gap-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
              <Headphones size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>{isVietnamese ? 'Hỏi & Đáp nhanh' : 'Quick Q & A'}</span>
            </span>
            <span className="font-semibold text-text-tertiary text-[11px] truncate text-right">
              {isVietnamese ? 'Bẫy distractor phân tích' : 'Distractor analysis'}
            </span>
          </div>
        )}

        {type === 'PART_3' && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 px-3 py-1.5 flex items-center justify-between text-xs shadow-2xs gap-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 truncate max-w-[180px]">
              <Users size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="truncate">{p3Speakers}</span>
            </span>
            <span className="font-semibold text-text-tertiary text-[11px] flex-shrink-0 whitespace-nowrap">
              {questionCount} {isVietnamese ? 'câu hỏi' : 'Qs'}
            </span>
          </div>
        )}

        {type === 'PART_4' && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 px-3 py-1.5 flex items-center justify-between text-xs shadow-2xs gap-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 truncate max-w-[180px]">
              <Mic size={13} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="truncate">{p4Speaker}</span>
            </span>
            <span className="font-semibold text-text-tertiary text-[11px] flex-shrink-0 whitespace-nowrap">
              {questionCount} {isVietnamese ? 'câu hỏi' : 'Qs'}
            </span>
          </div>
        )}

        {type === 'DICTATION' && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/20 px-3 py-1.5 flex items-center justify-between text-xs shadow-2xs gap-2">
            <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
              <FileEdit size={13} className="text-emerald-600 dark:text-emerald-400" />
              <span>{dictSegments} {isVietnamese ? 'câu chính tả' : 'segments'}</span>
            </span>
            <span className="font-semibold text-text-tertiary text-[11px] whitespace-nowrap">
              {durationSeconds}s audio
            </span>
          </div>
        )}
      </div>

      <div className="relative z-20 flex items-center justify-between border-t border-border/40 px-4 sm:px-5 py-2.5 bg-surface/40 dark:bg-card/40 backdrop-blur-xs gap-2">
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          <div className="flex items-center gap-1 text-xs text-text-secondary whitespace-nowrap flex-shrink-0" title="Cấu trúc">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 dark:bg-emerald-600 text-white shadow-2xs flex-shrink-0">
              {type === 'PART_2' ? (
                <ListOrdered size={10} strokeWidth={2.4} />
              ) : type === 'DICTATION' ? (
                <FileEdit size={10} strokeWidth={2.4} />
              ) : (
                <HelpCircle size={10} strokeWidth={2.4} />
              )}
            </div>
            <span className="text-[11px] font-bold whitespace-nowrap flex-shrink-0">
              {type === 'PART_2'
                ? '3 câu'
                : type === 'DICTATION'
                  ? `${dictSegments} câu`
                  : `${questionCount} câu`}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-text-secondary whitespace-nowrap flex-shrink-0" title="Cấp độ">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 dark:bg-emerald-600 text-white shadow-2xs flex-shrink-0">
              <Target size={10} strokeWidth={2.4} />
            </div>
            <span className="text-[11px] font-bold whitespace-nowrap flex-shrink-0">{cefr}</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-text-secondary whitespace-nowrap flex-shrink-0" title="Thời lượng">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-700 dark:bg-emerald-600 text-white shadow-2xs flex-shrink-0">
              <Clock size={10} strokeWidth={2.4} />
            </div>
            <span className="text-[11px] font-bold whitespace-nowrap flex-shrink-0">{durationSeconds}s</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onStartPractice()
          }}
          className="inline-flex items-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-3 py-1.5 text-xs font-extrabold shadow-md hover:shadow-emerald-500/25 transition-all whitespace-nowrap flex-shrink-0"
        >
          <Play size={10} className="fill-current flex-shrink-0" />
          <span className="whitespace-nowrap flex-shrink-0">{isVietnamese ? 'Luyện tập' : 'Practice'}</span>
          <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-0.5 flex-shrink-0" />
        </button>
      </div>
    </div>
  )
}
