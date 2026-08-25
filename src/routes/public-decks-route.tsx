// Updated: 2026-08-17
// Route wrapper cho Public Decks page

import { Layout } from '@/components/layout/Layout'
import { PublicDecksPage } from '@/components/practice/PublicDecksPage'
import { useApp } from '@/contexts/AppContext'

export function PublicDecksRoute() {
  const { showAction } = useApp()

  return (
    <Layout>
      <PublicDecksPage onAction={showAction} />
    </Layout>
  )
}
