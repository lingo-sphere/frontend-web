/**
 * @file user.stats.tsx
 * @description Component giao diện React UserStatsGrid cho học viên
 */

import { Icon } from '@/components/icon.map'

export function StatCard({
  icon,
  label,
  value,
  subtext,
  color = 'primary',
}: {
  icon: string
  label: string
  value: string | number
  subtext?: string
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info'
}) {
  const colorClasses = {
    primary: 'bg-primary-10 text-primary',
    success: 'bg-success-10 text-success',
    warning: 'bg-warning-10 text-warning',
    error: 'bg-error-10 text-error',
    info: 'bg-info-10 text-info',
  }

  return (
    <div className="rounded-xl bg-surface-subtle p-4">
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${colorClasses[color]}`}
      >
        <Icon name={icon} size={20} />
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
      {subtext && (
        <div className="mt-1 text-xs text-text-tertiary">{subtext}</div>
      )}
    </div>
  )
}
