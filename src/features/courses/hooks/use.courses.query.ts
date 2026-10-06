// Custom hook quản lý truy vấn và thao tác khóa học bằng TanStack Query.
'use client'

import { useMemo, useCallback, useEffect } from 'react'
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
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true,
    }),
  detail: (courseId: string, enabled = true) =>
    queryOptions({
      queryKey: courseKeys.detail(courseId),
      queryFn: () => courseService.getCourseById(courseId),
      enabled: Boolean(courseId) && enabled,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true,
    }),
  bestsellers: (category?: string, enabled = true) =>
    queryOptions({
      queryKey: courseKeys.bestsellers(category),
      queryFn: () => courseService.getBestsellers(category ? { category } : undefined),
      enabled,
      staleTime: 60 * 1000,
      refetchOnWindowFocus: true,
    }),
  enrollments: (enabled = true) =>
    queryOptions({
      queryKey: courseKeys.enrollments(),
      queryFn: () => courseService.getMyEnrolledCourses(),
      enabled,
      staleTime: 2 * 60 * 1000,
    }),
  enrollmentStatus: (courseId: string, enabled = true) =>
    queryOptions({
      queryKey: [...courseKeys.detail(courseId), 'enrollment-status'] as const,
      queryFn: () => courseService.getEnrollmentStatus(courseId),
      enabled: Boolean(courseId) && enabled,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true,
    }),
  reviews: (courseId: string, enabled = true) =>
    queryOptions({
      queryKey: [...courseKeys.detail(courseId), 'reviews'] as const,
      queryFn: () => courseService.getCourseReviews(courseId),
      enabled: Boolean(courseId) && enabled,
      staleTime: 5 * 60 * 1000,
    }),
  qna: (courseId: string, enabled = true) =>
    queryOptions({
      queryKey: [...courseKeys.detail(courseId), 'qna'] as const,
      queryFn: () => courseService.getCourseQnA(courseId),
      enabled: Boolean(courseId) && enabled,
      staleTime: 2 * 60 * 1000,
    }),
  progress: (courseId: string, enabled = true) =>
    queryOptions({
      queryKey: [...courseKeys.detail(courseId), 'progress'] as const,
      queryFn: () => courseService.getCourseProgressDetail(courseId),
      enabled: Boolean(courseId) && enabled,
      staleTime: 1 * 60 * 1000,
    }),
}

export function useAllCoursesQuery(params?: CourseQueryParams, enabled = true) {
  return useQuery(courseQueries.list(params, enabled))
}

export function useCourseDetailQuery(courseId: string, enabled = true) {
  return useQuery(courseQueries.detail(courseId, enabled))
}

export function useCourseEnrollmentStatusQuery(courseId: string, enabled = true) {
  return useQuery(courseQueries.enrollmentStatus(courseId, enabled))
}

export function useCourseReviewsQuery(courseId: string, enabled = true) {
  return useQuery(courseQueries.reviews(courseId, enabled))
}

export function useCourseQnAQuery(courseId: string, enabled = true) {
  return useQuery(courseQueries.qna(courseId, enabled))
}

export function useCourseProgressQuery(courseId: string, enabled = true) {
  return useQuery(courseQueries.progress(courseId, enabled))
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

  useEffect(() => {
    if (typeof document === 'undefined') return
    const authUser = storage.get<User>(STORAGE_KEYS.USER)
    if (authUser?.is_premium || authUser?.role === 'INSTRUCTOR') {
      storage.cookie.set(STORAGE_KEYS.IS_PRIVILEGED, 'true', { days: 30, path: '/' })
    }
    enrolledCourseIds.forEach((id) => {
      storage.cookie.set(STORAGE_KEYS.COURSE_ENROLLED(id), 'true', { days: 30, path: '/' })
      localStorage.setItem(STORAGE_KEYS.COURSE_ENROLLED(id), 'true')
    })
  }, [enrolledCourseIds])

  const isEnrolled = useCallback(
    (courseIdOrSlug: string) => {
      if (!courseIdOrSlug) return false
      const authUser = storage.get<User>(STORAGE_KEYS.USER)
      if (authUser?.is_premium || authUser?.role === 'INSTRUCTOR') {
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

export function useBestsellerCoursesQuery(category?: string, enabled = true) {
  return useQuery(courseQueries.bestsellers(category, enabled))
}

