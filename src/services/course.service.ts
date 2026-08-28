import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Course, Chapter, Lesson, CourseEnrollment } from '@/types/api.types'

export const courseService = {

  async getAllCourses(params?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
    return api.get<Course[]>(API_CONFIG.ENDPOINTS.COURSES.LIST, params)
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
}
