'use client'

/**
 * @file page.tsx
 * @description Trang không gian học tập trực tuyến (Course Workspace) cho học viên LingoSphere
 */

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from '@/lib/navigation'
import { Sparkles, PanelRightClose, CheckCircle2 } from 'lucide-react'
import { CourseNotesTab } from '@/components/course/CourseNotesTab'
import { CourseQnATab } from '@/components/course/CourseQnATab'
import { CourseReviewsTab } from '@/components/course/CourseReviewsTab'
import { CourseOverviewTab } from '@/components/course/CourseOverviewTab'
import { CourseWorkspaceHeader } from '@/components/course/CourseWorkspaceHeader'
import { CourseSidebarContent } from '@/components/course/CourseSidebarContent'
import { CourseSidebarAiChat } from '@/components/course/CourseSidebarAiChat'
import { CourseRatingModal } from '@/components/course/CourseRatingModal'
import { CourseTestRunnerModal } from '@/components/course/CourseTestRunnerModal'
import { CourseGrowthChart } from '@/components/course/CourseGrowthChart'
import { CourseLoadingState } from '@/components/course/CourseLoadingState'
import { LessonPlayer } from '@/components/course/LessonPlayer'
import { CourseLockedPlayer } from '@/components/course/CourseLockedPlayer'
import { CourseCheckoutModal } from '@/components/course/CourseCheckoutModal'
import { UpgradeModal } from '@/components/layout/UpgradeModal'
import { courseService } from '@/services/course.service'
import { useAuthStore } from '@/store/auth-store'
import { useCartStore } from '@/store/cart-store'
import { useEnrollmentStore } from '@/store/enrollment-store'
import { toast } from '@/store/toast-store'
import type { Chapter, Course, Lesson, CourseReviewItem, NoteItem, QnAItem } from '@/types/course'

type BottomTab = 'overview' | 'progress' | 'qna' | 'notes' | 'reviews'
type SidebarTab = 'content' | 'ai'

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

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>()
  const courseId = params?.courseId || 'toeic-foundation'
  const navigate = useNavigate()
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
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const [progressDetail, setProgressDetail] = useState<{
    course_progress?: {
      completed_lessons_count?: number
      total_lessons_count?: number
      progress_percentage?: number
      status?: string
      baseline_source?: string
      baseline_score?: number
      is_baseline_established?: boolean
      total_score_growth?: number
      total_growth_percentage?: number
      final_test_score?: number
      growth_chart_data?: Array<{ stage: string; score: number; timestamp: string }>
    }
    modules_progress?: Array<{
      module_id: string
      order_index?: number
      status: string
      challenge_score?: number
      is_passed_by_challenge?: boolean
      post_mini_score?: number
      progression_comparison?: {
        previous_stage: string
        previous_score: number
        current_score: number
        score_diff: number
        percentage_improvement: number
        comparison_note: string
      }
    }>
    completed_lesson_ids?: string[]
  } | null>(null)

  const [activeTestModal, setActiveTestModal] = useState<{
    isOpen: boolean
    chapter: Chapter | null
    testType: 'challenge' | 'exercise' | 'post-mini' | 'final-test'
  }>({
    isOpen: false,
    chapter: null,
    testType: 'post-mini',
  })

  const handleBack = useCallback(() => {
    navigate('/courses')
  }, [navigate])

  useEffect(() => {
    if (!courseId) return
    let isMounted = true

    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const [liveCourseResponse, enrollStatus] = await Promise.all([
          courseService.getCourseById(courseId),
          courseService.getEnrollmentStatus(courseId).catch(() => ({ is_enrolled: false })),
        ])

        const userIsEnrolled = Boolean(enrollStatus?.is_enrolled || user?.is_premium || user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR')
        if (isMounted) {
          setIsEnrolled(userIsEnrolled)
          if (userIsEnrolled) {
            useEnrollmentStore.getState().addEnrolledCourse(courseId)
            console.log('%c🔓 [LingoSphere] ĐÃ MUA KHÓA HỌC: Mở khóa trình phát Video bài giảng & Tiến độ học tập', 'color: #10b981; font-weight: bold;')
          } else {
            console.log('%c🔒 [LingoSphere] CHƯA MUA KHÓA HỌC: Khóa video -> KHÔNG tải media/video/tiến độ bài học', 'color: #f59e0b; font-weight: bold;')
          }
        }

        if (isMounted && liveCourseResponse) {
          const raw = liveCourseResponse as unknown as Record<string, unknown>
          const courseObj = (raw.course as Record<string, unknown>) || raw
          const curriculumList =
            (raw.curriculum as Array<Record<string, unknown>>) ||
            (raw.modules as Array<Record<string, unknown>>) ||
            []

          // Only fetch user's saved lesson progress if user is enrolled
          let completedLessonIdSet = new Set<string>()
          let progressDataResult: any = null
          if (userIsEnrolled) {
            try {
              const progressData = await courseService.getCourseProgressDetail(
                String(courseObj._id || courseObj.id || courseId)
              )
              if (progressData) {
                progressDataResult = progressData
                setProgressDetail(progressData)
                if (Array.isArray(progressData.completed_lesson_ids)) {
                  completedLessonIdSet = new Set(progressData.completed_lesson_ids)
                }
              }
            } catch {
              // Not authenticated or no progress record yet
            }
          }

          let mappedChapters: Chapter[] = []
          if (Array.isArray(curriculumList) && curriculumList.length > 0) {
            mappedChapters = curriculumList.map((mod, modIdx) => {
              const modLessons = (mod.lessons as Array<Record<string, unknown>>) || []
              const modId = String(mod._id || mod.id || `ch-${modIdx + 1}`)
              const modTitle = String(mod.title || `Chương ${modIdx + 1}`)
              const modOrder = Number(mod.order_index || mod.module_order || modIdx + 1)

              const challengeQs = Array.isArray(mod.challenge_questions)
                ? (mod.challenge_questions as Array<Record<string, unknown>>)
                : []
              const postMiniQs = Array.isArray(mod.post_mini_questions)
                ? (mod.post_mini_questions as Array<Record<string, unknown>>)
                : []
              const testQs = Array.isArray(mod.test_questions)
                ? (mod.test_questions as Array<Record<string, unknown>>)
                : []

              let chStatus: Chapter['status'] = (modIdx === 0 ? 'in-progress' : 'available') as Chapter['status']
              if (progressDataResult && Array.isArray(progressDataResult.modules_progress)) {
                const foundMod = progressDataResult.modules_progress.find(
                  (m: any) => m.module_id === modId || m.order_index === modOrder
                )
                if (foundMod) {
                  if (foundMod.status === 'COMPLETED' || foundMod.status === 'SKIPPED_BY_CHALLENGE') {
                    chStatus = 'completed'
                  } else if (foundMod.status === 'IN_PROGRESS') {
                    chStatus = 'in-progress'
                  } else if (foundMod.status === 'LOCKED') {
                    chStatus = 'locked'
                  }
                }
              }

              const lessonsList: Lesson[] = modLessons.map((les, lesIdx) => {
                const lesId = String(les._id || les.id || `les-${modIdx + 1}-${lesIdx + 1}`)
                const lesTitle = String(les.title || `Bài ${lesIdx + 1}`)
                // Only provide videoUrl if user is enrolled to prevent unwanted media preloading
                const vidUrl = userIsEnrolled
                  ? String(
                      les.video_url ||
                        les.videoUrl ||
                        les.video_link ||
                        les.file_url ||
                        les.url ||
                        ''
                    )
                  : ''
                const durationSec = Number(
                  les.duration_seconds ||
                    (les.duration_minutes ? Number(les.duration_minutes) * 60 : 600)
                )

                const isAlreadyCompleted = completedLessonIdSet.has(lesId)

                return {
                  id: lesId,
                  chapterId: modId,
                  order: Number(les.order_index || les.lesson_order || lesIdx + 1),
                  title: lesTitle,
                  type: 'video' as const,
                  duration: durationSec,
                  status: (isAlreadyCompleted
                    ? 'completed'
                    : lesIdx === 0 && modIdx === 0
                    ? 'in-progress'
                    : 'available') as Lesson['status'],
                  progress: isAlreadyCompleted ? 100 : 0,
                  videoUrl: vidUrl,
                  resources: Array.isArray(les.resources)
                    ? (les.resources as Array<{ id: string; title: string; url: string; size: string }>)
                    : [],
                  content: {
                    videoUrl: vidUrl,
                    sections: [
                      {
                        id: '1',
                        title: 'Giới thiệu & Mục tiêu bài học',
                        type: 'introduction',
                        content: String(
                          les.content || 'Nắm vững kiến thức trọng tâm của bài học.'
                        ),
                      },
                    ],
                  },
                }
              })

              return {
                id: modId,
                courseId: String(courseObj._id || courseObj.id || courseId),
                order: modOrder,
                title: modTitle,
                description: String(mod.description || ''),
                status: chStatus,
                lessons: lessonsList,
                challenge_questions: challengeQs,
                post_mini_questions: postMiniQs,
                test_questions: testQs,
                challengeTest:
                  challengeQs.length > 0
                    ? {
                        id: `ct-${modIdx + 1}`,
                        chapterId: modId,
                        title: `${modTitle} - Bài kiểm tra thử thách`,
                        questionsCount: challengeQs.length,
                        passingScore:
                          typeof mod.challenge_passing_score === 'number'
                            ? mod.challenge_passing_score
                            : 80,
                        status: 'available',
                      }
                    : undefined,
                exercise:
                  testQs.length > 0
                    ? {
                        id: `ex-${modIdx + 1}`,
                        chapterId: modId,
                        title: `${modTitle} - Thực hành`,
                        questionsCount: testQs.length,
                        skills: ['Vocabulary', 'Grammar'],
                        status: 'available',
                      }
                    : undefined,
                postMiniTest:
                  postMiniQs.length > 0
                    ? {
                        id: `pm-${modIdx + 1}`,
                        chapterId: modId,
                        title: `${modTitle} - Bài kiểm tra cuối chương`,
                        questionsCount: postMiniQs.length,
                        skills: ['Listening', 'Reading'],
                        difficulty: 'Standard',
                        status: 'available',
                      }
                    : undefined,
              }
            })
          }

          if (mappedChapters.length === 0) {
            mappedChapters = [
              {
                id: 'ch-01',
                courseId: String(courseObj._id || courseObj.id || courseId),
                order: 1,
                title: 'Chương 1: Tổng quan bài giảng',
                description: String(
                  courseObj.description || 'Nắm vững kiến thức trọng tâm của khóa học.'
                ),
                status: 'in-progress' as Chapter['status'],
                lessons: [
                  {
                    id: 'les-01-01',
                    chapterId: 'ch-01',
                    order: 1,
                    title: `Bài 1: Giới thiệu ${String(courseObj.title || 'khóa học')}`,
                    type: 'video' as const,
                    duration: 600,
                    status: 'in-progress' as Lesson['status'],
                    progress: 0,
                    videoUrl: String(courseObj.video_url || courseObj.intro_video_url || ''),
                    resources: [],
                    content: {
                      videoUrl: String(
                        courseObj.video_url || courseObj.intro_video_url || ''
                      ),
                      sections: [
                        {
                          id: '1',
                          title: 'Giới thiệu & Mục tiêu bài học',
                          type: 'introduction',
                          content: String(courseObj.description || 'Tổng quan bài giảng'),
                        },
                      ],
                    },
                  },
                ],
                challengeTest: {
                  id: 'ct-01',
                  chapterId: 'ch-01',
                  title: 'Kiểm tra trắc nghiệm đầu chương',
                  questionsCount: 5,
                  passingScore: 80,
                  status: 'available',
                },
                exercise: {
                  id: 'ex-01',
                  chapterId: 'ch-01',
                  title: 'Thực hành trắc nghiệm',
                  questionsCount: 5,
                  skills: ['Vocabulary'],
                  status: 'available',
                },
                postMiniTest: {
                  id: 'pm-01',
                  chapterId: 'ch-01',
                  title: 'Bài kiểm tra cuối chương',
                  questionsCount: 5,
                  skills: ['Listening', 'Reading'],
                  difficulty: 'Standard',
                  status: 'available',
                },
              },
            ]
          }

          const totalLes = mappedChapters.reduce(
            (acc, ch) => acc + (ch.lessons?.length || 0),
            0
          )

          // Calculate real total duration accurately in hours, minutes, seconds
          const totalDurationSec = mappedChapters.reduce(
            (acc, ch) =>
              acc +
              ch.lessons.reduce((lAcc, l) => lAcc + (Number(l.duration) || 0), 0),
            0
          )
          const realDuration = formatExactDuration(totalDurationSec)

          const realRating =
            typeof courseObj.rating === 'number'
              ? courseObj.rating
              : 5.0

          const realRatingCount =
            typeof courseObj.rating_count === 'number'
              ? courseObj.rating_count
              : typeof courseObj.ratingCount === 'number'
              ? courseObj.ratingCount
              : Array.isArray(courseObj.reviews)
              ? courseObj.reviews.length
              : 0

          const realStudentsCount =
            typeof courseObj.students_count === 'number'
              ? courseObj.students_count
              : typeof courseObj.studentsCount === 'number'
              ? courseObj.studentsCount
              : 0

          const dynamicObjectives =
            Array.isArray(courseObj.what_you_will_learn) &&
            courseObj.what_you_will_learn.length > 0
              ? (courseObj.what_you_will_learn as string[])
              : Array.isArray(courseObj.whatYouWillLearn) &&
                courseObj.whatYouWillLearn.length > 0
              ? (courseObj.whatYouWillLearn as string[])
              : [
                  `Làm chủ toàn bộ kiến thức trọng tâm qua ${mappedChapters.length} chương học bài bản.`,
                  `Thực hành và củng cố kỹ năng thông qua ${totalLes} bài học video chuyên sâu.`,
                  `Hệ thống bài kiểm tra đánh giá sát sao mức độ tiếp thu từng chương.`,
                  `Nâng cao phản xạ ngôn ngữ hướng tới mục tiêu điểm số TOEIC ${
                    courseObj.target_score || 500
                  }+.`,
                ]

          // Fetch real reviews from DB (notes and QnA only fetched if user is enrolled)
          const [reviewsRes, notesRes, qnaRes] = await Promise.all([
            courseService.getCourseReviews(courseId).catch(() => null),
            userIsEnrolled && isAuthenticated
              ? courseService.getCourseNotes(courseId).catch(() => [])
              : Promise.resolve([]),
            userIsEnrolled
              ? courseService.getCourseQnA(courseId).catch(() => [])
              : Promise.resolve([]),
          ])

          const mappedReviews: CourseReviewItem[] = (reviewsRes?.reviews || []).map((r) => ({
            id: String(r._id || Math.random()),
            author: String(r.user_name || 'Học viên'),
            authorAvatar: r.user_avatar || '',
            rating: Number(r.rating) || 5,
            date: r.created_at ? new Date(r.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
            content: String(r.content || ''),
          }))

          const mappedNotes: NoteItem[] = (Array.isArray(notesRes) ? notesRes : []).map((n) => ({
            id: String(n._id || Math.random()),
            lessonId: String(n.lesson_id || ''),
            lessonTitle: String(n.lesson_title || ''),
            timestamp: Number(n.timestamp) || 0,
            formattedTime: String(n.formatted_time || '00:00'),
            content: String(n.content || ''),
            createdAt: n.created_at ? new Date(n.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
          }))

          const mappedQnA: QnAItem[] = (Array.isArray(qnaRes) ? qnaRes : []).map((q) => ({
            id: String(q._id || Math.random()),
            lessonTitle: String(q.lesson_title || 'Bài học'),
            author: String(q.author_name || 'Học viên'),
            title: String(q.title || ''),
            body: String(q.body || ''),
            createdAt: q.created_at ? new Date(q.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
            upvotes: Number(q.upvotes) || 0,
            answersCount: Array.isArray(q.answers) ? q.answers.length : 0,
            isAnswered: Boolean(q.is_answered || (q.answers && q.answers.length > 0)),
            answers: (q.answers || []).map((a) => ({
              id: String(a.id || Math.random()),
              author: String(a.author || 'Thành viên'),
              authorRole: a.author_role,
              authorAvatar: a.author_avatar,
              body: String(a.body || ''),
              createdAt: a.created_at ? new Date(a.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
              upvotes: Number(a.upvotes) || 0,
            })),
          }))

          const finalRating = typeof reviewsRes?.rating === 'number' ? reviewsRes.rating : realRating
          const finalRatingCount = typeof reviewsRes?.rating_count === 'number' ? reviewsRes.rating_count : realRatingCount

          const structuredCourse: Course = {
            id: String(courseObj._id || courseObj.id || courseId),
            title: String(courseObj.title || 'Khóa học LingoSphere'),
            level: String(courseObj.level || 'Intermediate'),
            description: String(courseObj.description || ''),
            duration: realDuration,
            totalChapters: mappedChapters.length,
            totalLessons: totalLes,
            rating: finalRating,
            ratingCount: finalRatingCount,
            studentsCount: realStudentsCount,
            whatYouWillLearn: dynamicObjectives,
            chapters: mappedChapters,
            instructor: {
              name: String(
                courseObj.author_name ||
                  (courseObj.instructor as Record<string, unknown>)?.name ||
                  'Đội ngũ Giảng viên LingoSphere'
              ),
              title: String(
                courseObj.author_title ||
                  (courseObj.instructor as Record<string, unknown>)?.title ||
                  'Giảng viên chuyên môn'
              ),
              avatar: String(
                courseObj.author_avatar ||
                  (courseObj.instructor as Record<string, unknown>)?.avatar ||
                  ''
              ),
              rating: finalRating,
              studentsCount: realStudentsCount,
              coursesCount: 1,
              bio: String(
                courseObj.author_bio ||
                  (courseObj.instructor as Record<string, unknown>)?.bio ||
                  'Chuyên gia giảng dạy ngôn ngữ giàu kinh nghiệm thực chiến tại LingoSphere.'
              ),
            },
            overview: {
              whatYouWillLearn: dynamicObjectives,
              requirements: ['Có máy tính hoặc điện thoại kết nối internet.'],
              targetAudience: ['Học viên muốn nâng cao trình độ nhanh chóng và bài bản.'],
            },
            reviews: mappedReviews,
            qna: mappedQnA,
            notes: mappedNotes,
            final_test_questions: (courseObj.final_test_questions as Array<Record<string, unknown>>) || [],
            finalTest: { status: userIsEnrolled ? 'available' : 'locked' },
          }

          setCourse(structuredCourse)
          setCurrentChapter(mappedChapters[0])
          setCurrentLesson(mappedChapters[0]?.lessons[0] || null)
          setExpandedChapters(mappedChapters.map((ch) => ch.id))
        }
      } catch {
        // Handle error gracefully
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchCourse()
    return () => {
      isMounted = false
    }
  }, [courseId])

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId]
    )
  }

  const handleSelectLesson = (chapter: Chapter, lesson: Lesson) => {
    setCurrentChapter(chapter)
    setCurrentLesson(lesson)
  }

  // Student manual click on checkbox to toggle lesson completion
  const handleToggleLessonComplete = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!course) return

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
      toast.success(
        'Đã lưu tiến độ hoàn thành bài học vào hệ thống!',
        'Hoàn thành bài học'
      )
    } else {
      toast.info('Đã hủy hoàn thành bài học', 'Cập nhật tiến độ')
    }
  }

  // Auto-complete lesson when watched > 80% video duration
  const handleLessonProgress = (lessonId: string, progress: number) => {
    if (!course) return
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

      toast.success(
        'Bạn đã theo dõi hơn 80% bài giảng! Hệ thống đã tự động đánh dấu hoàn thành.',
        'Đã hoàn thành bài học'
      )
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
    return allFlatLessons.findIndex(
      (item: { chapter: Chapter; lesson: Lesson }) => item.lesson.id === currentLesson.id
    )
  }, [allFlatLessons, currentLesson?.id])

  const hasNextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < allFlatLessons.length - 1
  const hasPrevLesson = currentLessonIndex > 0

  const handleNextLesson = useCallback(() => {
    if (hasNextLesson) {
      const nextItem = allFlatLessons[currentLessonIndex + 1]
      setCurrentChapter(nextItem.chapter)
      setCurrentLesson(nextItem.lesson)
      if (!expandedChapters.includes(nextItem.chapter.id)) {
        setExpandedChapters((prev) => [...prev, nextItem.chapter.id])
      }
    }
  }, [hasNextLesson, allFlatLessons, currentLessonIndex, expandedChapters])

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

  // Dynamically update lesson duration & total course duration in exact hours/minutes/seconds
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
        (acc, ch) =>
          acc +
          ch.lessons.reduce((lAcc, l) => lAcc + (Number(l.duration) || 0), 0),
        0
      )

      return {
        ...prev,
        chapters: updatedChapters,
        duration: formatExactDuration(newTotalSec),
      }
    })
  }, [])

  // Handle Add Note from player or tab
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

  // Handle Q&A
  const handleCreateQnA = async (title: string, body: string) => {
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
      const res = (await courseService.createCourseQnA(String(course.id), {
        lesson_id: currentLesson.id,
        lesson_title: currentLesson.title,
        title,
        body,
      })) as Record<string, unknown>

      const newQnA: QnAItem = {
        id: String(res?._id || `qna-${Date.now()}`),
        lessonTitle: currentLesson.title,
        author: 'Bạn (Học viên)',
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
      toast.success('Câu hỏi của bạn đã được đăng thành công!', 'Hỏi & Đáp')
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
      await courseService.addQnAAnswer(qnaId, { body: answerText })
      const newAns = {
        id: `ans-${Date.now()}`,
        author: 'Bạn (Học viên)',
        authorRole: 'Học viên',
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

  // Handle Review
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
      navigate('/cart')
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

  const handleTestComplete = async (score: number, isPassed: boolean, resultData?: unknown) => {
    if (course?.id) {
      try {
        const updatedProgress = await courseService.getCourseProgressDetail(String(course.id))
        if (updatedProgress) {
          setProgressDetail(updatedProgress)
          if (Array.isArray(updatedProgress.modules_progress)) {
            const modStatusMap = new Map(
              updatedProgress.modules_progress.map((m: any) => [m.module_id, m.status])
            )
            const modOrderMap = new Map(
              updatedProgress.modules_progress.map((m: any) => [m.order_index, m.status])
            )
            setCourse((prev) => {
              if (!prev) return null
              const nextChapters = prev.chapters.map((ch, idx) => {
                const foundStatus = modStatusMap.get(ch.id) || modOrderMap.get(ch.order || idx + 1)
                let chStatus: Chapter['status'] = ch.status
                if (foundStatus === 'COMPLETED' || foundStatus === 'SKIPPED_BY_CHALLENGE') {
                  chStatus = 'completed'
                } else if (foundStatus === 'IN_PROGRESS') {
                  chStatus = 'in-progress'
                } else if (foundStatus === 'LOCKED') {
                  chStatus = 'locked'
                }
                return { ...ch, status: chStatus }
              })
              return { ...prev, chapters: nextChapters }
            })
          }
        }
      } catch (err) {
        console.warn('Error refreshing progress after test:', err)
      }
    }

    if (isPassed) {
      toast.success(
        `Chúc mừng! Bạn đã hoàn thành bài kiểm tra với điểm số ${score}%`,
        'Vượt qua bài kiểm tra'
      )
    }
  }

  if (isLoading || !course || !currentLesson) {
    return <CourseLoadingState onBack={handleBack} />
  }

  const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
  const completedLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.status === 'completed').length,
    0
  )
  const progressPercent = Math.round(
    (completedLessons / Math.max(totalLessons, 1)) * 100
  )

  // Handle Review submission directly to MongoDB
  const handleRatingSubmit = async (ratingScore: number, reviewText: string) => {
    if (!course) return
    const res = await courseService.createCourseReview(String(course.id), {
      rating: ratingScore,
      content: reviewText,
    }).catch(() => null)

    const updatedRating = typeof res?.rating === 'number' ? res.rating : ratingScore
    const updatedCount = typeof res?.rating_count === 'number' ? res.rating_count : (course.ratingCount || 0) + 1

    const newReview: CourseReviewItem = {
      id: String((res?.review as Record<string, unknown>)?._id || `rev-${Date.now()}`),
      author: 'Bạn (Học viên)',
      authorAvatar: '',
      rating: ratingScore,
      date: 'Vừa xong',
      content: reviewText || 'Khóa học rất hữu ích và chất lượng!',
    }

    setCourse((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        rating: updatedRating,
        ratingCount: updatedCount,
        reviews: [newReview, ...(prev.reviews || []).filter((r) => r.author !== 'Bạn (Học viên)')],
      }
    })

    toast.success(
      `Cảm ơn bạn đã đánh giá ${ratingScore} sao! Đánh giá đã được lưu vào hệ thống.`,
      'Đánh giá thành công'
    )
  }

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col antialiased">
      <CourseWorkspaceHeader
        courseTitle={course.title}
        onBack={handleBack}
        onOpenRating={() => setShowRatingModal(true)}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />

      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-3.5rem)] transition-all duration-300">
          {isEnrolled ? (
            <LessonPlayer
              lesson={currentLesson}
              onProgress={handleLessonProgress}
              onTimeUpdate={(t) => setPlayerCurrentTime(t)}
              onNextLesson={handleNextLesson}
              onPrevLesson={handlePrevLesson}
              hasNextLesson={hasNextLesson}
              hasPrevLesson={hasPrevLesson}
              onAddNoteAtTimestamp={handleAddNoteAtTimestamp}
              onDurationChange={handleLessonDurationChange}
            />
          ) : (
            <CourseLockedPlayer
              course={course}
              currentLesson={currentLesson}
              isAuthenticated={isAuthenticated}
              isAlreadyInCart={isInCart(course.id)}
              isAddingToCart={isAddingToCart}
              onBuyNow={() => setShowCourseCheckoutModal(true)}
              onAddToCart={handleAddToCart}
              onGoToCart={() => navigate('/cart')}
              onOpenUpgrade={() => setShowUpgradeModal(true)}
              onOpenAuth={() => window.dispatchEvent(new CustomEvent('lingosphere:open-auth-modal'))}
            />
          )}

          <div className="p-4 sm:p-8 space-y-6 max-w-5xl">
            {/* Baseline Notice Banner */}
            {isEnrolled && progressDetail && !progressDetail.course_progress?.is_baseline_established && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🎯</span>
                  <div className="text-xs">
                    <p className="font-extrabold text-sm text-amber-900 dark:text-amber-100">
                      Thiết lập mốc năng lực ban đầu (Baseline)
                    </p>
                    <p className="text-amber-800/90 dark:text-amber-200/80 mt-0.5">
                      Bạn chưa có điểm mốc Baseline để so sánh mức độ cải thiện. Hệ thống sẽ tự động lấy kết quả Post-mini Test của Chương 1 làm mốc ban đầu, hoặc bạn có thể cập nhật trong Hồ sơ cá nhân!
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-6 border-b border-border text-xs sm:text-sm font-bold tracking-wide overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Tổng quan (Overview)' },
                { id: 'progress', label: 'Tiến độ & Tăng trưởng' },
                {
                  id: 'qna',
                  label: `Hỏi & Đáp (Q&A) ${
                    course.qna?.length ? `(${course.qna.length})` : ''
                  }`,
                },
                {
                  id: 'notes',
                  label: `Ghi chú (Notes) ${
                    course.notes?.length ? `(${course.notes.length})` : ''
                  }`,
                },
                { id: 'reviews', label: 'Đánh giá (Reviews)' },
              ].map((tab) => {
                const isActive = activeBottomTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveBottomTab(tab.id as BottomTab)}
                    className={`pb-3 transition-all whitespace-nowrap relative cursor-pointer ${
                      isActive
                        ? 'text-primary border-b-2 border-primary font-extrabold'
                        : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {activeBottomTab === 'overview' && <CourseOverviewTab course={course} />}

            {activeBottomTab === 'progress' && (
              <div className="space-y-6">
                <CourseGrowthChart
                  growthData={progressDetail?.course_progress?.growth_chart_data}
                  baselineScore={progressDetail?.course_progress?.baseline_score}
                  baselineSource={progressDetail?.course_progress?.baseline_source}
                  isBaselineEstablished={progressDetail?.course_progress?.is_baseline_established}
                  totalScoreGrowth={progressDetail?.course_progress?.total_score_growth}
                  totalGrowthPercentage={progressDetail?.course_progress?.total_growth_percentage}
                  finalTestScore={progressDetail?.course_progress?.final_test_score}
                />
              </div>
            )}

            {activeBottomTab === 'qna' && (
              <CourseQnATab
                qnaList={course.qna || []}
                currentLessonTitle={currentLesson.title}
                isEnrolled={isEnrolled}
                isAuthenticated={isAuthenticated}
                onCreateQuestion={handleCreateQnA}
                onAddAnswer={handleAddQnAAnswer}
                onUpvote={handleUpvoteQnA}
              />
            )}

            {activeBottomTab === 'notes' && (
              <CourseNotesTab
                notesList={course.notes || []}
                currentLessonId={currentLesson.id}
                currentLessonTitle={currentLesson.title}
                currentTime={playerCurrentTime}
                isEnrolled={isEnrolled}
                isAuthenticated={isAuthenticated}
                onSeekTo={() => {}}
                onAddNote={(content, timestamp, formatted) =>
                  handleAddNoteAtTimestamp(timestamp, content)
                }
                onDeleteNote={handleDeleteNote}
              />
            )}

            {activeBottomTab === 'reviews' && (
              <CourseReviewsTab
                reviewsList={course.reviews || []}
                rating={course.rating}
                ratingCount={course.ratingCount}
                isEnrolled={isEnrolled}
                isAuthenticated={isAuthenticated}
                onAddReview={handleAddReview}
              />
            )}
          </div>
        </div>

        {/* Right Sidebar (Collapsible) */}
        {isSidebarOpen && (
          <div className="w-full lg:w-[420px] xl:w-[440px] shrink-0 border-l border-border bg-surface flex flex-col max-h-[calc(100vh-3.5rem)] shadow-xl animate-in slide-in-from-right-4 duration-200">
            <div className="border-b border-border bg-surface-subtle/40 px-4 py-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-border/80 shadow-xs">
                  <button
                    onClick={() => setActiveSidebarTab('content')}
                    className={`rounded-lg px-3 py-1.5 text-xs transition-all cursor-pointer ${
                      activeSidebarTab === 'content'
                        ? 'bg-primary text-white shadow-xs font-bold'
                        : 'text-text-secondary hover:text-text-primary font-medium'
                    }`}
                  >
                    Nội dung khóa học
                  </button>
                  <button
                    onClick={() => setActiveSidebarTab('ai')}
                    className={`rounded-lg px-3 py-1.5 text-xs transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeSidebarTab === 'ai'
                        ? 'bg-purple-600 text-white shadow-xs font-bold'
                        : 'text-text-secondary hover:text-text-primary font-medium'
                    }`}
                  >
                    <Sparkles size={13} />
                    <span>Trợ lý AI</span>
                  </button>
                </div>

                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
                  title="Đóng thanh bên"
                >
                  <PanelRightClose size={16} />
                </button>
              </div>

              {/* Progress Summary Pill */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <span className="text-[11px] font-bold text-text-secondary">Tiến độ bài học</span>
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
                  <CheckCircle2 size={12} />
                  <span>{completedLessons}/{totalLessons} bài ({progressPercent}%)</span>
                </div>
              </div>
            </div>

            {activeSidebarTab === 'content' ? (
              <CourseSidebarContent
                chapters={course.chapters}
                currentLesson={currentLesson}
                expandedChapters={expandedChapters}
                isEnrolled={isEnrolled}
                modulesProgress={progressDetail?.modules_progress}
                finalTestQuestionsCount={course.final_test_questions?.length || 0}
                onToggleChapter={toggleChapter}
                onSelectLesson={handleSelectLesson}
                onToggleLessonComplete={handleToggleLessonComplete}
                onTakeTest={handleTakeTest}
              />
            ) : (
              <CourseSidebarAiChat currentLessonTitle={currentLesson.title} />
            )}
          </div>
        )}
      </div>

      {/* Course Rating Modal */}
      {showRatingModal && (
        <CourseRatingModal
          courseTitle={course.title}
          onClose={() => setShowRatingModal(false)}
          onSubmit={handleRatingSubmit}
        />
      )}

      {/* Chapter & Final Test Runner Modal */}
      {activeTestModal.isOpen && (
        <CourseTestRunnerModal
          isOpen={activeTestModal.isOpen}
          courseId={String(course.id)}
          chapter={activeTestModal.chapter}
          testType={activeTestModal.testType}
          finalTestQuestions={course.final_test_questions as any}
          onClose={() => setActiveTestModal({ isOpen: false, chapter: null, testType: 'post-mini' })}
          onComplete={handleTestComplete}
        />
      )}

      {/* Premium Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeModal
          open={showUpgradeModal}
          onOpenChange={setShowUpgradeModal}
        />
      )}

      {/* VietQR Bank Transfer Course Checkout Modal */}
      {showCourseCheckoutModal && course && (
        <CourseCheckoutModal
          open={showCourseCheckoutModal}
          onOpenChange={setShowCourseCheckoutModal}
          courses={[
            {
              id: course.id,
              title: course.title,
              price: course.price || 0,
              thumbnail: course.thumbnail,
            },
          ]}
          onSuccess={() => {
            setIsEnrolled(true)
            useEnrollmentStore.getState().addEnrolledCourse(course.id)
            toast.success('Mở khóa khóa học thành công! Chúc bạn học tốt!', 'Đã mở khóa')
          }}
        />
      )}
    </div>
  )
}
