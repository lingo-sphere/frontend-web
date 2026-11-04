// Thẻ hiển thị bộ thẻ cá nhân trong mục Bộ thẻ của tôi với thiết kế hiện đại, thanh tiến độ và các nút thao tác.
'use client'

import React from 'react'
import {
  Layers3,
  Target,
  GraduationCap,
  Users,
  Globe,
  Lock,
  Sparkles,
  BookOpen,
  Share2,
  Trash2,
  Play,
  CheckCircle2,
} from 'lucide-react'
import type { Deck } from '@/features/vocabulary/schemas/vocabulary.schema'

interface VocabularyMyDeckCardProps {
  deck: Deck
  index: number
  currentUser?: { user_id?: string; id?: string } | null
  isVietnamese: boolean
  isDeleting?: boolean
  onDeckClick: (deck: Deck) => void
  onToggleVisibility: (deck: Deck) => void
  onCopyShareLink: (deck: Deck) => void
  onRequestDelete: (deck: Deck) => void
}

const MY_DECK_GRADIENTS = [
  {
    bg: 'from-teal-600 via-emerald-600 to-teal-800',
    glow: 'bg-emerald-400/20',
  },
  {
    bg: 'from-indigo-600 via-indigo-700 to-purple-800',
    glow: 'bg-indigo-400/20',
  },
  {
    bg: 'from-sky-600 via-blue-600 to-indigo-700',
    glow: 'bg-sky-400/20',
  },
  {
    bg: 'from-amber-500 via-orange-600 to-rose-600',
    glow: 'bg-amber-400/20',
  },
  {
    bg: 'from-purple-600 via-fuchsia-600 to-pink-600',
    glow: 'bg-fuchsia-400/20',
  },
]

export function VocabularyMyDeckCard({
  deck,
  index,
  currentUser,
  isVietnamese,
  isDeleting = false,
  onDeckClick,
  onToggleVisibility,
  onCopyShareLink,
  onRequestDelete,
}: VocabularyMyDeckCardProps) {
  const gradientTheme = MY_DECK_GRADIENTS[index % MY_DECK_GRADIENTS.length]
  const targetBand = deck.settings?.target_band
  const examPart = deck.settings?.exam_part
  const isPublic = deck.visibility?.toUpperCase() === 'PUBLIC'
  const isUserDeck = deck.creator_type === 'USER'
  const currentUserId = currentUser?.user_id || currentUser?.id
  const isOwnDeck =
    isUserDeck &&
    Boolean(currentUserId) &&
    (deck.creator_id === currentUserId || deck.user_id === currentUserId)
  const isSystemDeck = deck.creator_type === 'SYSTEM' || !deck.creator_type
  const progressPercent =
    typeof deck.progress_percent === 'number' ? deck.progress_percent : 0
  const cardCount = deck.card_count ?? 0

  const title = isVietnamese && deck.name_vi ? deck.name_vi : deck.name || deck.title
  const description =
    isVietnamese && deck.description_vi
      ? deck.description_vi
      : deck.description ||
        deck.description_vi ||
        (isVietnamese ? 'Bộ thẻ đang học' : 'Enrolled deck')

  return (
    <div
      onClick={() => onDeckClick(deck)}
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
            {isOwnDeck ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility(deck)
                }}
                title={
                  isVietnamese
                    ? isPublic
                      ? 'Đang Công khai - Bấm để chuyển sang Riêng tư'
                      : 'Đang Riêng tư - Bấm để chuyển sang Công khai'
                    : 'Toggle Public / Private'
                }
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl text-[10px] font-black backdrop-blur-md transition shadow-xs border ${
                  isPublic
                    ? 'bg-emerald-600/90 text-white hover:bg-emerald-600 border-white/30'
                    : 'bg-black/45 text-white hover:bg-black/60 border-white/20'
                }`}
              >
                {isPublic ? <Globe size={11} /> : <Lock size={11} />}
                <span>
                  {isPublic
                    ? isVietnamese
                      ? 'Công khai'
                      : 'Public'
                    : isVietnamese
                    ? 'Riêng tư'
                    : 'Private'}
                </span>
              </button>
            ) : isSystemDeck ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-black/35 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 shadow-xs">
                <GraduationCap size={11} className="text-amber-300" />
                <span>{isVietnamese ? 'Hệ thống' : 'Official'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-xl bg-sky-600/80 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 shadow-xs">
                <Users size={11} className="text-sky-200" />
                <span>{isVietnamese ? 'Cộng đồng' : 'Community'}</span>
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
          <div>
            {isSystemDeck ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-2.5 py-0.5 text-[11px] font-extrabold text-primary border border-primary/20">
                <Sparkles size={11} className="text-amber-500" />
                <span>{isVietnamese ? 'Bộ thẻ TOEIC chuẩn hóa' : 'Standard TOEIC Pack'}</span>
              </span>
            ) : isOwnDeck ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <span>👑</span>
                <span>{isVietnamese ? 'Bộ thẻ do bạn tạo' : 'Created by you'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-extrabold text-sky-600 dark:text-sky-400 border border-sky-500/20">
                <Users size={11} />
                <span className="line-clamp-1">
                  {isVietnamese ? 'Tác giả: ' : 'By: '}
                  {deck.creator_name ||
                    deck.author ||
                    (isVietnamese ? 'Học viên chia sẻ' : 'Community Learner')}
                </span>
              </span>
            )}
          </div>

          <h4 className="text-[15px] sm:text-base font-black text-text-primary tracking-tight group-hover:text-primary transition-colors line-clamp-1 leading-snug">
            {title}
          </h4>

          <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2 min-h-[34px]">
            {description}
          </p>
        </div>

        <div className="space-y-3 pt-1">
          {progressPercent > 0 ? (
            <div className="space-y-1.5 p-2.5 rounded-2xl bg-surface-subtle/70 border border-border/60">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-[11px] font-semibold text-text-secondary">
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  <span>{isVietnamese ? 'Tiến độ học' : 'Study Progress'}</span>
                </span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs">
                  {progressPercent}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-subtle border border-border/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap text-[10px]">
              <span className="px-2 py-0.5 rounded-lg bg-surface-subtle text-text-tertiary font-bold flex items-center gap-1">
                <Sparkles size={10} className="text-amber-500" />
                <span>Ghi nhớ SRS</span>
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-surface-subtle text-text-tertiary font-bold flex items-center gap-1">
                <span>Sẵn sàng rèn luyện</span>
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/60 pt-2.5 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5 font-bold text-text-primary text-xs">
              <Layers3 size={13} className="text-primary" />
              <span>{cardCount} {isVietnamese ? 'từ' : 'words'}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                title={isVietnamese ? 'Sao chép liên kết bộ thẻ' : 'Copy share link'}
                onClick={(e) => {
                  e.stopPropagation()
                  onCopyShareLink(deck)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-all hover:bg-surface-subtle hover:text-primary hover:border-primary/50 cursor-pointer"
              >
                <Share2 size={13} />
              </button>

              <button
                type="button"
                disabled={isDeleting}
                title={
                  isOwnDeck
                    ? isVietnamese
                      ? 'Xóa bộ thẻ'
                      : 'Delete Deck'
                    : isVietnamese
                    ? 'Xóa khỏi Bộ thẻ của tôi'
                    : 'Remove from My Decks'
                }
                onClick={(e) => {
                  e.stopPropagation()
                  onRequestDelete(deck)
                }}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-surface text-text-secondary transition-all hover:bg-rose-500/10 hover:text-rose-600 hover:border-rose-500/40 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 size={13} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeckClick(deck)
                }}
                className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs shadow-xs flex items-center gap-1.5 transition-all duration-200 cursor-pointer hover:scale-[1.02] ${
                  progressPercent > 0
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-600 text-white'
                    : 'bg-primary hover:bg-primary-hover text-white'
                }`}
              >
                <Play size={11} className="fill-white" />
                <span>
                  {progressPercent > 0
                    ? isVietnamese
                      ? 'Học tiếp'
                      : 'Continue'
                    : isVietnamese
                    ? 'Luyện tập'
                    : 'Practice'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
