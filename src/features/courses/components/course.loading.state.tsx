// Skeleton loading state chuẩn xác cho trang Workspace học tập và chi tiết bài giảng khóa học.
'use client'

import { ArrowLeft, Star, Share2, PanelRightClose, Play, FileText, Lock, Trophy } from 'lucide-react'

interface CourseLoadingStateProps {
  onBack?: () => void
}

export function CourseLoadingState({ onBack }: CourseLoadingStateProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col antialiased select-none">
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between bg-[#1c1d1f] px-4 sm:px-6 text-white border-b border-white/10 shadow-md">
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            title="Quay lại danh sách khóa học"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="h-5 w-px bg-white/20 hidden sm:block shrink-0" />

          <div className="h-4 w-56 sm:w-80 rounded-md bg-white/20 animate-pulse" />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-white/90">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold">Đánh giá</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-white/90">
            <Share2 size={13} />
            <span className="text-xs font-semibold">Chia sẻ</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-primary bg-primary/20 px-3 py-1.5 text-white text-xs font-semibold">
            <PanelRightClose size={15} />
            <span className="hidden sm:inline">Đóng mục lục</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-y-auto scroll-smooth max-h-[calc(100vh-3.5rem)]">
          <div className="flex flex-col">
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl border border-border/80 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-3 text-white/80">
                <div className="relative flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full border-2 border-white/15 border-t-[#ff0000] animate-spin" />
                  <Play size={20} className="absolute text-white fill-white ml-0.5" />
                </div>
                <div className="h-3.5 w-40 rounded-md bg-white/20 animate-pulse mt-1" />
              </div>

              <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-3.5 w-3.5 rounded bg-white/30 animate-pulse" />
                  <div className="h-2.5 w-14 rounded bg-white/20 animate-pulse" />
                </div>
                <div className="h-1 flex-1 mx-3 rounded-full bg-white/20 overflow-hidden">
                  <div className="h-full w-1/5 bg-[#ff0000] rounded-full animate-pulse" />
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="h-3.5 w-3.5 rounded bg-white/30 animate-pulse" />
                  <div className="h-3.5 w-3.5 rounded bg-white/30 animate-pulse" />
                  <div className="h-3.5 w-3.5 rounded bg-white/30 animate-pulse" />
                </div>
              </div>
            </div>

            <div className="bg-surface border-b border-border/80 px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-full bg-surface-subtle flex items-center justify-center text-[10px] font-bold text-text-tertiary">
                  L
                </div>
                <div className="h-4 w-48 sm:w-72 rounded-md bg-surface-subtle animate-pulse" />
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-500/30">
                  <FileText size={13} className="text-blue-600 dark:text-blue-400" />
                  <span>Đề lý thuyết (PDF)</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-subtle text-text-secondary text-xs font-bold border border-border">
                  <FileText size={13} />
                  <span>Tài liệu khóa học</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[420px] xl:w-[440px] shrink-0 border-l border-border bg-surface flex flex-col max-h-[calc(100vh-3.5rem)] shadow-xl hidden lg:flex">
          <div className="border-b border-border bg-surface-subtle/40 px-4 py-3 space-y-2.5 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-border/80 shadow-xs">
                <div className="rounded-lg px-3 py-1.5 text-xs bg-emerald-600 text-white font-bold shadow-xs">
                  Nội dung khóa học
                </div>
                <div className="rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 text-text-secondary font-medium">
                  <FileText size={13} />
                  <span>Tài liệu khóa học</span>
                </div>
              </div>

              <div className="p-1.5 rounded-xl text-text-tertiary">
                <PanelRightClose size={16} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-0.5">
              <span className="text-[11px] font-bold text-text-secondary">Tiến độ bài học</span>
              <div className="h-4 w-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 animate-pulse" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <div className="rounded-2xl border border-emerald-500/30 bg-surface shadow-xs p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    CHƯƠNG 1
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                    Đang học
                  </span>
                </div>
              </div>

              <div className="h-4 w-4/5 rounded bg-surface-subtle animate-pulse" />
              <div className="h-3 w-28 rounded bg-surface-subtle/70 animate-pulse" />

              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/30">
                  <div className="w-4 h-4 rounded-full border-2 border-emerald-600 shrink-0" />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="h-3.5 w-4/5 rounded bg-surface-subtle animate-pulse" />
                    <div className="h-2.5 w-20 rounded bg-surface-subtle/70 animate-pulse" />
                  </div>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-950/10">
                  <div className="flex items-center gap-2 min-w-0">
                    <Trophy size={14} className="text-emerald-600 shrink-0" />
                    <div className="space-y-1">
                      <div className="h-3.5 w-32 rounded bg-surface-subtle animate-pulse" />
                      <div className="h-2.5 w-16 rounded bg-surface-subtle/70 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-6 w-24 rounded-lg bg-emerald-600/80 animate-pulse shrink-0" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-surface/80 p-3 space-y-2.5 opacity-80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-surface-subtle text-text-secondary">
                    CHƯƠNG 2
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 flex items-center gap-1">
                    <Lock size={10} />
                    <span>Đang khóa</span>
                  </span>
                </div>
              </div>

              <div className="h-4 w-3/4 rounded bg-surface-subtle animate-pulse" />
              <div className="h-3 w-24 rounded bg-surface-subtle/70 animate-pulse" />

              <div className="space-y-1.5 pt-1">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-subtle/40 border border-border/40">
                    <Lock size={12} className="text-text-tertiary shrink-0" />
                    <div className="h-3 w-3/5 rounded bg-surface-subtle animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/80 bg-surface/80 p-3 space-y-2 opacity-60">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-surface-subtle text-text-secondary">
                  CHƯƠNG 3
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 flex items-center gap-1">
                  <Lock size={10} />
                  <span>Đang khóa</span>
                </span>
              </div>
              <div className="h-4 w-2/3 rounded bg-surface-subtle animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
