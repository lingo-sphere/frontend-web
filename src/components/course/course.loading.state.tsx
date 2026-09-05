'use client'

/**
 * @file CourseLoadingState.tsx
 * @description Skeleton loading state chuẩn xác cho trang Workspace học tập & chi tiết khóa học
 */

import { ArrowLeft, Play, Star, Sparkles, Share2, PanelRightClose } from 'lucide-react'

interface CourseLoadingStateProps {
  onBack: () => void
}

export function CourseLoadingState({ onBack }: CourseLoadingStateProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col animate-in fade-in duration-150">
      
      <header className="flex h-14 w-full items-center justify-between border-b border-border bg-surface px-4 sm:px-6 shadow-xs shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-0 pr-4">
          <button
            onClick={onBack}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-subtle/70 hover:bg-surface-hover transition-colors text-text-secondary cursor-pointer"
            title="Quay lại danh sách khóa học"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="space-y-1.5 flex-1 max-w-md">
            <div className="h-4 w-3/4 rounded-md bg-surface-subtle animate-pulse" />
            <div className="h-2.5 w-1/3 rounded-md bg-surface-subtle/70 animate-pulse hidden sm:block" />
          </div>
        </div>

        
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl border border-border bg-surface-subtle animate-pulse">
            <Star size={13} className="text-text-tertiary" />
            <div className="h-2.5 w-14 rounded bg-text-tertiary/20" />
          </div>
          <div className="h-8 w-8 rounded-xl border border-border bg-surface-subtle animate-pulse hidden sm:flex items-center justify-center text-text-tertiary">
            <Share2 size={13} />
          </div>
          <div className="h-8 w-8 rounded-xl border border-border bg-surface-subtle animate-pulse flex items-center justify-center text-text-tertiary">
            <PanelRightClose size={14} />
          </div>
        </div>
      </header>

      
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        
        <div className="flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          
          <div className="w-full bg-black relative flex flex-col items-center justify-center overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] shadow-xl">
            
            <div className="flex flex-col items-center justify-center gap-4 text-white/70">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border-2 border-white/15 border-t-primary animate-spin" />
                <Play size={22} className="absolute text-white/80 fill-white/80" />
              </div>
              <div className="h-4 w-48 rounded-md bg-white/20 animate-pulse mt-1" />
            </div>

            
            <div className="absolute bottom-0 inset-x-0 h-11 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-4 w-4 rounded bg-white/30 animate-pulse" />
                <div className="h-3 w-16 rounded bg-white/20 animate-pulse" />
              </div>
              <div className="h-1 flex-1 mx-4 rounded-full bg-white/20 overflow-hidden">
                <div className="h-full w-1/4 bg-primary/60 rounded-full animate-pulse" />
              </div>
              <div className="flex items-center gap-2.5">
                <div className="h-4 w-4 rounded bg-white/30 animate-pulse" />
                <div className="h-4 w-4 rounded bg-white/30 animate-pulse" />
                <div className="h-4 w-4 rounded bg-white/30 animate-pulse" />
              </div>
            </div>
          </div>

          
          <div className="p-4 sm:p-8 space-y-6 max-w-5xl">
            
            <div className="flex items-center gap-6 border-b border-border pb-3">
              <div className="h-4 w-32 rounded-md bg-primary/40 animate-pulse" />
              <div className="h-4 w-28 rounded-md bg-surface-subtle animate-pulse" />
              <div className="h-4 w-24 rounded-md bg-surface-subtle animate-pulse" />
              <div className="h-4 w-24 rounded-md bg-surface-subtle animate-pulse" />
            </div>

            
            <div className="space-y-3 pt-2">
              <div className="h-7 w-3/4 rounded-xl bg-surface-subtle animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-3.5 w-full rounded-md bg-surface-subtle/80 animate-pulse" />
                <div className="h-3.5 w-4/5 rounded-md bg-surface-subtle/60 animate-pulse" />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="h-6 w-28 rounded-lg bg-surface-subtle animate-pulse" />
                <div className="h-6 w-36 rounded-lg bg-surface-subtle animate-pulse" />
                <div className="h-6 w-24 rounded-lg bg-surface-subtle animate-pulse" />
                <div className="h-6 w-28 rounded-lg bg-surface-subtle animate-pulse" />
              </div>
            </div>

            
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xs">
              <div className="h-5 w-64 rounded-lg bg-surface-subtle animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="h-4 w-4 rounded-full bg-primary/20 shrink-0" />
                    <div className="h-3 w-full rounded bg-surface-subtle/80 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            
            <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xs">
              <div className="h-5 w-48 rounded-lg bg-surface-subtle animate-pulse" />
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="h-16 w-16 rounded-2xl bg-surface-subtle shrink-0 animate-pulse" />
                <div className="space-y-2 flex-1 w-full">
                  <div className="h-4 w-40 rounded-md bg-surface-subtle animate-pulse" />
                  <div className="h-3 w-32 rounded-md bg-primary/30 animate-pulse" />
                  <div className="h-3 w-full rounded-md bg-surface-subtle/70 animate-pulse pt-1" />
                </div>
              </div>
            </div>
          </div>
        </div>

        
        <div className="w-full lg:w-[380px] shrink-0 border-l border-border bg-surface flex flex-col max-h-[calc(100vh-3.5rem)] shadow-lg hidden lg:flex">
          
          <div className="flex items-center justify-between border-b border-border bg-surface-subtle/50 px-4 py-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-7 w-32 rounded-lg bg-surface shadow-xs border border-border/50 animate-pulse" />
              <div className="h-7 w-24 rounded-lg bg-surface-subtle/60 flex items-center gap-1.5 px-2.5 text-text-tertiary">
                <Sparkles size={12} />
                <div className="h-2.5 w-10 rounded bg-text-tertiary/20" />
              </div>
            </div>
            <div className="h-3.5 w-20 rounded bg-surface-subtle animate-pulse" />
          </div>

          
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            
            <div className="p-4 space-y-3 bg-surface">
              <div className="flex items-center justify-between">
                <div className="h-4 w-44 rounded-md bg-surface-subtle animate-pulse" />
                <div className="h-3 w-16 rounded bg-surface-subtle/60 animate-pulse" />
              </div>

              
              <div className="space-y-2 pt-1">
                {[1, 2, 3].map((lesIdx) => (
                  <div
                    key={lesIdx}
                    className={`flex items-center gap-3 p-3 rounded-xl border border-border/50 ${
                      lesIdx === 1 ? 'bg-primary-soft/40 border-primary/30' : 'bg-surface-subtle/40'
                    }`}
                  >
                    <div className="h-4 w-4 rounded border border-border bg-surface shrink-0 animate-pulse" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="h-3.5 w-4/5 rounded bg-surface-subtle animate-pulse" />
                      <div className="h-2.5 w-16 rounded bg-surface-subtle/60 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            
            <div className="p-4 space-y-2 bg-surface">
              <div className="flex items-center justify-between">
                <div className="h-4 w-48 rounded-md bg-surface-subtle animate-pulse" />
                <div className="h-3 w-16 rounded bg-surface-subtle/60 animate-pulse" />
              </div>
            </div>

            
            <div className="p-4 space-y-2 bg-surface">
              <div className="flex items-center justify-between">
                <div className="h-4 w-40 rounded-md bg-surface-subtle animate-pulse" />
                <div className="h-3 w-16 rounded bg-surface-subtle/60 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
