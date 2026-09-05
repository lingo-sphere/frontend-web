/**
 * @file enrollment.store.ts
 * @description Store Zustand quản lý danh sách các khóa học học viên đã mua / ghi danh
 */

import { create } from 'zustand'
import { courseService } from '@/services/course.service'

interface EnrollmentState {
  enrolledCourseIds: string[]
  isLoading: boolean
  fetchMyEnrollments: () => Promise<void>
  isEnrolled: (courseIdOrSlug: string) => boolean
  addEnrolledCourse: (courseId: string) => void
}

export const useEnrollmentStore = create<EnrollmentState>((set, get) => ({
  enrolledCourseIds: [],
  isLoading: false,

  fetchMyEnrollments: async () => {
    if (get().isLoading) return
    set({ isLoading: true })
    try {
      const enrollments = await courseService.getMyEnrolledCourses()
      if (Array.isArray(enrollments)) {
        const ids: string[] = []
        enrollments.forEach((e: any) => {
          if (e.course_id) ids.push(String(e.course_id))
          if (e.course?._id) ids.push(String(e.course._id))
          if (e.course?.id) ids.push(String(e.course.id))
          if (e.course?.slug) ids.push(String(e.course.slug))
        })
        set({ enrolledCourseIds: Array.from(new Set(ids)), isLoading: false })
      } else {
        set({ enrolledCourseIds: [], isLoading: false })
      }
    } catch {
      set({ enrolledCourseIds: [], isLoading: false })
    }
  },

  isEnrolled: (courseIdOrSlug: string) => {
    if (!courseIdOrSlug) return false

    try {
      const authUser = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lingosphere_user') || '{}') : null
      if (authUser?.is_premium || authUser?.role === 'ADMIN' || authUser?.role === 'INSTRUCTOR') {
        return true
      }
    } catch {}
    return get().enrolledCourseIds.includes(String(courseIdOrSlug))
  },

  addEnrolledCourse: (courseId: string) => {
    set((state) => ({
      enrolledCourseIds: Array.from(new Set([...state.enrolledCourseIds, String(courseId)])),
    }))
  },
}))
