// Store Zustand quản lý danh sách các khóa học học viên đã mua đồng bộ với TanStack Query.
import { create } from 'zustand'
import { courseService } from '@/features/courses/services/course.service'
import { storage, STORAGE_KEYS } from '@/lib/storage'
import { getQueryClient } from '@/config/query.config'
import { courseKeys } from '@/features/courses/keys/course.keys'
import type { User } from '@/features/user/schemas/user.schema'

interface EnrollmentState {
  enrolledCourseIds: string[]
  isLoading: boolean
  fetchMyEnrollments: () => Promise<void>
  isEnrolled: (courseIdOrSlug: string) => boolean
  addEnrolledCourse: (courseId: string) => void
}

interface EnrollmentItem {
  course_id?: string
  course?: {
    _id?: string
    id?: string
    slug?: string
  }
}

export const useEnrollmentStore = create<EnrollmentState>((set, get) => ({
  enrolledCourseIds: [],
  isLoading: false,

  fetchMyEnrollments: async () => {
    if (get().isLoading) return
    set({ isLoading: true })
    try {
      const enrollments = await courseService.getMyEnrolledCourses()
      getQueryClient().setQueryData(courseKeys.enrollments(), enrollments)
      if (Array.isArray(enrollments)) {
        const ids: string[] = []
        ;(enrollments as EnrollmentItem[]).forEach((e) => {
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

    const authUser = storage.get<User>(STORAGE_KEYS.USER)
    if (authUser?.is_premium || authUser?.role === 'ADMIN' || authUser?.role === 'INSTRUCTOR') {
      return true
    }
    return get().enrolledCourseIds.includes(String(courseIdOrSlug))
  },

  addEnrolledCourse: (courseId: string) => {
    set((state) => ({
      enrolledCourseIds: Array.from(new Set([...state.enrolledCourseIds, String(courseId)])),
    }))
    getQueryClient().invalidateQueries({ queryKey: courseKeys.enrollments() })
  },
}))
