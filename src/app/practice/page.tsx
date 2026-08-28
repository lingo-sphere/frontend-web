'use client'

import { Layout } from '@/components/layout/Layout'
import { PracticeHub } from '@/components/practice/PracticeHub'
import { useApp } from '@/contexts/AppContext'

export default function PracticeHubPage() {
  const { showAction } = useApp()

  return (
    <Layout>
      <PracticeHub onAction={showAction} />
    </Layout>
  )
}
