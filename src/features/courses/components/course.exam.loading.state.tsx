/// Skeleton loading state chuẩn xác cho trang không gian làm bài kiểm tra khóa học.
'use client'

import { ArrowLeft, Clock, Send, Volume2, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/button'

interface CourseExamLoadingStateProps {
  onBack?: () => void
}

export function CourseExamLoadingState({ onBack }: CourseExamLoadingStateProps) {
  return (
    <div className="min-h-screen bg-surface-secondary text-text-primary flex flex-col antialiased select-none">
      <header className="sticky top-0 z-40 w-full flex items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-10 py-3.5 border-b border-border bg-surface/95 backdrop-blur-md shrink-0 shadow-xs">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="rounded-xl gap-2 font-semibold cursor-pointer hover:bg-surface-subtle"
          >
            <ArrowLeft size={16} />
            <span>Thoát</span>
          </Button>
          <div className="space-y-1.5">
            <div className="h-5 w-64 sm:w-96 rounded-lg bg-surface-subtle animate-pulse" />
            <div className="h-3 w-40 sm:w-56 rounded-md bg-surface-subtle/70 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-mono font-bold text-sm shadow-2xs">
            <Clock size={16} className="animate-pulse" />
            <span className="h-4 w-12 rounded bg-amber-500/20 animate-pulse" />
          </div>
          <div className="h-9 w-24 rounded-xl bg-primary/20 animate-pulse hidden sm:block" />
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6 gap-6 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-6 pr-0 lg:pr-2">
          <div className="rounded-2xl bg-surface border border-border p-3.5 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Volume2 size={18} />
              </div>
              <div className="space-y-1 flex-1">
                <div className="h-3.5 w-64 rounded bg-surface-subtle animate-pulse" />
                <div className="h-2.5 w-32 rounded bg-surface-subtle/60 animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-48 rounded-xl bg-surface-subtle animate-pulse hidden sm:block" />
          </div>

          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-2 flex-1 pt-1">
                <div className="h-4 w-full rounded bg-surface-subtle animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-surface-subtle animate-pulse" />
              </div>
            </div>

            <div className="w-full aspect-16/7 max-h-72 rounded-2xl bg-surface-subtle/60 border border-border flex flex-col items-center justify-center gap-2 text-text-tertiary">
              <ImageIcon size={32} className="opacity-40 animate-pulse" />
              <div className="h-3 w-32 rounded bg-surface-subtle animate-pulse" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[0, 1, 2, 3].map((opt) => (
                <div
                  key={opt}
                  className="rounded-2xl border border-border bg-surface-subtle/30 p-4 flex items-center gap-3.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-surface-subtle flex items-center justify-center font-bold text-xs text-text-tertiary shrink-0">
                    {String.fromCharCode(65 + opt)}
                  </div>
                  <div className="h-4 w-3/5 rounded bg-surface-subtle animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-surface border border-border p-6 sm:p-8 space-y-6 shadow-xs opacity-60">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-black text-sm flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-2 flex-1 pt-1">
                <div className="h-4 w-5/6 rounded bg-surface-subtle animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {[0, 1, 2, 3].map((opt) => (
                <div
                  key={opt}
                  className="rounded-2xl border border-border bg-surface-subtle/30 p-4 flex items-center gap-3.5"
                >
                  <div className="w-8 h-8 rounded-xl bg-surface-subtle flex items-center justify-center font-bold text-xs text-text-tertiary shrink-0">
                    {String.fromCharCode(65 + opt)}
                  </div>
                  <div className="h-4 w-1/2 rounded bg-surface-subtle animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="w-full lg:w-80 xl:w-96 rounded-2xl border border-border bg-surface shadow-xs shrink-0 flex flex-col p-4 space-y-4 max-h-[35vh] lg:max-h-[calc(100vh-8.5rem)] sticky top-20 overflow-hidden">
          <div className="space-y-1.5 pb-2 border-b border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-text-primary">
                Bảng câu hỏi
              </span>
              <div className="h-3 w-10 rounded bg-surface-subtle animate-pulse" />
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-subtle overflow-hidden">
              <div className="h-full w-1/4 bg-primary/40 rounded-full animate-pulse" />
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div
                key={idx}
                className="h-10 rounded-xl bg-surface-subtle/70 border border-border/80 flex items-center justify-center text-xs font-bold text-text-tertiary animate-pulse"
              >
                {idx + 1}
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-primary/50" />
              <div className="h-3 w-28 rounded bg-surface-subtle animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-surface-subtle" />
              <div className="h-3 w-32 rounded bg-surface-subtle animate-pulse" />
            </div>
          </div>

          <div className="pt-2">
            <div className="h-11 w-full rounded-xl bg-primary/20 animate-pulse flex items-center justify-center gap-2 text-primary/60 font-bold text-xs">
              <Send size={15} />
              <span>Đang tải bài thi...</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
