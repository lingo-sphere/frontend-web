'use client'

import { useNavigate } from '@/lib/navigation'
import { Layout } from '@/components/layout/Layout'
import { CourseDetailPage } from '@/components/course/CourseDetailPage'

export function CourseClientWrapper({ courseId }: { courseId: string }) {
  const navigate = useNavigate()

  return (
    <Layout>
      <CourseDetailPage
        courseId={courseId || 'toeic-foundation'}
        onBack={() => navigate('/courses')}
      />
    </Layout>
  )
}
