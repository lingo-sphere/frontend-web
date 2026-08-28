'use client'

import { use } from 'react'
import { useNavigate } from '@/lib/navigation'
import { Layout } from '@/components/layout/Layout'
import { CourseDetailPage } from '@/components/course/CourseDetailPage'

interface CoursePageProps {
  params: Promise<{ courseId: string }>
}

export default function CourseDetailPageWrapper({ params }: CoursePageProps) {
  const resolvedParams = use(params)
  const navigate = useNavigate()

  return (
    <Layout>
      <CourseDetailPage
        courseId={resolvedParams.courseId || 'toeic-foundation'}
        onBack={() => navigate('/courses')}
      />
    </Layout>
  )
}
