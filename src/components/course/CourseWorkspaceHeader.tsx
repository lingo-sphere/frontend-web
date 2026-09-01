'use client'

/**
 * @file CourseWorkspaceHeader.tsx
 * @description Component giao diện React CourseWorkspaceHeader cho học viên
 */

import { ArrowLeft, MoreVertical, Share2, Star, Trophy } from 'lucide-react'

interface CourseWorkspaceHeaderProps {
  courseTitle: string
  onBack: () => void
  onOpenRating: () => void
  onOpenCertificate: () => void
}

export function CourseWorkspaceHeader({
  courseTitle,
  onBack,
  onOpenRating,
  onOpenCertificate,
}: CourseWorkspaceHeaderProps) {
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
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

        <h1 className="truncate text-xs sm:text-sm font-bold text-white/95">
          {courseTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-xs font-semibold">
        <button
          onClick={onOpenRating}
          className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <Star size={14} className="text-warning fill-warning" />
          <span>Đánh giá</span>
        </button>

        <button
          onClick={onOpenCertificate}
          className="hidden md:flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-white/90 hover:bg-white/10 hover:border-white/40 transition-colors"
        >
          <Trophy size={14} className="text-warning" />
          <span>Nhận chứng chỉ</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-white/90 hover:bg-white/10 hover:border-white/40 transition-colors"
          title="Sao chép liên kết"
        >
          <Share2 size={13} />
          <span className="hidden sm:inline">Chia sẻ</span>
        </button>

        <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/80">
          <MoreVertical size={16} />
        </button>
      </div>
    </header>
  )
}
