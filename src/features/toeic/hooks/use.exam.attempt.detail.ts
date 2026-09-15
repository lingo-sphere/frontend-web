// Hook tải dữ liệu chi tiết kết quả bài kiểm tra, chuẩn hóa câu hỏi và bộ lọc đáp án bằng TanStack Query.
'use client'

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useParams, useSearchParams } from '@/lib/navigation'
import { useExamAttemptResultQuery } from '@/features/toeic/hooks/use.toeic.query'
import { useCourseDetailQuery } from '@/features/courses/hooks/use.courses.query'
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
    teacher_feedback?: string
    is_score_manually_edited?: boolean
    score_edited_at?: string
  }
  answers?: AttemptAnswerDetail[]
}

export type AnswerFilterStatus = 'ALL' | 'CORRECT' | 'INCORRECT' | 'SKIPPED'

export function useExamAttemptDetail() {
  const params = useParams<{ attemptId: string }>()
  const searchParams = useSearchParams()

  const attemptId = params?.attemptId || ''
  const rawSourceType = searchParams.get('sourceType')
  const isProfilePlacement = attemptId === 'profile-placement-baseline'
  const isCourseAttemptId = attemptId.startsWith('att')
  const isCourseTest = !isProfilePlacement && (rawSourceType === 'COURSE' || isCourseAttemptId)
  const sourceType = isCourseTest ? 'COURSE' : (rawSourceType || 'TOEIC')

  const queryTestType = searchParams.get('testType') || ''
  const queryCourseId = searchParams.get('courseId') || ''
  const queryModuleId = searchParams.get('moduleId') || ''
  const initialTitle = searchParams.get('title') || 'Chi tiết bài làm'
  const initialScore = searchParams.get('score') || ''
  const initialCorrect = searchParams.get('correct') ? Number(searchParams.get('correct')) : undefined
  const initialTotal = searchParams.get('total') ? Number(searchParams.get('total')) : undefined
  const initialIsPassed = searchParams.get('isPassed') === 'true'
  const initialSubmittedAt = searchParams.get('submittedAt') || ''
  const initialDuration = searchParams.get('duration') ? Number(searchParams.get('duration')) : undefined

  const [filterAnswerStatus, setFilterAnswerStatus] = useState<AnswerFilterStatus>('ALL')

  const toeicAttemptQuery = useExamAttemptResultQuery(
    attemptId,
    Boolean(attemptId && !isCourseTest && !isProfilePlacement)
  )
  const courseAttemptDetailQuery = useQuery({
    queryKey: ['course-attempt-detail', attemptId],
    queryFn: () => courseService.getCourseAttemptDetail(attemptId),
    enabled: Boolean(isCourseTest && attemptId && !isProfilePlacement),
    staleTime: 5 * 60 * 1000,
  })

  const effectiveCourseId = queryCourseId || courseAttemptDetailQuery.data?.course_id || ''
  const effectiveModuleId = queryModuleId || courseAttemptDetailQuery.data?.module_id || ''
  const effectiveTestType = queryTestType || courseAttemptDetailQuery.data?.test_type || ''

  const courseDetailQuery = useCourseDetailQuery(
    effectiveCourseId,
    Boolean(isCourseTest && effectiveCourseId)
  )

  const isLoading = isCourseTest
    ? courseAttemptDetailQuery.isLoading || (effectiveCourseId ? courseDetailQuery.isLoading : false)
    : isProfilePlacement
    ? false
    : toeicAttemptQuery.isLoading

  const detailData = toeicAttemptQuery.data as unknown as AttemptResultDetail | undefined

  const { courseQuestions, courseTitle } = useMemo(() => {
    if (!isCourseTest) {
      return { courseQuestions: [], courseTitle: '' }
    }

    const cAttempt = courseAttemptDetailQuery.data
    if (cAttempt && Array.isArray(cAttempt.questions) && cAttempt.questions.length > 0) {
      const parsedQuestions: CourseQuestionDetail[] = cAttempt.questions.map((item, idx) => {
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

        const selectedIdx = typeof qObj.selected_index === 'number' ? qObj.selected_index : undefined
        const correctIdx = typeof qObj.correct_index === 'number' ? qObj.correct_index : undefined
        const isCorrect = typeof qObj.is_correct === 'boolean' ? qObj.is_correct : undefined

        return {
          question_number: typeof qObj.question_number === 'number' ? qObj.question_number : idx + 1,
          question_text: String(qObj.question_text || `Câu hỏi số ${idx + 1}`),
          options: cleanOptions,
          correct_answer: String(qObj.correct_answer || ''),
          correct_index: correctIdx,
          selected_index: selectedIdx,
          selected_option: qObj.selected_option ? String(qObj.selected_option) : undefined,
          is_correct: isCorrect,
          explanation: String(qObj.explanation || ''),
          media_url: qObj.media_url ? String(qObj.media_url) : undefined,
          image_url: qObj.image_url ? String(qObj.image_url) : undefined,
        }
      })

      const testName =
        cAttempt.test_type === 'challenge'
          ? 'Kiểm tra chương'
          : cAttempt.test_type === 'post-mini-test' || cAttempt.test_type === 'post-mini'
          ? 'Kiểm tra chương'
          : cAttempt.test_type === 'final-test'
          ? 'Bài thi tốt nghiệp Exit Test'
          : ''

      return {
        courseQuestions: parsedQuestions,
        courseTitle: testName || (courseDetailQuery.data as { title?: string } | undefined)?.title || '',
      }
    }

    if (!courseDetailQuery.data) {
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
    if (effectiveTestType === 'final-test') {
      qList = Array.isArray(rawCourse.final_test_questions) ? rawCourse.final_test_questions : []
    } else if (rawCourse.modules && Array.isArray(rawCourse.modules)) {
      const targetMod =
        rawCourse.modules.find((m) => m._id === effectiveModuleId || m.id === effectiveModuleId) ||
        rawCourse.modules[0]

      if (targetMod) {
        if (effectiveTestType === 'challenge') {
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
  }, [isCourseTest, courseAttemptDetailQuery.data, courseDetailQuery.data, effectiveTestType, effectiveModuleId])

  const cAttempt = courseAttemptDetailQuery.data
  const title =
    detailData?.attempt?.exam_title ||
    (isCourseTest && courseTitle ? courseTitle : initialTitle)
  const scoreDisplay = detailData?.attempt
    ? `${detailData.attempt.total_scaled_score ?? 0} / 990 điểm`
    : cAttempt?.score !== undefined
    ? `${cAttempt.score} / 100 điểm`
    : initialScore || 'Hoàn thành'
  const totalQ = detailData?.attempt?.total_questions ?? cAttempt?.total_questions ?? initialTotal ?? 0
  const correctQ = detailData?.attempt?.correct_questions ?? cAttempt?.correct_count ?? initialCorrect ?? 0
  const isPassed = detailData?.attempt
    ? (detailData.attempt.total_scaled_score ?? 0) >= 450
    : cAttempt?.is_passed !== undefined
    ? cAttempt.is_passed
    : initialIsPassed
  const submittedAt = detailData?.attempt?.submitted_at || cAttempt?.submitted_at || initialSubmittedAt
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

  const filteredCourseQuestions = useMemo(() => {
    if (!courseQuestions || courseQuestions.length === 0) return []
    return courseQuestions.filter((q) => {
      const isAnswered =
        (q.selected_index !== undefined && q.selected_index >= 0) || Boolean(q.selected_option)
      if (filterAnswerStatus === 'CORRECT') return q.is_correct === true
      if (filterAnswerStatus === 'INCORRECT')
        return q.is_correct === false || (isAnswered && !q.is_correct)
      if (filterAnswerStatus === 'SKIPPED') return !isAnswered
      return true
    })
  }, [courseQuestions, filterAnswerStatus])

  return {
    isLoading,
    detailData,
    courseQuestions,
    filteredCourseQuestions,
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
    courseId: effectiveCourseId,
    testType: effectiveTestType,
    moduleId: effectiveModuleId,
  }
}
