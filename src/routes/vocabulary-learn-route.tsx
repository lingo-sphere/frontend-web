'use client'

import { useParams } from '@/lib/navigation'
import { Layout } from '@/components/layout/Layout'
import { VocabularyLearnPage } from '@/components/vocabulary-learning/VocabularyLearnPage'
import { useApp } from '@/contexts/AppContext'

export function VocabularyLearnRoute() {
  const { showAction } = useApp()
  const params = useParams()
  const rawDeckId = params?.deckId
  const deckId =
    typeof rawDeckId === 'string'
      ? rawDeckId
      : Array.isArray(rawDeckId)
        ? rawDeckId[0]
        : undefined

  return (
    <Layout>
      <VocabularyLearnPage onAction={showAction} selectedDeckId={deckId} />
    </Layout>
  )
}
