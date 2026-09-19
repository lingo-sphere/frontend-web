// Handles TypeScript definitions for frontend-web application.

export interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  data: T
  correlationId?: string
  timestamp?: string
}

export interface PaginationMeta {
  current: number
  pageSize: number
  pages: number
  total: number
}

export interface PaginatedResult<T> {
  meta: PaginationMeta
  result: T[]
}

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT' | 'USER'
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING'

export interface User {
  user_id: string
  email: string
  full_name: string
  phone_number?: string | null
  avatar_url?: string | null
  date_of_birth?: string | null
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string | null
  role: UserRole
  status: AccountStatus
  is_email_verified?: boolean
  bio?: string | null
  level?: string | null
  target_score?: number | null
  target_toeic_score?: number | null
  current_estimated_score?: number | null
  placement_test_score?: number | null
  placement_listening_score?: number | null
  placement_reading_score?: number | null
  placement_speaking_score?: number | null
  placement_writing_score?: number | null
  placement_skills_type?: '2SKILLS' | '4SKILLS' | string | null
  placement_tested_at?: string | null
  is_score_manually_edited?: boolean
  xp?: number
  streak_count?: number
  is_premium?: boolean
  subscription_expires_at?: string | null
  subscription_plan?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface UserProfileResponse {
  profile: User
  is_premium: boolean
  subscription_expires_at?: string | null
  subscription_plan?: string | null
  gamification?: GamificationProfile | null
  settings?: Record<string, unknown> | null
  subscription?: Record<string, unknown> | null
}

export interface UpdateUserProfilePayload {
  full_name?: string
  avatar_url?: string
  phone_number?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string
  date_of_birth?: string
  target_toeic_score?: number
  current_estimated_score?: number
  placement_test_score?: number
  placement_listening_score?: number
  placement_reading_score?: number
  placement_speaking_score?: number
  placement_writing_score?: number
  placement_skills_type?: '2SKILLS' | '4SKILLS' | string
  placement_tested_at?: string
  is_score_manually_edited?: boolean
  learning_goal_minutes_per_day?: number
  bio?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token?: string
  expires_in?: number
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token?: string
}

export interface RegisterResponse {
  message?: string
  email?: string
  expire_minutes?: number
  user?: User
  access_token?: string
  refresh_token?: string
}

export interface LoginPayload {
  email?: string
  username?: string
  password?: string
  remember_me?: boolean
  rememberMe?: boolean
}

export interface RegisterPayload {
  email: string
  password: string
  full_name: string
  phone_number?: string
}

export interface VerifyEmailOtpPayload {
  email: string
  otp: string
}

export interface ResendOtpPayload {
  email: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface ResetPasswordPayload {
  email: string
  otp: string
  new_password: string
}

export interface SocialLoginPayload {
  provider: 'GOOGLE' | 'FACEBOOK'
  token: string
  remember_me?: boolean
  rememberMe?: boolean
}

export interface LessonQuestion {
  _id?: string
  id?: string
  question_text: string
  options: string[]
  correct_answer: string
  explanation?: string | null
  media_url?: string | null
  audio_url?: string | null
  image_url?: string | null
}

export interface Lesson {
  _id: string
  id?: string
  module_id?: string
  course_id?: string
  title: string
  description?: string
  lesson_type?: string
  content_html?: string
  video_url?: string
  duration_seconds: number
  order_index: number
  is_free_preview: boolean
  lesson_notes?: string
  theory_file_url?: string
  theory_file_name?: string
  questions?: LessonQuestion[]
}

export interface CourseModule {
  _id: string
  id?: string
  course_id?: string
  title: string
  description?: string
  order_index: number
  is_free_preview?: boolean
  theory_file_url?: string
  theory_file_name?: string
  challenge_test_exam_id?: string
  challenge_passing_score?: number
  challenge_duration_minutes?: number
  challenge_questions?: Array<Record<string, unknown>>
  post_mini_test_exam_id?: string
  post_mini_passing_score?: number
  post_mini_duration_minutes?: number
  post_mini_questions?: Array<Record<string, unknown>>
  test_audio_url?: string
  challenge_audio_url?: string
  audio_url?: string
  speaking_prompt?: string
  speaking_file_url?: string
  speaking_prompt_file_url?: string
  writing_prompt?: string
  writing_file_url?: string
  writing_prompt_file_url?: string
  test_speaking_prompt?: string
  test_speaking_file_url?: string
  test_writing_prompt?: string
  test_writing_file_url?: string
  challengeTest?: { passingScore?: number }
  lessons?: Lesson[]
}

export type Chapter = CourseModule

export interface Course {
  _id: string
  id?: string
  title: string
  slug: string
  description: string
  thumbnail_url?: string
  document_url?: string
  document_name?: string
  target_score?: number
  skills?: string[]
  price: number
  discount_price?: number
  category: string
  instructor_id?: string
  instructor_name?: string
  author_id?: string
  author_name?: string
  author_avatar?: string
  total_modules?: number
  total_lessons: number
  total_duration_minutes?: number
  rating?: number
  rating_avg?: number
  rating_count?: number
  students_count?: number
  is_bestseller?: boolean
  is_published: boolean
  approval_status?: string
  final_test_exam_id?: string
  final_test_passing_score?: number
  final_test_duration_minutes?: number
  final_test_questions?: Array<Record<string, unknown>>
  final_test_speaking_prompt?: string
  final_test_speaking_file_url?: string
  final_test_writing_prompt?: string
  final_test_writing_file_url?: string
  modules?: CourseModule[]
  chapters?: CourseModule[]
  curriculum?: CourseModule[]
  course?: Course
  created_at?: string | Date
  updated_at?: string | Date
}

export interface CourseCurriculumResponse {
  course: Course
  total_modules: number
  total_lessons: number
  curriculum: CourseModule[]
}

export interface CourseEnrollment {
  _id?: string
  id?: string
  course_id: string
  user_id: string
  status?: string
  enrolled_at?: string
  progress_percent?: number
  completed_lessons?: string[]
  last_accessed_at?: string
  course?: Course | null
}

export interface UserCourseProgressItem {
  _id?: string
  user_id: string
  course_id: string
  enrolled_at?: string
  baseline_source?: string
  baseline_score?: number
  is_baseline_established?: boolean
  completed_lessons_count: number
  total_lessons_count: number
  completed_modules_count: number
  total_modules_count: number
  progress_percentage: number
  status: string
  final_test_score?: number
  final_test_attempts?: Array<{
    attempt_id: string
    score: number
    correct_count: number
    total_questions: number
    is_passed: boolean
    submitted_at: string
  }>
  total_score_growth?: number
  total_growth_percentage?: number
  growth_chart_data?: Array<{
    stage: string
    score: number
    timestamp?: string
  }>
  updated_at?: string
}

export interface LexicalItem {
  id: string
  _id?: string
  word: string
  ipa: string
  meaning_vi: string
  meaning_en?: string
  part_of_speech: string
  cefr_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
  example_sentence: string
  example_translation_vi: string
  audio_url?: string
  image_url?: string
  topic_tags?: string[]
}

export interface Deck {
  _id: string
  name: string
  name_vi?: string
  description?: string
  description_vi?: string
  thumbnail_url?: string
  cefr_level?: string
  card_count: number
  visibility?: 'PUBLIC' | 'PRIVATE' | string
  creator_id?: string
  cards?: LexicalItem[]
  tags?: string[]
  category?: string
  created_at?: string
  updated_at?: string
}

export interface SpacedRepetitionReviewPayload {
  card_id: string
  rating: 1 | 2 | 3 | 4 | 5 
  time_spent_seconds?: number
}

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D'
  text: string
}

export interface Question {
  id: string
  question_number: number
  part_number: number
  passage_id?: string
  audio_url?: string
  image_url?: string
  question_text: string
  options: QuestionOption[]
  correct_answer?: string
  explanation_vi?: string
}

export interface Exam {
  id: string
  _id?: string
  title: string
  code: string
  type: 'FULL_TEST' | 'MINI_TEST' | 'PRACTICE_PART'
  total_questions: number
  duration_minutes: number
  year?: number
  audio_full_url?: string
  parts?: number[]
  is_active: boolean
}

export interface ExamSubmissionPayload {
  exam_id: string
  answers: Array<{
    question_id: string
    selected_option: string
  }>
  time_spent_seconds: number
}

export interface ExamResult {
  submission_id: string
  exam_id: string
  total_score: number
  listening_score: number
  reading_score: number
  total_correct: number
  total_incorrect: number
  total_skipped: number
  accuracy_percent: number
  part_breakdown: Record<string, { correct: number; total: number; accuracy: number }>
  completed_at: string
}

export interface GamificationProfile {
  total_xp: number
  weekly_xp?: number
  monthly_xp?: number
  level: number
  current_streak: number
  longest_streak: number
  streak_freezes_left?: number
  gems?: number
  league?: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  full_name: string
  user_name?: string
  avatar_url?: string
  user_avatar?: string
  xp: number
  level?: number
  current_streak?: number
  streak_days?: number
  league?: string
  is_current_user?: boolean
}

export interface SpeechAssessmentResult {
  transcribed_text: string
  duration: number
  words: Array<{
    word: string
    start: number
    end: number
    probability: number
  }>
  grammar_score?: number
  pronunciation_score?: number
  fluency_score?: number
  overall_score?: number
  feedback_vi?: string
  better_version?: string
}
