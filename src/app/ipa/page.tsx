'use client'

import { Layout } from '@/components/layout/Layout'
import { IPAPage } from '@/components/ipa/IPAPage'
import { useApp } from '@/contexts/AppContext'

export default function IpaAppPage() {
  const { showAction } = useApp()

  return (
    <Layout>
      <IPAPage onAction={showAction} />
    </Layout>
  )
}
