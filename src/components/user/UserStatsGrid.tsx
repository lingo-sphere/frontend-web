import { Icon } from '@/components/icons/icon-map'
import { getXPForNextLevel } from '@/data/user-data'

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
    <div className="bg-surface-subtle rounded-xl p-4">
      <div
        className={`w-10 h-10 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-3`}
      >
        <Icon name={icon} size={20} />
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
      {subtext && (
        <div className="text-xs text-text-tertiary mt-1">{subtext}</div>
      )}
    </div>
  )
}

export function XPProgress({ currentXP }: { currentXP: number }) {
  const { current, required, progress } = getXPForNextLevel(currentXP)

  return (
    <div className="bg-surface-subtle rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-text-secondary">
          Cấp độ tiếp theo
        </span>
        <span className="text-sm text-text-tertiary">
          {current}/{required} XP
        </span>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
