// Updated: 2026-08-17
// Route wrapper cho Vocabulary Notebook page

import { Layout } from '@/components/layout/Layout'
import { NotebookPage } from '@/components/vocabulary/NotebookPage'
import { useApp } from '@/contexts/AppContext'

export function VocabularyNotebookRoute() {
  const { showAction } = useApp()

  return (
    <Layout>
      <NotebookPage onAction={showAction} />
    </Layout>
  )
}
