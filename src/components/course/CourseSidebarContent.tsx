'use client'

/**
 * @file CourseSidebarContent.tsx
 * @description Component giao diện React CourseSidebarContent hiển thị danh sách bài học, bài tập và bài kiểm tra chương cho học viên
 */

import { useState } from 'react'
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  FolderDown,
  PlayCircle,
  FileCheck2,
  Trophy,
  HelpCircle,
  Sparkles,
  Lock,
} from 'lucide-react'
import type { Chapter, Lesson } from '@/types/course'
import { toast } from '@/store/toast-store'

interface CourseSidebarContentProps {
  chapters: Chapter[]
  currentLesson: Lesson
  expandedChapters: string[]
  isEnrolled?: boolean
  onToggleChapter: (chapterId: string) => void
  onSelectLesson: (chapter: Chapter, lesson: Lesson) => void
  onToggleLessonComplete: (lessonId: string, e: React.MouseEvent) => void
  onTakeTest?: (chapter: Chapter, testType: 'challenge' | 'exercise' | 'post-mini') => void
}

export function CourseSidebarContent({
  chapters,
  currentLesson,
  expandedChapters,
  isEnrolled = true,
  onToggleChapter,
  onSelectLesson,
  onToggleLessonComplete,
  onTakeTest,
}: CourseSidebarContentProps) {
  const [activeResourceDropdown, setActiveResourceDropdown] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-border">
      {chapters.map((chapter) => {
        const isExpanded = expandedChapters.includes(chapter.id)
        const chCompleted = chapter.lessons.filter((l) => l.status === 'completed').length
        const chTotal = chapter.lessons.length

        // Check if chapter has teacher-uploaded questions or tests
        const challengeQuestionsCount =
          Array.isArray(chapter.challenge_questions) && chapter.challenge_questions.length > 0
            ? chapter.challenge_questions.length
            : chapter.challengeTest?.questionsCount || 0

        const postMiniQuestionsCount =
          Array.isArray(chapter.post_mini_questions) && chapter.post_mini_questions.length > 0
            ? chapter.post_mini_questions.length
            : chapter.postMiniTest?.questionsCount || 0

        const testQuestionsCount =
          Array.isArray(chapter.test_questions) && chapter.test_questions.length > 0
            ? chapter.test_questions.length
            : chapter.exercise?.questionsCount || 0

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
                {/* 1. Challenge Test (Bài kiểm tra đầu chương) */}
                {challengeQuestionsCount > 0 && (
                  <div
                    onClick={() => onTakeTest?.(chapter, 'challenge')}
                    className="flex items-center justify-between p-3.5 pl-5 hover:bg-amber-500/10 transition-colors cursor-pointer group border-l-4 border-amber-500/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
                        {isEnrolled ? <Trophy size={14} /> : <Lock size={14} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text-primary group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          Bài kiểm tra thử thách (Challenge Test)
                        </div>
                        <div className="text-[10px] text-text-tertiary">
                          {challengeQuestionsCount} câu hỏi • Điểm đạt: 80%
                        </div>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded-md">
                        Làm bài
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock size={10} /> Khóa
                      </span>
                    )}
                  </div>
                )}

                {/* 2. Lessons List */}
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
                        onClick={(e) => {
                          if (!isEnrolled) {
                            e.stopPropagation()
                            toast.warning('Vui lòng mua khóa học để ghi nhận tiến độ bài học!')
                            return
                          }
                          onToggleLessonComplete(lesson.id, e)
                        }}
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer ${
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
                            {isEnrolled ? (
                              <PlayCircle size={12} className={isActive ? 'text-primary' : ''} />
                            ) : (
                              <Lock size={11} className="text-amber-500/80" />
                            )}
                            {Math.round(lesson.duration / 60)} phút
                          </span>

                          {lesson.resources && lesson.resources.length > 0 && (
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!isEnrolled) {
                                    toast.warning('Vui lòng mua khóa học để tải tài liệu bài học!', 'Yêu cầu mở khóa')
                                    return
                                  }
                                  setActiveResourceDropdown(
                                    isResourceOpen ? null : lesson.id
                                  )
                                }}
                                className="flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer"
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

                {/* 3. Practice Exercise (Bài thực hành trắc nghiệm) */}
                {testQuestionsCount > 0 && (
                  <div
                    onClick={() => onTakeTest?.(chapter, 'exercise')}
                    className="flex items-center justify-between p-3.5 pl-5 hover:bg-indigo-500/10 transition-colors cursor-pointer group border-l-4 border-indigo-500/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        {isEnrolled ? <HelpCircle size={14} /> : <Lock size={14} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          Bài tập trắc nghiệm thực hành
                        </div>
                        <div className="text-[10px] text-text-tertiary">
                          {testQuestionsCount} câu hỏi trắc nghiệm
                        </div>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-md">
                        Luyện tập
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock size={10} /> Khóa
                      </span>
                    )}
                  </div>
                )}

                {/* 4. Post-Mini Test (Bài kiểm tra cuối chương) */}
                {postMiniQuestionsCount > 0 && (
                  <div
                    onClick={() => onTakeTest?.(chapter, 'post-mini')}
                    className="flex items-center justify-between p-3.5 pl-5 hover:bg-emerald-500/10 transition-colors cursor-pointer group border-l-4 border-emerald-500/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        {isEnrolled ? <FileCheck2 size={14} /> : <Lock size={14} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-text-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          Bài kiểm tra cuối chương (Post-Mini Test)
                        </div>
                        <div className="text-[10px] text-text-tertiary">
                          {postMiniQuestionsCount} câu hỏi • Đánh giá hoàn thành chương
                        </div>
                      </div>
                    </div>
                    {isEnrolled ? (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles size={11} />
                        Kiểm tra
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-500/15 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock size={10} /> Khóa
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
