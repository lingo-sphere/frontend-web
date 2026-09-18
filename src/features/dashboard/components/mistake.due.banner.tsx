// Component hiển thị widget nhắc nhở các câu sai đến hạn ôn tập SRS trên Dashboard chính.

'use client'

import Link from 'next/link'
import { Calendar, RotateCcw, ArrowRight, BookmarkCheck } from 'lucide-react'
import { Button } from '@/components/button'
import { useDueMistakesQuery } from '@/features/practice/hooks/use.mistake.query'

export function MistakeDueBanner() {
  const { data, isLoading } = useDueMistakesQuery()

  const dueCount = data?.total_due ?? (data?.items ? data.items.length : 0)

  if (isLoading || dueCount === 0) {
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md shadow-rose-500/25">
            <BookmarkCheck size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1">
                <Calendar size={12} />
                <span>Nhắc nhở Spaced Repetition (SRS)</span>
              </span>
              <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                {dueCount} câu đến hạn
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-bold text-text-primary">
              Hôm nay bạn có {dueCount} câu hỏi cần khắc phục trong Sổ tay lỗi sai!
            </h4>
            <p className="text-xs text-text-secondary">
              Ôn tập đúng lịch ngắt quãng giúp não bộ chuyển hóa kiến thức từ trí nhớ ngắn hạn sang dài hạn.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Link href="/practice/mistakes">
            <Button
              size="sm"
              className="gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-500/20 cursor-pointer"
            >
              <RotateCcw size={14} />
              <span>Ôn tập ngay ({dueCount})</span>
              <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
