// Trang thông báo 404 Không tìm thấy trang sử dụng Ant Design Result cho học viên LingoSphere
'use client'

import { useTranslation } from 'react-i18next'
import { AppResult } from '@/components/status/app.result'

export default function NotFound() {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <AppResult
        status="404"
        title={t('errors.notFoundTitle')}
        subTitle={t('errors.notFoundDesc')}
        backUrl="/home"
        backText={t('common.backHome')}
      />
    </main>
  )
}
