
export interface ApiResponse<T = unknown> {
  statusCode: number
  message: string
  data: T
  correlationId?: string
  timestamp?: string
}

export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'LEARNER' | 'USER'
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING'

export interface User {
  _id?: string
  id: string
  user_id?: string
  email: string
  full_name: string
  phone_number?: string
  avatar_url?: string
  role: UserRole
  status: AccountStatus
  is_email_verified?: boolean
  bio?: string
  level?: string
  target_score?: number
  xp?: number
  streak_count?: number
  created_at?: string
  updated_at?: string
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
}

export interface Lesson {
  id: string
  _id?: string
  title: string
  description?: string
  video_url?: string
  duration_seconds: number
  order_index: number
  is_free_preview: boolean
  lesson_notes?: string
}

export interface Chapter {
  id: string
  _id?: string
  title: string
  description?: string
  order_index: number
  lessons: Lesson[]
}

export interface Course {
  id: string
  _id?: string
  title: string
  slug: string
  description: string
  thumbnail_url?: string
  target_score?: number
  skills?: string[]
  price: number
  discount_price?: number
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  category: string
  instructor_id?: string
  instructor_name?: string
  total_lessons: number
  total_duration_minutes: number
  rating_avg: number
  rating_count: number
  is_published: boolean
  chapters?: Chapter[]
  created_at?: string
  updated_at?: string
}

export interface CourseEnrollment {
  id: string
  course_id: string
  user_id: string
  progress_percent: number
  completed_lessons: string[]
  last_accessed_at: string
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
  id: string
  _id?: string
  title: string
  description?: string
  thumbnail_url?: string
  cefr_level?: string
  total_cards: number
  is_public: boolean
  creator_id?: string
  cards?: LexicalItem[]
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
  xp: number
  level: number
  streak_days: number
  freeze_streak_count: number
  rank_title: string
  rank_tier: string
  weekly_xp: number
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
