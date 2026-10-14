// Trang thông báo 404 Không tìm thấy trang sử dụng Ant Design Result cho học viên LingoSphere
'use client'

import { useTranslation } from 'react-i18next'
import { AppResult } from '@/components/status/app.result'
import { useMounted } from '@/hooks/use.mounted'

export default function NotFound() {
  const { t } = useTranslation()
  const mounted = useMounted()

  return (
    <main className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center px-4 py-16">
      <AppResult
        status="404"
        title={mounted ? t('errors.notFoundTitle') : '404 - Không Tìm Thấy Trang'}
        subTitle={
          mounted
            ? t('errors.notFoundDesc')
            : 'Xin lỗi, nội dung bạn tìm kiếm không tồn tại hoặc đã được chuyển đi.'
        }
        backUrl="/home"
        backText={mounted ? t('common.backHome') : 'Về Trang Chủ'}
      />
    </main>
  )
}
