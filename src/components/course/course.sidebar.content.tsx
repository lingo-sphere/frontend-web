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
  Volume2,
  Mic,
  FileText,
} from 'lucide-react'
import type { Chapter, Lesson } from '@/types/course'
import { toast } from '@/store/toast-store'

interface CourseSidebarContentProps {
  chapters: Chapter[]
  currentLesson: Lesson | null
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
    post_mini_attempt_id?: string
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
  finalTestAudioUrl?: string
  finalTestSpeakingPrompt?: string
  finalTestSpeakingFileUrl?: string
  finalTestWritingPrompt?: string
  finalTestWritingFileUrl?: string
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
  finalTestAttempts = [],
  finalTestAudioUrl,
  finalTestSpeakingPrompt,
  finalTestSpeakingFileUrl,
  finalTestWritingPrompt,
  finalTestWritingFileUrl,
  onToggleChapter,
  onSelectLesson,
  onToggleLessonComplete,
  onTakeTest,
}: CourseSidebarContentProps) {
  const [activeResourceDropdown, setActiveResourceDropdown] = useState<string | null>(null)

  // Check if 100% of chapters have passed their challenge test before unlocking the Course Final Exam
  const allChaptersPassed =
    chapters.length > 0 &&
    chapters.every((ch, idx) => {
      const currentOrder = Number(ch.order || idx + 1)
      const modProg = modulesProgress?.find(
        (m) =>
          m.module_id === ch.id ||
          String(m.module_id) === String(ch.id) ||
          Number(m.order_index) === currentOrder ||
          Number(m.order_index) === idx + 1
      )
      const passScore = ch.challengeTest?.passingScore || (ch as any).challenge_passing_score || 80
      const chScore = Number(modProg?.challenge_score ?? modProg?.post_mini_score ?? 0)
      return Boolean(
        modProg?.is_passed_by_challenge ||
        modProg?.status === 'COMPLETED' ||
        modProg?.status === 'SKIPPED_BY_CHALLENGE' ||
        (Boolean(modProg?.challenge_taken) && chScore >= passScore)
      )
    })

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

        const chapterQuestions =
          (Array.isArray(chapter.challenge_questions) && chapter.challenge_questions.length > 0 ? chapter.challenge_questions : null) ||
          (Array.isArray(chapter.test_questions) && chapter.test_questions.length > 0 ? chapter.test_questions : null) ||
          (Array.isArray(chapter.post_mini_questions) && chapter.post_mini_questions.length > 0 ? chapter.post_mini_questions : null) ||
          []
        const questionsCount = chapterQuestions.length
        const passingScore = chapter.challengeTest?.passingScore || (chapter as any).challenge_passing_score || 80

        const challengeScore = Number(modProgress?.challenge_score ?? modProgress?.post_mini_score ?? 0)

        const isPassedChallenge = Boolean(
          modProgress?.is_passed_by_challenge ||
          modProgress?.status === 'COMPLETED' ||
          modProgress?.status === 'SKIPPED_BY_CHALLENGE' ||
          (Boolean(modProgress?.challenge_taken) && challengeScore >= passingScore)
        )

        const hasTakenChallenge = Boolean(
          modProgress?.challenge_taken ||
          (Array.isArray(modProgress?.attempts) && modProgress.attempts.length > 0) ||
          challengeScore > 0
        )

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
          prevModProgress?.status === 'COMPLETED' ||
          prevModProgress?.status === 'SKIPPED_BY_CHALLENGE' ||
          (Boolean(prevModProgress?.challenge_taken) && (prevModProgress?.challenge_score || 0) >= (prevChapter?.challengeTest?.passingScore || (prevChapter as any)?.challenge_passing_score || 80))
        )
        const isChapterLocked = lockedChapterIds
          ? lockedChapterIds.has(chapter.id)
          : (isEnrolled && chIdx > 0 && !prevPassedChallenge)

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
                  ) : isPassedChallenge ? (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-emerald-500" />
                      Đã hoàn thành ({challengeScore}%)
                    </span>
                  ) : hasTakenChallenge ? (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <RotateCcw size={10} className="text-amber-500" />
                      Chưa đạt ({challengeScore}%)
                    </span>
                  ) : (
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 flex items-center gap-1">
                      Đang học
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
                {/* 1. DANH SÁCH CÁC BÀI GIẢNG VIDEO TRONG CHƯƠNG */}
                <div className="space-y-1">
                  {chapter.lessons.map((lesson) => {
                    const isActive = currentLesson?.id === lesson.id
                    const isDone = lesson.status === 'completed'
                    const isResourceOpen = activeResourceDropdown === lesson.id

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => {
                          if (isChapterLocked) {
                            toast.warning(
                              `Chương này đang bị khóa! Bạn cần làm bài test thử thách của Chương ${prevChapter?.order || chIdx} (đạt tối thiểu ${prevChapter?.challengeTest?.passingScore || 80}%) để mở khóa nhé.`,
                              'Chương đang khóa'
                            )
                            return
                          }
                          onSelectLesson(chapter, lesson)
                        }}
                        className={`group flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${
                          isActive
                            ? 'border-primary/60 bg-primary/10 shadow-xs ring-1 ring-primary/20'
                            : 'border-border/60 bg-surface hover:bg-surface-hover/80 hover:border-border'
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

                {/* 2. CUỐI CHƯƠNG: BÀI TEST THỬ THÁCH (CHALLENGE TEST - ĐIỀU KIỆN MỞ KHÓA CHƯƠNG SAU) */}
                {questionsCount > 0 && (
                  <div
                    onClick={() => {
                      if (isChapterLocked) {
                        toast.warning(
                          `Chương này đang bị khóa! Bạn cần vượt qua bài test thử thách của Chương ${prevChapter?.order || chIdx} (đạt tối thiểu ${prevChapter?.challengeTest?.passingScore || 80}%) để mở khóa nhé.`,
                          'Chương đang khóa'
                        )
                        return
                      }
                      onTakeTest?.(chapter, 'challenge')
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                      isChapterLocked
                        ? 'border-amber-500/25 bg-amber-500/5 opacity-80'
                        : isPassedChallenge
                        ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-surface hover:border-emerald-500/70 shadow-xs'
                        : hasTakenChallenge
                        ? 'border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-surface hover:border-amber-500/60 shadow-xs'
                        : 'border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-surface hover:border-primary/60 hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                          isChapterLocked
                            ? 'bg-amber-500/80'
                            : isPassedChallenge
                            ? 'bg-emerald-600 shadow-emerald-600/30'
                            : hasTakenChallenge
                            ? 'bg-amber-500 shadow-amber-500/30'
                            : 'bg-primary shadow-primary/30'
                        }`}
                      >
                        {isChapterLocked ? (
                          <Lock size={14} />
                        ) : isPassedChallenge ? (
                          <CheckCircle2 size={16} />
                        ) : hasTakenChallenge ? (
                          <RotateCcw size={15} />
                        ) : isEnrolled ? (
                          <Trophy size={15} />
                        ) : (
                          <Lock size={14} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-xs font-bold transition-colors whitespace-nowrap ${
                              isPassedChallenge
                                ? 'text-emerald-700 dark:text-emerald-300'
                                : hasTakenChallenge
                                ? 'text-amber-700 dark:text-amber-300'
                                : 'text-text-primary group-hover:text-primary'
                            }`}
                          >
                            Bài test thử thách cuối chương
                          </span>
                          {isPassedChallenge ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                              <Crown size={10} className="text-amber-500 shrink-0" />
                              <span>Đạt {challengeScore}%</span>
                            </span>
                          ) : hasTakenChallenge ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-emerald-500/30 shrink-0">
                              <RotateCcw size={10} className="text-amber-500 shrink-0" />
                              <span>Chưa đạt ({challengeScore}%)</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 shrink-0">
                              Yêu cầu {passingScore}%
                            </span>
                          )}
                          {Boolean(chapter.test_audio_url || chapter.challenge_audio_url || chapter.audio_url) && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 shrink-0">
                              <Volume2 size={9} className="text-indigo-500" />
                              <span>Audio bài thi</span>
                            </span>
                          )}
                          {Boolean(chapter.test_speaking_prompt || (chapter as any).test_speaking_file_url) && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 shrink-0">
                              <Mic size={9} className="text-pink-500" />
                              <span>Speaking</span>
                            </span>
                          )}
                          {Boolean(chapter.test_writing_prompt || (chapter as any).test_writing_file_url) && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 shrink-0">
                              <FileText size={9} className="text-purple-500" />
                              <span>Writing</span>
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
                          {isChapterLocked
                            ? `Cần vượt qua bài test của Chương ${prevChapter?.order || chIdx} để mở khóa`
                            : isPassedChallenge
                            ? `👑 Kỷ lục: ${challengeScore}% • Đã hoàn thành thử thách & mở khóa chương tiếp theo`
                            : hasTakenChallenge
                            ? `Cần tối thiểu ${passingScore}% để mở khóa chương tiếp theo • Bấm để làm lại`
                            : `${questionsCount} câu hỏi • Vượt qua ${passingScore}% để mở khóa chương tiếp theo`}
                        </p>
                      </div>
                    </div>

                    {isChapterLocked ? (
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
                        <Lock size={11} /> Khóa
                      </span>
                    ) : isEnrolled ? (
                      isPassedChallenge ? (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-500/30 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-2xs">
                          <RotateCcw size={11} />
                          <span>Luyện lại</span>
                        </span>
                      ) : hasTakenChallenge ? (
                        <span className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
                          <RotateCcw size={11} />
                          <span>Làm lại ngay</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-[11px] shadow-xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1">
                          <Zap size={11} />
                          <span>Làm thử thách</span>
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

      {/* 3. BÀI THI TỐT NGHIỆP TOÀN KHÓA HỌC (EXIT EXAM / FINAL TEST) */}
      {finalTestQuestionsCount > 0 && (
        <div className="pt-2">
          <div
            onClick={() => {
              if (!allChaptersPassed) {
                toast.warning(
                  'Bạn cần hoàn thành và đạt bài kiểm tra thử thách của tất cả các chương trước khi làm bài thi tốt nghiệp!',
                  'Chưa đủ điều kiện'
                )
                return
              }
              onTakeTest?.(null, 'final-test')
            }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
              !allChaptersPassed
                ? 'border-amber-500/25 bg-amber-500/5 opacity-80'
                : finalTestScore !== undefined && finalTestScore > 0
                ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-surface hover:border-emerald-500/70 shadow-xs'
                : 'border-emerald-500/40 bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-surface hover:border-emerald-500/60 shadow-xs'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white shadow-xs ${
                  !allChaptersPassed
                    ? 'bg-amber-500/80'
                    : finalTestScore !== undefined && finalTestScore > 0
                    ? 'bg-emerald-600 shadow-emerald-600/30'
                    : 'bg-emerald-600 shadow-emerald-600/30'
                }`}
              >
                {!allChaptersPassed ? (
                  <Lock size={14} />
                ) : finalTestScore !== undefined && finalTestScore > 0 ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Trophy size={16} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-xs font-bold transition-colors whitespace-nowrap ${
                      finalTestScore !== undefined && finalTestScore > 0
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-text-primary group-hover:text-emerald-600'
                    }`}
                  >
                    Bài thi tốt nghiệp cuối khóa (Exit Test)
                  </span>
                  {!allChaptersPassed ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <Lock size={9} />
                      Khóa
                    </span>
                  ) : finalTestScore !== undefined && finalTestScore > 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                      <Crown size={10} className="text-amber-500 shrink-0" />
                      <span>Kỷ lục: {finalTestScore}%</span>
                    </span>
                  ) : null}
                  {Boolean(finalTestAudioUrl) && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 shrink-0">
                      <Volume2 size={9} className="text-indigo-500" />
                      <span>Audio đề thi</span>
                    </span>
                  )}
                  {Boolean(finalTestSpeakingPrompt || finalTestSpeakingFileUrl) && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300 border border-pink-200/60 shrink-0">
                      <Mic size={9} className="text-pink-500" />
                      <span>Speaking</span>
                    </span>
                  )}
                  {Boolean(finalTestWritingPrompt || finalTestWritingFileUrl) && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200/60 shrink-0">
                      <FileText size={9} className="text-purple-500" />
                      <span>Writing</span>
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-text-tertiary mt-0.5 truncate">
                  {!allChaptersPassed
                    ? 'Khóa • Cần vượt qua bài test thử thách của tất cả các chương để mở khóa'
                    : finalTestScore !== undefined && finalTestScore > 0
                    ? `👑 Kỷ lục cao nhất: ${finalTestScore}%${Array.isArray(finalTestAttempts) && finalTestAttempts.length > 0 ? ` • ${finalTestAttempts.length} lần thi` : ''} • Bấm để xem lịch sử & thi lại`
                    : `${finalTestQuestionsCount} câu • Đánh giá năng lực toàn khóa để cấp chứng chỉ`}
                </p>
              </div>
            </div>

            {isEnrolled ? (
              !allChaptersPassed ? (
                <span className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1 whitespace-nowrap shrink-0">
                  <Lock size={11} /> Khóa
                </span>
              ) : finalTestScore !== undefined && finalTestScore > 0 ? (
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
