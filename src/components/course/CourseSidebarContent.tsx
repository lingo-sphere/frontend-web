'use client'

/**
 * @file CourseSidebarContent.tsx
 * @description Component thanh bên hiển thị danh sách chương, bài học, Challenge Test,
 * Post-mini Test và Final Test với giao diện thẻ hiện đại, chống rớt chữ, bố cục thoáng đãng.
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
  CheckCircle2,
  Award,
  Zap,
} from 'lucide-react'
import type { Chapter, Lesson } from '@/types/course'
import { toast } from '@/store/toast-store'

interface CourseSidebarContentProps {
  chapters: Chapter[]
  currentLesson: Lesson
  expandedChapters: string[]
  isEnrolled?: boolean
  finalTestQuestionsCount?: number
  onToggleChapter: (chapterId: string) => void
  onSelectLesson: (chapter: Chapter, lesson: Lesson) => void
  onToggleLessonComplete: (lessonId: string, e: React.MouseEvent) => void
  onTakeTest?: (chapter: Chapter | null, testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test') => void
}

export function CourseSidebarContent({
  chapters,
  currentLesson,
  expandedChapters,
  isEnrolled = true,
  finalTestQuestionsCount = 0,
  onToggleChapter,
  onSelectLesson,
  onToggleLessonComplete,
  onTakeTest,
}: CourseSidebarContentProps) {
  const [activeResourceDropdown, setActiveResourceDropdown] = useState<string | null>(null)

  return (
    <div className="flex-1 overflow-y-auto divide-y divide-border/60">
      {chapters.map((chapter, chIdx) => {
        const isExpanded = expandedChapters.includes(chapter.id)
        const chCompleted = chapter.lessons.filter((l) => l.status === 'completed').length
        const chTotal = chapter.lessons.length
        const isChapterCompleted = chapter.status === 'completed' || (chTotal > 0 && chCompleted === chTotal)

        // Check teacher-uploaded questions or tests
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
            {/* Chapter Header Button */}
            <button
              onClick={() => onToggleChapter(chapter.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-subtle/70 transition-colors group cursor-pointer"
            >
              <div className="space-y-1.5 flex-1 pr-3 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    Chương {chapter.order || chIdx + 1}
                  </span>
                  {isChapterCompleted && (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      Đã xong
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors leading-snug line-clamp-1">
                  {chapter.title}
                </div>

                <div className="text-[11px] text-text-tertiary font-medium">
                  {chCompleted}/{chTotal} bài • ~{Math.round(chTotal * 8)} phút
                </div>
              </div>

              <div className="p-1 rounded-lg text-text-tertiary group-hover:text-text-primary group-hover:bg-surface transition-colors shrink-0">
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </button>

            {/* Chapter Collapsible Body */}
            {isExpanded && (
              <div className="bg-surface-subtle/30 p-2.5 space-y-2">
                {/* 1. Challenge Test Card */}
                {challengeQuestionsCount > 0 && (
                  <div
                    onClick={() => onTakeTest?.(chapter, 'challenge')}
                    className="p-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-surface hover:border-amber-500/60 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs shadow-amber-500/20">
                        {isEnrolled ? <Trophy size={15} /> : <Lock size={14} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-text-primary group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors whitespace-nowrap">
                            Challenge Test
                          </span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                            Vượt cấp
                          </span>
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
                          {challengeQuestionsCount} câu • Điểm đạt: {chapter.challengeTest?.passingScore || 80}%
                        </p>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <span className="px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
                        <Zap size={11} />
                        Làm bài
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-500/15 text-slate-400 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Lock size={11} /> Khóa
                      </span>
                    )}
                  </div>
                )}

                {/* 2. Lessons List */}
                <div className="space-y-1">
                  {chapter.lessons.map((lesson) => {
                    const isActive = currentLesson.id === lesson.id
                    const isDone = lesson.status === 'completed'
                    const isResourceOpen = activeResourceDropdown === lesson.id

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => onSelectLesson(chapter, lesson)}
                        className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-start gap-2.5 ${
                          isActive
                            ? 'bg-primary/10 border border-primary/30 text-primary shadow-xs'
                            : 'hover:bg-surface text-text-primary border border-transparent'
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
                          className={`mt-0.5 flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border transition-all cursor-pointer ${
                            isDone
                              ? 'bg-primary border-primary text-white shadow-xs'
                              : 'border-border/80 bg-surface hover:border-primary'
                          }`}
                          title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                        >
                          {isDone && <Check size={11} strokeWidth={3} />}
                        </button>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div
                            className={`text-xs leading-snug line-clamp-2 ${
                              isActive ? 'font-bold text-primary' : 'font-medium text-text-primary'
                            }`}
                          >
                            {lesson.title}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                            <span className="flex items-center gap-1 shrink-0">
                              {isEnrolled ? (
                                <PlayCircle size={12} className={isActive ? 'text-primary' : ''} />
                              ) : (
                                <Lock size={11} className="text-amber-500/80" />
                              )}
                              {Math.round(lesson.duration / 60)} phút
                            </span>

                            {lesson.resources && lesson.resources.length > 0 && (
                              <div className="relative shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    if (!isEnrolled) {
                                      toast.warning('Vui lòng mua khóa học để tải tài liệu!', 'Yêu cầu mở khóa')
                                      return
                                    }
                                    setActiveResourceDropdown(isResourceOpen ? null : lesson.id)
                                  }}
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
                  })}
                </div>

                {/* 3. Practice Exercise Card */}
                {testQuestionsCount > 0 && (
                  <div
                    onClick={() => onTakeTest?.(chapter, 'exercise')}
                    className="p-3 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-surface hover:border-indigo-500/60 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-xs shadow-indigo-500/20">
                        {isEnrolled ? <HelpCircle size={15} /> : <Lock size={14} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-text-primary group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate block">
                          Luyện tập trắc nghiệm
                        </span>
                        <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
                          {testQuestionsCount} câu thực hành
                        </p>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <span className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-xs transition-all whitespace-nowrap shrink-0">
                        Luyện tập
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-500/15 text-slate-400 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Lock size={11} /> Khóa
                      </span>
                    )}
                  </div>
                )}

                {/* 4. Post-Mini Test Card */}
                {postMiniQuestionsCount > 0 && (
                  <div
                    onClick={() => onTakeTest?.(chapter, 'post-mini')}
                    className="p-3 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-surface hover:border-emerald-500/60 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs shadow-emerald-500/20">
                        {isEnrolled ? <FileCheck2 size={15} /> : <Lock size={14} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-text-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                            Post-Mini Test
                          </span>
                          <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shrink-0">
                            Cuối chương
                          </span>
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
                          {postMiniQuestionsCount} câu • Đánh giá hoàn thành
                        </p>
                      </div>
                    </div>

                    {isEnrolled ? (
                      <span className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
                        <Sparkles size={11} />
                        <span>Kiểm tra</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-xl bg-slate-500/15 text-slate-400 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Lock size={11} /> Khóa
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {/* 5. Final Test (Bài thi tốt nghiệp cuối khóa) */}
      {finalTestQuestionsCount > 0 && (
        <div className="p-3.5 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-t border-emerald-500/20">
          <div
            onClick={() => onTakeTest?.(null, 'final-test')}
            className="p-3.5 rounded-2xl bg-surface border border-emerald-500/40 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                <Award size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-black text-text-primary group-hover:text-emerald-600 transition-colors truncate">
                    Final Test tốt nghiệp
                  </h4>
                </div>
                <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
                  {finalTestQuestionsCount} câu • Đánh giá năng lực toàn khóa
                </p>
              </div>
            </div>

            {isEnrolled ? (
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
                <Trophy size={12} />
                <span>Làm bài</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-xl bg-slate-500/15 text-slate-400 font-bold text-xs flex items-center gap-1 whitespace-nowrap shrink-0">
                <Lock size={11} /> Khóa
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
