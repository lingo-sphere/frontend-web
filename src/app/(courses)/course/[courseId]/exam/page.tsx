// Trang làm bài thi khóa học toàn màn hình (Course Exam Workspace)

'use client'

import { useCallback, useMemo, Suspense } from 'react'
import { useParams, useSearchParams, useNavigate } from '@/lib/navigation'
import { courseService } from '@/features/courses/services/course.service'
import { mapCourseDataToWorkspace } from '@/features/courses/helpers/course.workspace.adapter'
import { CourseTestRunnerWorkspace } from '@/features/courses/components/course.test.runner.workspace'
import { CourseLoadingState } from '@/features/courses/components/course.loading.state'
import type { Course, Chapter } from '@/features/courses/types/course'
import type { TestAttemptItem } from '@/features/courses/types/test.runner.types'
import { Button } from '@/components/button'
import { AlertCircle, ArrowLeft } from 'lucide-react'
import { extractCourseId, buildCourseUrl } from '@/features/courses/lib/course.url'
import { getQueryClient } from '@/config/query.config'
import { progressKeys } from '@/features/progress/keys/progress.keys'
import { courseKeys } from '@/features/courses/keys/course.keys'
import {
  useCourseDetailQuery,
  useCourseEnrollmentStatusQuery,
  useCourseProgressQuery,
} from '@/features/courses/hooks/use.courses.query'

function CourseExamContent() {
  const params = useParams<{ courseId: string }>()
  const searchParams = useSearchParams()
  const navigate = useNavigate()

  const rawParam = params?.courseId || ''
  const courseId = useMemo(() => extractCourseId(rawParam), [rawParam])
  const testType = (searchParams.get('type') || 'final-test') as
    | 'challenge'
    | 'exercise'
    | 'post-mini'
    | 'final-test'
  const chapterId = searchParams.get('chapterId') || searchParams.get('moduleId')

  const { data: fetchedCourse, isLoading: isCourseLoading } = useCourseDetailQuery(courseId, Boolean(courseId))
  const { data: enrollmentRes, isLoading: isEnrollmentLoading } = useCourseEnrollmentStatusQuery(courseId, Boolean(courseId))
  const { data: progressRes } = useCourseProgressQuery(courseId, Boolean(courseId))

  const isLoading = isCourseLoading || isEnrollmentLoading
  const isEnrolled = Boolean(enrollmentRes?.is_enrolled)

  const course: Course | null = useMemo(() => {
    if (!fetchedCourse || !courseId) return null
    return mapCourseDataToWorkspace(
      courseId,
      fetchedCourse,
      isEnrolled,
      progressRes,
      null,
      null,
      null
    )
  }, [courseId, fetchedCourse, isEnrolled, progressRes])

  const progressDetail = progressRes

  const handleBackToCourse = useCallback(() => {
    if (course) {
      navigate(buildCourseUrl(course))
    } else {
      navigate(`/course/${courseId}`)
    }
  }, [navigate, course, courseId])

  if (isLoading) {
    return <CourseLoadingState onBack={handleBackToCourse} />
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-surface-secondary text-text-primary flex flex-col items-center justify-center p-6 antialiased">
        <div className="w-full max-w-md p-8 bg-surface rounded-3xl border border-border shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Không thể mở bài thi</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Dữ liệu khóa học chưa sẵn sàng để làm bài thi.
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
        ) || null

  if (testType !== 'final-test' && !selectedChapter) {
    return (
      <div className="min-h-screen bg-surface-secondary text-text-primary flex flex-col items-center justify-center p-6 antialiased">
        <div className="w-full max-w-md p-8 bg-surface rounded-3xl border border-border shadow-xl text-center space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <AlertCircle size={28} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Không tìm thấy chương học</h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Chương học hoặc bài kiểm tra yêu cầu không tồn tại trong khóa học này.
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

  const durationMins =
    testType === 'final-test'
      ? Number(course.final_test_duration_minutes || 60)
      : Number(selectedChapter?.challenge_duration_minutes || 15)

  const rawProgress = progressDetail as
    | {
        course_progress?: { final_test_score?: number; final_test_attempts?: TestAttemptItem[] }
        modules_progress?: Array<{
          module_id: string
          order_index?: number
          challenge_score?: number
          attempts?: TestAttemptItem[]
        }>
      }
    | undefined

  const previousAttempts =
    testType === 'final-test'
      ? rawProgress?.course_progress?.final_test_attempts || []
      : rawProgress?.modules_progress?.find(
          (m) =>
            String(m.module_id) === String(selectedChapter?.id) ||
            Number(m.order_index) === Number(selectedChapter?.order)
        )?.attempts || []

  const highestScore =
    testType === 'final-test'
      ? rawProgress?.course_progress?.final_test_score || 0
      : rawProgress?.modules_progress?.find(
          (m) =>
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
      onComplete={async () => {
        const qc = getQueryClient()
        qc.invalidateQueries({ queryKey: progressKeys.all })
        qc.invalidateQueries({ queryKey: courseKeys.all })
      }}
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
