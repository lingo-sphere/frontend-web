'use client'

import { Layout } from '@/components/layout/Layout'
import { NotebookPage } from '@/components/vocabulary/NotebookPage'
import { useApp } from '@/contexts/AppContext'

export default function VocabularyNotebookPage() {
  const { showAction } = useApp()

  return (
    <Layout>
      <NotebookPage onAction={showAction} />
    </Layout>
  )
}
