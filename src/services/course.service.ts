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

  async getEnrollmentStatus(courseId: string): Promise<{ is_enrolled: boolean; enrolled_at?: string; role?: string }> {
    return api.get(`/courses/${courseId}/enrollment-status`)
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

  // ==================== 1. REVIEWS (ĐÁNH GIÁ) ====================
  async getCourseReviews(courseId: string): Promise<{
    reviews: Array<{
      _id: string
      course_id: string
      user_name: string
      user_avatar?: string
      rating: number
      content: string
      created_at: string
    }>
    rating: number
    rating_count: number
    distribution: Array<{ stars: number; count: number; percent: number }>
  }> {
    return api.get(`/courses/${courseId}/reviews`)
  },

  async createCourseReview(
    courseId: string,
    data: { rating: number; content?: string }
  ): Promise<{
    review: Record<string, unknown>
    rating: number
    rating_count: number
  }> {
    return api.post(`/courses/${courseId}/reviews`, data)
  },

  // ==================== 2. NOTES (GHI CHÚ) ====================
  async getCourseNotes(
    courseId: string,
    lessonId?: string
  ): Promise<
    Array<{
      _id: string
      course_id: string
      lesson_id: string
      lesson_title: string
      timestamp: number
      formatted_time: string
      content: string
      created_at: string
    }>
  > {
    const qs = lessonId ? `?lesson_id=${lessonId}` : ''
    return api.get(`/courses/${courseId}/notes${qs}`)
  },

  async createCourseNote(
    courseId: string,
    data: {
      lesson_id: string
      lesson_title?: string
      timestamp: number
      formatted_time?: string
      content: string
    }
  ): Promise<Record<string, unknown>> {
    return api.post(`/courses/${courseId}/notes`, data)
  },

  async deleteCourseNote(noteId: string): Promise<unknown> {
    return api.delete(`/courses/notes/${noteId}`)
  },

  // ==================== 3. Q&A (HỎI & ĐÁP) ====================
  async getCourseQnA(
    courseId: string,
    lessonId?: string
  ): Promise<
    Array<{
      _id: string
      course_id: string
      lesson_id?: string
      lesson_title?: string
      author_name: string
      author_avatar?: string
      title: string
      body: string
      upvotes: number
      upvoted_user_ids?: string[]
      is_answered: boolean
      answers: Array<{
        id: string
        author: string
        author_role?: string
        author_avatar?: string
        body: string
        created_at: string
        upvotes: number
      }>
      created_at: string
    }>
  > {
    const qs = lessonId ? `?lesson_id=${lessonId}` : ''
    return api.get(`/courses/${courseId}/qna${qs}`)
  },

  async createCourseQnA(
    courseId: string,
    data: {
      lesson_id?: string
      lesson_title?: string
      title: string
      body?: string
    }
  ): Promise<Record<string, unknown>> {
    return api.post(`/courses/${courseId}/qna`, data)
  },

  async addQnAAnswer(
    qnaId: string,
    data: {
      body: string
    }
  ): Promise<Record<string, unknown>> {
    return api.post(`/courses/qna/${qnaId}/answers`, data)
  },

  async toggleQnAUpvote(qnaId: string): Promise<Record<string, unknown>> {
    return api.post(`/courses/qna/${qnaId}/upvote`)
  },
}
