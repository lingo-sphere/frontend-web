'use client'

import { ArrowLeft } from 'lucide-react'

interface CourseLoadingStateProps {
  onBack: () => void
}

export function CourseLoadingState({ onBack }: CourseLoadingStateProps) {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <header className="flex h-14 w-full items-center justify-between bg-[#1c1d1f] px-4 sm:px-6 text-white border-b border-white/10 shadow-md">
        <button
          onClick={onBack}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
          title="Quay lại danh sách khóa học"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="h-4 w-48 bg-white/20 rounded-md animate-pulse" />
        <div className="w-16" />
      </header>

      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        <div className="flex-1 flex flex-col bg-black">
          <div className="aspect-video w-full max-h-[70vh] bg-slate-950 flex flex-col items-center justify-center gap-3 text-white/60">
            <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold text-white/80 animate-pulse">
              Đang tải nội dung bài giảng...
            </p>
          </div>
          <div className="p-6 space-y-4 max-w-5xl">
            <div className="h-8 w-1/3 bg-surface-subtle rounded-xl animate-pulse" />
            <div className="h-24 w-full bg-surface-subtle rounded-2xl animate-pulse" />
          </div>
        </div>
        <div className="w-full lg:w-96 border-l border-border bg-surface p-4 space-y-3 hidden lg:block">
          <div className="h-6 w-1/2 bg-surface-subtle rounded-md animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 w-full bg-surface-subtle rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
