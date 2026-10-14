// Trang thông báo 403 Không có quyền truy cập sử dụng Ant Design Result cho học viên LingoSphere
'use client'

import { useTranslation } from 'react-i18next'
import { AppResult } from '@/components/status/app.result'
import { useMounted } from '@/hooks/use.mounted'

export default function Forbidden() {
  const { t } = useTranslation()
  const mounted = useMounted()

  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <AppResult
        status="403"
        title={mounted ? t('errors.forbiddenTitle') : '403 - Không Có Quyền Truy Cập'}
        subTitle={
          mounted
            ? t('errors.forbiddenDesc')
            : 'Bạn không có quyền truy cập vào trang này.'
        }
        backUrl="/home"
        backText={mounted ? t('common.backHome') : 'Về Trang Chủ'}
      />
    </main>
  )
}
