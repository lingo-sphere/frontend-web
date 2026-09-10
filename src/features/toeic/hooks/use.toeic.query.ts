// Custom hook quản lý truy vấn đề thi, lịch sử và kết quả bài làm TOEIC bằng TanStack Query.
'use client'

import { useQuery, queryOptions, type QueryClient } from '@tanstack/react-query'
import { examService } from '@/features/toeic/services/exam.service'
import { courseService } from '@/features/courses/services/course.service'
import { toeicKeys } from '@/features/toeic/keys/toeic.keys'

export type ToeicExamQueryParams = { type?: string; year?: number; search?: string }
export type ToeicHistoryRecord = Awaited<ReturnType<typeof examService.getMyExamHistory>>[number]
export type CourseTestAttemptRecord = Awaited<ReturnType<typeof courseService.getMyCourseTestAttempts>>[number]

export const toeicQueries = {
  exams: (params?: ToeicExamQueryParams, enabled = true) =>
    queryOptions({
      queryKey: toeicKeys.exams(params),
      queryFn: () => examService.getExams(params),
      enabled,
      staleTime: 5 * 60 * 1000,
    }),
  detail: (examId: string, enabled = true) =>
    queryOptions({
      queryKey: toeicKeys.detail(examId),
      queryFn: () => examService.getExamById(examId),
      enabled: Boolean(examId) && enabled,
      staleTime: 5 * 60 * 1000,
    }),
  history: (enabled = true) =>
    queryOptions({
      queryKey: toeicKeys.history(),
      queryFn: async (): Promise<ToeicHistoryRecord[]> => {
        const res = await examService.getMyExamHistory()
        return Array.isArray(res) ? res : []
      },
      enabled,
      staleTime: 60 * 1000,
    }),
  courseAttempts: (enabled = true) =>
    queryOptions({
      queryKey: toeicKeys.courseAttempts(),
      queryFn: async (): Promise<CourseTestAttemptRecord[]> => {
        const res = await courseService.getMyCourseTestAttempts()
        return Array.isArray(res) ? res : []
      },
      enabled,
      staleTime: 60 * 1000,
    }),
  attemptResult: (attemptId: string, enabled = true) =>
    queryOptions({
      queryKey: toeicKeys.attempt(attemptId),
      queryFn: () => examService.getExamAttemptResult(attemptId),
      enabled: Boolean(attemptId) && enabled,
      staleTime: 5 * 60 * 1000,
    }),
}

export function useToeicExamsQuery(params?: ToeicExamQueryParams, enabled = true) {
  return useQuery(toeicQueries.exams(params, enabled))
}

export function useToeicExamDetailQuery(examId: string, enabled = true) {
  return useQuery(toeicQueries.detail(examId, enabled))
}

export function useToeicHistoryQuery(enabled = true) {
  return useQuery(toeicQueries.history(enabled))
}

export function useCourseTestAttemptsQuery(enabled = true) {
  return useQuery(toeicQueries.courseAttempts(enabled))
}

export function useExamAttemptResultQuery(attemptId: string, enabled = true) {
  return useQuery(toeicQueries.attemptResult(attemptId, enabled))
}

export function prefetchToeicExam(queryClient: QueryClient, examId: string) {
  return queryClient.prefetchQuery(toeicQueries.detail(examId))
}

