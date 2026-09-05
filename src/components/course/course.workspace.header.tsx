/**
 * @file course.workspace.header.tsx
 * @description Thành phần Course Workspace Header phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file CourseWorkspaceHeader.tsx
 * @description Header cho khu vực học tập bài giảng của học viên
 */

import { ArrowLeft, Share2, Star, PanelRightClose, PanelRightOpen } from 'lucide-react'

interface CourseWorkspaceHeaderProps {
  courseTitle: string
  onBack: () => void
  onOpenRating: () => void
  isSidebarOpen?: boolean
  onToggleSidebar?: () => void
}

export function CourseWorkspaceHeader({
  courseTitle,
  onBack,
  onOpenRating,
  isSidebarOpen = true,
  onToggleSidebar,
}: CourseWorkspaceHeaderProps) {
  const handleShareFacebook = () => {
    if (typeof window !== 'undefined') {
      const url = window.location.href
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      window.open(shareUrl, '_blank', 'width=600,height=500,location=no,toolbar=no')
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

      <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs font-semibold">
        
        <button
          onClick={onOpenRating}
          className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-white/90 hover:bg-white/10 hover:border-white/40 transition-colors cursor-pointer"
          title="Đánh giá khóa học từ 1-5 sao"
        >
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span>Đánh giá</span>
        </button>

        
        <button
          onClick={handleShareFacebook}
          className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-white/90 hover:bg-white/10 hover:border-white/40 transition-colors cursor-pointer"
          title="Chia sẻ lên Facebook"
        >
          <Share2 size={13} />
          <span>Chia sẻ</span>
        </button>

        
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-colors cursor-pointer ${
              isSidebarOpen
                ? 'border-primary bg-primary/20 text-white'
                : 'border-white/20 text-white/90 hover:bg-white/10 hover:border-white/40'
            }`}
            title={isSidebarOpen ? 'Đóng thanh bài học bên phải' : 'Mở thanh bài học bên phải'}
          >
            {isSidebarOpen ? <PanelRightClose size={15} /> : <PanelRightOpen size={15} />}
            <span className="hidden sm:inline">
              {isSidebarOpen ? 'Đóng mục lục' : 'Mục lục bài học'}
            </span>
          </button>
        )}
      </div>
    </header>
  )
}
