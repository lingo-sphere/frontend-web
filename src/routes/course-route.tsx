
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
