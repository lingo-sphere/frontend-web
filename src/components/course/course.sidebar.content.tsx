'use client'

/**
 * @file CourseSidebarContent.tsx
 * @description Component thanh bên hiển thị danh sách bài giảng và bài kiểm tra chương:
 * Mỗi chương có 1 bộ câu hỏi kiểm tra:
 * - Đầu chương: Thử thách vượt cấp (Challenge Test) - Chỉ được làm 1 lần duy nhất để qua chương.
 * - Cuối chương: Bài kiểm tra đánh giá (Post-Mini Test) - Được làm lại nhiều lần cho đến khi đạt.
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
  Sparkles,
  Lock,
  CheckCircle2,
  Award,
  Zap,
  RotateCcw,
  Crown,
  History,
} from 'lucide-react'
import type { Chapter, Lesson } from '@/types/course'
import { toast } from '@/store/toast-store'

interface CourseSidebarContentProps {
  chapters: Chapter[]
  currentLesson: Lesson
  expandedChapters: string[]
  isEnrolled?: boolean
  lockedChapterIds?: Set<string>
  modulesProgress?: Array<{
    module_id: string
    order_index?: number
    status: string
    challenge_score?: number
    challenge_taken?: boolean
    is_passed_by_challenge?: boolean
    post_mini_score?: number
    attempts?: Array<{
      attempt_id: string
      test_type?: string
      score: number
      is_passed: boolean
      correct_count?: number
      total_questions?: number
      submitted_at?: any
    }>
  }>
  finalTestQuestionsCount?: number
  finalTestScore?: number
  finalTestAttempts?: any[]
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
  lockedChapterIds,
  modulesProgress,
  finalTestQuestionsCount = 0,
  finalTestScore,
  finalTestAttempts,
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

        const currentOrder = Number(chapter.order || chIdx + 1)
        const modProgress = modulesProgress?.find(
          (m) =>
            m.module_id === chapter.id ||
            String(m.module_id) === String(chapter.id) ||
            Number(m.order_index) === currentOrder ||
            Number(m.order_index) === chIdx + 1
        )

        const isPassedByChallenge = Boolean(
          modProgress?.is_passed_by_challenge ||
          modProgress?.status === 'SKIPPED_BY_CHALLENGE' ||
          chapter.status === 'completed' && (modProgress?.challenge_score || 0) >= (chapter.challengeTest?.passingScore || 80)
        )

        const isChallengeTaken = Boolean(
          modProgress?.challenge_taken ||
          isPassedByChallenge ||
          (modProgress?.challenge_score !== undefined && modProgress.challenge_score >= 0)
        )

        const postMiniScore = Number(modProgress?.post_mini_score ?? 0)
        const isPostMiniTaken = Boolean(
          (modProgress?.post_mini_score !== undefined && modProgress.post_mini_score !== null) ||
          modProgress?.status === 'COMPLETED' ||
          (chapter.status === 'completed' && !isPassedByChallenge)
        )
        const isPassedByPostMini = isPostMiniTaken || postMiniScore >= 70
        const isChapterCompleted = isPassedByChallenge || isPassedByPostMini || (chTotal > 0 && chCompleted === chTotal)

        const prevChapter = chIdx > 0 ? chapters[chIdx - 1] : null
        const prevOrder = Number(prevChapter?.order || chIdx)
        const prevModProgress = prevChapter
          ? modulesProgress?.find(
              (m) =>
                m.module_id === prevChapter.id ||
                String(m.module_id) === String(prevChapter.id) ||
                Number(m.order_index) === prevOrder ||
                Number(m.order_index) === chIdx
            )
          : null
        const prevPassedChallenge = Boolean(
          prevModProgress?.is_passed_by_challenge ||
          prevModProgress?.status === 'SKIPPED_BY_CHALLENGE' ||
          prevModProgress?.challenge_taken ||
          (prevModProgress?.challenge_score !== undefined && prevModProgress.challenge_score > 0) ||
          (prevModProgress?.challenge_score || 0) >= (prevChapter?.challengeTest?.passingScore || 80)
        )
        const prevPassedPostMini = Boolean(
          prevChapter?.status === 'completed' ||
          prevModProgress?.status === 'COMPLETED' ||
          (prevModProgress?.post_mini_score !== undefined) ||
          (prevModProgress?.post_mini_score || 0) > 0
        )
        const isChapterLocked = lockedChapterIds
          ? lockedChapterIds.has(chapter.id)
          : (isEnrolled && chIdx > 0 && !prevPassedChallenge && !prevPassedPostMini)

        const chapterQuestions =
          (Array.isArray(chapter.test_questions) && chapter.test_questions.length > 0 ? chapter.test_questions : null) ||
          (Array.isArray(chapter.post_mini_questions) && chapter.post_mini_questions.length > 0 ? chapter.post_mini_questions : null) ||
          (Array.isArray(chapter.challenge_questions) && chapter.challenge_questions.length > 0 ? chapter.challenge_questions : null) ||
          []
        const questionsCount = chapterQuestions.length
        const passingScore = chapter.challengeTest?.passingScore || 80

        return (
          <div key={chapter.id} className="bg-surface">
            <button
              onClick={() => onToggleChapter(chapter.id)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-subtle/70 transition-colors group cursor-pointer"
            >
              <div className="space-y-1.5 flex-1 pr-3 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                    Chương {chapter.order || chIdx + 1}
                  </span>

                  {isChapterLocked ? (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <Lock size={10} />
                      Đang khóa
                    </span>
                  ) : isPassedByChallenge ? (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      Đã vượt cấp ({modProgress?.challenge_score || 80}%)
                    </span>
                  ) : isPostMiniTaken ? (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <Crown size={10} className="text-amber-500 shrink-0" />
                      Kỷ lục: {postMiniScore}%
                    </span>
                  ) : isChapterCompleted ? (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      Đã hoàn thành
                    </span>
                  ) : null}
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
                {/* 1. ĐẦU CHƯƠNG: BÀI KIỂM TRA THỬ THÁCH (CHALLENGE TEST - LÀM 1 LẦN) */}
                {questionsCount > 0 && (
                  <>
                    {isPassedByChallenge ? (
                      <div className="p-3 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-surface flex items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-xs">
                            <CheckCircle2 size={16} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-emerald-900 dark:text-emerald-200">
                                Thử thách đầu chương
                              </span>
                              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 size={10} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Đã vượt cấp ({modProgress?.challenge_score || 80}%)</span>
                              </span>
                            </div>
                            <p className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                              ✓ Bạn đã làm và hoàn thành thử thách • Đã mở khóa chương sau
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : isChallengeTaken ? (
                      <div
                        onClick={() => onTakeTest?.(chapter, 'challenge')}
                        className="p-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 transition-colors cursor-pointer flex items-center justify-between gap-2.5 group"
                        title="Bấm để xem lại kết quả & lịch sử thi thử thách"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <Crown size={14} className="text-amber-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[11px] font-bold text-text-primary group-hover:text-amber-600 transition-colors">
                                Thử thách đầu chương
                              </span>
                              <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                                <Crown size={9} className="text-amber-500" />
                                <span>Kỷ lục: {modProgress?.challenge_score || 0}%</span>
                              </span>
                            </div>
                            <p className="text-[10px] text-text-tertiary mt-0.5">
                              ✓ Đã thử sức • Điểm đạt: {modProgress?.challenge_score || 0}% • Bấm để xem lịch sử
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded-lg bg-amber-500/10 shrink-0">
                          Xem lại
                        </span>
                      </div>
                    ) : (
                      /* Chưa làm Challenge Test -> Cho phép thử sức duy nhất 1 lần để qua chương */
                      <div
                        onClick={() => {
                          if (isChapterLocked) {
                            toast.warning(
                              `Chương này đang bị khóa! Bạn cần làm xong bài kiểm tra cuối chương hoặc vượt qua bài thử thách của Chương ${prevChapter?.order || chIdx} để mở khóa nhé.`,
                              'Chương đang khóa'
                            )
                            return
                          }
                          onTakeTest?.(chapter, 'challenge')
                        }}
                        className="p-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-surface hover:border-amber-500/60 hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs shadow-amber-500/20">
                            {isChapterLocked ? <Lock size={14} /> : isEnrolled ? <Trophy size={15} /> : <Lock size={14} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-text-primary group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors whitespace-nowrap">
                                Thử thách đầu chương
                              </span>
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                                Vượt cấp 1 lần
                              </span>
                            </div>
                            <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
                              {questionsCount} câu • Đạt {passingScore}% để qua thẳng chương
                            </p>
                          </div>
                        </div>

                        {isChapterLocked ? (
                          <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
                            <Lock size={11} /> Khóa
                          </span>
                        ) : isEnrolled ? (
                          <span className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
                            <Zap size={11} />
                            <span>Làm bài</span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-500/15 text-slate-400 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
                            <Lock size={11} /> Khóa
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* 2. GIỮA CHƯƠNG: DANH SÁCH CÁC BÀI GIẢNG VIDEO */}
                <div className="space-y-1">
                  {chapter.lessons.map((lesson) => {
                    const isActive = currentLesson.id === lesson.id
                    const isDone = lesson.status === 'completed'
                    const isResourceOpen = activeResourceDropdown === lesson.id

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (isChapterLocked) {
                            toast.warning(
                              `Chương này đang bị khóa! Bạn cần làm xong bài kiểm tra cuối chương hoặc vượt qua bài thử thách của Chương ${prevChapter?.order || chIdx} để mở khóa nhé.`,
                              'Chương đang khóa'
                            )
                            return
                          }
                          onSelectLesson(chapter, lesson)
                        }}
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
                            if (isChapterLocked) {
                              e.stopPropagation()
                              toast.warning('Chương này đang bị khóa!')
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
                          <div className="flex items-start justify-between gap-1.5">
                            <div
                              className={`text-xs leading-snug line-clamp-2 ${
                                isActive ? 'font-bold text-primary' : 'font-medium text-text-primary'
                              }`}
                            >
                              {lesson.title}
                            </div>
                            {!isEnrolled && Boolean(lesson.is_free_preview || lesson.is_preview) && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold shrink-0 shadow-xs">
                                <Sparkles size={9} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Học thử</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                            <span className="flex items-center gap-1 shrink-0">
                              {isChapterLocked ? (
                                <Lock size={11} className="text-amber-500/80" />
                              ) : isEnrolled || Boolean(lesson.is_free_preview || lesson.is_preview) ? (
                                <PlayCircle size={12} className={isActive ? 'text-primary' : Boolean(lesson.is_free_preview || lesson.is_preview) && !isEnrolled ? 'text-emerald-600 dark:text-emerald-400' : ''} />
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

                {/* 3. CUỐI CHƯƠNG: BÀI KIỂM TRA CUỐI CHƯƠNG (POST-MINI TEST - ĐƯỢC LÀM NHIỀU LẦN) */}
                {questionsCount > 0 && (
                  <div
                    onClick={() => {
                      if (isChapterLocked) {
                        toast.warning(
                          `Chương này đang bị khóa! Bạn cần làm xong bài kiểm tra cuối chương hoặc vượt qua bài thử thách của Chương ${prevChapter?.order || chIdx} để mở khóa nhé.`,
                          'Chương đang khóa'
                        )
                        return
                      }
                      onTakeTest?.(chapter, 'post-mini')
                    }}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                      isPostMiniTaken
                        ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-surface hover:border-emerald-500/70 shadow-xs'
                        : 'border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-surface hover:border-emerald-500/60 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                          isPostMiniTaken
                            ? 'bg-emerald-600 shadow-emerald-600/30'
                            : 'bg-emerald-500 shadow-emerald-500/20'
                        }`}
                      >
                        {isChapterLocked ? (
                          <Lock size={14} />
                        ) : isPostMiniTaken ? (
                          <CheckCircle2 size={16} />
                        ) : isEnrolled ? (
                          <FileCheck2 size={15} />
                        ) : (
                          <Lock size={14} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold text-text-primary group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                            Bài kiểm tra cuối chương
                          </span>
                          {isPostMiniTaken ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                              <Crown size={10} className="text-amber-500 shrink-0" />
                              <span>Kỷ lục: {postMiniScore}%</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                              Chưa làm
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
                          {isPostMiniTaken
                            ? `👑 Kỷ lục cao nhất: ${postMiniScore}%${Array.isArray(modProgress?.attempts) && modProgress.attempts.filter((a) => a.test_type !== 'challenge').length > 0 ? ` • ${modProgress.attempts.filter((a) => a.test_type !== 'challenge').length} lần làm` : ''} • Bấm để xem lịch sử & làm lại`
                            : `${questionsCount} câu hỏi • Làm xong để mở khóa chương tiếp theo`}
                        </p>
                      </div>
                    </div>

                    {isChapterLocked ? (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Lock size={11} /> Khóa
                      </span>
                    ) : isEnrolled ? (
                      isPostMiniTaken ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/30 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-2xs">
                          <RotateCcw size={11} />
                          <span>Làm lại</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
                          <Sparkles size={11} />
                          <span>Bắt đầu làm</span>
                        </span>
                      )
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

      {finalTestQuestionsCount > 0 && (
        <div className="p-3.5 bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent border-t border-emerald-500/20">
          <div
            onClick={() => onTakeTest?.(null, 'final-test')}
            className={`p-3.5 rounded-2xl bg-surface border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
              finalTestScore !== undefined && finalTestScore > 0
                ? 'border-emerald-500/60 shadow-xs'
                : 'border-emerald-500/40 hover:border-emerald-500 hover:shadow-md'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20">
                {finalTestScore !== undefined && finalTestScore > 0 ? <CheckCircle2 size={18} /> : <Award size={18} />}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs font-black text-text-primary group-hover:text-emerald-600 transition-colors truncate">
                    Final Test tốt nghiệp
                  </h4>
                  {finalTestScore !== undefined && finalTestScore > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                      <Crown size={10} className="text-amber-500 shrink-0" />
                      <span>Kỷ lục: {finalTestScore}%</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
                  {finalTestScore !== undefined && finalTestScore > 0
                    ? `👑 Kỷ lục cao nhất: ${finalTestScore}%${Array.isArray(finalTestAttempts) && finalTestAttempts.length > 0 ? ` • ${finalTestAttempts.length} lần thi` : ''} • Bấm để xem lịch sử & thi lại`
                    : `${finalTestQuestionsCount} câu • Đánh giá năng lực toàn khóa`}
                </p>
              </div>
            </div>

            {isEnrolled ? (
              finalTestScore !== undefined && finalTestScore > 0 ? (
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-500/30 transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
                  <RotateCcw size={12} />
                  <span>Thi lại</span>
                </span>
              ) : (
                <span className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm shadow-emerald-600/20 transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
                  <Trophy size={12} />
                  <span>Bắt đầu làm</span>
                </span>
              )
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
