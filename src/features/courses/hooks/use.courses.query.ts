// Custom hook quản lý truy vấn và thao tác khóa học bằng TanStack Query.
'use client'

import { useMemo, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient, queryOptions, type QueryClient } from '@tanstack/react-query'
import { courseService } from '@/features/courses/services/course.service'
import { courseKeys } from '@/features/courses/keys/course.keys'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import type { User } from '@/features/user/schemas/user.schema'

export type CourseQueryParams = {
  category?: string
  level?: string
  search?: string
  limit?: number
  is_published?: boolean
}

interface EnrollmentItem {
  course_id?: string
  course?: {
    _id?: string
    id?: string
    slug?: string
  }
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

export function useUserEnrollments(enabled = true) {
  const { data: enrollments, isLoading } = useMyEnrollmentsQuery(enabled)

  const enrolledCourseIds = useMemo(() => {
    if (!Array.isArray(enrollments)) return []
    const ids: string[] = []
    ;(enrollments as EnrollmentItem[]).forEach((e) => {
      if (e.course_id) ids.push(String(e.course_id))
      if (e.course?._id) ids.push(String(e.course._id))
      if (e.course?.id) ids.push(String(e.course.id))
      if (e.course?.slug) ids.push(String(e.course.slug))
    })
    return Array.from(new Set(ids))
  }, [enrollments])

  const isEnrolled = useCallback(
    (courseIdOrSlug: string) => {
      if (!courseIdOrSlug) return false
      const authUser = storage.get<User>(STORAGE_KEYS.USER)
      if (authUser?.is_premium || authUser?.role === 'ADMIN' || authUser?.role === 'INSTRUCTOR') {
        return true
      }
      return enrolledCourseIds.includes(String(courseIdOrSlug))
    },
    [enrolledCourseIds],
  )

  return {
    enrollments,
    enrolledCourseIds,
    isEnrolled,
    isLoading,
  }
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

