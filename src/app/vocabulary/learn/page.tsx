'use client'

import { Layout } from '@/components/layout/Layout'
import { VocabularyLearnPage } from '@/components/vocabulary-learning/VocabularyLearnPage'
import { useApp } from '@/contexts/AppContext'

export default function VocabularyLearnSessionPage() {
  const { showAction } = useApp()

  return (
    <Layout>
      <VocabularyLearnPage onAction={showAction} />
    </Layout>
  )
}
