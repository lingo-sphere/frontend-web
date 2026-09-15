// Handles course-related API requests for frontend-web.

import { api } from '@/services/api.client'
import { API_CONFIG } from '@/config/api.config'
import type { Course, CourseModule, Chapter, Lesson, CourseEnrollment, LearningRoadmap, LearningRoadmapStage, PaginatedResult, CourseCurriculumResponse } from '@/types/api.types'
import { CourseSchema, LessonSchema, PaginatedCoursesSchema } from '@/features/courses/schemas/course.schema'
import type {
  CourseStudySchedule,
  CourseChapterLockState,
  CourseScheduleResponse,
  UpdateCourseSchedulePayload,
} from '@/features/courses/types/schedule.types'
import type { GradedQuestionItem, TestAttemptItem, WrongQuestionItem } from '@/features/courses/types/test.runner.types'

export interface SpeakingSubmissionResponse {
  _id: string
  ai_score: number
  whisper_transcript: string
  ai_feedback: {
    pronunciation_score: number
    fluency_score: number
    grammar_score: number
    vocabulary_score: number
    detailed_comment: string
    improvement_tips: string[]
  }
  status: string
}

export interface WritingSubmissionResponse {
  _id: string
  ai_score: number
  ai_feedback: {
    fluency_score: number
    grammar_score: number
    vocabulary_score: number
    detailed_comment: string
    improvement_tips: string[]
  }
  status: string
}

export const courseService = {

  async getAllCourses(params?: { category?: string; level?: string; search?: string; limit?: number; is_published?: boolean }): Promise<Course[]> {
    const res = await api.get<PaginatedResult<Course>>(API_CONFIG.ENDPOINTS.COURSES.LIST, {
      is_published: true,
      ...params,
    }, PaginatedCoursesSchema)
    return res.result
  },

  async getCourseById(id: string): Promise<Course> {
    return api.get<Course>(API_CONFIG.ENDPOINTS.COURSES.BY_ID(id), undefined, CourseSchema)
  },

  async getCourseCurriculum(courseId: string): Promise<CourseCurriculumResponse> {
    return api.get<CourseCurriculumResponse>(API_CONFIG.ENDPOINTS.COURSES.CURRICULUM(courseId))
  },

  async getCourseModules(courseId: string): Promise<CourseModule[]> {
    return api.get<CourseModule[]>(API_CONFIG.ENDPOINTS.COURSES.MODULES(courseId))
  },

  async getCourseChapters(courseId: string): Promise<Chapter[]> {
    return api.get<Chapter[]>(API_CONFIG.ENDPOINTS.COURSES.MODULES(courseId))
  },

  async getModuleLessons(moduleId: string): Promise<Lesson[]> {
    return api.get<Lesson[]>(API_CONFIG.ENDPOINTS.COURSES.LESSONS(moduleId))
  },

  async getChapterLessons(chapterId: string): Promise<Lesson[]> {
    return api.get<Lesson[]>(API_CONFIG.ENDPOINTS.COURSES.LESSONS(chapterId))
  },

  async getLessonById(lessonId: string): Promise<Lesson> {
    return api.get<Lesson>(API_CONFIG.ENDPOINTS.COURSES.LESSON_BY_ID(lessonId), undefined, LessonSchema)
  },

  async enrollCourse(courseId: string): Promise<CourseEnrollment> {
    return api.post<CourseEnrollment>(API_CONFIG.ENDPOINTS.COURSES.ENROLL(courseId))
  },

  async unenrollCourse(courseId: string): Promise<{ success: boolean; message: string }> {
    return api.delete(`/courses/${courseId}/enroll`)
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
    category?: string
    current_course_id?: string
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
    if (params?.category) queryParams.category = params.category
    if (params?.current_course_id) queryParams.current_course_id = params.current_course_id

    return api.get(API_CONFIG.ENDPOINTS.COURSES.RECOMMENDATIONS, queryParams)
  },

  async getRecommendedRoadmap(params?: {
    total_score?: number
    listening_score?: number
    reading_score?: number
    speaking_score?: number
    writing_score?: number
    skills_type?: string
  }): Promise<{
    recommended_roadmap: LearningRoadmap & { stages: LearningRoadmapStage[] }
    individual_courses: Course[]
    note?: string
  }> {
    const queryParams: Record<string, string | number> = {}
    if (params?.total_score !== undefined) queryParams.total_score = params.total_score
    if (params?.listening_score !== undefined) queryParams.listening_score = params.listening_score
    if (params?.reading_score !== undefined) queryParams.reading_score = params.reading_score
    if (params?.speaking_score !== undefined) queryParams.speaking_score = params.speaking_score
    if (params?.writing_score !== undefined) queryParams.writing_score = params.writing_score
    if (params?.skills_type) queryParams.skills_type = params.skills_type

    return api.get(API_CONFIG.ENDPOINTS.COURSES.ROADMAP_RECOMMENDATION, queryParams)
  },

  async getAllRoadmaps(params?: { skills_focus?: string; is_published?: boolean }): Promise<LearningRoadmap[]> {
    return api.get<LearningRoadmap[]>(API_CONFIG.ENDPOINTS.COURSES.ROADMAPS, params as Record<string, unknown>)
  },

  async getRoadmapById(id: string): Promise<LearningRoadmap> {
    return api.get<LearningRoadmap>(API_CONFIG.ENDPOINTS.COURSES.ROADMAP_BY_ID(id))
  },

  async completeLesson(data: {
    course_id: string
    module_id: string
    lesson_id: string
    is_completed?: boolean
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
      status?: string
      baseline_source?: string
      baseline_score?: number
      is_baseline_established?: boolean
      total_score_growth?: number
      total_growth_percentage?: number
      final_test_score?: number
      growth_chart_data?: Array<{ stage: string; score: number; timestamp: string }>
      schedule?: CourseStudySchedule
      lock_state?: CourseChapterLockState
      last_video_watched_at?: string
    }
    modules_progress?: Array<{
      module_id: string
      order_index?: number
      status: string
      challenge_score?: number
      challenge_taken?: boolean
      is_passed_by_challenge?: boolean
      post_mini_score?: number
      post_mini_attempt_id?: string
      is_locked_by_reminder?: boolean
      progression_comparison?: {
        previous_stage: string
        previous_score: number
        current_score: number
        score_diff: number
        percentage_improvement: number
        comparison_note: string
      }
    }>
    completed_lesson_ids?: string[]
  }> {
    return api.get(`/progress/courses/${courseId}/detail`)
  },

  async getCourseSchedule(courseId: string): Promise<CourseScheduleResponse> {
    return api.get(`/progress/courses/${courseId}/schedule`)
  },

  async updateCourseSchedule(courseId: string, payload: UpdateCourseSchedulePayload): Promise<CourseScheduleResponse> {
    return api.post(`/progress/courses/${courseId}/schedule`, payload)
  },

  async recordVideoWatchHeartbeat(courseId: string): Promise<{ success: boolean; last_video_watched_at: string }> {
    return api.post(`/progress/courses/${courseId}/heartbeat`, {})
  },

  async submitModuleChallenge(
    courseId: string,
    moduleId: string,
    data: {
      score?: number
      correct_count?: number
      total_questions?: number
      passing_score?: number
      challenge_attempt_id?: string
      order_index?: number
      answers?: Array<{
        question_index?: number
        question_id?: string
        selected_option?: string
        selected_index?: number
      }>
    }
  ): Promise<{
    is_passed: boolean
    score: number
    highest_score?: number
    passing_score: number
    correct_count?: number
    total_questions?: number
    wrong_questions?: WrongQuestionItem[]
    graded_questions?: GradedQuestionItem[]
    status: string
    attempts?: TestAttemptItem[]
    message: string
  }> {
    return api.post(`/progress/courses/${courseId}/modules/${moduleId}/challenge`, data)
  },

  async submitModulePostMini(
    courseId: string,
    moduleId: string,
    data: {
      score?: number
      correct_count?: number
      total_questions?: number
      post_mini_attempt_id?: string
      order_index?: number
      answers?: Array<{
        question_index?: number
        question_id?: string
        selected_option?: string
        selected_index?: number
      }>
    }
  ): Promise<{
    message: string
    module_id: string
    score: number
    highest_score?: number
    is_new_high_score?: boolean
    correct_count?: number
    total_questions?: number
    is_passed?: boolean
    wrong_questions?: WrongQuestionItem[]
    graded_questions?: GradedQuestionItem[]
    attempts?: TestAttemptItem[]
    progression_comparison?: {
      previous_stage: string
      previous_score: number
      current_score: number
      score_diff: number
      percentage_improvement: number
      comparison_note: string
    }
    next_module_unlocked?: string | null
  }> {
    return api.post(`/progress/courses/${courseId}/modules/${moduleId}/post-mini`, data)
  },

  async submitCourseFinalTest(
    courseId: string,
    data: {
      score?: number
      correct_count?: number
      total_questions?: number
      final_test_attempt_id?: string
      answers?: Array<{
        question_index?: number
        question_id?: string
        selected_option?: string
        selected_index?: number
      }>
    }
  ): Promise<{
    message: string
    course_id: string
    final_test_score: number
    highest_score?: number
    is_new_high_score?: boolean
    is_passed?: boolean
    passing_score?: number
    correct_count?: number
    total_questions?: number
    wrong_questions?: WrongQuestionItem[]
    graded_questions?: GradedQuestionItem[]
    final_test_attempts?: TestAttemptItem[]
    baseline_score: number
    total_score_growth: number
    total_growth_percentage: number
    growth_chart_data: Array<{ stage: string; score: number; timestamp: string }>
    status: string
  }> {
    return api.post(`/progress/courses/${courseId}/final-test`, data)
  },

  async explainTestMistakes(
    courseId: string,
    data: {
      test_title?: string
      test_type?: string
      wrong_questions: Array<{
        question_number?: number
        question_text?: string
        user_selected_answer?: string
        correct_answer?: string
        category?: string
      }>
    }
  ): Promise<{
    summary?: string
    overall_advice?: string
    explanations: Array<{
      question_number: number
      question_text: string
      user_selected: string
      correct_answer: string
      why_wrong: string
      why_correct: string
      recommended_topic: string
      study_focus?: string
      trap_identified?: string
    }>
  }> {
    return api.post(`/progress/courses/${courseId}/explain-errors`, data)
  },

  async establishBaseline(
    courseId: string,
    data: { baseline_source: string; baseline_score: number; baseline_skills?: Record<string, number> }
  ): Promise<unknown> {
    return api.post(`/progress/courses/${courseId}/baseline`, data)
  },

  async getGrowthChart(courseId: string): Promise<{
    course_id: string
    baseline_source?: string
    baseline_score?: number
    is_baseline_established?: boolean
    total_score_growth?: number
    total_growth_percentage?: number
    growth_chart_data?: Array<{ stage: string; score: number; timestamp: string }>
  }> {
    return api.get(`/progress/courses/${courseId}/growth-chart`)
  },

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

  async getCourseQnA(
    courseId: string,
    lessonId?: string
  ): Promise<
    Array<{
      _id: string
      course_id: string
      lesson_id?: string
      lesson_title?: string
      user_id?: string
      author_name: string
      author_avatar?: string
      is_anonymous?: boolean
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
      is_anonymous?: boolean
      author_name?: string
      author_avatar?: string
    }
  ): Promise<Record<string, unknown>> {
    return api.post(`/courses/${courseId}/qna`, data)
  },

  async addQnAAnswer(
    qnaId: string,
    data: {
      body: string
      author?: string
      author_role?: string
      author_avatar?: string
    }
  ): Promise<Record<string, unknown>> {
    return api.post(`/courses/qna/${qnaId}/answers`, data)
  },

  async toggleQnAUpvote(qnaId: string): Promise<Record<string, unknown>> {
    return api.post(`/courses/qna/${qnaId}/upvote`)
  },

  async submitSpeakingSubmission(
    courseId: string,
    data: {
      audio_url: string
      module_id?: string
      test_type?: string
      prompt?: string
    }
  ): Promise<SpeakingSubmissionResponse> {
    return api.post(`/progress/courses/${courseId}/speaking`, data)
  },

  async submitWritingSubmission(
    courseId: string,
    data: {
      essay_text: string
      module_id?: string
      test_type?: string
      prompt?: string
    }
  ): Promise<WritingSubmissionResponse> {
    return api.post(`/progress/courses/${courseId}/writing`, data)
  },

  async getMyCourseTestAttempts(): Promise<Array<{
    attempt_id: string
    test_type: string
    course_id: string
    course_title?: string
    module_id?: string
    order_index?: number
    score: number
    correct_count: number
    total_questions: number
    is_passed: boolean
    submitted_at: string
  }>> {
    return api.get('/progress/test-attempts')
  },
}
