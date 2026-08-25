
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
