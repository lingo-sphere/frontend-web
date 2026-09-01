/**
 * @file CourseCurriculumList.tsx
 * @description Component giao diện React CourseCurriculumList cho học viên
 */

import { ChevronDown, ChevronRight, Lock, Check, Circle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { Chapter, Lesson } from '@/types/course'

interface ChapterAccordionProps {
  chapter: Chapter
  isExpanded: boolean
  onToggle: () => void
  onLessonClick: (lesson: Lesson) => void
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return <Check className="h-4 w-4 text-success" />
    case 'available':
    case 'in-progress':
      return <Circle className="h-4 w-4 text-primary" />
    default:
      return <Lock className="h-4 w-4 text-text-tertiary" />
  }
}

export function ChapterAccordion({
  chapter,
  isExpanded,
  onToggle,
  onLessonClick,
}: ChapterAccordionProps) {
  const completedLessons = chapter.lessons.filter((l) => l.status === 'completed').length

  return (
    <Card className={`dashboard-card overflow-hidden ${chapter.status === 'locked' ? 'opacity-60' : ''}`}>
      <button
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-surface-hover"
        onClick={onToggle}
        disabled={chapter.status === 'locked'}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              chapter.status === 'completed'
                ? 'bg-success/20'
                : chapter.status === 'in-progress'
                  ? 'bg-primary/20'
                  : 'bg-surface-subtle'
            }`}
          >
            <span
              className={`text-[16px] font-bold ${
                chapter.status === 'completed'
                  ? 'text-success'
                  : chapter.status === 'in-progress'
                    ? 'text-primary'
                    : 'text-text-tertiary'
              }`}
            >
              {chapter.order}
            </span>
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-text-primary">{chapter.title}</h3>
            <p className="text-[12px] text-text-secondary">
              {completedLessons}/{chapter.lessons.length} bài học
              {chapter.challengeTest?.status === 'completed' && ' • Đã qua bài thử thách'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusIcon status={chapter.status} />
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-text-tertiary" />
          ) : (
            <ChevronRight className="h-5 w-5 text-text-tertiary" />
          )}
        </div>
      </button>

      {isExpanded && chapter.status !== 'locked' && (
        <div className="border-t border-border bg-surface-subtle/50 p-4">
          {chapter.challengeTest && (
            <div
              className={`mb-3 flex items-center justify-between rounded-lg p-3 ${
                chapter.challengeTest.status === 'completed' ? 'bg-success-soft/50' : 'bg-surface'
              }`}
            >
              <div className="flex items-center gap-2">
                <StatusIcon status={chapter.challengeTest.status} />
                <span className="text-[13px] font-medium text-text-primary">
                  {chapter.challengeTest.title}
                </span>
              </div>
              <span className="text-[12px] text-text-secondary">
                {chapter.challengeTest.questionsCount} câu hỏi
              </span>
            </div>
          )}

          <div className="space-y-2">
            {chapter.lessons.map((lesson) => (
              <div key={lesson.id}>
                <button
                  className={`flex w-full items-center justify-between rounded-lg p-3 transition-colors ${
                    lesson.status === 'locked'
                      ? 'cursor-not-allowed opacity-60'
                      : 'hover:bg-surface cursor-pointer'
                  } ${
                    lesson.status === 'in-progress' || lesson.progress > 0
                      ? 'bg-primary-soft/30'
                      : 'bg-surface'
                  }`}
                  onClick={() => onLessonClick(lesson)}
                  disabled={lesson.status === 'locked'}
                >
                  <div className="flex items-center gap-3">
                    <StatusIcon status={lesson.status} />
                    <div className="text-left">
                      <span className="text-[13px] font-medium text-text-primary">
                        Bài {lesson.order}: {lesson.title}
                      </span>
                      {lesson.status === 'locked' && (
                        <p className="text-[11px] text-text-tertiary">
                          Hoàn thành ít nhất 80% bài trước để mở khóa
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.progress > 0 && lesson.progress < 100 && (
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${lesson.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-text-secondary">{lesson.progress}%</span>
                      </div>
                    )}
                    {lesson.status === 'completed' && (
                      <span className="text-[11px] text-success">✓</span>
                    )}
                  </div>
                </button>
              </div>
            ))}
          </div>

          {chapter.exercise && (
            <div
              className={`mt-4 flex items-center justify-between rounded-lg p-3 ${
                chapter.exercise.status === 'locked'
                  ? 'bg-surface opacity-60'
                  : chapter.exercise.status === 'completed'
                    ? 'bg-success-soft/50'
                    : 'bg-surface'
              }`}
            >
              <div className="flex items-center gap-2">
                <StatusIcon status={chapter.exercise.status} />
                <span className="text-[13px] font-medium text-text-primary">
                  {chapter.exercise.title}
                </span>
              </div>
              <span className="text-[12px] text-text-secondary">
                {chapter.exercise.questionsCount} câu hỏi
              </span>
            </div>
          )}

          {chapter.postMiniTest && (
            <div
              className={`mt-2 flex items-center justify-between rounded-lg p-3 ${
                chapter.postMiniTest.status === 'locked'
                  ? 'bg-surface opacity-60'
                  : chapter.postMiniTest.status === 'completed'
                    ? 'bg-success-soft/50'
                    : 'bg-surface'
              }`}
            >
              <div className="flex items-center gap-2">
                <StatusIcon status={chapter.postMiniTest.status} />
                <span className="text-[13px] font-medium text-text-primary">
                  {chapter.postMiniTest.title}
                </span>
              </div>
              <span className="text-[12px] text-text-secondary">
                {chapter.postMiniTest.questionsCount} câu hỏi
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

interface CourseCurriculumListProps {
  chapters: Chapter[]
  expandedChapter: string
  onToggleChapter: (chapterId: string) => void
  onLessonClick: (lesson: Lesson) => void
}

export function CourseCurriculumList({
  chapters,
  expandedChapter,
  onToggleChapter,
  onLessonClick,
}: CourseCurriculumListProps) {
  return (
    <div className="space-y-4">
      {chapters.map((chapter) => (
        <ChapterAccordion
          key={chapter.id}
          chapter={chapter}
          isExpanded={expandedChapter === chapter.id}
          onToggle={() => onToggleChapter(chapter.id)}
          onLessonClick={onLessonClick}
        />
      ))}
    </div>
  )
}
