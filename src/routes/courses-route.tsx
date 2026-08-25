
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
