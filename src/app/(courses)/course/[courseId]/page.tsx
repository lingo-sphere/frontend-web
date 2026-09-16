// Trang điều phối không gian học tập và chi tiết khóa học cho học viên LingoSphere
import { cookies } from 'next/headers'
import { extractCourseId } from '@/features/courses/lib/course.url'
import { STORAGE_KEYS } from '@/lib/storage'
import { CourseDetailClient } from '@/features/courses/components/course.detail.client'

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const resolvedParams = await params
  const rawParam = resolvedParams?.courseId || ''
  const courseId = extractCourseId(rawParam)

  const cookieStore = await cookies()
  const isEnrolledCookie =
    cookieStore.get(STORAGE_KEYS.COURSE_ENROLLED(courseId))?.value === 'true' ||
    (rawParam ? cookieStore.get(STORAGE_KEYS.COURSE_ENROLLED(rawParam))?.value === 'true' : false) ||
    cookieStore.get(STORAGE_KEYS.IS_PRIVILEGED)?.value === 'true'

  return (
    <CourseDetailClient
      rawParam={rawParam}
      courseId={courseId}
      initialIsEnrolled={isEnrolledCookie}
    />
  )
}
