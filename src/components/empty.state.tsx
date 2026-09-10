// Component hiển thị trạng thái dữ liệu trống hoặc không tìm thấy kết quả
import type { ReactNode } from 'react'
import { Inbox, type LucideIcon } from 'lucide-react'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-surface-subtle/50 border border-border-subtle ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-surface-muted flex items-center justify-center text-text-tertiary mb-3.5 shadow-2xs">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm sm:text-base font-bold text-text-primary mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-text-secondary max-w-sm mb-4 leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
