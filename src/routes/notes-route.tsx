// Updated: 2026-08-17
// Route wrapper cho Notes page

import { NotesPage } from '@/components/notes/NotesPage'
import { Layout } from '@/components/layout/Layout'

export function NotesRoute() {
  return (
    <Layout>
      <NotesPage />
    </Layout>
  )
}
