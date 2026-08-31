'use client'

import { CourseNotesTab } from '@/components/course/CourseNotesTab'
import { CourseQnATab } from '@/components/course/CourseQnATab'
import { CourseReviewsTab } from '@/components/course/CourseReviewsTab'
import { LessonPlayer } from '@/components/course/LessonPlayer'
import { Button } from '@/components/ui/button'
import { demoCourse } from '@/data/course-data'
import { courseService } from '@/services/course.service'
import type { Chapter, Course, Lesson } from '@/types/course'
import {
  ArrowLeft,
  Award,
  Bot,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Download,
  FolderDown,
  Globe,
  MoreVertical,
  PlayCircle,
  Send,
  Share2,
  Sparkles,
  Star,
  Trophy,
  Users,
  X
} from 'lucide-react'
import { useEffect, useState, useMemo, useCallback } from 'react'

interface CourseDetailPageProps {
  courseId?: string
  onBack: () => void
}

type BottomTab = 'overview' | 'qna' | 'notes' | 'announcements' | 'reviews' | 'tools'
type SidebarTab = 'content' | 'ai'

export function CourseDetailPage({ courseId, onBack }: CourseDetailPageProps) {
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
  const [userRating, setUserRating] = useState(5)
  const [activeResourceDropdown, setActiveResourceDropdown] = useState<string | null>(null)

  // AI Assistant in Sidebar
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Xin chào! Tôi là Trợ lý AI LingoSphere. Bạn có thắc mắc gì về bài học không? Hãy gửi câu hỏi cho tôi nhé!',
      time: 'Vừa xong',
    },
  ])
  const [aiInputMessage, setAiInputMessage] = useState('')

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
          const curriculumList = (raw.curriculum as Array<Record<string, unknown>>) || (raw.modules as Array<Record<string, unknown>>) || []

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
                    les.duration_seconds || (les.duration_minutes ? Number(les.duration_minutes) * 60 : 600)
                  )

                  return {
                    id: lesId,
                    chapterId: modId,
                    order: Number(les.order_index || les.lesson_order || lesIdx + 1),
                    title: lesTitle,
                    type: 'video' as const,
                    duration: durationSec,
                    status: (lesIdx === 0 && modIdx === 0 ? 'in-progress' : 'available') as Lesson['status'],
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
                          content: String(les.content || 'Nắm vững kiến thức trọng tâm của bài học.'),
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
                description: String(courseObj.description || 'Nắm vững kiến thức trọng tâm của khóa học.'),
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
                      videoUrl: String(courseObj.video_url || courseObj.intro_video_url || ''),
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

          const totalLes = mappedChapters.reduce((acc, ch) => acc + (ch.lessons?.length || 0), 0)
          const parsedCourse: Course = {
            id: String(courseObj._id || courseObj.id || courseId),
            title: String(courseObj.title || 'Khóa học LingoSphere'),
            description: String(courseObj.description || ''),
            level: String(courseObj.level || 'TOEIC'),
            thumbnail: String(courseObj.thumbnail_url || courseObj.thumbnail || ''),
            duration: `${Math.max(1, Math.round((Number(courseObj.total_duration_minutes) || totalLes * 15 || 60) / 60))} giờ`,
            totalChapters: mappedChapters.length,
            totalLessons: totalLes,
            rating: Number(courseObj.rating || courseObj.rating_avg || 4.8),
            ratingCount: Number(courseObj.rating_count || 142),
            studentsCount: Number(courseObj.students_count || courseObj.enrollments || 1250),
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
              name: String(courseObj.instructor_name || courseObj.author_name || 'LingoSphere Academic Team'),
              title: 'Chuyên gia đào tạo LingoSphere',
              avatar: String(courseObj.thumbnail_url || ''),
              rating: Number(courseObj.rating || courseObj.rating_avg || 4.8),
              ratingCount: Number(courseObj.rating_count || 142),
              studentsCount: Number(courseObj.students_count || courseObj.enrollments || 1250),
              coursesCount: 6,
              bio: String(courseObj.description || 'Đội ngũ giảng viên và chuyên gia học thuật giàu kinh nghiệm sư phạm và luyện thi chứng chỉ quốc tế.'),
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
            ? { ...l, status: l.status === 'completed' ? 'available' : 'completed', progress: l.status === 'completed' ? 0 : 100 }
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
                status: progress >= 100 ? 'completed' : progress > 0 ? 'in-progress' : l.status,
              }
            : l
        ),
      }))
      return updated
    })
  }

  const handleSendAiMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!aiInputMessage.trim() || !currentLesson) return

    const userText = aiInputMessage
    setAiChatMessages((prev) => [
      ...prev,
      { sender: 'user', text: userText, time: 'Vừa xong' },
    ])
    setAiInputMessage('')

    setTimeout(() => {
      setAiChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Dựa trên bài học "${currentLesson.title}", điểm cốt lõi là bạn cần xác định từ khóa ngữ cảnh trước, sau đó áp dụng quy tắc đơn giản hóa. Bạn có muốn làm 1 câu hỏi bài tập trắc nghiệm mini để kiểm tra kiến thức này không?`,
          time: 'Vừa xong',
        },
      ])
    }, 700)
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
    return allFlatLessons.findIndex((item: { chapter: Chapter; lesson: Lesson }) => item.lesson.id === currentLesson.id)
  }, [allFlatLessons, currentLesson?.id])

  const hasNextLesson = currentLessonIndex >= 0 && currentLessonIndex < allFlatLessons.length - 1
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
    return (
      <div className="min-h-screen bg-background text-text-primary flex flex-col">
        <header className="flex h-14 w-full items-center justify-between bg-[#1c1d1f] px-4 sm:px-6 text-white border-b border-white/10 shadow-md">
          <button
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            title="Quay lại danh sách khóa học"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="h-4 w-48 bg-white/20 rounded-md animate-pulse" />
          <div className="w-16" />
        </header>

        <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
          <div className="flex-1 flex flex-col bg-black">
            <div className="aspect-video w-full max-h-[70vh] bg-slate-950 flex flex-col items-center justify-center gap-3 text-white/60">
              <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-semibold text-white/80 animate-pulse">Đang tải nội dung bài giảng...</p>
            </div>
            <div className="p-6 space-y-4 max-w-5xl">
              <div className="h-8 w-1/3 bg-surface-subtle rounded-xl animate-pulse" />
              <div className="h-24 w-full bg-surface-subtle rounded-2xl animate-pulse" />
            </div>
          </div>
          <div className="w-full lg:w-96 border-l border-border bg-surface p-4 space-y-3 hidden lg:block">
            <div className="h-6 w-1/2 bg-surface-subtle rounded-md animate-pulse" />
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 w-full bg-surface-subtle rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const totalLessons = course.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0)
  const completedLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.status === 'completed').length,
    0
  )
  const progressPercent = Math.round((completedLessons / Math.max(totalLessons, 1)) * 100)

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* 1. Udemy Top Dark Learning Navigation Header */}
      <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between bg-[#1c1d1f] px-4 sm:px-6 text-white border-b border-white/10 shadow-md">
        {/* Left Side: Back button + Course Title */}
        <div className="flex items-center gap-3 overflow-hidden">
          <button
            onClick={onBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
            title="Quay lại danh sách khóa học"
          >
            <ArrowLeft size={16} />
          </button>

          <div className="h-5 w-px bg-white/20 hidden sm:block shrink-0" />

          <h1 className="truncate text-xs sm:text-sm font-bold text-white/95">
            {course.title}
          </h1>
        </div>

        {/* Right Side: Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 text-xs font-semibold">
          {/* Rating button */}
          <button
            onClick={() => setShowRatingModal(true)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Star size={14} className="text-warning fill-warning" />
            <span>Đánh giá</span>
          </button>

          {/* Certificate button */}
          <button
            onClick={() => setShowCertificateModal(true)}
            className="hidden md:flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-white/90 hover:bg-white/10 hover:border-white/40 transition-colors"
          >
            <Trophy size={14} className="text-warning" />
            <span>Nhận chứng chỉ</span>
          </button>

          {/* Share button */}
          <button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
            className="flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-white/90 hover:bg-white/10 hover:border-white/40 transition-colors"
            title="Sao chép liên kết"
          >
            <Share2 size={13} />
            <span className="hidden sm:inline">Chia sẻ</span>
          </button>

          <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-white/80">
            <MoreVertical size={16} />
          </button>
        </div>
      </header>

      {/* 2. Main 2-Column Udemy Learning Experience */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* 2.1 Left Main Section (Video Player + Bottom Tabs - ~70%) */}
        <div className="flex-1 flex flex-col overflow-y-auto max-h-[calc(100vh-3.5rem)]">
          {/* Video Player */}
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

          {/* Below Player Area */}
          <div className="p-4 sm:p-8 space-y-6 max-w-5xl">
            {/* Sub-Navigation Tabs under Video (Udemy style) */}
            <div className="flex items-center gap-6 border-b border-border text-xs sm:text-sm font-bold tracking-wide overflow-x-auto no-scrollbar">
              {[
                { id: 'overview', label: 'Tổng quan (Overview)' },
                { id: 'qna', label: `Hỏi & Đáp (Q&A) ${course.qna?.length ? `(${course.qna.length})` : ''}` },
                { id: 'notes', label: `Ghi chú (Notes) ${course.notes?.length ? `(${course.notes.length})` : ''}` },
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

            {/* Tab Contents */}
            {activeBottomTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-200">
                {/* Big Title & Overview Stats */}
                <div className="space-y-3">
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary leading-snug">
                    {course.title}
                  </h2>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {course.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-text-secondary pt-2">
                    <div className="flex items-center gap-1.5 text-warning">
                      <span className="font-extrabold text-sm">{course.rating || 4.8}</span>
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={13} fill="currentColor" />
                        ))}
                      </div>
                      <span className="text-text-tertiary">({(course.ratingCount || 1420).toLocaleString('en-US')} đánh giá)</span>
                    </div>

                    <div className="flex items-center gap-1 text-text-secondary">
                      <Users size={14} className="text-primary" />
                      <span>{(course.studentsCount || 12850).toLocaleString('en-US')} học viên đã đăng ký</span>
                    </div>

                    <div className="flex items-center gap-1 text-text-secondary">
                      <Clock size={14} className="text-primary" />
                      <span>{course.duration || '45.5 giờ'} tổng thời lượng</span>
                    </div>

                    <div className="flex items-center gap-1 text-text-secondary">
                      <Globe size={14} className="text-primary" />
                      <span>{course.language || 'Tiếng Việt & Tiếng Anh'}</span>
                    </div>
                  </div>
                </div>

                {/* What you will learn box */}
                <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
                  <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
                    <Award className="text-primary" size={18} />
                    Mục tiêu kiến thức đạt được trong khóa học
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(course.whatYouWillLearn || [
                      'Làm chủ 44 âm vị IPA và phản xạ nghe hiểu Part 1 - Part 4.',
                      'Bóc tách cấu trúc câu Part 5 & 6 trong 15 giây mà không cần dịch từ.',
                      'Xử lý câu bẫy Part 2 và bẫy đồng âm phổ biến.',
                      'Kỹ thuật Skimming & Scanning đạt độ chính xác trên 85% trong Part 7.',
                    ]).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                        <Check className="text-primary shrink-0 mt-0.5" size={15} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructor Profile Card */}
                {course.instructor && (
                  <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
                    <h3 className="text-base font-bold text-text-primary">Giảng viên hướng dẫn</h3>
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                      <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="h-16 w-16 rounded-2xl object-cover border border-border"
                      />
                      <div className="space-y-1.5 flex-1">
                        <div className="text-sm font-bold text-text-primary">{course.instructor.name}</div>
                        <div className="text-xs text-primary font-medium">{course.instructor.title}</div>
                        <div className="flex items-center gap-4 text-[11px] text-text-tertiary pt-1">
                          <span className="flex items-center gap-1 font-bold text-warning">
                            <Star size={12} fill="currentColor" />
                            {course.instructor.rating} Đánh giá
                          </span>
                          <span>{(course.instructor.studentsCount || 38000).toLocaleString('en-US')} Học viên</span>
                          <span>{course.instructor.coursesCount || 8} Khóa học</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed pt-2">
                          {course.instructor.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeBottomTab === 'qna' && (
              <CourseQnATab qnaList={course.qna || []} currentLessonTitle={currentLesson.title} />
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
              <div className="space-y-4 pt-2">
                {(course.announcements || []).map((ann) => (
                  <div key={ann.id} className="rounded-2xl border border-border bg-surface p-6 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-text-primary">{ann.title}</div>
                      <span className="text-xs text-text-tertiary">{ann.date}</span>
                    </div>
                    <div className="text-xs text-primary font-medium">{ann.author}</div>
                    <p className="text-xs text-text-secondary leading-relaxed">{ann.content}</p>
                  </div>
                ))}
              </div>
            )}

            {activeBottomTab === 'tools' && (
              <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm text-xs text-text-secondary">
                <h3 className="text-sm font-bold text-text-primary">Công cụ học tập & Lịch nhắc nhở</h3>
                <p>Kích hoạt tính năng đồng bộ lịch học với Google Calendar hoặc Apple Calendar để không bỏ lỡ buổi học.</p>
                <Button className="bg-primary text-white hover:bg-primary-hover gap-2 rounded-xl text-xs">
                  <Calendar size={14} />
                  Kết nối lịch học Google Calendar
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 2.2 Right Sidebar Section (Course Content & AI Assistant - ~30%) */}
        <div className="w-full lg:w-[380px] shrink-0 border-l border-border bg-surface flex flex-col max-h-[calc(100vh-3.5rem)] shadow-lg">
          {/* Sidebar Top Header with 2 Tabs */}
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

          {/* Sidebar Content Area */}
          {activeSidebarTab === 'content' ? (
            <div className="flex-1 overflow-y-auto divide-y divide-border">
              {course.chapters.map((chapter, chIdx) => {
                const isExpanded = expandedChapters.includes(chapter.id)
                const chCompleted = chapter.lessons.filter((l) => l.status === 'completed').length
                const chTotal = chapter.lessons.length

                return (
                  <div key={chapter.id} className="bg-surface">
                    {/* Chapter Accordion Header */}
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="flex w-full items-center justify-between p-4 text-left hover:bg-surface-hover transition-colors group cursor-pointer"
                    >
                      <div className="space-y-1 flex-1 pr-3">
                        <div className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors leading-snug">
                          {chapter.title}
                        </div>
                        <div className="text-[11px] text-text-tertiary">
                          {chCompleted}/{chTotal} bài • ~{Math.round((chTotal * 8))} phút
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-text-tertiary shrink-0" />
                      ) : (
                        <ChevronDown size={16} className="text-text-tertiary shrink-0" />
                      )}
                    </button>

                    {/* Chapter Lessons List */}
                    {isExpanded && (
                      <div className="bg-surface-subtle/40 divide-y divide-border/60">
                        {chapter.lessons.map((lesson) => {
                          const isActive = currentLesson.id === lesson.id
                          const isDone = lesson.status === 'completed'
                          const isResourceOpen = activeResourceDropdown === lesson.id

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => handleSelectLesson(chapter, lesson)}
                              className={`flex items-start gap-3 p-3.5 pl-5 transition-all cursor-pointer ${
                                isActive
                                  ? 'bg-primary-soft/60 border-l-4 border-primary text-primary'
                                  : 'hover:bg-surface-hover text-text-primary'
                              }`}
                            >
                              {/* Checkbox (toggleable complete) */}
                              <button
                                onClick={(e) => handleToggleLessonComplete(lesson.id, e)}
                                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                                  isDone
                                    ? 'bg-primary border-primary text-white'
                                    : 'border-border bg-surface hover:border-primary'
                                }`}
                                title={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                              >
                                {isDone && <Check size={11} strokeWidth={3} />}
                              </button>

                              {/* Lesson Title & Info */}
                              <div className="flex-1 space-y-1">
                                <div className={`text-xs leading-snug font-medium ${isActive ? 'font-bold text-primary' : 'text-text-primary'}`}>
                                  {lesson.title}
                                </div>
                                <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                                  <span className="flex items-center gap-1">
                                    <PlayCircle size={12} className={isActive ? 'text-primary' : ''} />
                                    {Math.round(lesson.duration / 60)} phút
                                  </span>

                                  {/* Resources Dropdown Trigger */}
                                  {lesson.resources && lesson.resources.length > 0 && (
                                    <div className="relative">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setActiveResourceDropdown(isResourceOpen ? null : lesson.id)
                                        }}
                                        className="flex items-center gap-1 text-primary hover:underline font-semibold"
                                      >
                                        <FolderDown size={11} />
                                        <span>Tài liệu ({lesson.resources.length})</span>
                                      </button>

                                      {/* Resources Menu */}
                                      {isResourceOpen && (
                                        <div
                                          onClick={(e) => e.stopPropagation()}
                                          className="absolute left-0 top-6 w-56 rounded-xl border border-border bg-surface p-2 shadow-2xl z-30 space-y-1.5 text-xs animate-in fade-in duration-150"
                                        >
                                          <div className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary px-2 py-0.5">
                                            Tải tài liệu bài học:
                                          </div>
                                          {lesson.resources.map((res) => (
                                            <a
                                              key={res.id}
                                              href={res.url}
                                              download
                                              className="flex items-center justify-between gap-2 rounded-lg p-2 hover:bg-surface-hover text-text-primary transition-colors"
                                            >
                                              <span className="truncate flex-1 text-[11px]">{res.title}</span>
                                              <Download size={12} className="text-primary shrink-0" />
                                            </a>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            /* AI Assistant Tab in Sidebar */
            <div className="flex-1 flex flex-col justify-between p-4 space-y-4 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {aiChatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-2.5 ${
                      msg.sender === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <div
                      className={`h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        msg.sender === 'user'
                          ? 'bg-surface border border-border text-text-primary font-bold'
                          : 'bg-primary text-white shadow-sm'
                      }`}
                    >
                      {msg.sender === 'user' ? 'U' : <Bot size={14} />}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-primary text-white rounded-tr-none font-medium'
                          : 'bg-surface-subtle border border-border text-text-primary rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Chat Input Form */}
              <form onSubmit={handleSendAiMessage} className="relative pt-2 border-t border-border">
                <input
                  type="text"
                  placeholder="Hỏi AI về bài học hiện tại..."
                  value={aiInputMessage}
                  onChange={(e) => setAiInputMessage(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface pl-3.5 pr-10 py-2.5 text-xs text-text-primary placeholder:text-text-tertiary focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 mt-1 text-primary hover:text-primary-hover p-1"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-text-primary">Đánh giá khóa học</h3>
              <button onClick={() => setShowRatingModal(false)} className="text-text-tertiary hover:text-text-primary">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Bạn đánh giá chất lượng bài giảng và phương pháp tư duy của khóa học này như thế nào?
            </p>
            <div className="flex justify-center gap-2 py-3 text-warning">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setUserRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star size={28} fill={star <= userRating ? 'currentColor' : 'none'} />
                </button>
              ))}
            </div>
            <textarea
              rows={3}
              placeholder="Chia sẻ thêm cảm nhận và tiến bộ của bạn..."
              className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-text-primary resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowRatingModal(false)} className="text-xs">
                Hủy
              </Button>
              <Button
                onClick={() => setShowRatingModal(false)}
                className="bg-primary text-white hover:bg-primary-hover text-xs rounded-xl px-5"
              >
                Gửi đánh giá
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-3xl border border-primary/30 bg-surface p-8 shadow-2xl space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-soft text-primary">
              <Trophy size={36} />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-widest text-primary">Chứng Nhận Hoàn Thành</div>
              <h3 className="text-xl font-black text-text-primary">{course.title}</h3>
              <p className="text-xs text-text-secondary max-w-md mx-auto">
                Chứng chỉ điện tử chính thức được cấp bởi Viện Đào Tạo Tiếng Anh Tư Duy LingoSphere với mã định danh quốc tế.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-subtle p-4 text-xs font-medium text-text-secondary">
              Tiến độ hiện tại của bạn: <strong className="text-primary">{progressPercent}%</strong> ({completedLessons}/{totalLessons} bài học)
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="ghost" onClick={() => setShowCertificateModal(false)} className="text-xs rounded-xl">
                Đóng
              </Button>
              <Button
                onClick={() => setShowCertificateModal(false)}
                className="bg-primary text-white hover:bg-primary-hover text-xs rounded-xl px-6 gap-2"
              >
                <Download size={14} />
                Tải chứng chỉ PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
