
import { Layout } from '@/components/layout/Layout'
import { PracticeHub } from '@/components/practice/PracticeHub'
import { useApp } from '@/contexts/AppContext'

export function PracticeRoute() {
  const { showAction } = useApp()

  return (
    <Layout>
      <PracticeHub onAction={showAction} />
    </Layout>
  )
}
