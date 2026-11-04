// Thẻ hiển thị bộ thẻ cá nhân trong mục Bộ thẻ của tôi theo phong cách thiết kế card hình học dải sóng xanh ngọc đồng bộ với hệ thống.
'use client'

import {
  Layers3,
  BookOpen,
  Sparkles,
  Play,
  ArrowRight,
  Globe,
  Lock,
  Trash2,
  Loader2,
} from 'lucide-react'
import type { Deck } from '@/features/vocabulary/schemas/vocabulary.schema'

interface VocabularyMyDeckCardProps {
  deck: Deck
  index?: number
  currentUser?: { user_id?: string; id?: string } | null
  isVietnamese: boolean
  isDeleting?: boolean
  onDeckClick: (deck: Deck) => void
  onToggleVisibility: (deck: Deck) => void
  onCopyShareLink: (deck: Deck) => void
  onRequestDelete: (deck: Deck) => void
}

export function VocabularyMyDeckCard({
  deck,
  currentUser,
  isVietnamese,
  isDeleting = false,
  onDeckClick,
  onToggleVisibility,
  onRequestDelete,
}: VocabularyMyDeckCardProps) {
  const isPublic = deck.visibility?.toUpperCase() === 'PUBLIC'
  const isUserDeck = deck.creator_type === 'USER'
  const currentUserId = currentUser?.user_id || currentUser?.id
  const isOwnDeck =
    isUserDeck &&
    Boolean(currentUserId) &&
    (deck.creator_id === currentUserId || deck.user_id === currentUserId)
  const progressPercent =
    typeof deck.progress_percent === 'number' ? Math.round(deck.progress_percent) : 0
  const cardCount = deck.card_count ?? 0

  const title = isVietnamese && deck.name_vi ? deck.name_vi : deck.name || deck.title
  const description =
    isVietnamese && deck.description_vi
      ? deck.description_vi
      : deck.description || (isVietnamese ? 'Bộ thẻ cá nhân ôn tập theo phương pháp lặp lại ngắt quãng' : 'Personal vocabulary flashcard deck')

  const deckCode = `#MY-${String(deck._id || deck.id || '001').slice(-3).toUpperCase()}`

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onDeckClick(deck)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onDeckClick(deck)
        }
      }}
      className="group relative h-[270px] w-full cursor-pointer select-none overflow-hidden rounded-[26px] border border-border/80 bg-surface dark:bg-card shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/50 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/40 hover:shadow-emerald-500/10"
    >
      <div className="absolute top-0 left-0 z-20 flex flex-col justify-center rounded-br-[36px] bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-4 py-2.5 pr-7 shadow-xs">
        <span className="text-xs font-black tracking-wider uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] sm:text-sm">
          {isVietnamese ? 'BỘ THẺ CỦA TÔI' : 'MY DECK'}
        </span>
        <span className="text-[10px] font-extrabold uppercase tracking-wide text-emerald-100 sm:text-[11px]">
          {isVietnamese ? `TIẾN ĐỘ ${progressPercent}%` : `PROGRESS ${progressPercent}%`}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          {isOwnDeck && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onToggleVisibility(deck)
              }}
              title={isPublic ? 'Công khai - Bấm để chuyển Riêng tư' : 'Riêng tư - Bấm để chuyển Công khai'}
              className={`p-1.5 rounded-xl border backdrop-blur-xs transition-colors cursor-pointer ${
                isPublic
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-surface-subtle/80 border-border/60 text-text-tertiary'
              }`}
            >
              {isPublic ? <Globe size={13} /> : <Lock size={13} />}
            </button>
          )}

          {onRequestDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onRequestDelete(deck)
              }}
              disabled={isDeleting}
              title="Xóa bộ thẻ"
              className="p-1.5 rounded-xl border border-border/60 bg-surface-subtle/80 text-text-tertiary hover:text-rose-600 hover:border-rose-300 dark:hover:border-rose-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isDeleting ? <Loader2 size={13} className="animate-spin text-rose-600" /> : <Trash2 size={13} />}
            </button>
          )}
        </div>

        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface-subtle/80 px-2 py-0.5 text-[10px] font-bold text-text-secondary backdrop-blur-xs">
          <Sparkles size={10} className="text-amber-500" />
          <span>{cardCount} {isVietnamese ? 'thẻ từ' : 'cards'}</span>
        </span>
      </div>

      <div className="relative z-10 space-y-1.5 pt-16 pr-16 pl-4 sm:pt-17 sm:pr-20 sm:pl-4.5">
        <h3 className="line-clamp-2 text-sm font-black leading-snug text-text-primary transition-colors duration-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 sm:text-[15px]">
          {title}
        </h3>
        <p className="line-clamp-2 text-[11px] leading-relaxed text-text-tertiary">
          {description}
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
            <span>{cardCount} từ vựng</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span>Tiến độ: {progressPercent}%</span>
          </div>
          <div className="flex items-center justify-end gap-1.5">
            <span>Chu kỳ Spaced SRS</span>
          </div>
          <div className="flex items-center justify-end gap-1.5 text-emerald-400 font-bold">
            <span>{progressPercent >= 100 ? (isVietnamese ? 'Đã hoàn thành' : 'Mastered') : (isVietnamese ? 'Đang rèn luyện' : 'In Progress')}</span>
          </div>
        </div>

        <div className="my-auto flex w-7 shrink-0 flex-col items-center justify-between gap-1.5 rounded-full bg-white py-2 shadow-md transition-all duration-300 group-hover:shadow-emerald-500/25 sm:w-7.5 dark:bg-slate-100">
          <Layers3 size={11} className="text-slate-900" />
          <BookOpen size={11} className="text-slate-900" />
          <Sparkles size={11} className="text-slate-900" />
          <Play size={11} className="fill-emerald-600 text-emerald-600 transition-transform duration-200 group-hover:scale-115" />
        </div>
      </div>

      <div className="absolute bottom-2 left-4 z-10">
        <span className="font-mono text-[10px] font-bold text-text-tertiary">
          {deckCode}
        </span>
      </div>

      <div className="absolute right-0 bottom-0 left-[20%] z-30 flex h-7 items-center justify-between rounded-tl-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 px-3.5 shadow-xs">
        <div className="flex w-full items-center justify-between text-[10px] font-black uppercase tracking-wider text-white sm:text-[11px]">
          <span className="truncate max-w-[90px]">{isVietnamese ? `TIẾN ĐỘ ${progressPercent}%` : `PROGRESS ${progressPercent}%`}</span>
          <span className="text-emerald-100/60">|</span>
          <span>{isPublic ? (isVietnamese ? 'CÔNG KHAI' : 'PUBLIC') : (isVietnamese ? 'RIÊNG TƯ' : 'PRIVATE')}</span>
          <span className="text-emerald-100/60">|</span>
          <span className="flex items-center gap-1 font-black shrink-0">
            <span>{isVietnamese ? 'HỌC TIẾP' : 'STUDY'}</span>
            <ArrowRight size={11} className="transition-transform duration-200 group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </div>
  )
}
