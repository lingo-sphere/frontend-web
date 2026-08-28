
'use client'

import { useNavigate } from '@/lib/navigation'
import { Layout } from '@/components/layout/Layout'
import { CourseDetailPage } from '@/components/course/CourseDetailPage'

export function CourseRoute() {
  const navigate = useNavigate()

  return (
    <Layout>
      <CourseDetailPage courseId="toeic-foundation" onBack={() => navigate('/courses')} />
    </Layout>
  )
}
