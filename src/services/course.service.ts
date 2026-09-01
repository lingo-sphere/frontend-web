/**
 * @file course.service.ts
 * @description Service xử lý các logic nghiệp vụ chính cho dịch vụ course
 */

import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Course, Chapter, Lesson, CourseEnrollment } from '@/types/api.types'

export const courseService = {

  async getAllCourses(params?: { category?: string; level?: string; search?: string; limit?: number; is_published?: boolean }): Promise<Course[]> {
    const res = await api.get<{ result?: Course[]; data?: Course[]; meta?: unknown } | Course[]>(API_CONFIG.ENDPOINTS.COURSES.LIST, {
      is_published: true,
      ...params,
    })
    let items: Course[] = []
    if (Array.isArray(res)) items = res
    else if (res && Array.isArray((res as { result?: Course[] }).result)) items = (res as { result: Course[] }).result
    else if (res && Array.isArray((res as { data?: Course[] }).data)) items = (res as { data: Course[] }).data
    return items.filter((c) => c && (c as unknown as { is_published?: boolean }).is_published !== false)
  },

  async getCourseById(id: string): Promise<Course> {
    return api.get<Course>(API_CONFIG.ENDPOINTS.COURSES.BY_ID(id))
  },

  async getCourseChapters(courseId: string): Promise<Chapter[]> {
    return api.get<Chapter[]>(API_CONFIG.ENDPOINTS.COURSES.CHAPTERS(courseId))
  },

  async getChapterLessons(chapterId: string): Promise<Lesson[]> {
    return api.get<Lesson[]>(API_CONFIG.ENDPOINTS.COURSES.LESSONS(chapterId))
  },

  async getLessonById(lessonId: string): Promise<Lesson> {
    return api.get<Lesson>(API_CONFIG.ENDPOINTS.COURSES.LESSON_BY_ID(lessonId))
  },

  async enrollCourse(courseId: string): Promise<CourseEnrollment> {
    return api.post<CourseEnrollment>(API_CONFIG.ENDPOINTS.COURSES.ENROLL(courseId))
  },

  async getMyEnrolledCourses(): Promise<CourseEnrollment[]> {
    return api.get<CourseEnrollment[]>(API_CONFIG.ENDPOINTS.COURSES.MY_ENROLLED)
  },

  async getRecommendedCourses(params?: {
    total_score?: number
    listening_score?: number
    reading_score?: number
    speaking_score?: number
    weak_skills?: string[]
  }): Promise<{
    learner_score?: {
      total: number
      listening: number
      reading: number
      identified_weak_skill?: string | null
    }
    target_band?: string
    level_label?: string
    recommendations: (Course & { recommendation_reason?: string; match_score?: number })[]
  }> {
    const queryParams: Record<string, string | number> = {}
    if (params?.total_score !== undefined) queryParams.total_score = params.total_score
    if (params?.listening_score !== undefined) queryParams.listening_score = params.listening_score
    if (params?.reading_score !== undefined) queryParams.reading_score = params.reading_score
    if (params?.speaking_score !== undefined) queryParams.speaking_score = params.speaking_score
    if (params?.weak_skills && params.weak_skills.length > 0) queryParams.weak_skills = params.weak_skills.join(',')

    return api.get(API_CONFIG.ENDPOINTS.COURSES.RECOMMENDATIONS, queryParams)
  },

  async completeLesson(data: {
    course_id: string
    module_id: string
    lesson_id: string
    score?: number
    time_spent_seconds?: number
  }): Promise<unknown> {
    return api.post('/progress/lessons/complete', data)
  },

  async getCourseProgressDetail(courseId: string): Promise<{
    course_progress?: {
      completed_lessons_count?: number
      total_lessons_count?: number
      progress_percentage?: number
    }
    modules_progress?: Array<{
      module_id: string
      status: string
    }>
    completed_lesson_ids?: string[]
  }> {
    return api.get(`/progress/courses/${courseId}/detail`)
  },
}
