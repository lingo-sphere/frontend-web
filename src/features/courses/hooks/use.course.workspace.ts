// Hook điều phối trạng thái không gian học tập, điều hướng bài giảng và theo dõi tiến độ khóa học.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { courseService } from '@/features/courses/services/course.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { getQueryClient } from '@/config/query.config'
import { courseKeys } from '@/features/courses/keys/course.keys'
import { useCart } from '@/features/cart/hooks/use.cart.query'
import { toast } from '@/store/toast.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { Course, Chapter, Lesson } from '@/features/courses/types/course'
import type { CourseStudySchedule, CourseChapterLockState } from '@/features/courses/types/schedule.types'
import { useCourseNotes } from '@/features/courses/hooks/use.course.notes'
import { useCourseQnA } from '@/features/courses/hooks/use.course.qna'
import { useCourseReviews } from '@/features/courses/hooks/use.course.reviews'
import { useCourseTests } from '@/features/courses/hooks/use.course.tests'
import type { BottomTab } from '@/features/courses/components/course.workspace.tabs'
import type { SidebarTab } from '@/features/courses/components/course.workspace.sidebar'
import {
  mapCourseDataToWorkspace,
  formatExactDuration,
} from '@/features/courses/helpers/course.workspace.adapter'

interface ModuleProgressInfo {
  module_id?: string
  order_index?: number
  status?: string
  challenge_score?: number
  challenge_taken?: boolean
  is_passed_by_challenge?: boolean
  post_mini_score?: number
  is_locked_by_reminder?: boolean
}

interface CourseProgressDetailInfo {
  course_progress?: {
    schedule?: CourseStudySchedule
    lock_state?: CourseChapterLockState
    last_video_watched_at?: string
    is_baseline_established?: boolean
    baseline_score?: number
    final_test_score?: number
    final_test_attempts?: any[]
  }
  modules_progress?: ModuleProgressInfo[]
  completed_lesson_ids?: string[]
}

export function useCourseWorkspace(courseId: string) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { addToCart, isInCart } = useCart(isAuthenticated)

  const [course, setCourse] = useState<Course | null>(null)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const queryClient = getQueryClient()
  const initialEnrolled = useMemo(() => {
    if (!isAuthenticated || !courseId) return false
    const cached = queryClient.getQueryData<Array<{ course_id?: string; id?: string; _id?: string }>>(
      courseKeys.enrollments()
    )
    if (Array.isArray(cached)) {
      return cached.some((e) => e.course_id === courseId || e.id === courseId || e._id === courseId)
    }
    return false
  }, [courseId, isAuthenticated, queryClient])

  const [isEnrolled, setIsEnrolled] = useState(initialEnrolled)
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
  const [progressDetail, setProgressDetail] = useState<CourseProgressDetailInfo | null>(null)
  const [courseSchedule, setCourseSchedule] = useState<CourseStudySchedule | null>(null)
  const [courseLockState, setCourseLockState] = useState<CourseChapterLockState | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchCourse() {
      if (!courseId) return
      setIsLoading(true)

      try {
        const coursePromise = courseService.getCourseById(courseId)
        const enrollmentPromise = isAuthenticated
          ? courseService
              .getEnrollmentStatus(courseId)
              .then((r) => Boolean(r?.is_enrolled))
              .catch(() => false)
          : Promise.resolve(false)

        const [fetchedCourse, userIsEnrolled] = await Promise.all([
          coursePromise,
          enrollmentPromise,
        ])

        if (!fetchedCourse || !isMounted) {
          if (isMounted) setIsLoading(false)
          return
        }

        setIsEnrolled(userIsEnrolled)

        const initialStructured = mapCourseDataToWorkspace(
          courseId,
          fetchedCourse,
          userIsEnrolled,
          null,
          null,
          [],
          []
        )

        const initialChapter = initialStructured.chapters[0] || null
        const initialLesson = initialStructured.chapters[0]?.lessons[0] || null

        setCourse(initialStructured)
        setCurrentChapter(initialChapter)
        setCurrentLesson(initialLesson)
        setExpandedChapters(initialStructured.chapters.map((ch) => ch.id))
        setIsLoading(false)

        const secondaryPromises: [
          Promise<any>,
          Promise<any>,
          Promise<any>,
          Promise<any>
        ] = [
          userIsEnrolled
            ? courseService.getCourseProgressDetail(courseId).catch(() => null)
            : Promise.resolve(null),
          userIsEnrolled && isAuthenticated
            ? courseService.getCourseNotes(courseId).catch(() => [])
            : Promise.resolve([]),
          courseService.getCourseReviews(courseId).catch(() => null),
          courseService.getCourseQnA(courseId).catch(() => []),
        ]

        const [progressRes, notesRes, reviewsRes, qnaRes] = await Promise.all(secondaryPromises)

        if (!isMounted) return

        if (progressRes) {
          setProgressDetail(progressRes)
          if (progressRes.course_progress?.schedule) {
            setCourseSchedule(progressRes.course_progress.schedule)
          }
          if (progressRes.course_progress?.lock_state) {
            setCourseLockState(progressRes.course_progress.lock_state)
          }
        }

        const fullyStructured = mapCourseDataToWorkspace(
          courseId,
          fetchedCourse,
          userIsEnrolled,
          progressRes,
          reviewsRes,
          notesRes,
          qnaRes
        )
        setCourse(fullyStructured)
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

  const refreshCourseProgress = useCallback(async () => {
    if (!courseId) return
    try {
      const updatedProgress = await courseService.getCourseProgressDetail(courseId)
      if (updatedProgress) {
        setProgressDetail(updatedProgress)
        if (updatedProgress.course_progress?.schedule) {
          setCourseSchedule(updatedProgress.course_progress.schedule)
        }
        if (updatedProgress.course_progress?.lock_state) {
          setCourseLockState(updatedProgress.course_progress.lock_state)
        }
      }
    } catch {}
  }, [courseId])

  const lockedChapterIdSet = useMemo(() => {
    const set = new Set<string>()
    if (!course?.chapters || !isEnrolled) return set

    const lockState = progressDetail?.course_progress?.lock_state

    for (let i = 1; i < course.chapters.length; i++) {
      const prevCh = course.chapters[i - 1]
      const prevMod = progressDetail?.modules_progress?.find(
        (m: ModuleProgressInfo) => m.module_id === prevCh.id || m.order_index === (prevCh.order || i)
      )
      const prevPassingScore =
        prevCh.challengeTest?.passingScore || prevCh.challenge_passing_score || 80
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

    course.chapters.forEach((ch, idx) => {
      const currentOrder = Number(ch.order || idx + 1)
      const mod = progressDetail?.modules_progress?.find(
        (m: ModuleProgressInfo) => m.module_id === ch.id || m.order_index === currentOrder
      )
      if (mod?.is_locked_by_reminder) {
        set.add(ch.id)
      }
      if (
        lockState?.is_locked &&
        (lockState.locked_module_id === ch.id || lockState.locked_chapter_order === currentOrder)
      ) {
        set.add(ch.id)
      }
    })

    return set
  }, [course?.chapters, isEnrolled, progressDetail])

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
    storage.set(STORAGE_KEYS.COURSE_LAST_WATCHED(courseId), lesson.id)
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
    try {
      await addToCart(course.id)
      toast.success('Đã thêm khóa học vào giỏ hàng thành công!', 'Giỏ hàng')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể thêm vào giỏ hàng'
      toast.error(msg, 'Lỗi')
    } finally {
      setIsAddingToCart(false)
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
    courseSchedule,
    setCourseSchedule,
    courseLockState,
    setCourseLockState,
    refreshCourseProgress,
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
