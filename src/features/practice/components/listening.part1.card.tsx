// Thẻ hiển thị bài luyện nghe Part 1 Mô tả hình ảnh theo phong cách ảnh nền toàn cảnh điện ảnh The Card.
'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Play, ArrowRight, Camera } from 'lucide-react'
import { resolveImageUrl } from '@/utils/media.utils'
import type { Part1Item } from '@/features/practice/types/listening-practice'

interface ListeningPart1CardProps {
  item: Part1Item
  isVietnamese: boolean
  categoryName: string
  onStartPractice: (item: Part1Item) => void
}

export function ListeningPart1Card({
  item,
  isVietnamese,
  categoryName,
  onStartPractice,
}: ListeningPart1CardProps) {
  const [hasImageError, setHasImageError] = useState(false)
  const imageUrl = item.image_url ? resolveImageUrl(item.image_url) : ''
  const title = isVietnamese && item.title_vi ? item.title_vi : item.title || 'Bài mô tả tranh Part 1'
  const cefr = item.cefr_level || 'B1'
  const difficulty = item.difficulty_level || 'MEDIUM'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onStartPractice(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onStartPractice(item)
        }
      }}
      className="group relative h-[350px] w-full cursor-pointer select-none overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 shadow-md transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
    >
      <div className="absolute inset-0 bg-slate-900 overflow-hidden">
        {imageUrl && !hasImageError ? (
          <Image
            unoptimized
            fill
            src={imageUrl}
            alt={title}
            onError={() => setHasImageError(true)}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center gap-2 text-sm text-white/50">
            <Camera size={24} />
            <span>{isVietnamese ? 'Ảnh bài thi' : 'Test image'}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 transition-colors duration-500 group-hover:from-black/95 group-hover:via-black/50" />
      </div>

      <div className="absolute top-0 left-0 z-20 flex flex-col justify-center rounded-br-2xl border-r border-b border-white/15 bg-black/75 px-4 py-2.5 shadow-lg backdrop-blur-md">
        <span className="text-xs font-black tracking-wider uppercase text-white sm:text-sm">
          TOEIC PART 1
        </span>
        <span className="text-[10px] font-semibold text-white/80 sm:text-[11px]">
          {categoryName}
        </span>
      </div>

      <div className="absolute top-3 right-3 z-20">
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1 text-xs font-black text-slate-950 shadow-lg backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{cefr} • {difficulty}</span>
        </span>
      </div>

      <div className="absolute inset-x-3.5 bottom-3.5 z-20 flex flex-col items-end text-right sm:inset-x-4 sm:bottom-4">
        <h3 className="w-full text-right font-black uppercase tracking-wide text-white drop-shadow-md text-sm sm:text-base line-clamp-1 transition-colors duration-200 group-hover:text-amber-300">
          {title}
        </h3>

        <div className="mt-2 w-full rounded-xl border border-white/15 bg-black/75 p-3 sm:p-3.5 shadow-2xl backdrop-blur-md space-y-1.5 text-left">
          <p className="text-xs leading-relaxed text-white/90 line-clamp-2">
            {isVietnamese
              ? 'Nghe 4 lựa chọn A, B, C, D để chọn câu miêu tả chân thực, chính xác nhất về bức ảnh.'
              : 'Listen to 4 options (A, B, C, D) to choose the most accurate description of the picture.'}
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/10 text-[10px] font-semibold text-white/75">
            <span>📸 1 Bức ảnh</span>
            <span className="opacity-40">•</span>
            <span>🎧 4 Lựa chọn</span>
            <span className="opacity-40">•</span>
            <span>⏱️ 45 giây</span>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onStartPractice(item)
          }}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-xl transition-all duration-300 hover:bg-emerald-500 hover:text-white hover:scale-105 group-hover:shadow-white/20"
        >
          <Play size={12} className="fill-current" />
          <span>{isVietnamese ? 'Luyện tập ngay' : 'Practice Now'}</span>
          <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  )
}

