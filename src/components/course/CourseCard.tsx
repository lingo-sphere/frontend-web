'use client'

import { useTranslation } from 'react-i18next'
import {
  Play,
  MoreVertical,
  Heart,
  Share2,
  ListPlus,
  Archive,
  Star,
  CheckCircle2,
} from 'lucide-react'
import type { CourseCardData } from '@/types/course'

interface CourseCardProps {
  course: CourseCardData
  isFavorite: boolean
  isMenuOpen: boolean
  onToggleMenu: (courseId: string, e: React.MouseEvent) => void
  onToggleWishlist: (courseId: string, e: React.MouseEvent) => void
  onClick: (courseId: string) => void
  onCloseMenu: () => void
}

export function CourseCard({
  course,
  isFavorite,
  isMenuOpen,
  onToggleMenu,
  onToggleWishlist,
  onClick,
  onCloseMenu,
}: CourseCardProps) {
  const { i18n } = useTranslation()
  const isVi = i18n.language === 'vi'

  return (
    <div
      onClick={() => onClick(course.id)}
      className="group relative flex flex-col justify-between rounded-none border border-border bg-surface overflow-hidden shadow-sm transition-shadow duration-200 hover:shadow-md cursor-pointer"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black/5">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover"
        />

        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2d2f31] shadow-xl">
            <Play size={20} className="ml-1 fill-[#2d2f31]" />
          </div>
        </div>

        {course.badge && (
          <span className="absolute left-2 top-2 rounded-none bg-[#eceb98] px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#3d3c0a] shadow-sm">
            {course.badge}
          </span>
        )}

        <div className="absolute right-2 top-2 z-10">
          <button
            onClick={(e) => onToggleMenu(course.id, e)}
            className="flex h-7 w-7 items-center justify-center rounded-none bg-black/70 text-white backdrop-blur-sm hover:bg-black transition-colors"
            title={isVi ? 'Tùy chọn' : 'Options'}
          >
            <MoreVertical size={14} />
          </button>

          {isMenuOpen && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-8 w-44 rounded-none border border-border bg-surface p-1.5 shadow-xl z-20 space-y-1 text-xs text-text-primary animate-in fade-in duration-150"
            >
              <button
                onClick={(e) => onToggleWishlist(course.id, e)}
                className="flex w-full items-center gap-2 rounded-none px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left"
              >
                <Heart size={13} className={isFavorite ? 'text-red-500 fill-red-500' : ''} />
                <span>
                  {isFavorite
                    ? isVi
                      ? 'Bỏ yêu thích'
                      : 'Remove from wishlist'
                    : isVi
                    ? 'Thêm yêu thích'
                    : 'Add to wishlist'}
                </span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    window.location.origin + `/course/${course.id}`
                  )
                  onCloseMenu()
                }}
                className="flex w-full items-center gap-2 rounded-none px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left"
              >
                <Share2 size={13} />
                <span>{isVi ? 'Chia sẻ khóa học' : 'Share course'}</span>
              </button>
              <button
                onClick={onCloseMenu}
                className="flex w-full items-center gap-2 rounded-none px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left"
              >
                <ListPlus size={13} />
                <span>{isVi ? 'Tạo danh sách mới' : 'Add to list'}</span>
              </button>
              <button
                onClick={onCloseMenu}
                className="flex w-full items-center gap-2 rounded-none px-2.5 py-1.5 hover:bg-surface-hover transition-colors text-left text-text-tertiary"
              >
                <Archive size={13} />
                <span>{isVi ? 'Lưu trữ' : 'Archive'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4 space-y-2">
        <h3 className="line-clamp-2 text-sm font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
          {course.title}
        </h3>
        <div className="text-xs text-text-tertiary line-clamp-1">
          {course.instructor}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text-secondary pt-1">
          <span className="font-extrabold text-warning">{course.rating.toFixed(1)}</span>
          <div className="flex items-center text-warning">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={11} fill="currentColor" />
            ))}
          </div>
          <span className="text-[11px] text-text-tertiary">
            ({course.ratingCount.toLocaleString('en-US')})
          </span>
        </div>
      </div>

      <div className="border-t border-border/60 p-4 pt-3 space-y-2 bg-surface-subtle/20">
        {course.progress === 100 ? (
          <div>
            <div className="h-1.5 w-full rounded-none bg-primary/20 overflow-hidden mb-1.5">
              <div className="h-full w-full bg-primary rounded-none" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
              <span className="text-primary font-bold flex items-center gap-1">
                <CheckCircle2 size={12} />
                {isVi ? '100% hoàn thành' : '100% completed'}
              </span>
              <span className="text-text-tertiary hover:text-primary transition-colors font-semibold">
                {isVi ? 'Đánh giá ★' : 'Review ★'}
              </span>
            </div>
          </div>
        ) : (course.progress ?? 0) > 0 ? (
          <div>
            <div className="h-1.5 w-full rounded-none bg-surface-subtle overflow-hidden mb-1.5">
              <div
                className="h-full bg-primary rounded-none transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-text-secondary font-medium">
              <span>{course.progress}% {isVi ? 'hoàn thành' : 'completed'}</span>
              <span className="text-primary font-bold">{isVi ? 'Học tiếp →' : 'Continue →'}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs font-bold text-primary pt-0.5">
            <span className="uppercase tracking-wider text-[11px]">
              {isVi ? 'Bắt đầu khóa học' : 'Start Course'}
            </span>
            <span>→</span>
          </div>
        )}
      </div>
    </div>
  )
}
