// Quản lý điều hướng chương, chọn bài học và kiểm tra trạng thái khóa bài trong khóa học.

import { useState, useMemo, useCallback } from 'react'
import type { Course, Chapter, Lesson } from '@/features/courses/types/course'
import type { CourseProgressDetailInfo } from '@/features/courses/types/course'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { toast } from '@/store/toast.store'

interface UseCourseLessonNavigationProps {
  course: Course | null
  courseId: string
  progressDetail: CourseProgressDetailInfo | null
  lockedChapterIdSet: Set<string>
}

export function useCourseLessonNavigation({
  course,
  courseId,
  progressDetail,
  lockedChapterIdSet,
}: UseCourseLessonNavigationProps) {
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [expandedChapters, setExpandedChapters] = useState<string[]>([])

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
    )
  }

  const syncLessonToStorageAndUrl = useCallback(
    (lessonId: string) => {
      storage.set(STORAGE_KEYS.COURSE_LAST_WATCHED(courseId), lessonId)
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        if (url.searchParams.get('lesson') !== lessonId) {
          url.searchParams.set('lesson', lessonId)
          window.history.replaceState(null, '', url.toString())
        }
      }
    },
    [courseId]
  )

  const handleSelectLesson = (chapter: Chapter, lesson: Lesson) => {
    const lockState = progressDetail?.course_progress?.lock_state
    const currentOrder = Number(chapter.order || 1)
    const isLockedByReminder = Boolean(
      lockState?.is_locked &&
        (lockState.locked_module_id === chapter.id || lockState.locked_chapter_order === currentOrder)
    )
    if (isLockedByReminder) {
      const retestOrder = lockState?.retest_chapter_order || (currentOrder - 1)
      toast.error(
        `Chương này đang bị khóa do vắng học 5 lần nhắc nhở liên tiếp. Vui lòng thi lại bài kiểm tra Chương ${retestOrder} để mở khóa!`,
        'Chương bị khóa'
      )
      return
    }
    if (lockedChapterIdSet.has(chapter.id)) {
      toast.warning(
        'Chương này đang bị khóa! Bạn cần hoàn thành và vượt qua bài test thử thách của chương trước để mở khóa nhé.',
        'Chương đang khóa'
      )
      return
    }
    setCurrentChapter(chapter)
    setCurrentLesson(lesson)
    syncLessonToStorageAndUrl(lesson.id)
  }

  const allFlatLessons = useMemo(() => {
    if (!course?.chapters) return []
    const list: Array<{ chapter: Chapter; lesson: Lesson }> = []
    course.chapters.forEach((ch) => {
      ch.lessons.forEach((les) => {
        list.push({ chapter: ch, lesson: les })
      })
    })
    return list
  }, [course])

  const currentLessonIndex = useMemo(() => {
    if (!currentLesson) return -1
    return allFlatLessons.findIndex((item) => item.lesson.id === currentLesson.id)
  }, [allFlatLessons, currentLesson])

  const hasNextLesson =
    currentLessonIndex >= 0 &&
    currentLessonIndex < allFlatLessons.length - 1 &&
    (!allFlatLessons[currentLessonIndex + 1] ||
      !lockedChapterIdSet.has(allFlatLessons[currentLessonIndex + 1].chapter.id))
  const hasPrevLesson = currentLessonIndex > 0

  const handleNextLesson = useCallback(() => {
    if (hasNextLesson) {
      const nextItem = allFlatLessons[currentLessonIndex + 1]
      if (lockedChapterIdSet.has(nextItem.chapter.id)) {
        toast.warning(
          'Chương tiếp theo đang bị khóa! Bạn cần hoàn thành và vượt qua bài test thử thách của chương trước để mở khóa.',
          'Chương đang khóa'
        )
        return
      }
      setCurrentChapter(nextItem.chapter)
      setCurrentLesson(nextItem.lesson)
      syncLessonToStorageAndUrl(nextItem.lesson.id)
      if (!expandedChapters.includes(nextItem.chapter.id)) {
        setExpandedChapters((prev) => [...prev, nextItem.chapter.id])
      }
    }
  }, [hasNextLesson, allFlatLessons, currentLessonIndex, expandedChapters, lockedChapterIdSet, syncLessonToStorageAndUrl])

  const handlePrevLesson = useCallback(() => {
    if (hasPrevLesson) {
      const prevItem = allFlatLessons[currentLessonIndex - 1]
      setCurrentChapter(prevItem.chapter)
      setCurrentLesson(prevItem.lesson)
      syncLessonToStorageAndUrl(prevItem.lesson.id)
      if (!expandedChapters.includes(prevItem.chapter.id)) {
        setExpandedChapters((prev) => [...prev, prevItem.chapter.id])
      }
    }
  }, [hasPrevLesson, allFlatLessons, currentLessonIndex, expandedChapters, syncLessonToStorageAndUrl])

  return {
    currentChapter,
    setCurrentChapter,
    currentLesson,
    setCurrentLesson,
    expandedChapters,
    setExpandedChapters,
    toggleChapter,
    hasNextLesson,
    hasPrevLesson,
    handleSelectLesson,
    handleNextLesson,
    handlePrevLesson,
  }
}
