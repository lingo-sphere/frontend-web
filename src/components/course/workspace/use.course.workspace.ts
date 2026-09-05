'use client'

/**
 * @file use.course.workspace.ts
 * @description Hook quản lý trạng thái, nạp dữ liệu khóa học, tiến độ và các tác vụ tương tác trong không gian học tập.
 */

import { useState, useEffect, useMemo, useCallback } from 'react'
import { courseService } from '@/services/course.service'
import { useAuthStore } from '@/store/auth-store'
import { useCartStore } from '@/store/cart-store'
import { useEnrollmentStore } from '@/store/enrollment-store'
import { toast } from '@/store/toast-store'
import type { Chapter, Course, Lesson, CourseReviewItem, NoteItem, QnAItem } from '@/types/course'
import { BottomTab } from './course.workspace.tabs'
import { SidebarTab } from './course.workspace.sidebar'

function formatExactDuration(totalSeconds: number): string {
  const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0))
  if (sec === 0) return '0 giây'

  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60

  const parts: string[] = []
  if (h > 0) parts.push(`${h} giờ`)
  if (m > 0) parts.push(`${m} phút`)
  if (s > 0 || parts.length === 0) parts.push(`${s} giây`)

  return parts.join(' ')
}

export function useCourseWorkspace(courseId: string) {
  const { user, isAuthenticated } = useAuthStore()
  const { addToCart, isInCart } = useCartStore()

  const [course, setCourse] = useState<Course | null>(null)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isEnrolled, setIsEnrolled] = useState<boolean>(false)
  const [expandedChapters, setExpandedChapters] = useState<string[]>(['ch-01', 'ch-02'])
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('overview')
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('content')
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true)
  const [playerCurrentTime, setPlayerCurrentTime] = useState<number>(0)
  const [showRatingModal, setShowRatingModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [showCourseCheckoutModal, setShowCourseCheckoutModal] = useState(false)
  const [showPlacementPromptModal, setShowPlacementPromptModal] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const [activeTestModal, setActiveTestModal] = useState<{
    isOpen: boolean
    chapter: Chapter | null
    testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
  }>({
    isOpen: false,
    chapter: null,
    testType: 'post-mini',
  })

  const [progressDetail, setProgressDetail] = useState<any>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchCourse() {
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
          userIsEnrolled ? courseService.getCourseQnA(courseId).catch(() => []) : Promise.resolve([]),
        ])

        const mappedReviews: CourseReviewItem[] = (reviewsRes?.reviews || []).map((r: any) => ({
          id: String(r._id || Math.random()),
          author: String(r.user_name || 'Học viên'),
          authorAvatar: r.user_avatar || '',
          rating: Number(r.rating) || 5,
          date: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
          content: String(r.content || ''),
        }))

        const mappedNotes: NoteItem[] = (Array.isArray(notesRes) ? notesRes : []).map((n: any) => ({
          id: String(n._id || Math.random()),
          lessonId: String(n.lesson_id || ''),
          lessonTitle: String(n.lesson_title || ''),
          timestamp: Number(n.timestamp) || 0,
          formattedTime: String(n.formatted_time || '00:00'),
          content: String(n.content || ''),
          createdAt: n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
        }))

        const mappedQnA: QnAItem[] = (Array.isArray(qnaRes) ? qnaRes : []).map((q: any) => ({
          id: String(q._id || Math.random()),
          lessonId: q.lesson_id,
          lessonTitle: String(q.lesson_title || 'Bài học'),
          userId: q.user_id,
          isAnonymous: Boolean(q.is_anonymous),
          author: q.is_anonymous ? 'Học viên ẩn danh' : String(q.author_name || 'Học viên'),
          authorAvatar: q.is_anonymous ? undefined : q.author_avatar,
          title: String(q.title || ''),
          body: String(q.body || ''),
          createdAt: q.created_at ? new Date(q.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
          upvotes: Number(q.upvotes) || 0,
          answersCount: Array.isArray(q.answers) ? q.answers.length : 0,
          isAnswered: Boolean(q.is_answered || (q.answers && q.answers.length > 0)),
          answers: (q.answers || []).map((a: any) => ({
            id: String(a.id || Math.random()),
            author: String(a.author || 'Thành viên'),
            authorRole: a.author_role,
            authorAvatar: a.author_avatar,
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

  const handleAddNoteAtTimestamp = async (timestamp: number, noteContent?: string) => {
    if (!course || !currentLesson) return
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để lưu ghi chú bài học!', 'Chưa đăng nhập')
      return
    }
    if (!isEnrolled) {
      toast.error('Bạn cần mua hoặc đăng ký khóa học này để tạo ghi chú bài giảng!', 'Chưa sở hữu khóa học')
      return
    }
    const formatted = `${Math.floor(timestamp / 60)}:${String(Math.floor(timestamp % 60)).padStart(2, '0')}`
    const content = noteContent || `Ghi chú bài học tại mốc ${formatted}`

    try {
      const res = (await courseService.createCourseNote(String(course.id), {
        lesson_id: currentLesson.id,
        lesson_title: currentLesson.title,
        timestamp,
        formatted_time: formatted,
        content,
      })) as Record<string, unknown>

      const newNote: NoteItem = {
        id: String(res?._id || `note-${Date.now()}`),
        lessonId: currentLesson.id,
        lessonTitle: currentLesson.title,
        timestamp,
        formattedTime: formatted,
        content,
        createdAt: 'Vừa xong',
      }
      setCourse((prev) => (prev ? { ...prev, notes: [newNote, ...(prev.notes || [])] } : null))
      setActiveBottomTab('notes')
      toast.success(`Đã lưu ghi chú tại mốc ${formatted} vào cơ sở dữ liệu!`, 'Ghi chú bài học')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu ghi chú'
      toast.error(msg, 'Lỗi lưu ghi chú')
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để xóa ghi chú!', 'Chưa đăng nhập')
      return
    }
    try {
      await courseService.deleteCourseNote(noteId)
      setCourse((prev) =>
        prev ? { ...prev, notes: (prev.notes || []).filter((n) => n.id !== noteId) } : null
      )
      toast.success('Đã xóa ghi chú thành công!', 'Xóa ghi chú')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể xóa ghi chú'
      toast.error(msg, 'Lỗi xóa ghi chú')
    }
  }

  const handleCreateQnA = async (title: string, body: string, isAnonymous?: boolean) => {
    if (!course || !currentLesson) return
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để đặt câu hỏi!', 'Chưa đăng nhập')
      return
    }
    if (!isEnrolled) {
      toast.error('Bạn cần mua hoặc đăng ký khóa học để gửi câu hỏi Hỏi & Đáp!', 'Chưa sở hữu khóa học')
      return
    }
    try {
      const userPayload = user as unknown as Record<string, unknown>
      const authorName = isAnonymous
        ? 'Học viên ẩn danh'
        : user.full_name || (userPayload?.name as string) || user.email?.split('@')[0] || 'Học viên'
      const authorAvatar = isAnonymous ? '' : user.avatar_url || (userPayload?.avatar as string) || ''

      const res = (await courseService.createCourseQnA(String(course.id), {
        lesson_id: currentLesson.id,
        lesson_title: currentLesson.title,
        title,
        body,
        is_anonymous: isAnonymous,
        author_name: authorName,
        author_avatar: authorAvatar,
      })) as Record<string, unknown>

      const newQnA: QnAItem = {
        id: String(res?._id || `qna-${Date.now()}`),
        lessonTitle: currentLesson.title,
        userId: user.id || user.user_id,
        isAnonymous: Boolean(isAnonymous),
        author: authorName,
        authorAvatar: authorAvatar || undefined,
        title,
        body,
        createdAt: 'Vừa xong',
        upvotes: 0,
        answersCount: 1,
        isAnswered: true,
        answers: [
          {
            id: `ans-${Date.now()}`,
            author: 'LingoSphere AI Tutor',
            authorRole: 'Gia sư AI',
            body: `Chào bạn! Cảm ơn câu hỏi về "${title}". Giảng viên và Trợ lý AI đã ghi nhận thắc mắc và sẽ phản hồi chi tiết trong giây lát!`,
            createdAt: 'Vừa xong',
            upvotes: 0,
          },
        ],
      }

      setCourse((prev) => (prev ? { ...prev, qna: [newQnA, ...(prev.qna || [])] } : null))
      toast.success(
        isAnonymous
          ? 'Câu hỏi ẩn danh của bạn đã được đăng thành công!'
          : 'Câu hỏi của bạn đã được đăng thành công!',
        'Hỏi & Đáp'
      )
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể đăng câu hỏi'
      toast.error(msg, 'Lỗi đăng câu hỏi')
    }
  }

  const handleAddQnAAnswer = async (qnaId: string, answerText: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để trả lời!', 'Chưa đăng nhập')
      return
    }
    if (!isEnrolled) {
      toast.error('Bạn cần mua hoặc đăng ký khóa học để trả lời câu hỏi!', 'Chưa sở hữu khóa học')
      return
    }
    try {
      const userPayload = user as unknown as Record<string, unknown>
      const authorName = user.full_name || (userPayload?.name as string) || user.email?.split('@')[0] || 'Học viên'
      const authorAvatar = user.avatar_url || (userPayload?.avatar as string) || ''

      await courseService.addQnAAnswer(qnaId, {
        body: answerText,
        author: authorName,
        author_avatar: authorAvatar,
      })
      const newAns = {
        id: `ans-${Date.now()}`,
        author: authorName,
        authorRole: 'Học viên',
        authorAvatar: authorAvatar || undefined,
        body: answerText,
        createdAt: 'Vừa xong',
        upvotes: 0,
      }
      setCourse((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          qna: (prev.qna || []).map((q) =>
            q.id === qnaId
              ? { ...q, answers: [...(q.answers || []), newAns], answersCount: (q.answersCount || 0) + 1 }
              : q
          ),
        }
      })
      toast.success('Đã gửi câu trả lời thành công!', 'Hỏi & Đáp')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi câu trả lời'
      toast.error(msg, 'Lỗi trả lời Q&A')
    }
  }

  const handleUpvoteQnA = async (qnaId: string) => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để bình chọn!', 'Chưa đăng nhập')
      return
    }
    if (!isEnrolled) {
      toast.error('Bạn cần mua hoặc đăng ký khóa học để bình chọn!', 'Chưa sở hữu khóa học')
      return
    }
    try {
      await courseService.toggleQnAUpvote(qnaId)
      setCourse((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          qna: (prev.qna || []).map((q) =>
            q.id === qnaId ? { ...q, upvotes: (q.upvotes || 0) + 1 } : q
          ),
        }
      })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể bình chọn'
      toast.error(msg, 'Lỗi bình chọn')
    }
  }

  const handleAddReview = async (rating: number, content: string) => {
    if (!course) return
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để đánh giá khóa học!', 'Chưa đăng nhập')
      return
    }
    if (!isEnrolled) {
      toast.error('Bạn cần mua hoặc đăng ký khóa học để gửi đánh giá!', 'Chưa sở hữu khóa học')
      return
    }
    try {
      const res = (await courseService.createCourseReview(String(course.id), {
        rating,
        content,
      })) as { review: Record<string, unknown>; rating: number; rating_count: number }

      const newRev: CourseReviewItem = {
        id: String(res?.review?._id || `rev-${Date.now()}`),
        author: 'Bạn (Học viên)',
        rating,
        date: 'Vừa xong',
        content,
      }

      setCourse((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          rating: typeof res?.rating === 'number' ? res.rating : prev.rating,
          ratingCount: typeof res?.rating_count === 'number' ? res.rating_count : (prev.ratingCount || 0) + 1,
          reviews: [newRev, ...(prev.reviews || [])],
        }
      })
      toast.success('Cảm ơn bạn đã gửi đánh giá khóa học!', 'Đánh giá thành công')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể gửi đánh giá'
      toast.error(msg, 'Lỗi đánh giá')
    }
  }

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

  const handleTakeTest = (
    chapter: Chapter | null,
    testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
  ) => {
    if (!isEnrolled) {
      toast.warning(
        'Vui lòng mua khóa học hoặc nâng cấp gói thành viên để làm bài kiểm tra và đề thi này!',
        'Yêu cầu mở khóa'
      )
      return
    }
    setActiveTestModal({
      isOpen: true,
      chapter,
      testType,
    })
  }

  const handleTestComplete = async (score: number, isPassed: boolean) => {
    if (activeTestModal.testType === 'final-test') {
      setProgressDetail((prev: any) => {
        const currentFinalAttempts = Array.isArray(prev?.course_progress?.final_test_attempts)
          ? [...prev.course_progress.final_test_attempts]
          : []
        const newAttempt = {
          attempt_id: `att_${Date.now()}`,
          score,
          is_passed: isPassed,
          submitted_at: new Date(),
        }
        return {
          ...(prev || {}),
          course_progress: {
            ...(prev?.course_progress || {}),
            final_test_score: Math.max(prev?.course_progress?.final_test_score || 0, score),
            final_test_attempts: [newAttempt, ...currentFinalAttempts],
          },
        }
      })
    }

    if (activeTestModal.chapter) {
      const finishedChId = activeTestModal.chapter.id
      const finishedChOrder = Number(activeTestModal.chapter.order || 1)
      setProgressDetail((prev: any) => {
        const existingMods = Array.isArray(prev?.modules_progress) ? [...prev.modules_progress] : []
        const modIdx = existingMods.findIndex(
          (m: any) =>
            m.module_id === finishedChId ||
            String(m.module_id) === String(finishedChId) ||
            Number(m.order_index) === finishedChOrder
        )
        const prevMod = modIdx >= 0 ? existingMods[modIdx] : null
        const currentAttempts = Array.isArray(prevMod?.attempts) ? [...prevMod.attempts] : []
        const newAttempt = {
          attempt_id: `att_${Date.now()}`,
          test_type: activeTestModal.testType,
          score,
          is_passed: isPassed,
          submitted_at: new Date(),
        }
        const updatedMod = {
          module_id: finishedChId,
          order_index: finishedChOrder,
          status: isPassed ? 'COMPLETED' : prevMod?.status || 'IN_PROGRESS',
          attempts: [newAttempt, ...currentAttempts],
          challenge_score: Math.max(prevMod?.challenge_score || 0, score),
          is_passed_by_challenge: isPassed || Boolean(prevMod?.is_passed_by_challenge),
          challenge_taken: true,
        }
        if (modIdx >= 0) {
          existingMods[modIdx] = { ...existingMods[modIdx], ...updatedMod }
        } else {
          existingMods.push(updatedMod)
        }

        if (isPassed) {
          const nextOrder = finishedChOrder + 1
          const nextModIdx = existingMods.findIndex((m: any) => Number(m.order_index) === nextOrder)
          if (nextModIdx >= 0) {
            existingMods[nextModIdx] = {
              ...existingMods[nextModIdx],
              status: 'IN_PROGRESS',
            }
          }
        }

        return {
          ...(prev || {}),
          modules_progress: existingMods,
        }
      })
      setCourse((prev) => {
        if (!prev) return null
        const nextChapters = prev.chapters.map((ch) =>
          ch.id === finishedChId || String(ch.id) === String(finishedChId) || Number(ch.order) === finishedChOrder
            ? { ...ch, status: (isPassed ? 'completed' : ch.status || 'in-progress') as Chapter['status'] }
            : ch
        )
        return { ...prev, chapters: nextChapters }
      })
    }
  }

  const currentTestModalData = useMemo(() => {
    if (activeTestModal.testType === 'final-test') {
      const finalAttempts = progressDetail?.course_progress?.final_test_attempts || []
      const finalBest = progressDetail?.course_progress?.final_test_score || 0
      return {
        attempts: finalAttempts,
        highestScore: finalBest,
      }
    }
    if (activeTestModal.chapter) {
      const mod = progressDetail?.modules_progress?.find(
        (m: any) =>
          m.module_id === activeTestModal.chapter?.id ||
          String(m.module_id) === String(activeTestModal.chapter?.id) ||
          Number(m.order_index) === Number(activeTestModal.chapter?.order)
      )
      const attempts = mod?.attempts || []
      const highestScore = mod?.challenge_score ?? mod?.post_mini_score ?? 0
      return {
        attempts,
        highestScore,
      }
    }
    return { attempts: [], highestScore: 0 }
  }, [activeTestModal, progressDetail])

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
