// Trang thông báo 403 Không có quyền truy cập sử dụng Ant Design Result cho học viên LingoSphere
'use client'

import { useTranslation } from 'react-i18next'
import { AppResult } from '@/components/status/app.result'

export default function Forbidden() {
  const { t } = useTranslation()

  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <AppResult
        status="403"
        title={t('errors.forbiddenTitle')}
        subTitle={t('errors.forbiddenDesc')}
        backUrl="/home"
        backText={t('common.backHome')}
      />
    </main>
  )
}
