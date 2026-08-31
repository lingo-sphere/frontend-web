'use client'

import { useNavigate } from '@/lib/navigation'
import { CourseDetailWorkspace } from '@/components/course/CourseDetailWorkspace'

export function CourseClientWrapper({ courseId }: { courseId: string }) {
  const navigate = useNavigate()

  return (
    <CourseDetailWorkspace
      courseId={courseId || 'toeic-foundation'}
      onBack={() => navigate('/courses')}
    />
  )
}
