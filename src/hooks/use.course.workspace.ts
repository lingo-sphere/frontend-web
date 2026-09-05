/**
 * @file use.course.workspace.ts
 * @description Custom hook coordinating the course workspace state, lesson navigation, and progress tracking
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { courseService } from '@/services/course.service'
import { useAuthStore } from '@/store/auth.store'
import { useEnrollmentStore } from '@/store/enrollment.store'
import { useCartStore } from '@/store/cart.store'
import { toast } from '@/store/toast.store'
import type { Course, Chapter, Lesson } from '@/types/course'
import { useCourseNotes } from '@/hooks/use.course.notes'
import { useCourseQnA } from '@/hooks/use.course.qna'
import { useCourseReviews } from '@/hooks/use.course.reviews'
import { useCourseTests } from '@/hooks/use.course.tests'
import type { BottomTab } from '@/components/course/workspace/course.workspace.tabs'
import type { SidebarTab } from '@/components/course/workspace/course.workspace.sidebar'
import {
  mapCourseDataToWorkspace,
  formatExactDuration,
} from '@/components/course/workspace/course.workspace.adapter'

export function useCourseWorkspace(courseId: string) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const addToCart = useCartStore((s) => s.addToCart)
  const isInCart = useCartStore((s) => s.isInCart)

  const [course, setCourse] = useState<Course | null>(null)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [expandedChapters, setExpandedChapters] = useState<string[]>([])
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('overview')
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('content')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0)

  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCourseCheckoutModal, setShowCourseCheckoutModal] = useState(false)
  const [showPlacementPromptModal, setShowPlacementPromptModal] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [progressDetail, setProgressDetail] = useState<any>(null)

  useEffect(() => {
    let isMounted = true
    async function fetchCourse() {
      if (!courseId) return
      setIsLoading(true)
      try {
        const fetchedCourse = await courseService.getCourseById(courseId)
        if (!fetchedCourse) {
          if (isMounted) setIsLoading(false)
          return
        }

        const courseObj = (fetchedCourse || {}) as any

        const [enrollmentRes, progressRes] = await Promise.all([
          courseService
            .getEnrollmentStatus(courseId)
            .then((r) => ({ enrolled: Boolean(r?.is_enrolled) }))
            .catch(() => ({ enrolled: false })),
          courseService.getCourseProgressDetail(courseId).catch(() => null),
        ])

        const userIsEnrolled = Boolean(enrollmentRes?.enrolled)
        if (isMounted) {
          setIsEnrolled(userIsEnrolled)
          if (userIsEnrolled) {
            useEnrollmentStore.getState().addEnrolledCourse(courseId)
          }
          if (progressRes) {
            setProgressDetail(progressRes)
          }
        }

        const [reviewsRes, notesRes, qnaRes] = await Promise.all([
          courseService.getCourseReviews(courseId).catch(() => null),
          userIsEnrolled && isAuthenticated
            ? courseService.getCourseNotes(courseId).catch(() => [])
            : Promise.resolve([]),
          courseService.getCourseQnA(courseId).catch(() => []),
        ])

        const structuredCourse = mapCourseDataToWorkspace(
          courseId,
          courseObj,
          userIsEnrolled,
          progressRes,
          reviewsRes,
          notesRes,
          qnaRes
        )

        const initialChapter = structuredCourse.chapters[0] || null
        const initialLesson = structuredCourse.chapters[0]?.lessons[0] || null

        if (isMounted) {
          setCourse(structuredCourse)
          setCurrentChapter(initialChapter)
          setCurrentLesson(initialLesson)
          setExpandedChapters(structuredCourse.chapters.map((ch) => ch.id))
        }
      } catch {
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchCourse()
    return () => {
      isMounted = false
    }
  }, [courseId, isAuthenticated])

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId) ? prev.filter((id) => id !== chapterId) : [...prev, chapterId]
    )
  }

  const lockedChapterIdSet = useMemo(() => {
    const set = new Set<string>()
    if (!course?.chapters || !isEnrolled) return set

    for (let i = 1; i < course.chapters.length; i++) {
      const prevCh = course.chapters[i - 1]
      const prevMod = progressDetail?.modules_progress?.find(
        (m: any) => m.module_id === prevCh.id || m.order_index === (prevCh.order || i)
      )
      const prevPassingScore =
        prevCh.challengeTest?.passingScore || (prevCh as any)?.challenge_passing_score || 80
      const prevScore = Number(prevMod?.challenge_score ?? prevMod?.post_mini_score ?? 0)
      const passedChallenge = Boolean(
        prevMod?.is_passed_by_challenge ||
          prevMod?.status === 'COMPLETED' ||
          prevMod?.status === 'SKIPPED_BY_CHALLENGE' ||
          (Boolean(prevMod?.challenge_taken) && prevScore >= prevPassingScore)
      )
      if (!passedChallenge) {
        set.add(course.chapters[i].id)
      }
    }
    return set
  }, [course?.chapters, isEnrolled, progressDetail?.modules_progress])

  const handleSelectLesson = (chapter: Chapter, lesson: Lesson) => {
    if (lockedChapterIdSet.has(chapter.id)) {
      toast.warning(
        'Chương này đang bị khóa! Bạn cần hoàn thành và vượt qua bài test thử thách của chương trước để mở khóa nhé.',
        'Chương đang khóa'
      )
      return
    }
    setCurrentChapter(chapter)
    setCurrentLesson(lesson)
    try {
      localStorage.setItem(`course_last_watched_${courseId}`, lesson.id)
    } catch {}
  }

  const handleToggleLessonComplete = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!course) return

    if (!isEnrolled) {
      toast.warning(
        'Bạn đang trong chế độ học thử. Hãy đăng ký khóa học để lưu tiến độ hoàn thành bài học nhé!',
        'Chế độ học thử'
      )
      return
    }

    let targetStatus: Lesson['status'] = 'completed'
    let chapterId = currentChapter?.id || ''

    const nextChapters = course.chapters.map((ch) => ({
      ...ch,
      lessons: ch.lessons.map((l) => {
        if (l.id === lessonId) {
          targetStatus = l.status === 'completed' ? 'available' : 'completed'
          if (!chapterId) chapterId = ch.id
          return {
            ...l,
            status: targetStatus,
            progress: targetStatus === 'completed' ? 100 : 0,
          }
        }
        return l
      }),
    }))

    setCourse({ ...course, chapters: nextChapters })

    const curChapId = chapterId || course.chapters[0]?.id || ''
    const isNowCompleted = targetStatus === 'completed'

    courseService
      .completeLesson({
        course_id: String(course.id),
        module_id: curChapId,
        lesson_id: lessonId,
        is_completed: isNowCompleted,
        score: isNowCompleted ? 100 : 0,
      })
      .catch(() => {})

    if (isNowCompleted) {
      toast.success('Đã lưu tiến độ hoàn thành bài học vào hệ thống!', 'Hoàn thành bài học')
    } else {
      toast.info('Đã hủy hoàn thành bài học', 'Cập nhật tiến độ')
    }
  }

  const handleLessonProgress = (lessonId: string, progress: number) => {
    if (!course || !isEnrolled) return
    let justCompleted = false
    let chapterId = currentChapter?.id || ''
    const isNowCompleted = progress >= 80 || progress >= 100

    const nextChapters = course.chapters.map((ch) => ({
      ...ch,
      lessons: ch.lessons.map((l) => {
        if (l.id === lessonId) {
          if (!chapterId) chapterId = ch.id
          if (isNowCompleted && l.status !== 'completed') {
            justCompleted = true
          }
          return {
            ...l,
            progress: isNowCompleted ? 100 : progress,
            status: isNowCompleted ? 'completed' : progress > 0 ? 'in-progress' : l.status,
          }
        }
        return l
      }),
    }))

    setCourse({ ...course, chapters: nextChapters })

    if (justCompleted) {
      const curChapId = chapterId || course.chapters[0]?.id || ''
      courseService
        .completeLesson({
          course_id: String(course.id),
          module_id: curChapId,
          lesson_id: lessonId,
          score: 100,
          time_spent_seconds: Math.round(playerCurrentTime),
        })
        .catch(() => {})
    }
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
  }, [course?.chapters])

  const currentLessonIndex = useMemo(() => {
    if (!currentLesson) return -1
    return allFlatLessons.findIndex((item) => item.lesson.id === currentLesson.id)
  }, [allFlatLessons, currentLesson?.id])

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
      if (!expandedChapters.includes(nextItem.chapter.id)) {
        setExpandedChapters((prev) => [...prev, nextItem.chapter.id])
      }
    }
  }, [hasNextLesson, allFlatLessons, currentLessonIndex, expandedChapters, lockedChapterIdSet])

  const handlePrevLesson = useCallback(() => {
    if (hasPrevLesson) {
      const prevItem = allFlatLessons[currentLessonIndex - 1]
      setCurrentChapter(prevItem.chapter)
      setCurrentLesson(prevItem.lesson)
      if (!expandedChapters.includes(prevItem.chapter.id)) {
        setExpandedChapters((prev) => [...prev, prevItem.chapter.id])
      }
    }
  }, [hasPrevLesson, allFlatLessons, currentLessonIndex, expandedChapters])

  const handleLessonDurationChange = useCallback((lessonId: string, durationSec: number) => {
    if (durationSec <= 0) return
    setCourse((prev) => {
      if (!prev) return prev
      let changed = false
      const updatedChapters = prev.chapters.map((ch) => {
        const updatedLessons = ch.lessons.map((les) => {
          if (les.id === lessonId && les.duration !== durationSec) {
            changed = true
            return { ...les, duration: durationSec }
          }
          return les
        })
        return { ...ch, lessons: updatedLessons }
      })

      if (!changed) return prev
      const newTotalSec = updatedChapters.reduce(
        (acc, ch) => acc + ch.lessons.reduce((lAcc, l) => lAcc + (Number(l.duration) || 0), 0),
        0
      )
      return {
        ...prev,
        chapters: updatedChapters,
        duration: formatExactDuration(newTotalSec),
      }
    })
  }, [])

  const { handleAddNoteAtTimestamp, handleDeleteNote } = useCourseNotes({
    course,
    setCourse,
    currentLesson,
    isAuthenticated,
    user,
    isEnrolled,
    setActiveBottomTab,
  })

  const { handleCreateQnA, handleAddQnAAnswer, handleUpvoteQnA } = useCourseQnA({
    course,
    setCourse,
    currentLesson,
    isAuthenticated,
    user,
    isEnrolled,
  })

  const { handleAddReview } = useCourseReviews({
    course,
    setCourse,
    isAuthenticated,
    user,
    isEnrolled,
  })

  const {
    activeTestModal,
    setActiveTestModal,
    handleTakeTest,
    handleTestComplete,
    currentTestModalData,
  } = useCourseTests({
    courseId,
    isEnrolled,
    progressDetail,
    setProgressDetail,
    setCourse,
  })

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))
      return
    }
    if (!course) return
    if (isInCart(course.id)) {
      return
    }
    setIsAddingToCart(true)
    const result = await addToCart(course.id)
    setIsAddingToCart(false)
    if (result.success) {
      toast.success('Đã thêm khóa học vào giỏ hàng thành công!', 'Giỏ hàng')
    } else {
      toast.error(result.message || 'Không thể thêm vào giỏ hàng', 'Lỗi')
    }
  }

  return {
    course,
    setCourse,
    currentChapter,
    currentLesson,
    isLoading,
    isEnrolled,
    setIsEnrolled,
    expandedChapters,
    activeBottomTab,
    setActiveBottomTab,
    activeSidebarTab,
    setActiveSidebarTab,
    isSidebarOpen,
    setIsSidebarOpen,
    playerCurrentTime,
    setPlayerCurrentTime,
    showRatingModal,
    setShowRatingModal,
    showUpgradeModal,
    setShowUpgradeModal,
    showCourseCheckoutModal,
    setShowCourseCheckoutModal,
    showPlacementPromptModal,
    setShowPlacementPromptModal,
    isAddingToCart,
    activeTestModal,
    setActiveTestModal,
    progressDetail,
    lockedChapterIdSet,
    hasNextLesson,
    hasPrevLesson,
    currentTestModalData,
    toggleChapter,
    handleSelectLesson,
    handleToggleLessonComplete,
    handleLessonProgress,
    handleNextLesson,
    handlePrevLesson,
    handleLessonDurationChange,
    handleAddNoteAtTimestamp,
    handleDeleteNote,
    handleCreateQnA,
    handleAddQnAAnswer,
    handleUpvoteQnA,
    handleAddReview,
    handleAddToCart,
    handleTakeTest,
    handleTestComplete,
    user,
    isAuthenticated,
    isInCart,
  }
}
