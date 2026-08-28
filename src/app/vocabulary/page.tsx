'use client'

import { Layout } from '@/components/layout/Layout'
import { VocabularyPage } from '@/components/vocabulary/VocabularyPage'
import { useApp } from '@/contexts/AppContext'

export default function VocabularyHubPage() {
  const { showAction } = useApp()

  return (
    <Layout>
      <VocabularyPage onAction={showAction} />
    </Layout>
  )
}
