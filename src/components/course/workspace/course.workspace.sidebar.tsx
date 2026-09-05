/**
 * @file course.workspace.sidebar.tsx
 * @description Thành phần Course Workspace Sidebar phục vụ phía người học (Web Client)
 */

'use client'

/**
 * @file course.workspace.sidebar.tsx
 * @description Thanh bên phải hiển thị danh sách các chương bài học và Trợ lý Gia sư AI.
 */

import { Sparkles, PanelRightClose, CheckCircle2 } from 'lucide-react'
import { CourseSidebarContent } from '@/components/course/course.sidebar.content'
import { CourseSidebarAiChat } from '@/components/course/course.sidebar.ai.chat'
import type { Chapter, Course, Lesson } from '@/types/course'

export type SidebarTab = 'content' | 'ai'

interface CourseWorkspaceSidebarProps {
  isOpen: boolean
  course: Course
  currentLesson: Lesson | null
  activeTab: SidebarTab
  expandedChapters: string[]
  isEnrolled: boolean
  lockedChapterIds: Set<string>
  progressDetail: any
  onTabChange: (tab: SidebarTab) => void
  onCloseSidebar: () => void
  onToggleChapter: (chapterId: string) => void
  onSelectLesson: (chapter: Chapter, lesson: Lesson) => void
  onToggleLessonComplete: (lessonId: string, e: React.MouseEvent) => void
  onTakeTest: (
    chapter: Chapter | null,
    testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
  ) => void
}

export function CourseWorkspaceSidebar({
  isOpen,
  course,
  currentLesson,
  activeTab,
  expandedChapters,
  isEnrolled,
  lockedChapterIds,
  progressDetail,
  onTabChange,
  onCloseSidebar,
  onToggleChapter,
  onSelectLesson,
  onToggleLessonComplete,
  onTakeTest,
}: CourseWorkspaceSidebarProps) {
  if (!isOpen) return null

  const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
  const completedLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.status === 'completed').length,
    0
  )
  const progressPercent = Math.round(
    (completedLessons / Math.max(totalLessons, 1)) * 100
  )

  return (
    <div className="w-full lg:w-[420px] xl:w-[440px] shrink-0 border-l border-border bg-surface flex flex-col max-h-[calc(100vh-3.5rem)] shadow-xl animate-in slide-in-from-right-4 duration-200">
      <div className="border-b border-border bg-surface-subtle/40 px-4 py-3 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-border/80 shadow-xs">
            <button
              onClick={() => onTabChange('content')}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer ${
                activeTab === 'content'
                  ? 'bg-primary text-white shadow-xs font-bold'
                  : 'text-text-secondary hover:text-text-primary font-medium'
              }`}
            >
              Nội dung khóa học
            </button>
            <button
              onClick={() => onTabChange('ai')}
              className={`rounded-lg px-3 py-1.5 text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai'
                  ? 'bg-purple-600 text-white shadow-xs font-bold'
                  : 'text-text-secondary hover:text-text-primary font-medium'
              }`}
            >
              <Sparkles size={13} />
              <span>Trợ lý AI</span>
            </button>
          </div>

          <button
            onClick={onCloseSidebar}
            className="p-1.5 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
            title="Đóng thanh bên"
          >
            <PanelRightClose size={16} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <span className="text-[11px] font-bold text-text-secondary">Tiến độ bài học</span>
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
            <CheckCircle2 size={12} />
            <span>
              {completedLessons}/{totalLessons} bài ({progressPercent}%)
            </span>
          </div>
        </div>
      </div>

      {activeTab === 'content' ? (
        <CourseSidebarContent
          chapters={course.chapters}
          currentLesson={currentLesson}
          expandedChapters={expandedChapters}
          isEnrolled={isEnrolled}
          lockedChapterIds={lockedChapterIds}
          modulesProgress={progressDetail?.modules_progress}
          finalTestQuestionsCount={course.final_test_questions?.length || 0}
          finalTestScore={progressDetail?.course_progress?.final_test_score}
          finalTestAttempts={(progressDetail?.course_progress as any)?.final_test_attempts}
          finalTestAudioUrl={course.final_test_audio_url}
          finalTestSpeakingPrompt={(course as any).final_test_speaking_prompt}
          finalTestSpeakingFileUrl={(course as any).final_test_speaking_file_url}
          finalTestWritingPrompt={(course as any).final_test_writing_prompt}
          finalTestWritingFileUrl={(course as any).final_test_writing_file_url}
          onToggleChapter={onToggleChapter}
          onSelectLesson={onSelectLesson}
          onToggleLessonComplete={onToggleLessonComplete}
          onTakeTest={onTakeTest}
        />
      ) : (
        <CourseSidebarAiChat currentLessonTitle={currentLesson?.title || ''} />
      )}
    </div>
  )
}
