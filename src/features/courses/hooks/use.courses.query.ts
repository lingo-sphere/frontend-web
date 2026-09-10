// Custom hook quản lý truy vấn và thao tác khóa học bằng TanStack Query.
'use client'

import { useQuery, useMutation, useQueryClient, queryOptions, type QueryClient } from '@tanstack/react-query'
import { courseService } from '@/features/courses/services/course.service'
import { courseKeys } from '@/features/courses/keys/course.keys'

export type CourseQueryParams = {
  category?: string
  level?: string
  search?: string
  limit?: number
  is_published?: boolean
}

export const courseQueries = {
  list: (params?: CourseQueryParams, enabled = true) =>
    queryOptions({
      queryKey: courseKeys.list(params),
      queryFn: () => courseService.getAllCourses(params),
      enabled,
      staleTime: 5 * 60 * 1000,
    }),
  detail: (courseId: string, enabled = true) =>
    queryOptions({
      queryKey: courseKeys.detail(courseId),
      queryFn: () => courseService.getCourseById(courseId),
      enabled: Boolean(courseId) && enabled,
      staleTime: 5 * 60 * 1000,
    }),
  enrollments: (enabled = true) =>
    queryOptions({
      queryKey: courseKeys.enrollments(),
      queryFn: () => courseService.getMyEnrolledCourses(),
      enabled,
      staleTime: 2 * 60 * 1000,
    }),
}

export function useAllCoursesQuery(params?: CourseQueryParams, enabled = true) {
  return useQuery(courseQueries.list(params, enabled))
}

export function useCourseDetailQuery(courseId: string, enabled = true) {
  return useQuery(courseQueries.detail(courseId, enabled))
}

export function useMyEnrollmentsQuery(enabled = true) {
  return useQuery(courseQueries.enrollments(enabled))
}

export function prefetchCourseDetail(queryClient: QueryClient, courseId: string) {
  return queryClient.prefetchQuery(courseQueries.detail(courseId))
}

export function useEnrollCourseMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (courseId: string) => courseService.enrollCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseKeys.enrollments() })
    },
  })
}

