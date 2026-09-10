// Custom hook quản lý truy vấn đề thi, lịch sử và kết quả bài làm TOEIC bằng TanStack Query.
'use client'

import { useQuery } from '@tanstack/react-query'
import { examService, type BackendToeicExam, type ExamResult } from '@/features/toeic/services/exam.service'
import { courseService } from '@/features/courses/services/course.service'
import { toeicKeys } from '@/features/toeic/keys/toeic.keys'

export function useToeicExamsQuery(
  params?: { type?: string; year?: number; search?: string },
  enabled = true
) {
  return useQuery<BackendToeicExam[]>({
    queryKey: [...toeicKeys.exams(), params],
    queryFn: () => examService.getExams(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useToeicExamDetailQuery(examId: string, enabled = true) {
  return useQuery<BackendToeicExam>({
    queryKey: toeicKeys.detail(examId),
    queryFn: () => examService.getExamById(examId),
    enabled: Boolean(examId) && enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useToeicHistoryQuery(enabled = true) {
  return useQuery<Array<{
    _id: string
    exam_id: string
    exam_title: string
    exam_code?: string
    exam_type: string
    attempt_type?: string
    is_system_placement?: boolean
    total_scaled_score: number
    listening_score: number
    reading_score: number
    correct_questions: number
    total_questions: number
    time_spent_seconds: number
    submitted_at: string
  }>>({
    queryKey: toeicKeys.history(),
    queryFn: async () => {
      const res = await examService.getMyExamHistory()
      return Array.isArray(res) ? (res as unknown as Array<{
        _id: string
        exam_id: string
        exam_title: string
        exam_code?: string
        exam_type: string
        attempt_type?: string
        is_system_placement?: boolean
        total_scaled_score: number
        listening_score: number
        reading_score: number
        correct_questions: number
        total_questions: number
        time_spent_seconds: number
        submitted_at: string
      }>) : []
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useCourseTestAttemptsQuery(enabled = true) {
  return useQuery<Array<{
    attempt_id: string
    course_id: string
    test_type: string
    order_index?: number
    score: number
    is_passed: boolean
    submitted_at: string
    correct_count?: number
    total_questions?: number
  }>>({
    queryKey: toeicKeys.courseAttempts(),
    queryFn: async () => {
      const res = await courseService.getMyCourseTestAttempts()
      return Array.isArray(res) ? res : []
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useExamAttemptResultQuery(attemptId: string, enabled = true) {
  return useQuery<ExamResult>({
    queryKey: toeicKeys.attempt(attemptId),
    queryFn: () => examService.getExamAttemptResult(attemptId),
    enabled: Boolean(attemptId) && enabled,
    staleTime: 5 * 60 * 1000,
  })
}
