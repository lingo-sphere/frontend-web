// Updated: 2026-08-17
// Route wrapper cho Vocabulary page

import { Layout } from '@/components/layout/Layout'
import { VocabularyPage } from '@/components/vocabulary/VocabularyPage'
import { useApp } from '@/contexts/AppContext'

export function VocabularyRoute() {
  const { showAction } = useApp()

  return (
    <Layout>
      <VocabularyPage onAction={showAction} />
    </Layout>
  )
}
