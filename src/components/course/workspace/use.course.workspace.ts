/**
 * @file use.course.workspace.ts
 * @description Custom hook điều phối tổng thể không gian học tập (khóa học, chương bài, tiến độ và điều hướng bài học)
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { courseService } from '@/services/course.service'
import { useAuthStore } from '@/store/auth.store'
import { useEnrollmentStore } from '@/store/enrollment.store'
import { useCartStore } from '@/store/cart.store'
import { toast } from '@/store/toast.store'
import type { Course, Chapter, Lesson, NoteItem, QnAItem, CourseReviewItem } from '@/types/course'
import { useCourseNotes } from './use.course.notes'
import { useCourseQnA } from './use.course.qna'
import { useCourseReviews } from './use.course.reviews'
import { useCourseTests } from './use.course.tests'
import type { BottomTab } from './course.workspace.tabs'
import type { SidebarTab } from './course.workspace.sidebar'

function formatExactDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 phút'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h} giờ ${m > 0 ? `${m} phút` : ''}`.trim()
  return `${m} phút`
}

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
        const rawChapters = courseObj.chapters || courseObj.modules || []
        const chaptersArr = Array.isArray(rawChapters) ? rawChapters : []

        const [enrollmentRes, progressRes] = await Promise.all([
          courseService.getEnrollmentStatus(courseId).then((r) => ({ enrolled: Boolean(r?.is_enrolled) })).catch(() => ({ enrolled: false })),
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

        const completedLessonIdSet = new Set<string>()
        const compLessonIds = progressRes?.completed_lesson_ids || (progressRes as any)?.completed_lessons
        if (userIsEnrolled && Array.isArray(compLessonIds)) {
          compLessonIds.forEach((id: string) => completedLessonIdSet.add(id))
        }

        const mappedChapters: Chapter[] = chaptersArr.map((ch: any, cIdx: number) => {
          const rawLessons = ch.lessons || ch.items || []
          const lessonsArr = Array.isArray(rawLessons) ? rawLessons : []

          const modProgress = progressDetail?.modules_progress?.find(
            (m: any) => m.module_id === ch.id || m.module_id === ch._id || m.order_index === (ch.order || cIdx + 1)
          )

          let chapterStatus: Chapter['status'] = 'in-progress'
          if (modProgress) {
            if (modProgress.status === 'COMPLETED' || modProgress.status === 'SKIPPED_BY_CHALLENGE') {
              chapterStatus = 'completed'
            } else if (modProgress.status === 'LOCKED') {
              chapterStatus = 'locked'
            }
          }

          const chId = String(ch.id || ch._id || `ch-${cIdx + 1}`)
          const mappedLessons: Lesson[] = lessonsArr.map((l: any, lIdx: number) => {
            const isCompleted = l.status === 'completed' || completedLessonIdSet.has(l.id || l._id)
            return {
              id: String(l.id || l._id || `les-${cIdx + 1}-${lIdx + 1}`),
              chapterId: chId,
              order: l.order || lIdx + 1,
              title: String(l.title || `Bài ${lIdx + 1}`),
              duration: typeof l.duration === 'number' ? l.duration : 600,
              type: l.type || 'video',
              status: isCompleted ? 'completed' : l.status || 'available',
              progress: isCompleted ? 100 : l.progress || 0,
              videoUrl: l.videoUrl || l.video_url || l.content?.videoUrl,
              is_free_preview: Boolean(l.is_free_preview || l.is_preview || (cIdx === 0 && lIdx === 0)),
              is_preview: Boolean(l.is_free_preview || l.is_preview || (cIdx === 0 && lIdx === 0)),
              resources: Array.isArray(l.resources) ? l.resources : [],
              content: typeof l.content === 'object' && l.content !== null ? l.content : { sections: [] },
            }
          })

          return {
            id: chId,
            courseId: String(courseId),
            title: String(ch.title || `Chương ${cIdx + 1}`),
            order: ch.order || cIdx + 1,
            description: ch.description || '',
            status: chapterStatus,
            lessons: mappedLessons,
            challenge_questions: ch.challenge_questions || ch.test_questions || [],
            challenge_duration_minutes: ch.challenge_duration_minutes || 15,
            challenge_passing_score: ch.challenge_passing_score || 80,
            speaking_prompt: ch.speaking_prompt,
            speaking_file_url: ch.speaking_file_url,
            writing_prompt: ch.writing_prompt,
            writing_file_url: ch.writing_file_url,
          }
        })

        const totalLes = mappedChapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
        const totalDurationSec = mappedChapters.reduce(
          (acc, ch) => acc + ch.lessons.reduce((lAcc, l) => lAcc + (Number(l.duration) || 0), 0),
          0
        )

        const [reviewsRes, notesRes, qnaRes] = await Promise.all([
          courseService.getCourseReviews(courseId).catch(() => null),
          userIsEnrolled && isAuthenticated
            ? courseService.getCourseNotes(courseId).catch(() => [])
            : Promise.resolve([]),
          courseService.getCourseQnA(courseId).catch(() => []),
        ])

        const mappedReviews: CourseReviewItem[] = (reviewsRes?.reviews || []).map((r: any) => ({
          id: String(r._id || r.id),
          author: String(r.author_name || r.author || 'Học viên'),
          avatar: r.author_avatar || '',
          rating: Number(r.rating) || 5,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
          content: String(r.content || ''),
        }))

        const mappedNotes: NoteItem[] = (Array.isArray(notesRes) ? notesRes : []).map((n: any) => ({
          id: String(n._id || n.id),
          lessonId: String(n.lesson_id),
          lessonTitle: String(n.lesson_title || 'Bài học'),
          timestamp: Number(n.timestamp) || 0,
          formattedTime: String(n.formatted_time || '0:00'),
          content: String(n.content || ''),
          createdAt: n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
        }))

        const mappedQnA: QnAItem[] = (Array.isArray(qnaRes) ? qnaRes : []).map((q: any) => ({
          id: String(q._id || q.id),
          lessonTitle: String(q.lesson_title || 'Bài học'),
          userId: q.user_id ? String(q.user_id) : undefined,
          isAnonymous: Boolean(q.is_anonymous),
          author: String(q.author_name || (q.is_anonymous ? 'Học viên ẩn danh' : 'Học viên')),
          authorAvatar: q.author_avatar || undefined,
          title: String(q.title || ''),
          body: String(q.body || ''),
          createdAt: q.created_at ? new Date(q.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
          upvotes: Number(q.upvotes) || 0,
          answersCount: Array.isArray(q.answers) ? q.answers.length : 0,
          isAnswered: Array.isArray(q.answers) && q.answers.length > 0,
          answers: (q.answers || []).map((a: any) => ({
            id: String(a._id || a.id),
            author: String(a.author_name || 'Học viên'),
            authorRole: a.author_role || (a.is_tutor ? 'Gia sư AI' : 'Học viên'),
            authorAvatar: a.author_avatar || undefined,
            body: String(a.body || ''),
            createdAt: a.created_at ? new Date(a.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
            upvotes: Number(a.upvotes) || 0,
          })),
        }))

        const structuredCourse: Course = {
          id: String(courseObj._id || courseObj.id || courseId),
          title: String(courseObj.title || 'Khóa học LingoSphere'),
          level: String(courseObj.level || 'Intermediate'),
          description: String(courseObj.description || ''),
          duration: formatExactDuration(totalDurationSec),
          totalChapters: mappedChapters.length,
          totalLessons: totalLes,
          rating: typeof reviewsRes?.rating === 'number' ? reviewsRes.rating : 5.0,
          ratingCount: typeof reviewsRes?.rating_count === 'number' ? reviewsRes.rating_count : 0,
          studentsCount: Number(courseObj.students_count || courseObj.studentsCount || 0),
          whatYouWillLearn: Array.isArray(courseObj.what_you_will_learn)
            ? (courseObj.what_you_will_learn as string[])
            : [],
          chapters: mappedChapters,
          instructor: {
            name: String(courseObj.author_name || 'Đội ngũ Giảng viên LingoSphere'),
            title: 'Giảng viên chuyên môn',
            avatar: String(courseObj.author_avatar || ''),
            rating: 5.0,
            studentsCount: 100,
            coursesCount: 1,
            bio: 'Chuyên gia giảng dạy ngôn ngữ giàu kinh nghiệm thực chiến.',
          },
          overview: {
            whatYouWillLearn: Array.isArray(courseObj.what_you_will_learn)
              ? (courseObj.what_you_will_learn as string[])
              : [],
            requirements: ['Có máy tính hoặc điện thoại kết nối internet.'],
            targetAudience: ['Học viên muốn nâng cao trình độ nhanh chóng và bài bản.'],
          },
          reviews: mappedReviews,
          qna: mappedQnA,
          notes: mappedNotes,
          final_test_questions: (courseObj.final_test_questions as any) || [],
          final_test_duration_minutes: Number((courseObj as any).final_test_duration_minutes || 60),
          final_test_audio_url: String(courseObj.final_test_audio_url || ''),
          final_test_speaking_prompt: String((courseObj as any).final_test_speaking_prompt || ''),
          final_test_speaking_file_url: String((courseObj as any).final_test_speaking_file_url || ''),
          final_test_writing_prompt: String((courseObj as any).final_test_writing_prompt || ''),
          final_test_writing_file_url: String((courseObj as any).final_test_writing_file_url || ''),
          category: String(courseObj.category || ''),
          skills: Array.isArray(courseObj.skills) ? (courseObj.skills as string[]) : [],
          finalTest: { status: userIsEnrolled ? 'available' : 'locked' },
        }

        const initialChapter = mappedChapters[0] || null
        const initialLesson = mappedChapters[0]?.lessons[0] || null

        if (isMounted) {
          setCourse(structuredCourse)
          setCurrentChapter(initialChapter)
          setCurrentLesson(initialLesson)
          setExpandedChapters(mappedChapters.map((ch) => ch.id))
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
      const prevPassingScore = prevCh.challengeTest?.passingScore || (prevCh as any)?.challenge_passing_score || 80
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
