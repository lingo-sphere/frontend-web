import { api } from '@/services/api-client'
import { API_CONFIG } from '@/config/api.config'
import type { Course, Chapter, Lesson, CourseEnrollment } from '@/types/api.types'

export const courseService = {
  // Lấy danh sách tất cả khóa học
  async getAllCourses(params?: { category?: string; level?: string; search?: string }): Promise<Course[]> {
    return api.get<Course[]>(API_CONFIG.ENDPOINTS.COURSES.LIST, params)
  },

  // Lấy chi tiết 1 khóa học
  async getCourseById(id: string): Promise<Course> {
    return api.get<Course>(API_CONFIG.ENDPOINTS.COURSES.BY_ID(id))
  },

  // Lấy danh sách các chương trong khóa học
  async getCourseChapters(courseId: string): Promise<Chapter[]> {
    return api.get<Chapter[]>(API_CONFIG.ENDPOINTS.COURSES.CHAPTERS(courseId))
  },

  // Lấy danh sách các bài học trong chương
  async getChapterLessons(chapterId: string): Promise<Lesson[]> {
    return api.get<Lesson[]>(API_CONFIG.ENDPOINTS.COURSES.LESSONS(chapterId))
  },

  // Lấy chi tiết 1 bài học (Video & Ghi chú)
  async getLessonById(lessonId: string): Promise<Lesson> {
    return api.get<Lesson>(API_CONFIG.ENDPOINTS.COURSES.LESSON_BY_ID(lessonId))
  },

  // Đăng ký tham gia khóa học
  async enrollCourse(courseId: string): Promise<CourseEnrollment> {
    return api.post<CourseEnrollment>(API_CONFIG.ENDPOINTS.COURSES.ENROLL(courseId))
  },

  // Lấy danh sách các khóa học đã đăng ký của tôi
  async getMyEnrolledCourses(): Promise<CourseEnrollment[]> {
    return api.get<CourseEnrollment[]>(API_CONFIG.ENDPOINTS.COURSES.MY_ENROLLED)
  },
}
