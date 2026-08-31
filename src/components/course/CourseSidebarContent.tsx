'use client'

import { useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  FolderDown,
  PlayCircle,
} from 'lucide-react'
import type { Chapter, Lesson } from '@/types/course'

interface CourseSidebarContentProps {
  chapters: Chapter[]
  currentLesson: Lesson
  expandedChapters: string[]
  onToggleChapter: (chapterId: string) => void
  onSelectLesson: (chapter: Chapter, lesson: Lesson) => void
  onToggleLessonComplete: (lessonId: string, e: React.MouseEvent) => void
}

export function CourseSidebarContent({
  chapters,
  currentLesson,
  expandedChapters,
  onToggleChapter,
  onSelectLesson,
  onToggleLessonComplete,
}: CourseSidebarContentProps) {
  const [activeResourceDropdown, setActiveResourceDropdown] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-border">
      {chapters.map((chapter) => {
        const isExpanded = expandedChapters.includes(chapter.id)
        const chCompleted = chapter.lessons.filter((l) => l.status === 'completed').length
        const chTotal = chapter.lessons.length

        return (
          <div key={chapter.id} className="bg-surface">
            <button
              onClick={() => onToggleChapter(chapter.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-hover transition-colors group cursor-pointer"
            >
              <div className="space-y-1 flex-1 pr-3">
                <div className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
                  {chapter.title}
                </div>
                <div className="text-[11px] text-text-tertiary">
                  {chCompleted}/{chTotal} bài • ~{Math.round(chTotal * 8)} phút
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp size={16} className="text-text-tertiary shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-text-tertiary shrink-0" />
              )}
            </button>

            {isExpanded && (
              <div className="bg-surface-subtle/40 divide-y divide-border/60">
                {chapter.lessons.map((lesson) => {
                  const isActive = currentLesson.id === lesson.id
                  const isDone = lesson.status === 'completed'
                  const isResourceOpen = activeResourceDropdown === lesson.id

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => onSelectLesson(chapter, lesson)}
                      className={`flex items-start gap-3 p-3.5 pl-5 transition-all cursor-pointer ${
                        isActive
                          ? 'bg-primary-soft/60 border-l-4 border-primary text-primary'
                          : 'hover:bg-surface-hover text-text-primary'
                      }`}
                    >
                      <button
                        onClick={(e) => onToggleLessonComplete(lesson.id, e)}
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          isDone
                            ? 'bg-primary border-primary text-white'
                            : 'border-border bg-surface hover:border-primary'
                        }`}
                        title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                      >
                        {isDone && <Check size={11} strokeWidth={3} />}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div
                          className={`text-xs leading-snug font-medium ${
                            isActive ? 'font-bold text-primary' : 'text-text-primary'
                          }`}
                        >
                          {lesson.title}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                          <span className="flex items-center gap-1">
                            <PlayCircle size={12} className={isActive ? 'text-primary' : ''} />
                            {Math.round(lesson.duration / 60)} phút
                          </span>

                          {lesson.resources && lesson.resources.length > 0 && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setActiveResourceDropdown(
                                    isResourceOpen ? null : lesson.id
                                  )
                                }}
                                className="flex items-center gap-1 text-primary hover:underline font-semibold"
                              >
                                <FolderDown size={11} />
                                <span>Tài liệu ({lesson.resources.length})</span>
                              </button>

                              {isResourceOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute left-0 top-6 w-56 rounded-xl border border-border bg-surface p-2 shadow-2xl z-30 space-y-1.5 text-xs animate-in fade-in duration-150"
                                >
                                  <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary px-2 py-0.5">
                                    Tải tài liệu bài học:
                                  </div>
                                  {lesson.resources.map((res) => (
                                    <a
                                      key={res.id}
                                      href={res.url}
                                      download
                                      className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-surface-hover text-text-primary transition-colors"
                                    >
                                      <span className="truncate flex-1 text-[11px]">
                                        {res.title}
                                      </span>
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
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
