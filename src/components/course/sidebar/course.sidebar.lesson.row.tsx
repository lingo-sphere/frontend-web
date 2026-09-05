/**
 * @file course.sidebar.lesson.row.tsx
 * @description Thành phần hiển thị một bài học trong thanh danh sách bài giảng bên cạnh
 */

import { Check, Download, FolderDown, Lock, PlayCircle } from 'lucide-react'
import type { Lesson } from '@/types/course'
import { toast } from '@/store/toast.store'

interface CourseSidebarLessonRowProps {
  lesson: Lesson
  isActive: boolean
  isEnrolled: boolean
  isChapterLocked: boolean
  isResourceOpen: boolean
  onSelect: () => void
  onToggleComplete: (e: React.MouseEvent) => void
  onToggleResource: (e: React.MouseEvent) => void
}

export function CourseSidebarLessonRow({
  lesson,
  isActive,
  isEnrolled,
  isChapterLocked,
  isResourceOpen,
  onSelect,
  onToggleComplete,
  onToggleResource,
}: CourseSidebarLessonRowProps) {
  const isDone = lesson.status === 'completed'

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
        isActive
          ? 'border-primary/60 bg-primary/10 shadow-xs ring-1 ring-primary/20'
          : 'border-border/60 bg-surface hover:bg-surface-hover/80 hover:border-border'
      }`}
    >
      <button
        type="button"
        onClick={onToggleComplete}
        disabled={isChapterLocked}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
          isDone
            ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs'
            : 'border-border/80 bg-surface hover:border-primary/60'
        }`}
        title={isDone ? 'Đã hoàn thành bài học' : 'Đánh dấu đã học xong'}
      >
        {isDone && <Check size={13} className="stroke-[3]" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs font-bold leading-snug line-clamp-1 transition-colors ${
              isActive ? 'text-primary font-extrabold' : 'text-text-primary group-hover:text-primary'
            }`}
          >
            {lesson.order || 1}. {lesson.title}
          </span>

          {Boolean(lesson.is_free_preview || lesson.is_preview) && !isEnrolled && (
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 shrink-0">
              Học thử miễn phí
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
          <span className="flex items-center gap-1 shrink-0">
            {isChapterLocked ? (
              <Lock size={11} className="text-amber-500/80" />
            ) : isEnrolled || Boolean(lesson.is_free_preview || lesson.is_preview) ? (
              <PlayCircle
                size={12}
                className={
                  isActive
                    ? 'text-primary'
                    : Boolean(lesson.is_free_preview || lesson.is_preview) && !isEnrolled
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : ''
                }
              />
            ) : (
              <Lock size={11} className="text-amber-500/80" />
            )}
            {Math.round(lesson.duration / 60)} phút
          </span>

          {lesson.resources && lesson.resources.length > 0 && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={onToggleResource}
                className="flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer text-[10px]"
              >
                <FolderDown size={11} />
                <span>Tài liệu ({lesson.resources.length})</span>
              </button>

              {isResourceOpen && isEnrolled && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 top-6 w-56 rounded-xl border border-border bg-surface p-2 shadow-2xl z-30 space-y-1.5 text-xs animate-in fade-in duration-150"
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary px-2 py-0.5">
                    Tài liệu bài học:
                  </div>
                  {lesson.resources.map((res) => (
                    <a
                      key={res.id}
                      href={res.url}
                      download
                      className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-surface-hover text-text-primary transition-colors"
                    >
                      <span className="truncate flex-1 text-[11px]">{res.title}</span>
                      <Download size={12} className="text-primary shrink-0" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
