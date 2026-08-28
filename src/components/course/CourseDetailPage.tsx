import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { courseService } from '@/services/course.service'
import { demoCourse } from '@/data/course-data'
import type { Lesson, Course, TestResult } from '@/types/course'
import { LessonPlayer } from '@/components/course/LessonPlayer'
import { PreTestDialog } from '@/components/course/PreTestDialog'
import { TestResultDialog } from '@/components/course/TestResultDialog'
import { CourseHero } from '@/components/course/CourseHero'
import { CourseCurriculumList } from '@/components/course/CourseCurriculumList'

interface CourseDetailPageProps {
  courseId?: string
  onBack: () => void
}

export function CourseDetailPage({ courseId, onBack }: CourseDetailPageProps) {
  const [course, setCourse] = useState<Course>(demoCourse)
  const [expandedChapter, setExpandedChapter] = useState<string>('ch-02')
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
  const [showPreTest, setShowPreTest] = useState(false)
  const [showTestResult, setShowTestResult] = useState<TestResult | null>(null)
  const [testResultType, setTestResultType] = useState<string>('')

  useEffect(() => {
    if (!courseId) return
    let isMounted = true
    const fetchCourseData = async () => {
      try {
        const liveCourse = await courseService.getCourseById(courseId)
        if (isMounted && liveCourse) {
          setCourse((prev) => ({
            ...prev,
            id: liveCourse.id || liveCourse._id || courseId,
            title: liveCourse.title || prev.title,
            description: liveCourse.description || prev.description,
            level: liveCourse.level || prev.level,
            thumbnail: liveCourse.thumbnail_url || prev.thumbnail || '',
          }))
        }
      } catch {
        // Fallback to demoCourse
      }
    }
    fetchCourseData()
    return () => {
      isMounted = false
    }
  }, [courseId])

  const completedLessons = course.chapters.reduce(
    (acc, ch) => acc + ch.lessons.filter((l) => l.status === 'completed').length,
    0
  )
  const totalLessons = course.totalLessons || 1
  const progressPercent = Math.round((completedLessons / totalLessons) * 100)

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.status === 'locked') return
    setCurrentLesson(lesson)
  }

  const handleLessonProgress = (lessonId: string, progress: number) => {
    setCourse((prev) => {
      const updated = { ...prev }
      const chapter = updated.chapters.find((ch) =>
        ch.lessons.some((l) => l.id === lessonId)
      )
      if (!chapter) return updated

      const lesson = chapter.lessons.find((l) => l.id === lessonId)
      if (!lesson) return updated

      lesson.progress = progress

      if (progress >= 80) {
        const lessonIndex = chapter.lessons.findIndex((l) => l.id === lessonId)
        if (lessonIndex < chapter.lessons.length - 1) {
          const nextLesson = chapter.lessons[lessonIndex + 1]
          if (nextLesson.status === 'locked') {
            nextLesson.status = 'available'
          }
        }

        if (progress >= 100) {
          lesson.status = 'completed'
          if (lessonIndex < chapter.lessons.length - 1) {
            chapter.lessons[lessonIndex + 1].status = 'available'
          }
        }
      }

      const allLessonsDone = chapter.lessons.every((l) => l.status === 'completed')
      if (allLessonsDone) {
        chapter.status = 'completed'
        chapter.exercise.status = 'available'
      }

      return updated
    })
  }

  const handleTestComplete = (result: TestResult, type: string) => {
    setShowTestResult(result)
    setTestResultType(type)
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 text-text-secondary hover:text-text-primary">
        <ArrowLeft size={16} />
        Quay lại danh sách khóa học
      </Button>

      <CourseHero
        course={course}
        progressPercent={progressPercent}
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        onStartPreTest={() => setShowPreTest(true)}
        onStartFinalTest={() => {
          // Trigger final test
        }}
      />

      <CourseCurriculumList
        chapters={course.chapters}
        expandedChapter={expandedChapter}
        onToggleChapter={(chId) =>
          setExpandedChapter((prev) => (prev === chId ? '' : chId))
        }
        onLessonClick={handleLessonClick}
      />

      {currentLesson && (
        <LessonPlayer
          lesson={currentLesson}
          onClose={() => setCurrentLesson(null)}
          onProgress={handleLessonProgress}
        />
      )}

      <PreTestDialog
        isOpen={showPreTest}
        onClose={() => setShowPreTest(false)}
        hasBaseline={!!course.progress?.baselineScore}
        baseline={course.progress?.baselineScore}
        onComplete={(result) => {
          handleTestComplete(result, 'pre-test')
          setShowPreTest(false)
        }}
      />

      <TestResultDialog
        isOpen={!!showTestResult}
        onClose={() => setShowTestResult(null)}
        result={showTestResult}
        testType={testResultType}
      />
    </div>
  )
}
