// Component hiển thị thẻ ghi chú bài giảng video trong khóa học của học viên.
'use client'

import Link from 'next/link'
import { GraduationCap, Clock, Play, Trash2, Calendar } from 'lucide-react'
import type { UserCourseNoteItem } from '@/features/courses/services/course.service'
import { buildCourseUrl } from '@/features/courses/lib/course.url'
import { Button } from '@/components/button'

interface CourseNoteItemCardProps {
  note: UserCourseNoteItem
  onDelete: (note: UserCourseNoteItem) => void
  isDeleting?: boolean
}

export function CourseNoteItemCard({ note, onDelete, isDeleting = false }: CourseNoteItemCardProps) {
  const baseCourseUrl = buildCourseUrl({
    _id: note.course_id,
    id: note.course_id,
    slug: note.course_slug,
    title: note.course_title,
  })
  const courseUrl = `${baseCourseUrl}?lesson=${note.lesson_id}&t=${note.timestamp}`

  const formattedDate = note.created_at
    ? new Date(note.created_at).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : ''

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-surface/90 p-4 sm:p-5 shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-200 group">
      <div>
        <div className="flex items-center justify-between gap-2 flex-wrap mb-2.5">
          <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary dark:text-emerald-400 max-w-[70%] truncate">
            <GraduationCap className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{note.course_title || 'Khóa học'}</span>
          </div>

          <Link
            href={courseUrl}
            title="Nhảy đến mốc thời gian này trên video bài giảng"
            className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
          >
            <Clock className="h-3 w-3 shrink-0" />
            <span>{note.formatted_time || '00:00'}</span>
          </Link>
        </div>

        <h3 className="text-sm font-bold text-text-primary line-clamp-1 mb-2 group-hover:text-primary transition-colors">
          {note.lesson_title || 'Bài học video'}
        </h3>

        <div className="rounded-xl border border-border/60 bg-surface-subtle/60 p-3 text-xs leading-relaxed text-text-secondary whitespace-pre-wrap break-words min-h-[56px]">
          {note.content}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-[11px] text-text-tertiary">
          <Calendar className="h-3 w-3 shrink-0" />
          <span>{formattedDate}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDelete(note)}
            disabled={isDeleting}
            className="h-8 w-8 p-0 text-text-tertiary hover:bg-destructive/10 hover:text-destructive rounded-lg cursor-pointer"
            title="Xóa ghi chú này"
            aria-label="Xóa ghi chú"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          <Link href={courseUrl}>
            <Button
              type="button"
              size="sm"
              className="h-8 px-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Play className="h-3 w-3 fill-current" />
              <span>Xem bài học</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
