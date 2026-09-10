// Hook tải dữ liệu chi tiết kết quả bài kiểm tra, chuẩn hóa câu hỏi và bộ lọc đáp án.

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useSearchParams } from '@/lib/navigation'
import { examService } from '@/features/toeic/services/exam.service'
import { courseService } from '@/features/courses/services/course.service'
import type { AttemptAnswerDetail, CourseQuestionDetail } from '@/features/toeic/components/attempt.question.item'

export interface AttemptResultDetail {
  attempt?: {
    _id?: string
    exam_id?: string
    exam_title?: string
    exam_code?: string
    total_scaled_score?: number
    listening_scaled_score?: number
    reading_scaled_score?: number
    correct_questions?: number
    total_questions?: number
    total_time_seconds?: number
    submitted_at?: string
  }
  answers?: AttemptAnswerDetail[]
}

export type AnswerFilterStatus = 'ALL' | 'CORRECT' | 'INCORRECT' | 'SKIPPED'

export function useExamAttemptDetail() {
  const params = useParams<{ attemptId: string }>()
  const searchParams = useSearchParams()

  const attemptId = params?.attemptId || ''
  const sourceType = searchParams.get('sourceType') || 'TOEIC'
  const testType = searchParams.get('testType') || ''
  const courseId = searchParams.get('courseId') || ''
  const moduleId = searchParams.get('moduleId') || ''
  const initialTitle = searchParams.get('title') || 'Chi tiết bài làm'
  const initialScore = searchParams.get('score') || ''
  const initialCorrect = searchParams.get('correct') ? Number(searchParams.get('correct')) : undefined
  const initialTotal = searchParams.get('total') ? Number(searchParams.get('total')) : undefined
  const initialIsPassed = searchParams.get('isPassed') === 'true'
  const initialSubmittedAt = searchParams.get('submittedAt') || ''
  const initialDuration = searchParams.get('duration') ? Number(searchParams.get('duration')) : undefined

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [detailData, setDetailData] = useState<AttemptResultDetail | null>(null)
  const [courseQuestions, setCourseQuestions] = useState<CourseQuestionDetail[]>([])
  const [courseTitle, setCourseTitle] = useState<string>('')
  const [filterAnswerStatus, setFilterAnswerStatus] = useState<AnswerFilterStatus>('ALL')

  const isProfilePlacement = attemptId === 'profile-placement-baseline'
  const isCourseTest = sourceType === 'COURSE'

  const loadAttemptDetail = useCallback(async () => {
    if (!attemptId) return
    setIsLoading(true)
    try {
      if (isCourseTest && courseId) {
        const course = await courseService.getCourseById(courseId).catch(() => null)
        if (course) {
          const rawCourse = course as unknown as {
            title?: string
            final_test_questions?: unknown[]
            modules?: Array<{
              _id?: string
              id?: string
              order_index?: number
              challenge_questions?: Array<{
                question_text?: string
                question?: string
                options?: string[] | Array<{ text?: string; key?: string }>
                correct_answer?: string
                correct_option?: string
                explanation?: string
                explanation_vi?: string
                explanation_en?: string
                media_url?: string
                audio_url?: string
                image_url?: string
              }>
              post_mini_test_questions?: Array<{
                question_text?: string
                question?: string
                options?: string[] | Array<{ text?: string; key?: string }>
                correct_answer?: string
                correct_option?: string
                explanation?: string
                explanation_vi?: string
                explanation_en?: string
                media_url?: string
                audio_url?: string
                image_url?: string
              }>
            }>
          }

          if (rawCourse.title) setCourseTitle(rawCourse.title)

          let qList: unknown[] = []
          if (testType === 'final-test') {
            qList = Array.isArray(rawCourse.final_test_questions) ? rawCourse.final_test_questions : []
          } else if (rawCourse.modules && Array.isArray(rawCourse.modules)) {
            const targetMod =
              rawCourse.modules.find((m) => m._id === moduleId || m.id === moduleId) ||
              rawCourse.modules[0]

            if (targetMod) {
              if (testType === 'challenge') {
                qList = targetMod.challenge_questions || []
              } else {
                qList = targetMod.post_mini_test_questions || targetMod.challenge_questions || []
              }
            }
          }

          if (qList.length > 0) {
            const parsedQuestions: CourseQuestionDetail[] = qList.map((item, idx) => {
              const qObj = item as Record<string, unknown>
              const optRaw = qObj.options
              let cleanOptions: string[] = []
              if (Array.isArray(optRaw)) {
                cleanOptions = optRaw.map((opt) => {
                  if (typeof opt === 'string') return opt
                  if (opt && typeof opt === 'object') {
                    const oRec = opt as Record<string, unknown>
                    return String(oRec.text || oRec.key || '')
                  }
                  return ''
                })
              }

              return {
                question_number: idx + 1,
                question_text: String(
                  qObj.question_text || qObj.question || `Câu hỏi số ${idx + 1}`
                ),
                options: cleanOptions,
                correct_answer: String(qObj.correct_answer || qObj.correct_option || 'A'),
                explanation: String(
                  qObj.explanation_vi || qObj.explanation || qObj.explanation_en || ''
                ),
                media_url: qObj.media_url
                  ? String(qObj.media_url)
                  : qObj.audio_url
                  ? String(qObj.audio_url)
                  : undefined,
                image_url: qObj.image_url ? String(qObj.image_url) : undefined,
              }
            })
            setCourseQuestions(parsedQuestions)
          }
        }
      } else if (!isProfilePlacement) {
        const res = await examService.getExamAttemptResult(attemptId).catch(() => null)
        if (res) {
          setDetailData(res as unknown as AttemptResultDetail)
        }
      }
    } catch {
    } finally {
      setIsLoading(false)
    }
  }, [attemptId, isCourseTest, courseId, moduleId, testType, isProfilePlacement])

  useEffect(() => {
    loadAttemptDetail()
  }, [loadAttemptDetail])

  const title = detailData?.attempt?.exam_title || (isCourseTest && courseTitle ? courseTitle : initialTitle)
  const scoreDisplay = detailData?.attempt
    ? `${detailData.attempt.total_scaled_score ?? 0} / 990 điểm`
    : initialScore || 'Hoàn thành'
  const totalQ = detailData?.attempt?.total_questions ?? initialTotal ?? 0
  const correctQ = detailData?.attempt?.correct_questions ?? initialCorrect ?? 0
  const isPassed = detailData?.attempt
    ? (detailData.attempt.total_scaled_score ?? 0) >= 450
    : initialIsPassed
  const submittedAt = detailData?.attempt?.submitted_at || initialSubmittedAt
  const durationSeconds = detailData?.attempt?.total_time_seconds ?? initialDuration

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '30 phút'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins} phút ${secs > 0 ? `${secs} giây` : ''}`
  }

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return 'Đang cập nhật'
    try {
      const d = new Date(dateStr)
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  const filteredToeicAnswers = useMemo(() => {
    if (!detailData?.answers) return []
    return detailData.answers.filter((ans) => {
      if (filterAnswerStatus === 'CORRECT') return ans.is_correct
      if (filterAnswerStatus === 'INCORRECT')
        return !ans.is_correct && !ans.is_skipped && Boolean(ans.selected_option)
      if (filterAnswerStatus === 'SKIPPED') return ans.is_skipped || !ans.selected_option
      return true
    })
  }, [detailData?.answers, filterAnswerStatus])

  return {
    isLoading,
    detailData,
    courseQuestions,
    filterAnswerStatus,
    setFilterAnswerStatus,
    filteredToeicAnswers,
    title,
    scoreDisplay,
    totalQ,
    correctQ,
    isPassed,
    submittedAt,
    durationSeconds,
    formatDuration,
    formatDateTime,
    isCourseTest,
    isProfilePlacement,
    attemptId,
    courseId,
    testType,
    moduleId,
  }
}
