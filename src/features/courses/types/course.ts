// Định nghĩa các kiểu dữ liệu và giao diện TypeScript cho module khóa học.

export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed'
export type ChapterStatus = 'locked' | 'available' | 'in-progress' | 'completed'
export type TestType = 'challenge' | 'exercise' | 'post-mini' | 'pre' | 'final'

export interface CourseProgress {
  courseId: string
  startedAt: string
  completedLessons: number
  totalLessons: number
  completedChapters: number
  totalChapters: number
  baselineScore: BaselineScore | null
  currentChapterIndex: number
  currentLessonId: string | null
  currentProgress: number
}

export interface BaselineScore {
  listening: number
  reading: number
  speaking: number
  writing: number
  establishedAt: string
}

export interface TestResult {
  testType: TestType
  chapterId?: string
  score: number
  listeningScore?: number
  readingScore?: number
  speakingScore?: number
  writingScore?: number
  completedAt: string
  improvement?: number
}

export interface LessonResource {
  id: string
  title: string
  type?: 'pdf' | 'audio' | 'doc' | 'code' | 'external'
  url: string
  size?: string
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
  id: string
  chapterId: string
  order: number
  title: string
  type: 'video' | 'audio' | 'reading' | 'mixed'
  duration: number 
  status: LessonStatus
  progress: number 
  videoUrl?: string
  is_free_preview?: boolean
  is_preview?: boolean
  resources?: LessonResource[]
  content: LessonContent
  theory_file_url?: string
  theory_file_name?: string
  questions?: LessonQuestion[]
}

export interface LessonContent {
  videoUrl?: string
  sections: LessonSection[]
}

export interface LessonSection {
  id: string
  title: string
  type: 'introduction' | 'vocabulary' | 'grammar' | 'practice' | 'summary'
  content: string
}

export interface ChapterExercise {
  id: string
  chapterId: string
  title: string
  questionsCount: number
  skills: string[]
  status: LessonStatus
  result?: TestResult
}

export interface PostMiniTest {
  id: string
  chapterId: string
  title: string
  questionsCount: number
  skills: string[]
  difficulty: string
  status: LessonStatus
  result?: TestResult
}

export interface ChallengeTest {
  id: string
  chapterId: string
  title: string
  questionsCount: number
  passingScore: number
  durationMinutes?: number
  status: LessonStatus
  result?: TestResult
}

export interface Chapter {
  id: string
  courseId: string
  course_id?: string
  order: number
  title: string
  description: string
  theory_file_url?: string
  theory_file_name?: string
  lessons: Lesson[]
  exercise?: ChapterExercise
  postMiniTest?: PostMiniTest
  challengeTest?: ChallengeTest
  challenge_duration_minutes?: number
  duration_minutes?: number
  challenge_questions?: Array<Record<string, unknown>>
  post_mini_questions?: Array<Record<string, unknown>>
  test_questions?: Array<Record<string, unknown>>
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
  challenge_passing_score?: number
  status: ChapterStatus
}

export interface CourseInstructor {
  name: string
  title: string
  avatar: string
  rating: number
  ratingCount?: number
  studentsCount: number
  coursesCount: number
  bio: string
}

export interface QnAAnswer {
  id: string
  author: string
  authorAvatar?: string
  authorRole?: string
  body: string
  createdAt: string
  upvotes: number
}

export interface QnAItem {
  id: string
  lessonId?: string
  lessonTitle?: string
  userId?: string
  author: string
  authorAvatar?: string
  authorRole?: string
  isAnonymous?: boolean
  title: string
  body: string
  createdAt: string
  upvotes: number
  answersCount: number
  isAnswered: boolean
  answers?: QnAAnswer[]
}

export interface NoteItem {
  id: string
  lessonId: string
  lessonTitle: string
  timestamp: number
  formattedTime: string
  content: string
  createdAt: string
}

export interface CourseReviewItem {
  id: string
  author: string
  authorAvatar?: string
  rating: number
  date: string
  content: string
}

export interface CourseAnnouncement {
  id: string
  title: string
  date: string
  author: string
  authorAvatar?: string
  content: string
}

export interface Course {
  id: string
  _id?: string
  title: string
  description: string
  duration: string
  duration_minutes?: number
  totalChapters: number
  totalLessons: number
  totalHours?: number
  rating?: number
  ratingCount?: number
  studentsCount?: number
  is_bestseller?: boolean
  badge?: string
  updatedAt?: string
  language?: string
  instructor?: CourseInstructor
  whatYouWillLearn?: string[]
  overview?: {
    whatYouWillLearn?: string[]
    requirements?: string[]
    targetAudience?: string[]
  }
  progress?: CourseProgress
  chapters: Chapter[]
  category?: string
  skills?: string[]
  thumbnail?: string
  thumbnail_url?: string
  document_url?: string
  document_name?: string
  target_score?: number
  price?: number
  discount_price?: number
  qna?: QnAItem[]
  notes?: NoteItem[]
  reviews?: CourseReviewItem[]
  announcements?: CourseAnnouncement[]
  final_test_questions?: import('@/features/courses/types/test.runner.types').CourseTestQuestion[]
  final_test_duration_minutes?: number
  final_test_audio_url?: string
  final_test_speaking_prompt?: string
  final_test_speaking_file_url?: string
  final_test_writing_prompt?: string
  final_test_writing_file_url?: string
  preTest?: {
    status: LessonStatus
    result?: TestResult
  }
  finalTest?: {
    status: LessonStatus
    result?: TestResult
  }
}

export type CourseTabType = 'all' | 'my-courses' | 'wishlist'

export interface CourseCardData {
  id: string
  slug?: string
  title: string
  instructor: string
  thumbnail: string
  category: string
  description: string
  duration: string
  totalLessons: number
  chapters: number
  students: number
  rating: number
  ratingCount: number
  price: number
  discountPrice?: number
  targetScore?: number
  badge?: string
  is_bestseller?: boolean
  progress?: number
  hasCertificate?: boolean
  isArchived?: boolean
}

export interface FinalTestAttemptItem {
  attempt_id?: string
  score: number
  total_questions?: number
  correct_count?: number
  is_passed?: boolean
  submitted_at?: string | Date
}

export interface ModuleAttemptItem {
  attempt_id?: string
  test_type?: string
  score: number
  is_passed?: boolean
  submitted_at?: string | Date
}

export interface ModuleProgressInfo {
  module_id?: string
  order_index?: number
  status?: string
  challenge_score?: number
  challenge_taken?: boolean
  is_passed_by_challenge?: boolean
  post_mini_score?: number
  is_locked_by_reminder?: boolean
  attempts?: ModuleAttemptItem[]
}

export interface CourseProgressDetailInfo {
  course_progress?: {
    schedule?: import('@/features/courses/types/schedule.types').CourseStudySchedule
    lock_state?: import('@/features/courses/types/schedule.types').CourseChapterLockState
    last_video_watched_at?: string
    is_baseline_established?: boolean
    baseline_score?: number
    baseline_source?: string
    total_score_growth?: number
    total_growth_percentage?: number
    growth_chart_data?: import('@/features/courses/components/course.growth.chart').GrowthPoint[]
    final_test_score?: number
    final_test_attempts?: FinalTestAttemptItem[]
  }
  modules_progress?: ModuleProgressInfo[]
  completed_lesson_ids?: string[]
}

