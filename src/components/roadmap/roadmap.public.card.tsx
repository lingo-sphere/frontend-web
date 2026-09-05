/**
 * @file roadmap.public.card.tsx
 * @description Thành phần Roadmap Public Card phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file roadmap.public.card.tsx
 * @description Card thành phần hiển thị roadmap.public.card.tsx
 */

import { Layers, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { LearningRoadmap } from '@/types/api.types'

interface RoadmapPublicCardProps {
  roadmap: LearningRoadmap
  onEnroll: (roadmapId: string) => void
}

export function RoadmapPublicCard({ roadmap, onEnroll }: RoadmapPublicCardProps) {
  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-indigo-400 hover:shadow-lg flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span
            className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
              roadmap.skills_focus === '4SKILLS'
                ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
            }`}
          >
            {roadmap.skills_focus === '4SKILLS' ? '4 Kỹ Năng' : '2 Kỹ Năng (LR)'}
          </span>
          <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
            🎯 Mục tiêu {roadmap.target_score}+
          </span>
        </div>

        <h3 className="font-bold text-base text-text-primary group-hover:text-indigo-600 transition-colors">
          {roadmap.title}
        </h3>
        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
          {roadmap.description || 'Lộ trình từng bước giúp bứt phá điểm số bền vững.'}
        </p>

        <div className="pt-2 flex items-center gap-2 text-xs text-text-tertiary">
          <Layers className="w-3.5 h-3.5 text-indigo-500" />
          <span>{roadmap.stages?.length || 3} Chặng nối tiếp</span>
          <span>•</span>
          <span>
            Đầu vào: {roadmap.min_entry_score} - {roadmap.max_entry_score}
          </span>
        </div>
      </div>

      <div className="pt-3 border-t border-border flex items-center justify-between">
        <div>
          <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
            {(roadmap.bundle_price || 1200000).toLocaleString('vi-VN')} đ
          </div>
          {roadmap.original_price && (
            <div className="text-[11px] text-text-tertiary line-through">
              {roadmap.original_price.toLocaleString('vi-VN')} đ
            </div>
          )}
        </div>
        <Button
          size="sm"
          onClick={() => onEnroll(roadmap._id)}
          className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
        >
          <span>Bắt Đầu Ngay</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
