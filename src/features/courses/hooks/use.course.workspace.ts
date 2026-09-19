// Hook điều phối trạng thái không gian học tập, điều hướng bài giảng và theo dõi tiến độ khóa học.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/features/courses/services/course.service'
import { useAuthStore } from '@/features/auth/store/auth.store'
import { courseKeys } from '@/features/courses/keys/course.keys'
import {
  useCourseDetailQuery,
  useCourseEnrollmentStatusQuery,
  useCourseReviewsQuery,
  useCourseQnAQuery,
  useCourseProgressQuery,
  useUserEnrollments,
} from '@/features/courses/hooks/use.courses.query'
import { useCart } from '@/features/cart/hooks/use.cart.query'
import { toast } from '@/store/toast.store'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type {
  Course,
  Chapter,
  Lesson,
  CourseProgressDetailInfo,
  ModuleProgressInfo,
} from '@/features/courses/types/course'
import type { CourseStudySchedule, CourseChapterLockState } from '@/features/courses/types/schedule.types'
import { useCourseNotes } from '@/features/courses/hooks/use.course.notes'
import { useCourseQnA } from '@/features/courses/hooks/use.course.qna'
import { useCourseReviews } from '@/features/courses/hooks/use.course.reviews'
import { useCourseTests } from '@/features/courses/hooks/use.course.tests'
import { useCourseWorkspaceModals } from '@/features/courses/hooks/use.course.workspace.modals'
import { useCourseLessonNavigation } from '@/features/courses/hooks/use.course.lesson.navigation'
import type { BottomTab } from '@/features/courses/components/course.workspace.tabs'
import type { SidebarTab } from '@/features/courses/components/course.workspace.sidebar'
import {
  mapCourseDataToWorkspace,
  formatExactDuration,
} from '@/features/courses/helpers/course.workspace.adapter'

export function useCourseWorkspace(courseId: string, initialIsEnrolled: boolean = false) {
  const user = useAuthStore((s) => s.user)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { addToCart, isInCart } = useCart(isAuthenticated)
  const queryClient = useQueryClient()

  const { data: rawCourse, isLoading: isCourseLoading, isError: isCourseError } = useCourseDetailQuery(courseId)

  const { isEnrolled: checkIsEnrolledByList } = useUserEnrollments(isAuthenticated)
  const isEnrolledInList = checkIsEnrolledByList(courseId)

  const { data: enrollmentStatusRes, isLoading: isEnrollmentLoading } = useCourseEnrollmentStatusQuery(
    courseId,
    isAuthenticated && !isEnrolledInList
  )

  const { data: progressData } = useCourseProgressQuery(
    courseId,
    Boolean(courseId && isAuthenticated)
  )

  const [overrideEnrolled, setOverrideEnrolled] = useState<boolean | null>(null)
  const isEnrolled =
    overrideEnrolled ??
    (isEnrolledInList ||
      Boolean(enrollmentStatusRes?.is_enrolled) ||
      Boolean(progressData?.course_progress) ||
      Boolean(progressData?.completed_lesson_ids?.length) ||
      (enrollmentStatusRes === undefined && initialIsEnrolled))

  useEffect(() => {
    if (typeof window === 'undefined' || !courseId) return
    try {
      const key = STORAGE_KEYS.COURSE_ENROLLED(courseId)
      if (isEnrolledInList || enrollmentStatusRes?.is_enrolled || overrideEnrolled) {
        localStorage.setItem(key, 'true')
        storage.cookie.set(key, 'true', { days: 30, path: '/' })
      } else if (enrollmentStatusRes && !enrollmentStatusRes.is_enrolled && !isEnrolledInList) {
        localStorage.removeItem(key)
        storage.cookie.remove(key, '/')
      }
    } catch {}
  }, [courseId, isEnrolledInList, enrollmentStatusRes, overrideEnrolled])

  const { data: reviewsData } = useCourseReviewsQuery(courseId, Boolean(rawCourse))
  const { data: qnaData } = useCourseQnAQuery(courseId, Boolean(rawCourse))

  const derivedCourse = useMemo(() => {
    if (!rawCourse) return null
    return mapCourseDataToWorkspace(
      courseId,
      rawCourse,
      isEnrolled,
      progressData || null,
      reviewsData || null,
      [],
      qnaData || []
    )
  }, [courseId, rawCourse, isEnrolled, progressData, reviewsData, qnaData])

  const [course, setCourse] = useState<Course | null>(null)
  const activeCourse = course || derivedCourse

  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('overview')
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('content')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [playerCurrentTime, setPlayerCurrentTime] = useState(0)
  const [progressDetail, setProgressDetail] = useState<CourseProgressDetailInfo | null>(null)
  const [courseSchedule, setCourseSchedule] = useState<CourseStudySchedule | null>(null)
  const [courseLockState, setCourseLockState] = useState<CourseChapterLockState | null>(null)

  const lockedChapterIdSet = useMemo(() => {
    const set = new Set<string>()
    if (!activeCourse?.chapters || !isEnrolled) return set

    const lockState = progressDetail?.course_progress?.lock_state

    for (let i = 1; i < activeCourse.chapters.length; i++) {
      const prevCh = activeCourse.chapters[i - 1]
      const prevMod = progressDetail?.modules_progress?.find(
        (m: ModuleProgressInfo) => m.module_id === prevCh.id || m.order_index === (prevCh.order || i)
      )
      const prevPassingScore =
        prevCh.challengeTest?.passingScore || prevCh.challenge_passing_score || 80
      const prevScore = Number(prevMod?.challenge_score ?? prevMod?.post_mini_score ?? 0)
      const prevLessons = prevCh.lessons || []
      const prevCompleted = prevLessons.filter((l) => l.status === 'completed').length
      const isPrevAllCompleted = prevLessons.length > 0 && prevCompleted === prevLessons.length
      const prevQuestionsCount = Number(
        prevCh.challengeTest?.questionsCount ||
          prevCh.challenge_questions?.length ||
          0
      )
      const passedChallenge = Boolean(
        prevMod?.is_passed_by_challenge ||
          prevMod?.status === 'COMPLETED' ||
          prevMod?.status === 'SKIPPED_BY_CHALLENGE' ||
          (Boolean(prevMod?.challenge_taken) && prevScore >= prevPassingScore) ||
          (prevQuestionsCount === 0 && isPrevAllCompleted)
      )
      if (!passedChallenge) {
        set.add(activeCourse.chapters[i].id)
      }
    }

    activeCourse.chapters.forEach((ch, idx) => {
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
  }, [activeCourse, isEnrolled, progressDetail])

  const navigation = useCourseLessonNavigation({
    course: activeCourse,
    courseId,
    progressDetail,
    lockedChapterIdSet,
  })

  const modals = useCourseWorkspaceModals({
    course: activeCourse,
    isAuthenticated,
    isInCart,
    addToCart,
  })

  useEffect(() => {
    if (!rawCourse) return

    const structured = mapCourseDataToWorkspace(
      courseId,
      rawCourse,
      isEnrolled,
      progressData || null,
      reviewsData || null,
      [],
      qnaData || []
    )

    setCourse((prev) => {
      if (!prev) return structured
      const mergedChapters = structured.chapters.map((ch) => {
        const prevCh = prev.chapters.find((pc) => pc.id === ch.id)
        if (!prevCh) return ch
        const mergedLessons = ch.lessons.map((l) => {
          const prevL = prevCh.lessons.find((pl) => pl.id === l.id)
          if (!prevL) return l
          const isCompleted = l.status === 'completed' || prevL.status === 'completed'
          const bestProgress = isCompleted ? 100 : Math.max(l.progress || 0, prevL.progress || 0)
          const bestStatus: Lesson['status'] = isCompleted
            ? 'completed'
            : bestProgress > 0
            ? 'in-progress'
            : l.status
          return {
            ...l,
            status: bestStatus,
            progress: bestProgress,
            duration: prevL.duration || l.duration,
          }
        })
        const chCompleted = mergedLessons.filter((l) => l.status === 'completed').length
        const isAllComp = mergedLessons.length > 0 && chCompleted === mergedLessons.length
        return {
          ...ch,
          status: isAllComp ? 'completed' : ch.status,
          lessons: mergedLessons,
        }
      })
      return {
        ...structured,
        chapters: mergedChapters,
        reviews: reviewsData ? structured.reviews : prev.reviews,
        qna: qnaData ? structured.qna : prev.qna,
      }
    })

    const allFlat: Array<{ chapter: Chapter; lesson: Lesson }> = []
    structured.chapters.forEach((ch) => {
      ch.lessons.forEach((les) => {
        allFlat.push({ chapter: ch, lesson: les })
      })
    })

    let targetId: string | undefined = navigation.currentLesson?.id

    if (!targetId && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      targetId = urlParams.get('lesson') || urlParams.get('lessonId') || undefined
    }

    if (!targetId && typeof window !== 'undefined') {
      const savedId = storage.get<string>(STORAGE_KEYS.COURSE_LAST_WATCHED(courseId))
      if (savedId) {
        targetId = savedId
      }
    }

    if (!targetId && progressData?.completed_lesson_ids?.length) {
      const completedSet = new Set(progressData.completed_lesson_ids)
      const uncompleted = allFlat.find((item) => !completedSet.has(item.lesson.id))
      if (uncompleted) {
        targetId = uncompleted.lesson.id
      }
    }

    let matchedItem = targetId ? allFlat.find((item) => item.lesson.id === targetId) : null
    if (!matchedItem && allFlat.length > 0) {
      matchedItem = allFlat[0]
    }

    if (matchedItem) {
      const targetChapter = matchedItem.chapter
      const targetLesson = matchedItem.lesson
      navigation.setCurrentChapter(targetChapter)
      navigation.setCurrentLesson(targetLesson)
      navigation.setExpandedChapters((prev) =>
        prev.includes(targetChapter.id) ? prev : [...prev, targetChapter.id]
      )
      if (typeof window !== 'undefined') {
        storage.set(STORAGE_KEYS.COURSE_LAST_WATCHED(courseId), targetLesson.id)
        const url = new URL(window.location.href)
        if (url.searchParams.get('lesson') !== targetLesson.id) {
          url.searchParams.set('lesson', targetLesson.id)
          window.history.replaceState(null, '', url.toString())
        }
      }
    }
  }, [rawCourse, isEnrolled, progressData, reviewsData, qnaData, courseId])

  useEffect(() => {
    if (progressData) {
      setProgressDetail(progressData)
      if (progressData.course_progress?.schedule) {
        setCourseSchedule(progressData.course_progress.schedule)
      }
      if (progressData.course_progress?.lock_state) {
        setCourseLockState(progressData.course_progress.lock_state)
      }
    }
  }, [progressData])

  const isLoading =
    (isCourseLoading || (!activeCourse && !isCourseError)) ||
    (isAuthenticated && isEnrollmentLoading && !isEnrolledInList && !initialIsEnrolled)

  const setIsEnrolled = useCallback(
    (val: boolean) => {
      setOverrideEnrolled(val)
      queryClient.invalidateQueries({ queryKey: courseKeys.enrollments() })
      queryClient.invalidateQueries({ queryKey: [...courseKeys.detail(courseId), 'enrollment-status'] })
    },
    [courseId, queryClient]
  )

  const refreshCourseProgress = useCallback(async () => {
    if (!courseId) return
    queryClient.invalidateQueries({ queryKey: [...courseKeys.detail(courseId), 'progress'] })
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
  }, [courseId, queryClient])

  const handleToggleLessonComplete = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!activeCourse) return

    if (!isEnrolled) {
      toast.warning(
        'Bạn đang trong chế độ học thử. Hãy đăng ký khóa học để lưu tiến độ hoàn thành bài học nhé!',
        'Chế độ học thử'
      )
      return
    }

    let targetStatus: Lesson['status'] = 'completed'
    let chapterId = navigation.currentChapter?.id || ''

    const nextChapters = activeCourse.chapters.map((ch) => {
      let chStatus = ch.status
      const lessons = ch.lessons.map((l) => {
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
      })
      const chCompleted = lessons.filter((l) => l.status === 'completed').length
      if (lessons.length > 0 && chCompleted === lessons.length) {
        chStatus = 'completed'
      } else if (chCompleted < lessons.length && chStatus === 'completed') {
        chStatus = 'in-progress'
      }
      return {
        ...ch,
        status: chStatus,
        lessons,
      }
    })

    setCourse({ ...activeCourse, chapters: nextChapters })

    const curChapId = chapterId || activeCourse.chapters[0]?.id || ''
    const isNowCompleted = targetStatus === 'completed'

    courseService
      .completeLesson({
        course_id: String(activeCourse.id),
        module_id: curChapId,
        lesson_id: lessonId,
        is_completed: isNowCompleted,
        score: isNowCompleted ? 100 : 0,
      })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: [...courseKeys.detail(courseId), 'progress'] })
        queryClient.invalidateQueries({ queryKey: [...courseKeys.detail(String(activeCourse.id)), 'progress'] })
      })
      .catch(() => {})

    if (isNowCompleted) {
      toast.success('Đã lưu tiến độ hoàn thành bài học vào hệ thống!', 'Hoàn thành bài học')
    } else {
      toast.info('Đã hủy hoàn thành bài học', 'Cập nhật tiến độ')
    }
  }

  const handleLessonProgress = (lessonId: string, progress: number) => {
    if (!activeCourse || !isEnrolled) return
    let justCompleted = false
    let hasChanges = false
    let chapterId = navigation.currentChapter?.id || ''
    const isNowCompleted = progress >= 80 || progress >= 100

    const nextChapters = activeCourse.chapters.map((ch) => {
      let chStatus = ch.status
      const lessons = ch.lessons.map((l) => {
        if (l.id === lessonId) {
          if (!chapterId) chapterId = ch.id
          if (l.status === 'completed') {
            return l
          }
          if (isNowCompleted) {
            justCompleted = true
          }
          const nextStatus: Lesson['status'] = isNowCompleted
            ? 'completed'
            : progress > 0
            ? 'in-progress'
            : l.status
          const nextProgress = isNowCompleted ? 100 : Math.max(l.progress || 0, progress)
          if (nextStatus !== l.status || nextProgress !== l.progress) {
            hasChanges = true
          }
          return {
            ...l,
            progress: nextProgress,
            status: nextStatus,
          }
        }
        return l
      })
      const chCompleted = lessons.filter((l) => l.status === 'completed').length
      if (lessons.length > 0 && chCompleted === lessons.length) {
        chStatus = 'completed'
      }
      return {
        ...ch,
        status: chStatus,
        lessons,
      }
    })

    if (hasChanges) {
      setCourse({ ...activeCourse, chapters: nextChapters })
    }

    if (justCompleted) {
      const curChapId = chapterId || activeCourse.chapters[0]?.id || ''
      courseService
        .completeLesson({
          course_id: String(activeCourse.id),
          module_id: curChapId,
          lesson_id: lessonId,
          score: 100,
          time_spent_seconds: Math.round(playerCurrentTime),
        })
        .then(() => {
          queryClient.invalidateQueries({ queryKey: [...courseKeys.detail(courseId), 'progress'] })
          queryClient.invalidateQueries({ queryKey: [...courseKeys.detail(String(activeCourse.id)), 'progress'] })
        })
        .catch(() => {})
    }
  }

  const handleLessonDurationChange = useCallback((lessonId: string, durationSec: number) => {
    if (durationSec <= 0) return
    setCourse((prev) => {
      const target = prev || derivedCourse
      if (!target) return prev
      let changed = false
      const updatedChapters = target.chapters.map((ch) => {
        const updatedLessons = ch.lessons.map((les) => {
          if (les.id === lessonId && les.duration !== durationSec) {
            changed = true
            return { ...les, duration: durationSec }
          }
          return les
        })
        return { ...ch, lessons: updatedLessons }
      })

      if (!changed) return target
      const newTotalSec = updatedChapters.reduce(
        (acc, ch) => acc + ch.lessons.reduce((lAcc, l) => lAcc + (Number(l.duration) || 0), 0),
        0
      )
      return {
        ...target,
        chapters: updatedChapters,
        duration: formatExactDuration(newTotalSec),
      }
    })
  }, [derivedCourse])

  const { handleAddNoteAtTimestamp, handleDeleteNote } = useCourseNotes({
    course: activeCourse,
    setCourse,
    currentLesson: navigation.currentLesson,
    isAuthenticated,
    user,
    isEnrolled,
    setActiveBottomTab,
  })

  const { handleCreateQnA, handleAddQnAAnswer, handleUpvoteQnA } = useCourseQnA({
    course: activeCourse,
    setCourse,
    currentLesson: navigation.currentLesson,
    isAuthenticated,
    user,
    isEnrolled,
  })

  const { handleAddReview } = useCourseReviews({
    course: activeCourse,
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

  return {
    course: activeCourse,
    setCourse,
    isError: isCourseError,
    currentChapter: navigation.currentChapter,
    currentLesson: navigation.currentLesson,
    isLoading,
    isEnrolled,
    setIsEnrolled,
    expandedChapters: navigation.expandedChapters,
    activeBottomTab,
    setActiveBottomTab,
    activeSidebarTab,
    setActiveSidebarTab,
    isSidebarOpen,
    setIsSidebarOpen,
    playerCurrentTime,
    setPlayerCurrentTime,
    showRatingModal: modals.showRatingModal,
    setShowRatingModal: modals.setShowRatingModal,
    showUpgradeModal: modals.showUpgradeModal,
    setShowUpgradeModal: modals.setShowUpgradeModal,
    showCourseCheckoutModal: modals.showCourseCheckoutModal,
    setShowCourseCheckoutModal: modals.setShowCourseCheckoutModal,
    showPlacementPromptModal: modals.showPlacementPromptModal,
    setShowPlacementPromptModal: modals.setShowPlacementPromptModal,
    isAddingToCart: modals.isAddingToCart,
    activeTestModal,
    setActiveTestModal,
    progressDetail,
    courseSchedule,
    setCourseSchedule,
    courseLockState,
    setCourseLockState,
    refreshCourseProgress,
    lockedChapterIdSet,
    hasNextLesson: navigation.hasNextLesson,
    hasPrevLesson: navigation.hasPrevLesson,
    currentTestModalData,
    toggleChapter: navigation.toggleChapter,
    handleSelectLesson: navigation.handleSelectLesson,
    handleToggleLessonComplete,
    handleLessonProgress,
    handleNextLesson: navigation.handleNextLesson,
    handlePrevLesson: navigation.handlePrevLesson,
    handleLessonDurationChange,
    handleAddNoteAtTimestamp,
    handleDeleteNote,
    handleCreateQnA,
    handleAddQnAAnswer,
    handleUpvoteQnA,
    handleAddReview,
    handleAddToCart: modals.handleAddToCart,
    handleTakeTest,
    handleTestComplete,
    user,
    isAuthenticated,
    isInCart,
  }
}
