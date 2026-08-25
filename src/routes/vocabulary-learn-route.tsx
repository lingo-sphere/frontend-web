
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
