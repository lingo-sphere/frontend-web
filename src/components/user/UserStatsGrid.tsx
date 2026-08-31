import { Icon } from '@/components/icons/icon-map'

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

export function XPProgress({ currentXP }: { currentXP: number }) {
  const current = currentXP % 100
  const required = 100
  const progress = Math.min(Math.round((current / required) * 100), 100)

  return (
    <div className="rounded-xl bg-surface-subtle p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-text-secondary">
          Cấp độ tiếp theo
        </span>
        <span className="text-sm text-text-tertiary">
          {current}/{required} XP
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
