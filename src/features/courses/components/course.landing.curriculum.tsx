// Component danh sach chuong va bai giang kem tinh nang xem truoc bai hoc mau mien phi.
'use client'

import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  PlayCircle,
  FileText,
  Lock,
  Clock,
  Eye,
} from 'lucide-react'
import type { Chapter, Lesson } from '@/features/courses/types/course'
import { toast } from '@/store/toast.store'
import { useLanguage } from '@/hooks/use.language'

interface CourseLandingCurriculumProps {
  chapters: Chapter[]
  totalLessons: number
  totalDuration: string
  onOpenPreviewLesson: (lesson: Lesson) => void
}

function formatDurationSeconds(sec?: number): string {
  if (!sec || sec <= 0) return '5:00'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

export function CourseLandingCurriculum({
  chapters,
  totalLessons,
  totalDuration,
  onOpenPreviewLesson,
}: CourseLandingCurriculumProps) {
  const { isVietnamese } = useLanguage()
  const [expandedChapterIds, setExpandedChapterIds] = useState<string[]>(() => {
    return chapters.length > 0 ? [chapters[0].id] : []
  })

  const isAllExpanded = expandedChapterIds.length === chapters.length

  const handleToggleAll = () => {
    if (isAllExpanded) {
      setExpandedChapterIds([])
    } else {
      setExpandedChapterIds(chapters.map((c) => c.id))
    }
  }

  const handleToggleChapter = (chapterId: string) => {
    setExpandedChapterIds((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    )
  }

  const handleLockedLessonClick = () => {
    toast.info(
      isVietnamese
        ? 'Bài học này đang bị khóa. Hãy đăng ký hoặc mua khóa học để mở khóa toàn bộ bài học!'
        : 'This lesson is locked. Please purchase or enroll in the course to unlock full content!',
      isVietnamese ? 'Bài học khóa' : 'Locked lesson'
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
          <span>{chapters.length} phần</span> • <span>{totalLessons} bài giảng</span> •{' '}
          <span>{totalDuration} tổng thời lượng</span>
        </div>

        <button
          type="button"
          onClick={handleToggleAll}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer self-start sm:self-auto"
        >
          {isAllExpanded ? 'Thu gọn tất cả các phần' : 'Mở rộng tất cả các phần'}
        </button>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-200 dark:divide-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
        {chapters.map((chapter, idx) => {
          const isExpanded = expandedChapterIds.includes(chapter.id)
          const lessons = chapter.lessons || []
          const chapterDurationSec = lessons.reduce(
            (acc, l) => acc + (typeof l.duration === 'number' ? l.duration : 300),
            0
          )
          const chapterDurationText = formatDurationSeconds(chapterDurationSec)

          return (
            <div key={chapter.id || idx} className="transition-colors">
              <button
                type="button"
                onClick={() => handleToggleChapter(chapter.id)}
                className="w-full p-4 flex items-center justify-between gap-3 text-left hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-slate-400 shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                    Phần {idx + 1}: {chapter.title}
                  </span>
                </div>

                <div className="text-right text-xs text-slate-400 shrink-0 whitespace-nowrap">
                  <span>{lessons.length} bài giảng</span> • <span>{chapterDurationText}</span>
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                  {lessons.map((lesson, lIdx) => {
                    const isPreviewable = Boolean(
                      lesson.is_free_preview || lesson.is_preview
                    )
                    const durationText = formatDurationSeconds(
                      typeof lesson.duration === 'number' ? lesson.duration : undefined
                    )

                    return (
                      <div
                        key={lesson.id || lIdx}
                        onClick={!isPreviewable ? handleLockedLessonClick : undefined}
                        className={`p-3.5 pl-6 sm:pl-10 flex items-center justify-between gap-3 transition-colors ${
                          !isPreviewable
                            ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer'
                            : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {lesson.type === 'reading' ? (
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-indigo-500 shrink-0" />
                          )}
                          <span className="text-xs text-slate-700 dark:text-slate-200 truncate font-medium">
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {isPreviewable ? (
                            <button
                              type="button"
                              onClick={() => onOpenPreviewLesson(lesson)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Xem trước</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleLockedLessonClick}
                              className="text-slate-300 dark:text-slate-600 hover:text-amber-500 dark:hover:text-amber-400 transition-colors cursor-pointer p-0.5"
                              title={isVietnamese ? 'Bài học đang bị khóa' : 'Locked lesson'}
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <span className="text-[11px] text-slate-400 font-mono">
                            {durationText}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
