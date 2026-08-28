'use client'

import { useNavigate } from '@/lib/navigation'
import { CourseDetailPage } from '@/components/course/CourseDetailPage'

export function CourseClientWrapper({ courseId }: { courseId: string }) {
  const navigate = useNavigate()

  return (
    <CourseDetailPage
      courseId={courseId || 'toeic-foundation'}
      onBack={() => navigate('/courses')}
    />
  )
}
