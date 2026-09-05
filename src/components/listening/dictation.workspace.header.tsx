/**
 * @file dictation.workspace.header.tsx
 * @description Thành phần thanh tiêu đề điều hướng của không gian luyện nghe chép chính tả (Dictation Workspace)
 */

'use client'

import { Icon } from '@/components/icons/icon.map'

interface DictationWorkspaceHeaderProps {
  exerciseTitle: string
  isVietnamese: boolean
  onBack: () => void
}

export function DictationWorkspaceHeader({
  exerciseTitle,
  isVietnamese,
  onBack,
}: DictationWorkspaceHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-text-secondary hover:text-text-primary cursor-pointer"
      >
        <Icon name="arrow-left" size={20} />
        <span className="font-medium">{isVietnamese ? 'Quay lại' : 'Back'}</span>
      </button>
      <div className="text-sm text-text-tertiary">{exerciseTitle}</div>
    </div>
  )
}
