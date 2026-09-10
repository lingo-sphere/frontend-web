// Custom hook quản lý truy vấn và thao tác khóa học bằng TanStack Query.
'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { courseService } from '@/features/courses/services/course.service'
import { courseKeys } from '@/features/courses/keys/course.keys'
import type { Course, CourseEnrollment } from '@/types/api.types'

export function useAllCoursesQuery(
  params?: { category?: string; level?: string; search?: string; limit?: number; is_published?: boolean },
  enabled = true
) {
  return useQuery<Course[]>({
    queryKey: courseKeys.list(params),
    queryFn: () => courseService.getAllCourses(params),
    enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useCourseDetailQuery(courseId: string, enabled = true) {
  return useQuery<Course>({
    queryKey: courseKeys.detail(courseId),
    queryFn: () => courseService.getCourseById(courseId),
    enabled: Boolean(courseId) && enabled,
    staleTime: 5 * 60 * 1000,
  })
}

export function useMyEnrollmentsQuery(enabled = true) {
  return useQuery<CourseEnrollment[]>({
    queryKey: courseKeys.enrollments(),
    queryFn: () => courseService.getMyEnrolledCourses(),
    enabled,
    staleTime: 2 * 60 * 1000,
  })
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
