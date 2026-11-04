// Thẻ hiển thị bộ thẻ từ vựng flashcard với thiết kế hiện đại, gradient chuyển màu và huy hiệu tương tác.
'use client'

import React from 'react'
import { Layers3, Users, Check, GraduationCap, Target, BookOpen, Play, ArrowRight, Sparkles } from 'lucide-react'
import type { Deck } from '@/features/vocabulary/schemas/vocabulary.schema'

interface TopicInfo {
  _id?: string
  name_en?: string
  name_vi?: string
  icon?: string
  color?: string
}

interface VocabularyDeckCardProps {
  pack: Deck
  index: number
  packTopic?: TopicInfo | null
  isEnrolled: boolean
  isVietnamese: boolean
  onDeckClick: (pack: Deck) => void
}

const DECK_GRADIENTS = [
  {
    bg: 'from-indigo-600 via-indigo-700 to-violet-800',
    iconBg: 'bg-white/20 text-white',
    glow: 'bg-indigo-400/20',
  },
  {
    bg: 'from-emerald-600 via-teal-600 to-teal-800',
    iconBg: 'bg-white/20 text-white',
    glow: 'bg-emerald-400/20',
  },
  {
    bg: 'from-sky-600 via-blue-600 to-indigo-700',
    iconBg: 'bg-white/20 text-white',
    glow: 'bg-sky-400/20',
  },
  {
    bg: 'from-amber-500 via-orange-600 to-rose-600',
    iconBg: 'bg-white/20 text-white',
    glow: 'bg-amber-400/20',
  },
  {
    bg: 'from-purple-600 via-fuchsia-600 to-pink-600',
    iconBg: 'bg-white/20 text-white',
    glow: 'bg-fuchsia-400/20',
  },
  {
    bg: 'from-teal-600 via-emerald-600 to-cyan-700',
    iconBg: 'bg-white/20 text-white',
    glow: 'bg-teal-400/20',
  },
]

export function VocabularyDeckCard({
  pack,
  index,
  packTopic,
  isEnrolled,
  isVietnamese,
  onDeckClick,
}: VocabularyDeckCardProps) {
  const gradientTheme = DECK_GRADIENTS[index % DECK_GRADIENTS.length]
  const targetBand = pack.settings?.target_band
  const examPart = pack.settings?.exam_part
  const cardCount = pack.card_count ?? 0
  const totalUsers = pack.total_users || 0

  const title = isVietnamese && pack.name_vi ? pack.name_vi : pack.name || pack.title
  const description = isVietnamese && pack.description_vi ? pack.description_vi : pack.description || pack.description_vi
  const topicName = packTopic ? (isVietnamese ? packTopic.name_vi || packTopic.name_en : packTopic.name_en) : null

  return (
    <div
      onClick={() => onDeckClick(pack)}
      className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-surface shadow-xs hover:shadow-xl hover:-translate-y-1.5 hover:border-primary/40 transition-all duration-300 overflow-hidden cursor-pointer h-full"
    >
      <div className={`relative h-28 sm:h-32 w-full overflow-hidden bg-gradient-to-br ${gradientTheme.bg} p-3.5 flex flex-col justify-between`}>
        <div className={`absolute -right-6 -bottom-6 w-28 h-28 rounded-full ${gradientTheme.glow} blur-xl pointer-events-none`} />
        <div className="absolute -left-6 -top-6 w-24 h-24 rounded-full bg-white/10 blur-lg pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {targetBand && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-black/35 backdrop-blur-md text-white text-[10px] font-black border border-white/20 shadow-xs">
                <Target size={10} className="text-amber-300" />
                <span>Band {targetBand}</span>
              </span>
            )}
            {examPart && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-white/20 backdrop-blur-md text-white text-[10px] font-black border border-white/25 shadow-xs">
                <span>{examPart.replace('_', ' ')}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {isEnrolled ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl bg-emerald-500/95 backdrop-blur-md text-white text-[10px] font-black border border-white/30 shadow-sm">
                <Check size={11} className="stroke-[3]" />
                <span>{isVietnamese ? 'Đang học' : 'Enrolled'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-black/35 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 shadow-xs">
                <GraduationCap size={11} className="text-amber-300" />
                <span>Official</span>
              </span>
            )}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 shadow-md flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-110">
            <Layers3 className="w-5 h-5 stroke-[2.2] drop-shadow-sm" />
          </div>

          <div className="px-2 py-0.5 rounded-lg bg-black/40 backdrop-blur-md text-white/95 text-[10px] font-bold border border-white/15 flex items-center gap-1">
            <BookOpen size={10} className="text-emerald-300" />
            <span>{cardCount} {isVietnamese ? 'từ vựng' : 'words'}</span>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {topicName && (
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-2.5 py-0.5 text-[11px] font-extrabold text-primary border border-primary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{topicName}</span>
              </span>
            </div>
          )}

          <h4 className="text-[15px] sm:text-base font-black text-text-primary tracking-tight group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {title}
          </h4>

          <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2 min-h-[34px]">
            {description}
          </p>
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            <span className="px-2 py-0.5 rounded-lg bg-surface-subtle text-text-tertiary font-bold flex items-center gap-1">
              <Sparkles size={10} className="text-amber-500" />
              <span>Ghi nhớ SRS</span>
            </span>
            <span className="px-2 py-0.5 rounded-lg bg-surface-subtle text-text-tertiary font-bold flex items-center gap-1">
              <span>Chuẩn TOEIC</span>
            </span>
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5 font-bold text-text-primary text-xs">
              <Layers3 size={13} className="text-primary" />
              <span>{cardCount} {isVietnamese ? 'thẻ từ' : 'cards'}</span>
            </span>

            <span className="flex items-center gap-1 text-[11px] text-text-tertiary font-medium">
              <Users size={12} />
              <span>{totalUsers.toLocaleString()} {isVietnamese ? 'học viên' : 'learners'}</span>
            </span>
          </div>

          {isEnrolled ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDeckClick(pack)
              }}
              className="w-full mt-2 py-2.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold text-xs shadow-sm hover:shadow-emerald-500/25 flex items-center justify-center gap-2 group-hover:scale-[1.01] transition-all cursor-pointer"
            >
              <Play size={13} className="fill-white" />
              <span>{isVietnamese ? 'Học tiếp (Bộ thẻ của tôi)' : 'Continue Learning'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDeckClick(pack)
              }}
              className="w-full mt-2 py-2.5 px-4 rounded-2xl bg-surface-subtle hover:bg-primary text-text-primary hover:text-white border border-border/80 hover:border-primary font-extrabold text-xs shadow-2xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer group-hover:bg-primary group-hover:text-white group-hover:border-primary"
            >
              <span>{isVietnamese ? 'Bắt đầu học' : 'Start Learning'}</span>
              <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

