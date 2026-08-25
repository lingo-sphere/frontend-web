
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

export interface Lesson {
  id: string
  chapterId: string
  order: number
  title: string
  type: 'video' | 'audio' | 'reading' | 'mixed'
  duration: number 
  status: LessonStatus
  progress: number 
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
  exercise: ChapterExercise
  postMiniTest: PostMiniTest
  challengeTest: ChallengeTest
  status: ChapterStatus
}

export interface Course {
  id: string
  title: string
  level: string
  description: string
  duration: string
  totalChapters: number
  totalLessons: number
  progress: CourseProgress
  chapters: Chapter[]
  thumbnail?: string
  thumbnail_url?: string
  price?: number
  preTest: {
    status: LessonStatus
    result?: TestResult
  }
  finalTest: {
    status: LessonStatus
    result?: TestResult
  }
}
