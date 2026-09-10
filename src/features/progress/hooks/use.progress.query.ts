// Custom hook quản lý truy vấn tiến độ học tập và hồ sơ cá nhân bằng TanStack Query.
'use client'

import { useQuery } from '@tanstack/react-query'
import { progressService, type UserCourseProgressItem, type UserRoadmapProgress } from '@/features/progress/services/progress.service'
import { examService, type ToeicLearningProfile } from '@/features/toeic/services/exam.service'
import { userService, type GamificationProfile } from '@/features/user/services/user.service'
import { vocabularyService } from '@/features/vocabulary/services/vocabulary.service'
import { courseService } from '@/features/courses/services/course.service'
import { progressKeys } from '@/features/progress/keys/progress.keys'
import type { CourseEnrollment } from '@/types/api.types'

export function useCoursesProgressQuery(enabled = true) {
  return useQuery<UserCourseProgressItem[]>({
    queryKey: progressKeys.courses(),
    queryFn: () => progressService.getMyCoursesProgress(),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useEnrolledCoursesQuery(enabled = true) {
  return useQuery<CourseEnrollment[]>({
    queryKey: ['courses', 'enrolled'],
    queryFn: () => courseService.getMyEnrolledCourses(),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useRoadmapProgressQuery(enabled = true) {
  return useQuery<UserRoadmapProgress | null>({
    queryKey: progressKeys.roadmap(),
    queryFn: () => progressService.getMyRoadmapProgress(),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useExamProfileQuery(enabled = true) {
  return useQuery<ToeicLearningProfile | null>({
    queryKey: progressKeys.examProfile(),
    queryFn: () => examService.getMyExamProfile(),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useGamificationProfileQuery(enabled = true) {
  return useQuery<GamificationProfile>({
    queryKey: progressKeys.gamification(),
    queryFn: () => userService.getGamificationProfile(),
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useTestAttemptsQuery(enabled = true) {
  return useQuery<Array<{
    attempt_id: string
    test_type: string
    course_id: string
    module_id?: string
    order_index?: number
    score: number
    correct_count: number
    total_questions: number
    is_passed: boolean
    submitted_at: string
  }>>({
    queryKey: progressKeys.testAttempts(),
    queryFn: async () => {
      const res = await progressService.getMyTestAttempts()
      return Array.isArray(res) ? res : []
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useExamHistoryQuery(enabled = true) {
  return useQuery<Array<{
    _id: string
    exam_title: string
    total_scaled_score: number
    correct_questions: number
    total_questions: number
    submitted_at: string
  }>>({
    queryKey: progressKeys.examHistory(),
    queryFn: async () => {
      const res = await examService.getMyExamHistory()
      return Array.isArray(res) ? res : []
    },
    enabled,
    staleTime: 60 * 1000,
  })
}

export function useVocabProgressQuery(enabled = true) {
  return useQuery<Record<string, unknown> | null>({
    queryKey: progressKeys.vocabProgress(),
    queryFn: async () => {
      try {
        return await vocabularyService.getMyVocabProgress()
      } catch {
        return null
      }
    },
    enabled,
    staleTime: 60 * 1000,
  })
}
