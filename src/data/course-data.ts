
import type { Course, Chapter, Lesson, LessonStatus, TestResult } from '@/types/course'

const makeLesson = (id: string, chapterId: string, order: number, title: string, status: LessonStatus, progress: number): Lesson => ({
  id,
  chapterId,
  order,
  title,
  type: 'video',
  duration: 340, // ~5:40
  status,
  progress,
  content: {
    videoUrl: 'https://example.com/video.mp4',
    sections: [
      { id: '1', title: 'Introduction', type: 'introduction', content: 'Welcome to this lesson...' },
      { id: '2', title: 'Key Vocabulary', type: 'vocabulary', content: 'Learn new words...' },
      { id: '3', title: 'Grammar', type: 'grammar', content: 'Grammar patterns...' },
      { id: '4', title: 'Practice', type: 'practice', content: 'Practice exercises...' },
    ],
  },
})

const makeTestResult = (score: number, listening: number, reading: number): TestResult => ({
  testType: 'post-mini',
  score,
  listeningScore: listening,
  readingScore: reading,
  completedAt: new Date().toISOString(),
})

const chapter1: Chapter = {
  id: 'ch-01',
  courseId: 'toeic-foundation',
  order: 1,
  title: 'Daily Communication',
  description: 'Basic everyday conversations in English',
  status: 'completed',
  lessons: [
    makeLesson('l-01-01', 'ch-01', 1, 'Greetings', 'completed', 100),
    makeLesson('l-01-02', 'ch-01', 2, 'Introductions', 'completed', 100),
    makeLesson('l-01-03', 'ch-01', 3, 'Daily Routines', 'completed', 100),
    makeLesson('l-01-04', 'ch-01', 4, 'Asking Questions', 'completed', 100),
  ],
  challengeTest: {
    id: 'ct-01',
    chapterId: 'ch-01',
    title: 'Chapter 01 Challenge',
    questionsCount: 10,
    passingScore: 70,
    status: 'completed',
    result: makeTestResult(75, 72, 78),
  },
  exercise: {
    id: 'ex-01',
    chapterId: 'ch-01',
    title: 'Chapter 01 Exercise',
    questionsCount: 10,
    skills: ['Vocabulary', 'Grammar', 'Listening', 'Reading'],
    status: 'completed',
    result: makeTestResult(82, 80, 84),
  },
  postMiniTest: {
    id: 'pm-01',
    chapterId: 'ch-01',
    title: 'Chapter 01 Post-mini Test',
    questionsCount: 20,
    skills: ['Listening', 'Reading'],
    difficulty: 'Equivalent to Challenge Test',
    status: 'completed',
    result: makeTestResult(78, 76, 80),
  },
}

const chapter2: Chapter = {
  id: 'ch-02',
  courseId: 'toeic-foundation',
  order: 2,
  title: 'Workplace English',
  description: 'Professional English for office environments',
  status: 'in-progress',
  lessons: [
    makeLesson('l-02-01', 'ch-02', 1, 'Office Vocabulary', 'completed', 100),
    makeLesson('l-02-02', 'ch-02', 2, 'Meetings', 'completed', 100),
    makeLesson('l-02-03', 'ch-02', 3, 'Workplace Conversations', 'available', 80),
    makeLesson('l-02-04', 'ch-02', 4, 'Email Communication', 'locked', 0),
  ],
  challengeTest: {
    id: 'ct-02',
    chapterId: 'ch-02',
    title: 'Chapter 02 Challenge',
    questionsCount: 10,
    passingScore: 70,
    status: 'completed',
    result: makeTestResult(72, 70, 74),
  },
  exercise: {
    id: 'ex-02',
    chapterId: 'ch-02',
    title: 'Chapter 02 Exercise',
    questionsCount: 10,
    skills: ['Vocabulary', 'Grammar', 'Listening', 'Reading'],
    status: 'locked',
  },
  postMiniTest: {
    id: 'pm-02',
    chapterId: 'ch-02',
    title: 'Chapter 02 Post-mini Test',
    questionsCount: 20,
    skills: ['Listening', 'Reading'],
    difficulty: 'Equivalent to Challenge Test',
    status: 'locked',
  },
}

const makeLockedChapter = (order: number, title: string, description: string): Chapter => ({
  id: `ch-0${order}`,
  courseId: 'toeic-foundation',
  order,
  title,
  description,
  status: 'locked',
  lessons: [
    makeLesson(`l-0${order}-01`, `ch-0${order}`, 1, 'Lesson 01', 'locked', 0),
    makeLesson(`l-0${order}-02`, `ch-0${order}`, 2, 'Lesson 02', 'locked', 0),
    makeLesson(`l-0${order}-03`, `ch-0${order}`, 3, 'Lesson 03', 'locked', 0),
    makeLesson(`l-0${order}-04`, `ch-0${order}`, 4, 'Lesson 04', 'locked', 0),
  ],
  challengeTest: {
    id: `ct-0${order}`,
    chapterId: `ch-0${order}`,
    title: `Chapter 0${order} Challenge`,
    questionsCount: 10,
    passingScore: 70,
    status: 'locked',
  },
  exercise: {
    id: `ex-0${order}`,
    chapterId: `ch-0${order}`,
    title: `Chapter 0${order} Exercise`,
    questionsCount: 10,
    skills: ['Vocabulary', 'Grammar', 'Listening', 'Reading'],
    status: 'locked',
  },
  postMiniTest: {
    id: `pm-0${order}`,
    chapterId: `ch-0${order}`,
    title: `Chapter 0${order} Post-mini Test`,
    questionsCount: 20,
    skills: ['Listening', 'Reading'],
    difficulty: 'Equivalent to Challenge Test',
    status: 'locked',
  },
})

export const demoCourse: Course = {
  id: 'toeic-foundation',
  title: 'TOEIC Foundation',
  level: 'A2 → B1',
  description: 'Build the essential English skills needed for TOEIC preparation.',
  duration: '8 weeks',
  totalChapters: 6,
  totalLessons: 24,
  progress: {
    courseId: 'toeic-foundation',
    startedAt: '2026-08-01T00:00:00Z',
    completedLessons: 7,
    totalLessons: 24,
    completedChapters: 1,
    totalChapters: 6,
    baselineScore: null, // User chưa làm pre-test
    currentChapterIndex: 1,
    currentLessonId: 'l-02-03',
    currentProgress: 32,
  },
  chapters: [chapter1, chapter2, makeLockedChapter(3, 'Travel & Transportation', 'English for travel scenarios'), makeLockedChapter(4, 'Shopping & Services', 'Shopping and customer service English'), makeLockedChapter(5, 'Meetings & Business', 'Business meeting vocabulary'), makeLockedChapter(6, 'TOEIC Preparation', 'Final TOEIC test preparation')],
  preTest: {
    status: 'available',
  },
  finalTest: {
    status: 'locked',
  },
}

export function updateLessonProgress(_lessonId: string, _progress: number): Course {

  return { ...demoCourse }
}

export function checkLessonUnlock(prevLesson: Lesson): LessonStatus {
  if (prevLesson.progress >= 80) return 'available'
  return 'locked'
}
