// Updated: 2026-08-17
// Route wrapper cho Settings page

import { SettingsPage } from '@/components/settings/SettingsPage'
import { Layout } from '@/components/layout/Layout'

export function SettingsRoute() {
  return (
    <Layout>
      <SettingsPage />
    </Layout>
  )
}
