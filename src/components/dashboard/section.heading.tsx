/**
 * @file SectionHeading.tsx
 * @description Component giao diện React SectionHeading cho học viên
 */

import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function SectionHeading({ eyebrow, title, description, actionLabel, onAction }: SectionHeadingProps) {
  const { i18n } = useTranslation()
  const isVietnamese = i18n.language === 'vi'

  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">{eyebrow}</p>
        <h2 className="mt-1 text-[19px] font-bold text-text-primary">{title}</h2>
        {description && <p className="mt-1 text-[13px] text-text-secondary">{description}</p>}
      </div>
      {actionLabel && (
        <Button
          className="h-auto shrink-0 p-0 text-[12px] font-semibold text-primary transition-colors hover:bg-transparent hover:text-primary-hover"
          onClick={onAction}
          variant="ghost"
        >
          {actionLabel} →
        </Button>
      )}
    </div>
  )
}
