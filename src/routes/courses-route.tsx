// Updated: 2026-08-17
// Route wrapper cho Courses page

import { Layout } from '@/components/layout/Layout'
import { CoursesPage } from '@/components/courses/CoursesPage'
import { useApp } from '@/contexts/AppContext'

export function CoursesRoute() {
  const { showAction } = useApp()

  return (
    <Layout>
      <CoursesPage onAction={showAction} />
    </Layout>
  )
}
