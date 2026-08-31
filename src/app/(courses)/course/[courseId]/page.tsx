'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from '@/lib/navigation'
import { Sparkles } from 'lucide-react'
import { CourseNotesTab } from '@/components/course/CourseNotesTab'
import { CourseQnATab } from '@/components/course/CourseQnATab'
import { CourseReviewsTab } from '@/components/course/CourseReviewsTab'
import { CourseOverviewTab } from '@/components/course/CourseOverviewTab'
import { CourseAnnouncementsTab } from '@/components/course/CourseAnnouncementsTab'
import { CourseToolsTab } from '@/components/course/CourseToolsTab'
import { CourseWorkspaceHeader } from '@/components/course/CourseWorkspaceHeader'
import { CourseSidebarContent } from '@/components/course/CourseSidebarContent'
import { CourseSidebarAiChat } from '@/components/course/CourseSidebarAiChat'
import { CourseRatingModal } from '@/components/course/CourseRatingModal'
import { CourseCertificateModal } from '@/components/course/CourseCertificateModal'
import { CourseLoadingState } from '@/components/course/CourseLoadingState'
import { LessonPlayer } from '@/components/course/LessonPlayer'
import { courseService } from '@/services/course.service'
import type { Chapter, Course, Lesson } from '@/types/course'

type BottomTab = 'overview' | 'qna' | 'notes' | 'announcements' | 'reviews' | 'tools'
type SidebarTab = 'content' | 'ai'

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>()
  const courseId = params?.courseId || 'toeic-foundation'
  const navigate = useNavigate()

  const [course, setCourse] = useState<Course | null>(null)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [expandedChapters, setExpandedChapters] = useState<string[]>(['ch-01', 'ch-02'])
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('overview')
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('content')
  const [playerCurrentTime, setPlayerCurrentTime] = useState<number>(0)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [showRatingModal, setShowRatingModal] = useState(false)

  const handleBack = useCallback(() => {
    navigate('/courses')
  }, [navigate])

  useEffect(() => {
    if (!courseId) return
    let isMounted = true

    const fetchCourse = async () => {
      setIsLoading(true)
      try {
        const liveCourseResponse = await courseService.getCourseById(courseId)
        if (isMounted && liveCourseResponse) {
          const raw = liveCourseResponse as unknown as Record<string, unknown>
          const courseObj = (raw.course as Record<string, unknown>) || raw
          const curriculumList =
            (raw.curriculum as Array<Record<string, unknown>>) ||
            (raw.modules as Array<Record<string, unknown>>) ||
            []

          let mappedChapters: Chapter[] = []
          if (Array.isArray(curriculumList) && curriculumList.length > 0) {
            mappedChapters = curriculumList.map((mod, modIdx) => {
              const modLessons = (mod.lessons as Array<Record<string, unknown>>) || []
              const modId = String(mod._id || mod.id || `ch-${modIdx + 1}`)
              const modTitle = String(mod.title || `Chương ${modIdx + 1}`)

              return {
                id: modId,
                courseId: String(courseObj._id || courseObj.id || courseId),
                order: Number(mod.order_index || mod.module_order || modIdx + 1),
                title: modTitle,
                description: String(mod.description || ''),
                status: (modIdx === 0 ? 'in-progress' : 'available') as Chapter['status'],
                lessons: modLessons.map((les, lesIdx) => {
                  const lesId = String(les._id || les.id || `les-${modIdx + 1}-${lesIdx + 1}`)
                  const lesTitle = String(les.title || `Bài ${lesIdx + 1}`)
                  const vidUrl = String(
                    les.video_url ||
                      les.videoUrl ||
                      les.video_link ||
                      les.file_url ||
                      les.url ||
                      ''
                  )
                  const durationSec = Number(
                    les.duration_seconds ||
                      (les.duration_minutes ? Number(les.duration_minutes) * 60 : 600)
                  )

                  return {
                    id: lesId,
                    chapterId: modId,
                    order: Number(les.order_index || les.lesson_order || lesIdx + 1),
                    title: lesTitle,
                    type: 'video' as const,
                    duration: durationSec,
                    status: (lesIdx === 0 && modIdx === 0
                      ? 'in-progress'
                      : 'available') as Lesson['status'],
                    progress: 0,
                    videoUrl: vidUrl,
                    resources: [],
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
                }),
                challengeTest: {
                  id: `ct-${modIdx + 1}`,
                  chapterId: modId,
                  title: `${modTitle} - Mini Test`,
                  questionsCount: 10,
                  passingScore: 70,
                  status: 'available',
                },
                exercise: {
                  id: `ex-${modIdx + 1}`,
                  chapterId: modId,
                  title: `${modTitle} - Thực hành`,
                  questionsCount: 5,
                  skills: ['Vocabulary', 'Grammar'],
                  status: 'available',
                },
                postMiniTest: {
                  id: `pm-${modIdx + 1}`,
                  chapterId: modId,
                  title: `${modTitle} - Assessment`,
                  questionsCount: 15,
                  skills: ['Listening', 'Reading'],
                  difficulty: 'Standard',
                  status: 'available',
                },
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
                  title: 'Kiểm tra trắc nghiệm',
                  questionsCount: 5,
                  passingScore: 70,
                  status: 'available',
                },
                exercise: {
                  id: 'ex-01',
                  chapterId: 'ch-01',
                  title: 'Thực hành',
                  questionsCount: 5,
                  skills: ['Vocabulary'],
                  status: 'available',
                },
                postMiniTest: {
                  id: 'pm-01',
                  chapterId: 'ch-01',
                  title: 'Mini Test',
                  questionsCount: 10,
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
          const parsedCourse: Course = {
            id: String(courseObj._id || courseObj.id || courseId),
            title: String(courseObj.title || 'Khóa học LingoSphere'),
            description: String(courseObj.description || ''),
            level: String(courseObj.level || 'TOEIC'),
            thumbnail: String(courseObj.thumbnail_url || courseObj.thumbnail || ''),
            duration: `${Math.max(
              1,
              Math.round(
                (Number(courseObj.total_duration_minutes) || totalLes * 15 || 60) / 60
              )
            )} giờ`,
            totalChapters: mappedChapters.length,
            totalLessons: totalLes,
            rating: Number(courseObj.rating || courseObj.rating_avg || 4.8),
            ratingCount: Number(courseObj.rating_count || 142),
            studentsCount: Number(
              courseObj.students_count || courseObj.enrollments || 1250
            ),
            chapters: mappedChapters,
            progress: {
              courseId: String(courseObj._id || courseObj.id || courseId),
              startedAt: new Date().toISOString(),
              completedLessons: 0,
              totalLessons: totalLes,
              completedChapters: 0,
              totalChapters: mappedChapters.length,
              baselineScore: null,
              currentChapterIndex: 0,
              currentLessonId: mappedChapters[0]?.lessons[0]?.id || null,
              currentProgress: 0,
            },
            preTest: { status: 'available' },
            finalTest: { status: 'locked' },
            instructor: {
              name: String(
                courseObj.instructor_name ||
                  courseObj.author_name ||
                  'LingoSphere Academic Team'
              ),
              title: 'Chuyên gia đào tạo LingoSphere',
              avatar: String(courseObj.thumbnail_url || ''),
              rating: Number(courseObj.rating || courseObj.rating_avg || 4.8),
              ratingCount: Number(courseObj.rating_count || 142),
              studentsCount: Number(
                courseObj.students_count || courseObj.enrollments || 1250
              ),
              coursesCount: 6,
              bio: String(
                courseObj.description ||
                  'Đội ngũ giảng viên và chuyên gia học thuật giàu kinh nghiệm sư phạm và luyện thi chứng chỉ quốc tế.'
              ),
            },
          }

          setCourse(parsedCourse)
          setExpandedChapters(mappedChapters.map((ch) => ch.id))
          if (mappedChapters[0]?.lessons?.length > 0) {
            setCurrentChapter(mappedChapters[0])
            setCurrentLesson(mappedChapters[0].lessons[0])
          }
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết khóa học:', err)
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

  const handleToggleLessonComplete = (lessonId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setCourse((prev) => {
      if (!prev) return prev
      const updated = { ...prev }
      updated.chapters = updated.chapters.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((l) =>
          l.id === lessonId
            ? {
                ...l,
                status: l.status === 'completed' ? 'available' : 'completed',
                progress: l.status === 'completed' ? 0 : 100,
              }
            : l
        ),
      }))
      return updated
    })
  }

  const handleLessonProgress = (lessonId: string, progress: number) => {
    setCourse((prev) => {
      if (!prev) return prev
      const updated = { ...prev }
      updated.chapters = updated.chapters.map((ch) => ({
        ...ch,
        lessons: ch.lessons.map((l) =>
          l.id === lessonId
            ? {
                ...l,
                progress,
                status:
                  progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : l.status,
              }
            : l
        ),
      }))
      return updated
    })
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

  const handleAddNoteAtTimestamp = useCallback((_seconds: number) => {
    setActiveBottomTab('notes')
  }, [])

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

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <CourseWorkspaceHeader
        courseTitle={course.title}
        onBack={handleBack}
        onOpenRating={() => setShowRatingModal(true)}
        onOpenCertificate={() => setShowCertificateModal(true)}
      />

      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        <div className="flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          <LessonPlayer
            lesson={currentLesson}
            onProgress={handleLessonProgress}
            onTimeUpdate={(t) => setPlayerCurrentTime(t)}
            onNextLesson={handleNextLesson}
            onPrevLesson={handlePrevLesson}
            hasNextLesson={hasNextLesson}
            hasPrevLesson={hasPrevLesson}
            onAddNoteAtTimestamp={handleAddNoteAtTimestamp}
          />

          <div className="p-4 sm:p-8 space-y-6 max-w-5xl">
            <div className="flex items-center gap-6 border-b border-border text-xs sm:text-sm font-bold tracking-wide overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Tổng quan (Overview)' },
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
                { id: 'announcements', label: 'Thông báo' },
                { id: 'reviews', label: 'Đánh giá (Reviews)' },
                { id: 'tools', label: 'Công cụ học tập' },
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

            {activeBottomTab === 'qna' && (
              <CourseQnATab
                qnaList={course.qna || []}
                currentLessonTitle={currentLesson.title}
              />
            )}

            {activeBottomTab === 'notes' && (
              <CourseNotesTab
                notesList={course.notes || []}
                currentLessonId={currentLesson.id}
                currentLessonTitle={currentLesson.title}
                currentTime={playerCurrentTime}
                onSeekTo={() => {}}
              />
            )}

            {activeBottomTab === 'reviews' && (
              <CourseReviewsTab
                reviewsList={course.reviews || []}
                rating={course.rating}
                ratingCount={course.ratingCount}
              />
            )}

            {activeBottomTab === 'announcements' && (
              <CourseAnnouncementsTab announcements={course.announcements} />
            )}

            {activeBottomTab === 'tools' && <CourseToolsTab />}
          </div>
        </div>

        <div className="w-full lg:w-[380px] shrink-0 border-l border-border bg-surface flex flex-col max-h-[calc(100vh-3.5rem)] shadow-lg">
          <div className="flex items-center justify-between border-b border-border bg-surface-subtle/50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-bold">
              <button
                onClick={() => setActiveSidebarTab('content')}
                className={`rounded-lg px-3 py-1.5 transition-all ${
                  activeSidebarTab === 'content'
                    ? 'bg-surface text-primary shadow-sm font-extrabold'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                Nội dung khóa học
              </button>
              <button
                onClick={() => setActiveSidebarTab('ai')}
                className={`rounded-lg px-3 py-1.5 transition-all flex items-center gap-1.5 ${
                  activeSidebarTab === 'ai'
                    ? 'bg-surface text-primary shadow-sm font-extrabold'
                    : 'text-text-secondary hover:text-primary'
                }`}
              >
                <Sparkles size={13} className="text-primary" />
                Trợ lý AI
              </button>
            </div>

            <div className="text-[11px] font-bold text-text-tertiary">
              {completedLessons}/{totalLessons} bài ({progressPercent}%)
            </div>
          </div>

          {activeSidebarTab === 'content' ? (
            <CourseSidebarContent
              chapters={course.chapters}
              currentLesson={currentLesson}
              expandedChapters={expandedChapters}
              onToggleChapter={toggleChapter}
              onSelectLesson={handleSelectLesson}
              onToggleLessonComplete={handleToggleLessonComplete}
            />
          ) : (
            <CourseSidebarAiChat currentLessonTitle={currentLesson.title} />
          )}
        </div>
      </div>

      {showRatingModal && (
        <CourseRatingModal
          onClose={() => setShowRatingModal(false)}
          onSubmit={(_r, _t) => {}}
        />
      )}

      {showCertificateModal && (
        <CourseCertificateModal
          courseTitle={course.title}
          progressPercent={progressPercent}
          completedLessons={completedLessons}
          totalLessons={totalLessons}
          onClose={() => setShowCertificateModal(false)}
        />
      )}
    </div>
  )
}
