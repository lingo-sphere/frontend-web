// Updated: 2026-08-20
// Component hiển thị trang "Đang phát triển"
// Props:
// - title: tiêu đề trang

import { useTranslation } from 'react-i18next'

interface ComingSoonProps {
  title: string
}

export function ComingSoon({ title }: ComingSoonProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="rounded-2xl border border-dashed border-border bg-surface-subtle p-12 text-center">
        <div className="mb-4 text-6xl">🚧</div>
        <h1 className="text-h2 font-bold text-text-primary">{title}</h1>
        <p className="mt-2 text-body text-text-secondary">
          {isVietnamese ? 'Đang phát triển chức năng này' : 'This feature is under development'}
        </p>
      </div>
    </div>
  )
}
