/**
 * @file course.ts
 * @description Định nghĩa kiểu dữ liệu TypeScript cho hệ thống giao diện Web
 */

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
  qualities?: Record<string, string>
  resources?: LessonResource[]
  content: LessonContent
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
  order: number
  title: string
  description: string
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
  writing_prompt?: string
  writing_file_url?: string
  test_speaking_prompt?: string
  test_speaking_file_url?: string
  test_writing_prompt?: string
  test_writing_file_url?: string
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
  title: string
  level: string
  description: string
  duration: string
  totalChapters: number
  totalLessons: number
  totalHours?: number
  rating?: number
  ratingCount?: number
  studentsCount?: number
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
  price?: number
  qna?: QnAItem[]
  notes?: NoteItem[]
  reviews?: CourseReviewItem[]
  announcements?: CourseAnnouncement[]
  final_test_questions?: Array<Record<string, unknown>>
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
  level: string
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
  progress?: number
  hasCertificate?: boolean
  isArchived?: boolean
}
