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
}
