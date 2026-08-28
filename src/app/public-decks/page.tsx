'use client'

import { Layout } from '@/components/layout/Layout'
import { PublicDecksPage } from '@/components/practice/PublicDecksPage'
import { useApp } from '@/contexts/AppContext'

export default function PublicDecksAppPage() {
  const { showAction } = useApp()

  return (
    <Layout>
      <PublicDecksPage onAction={showAction} />
    </Layout>
  )
}
