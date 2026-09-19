// Thành phần hiển thị accordion từng chương học trong thanh danh sách bài học.

import { CheckCircle2, ChevronDown, ChevronUp, Lock, RotateCcw } from 'lucide-react'
import type { Chapter, Lesson } from '@/features/courses/types/course'
import { toast } from '@/store/toast.store'
import { CourseSidebarLessonRow } from '@/features/courses/components/course.sidebar.lesson.row'
import { CourseSidebarChallengeTestCard } from '@/features/courses/components/course.sidebar.challenge.test.card'

interface CourseSidebarChapterItemProps {
  chapter: Chapter
  chIdx: number
  isExpanded: boolean
  isEnrolled: boolean
  isChapterLocked: boolean
  isLockedByReminder?: boolean
  violationCount?: number
  isPassedChallenge: boolean
  hasTakenChallenge: boolean
  challengeScore: number
  passingScore: number
  questionsCount: number
  currentLesson: Lesson | null
  activeResourceDropdown: string | null
  prevChapter: Chapter | null
  onToggleChapter: () => void
  onSelectLesson: (lesson: Lesson) => void
  onToggleLessonComplete: (lessonId: string, e: React.MouseEvent) => void
  onToggleResource: (lessonId: string, e: React.MouseEvent) => void
  onTakeTest?: () => void
  onOpenPracticeQuiz?: (lesson: Lesson) => void
}

export function CourseSidebarChapterItem({
  chapter,
  chIdx,
  isExpanded,
  isEnrolled,
  isChapterLocked,
  isLockedByReminder = false,
  violationCount = 0,
  isPassedChallenge,
  hasTakenChallenge,
  challengeScore,
  passingScore,
  questionsCount,
  currentLesson,
  activeResourceDropdown,
  prevChapter,
  onToggleChapter,
  onSelectLesson,
  onToggleLessonComplete,
  onToggleResource,
  onTakeTest,
  onOpenPracticeQuiz,
}: CourseSidebarChapterItemProps) {
  const chCompleted = chapter.lessons.filter((l) => l.status === 'completed').length
  const chTotal = chapter.lessons.length

  return (
    <div
      className={`transition-all border-b border-border/70 ${
        isChapterLocked || isLockedByReminder ? 'bg-slate-100/80 dark:bg-slate-900/60' : 'bg-surface'
      }`}
    >
      <button
        type="button"
        onClick={onToggleChapter}
        className={`flex w-full items-center justify-between p-4 text-left transition-colors group cursor-pointer ${
          isChapterLocked || isLockedByReminder
            ? 'bg-slate-100/90 dark:bg-slate-900/70 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 border-l-4 border-l-amber-500/70'
            : 'hover:bg-surface-subtle/70'
        }`}
      >
        <div className="space-y-1.5 flex-1 pr-3 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                isChapterLocked || isLockedByReminder
                  ? 'bg-slate-200/90 dark:bg-slate-800 text-text-tertiary'
                  : 'text-primary bg-primary/10'
              }`}
            >
              Chương {chapter.order || chIdx + 1}
            </span>

            {isLockedByReminder ? (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <Lock size={10} className="text-rose-600" />
                Khóa do vắng ({violationCount || 5}/5)
              </span>
            ) : isChapterLocked ? (
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
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

          <div
            className={`text-xs font-bold leading-snug line-clamp-1 transition-colors ${
              isChapterLocked || isLockedByReminder
                ? 'text-text-secondary'
                : 'text-text-primary group-hover:text-primary'
            }`}
          >
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

      {isExpanded && (
        <div
          className={`border-t border-border/60 ${
            isChapterLocked || isLockedByReminder ? 'bg-slate-100/50 dark:bg-slate-900/40' : 'bg-surface-subtle/30'
          }`}
        >
          <div className="divide-y divide-border/40">
            {chapter.lessons.map((lesson) => (
              <CourseSidebarLessonRow
                key={lesson.id}
                lesson={lesson}
                isActive={currentLesson?.id === lesson.id}
                isEnrolled={isEnrolled}
                isChapterLocked={isChapterLocked}
                isResourceOpen={activeResourceDropdown === lesson.id}
                onSelect={() => {
                  if (isLockedByReminder) {
                    toast.error(
                      'Chương này đang bị khóa do bạn đã vắng mặt 5 lần nhắc học. Vui lòng thi lại bài kiểm tra của chương trước để mở khóa!',
                      'Chương bị khóa'
                    )
                    return
                  }
                  if (isChapterLocked) {
                    toast.warning(
                      `Chương này đang bị khóa! Bạn cần làm bài test thử thách của Chương ${prevChapter?.order || chIdx} (đạt tối thiểu ${prevChapter?.challengeTest?.passingScore || 80}%) để mở khóa nhé.`,
                      'Chương đang khóa'
                    )
                    return
                  }
                  onSelectLesson(lesson)
                }}
                onToggleComplete={(e) => {
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
                onToggleResource={(e) => {
                  e.stopPropagation()
                  if (!isEnrolled) {
                    toast.warning('Vui lòng mua khóa học để tải tài liệu!', 'Yêu cầu mở khóa')
                    return
                  }
                  onToggleResource(lesson.id, e)
                }}
                onOpenPracticeQuiz={() => onOpenPracticeQuiz?.(lesson)}
              />
            ))}
          </div>

          <CourseSidebarChallengeTestCard
            chapter={chapter}
            chIdx={chIdx}
            questionsCount={questionsCount}
            passingScore={passingScore}
            challengeScore={challengeScore}
            isPassedChallenge={isPassedChallenge}
            hasTakenChallenge={hasTakenChallenge}
            isChapterLocked={isChapterLocked}
            isEnrolled={isEnrolled}
            prevChapterOrder={prevChapter?.order || chIdx}
            onTakeTest={() => {
              if (isChapterLocked) {
                toast.warning(
                  `Chương này đang bị khóa! Bạn cần vượt qua bài test thử thách của Chương ${prevChapter?.order || chIdx} (đạt tối thiểu ${prevChapter?.challengeTest?.passingScore || 80}%) để mở khóa nhé.`,
                  'Chương đang khóa'
                )
                return
              }
              onTakeTest?.()
            }}
          />
        </div>
      )}
    </div>
  )
}
