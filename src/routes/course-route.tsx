// Updated: 2026-08-17
// Route wrapper cho Course Detail page

import { useNavigate } from 'react-router-dom'
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
