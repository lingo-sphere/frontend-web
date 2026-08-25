// Updated: 2026-08-17
// Route wrapper cho Listening page

import { Layout } from '@/components/layout/Layout'
import { ListeningPage } from '@/components/listening/ListeningPage'

export function ListeningRoute() {
  return (
    <Layout>
      <ListeningPage />
    </Layout>
  )
}
