export interface CourseCardData {
  id: string
  slug?: string
  title: string
  instructor: string
  instructorAvatar?: string
  thumbnail: string
  category: 'TOEIC_2_SKILLS' | 'TOEIC_4_SKILLS' | string
  level: string
  description: string
  duration: string
  totalLessons: number
  chapters: number
  students: number
  rating: number
  ratingCount: number
  progress: number
  price?: number
  discountPrice?: number
  targetScore?: number
  badge?: 'Bestseller' | 'Hot & New' | 'Highest Rated' | string
  isFavorite?: boolean
  isArchived?: boolean
  hasCertificate?: boolean
  lastAccessed?: string
}

export const allCourses: CourseCardData[] = []
