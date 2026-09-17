// Thành phần thanh tiêu đề điều hướng không gian luyện nghe chép chính tả hỗ trợ đa ngôn ngữ
'use client'

import { useTranslation } from 'react-i18next'
import { Icon } from '@/components/icon.map'

interface DictationWorkspaceHeaderProps {
  exerciseTitle: string
  isVietnamese?: boolean
  onBack: () => void
}

export function DictationWorkspaceHeader({
  exerciseTitle,
  onBack,
}: DictationWorkspaceHeaderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer"
      >
        <Icon name="arrow-left" size={20} />
        <span className="font-medium">{t('common.back')}</span>
      </button>
      <div className="text-sm text-text-tertiary">{exerciseTitle}</div>
    </div>
  )
}
