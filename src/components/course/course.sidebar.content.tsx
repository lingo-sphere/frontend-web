'use client'

/**
 * @file course.sidebar.content.tsx
 * @description Thanh danh sách các chương học, bài giảng và đề thi đánh giá trong giao diện học tập khóa học
 */

import { useState } from 'react'
import type { Chapter, Lesson } from '@/types/course'
import { CourseSidebarChapterItem } from './sidebar/course.sidebar.chapter.item'
import { CourseSidebarFinalExamCard } from './sidebar/course.sidebar.final.exam.card'

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
  onTakeTest?: (
    chapter: Chapter | null,
    testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
  ) => void
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
      const passScore =
        ch.challengeTest?.passingScore || (ch as any).challenge_passing_score || 80
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
        const currentOrder = Number(chapter.order || chIdx + 1)
        const modProgress = modulesProgress?.find(
          (m) =>
            m.module_id === chapter.id ||
            String(m.module_id) === String(chapter.id) ||
            Number(m.order_index) === currentOrder ||
            Number(m.order_index) === chIdx + 1
        )

        const chapterQuestions =
          (Array.isArray(chapter.challenge_questions) &&
          chapter.challenge_questions.length > 0
            ? chapter.challenge_questions
            : null) ||
          (Array.isArray(chapter.test_questions) && chapter.test_questions.length > 0
            ? chapter.test_questions
            : null) ||
          (Array.isArray(chapter.post_mini_questions) &&
          chapter.post_mini_questions.length > 0
            ? chapter.post_mini_questions
            : null) ||
          []
        const questionsCount = chapterQuestions.length
        const passingScore =
          chapter.challengeTest?.passingScore ||
          (chapter as any).challenge_passing_score ||
          80

        const challengeScore = Number(
          modProgress?.challenge_score ?? modProgress?.post_mini_score ?? 0
        )

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
            (Boolean(prevModProgress?.challenge_taken) &&
              (prevModProgress?.challenge_score || 0) >=
                (prevChapter?.challengeTest?.passingScore ||
                  (prevChapter as any)?.challenge_passing_score ||
                  80))
        )
        const isChapterLocked = lockedChapterIds
          ? lockedChapterIds.has(chapter.id)
          : isEnrolled && chIdx > 0 && !prevPassedChallenge

        return (
          <CourseSidebarChapterItem
            key={chapter.id}
            chapter={chapter}
            chIdx={chIdx}
            isExpanded={isExpanded}
            isEnrolled={isEnrolled}
            isChapterLocked={isChapterLocked}
            isPassedChallenge={isPassedChallenge}
            hasTakenChallenge={hasTakenChallenge}
            challengeScore={challengeScore}
            passingScore={passingScore}
            questionsCount={questionsCount}
            currentLesson={currentLesson}
            activeResourceDropdown={activeResourceDropdown}
            prevChapter={prevChapter}
            onToggleChapter={() => onToggleChapter(chapter.id)}
            onSelectLesson={(les) => onSelectLesson(chapter, les)}
            onToggleLessonComplete={onToggleLessonComplete}
            onToggleResource={(lesId) =>
              setActiveResourceDropdown(activeResourceDropdown === lesId ? null : lesId)
            }
            onTakeTest={() => onTakeTest?.(chapter, 'challenge')}
          />
        )
      })}

      <CourseSidebarFinalExamCard
        finalTestQuestionsCount={finalTestQuestionsCount}
        finalTestScore={finalTestScore}
        finalTestAttempts={finalTestAttempts}
        finalTestAudioUrl={finalTestAudioUrl}
        finalTestSpeakingPrompt={finalTestSpeakingPrompt}
        finalTestSpeakingFileUrl={finalTestSpeakingFileUrl}
        finalTestWritingPrompt={finalTestWritingPrompt}
        finalTestWritingFileUrl={finalTestWritingFileUrl}
        allChaptersPassed={allChaptersPassed}
        isEnrolled={isEnrolled}
        onTakeTest={() => onTakeTest?.(null, 'final-test')}
      />
    </div>
  )
}
