'use client'

import { Layout } from '@/components/layout/Layout'
import { CoursesPage } from '@/components/courses/CoursesPage'
import { useApp } from '@/contexts/AppContext'

export default function CoursesCatalogPage() {
  const { showAction } = useApp()

  return (
    <Layout>
      <CoursesPage onAction={showAction} />
    </Layout>
  )
}
