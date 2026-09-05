// Trang làm bài thi khóa học toàn màn hình (Course Exam Workspace)

'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useParams, useSearchParams, useNavigate } from '@/lib/navigation'
import { courseService } from '@/services/course.service'
import { mapCourseDataToWorkspace } from '@/components/course/workspace/course.workspace.adapter'
import { CourseTestRunnerWorkspace } from '@/components/course/course.test.runner.workspace'
import { CourseLoadingState } from '@/components/course/course.loading.state'
import type { Course, Chapter } from '@/types/course'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'

function CourseExamContent() {
  const params = useParams<{ courseId: string }>()
  const searchParams = useSearchParams()
  const navigate = useNavigate()

  const courseId = params?.courseId || ''
  const testType = (searchParams.get('type') || 'final-test') as
    | 'challenge'
    | 'exercise'
    | 'post-mini'
    | 'final-test'
  const chapterId = searchParams.get('chapterId') || searchParams.get('moduleId')

  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [progressDetail, setProgressDetail] = useState<any>(null)
  const [isEnrolled, setIsEnrolled] = useState<boolean>(true)

  const loadExamData = useCallback(async () => {
    if (!courseId) return
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const [fetchedCourse, enrollmentRes, progressRes] = await Promise.all([
        courseService.getCourseById(courseId).catch(() => null),
        courseService
          .getEnrollmentStatus(courseId)
          .then((r) => ({ enrolled: Boolean(r?.is_enrolled) }))
          .catch(() => ({ enrolled: true })),
        courseService.getCourseProgressDetail(courseId).catch(() => null),
      ])

      if (!fetchedCourse) {
        setErrorMessage('Không tìm thấy thông tin khóa học hoặc bài thi yêu cầu.')
        setIsLoading(false)
        return
      }

      setIsEnrolled(enrollmentRes.enrolled)
      setProgressDetail(progressRes)

      const mapped = mapCourseDataToWorkspace(
        courseId,
        fetchedCourse,
        enrollmentRes.enrolled,
        progressRes,
        null,
        null,
        null
      )

      setCourse(mapped)
    } catch {
      setErrorMessage('Đã xảy ra sự cố khi tải dữ liệu bài thi. Vui lòng thử lại sau.')
    } finally {
      setIsLoading(false)
    }
  }, [courseId])

  useEffect(() => {
    loadExamData()
  }, [loadExamData])

  const handleBackToCourse = useCallback(() => {
    navigate(`/course/${courseId}`)
  }, [navigate, courseId])

  if (isLoading) {
    return <CourseLoadingState onBack={handleBackToCourse} />
  }

  if (errorMessage || !course) {
    return (
      <div className="min-h-screen bg-surface-secondary text-text-primary flex flex-col items-center justify-center p-6 antialiased">
        <div className="w-full max-w-md p-8 bg-surface rounded-3xl border border-border shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Không thể mở bài thi</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            {errorMessage || 'Dữ liệu khóa học chưa sẵn sàng để làm bài thi.'}
          </p>
          <div className="pt-2">
            <Button
              onClick={handleBackToCourse}
              className="w-full bg-primary text-white font-bold rounded-xl gap-2 cursor-pointer shadow-md"
            >
              <ArrowLeft size={16} />
              <span>Quay lại khóa học</span>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const selectedChapter: Chapter | null =
    testType === 'final-test'
      ? null
      : course.chapters.find(
          (c) => String(c.id) === String(chapterId) || String(c.order) === String(chapterId)
        ) || course.chapters[0] || null

  const durationMins =
    testType === 'final-test'
      ? Number(course.final_test_duration_minutes || 60)
      : Number(selectedChapter?.challenge_duration_minutes || 15)

  const previousAttempts =
    testType === 'final-test'
      ? progressDetail?.course_progress?.final_test_attempts || []
      : progressDetail?.modules_progress?.find(
          (m: any) =>
            String(m.module_id) === String(selectedChapter?.id) ||
            Number(m.order_index) === Number(selectedChapter?.order)
        )?.attempts || []

  const highestScore =
    testType === 'final-test'
      ? progressDetail?.course_progress?.final_test_score || 0
      : progressDetail?.modules_progress?.find(
          (m: any) =>
            String(m.module_id) === String(selectedChapter?.id) ||
            Number(m.order_index) === Number(selectedChapter?.order)
        )?.challenge_score || 0

  return (
    <CourseTestRunnerWorkspace
      courseId={courseId}
      courseTitle={course.title}
      chapter={selectedChapter}
      testType={testType}
      durationMinutes={durationMins}
      finalTestQuestions={course.final_test_questions as any}
      finalTestAudioUrl={course.final_test_audio_url}
      speakingPrompt={
        testType === 'final-test'
          ? course.final_test_speaking_prompt || selectedChapter?.speaking_prompt
          : selectedChapter?.speaking_prompt
      }
      speakingFileUrl={
        testType === 'final-test'
          ? course.final_test_speaking_file_url || selectedChapter?.speaking_file_url
          : selectedChapter?.speaking_file_url
      }
      writingPrompt={
        testType === 'final-test'
          ? course.final_test_writing_prompt || selectedChapter?.writing_prompt
          : selectedChapter?.writing_prompt
      }
      writingFileUrl={
        testType === 'final-test'
          ? course.final_test_writing_file_url || selectedChapter?.writing_file_url
          : selectedChapter?.writing_file_url
      }
      category={course.category}
      skills={course.skills}
      highestScore={highestScore}
      previousAttempts={previousAttempts}
      onClose={handleBackToCourse}
      onComplete={() => {}}
    />
  )
}

export default function CourseExamPage() {
  return (
    <Suspense fallback={<CourseLoadingState onBack={() => window.history.back()} />}>
      <CourseExamContent />
    </Suspense>
  )
}
