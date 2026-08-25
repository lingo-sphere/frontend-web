
export interface CourseCardData {
  id: string
  title: string
  level: string
  description: string
  duration: string
  students: number
  lessons: number
  chapters: number
  progress: number
}

export const allCourses: CourseCardData[] = [
  {
    id: 'toeic-foundation',
    title: 'TOEIC Foundation',
    level: 'A2 → B1',
    description: 'Build the essential English skills needed for TOEIC preparation.',
    duration: '8 weeks',
    students: 2340,
    lessons: 24,
    chapters: 6,
    progress: 32,
  },
]
