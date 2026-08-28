'use client'

import { use } from 'react'
import { Layout } from '@/components/layout/Layout'
import { VocabularyLearnPage } from '@/components/vocabulary-learning/VocabularyLearnPage'
import { useApp } from '@/contexts/AppContext'

interface VocabularyLearnDeckPageProps {
  params: Promise<{ deckId: string }>
}

export default function VocabularyLearnDeckPage({
  params,
}: VocabularyLearnDeckPageProps) {
  const resolvedParams = use(params)
  const { showAction } = useApp()

  return (
    <Layout>
      <VocabularyLearnPage
        onAction={showAction}
        selectedDeckId={resolvedParams.deckId}
      />
    </Layout>
  )
}
