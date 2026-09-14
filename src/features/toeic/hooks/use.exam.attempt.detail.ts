// Hook tải dữ liệu chi tiết kết quả bài kiểm tra, chuẩn hóa câu hỏi và bộ lọc đáp án bằng TanStack Query.
'use client'

import { useState, useMemo } from 'react'
import { useParams, useSearchParams } from '@/lib/navigation'
import { useExamAttemptResultQuery } from '@/features/toeic/hooks/use.toeic.query'
import { useCourseDetailQuery } from '@/features/courses/hooks/use.courses.query'
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

  const [filterAnswerStatus, setFilterAnswerStatus] = useState<AnswerFilterStatus>('ALL')

  const isProfilePlacement = attemptId === 'profile-placement-baseline'
  const isCourseTest = sourceType === 'COURSE'

  const toeicAttemptQuery = useExamAttemptResultQuery(
    attemptId,
    Boolean(attemptId && !isCourseTest && !isProfilePlacement)
  )
  const courseDetailQuery = useCourseDetailQuery(
    courseId,
    Boolean(isCourseTest && courseId)
  )

  const isLoading = isCourseTest
    ? courseDetailQuery.isLoading
    : isProfilePlacement
    ? false
    : toeicAttemptQuery.isLoading

  const detailData = toeicAttemptQuery.data as unknown as AttemptResultDetail | undefined

  const { courseQuestions, courseTitle } = useMemo(() => {
    if (!isCourseTest || !courseDetailQuery.data) {
      return { courseQuestions: [], courseTitle: '' }
    }
    const rawCourse = courseDetailQuery.data as unknown as {
      title?: string
      final_test_questions?: unknown[]
      modules?: Array<{
        _id?: string
        id?: string
        order_index?: number
        challenge_questions?: Array<Record<string, unknown>>
        post_mini_test_questions?: Array<Record<string, unknown>>
      }>
    }

    const cTitle = rawCourse.title || ''
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
        question_text: String(qObj.question_text || qObj.question || `Câu hỏi số ${idx + 1}`),
        options: cleanOptions,
        correct_answer: String(qObj.correct_answer || qObj.correct_option || 'A'),
        explanation: String(qObj.explanation_vi || qObj.explanation || qObj.explanation_en || ''),
        media_url: qObj.media_url
          ? String(qObj.media_url)
          : qObj.audio_url
          ? String(qObj.audio_url)
          : undefined,
        image_url: qObj.image_url ? String(qObj.image_url) : undefined,
      }
    })

    return { courseQuestions: parsedQuestions, courseTitle: cTitle }
  }, [isCourseTest, courseDetailQuery.data, testType, moduleId])

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
