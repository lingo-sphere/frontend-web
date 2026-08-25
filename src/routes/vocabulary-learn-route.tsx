// Updated: 2026-08-17
// Route wrapper cho Vocabulary Learn page - hỗ trợ deckId param

import { useParams } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { VocabularyLearnPage } from '@/pages/VocabularyLearnPage'
import { useApp } from '@/contexts/AppContext'

export function VocabularyLearnRoute() {
  const { showAction } = useApp()
  const { deckId } = useParams<{ deckId?: string }>()

  return (
    <Layout>
      <VocabularyLearnPage onAction={showAction} selectedDeckId={deckId} />
    </Layout>
  )
}
