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
  phone_number?: string
  avatar_url?: string
  date_of_birth?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string
  role: UserRole
  status: AccountStatus
  is_email_verified?: boolean
  bio?: string
  level?: string
  target_score?: number
  target_toeic_score?: number
  current_estimated_score?: number
  placement_test_score?: number
  placement_listening_score?: number
  placement_reading_score?: number
  placement_tested_at?: string
  xp?: number
  streak_count?: number
  is_premium?: boolean
  subscription_expires_at?: string
  subscription_plan?: string
  created_at?: string
  updated_at?: string
}

export interface UserProfileResponse {
  profile: User
  is_premium: boolean
  subscription_expires_at?: string
  subscription_plan?: string
  gamification?: GamificationProfile
  settings?: Record<string, unknown>
  subscription?: Record<string, unknown>
}

export interface UpdateUserProfilePayload {
  full_name?: string
  avatar_url?: string
  phone_number?: string
  gender?: 'MALE' | 'FEMALE' | 'OTHER'
  date_of_birth?: string
  target_toeic_score?: number
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
}

export interface CourseModule {
  _id: string
  id?: string
  course_id?: string
  title: string
  description?: string
  order_index: number
  is_free_preview?: boolean
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
  target_score?: number
  skills?: string[]
  price: number
  discount_price?: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | string
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
  is_published: boolean
  approval_status?: string
  modules?: CourseModule[]
  chapters?: CourseModule[]
  created_at?: string
  updated_at?: string
}

export interface CourseCurriculumResponse {
  course: Course
  total_modules: number
  total_lessons: number
  curriculum: CourseModule[]
}

export interface CourseEnrollment {
  id: string
  course_id: string
  user_id: string
  progress_percent: number
  completed_lessons: string[]
  last_accessed_at: string
}

export interface LearningRoadmapStage {
  stage_order: number
  stage_title: string
  stage_description?: string
  course_id: string
  target_band?: string
  checkpoint_exam_id?: string
  passing_score?: number
  is_optional?: boolean
  course?: Course | null
}

export interface LearningRoadmap {
  _id: string
  title: string
  slug: string
  description?: string
  skills_focus: '2SKILLS' | '4SKILLS'
  target_score: number
  min_entry_score: number
  max_entry_score: number
  stages: LearningRoadmapStage[]
  bundle_price?: number
  original_price?: number
  version?: number
  is_published: boolean
  created_at?: string
  updated_at?: string
}

export interface StageMilestone {
  stage_order: number
  course_id: string
  course_title?: string
  status: 'LOCKED' | 'IN_PROGRESS' | 'COMPLETED'
  completed_at?: string
  checkpoint_score?: number
  checkpoint_passed?: boolean
  score_growth?: number
}

export interface GrowthChartPoint {
  milestone_name: string
  score: number
  date?: string
  target?: number
}

export interface UserRoadmapProgress {
  _id: string
  user_id: string
  roadmap_id: string
  roadmap?: LearningRoadmap | null
  enrolled_at: string
  baseline_score: number
  current_estimated_score: number
  current_stage_order: number
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
  completed_at?: string
  stage_milestones: StageMilestone[]
  growth_chart_data: GrowthChartPoint[]
  created_at?: string
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
  user_name: string
  user_avatar?: string
  xp: number
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
