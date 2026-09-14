// Skeleton loading state chuan xac cho trang tong quan khoa hoc Landing Page khi hoc vien chua mua khoa hoc.
'use client'

import { ArrowLeft, Play, ShoppingCart } from 'lucide-react'

interface CourseLandingLoadingStateProps {
  onBack?: () => void
}

export function CourseLandingLoadingState({ onBack }: CourseLandingLoadingStateProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased animate-in fade-in duration-150">
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Khám phá các khóa học</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl text-slate-400">
            <ShoppingCart className="w-5 h-5 opacity-40" />
          </div>
          <div className="h-7 w-20 rounded-xl bg-slate-800 animate-pulse" />
        </div>
      </header>

      <div className="w-full bg-slate-900 dark:bg-slate-950 text-slate-100 py-8 lg:py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:w-7/12 space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-16 rounded bg-slate-800 animate-pulse" />
              <div className="h-3 w-3 rounded bg-slate-800 animate-pulse" />
              <div className="h-3 w-28 rounded bg-slate-800 animate-pulse" />
            </div>

            <div className="space-y-2.5">
              <div className="h-8 sm:h-10 w-4/5 rounded-xl bg-slate-800 animate-pulse" />
              <div className="space-y-1.5 pt-1">
                <div className="h-4 w-full rounded bg-slate-800/70 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-slate-800/50 animate-pulse" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="h-6 w-24 rounded-md bg-amber-400/30 animate-pulse" />
              <div className="h-6 w-32 rounded-md bg-indigo-500/20 animate-pulse" />
              <div className="h-6 w-24 rounded-md bg-purple-500/20 animate-pulse" />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="h-4 w-36 rounded bg-slate-800 animate-pulse" />
              <div className="h-4 w-28 rounded bg-slate-800 animate-pulse" />
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <div className="h-4 w-44 rounded bg-slate-800/80 animate-pulse" />
              <div className="h-4 w-32 rounded bg-slate-800/60 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-10 order-2 lg:order-1">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 bg-white dark:bg-slate-900 shadow-xs space-y-4">
              <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 shrink-0 mt-0.5 animate-pulse" />
                    <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800/80 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-6 w-44 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                {[1, 2, 3, 4].map((idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900">
                    <div className="flex items-center gap-3 w-2/3">
                      <div className="w-4 h-4 rounded bg-slate-300 dark:bg-slate-700 animate-pulse shrink-0" />
                      <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                    </div>
                    <div className="h-3.5 w-24 rounded bg-slate-200 dark:bg-slate-800/60 animate-pulse shrink-0" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="h-6 w-28 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="space-y-2.5">
                {[1, 2, 3].map((idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500/30 shrink-0" />
                    <div className="h-4 w-4/5 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="h-6 w-36 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="space-y-2.5">
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <div className="h-6 w-48 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse shrink-0" />
                <div className="space-y-2 flex-1 w-full">
                  <div className="h-5 w-44 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-4 w-60 rounded bg-slate-200 dark:bg-slate-800/60 animate-pulse" />
                  <div className="h-4 w-full rounded bg-slate-200 dark:bg-slate-800/40 animate-pulse pt-1" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 lg:-mt-72 relative z-20 order-1 lg:order-2">
            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden sticky top-20 z-20 space-y-5">
              <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                  <Play className="w-7 h-7 fill-white/40 text-white/40 ml-1" />
                </div>
              </div>

              <div className="p-6 pt-0 space-y-5">
                <div className="space-y-1.5">
                  <div className="h-8 w-36 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="h-3.5 w-48 rounded bg-rose-500/20 animate-pulse" />
                </div>

                <div className="space-y-2.5">
                  <div className="h-12 w-full rounded-2xl bg-indigo-500/30 animate-pulse" />
                  <div className="h-11 w-full rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                  <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                  <div className="space-y-2.5">
                    {[1, 2, 3, 4, 5].map((idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded bg-indigo-500/20 shrink-0" />
                        <div className="h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
